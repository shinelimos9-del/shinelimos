const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");
const admin_auth = require("../../middleware/user_auth");

// Dashboard + reports are admin-only (the original /dashboard route was
// public; Phase 1 puts it behind the same JWT admin auth as bookings).
router.get("/dashboard", admin_auth, dashboardController.get_dashboardData);
router.get("/dashboard/report", admin_auth, dashboardController.get_bookingsReport);
router.get("/dashboard/export.csv", admin_auth, dashboardController.export_bookingsCsv);

module.exports = router;
