const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "booking",
    required: true,
  },
  stripe_session_id: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "usd",
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  utr_number: {
    type: String,
    required: false,
  },
  payment_method: {
    type: String,
    required: false,
  },
  payment_details: {
    type: Object,
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
