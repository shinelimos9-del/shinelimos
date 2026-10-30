const mongoose = require("mongoose");

// Admin-managed driver (chauffeur) record. Phase 1 only: drivers do NOT
// log in — there is no driver user type or driver portal yet. The admin
// creates/maintains drivers here and assigns them to bookings.
const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
  },
  license_number: {
    type: String,
    required: true,
    trim: true,
  },
  license_expiry: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  notes: {
    type: String,
    default: "",
  },
  // Optional photo URL (admin pastes a URL; no file upload in Phase 1).
  photo: {
    type: String,
    default: "",
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

const driver = mongoose.model("driver", driverSchema);
module.exports = driver;
