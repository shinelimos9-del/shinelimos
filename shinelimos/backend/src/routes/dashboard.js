const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");

// Get dashboard data
router.get("/dashboard", dashboardController.get_dashboardData);

module.exports = router;
