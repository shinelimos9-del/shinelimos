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

// Get today's bookings
router.get("/bookings/today",admin_auth, bookingController.get_todayBookings);

// Update booking status
router.patch("/bookings/:id/status",admin_auth, bookingController.update_bookingStatus);

// Toggle vehicle running & stop in progress tracking
router.patch("/bookings/:id/tracking",admin_auth, bookingController.toggle_vehicleTracking);

module.exports = router;
