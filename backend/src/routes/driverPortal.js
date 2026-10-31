const express = require("express");
const router = express.Router();
const driverPortalController = require("../controllers/driverPortal");
const driver_auth = require("../../middleware/driver_auth");

// Driver login is public; every trip route requires a driver token.
// Admin tokens are rejected by driver_auth (role check), and driver
// tokens are rejected by admin auth (no admin record) — neither role
// can cross into the other's routes.
router.post("/driver/login", driverPortalController.driver_login);
router.get("/driver/trips", driver_auth, driverPortalController.get_my_trips);
router.get("/driver/trips/:id", driver_auth, driverPortalController.get_my_trip);
router.patch("/driver/trips/:id/status", driver_auth, driverPortalController.update_my_trip_status);

module.exports = router;
