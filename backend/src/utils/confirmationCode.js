// Phase 3 — short, Moovs-style confirmation codes for customers.
//
// Format: 4 characters from an alphabet with no confusable characters
// (no 0/O, 1/I, or L), e.g. "ZE34". The full Mongo ObjectId stays the
// internal database key; this code is only what customers see and use
// to look a booking up. Uniqueness is enforced two ways: callers
// pre-check with generateUniqueConfirmationCode, and the booking model
// carries a sparse unique index, so a collision can never be stored
// twice (the pre-save hook retries instead).
const crypto = require("crypto");

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 20;

function generateConfirmationCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return code;
}

// Returns a code no existing booking uses, or throws after MAX_ATTEMPTS
// (practically unreachable at this volume: 32^4 = 1,048,576 codes).
async function generateUniqueConfirmationCode(BookingModel) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateConfirmationCode();
    const existing = await BookingModel.findOne({ confirmation_code: code }).select("_id").lean().exec();
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique confirmation code");
}

// Eastern-time display for a trip date (Phase 2.2 fixed the same UTC
// slip in the driver email: a UTC server formats a 7 PM ET trip as the
// next day unless timeZone is set). Display only; nothing stored changes.
function formatTripDateEastern(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/New_York",
    });
  } catch (error) {
    return "";
  }
}

// What a customer should see for a booking: the short code when one
// exists, otherwise the last 8 chars of the ObjectId (the display the
// admin UI and My Booking used before Phase 3). Never the full _id.
function displayConfirmationCode(booking) {
  if (booking && booking.confirmation_code) return booking.confirmation_code;
  if (booking && booking._id) return String(booking._id).slice(-8);
  return "";
}

module.exports = {
  ALPHABET,
  CODE_LENGTH,
  generateConfirmationCode,
  generateUniqueConfirmationCode,
  displayConfirmationCode,
  formatTripDateEastern,
};
