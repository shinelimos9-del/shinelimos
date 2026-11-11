// Returning-client loyalty discount (Phase 0, Nov 2026).
//
// One shared code, SHINE10, worth 10% off the whole trip — but the code
// alone does nothing. It only works when the booking email has at least
// one PRIOR booking with status "completed" (booker or passenger
// email). Reusable on every return trip, all vehicles/services. No other
// promos exist, so there is no stacking to resolve.
//
// The discount is 10% of the calculated grand total (base + extras +
// surcharges + 20% gratuity + 3% card fee). For a purely linear trip
// that is exactly the same as 10% off the base fare; for trips with
// extras or surcharges it is 10% off the whole trip, which is what the
// customer is promised (e.g. 2h sedan $185.40 -> $166.86).
//
// Validation never throws and never blocks a booking: a bad code, a
// missing email, or a first-time customer simply prices at full price
// with a reason the UI can show. The booking price is always
// re-validated and recomputed server-side at finalize, so a client can
// never grant itself a discount.
const pricingEngine = require("../utils/pricingEngine");

const LOYALTY_CODE = "SHINE10";
const LOYALTY_PERCENT = 10;

function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidCode(code) {
  return normalizeCode(code) === LOYALTY_CODE;
}

// 10% of a grand total, rounded to cents.
function discountFor(grandTotal) {
  return pricingEngine.round2(pricingEngine.safeNumber(grandTotal, 0) * (LOYALTY_PERCENT / 100));
}

// Count prior completed bookings for an email (booker or passenger).
// excludeBookingId keeps a booking from qualifying off itself when a
// completed booking is re-finalized. The Booking model is required
// lazily so the pure helpers above stay usable without a DB connection.
async function countPriorCompletedBookings(email, excludeBookingId) {
  const Booking = require("../models/bookingModel");
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return 0;
  const query = {
    booking_status: "completed",
    is_draft: { $ne: true },
    $or: [
      { "contact_details.booker.email": cleanEmail },
      { "contact_details.passenger.email": cleanEmail },
    ],
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  return Booking.countDocuments(query).exec();
}

// Full validation. countFn is an optional override for tests
// (defaults to the real DB count). Returns { applied, code, reason }:
// applied is true only when the code matches AND the email qualifies.
// reason is one of: null (applied), "no_code", "invalid_code",
// "no_email", "not_returning".
async function validateLoyalty(code, email, excludeBookingId, countFn) {
  const cleanCode = normalizeCode(code);
  if (!cleanCode) return { applied: false, code: null, reason: "no_code" };
  if (cleanCode !== LOYALTY_CODE) return { applied: false, code: cleanCode, reason: "invalid_code" };
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return { applied: false, code: cleanCode, reason: "no_email" };
  const count = countFn
    ? await countFn(cleanEmail, excludeBookingId)
    : await countPriorCompletedBookings(cleanEmail, excludeBookingId);
  if (!count || count < 1) return { applied: false, code: cleanCode, reason: "not_returning" };
  return { applied: true, code: cleanCode, reason: null };
}

// Plain-English note for the quote/booking UI. Never blocks anything.
function loyaltyNote(validation) {
  if (!validation) return null;
  if (validation.applied) return "Returning-client discount applied: 10% off your whole trip.";
  if (validation.reason === "invalid_code") return "That loyalty code wasn't recognised for this email — your quote is at the standard price.";
  if (validation.reason === "no_email") return "Enter the email you booked with to verify your loyalty code.";
  if (validation.reason === "not_returning") return "This email has no completed trip with us yet — your quote is at the standard price. Your loyalty code will work after your first completed trip.";
  return null;
}

module.exports = {
  LOYALTY_CODE,
  LOYALTY_PERCENT,
  normalizeCode,
  normalizeEmail,
  isValidCode,
  discountFor,
  countPriorCompletedBookings,
  validateLoyalty,
  loyaltyNote,
};
