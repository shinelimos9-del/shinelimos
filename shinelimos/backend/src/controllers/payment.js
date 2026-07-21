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
    console.log("CRITICAL: STRIPE_WEBHOOK_SECRET is not defined in environment variables.");
    
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
