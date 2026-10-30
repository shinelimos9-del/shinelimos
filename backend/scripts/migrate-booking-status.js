// One-time migration for the Phase 1 booking_status enum.
// Run BEFORE deploying the enum change (or immediately after, before any
// booking write): `node scripts/migrate-booking-status.js`
// Maps any booking_status value outside
// ["pending", "confirmed", "dispatched", "completed", "cancelled"] to
// "pending". Nothing is deleted; only the status string is rewritten.
// Safe to re-run: already-valid bookings are untouched.
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const Booking = require("../src/models/bookingModel");

const VALID = ["pending", "confirmed", "dispatched", "completed", "cancelled"];

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("migrate-booking-status: MONGO_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Booking.updateMany(
    { booking_status: { $nin: VALID } },
    { $set: { booking_status: "pending", updated_at: Date.now() } }
  );
  console.log(`migrate-booking-status: ${result.modifiedCount} booking(s) mapped to "pending"`);
  process.exit(0);
}

run().catch((err) => {
  console.error("migrate-booking-status failed:", err);
  process.exit(1);
});
