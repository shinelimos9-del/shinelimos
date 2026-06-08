const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({

  admin_name: {
    type: String,
    default: "",
  },

  email: {
    type: String,
    required: true,
  },
   
  password: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
  },
  otpExpiry: { type: Date },

  auth_key: {
    type: String,
    default: null,
  },

  notificationToken: {
    type: String,
    default: null,
  },

  notifications: [{
    booking_id: mongoose.Schema.Types.ObjectId,
    booker_name: String,
    email: String,
    phone: String,
    pickup: String,
    dropoff: String,
    estimated_price: Number,
    vehicle_name: String,
    date: String,
    time: String,
    message: String,
    type: { type: String, default: "Notification" },
    payment_status: { type: String, default: "Pending" },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
  }],

  created_at: {
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const admin = mongoose.model("admin", adminSchema);
module.exports = admin;
