const express = require("express");
const router = express.Router();
const gnetController = require("../controllers/gnet");

// GNet farm-in receiving endpoint. Public by design (GNet servers call it),
// protected by the shared secret checked in the service, NOT by admin_auth.
router.post("/gnet/receive", gnetController.receive);

module.exports = router;
