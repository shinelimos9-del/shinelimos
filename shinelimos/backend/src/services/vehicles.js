const Vehicle = require("../models/vehiclesModels");

// Create and save a new vehicle
exports.addNewVehicle = async (vehicleData) => {
	try {
		const vehicle = new Vehicle(vehicleData);
		const saved = await vehicle.save();
		return { success: true, message: "Vehicle created successfully", vehicle: saved };
	} catch (error) {
		console.log("addNewVehicle error:", error);
		return { success: false, message: error.message || error };
	}
};

// Update vehicle details by id
exports.updateVehicleDetails = async (_id, updateData) => {
	try {
		console.log(_id);
		updateData.updated_at = Date.now();
		const updated = await Vehicle.findByIdAndUpdate(_id, updateData, { new: true });
		if (!updated) return { success: false, message: "Vehicle not found" };
		return { success: true, message: "Vehicle updated successfully", vehicle: updated };
	} catch (error) {
		console.log("updateVehicleDetails error:", error);
		return { success: false, message: error.message || error };
	}
};

// Delete vehicle by id
exports.deleteVehicle = async (_id) => {
	try {
		const deleted = await Vehicle.findByIdAndDelete(_id);
		if (!deleted) return { success: false, message: "Vehicle not found" };
		return { success: true, message: "Vehicle deleted successfully", vehicle: deleted };
	} catch (error) {
		console.log("deleteVehicle error:", error);
		return { success: false, message: error.message || error };
	}
};

// Get all vehicles
exports.getAllVehicles = async () => {
	try {
		const vehicles = await Vehicle.find({});
		return { success: true, vehicles };
	} catch (error) {
		console.log("getAllVehicles error:", error);
		return { success: false, message: error.message || error };
	}
};

// Get vehicles by passenger capacity
exports.getVehiclesByCapacity = async (capacity) => {
	try {
		// Since passenger_capacity is a string in the model, we use an aggregation 
		// or find with a numeric comparison if possible. 
		// Most efficient is to find all and filter if the dataset is small, 
		// or use $expr for numeric comparison.
		const vehicles = await Vehicle.find({});
		const filtered = vehicles.filter(v => parseInt(v.passenger_capacity) >= parseInt(capacity));
		
		const result = filtered.map(v => ({
			image: v.image,
			vehicle_name: v.vehicle_name,
			passenger_capacity: v.passenger_capacity,
			price: v.price, // This will now be the nested object
			_id: v._id
		}));

		return { success: true, vehicles: result };
	} catch (error) {
		console.log("getVehiclesByCapacity error:", error);
		return { success: false, message: error.message || error };
	}
};
