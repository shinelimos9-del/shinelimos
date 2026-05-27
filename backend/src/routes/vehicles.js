const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicles");
const upload = require("../../middleware/multer");

// Create vehicle
router.post("/vehicles", upload.single("image"), vehicleController.add_newVehicle);

// Get all vehicles
router.get("/vehicles", vehicleController.getAll_vehicles);

// Update vehicle
router.put("/vehicles", upload.single("image"), vehicleController.updateVehicle_details);

// Delete vehicle
router.delete("/vehicles/:id", vehicleController.deleteVehicle);

// Search vehicles by capacity
router.get("/vehicles/search", vehicleController.getVehicles_byCapacity);

module.exports = router;
