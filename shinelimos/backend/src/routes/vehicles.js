const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicles");
const upload = require("../../middleware/multer");
const admin_auth = require("../../middleware/user_auth");
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 }
]);

// Create vehicle
router.post("/vehicles", uploadFields, admin_auth, vehicleController.add_newVehicle);

// Get all vehicles
router.get("/vehicles", vehicleController.getAll_vehicles);

// Update vehicle
router.put("/vehicles", uploadFields, admin_auth, vehicleController.updateVehicle_details);

// Delete vehicle
router.delete("/vehicles/:id",admin_auth , vehicleController.deleteVehicle);

// Search vehicles by capacity
router.get("/vehicles/search", vehicleController.getVehicles_byCapacity);

module.exports = router;
