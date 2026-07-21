const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment");
const admin_auth = require("../../middleware/user_auth");

// Admin triggers sending payment link to booker
router.post("/admin/send-payment-link", admin_auth, paymentController.send_paymentLink);

// Stripe webhook (raw body handled in index.js)
router.post("/stripe/webhook", paymentController.stripe_webhook);

module.exports = router;
