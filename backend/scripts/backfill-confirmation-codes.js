// Phase 3 backfill — assigns short confirmation codes to bookings that
// were created before Phase 3 and therefore have none.
// Run: `node scripts/backfill-confirmation-codes.js` (MONGO_URI set).
// Safe to re-run: bookings that already have a code are untouched, and
// nothing else on a booking is modified. Uses the same pre-save hook
// path as new bookings, so the sparse unique index guarantees no
// duplicate code is ever stored.
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const Booking = require("../src/models/bookingModel");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("backfill-confirmation-codes: MONGO_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const missing = await Booking.find({ $or: [{ confirmation_code: { $exists: false } }, { confirmation_code: null }, { confirmation_code: "" }] }).select("_id").lean().exec();
  let assigned = 0;
  for (const doc of missing) {
    const booking = await Booking.findById(doc._id).exec();
    if (!booking || booking.confirmation_code) continue;
    await booking.save(); // pre-save hook assigns a unique code
    assigned++;
  }
  console.log(`backfill-confirmation-codes: ${assigned} booking(s) assigned a confirmation code (${missing.length} were missing one)`);
  process.exit(0);
}

run().catch((err) => {
  console.error("backfill-confirmation-codes failed:", err);
  process.exit(1);
});
