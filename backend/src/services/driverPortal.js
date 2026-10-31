// Phase 2 — driver portal service.
//
// SECURITY RULE (Amjad: a MUST, for all drivers): a driver must NEVER
// see a booking price. Every driver-facing response goes through
// toDriverTrip(), which builds a NEW object from an explicit allowlist
// of fields. Price, payment and gratuity fields are never copied — not
// hidden in the UI, stripped at the API layer. If a new field is added
// to a booking later, drivers do not see it until it is added here.
//
// A driver sees only: pickup location, drop-off location, date, time,
// trip status, vehicle name, and the passenger's name + phone (needed
// to find the passenger). Nothing financial, ever.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Booking = require("../models/bookingModel");
const Driver = require("../models/driverModel");
const { sendEmail } = require("../utils/emailService");

// Forward-only trip progress. Index order is the enforcement rule.
const DRIVER_STATUS_ORDER = ["assigned", "on_the_way", "arrived", "completed"];

const DRIVER_STATUS_LABELS = {
  assigned: "Assigned",
  on_the_way: "On the way to passenger",
  arrived: "Arrived",
  completed: "Trip complete",
};

function isForwardMove(current, next) {
  const from = DRIVER_STATUS_ORDER.indexOf(current || "assigned");
  const to = DRIVER_STATUS_ORDER.indexOf(next);
  return to > from;
}

// Build the ONLY shape a driver ever receives for a trip. Allowlist —
// anything not listed here (estimated_price, price_snapshot,
// price_breakdown, waiting_fee, payment_status, payment_id,
// transaction_id, booker email, gratuity, etc.) is dropped.
function toDriverTrip(booking) {
  const b = booking && typeof booking.toObject === "function" ? booking.toObject() : booking || {};
  const trip = (b.trip_details && b.trip_details[0]) || {};
  const passenger = (b.contact_details && b.contact_details.passenger) || {};
  const booker = (b.contact_details && b.contact_details.booker) || {};
  // Passenger contact is what the driver needs to find the rider. If the
  // booker is the passenger (the usual case), fall back to the booker.
  const passengerName = [passenger.first_name, passenger.last_name].filter(Boolean).join(" ")
    || [booker.first_name, booker.last_name].filter(Boolean).join(" ");
  const passengerPhone = (passenger.primary_phone && passenger.primary_phone.number)
    || (booker.primary_phone && booker.primary_phone.number)
    || "";
  return {
    booking_id: String(b._id),
    date: trip.date || null,
    start_time: trip.start_time || "",
    pickup_location: trip.pickup_location || "",
    dropoff_location: trip.dropoff_location || "",
    stops: (trip.stops || []).map((s) => ({ location: s.location || "" })),
    vehicle_name: (b.vehicle_details && b.vehicle_details.vehicle_name) || "",
    passenger_name: passengerName,
    passenger_phone: passengerPhone,
    special_requests: b.special_requests || "",
    driver_status: b.driver_status || "assigned",
    booking_status: b.booking_status || "pending",
  };
}

// --- Driver login -------------------------------------------------------
// Drivers log in with the email stored on their driver record + the
// password the admin set for them (stored only as password_hash).
// The token carries role: "driver" and is checked by
// middleware/driver_auth.js. It does NOT grant admin access: the admin
// auth middleware looks the token id up in the admin collection, where
// no driver exists, so it returns 403 for driver tokens.
async function loginDriver(email, password) {
  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const driver = await Driver.findOne({ email: cleanEmail });
  if (!driver || driver.status !== "active" || !driver.password_hash) {
    // Same message for all three cases so login cannot be used to probe
    // which drivers exist or which have a password set.
    return { success: false, message: "Invalid email or password, or this driver has no login set up yet." };
  }
  const ok = await bcrypt.compare(String(password), driver.password_hash);
  if (!ok) {
    return { success: false, message: "Invalid email or password, or this driver has no login set up yet." };
  }
  const token = jwt.sign(
    { id: driver._id, role: "driver" },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );
  return {
    success: true,
    token,
    driver: { id: String(driver._id), name: driver.name, email: driver.email, phone: driver.phone },
  };
}

async function getMyTrips(driverId) {
  const bookings = await Booking.find({ "driver_details.driver_id": driverId })
    .sort({ "trip_details.date": 1 })
    .exec();
  return { success: true, trips: bookings.map(toDriverTrip) };
}

async function getMyTrip(driverId, bookingId) {
  const booking = await Booking.findOne({ _id: bookingId, "driver_details.driver_id": driverId }).exec();
  if (!booking) return { success: false, message: "Trip not found or not assigned to you." };
  return { success: true, trip: toDriverTrip(booking) };
}

// Driver advances their own trip, forward only. Completing a trip also
// sets booking_status to "completed" (a pre-existing value); going on
// the way sets it to "dispatched" (also pre-existing).
async function advanceTripStatus(driverId, bookingId, nextStatus) {
  if (!DRIVER_STATUS_ORDER.includes(nextStatus)) {
    return { success: false, message: `Invalid status. Expected one of: ${DRIVER_STATUS_ORDER.join(", ")}` };
  }
  const booking = await Booking.findOne({ _id: bookingId, "driver_details.driver_id": driverId }).exec();
  if (!booking) return { success: false, message: "Trip not found or not assigned to you." };
  const current = booking.driver_status || "assigned";
  if (current === "completed") {
    return { success: false, message: "This trip is already complete." };
  }
  if (!isForwardMove(current, nextStatus)) {
    return { success: false, message: `Trip status can only move forward (current: ${DRIVER_STATUS_LABELS[current]}).` };
  }
  booking.driver_status = nextStatus;
  if (nextStatus === "on_the_way") booking.booking_status = "dispatched";
  if (nextStatus === "completed") booking.booking_status = "completed";
  booking.updated_at = Date.now();
  await booking.save();
  return { success: true, message: `Trip status updated to ${DRIVER_STATUS_LABELS[nextStatus]}.`, trip: toDriverTrip(booking) };
}

// --- Assignment email ---------------------------------------------------
// Sent when an admin assigns a driver (called from booking service).
// Reuses the existing email sender (utils/emailService: Nodemailer with
// EMAIL_USER / EMAIL_PASS from the environment — the same sender the
// admin OTP flow falls back to). No new provider, no new secret, no
// credentials in code. If the sender is not configured in production,
// this returns sent:false instead of throwing, so assignment itself
// still succeeds and the failure is visible in the server log.
// The email contains NO price — drivers must never see it.
async function sendDriverAssignmentEmail(booking, driver) {
  if (!driver || !driver.email) {
    return { sent: false, reason: "Driver has no email address on file." };
  }
  const trip = (booking.trip_details && booking.trip_details[0]) || {};
  const passenger = (booking.contact_details && booking.contact_details.passenger) || {};
  const booker = (booking.contact_details && booking.contact_details.booker) || {};
  const passengerName = [passenger.first_name, passenger.last_name].filter(Boolean).join(" ")
    || [booker.first_name, booker.last_name].filter(Boolean).join(" ");
  const passengerPhone = (passenger.primary_phone && passenger.primary_phone.number)
    || (booker.primary_phone && booker.primary_phone.number)
    || "Not provided";
  const dateStr = trip.date ? new Date(trip.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "See booking";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #111; text-align: center;">Shine Limos — New Trip Assigned</h2>
      <p>Hi ${driver.name},</p>
      <p>You have been assigned a trip. Please log in to your driver portal to view it and update your status as you go.</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; font-weight: bold;">Pickup:</td><td style="padding: 6px 0;">${trip.pickup_location || ""}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Drop-off:</td><td style="padding: 6px 0;">${trip.dropoff_location || ""}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Date:</td><td style="padding: 6px 0;">${dateStr}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Time:</td><td style="padding: 6px 0;">${trip.start_time || ""}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Vehicle:</td><td style="padding: 6px 0;">${(booking.vehicle_details && booking.vehicle_details.vehicle_name) || ""}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Passenger:</td><td style="padding: 6px 0;">${passengerName}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Passenger phone:</td><td style="padding: 6px 0;">${passengerPhone}</td></tr>
        ${booking.special_requests ? `<tr><td style="padding: 6px 0; font-weight: bold;">Notes:</td><td style="padding: 6px 0;">${booking.special_requests}</td></tr>` : ""}
      </table>
      <p style="font-size: 13px; color: #666;">When you are on your way, tap "On the way to passenger" in your driver portal, then "Arrived" when you reach the passenger, then "Trip complete" when the trip is done.</p>
      <p style="font-size: 11px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Shine Limos LLC. All rights reserved.</p>
    </div>`;
  try {
    const result = await sendEmail({
      to: driver.email,
      subject: `Shine Limos — Trip assigned: ${trip.pickup_location || "pickup"} on ${dateStr}`,
      html,
    });
    if (!result || result.success === false) {
      console.error("Driver assignment email failed:", result && result.error);
      return { sent: false, reason: (result && result.error) || "Email sender failed." };
    }
    return { sent: true };
  } catch (error) {
    console.error("Driver assignment email error:", error);
    return { sent: false, reason: error.message || "Email sender error." };
  }
}

module.exports = {
  DRIVER_STATUS_ORDER,
  DRIVER_STATUS_LABELS,
  isForwardMove,
  toDriverTrip,
  loginDriver,
  getMyTrips,
  getMyTrip,
  advanceTripStatus,
  sendDriverAssignmentEmail,
};
