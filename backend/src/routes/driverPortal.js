const express = require("express");
const router = express.Router();
const driverPortalController = require("../controllers/driverPortal");
const driverOtpController = require("../controllers/driverOtp");
const driver_auth = require("../../middleware/driver_auth");

// Driver login is public; every trip route requires a driver token.
// Admin tokens are rejected by driver_auth (role check), and driver
// tokens are rejected by admin auth (no admin record) — neither role
// can cross into the other's routes.
router.post("/driver/login", driverPortalController.driver_login);
// Driver app v1 — phone + texted code (no password, no self-registration).
// request-code answers generically whether or not the number belongs to
// a driver; verify-code issues the same 7d driver JWT as /driver/login.
router.post("/driver/request-code", driverOtpController.request_code);
router.post("/driver/verify-code", driverOtpController.verify_code);
router.get("/driver/trips", driver_auth, driverPortalController.get_my_trips);
router.get("/driver/trips/:id", driver_auth, driverPortalController.get_my_trip);
router.patch("/driver/trips/:id/status", driver_auth, driverPortalController.update_my_trip_status);

module.exports = router;
