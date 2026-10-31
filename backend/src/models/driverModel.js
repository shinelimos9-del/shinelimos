const mongoose = require("mongoose");

// Admin-managed driver (chauffeur) record. Phase 1: admin creates and
// assigns drivers. Phase 2: a driver can log in to the driver portal
// (see services/driverPortal.js) with their email + a password the admin
// sets on this record. The password is stored ONLY as a bcrypt hash in
// password_hash — never in plain text — and is never returned by the API.
// A driver account is NOT an admin account and cannot reach admin routes.
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
  // Phase 2: bcrypt hash of the driver-portal password set by the admin.
  // Empty = this driver cannot log in yet.
  password_hash: {
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
