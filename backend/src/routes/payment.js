const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment");
const admin_auth = require("../../middleware/user_auth");

// Admin triggers sending payment link to booker
router.post("/admin/send-payment-link", admin_auth, paymentController.send_paymentLink);

// Admin triggers vehicle arrival notification with waiting policy & payment link
router.post("/admin/notify-vehicle-arrival", admin_auth, paymentController.notify_vehicleArrival);

// Admin sends final trip invoice & payment link after drop-off
router.post("/admin/send-final-invoice", admin_auth, paymentController.send_finalInvoice);

// Stripe webhook (raw body handled in index.js)
router.post("/stripe/webhook", paymentController.stripe_webhook);

// Frontend Payment Verification on Payment Success Page
router.get("/bookings/verify-payment", paymentController.verify_payment);

module.exports = router;
