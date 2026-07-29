const paymentService = require("../services/payment");

exports.send_paymentLink = async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) return res.status(400).json({ success: false, message: "booking_id is required" });

    const result = await paymentService.sendStripePaymentLink(booking_id);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("send_paymentLink controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.stripe_webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CRITICAL: STRIPE_WEBHOOK_SECRET is not defined in environment variables.");
    return res.status(500).send("Webhook configuration error");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await paymentService.handleStripeWebhook(event);
  res.json({ received: true });
};

exports.verify_payment = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "session_id is required" });
    }

    const result = await paymentService.verifyStripePayment(session_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("verify_payment controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.notify_vehicleArrival = async (req, res) => {
  try {
    const { booking_id, waiting_minutes } = req.body;
    if (!booking_id) {
      return res.status(400).json({ success: false, message: "booking_id is required" });
    }

    const result = await paymentService.notifyVehicleArrival(booking_id, waiting_minutes);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("notify_vehicleArrival controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.send_finalInvoice = async (req, res) => {
  try {
    const { booking_id, extra_options } = req.body;
    if (!booking_id) {
      return res.status(400).json({ success: false, message: "booking_id is required" });
    }

    const result = await paymentService.sendFinalInvoicePaymentLink(booking_id, extra_options || {});
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("send_finalInvoice controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.start_ride = async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ success: false, message: "booking_id is required" });
    }

    const result = await paymentService.startRide(booking_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("start_ride controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



