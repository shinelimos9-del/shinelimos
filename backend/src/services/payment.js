const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const Admin = require("../models/adminModel");
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

    const frontendUrl = (process.env.FRONTEND_URL || "https://shinelimosllc.com").replace(/\/$/, "");

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
      success_url: `${frontendUrl}/#/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/#/payment-cancelled`,
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

    // Update Booking with payment reference & status
    booking.payment_id = payment._id;
    booking.payment_status = "requested";
    await booking.save();

    // Update admin notifications for this booking to 'requested'
    await Admin.updateMany(
      {
        $or: [
          { "notifications.booking_id": booking._id },
          { "notifications.booking_id": booking._id.toString() }
        ]
      },
      {
        $set: {
          "notifications.$[elem].payment_status": "requested",
          "notifications.$[elem].message": "Payment link sent to customer"
        }
      },
      {
        arrayFilters: [
          {
            $or: [
              { "elem.booking_id": booking._id },
              { "elem.booking_id": booking._id.toString() }
            ]
          }
        ]
      }
    );

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

const fulfillPayment = async (sessionOrId, bookingIdParam) => {
  try {
    let session;
    if (typeof sessionOrId === "string") {
      session = await stripe.checkout.sessions.retrieve(sessionOrId);
    } else {
      session = sessionOrId;
    }

    if (!session || (session.payment_status !== "paid" && session.status !== "complete")) {
      console.warn(`[PAYMENT] Session ${session?.id} is not paid yet (status: ${session?.payment_status})`);
      return { success: false, message: "Payment not completed yet" };
    }

    let payment = await Payment.findOne({ stripe_session_id: session.id });
    const bookingId = session.metadata?.booking_id || (payment ? payment.booking_id : bookingIdParam);

    if (!bookingId) {
      console.error(`[PAYMENT] Could not identify bookingId for session ${session.id}`);
      return { success: false, message: "Booking ID missing" };
    }

    const emailAlreadySent = payment ? payment.email_sent : false;

    if (!payment) {
      payment = new Payment({
        booking_id: bookingId,
        stripe_session_id: session.id,
        amount: session.amount_total ? (session.amount_total / 100) : 0,
        status: "completed",
        email_sent: true,
      });
      await payment.save();
    } else {
      payment.status = "completed";
      payment.utr_number = session.payment_intent || payment.utr_number;
      payment.payment_method = session.payment_method_types?.[0] || payment.payment_method;
      payment.payment_details = session;
      if (!emailAlreadySent) {
        payment.email_sent = true;
      }
      await payment.save();
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error(`[PAYMENT] Booking #${bookingId} not found in database`);
      return { success: false, message: "Booking not found" };
    }

    booking.payment_status = "completed";
    await booking.save();

    // Prepare Notification Data
    const notificationData = {
      booking_id: booking._id,
      booker_name: `${booking.contact_details.booker.first_name} ${booking.contact_details.booker.last_name}`,
      email: booking.contact_details.booker.email,
      phone: booking.contact_details.booker.primary_phone?.number || "N/A",
      pickup: booking.trip_details[0].pickup_location,
      dropoff: booking.trip_details[0].dropoff_location,
      estimated_price: payment ? payment.amount : booking.vehicle_details.estimated_price,
      vehicle_name: booking.vehicle_details.vehicle_name,
      date: moment(booking.trip_details[0].date).format("MMM DD, YYYY"),
      time: booking.trip_details[0].start_time,
      message: "Payment confirmed!",
      type: "Payment Received",
      utr_number: session.payment_intent,
      payment_status: "completed"
    };

    // Emit Socket events
    try {
      const socketUtil = require("../../socket");
      const io = socketUtil.getIO();
      if (io) {
        io.emit("payment_confirmed", notificationData);
        io.emit("new_booking", notificationData);
      }
    } catch (socketErr) {
      console.warn("[PAYMENT] Socket notification emit warning:", socketErr.message);
    }

    // Update all notifications matching this booking to 'completed'
    await Admin.updateMany(
      {
        $or: [
          { "notifications.booking_id": booking._id },
          { "notifications.booking_id": booking._id.toString() }
        ]
      },
      {
        $set: {
          "notifications.$[elem].payment_status": "completed",
          "notifications.$[elem].message": "Payment confirmed!"
        }
      },
      {
        arrayFilters: [
          {
            $or: [
              { "elem.booking_id": booking._id },
              { "elem.booking_id": booking._id.toString() }
            ]
          }
        ]
      }
    );

    // Push new "Payment Received" notification if email not sent
    if (!emailAlreadySent) {
      await Admin.updateMany(
        {},
        { $push: { notifications: { $each: [notificationData], $position: 0 } } }
      );
    }

    // Send Emails to BOTH Booker AND Admin if not already sent
    if (!emailAlreadySent) {
      const amountPaid = payment ? payment.amount : booking.vehicle_details.estimated_price;
      const bookerEmail = booking.contact_details?.booker?.email || booking.contact_details?.passenger?.email || session.customer_details?.email || session.customer_email;
      const bookerName = booking.contact_details?.booker?.first_name ? `${booking.contact_details.booker.first_name} ${booking.contact_details.booker.last_name || ''}` : 'Valued Customer';

      try {
        // 1. Send confirmation email to Booker
        console.log(`[PAYMENT] Sending confirmation email to booker: ${bookerEmail}`);
        await sendEmail({
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
                <p style="margin: 10px 0; font-size: 14px;"><strong>Date:</strong> ${moment(booking.trip_details[0].date).format("MMM DD, YYYY")}</p>
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

        // 2. Send notification email to Admin (all admin emails)
        const recipientSet = new Set();
        if (process.env.ADMIN_EMAIL) recipientSet.add(process.env.ADMIN_EMAIL);
        if (process.env.EMAIL_USER) recipientSet.add(process.env.EMAIL_USER);
        
        const allAdmins = await Admin.find({});
        allAdmins.forEach(a => { if (a.email) recipientSet.add(a.email); });

        const adminRecipients = Array.from(recipientSet).join(",");
        console.log(`[PAYMENT] Sending alert email to admins: ${adminRecipients}`);
        
        await sendEmail({
          to: adminRecipients,
          subject: `NEW CONFIRMED BOOKING - Payment Received - #${booking._id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 2px solid #3b82f6; border-radius: 12px;">
              <h2 style="color: #3b82f6; text-align: center; margin-bottom: 25px;">New Paid Reservation</h2>
              
              <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 5px solid #3b82f6;">
                <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">PAID & CONFIRMED</span></p>
                <p style="margin: 8px 0;"><strong>Booking ID:</strong> #${booking._id}</p>
                <p style="margin: 8px 0;"><strong>Amount Paid:</strong> $${amountPaid}</p>
                <p style="margin: 8px 0;"><strong>Customer:</strong> ${bookerName}</p>
                <p style="margin: 8px 0;"><strong>Customer Email:</strong> ${bookerEmail}</p>
                <p style="margin: 8px 0;"><strong>Vehicle:</strong> ${booking.vehicle_details.vehicle_name}</p>
                <p style="margin: 8px 0;"><strong>Pickup:</strong> ${booking.trip_details[0].pickup_location}</p>
                <p style="margin: 8px 0;"><strong>Drop-off:</strong> ${booking.trip_details[0].dropoff_location}</p>
                <p style="margin: 8px 0;"><strong>Date/Time:</strong> ${moment(booking.trip_details[0].date).format("MMM DD, YYYY")} at ${booking.trip_details[0].start_time}</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.ADMIN_DASHBOARD_URL || ((process.env.FRONTEND_URL || 'https://shinelimosllc.com') + '/#/admin-dashboard/notifications')}" 
                   style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Open Admin Dashboard
                </a>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("[PAYMENT] Error sending payment emails:", emailErr);
      }
    }

    return { success: true, booking, payment };
  } catch (err) {
    console.error("[PAYMENT] fulfillPayment error:", err);
    return { success: false, message: err.message };
  }
};

exports.fulfillPayment = fulfillPayment;

exports.handleStripeWebhook = async (event) => {
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await fulfillPayment(session);
    }
    return { success: true };
  } catch (error) {
    console.error("handleStripeWebhook error:", error);
    return { success: false, message: error.message };
  }
};

exports.verifyStripePayment = async (sessionId) => {
  try {
    return await fulfillPayment(sessionId);
  } catch (error) {
    console.error("verifyStripePayment error:", error);
    return { success: false, message: error.message };
  }
};
