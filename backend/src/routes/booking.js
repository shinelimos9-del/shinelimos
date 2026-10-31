const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking");
const admin_auth = require("../../middleware/user_auth");

// Create booking
router.post("/bookings", bookingController.create_newBooking);

// Request payment
router.post("/bookings/request-payment", bookingController.request_payment);

// Get all bookings
router.get("/bookings",admin_auth, bookingController.get_allBookings);

// Customer booking lookup (Phase 2): booking ID + booker email must
// match. Public by design, but it returns trip + driver name/phone
// only — no prices, no payment data. Must sit before any /bookings/:id
// style route that could swallow it; it is a distinct path segment.
router.get("/bookings/customer/:id", bookingController.get_customer_booking);

// Get today's bookings
router.get("/bookings/today",admin_auth, bookingController.get_todayBookings);

// Update booking status
router.patch("/bookings/:id/status",admin_auth, bookingController.update_bookingStatus);

// Assign (or unassign, driver_id: null) a driver to a booking
router.patch("/bookings/:id/driver", admin_auth, bookingController.assign_driver);

// Delete booking
router.delete("/bookings/:id", admin_auth, bookingController.delete_booking);

module.exports = router;
