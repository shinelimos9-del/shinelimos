const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const { sendEmail } = require("../utils/emailService");
const moment = require("moment");

exports.sendStripePaymentLink = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return { success: false, message: "Booking not found" };
    }

    const amount = booking.vehicle_details.estimated_price;
    const bookerEmail = booking.contact_details.booker.email;
    const bookerName = `${booking.contact_details.booker.first_name} ${booking.contact_details.booker.last_name}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Limo Booking #${booking._id}`,
              description: `Booking for ${booking.trip_details[0].pickup_location} to ${booking.trip_details[0].dropoff_location}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      customer_email: bookerEmail,
      metadata: {
        booking_id: booking._id.toString(),
      },
    });

    // Create Payment record
    const payment = new Payment({
      booking_id: booking._id,
      stripe_session_id: session.id,
      amount: amount,
      status: "pending",
    });
    await payment.save();

    // Update Booking with payment reference
    booking.payment_id = payment._id;
    await booking.save();

    // Send email to booker with the payment link
    await sendEmail({
      to: bookerEmail,
      subject: "Payment Required - Shine Limos Reservation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #d4af37; text-align: center;">Complete Your Reservation</h2>
          <p>Hello ${bookerName},</p>
          <p>Thank you for choosing Shine Limos. To confirm your reservation, please complete the payment using the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${session.url}" style="background-color: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Pay $${amount} Now</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #888; font-size: 12px;">${session.url}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 14px;"><strong>Reservation Details:</strong></p>
          <p><strong>Booking ID:</strong> #${booking._id}</p>
          <p><strong>Pickup:</strong> ${booking.trip_details[0].pickup_location}</p>
          <p><strong>Date/Time:</strong> ${booking.trip_details[0].date} at ${booking.trip_details[0].start_time}</p>
          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">Shine Limos LLC - Premium Chauffeur Service</p>
        </div>
      `,
    });

    return { success: true, message: "Payment link sent to booker" };
  } catch (error) {
    console.error("sendStripePaymentLink error:", error);
    return { success: false, message: error.message };
  }
};

exports.handleStripeWebhook = async (event) => {
  try {
      if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.booking_id;

    try {
      const payment = await Payment.findOne({ stripe_session_id: session.id });
      if (payment) {
        payment.status = "completed";
        payment.utr_number = session.payment_intent; // Or use Stripe charge ID
        payment.payment_method = session.payment_method_types[0];
        payment.payment_details = session;
        await payment.save();
      }

      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.payment_status = "completed";
        await booking.save();

        // Notify admin of successful payment
        const Admin = require("../models/adminModel");
        const socketUtil = require("../../socket");
        
        const notificationData = {
          booking_id: booking._id,
          booker_name: `${booking.contact_details.booker.first_name} ${booking.contact_details.booker.last_name}`,
          amount: payment.amount,
          message: "Payment confirmed!",
          type: "Payment Received",
          utr_number: session.payment_intent,
          payment_status: "completed"
        };

        const io = socketUtil.getIO();
        io.emit("payment_confirmed", notificationData);

        // Update all notifications for this specific booking across all admins to show 'completed'
        await Admin.updateMany(
          { "notifications.booking_id": booking._id },
          { $set: { "notifications.$[elem].payment_status": "completed", "notifications.$[elem].message": "Payment confirmed!" } },
          { arrayFilters: [{ "elem.booking_id": booking._id }] }
        );

        // Also push the new "Payment Received" notification to the top
        await Admin.updateMany(
          {}, 
          { $push: { notifications: { $each: [notificationData], $position: 0 } } }
        );

        console.log(`[PAYMENT] Booking #${booking._id} marked as PAID. Initializing email dispatch...`);

        // --- NEW: Send Confirmation Emails ---
        const amountPaid = payment ? payment.amount : booking.vehicle_details.estimated_price;
        const bookerEmail = booking.contact_details.booker.email;
        const bookerName = `${booking.contact_details.booker.first_name} ${booking.contact_details.booker.last_name}`;

        try {
          // 1. Send confirmation to Booker
          console.log(`[PAYMENT] Sending confirmation to booker: ${bookerEmail}`);
          const bookerMailResult = await sendEmail({
            to: bookerEmail,
            subject: "Reservation Confirmed & Payment Received - Shine Limos",
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #000; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Shine Limos</h1>
                  <div style="height: 2px; width: 50px; background-color: #d4af37; margin: 10px auto;"></div>
                </div>

                <h2 style="color: #10b981; text-align: center; font-size: 20px;">Booking & Payment Confirmed</h2>
                
                <p>Dear ${bookerName},</p>
                <p>Thank you for your payment. Your reservation with <strong>Shine Limos</strong> is now fully confirmed. We have successfully received your payment of <strong>$${amountPaid}</strong>.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #eee;">
                  <h3 style="margin-top: 0; font-size: 16px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Reservation Summary</h3>
                  <p style="margin: 10px 0; font-size: 14px;"><strong>Booking ID:</strong> #${booking._id}</p>
                  <p style="margin: 10px 0; font-size: 14px;"><strong>Vehicle:</strong> ${booking.vehicle_details.vehicle_name}</p>
                  <p style="margin: 10px 0; font-size: 14px;"><strong>Pickup:</strong> ${booking.trip_details[0].pickup_location}</p>
                  <p style="margin: 10px 0; font-size: 14px;"><strong>Drop-off:</strong> ${booking.trip_details[0].dropoff_location}</p>
                  <p style="margin: 10px 0; font-size: 14px;"><strong>Date:</strong> ${booking.trip_details[0].date}</p>
                  <p style="margin: 10px 0; font-size: 14px;"><strong>Time:</strong> ${booking.trip_details[0].start_time}</p>
                  <p style="margin: 10px 0; font-size: 14px;"><strong>Amount Paid:</strong> $${amountPaid}</p>
                </div>

                <p style="line-height: 1.6; color: #555;">Our professional chauffeur will arrive at the scheduled time. If you have any questions or need to make adjustments, please contact our 24/7 concierge service.</p>
                
                <p style="margin-top: 30px;">Best regards,<br><strong>Shine Limos Team</strong></p>
                
                <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center; color: #888; font-size: 12px;">
                  <p>© ${new Date().getFullYear()} Shine Limos LLC. All rights reserved.</p>
                  <p>Premium Chauffeur & Luxury Transportation</p>
                </div>
              </div>
            `,
          });
          console.log(`[PAYMENT] Booker email dispatch result:`, bookerMailResult.success ? "SUCCESS" : "FAILED");

          // 2. Send notification to Admin
          const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
          console.log(`[PAYMENT] Sending alert to admin: ${adminEmail}`);
          const adminMailResult = await sendEmail({
            to: adminEmail,
            subject: "NEW CONFIRMED BOOKING - Payment Received - #" + booking._id,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 2px solid #3b82f6; border-radius: 12px;">
                <h2 style="color: #3b82f6; text-align: center; margin-bottom: 25px;">New Paid Reservation</h2>
                
                <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 5px solid #3b82f6;">
                  <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">PAID & CONFIRMED</span></p>
                  <p style="margin: 8px 0;"><strong>Booking ID:</strong> #${booking._id}</p>
                  <p style="margin: 8px 0;"><strong>Amount:</strong> $${amountPaid}</p>
                  <p style="margin: 8px 0;"><strong>Customer:</strong> ${bookerName}</p>
                  <p style="margin: 8px 0;"><strong>Email:</strong> ${bookerEmail}</p>
                  <p style="margin: 8px 0;"><strong>Vehicle:</strong> ${booking.vehicle_details.vehicle_name}</p>
                  <p style="margin: 8px 0;"><strong>Pickup:</strong> ${booking.trip_details[0].pickup_location}</p>
                  <p style="margin: 8px 0;"><strong>Date/Time:</strong> ${booking.trip_details[0].date} at ${booking.trip_details[0].start_time}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.ADMIN_DASHBOARD_URL || (process.env.FRONTEND_URL + '/admin-dashboard')}" 
                     style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Open Admin Dashboard
                  </a>
                </div>
              </div>
            `,
          });
          console.log(`[PAYMENT] Admin alert dispatch result:`, adminMailResult.success ? "SUCCESS" : "FAILED");
        } catch (emailErr) {
          console.error("[PAYMENT] CRITICAL error in email dispatch phase:", emailErr);
        }
      } else {
        console.error(`[PAYMENT] Webhook received for booking ${bookingId} but booking was NOT FOUND in database.`);
      }
    } catch (error) {
      console.error("[PAYMENT] Webhook processing failed with error:", error);
    }
  }
  } catch (error) {
    return { success: false, message: error.message };
  }

};
