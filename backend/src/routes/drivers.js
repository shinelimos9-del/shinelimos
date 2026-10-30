const express = require("express");
const router = express.Router();
const driverController = require("../controllers/drivers");
const admin_auth = require("../../middleware/user_auth");

// All driver routes are admin-only (same JWT auth as vehicles/bookings).
router.get("/drivers", admin_auth, driverController.get_allDrivers);
router.post("/drivers", admin_auth, driverController.add_newDriver);
router.put("/drivers/:id", admin_auth, driverController.update_driver);
router.delete("/drivers/:id", admin_auth, driverController.delete_driver);

module.exports = router;
