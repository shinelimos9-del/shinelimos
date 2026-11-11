const mongoose = require("mongoose");

// Driver login code (driver app v1, phone + texted code).
//
// SECURITY:
// - Only the bcrypt hash of the 6-digit code is stored — never the code
//   itself, never in plain text, never in a log.
// - A code is single-use (used flag) and expires after 10 minutes.
// - Codes are per driver record; a code is only ever issued for a phone
//   number that belongs to an ACTIVE driver (see services/driverOtp.js).
// - expires_at carries a TTL index so expired codes are removed by MongoDB.
const driverOtpSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
    required: true,
  },
  // Normalized phone the code was sent to (E.164-ish, e.g. +17035956269).
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  code_hash: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
  used: {
    type: Boolean,
    default: false,
  },
  // Failed verify attempts against this code (max 10 per phone per hour
  // is enforced in the service; this counter is per issued code).
  attempts: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const driverOtp = mongoose.model("driver_otp", driverOtpSchema);
module.exports = driverOtp;
