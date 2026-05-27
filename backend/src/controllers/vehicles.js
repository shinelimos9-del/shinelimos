const vehicleService = require("../services/vehicles");

exports.add_newVehicle = async (req, res) => {
	try {
		const payload = req.body;

		// Add image path to payload if file was uploaded
		if (req.file) {
			payload.image = `/uploads/${req.file.filename}`;
		}

		// Basic validation
		const required = ["vehicle_name", "price", "unites", "passenger_capacity", "luggage_capacity", "image"];
		const missing = required.filter((k) => !payload || payload[k] === undefined || payload[k] === "");
		if (missing.length) {
			return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(", ")}` });
		}

		// Price validation (nested fields)
		if (typeof payload.price === 'string') {
			try {
				payload.price = JSON.parse(payload.price);
			} catch (e) {
				return res.status(400).json({ success: false, message: "Invalid price format. Expected an object or JSON string." });
			}
		}

		const priceRequired = ["base_price", "price_per_minute", "price_per_mile", "price_per_hour"];
		const missingPrice = priceRequired.filter((k) => payload.price[k] === undefined || payload.price[k] === "");
		if (missingPrice.length) {
			return res.status(400).json({ success: false, message: `Missing pricing fields: ${missingPrice.join(", ")}` });
		}

		const result = await vehicleService.addNewVehicle(payload);
		if (!result.success) return res.status(400).json(result);
		return res.status(201).json(result);
	} catch (error) {
		console.log("add_newVehicle controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.updateVehicle_details = async (req, res) => {
	try {
		const {_id} = req.query;
		console.log(_id);
		if (!_id) {
			return res.status(400).json({ success: false, message: "ID is required" });
		}
		const payload = req.body;

		// Add image path to payload if new file was uploaded
		if (req.file) {
			payload.image = `/uploads/${req.file.filename}`;
		}

		// Price validation/parsing if price is being updated
		if (payload.price) {
			if (typeof payload.price === 'string') {
				try {
					payload.price = JSON.parse(payload.price);
				} catch (e) {
					return res.status(400).json({ success: false, message: "Invalid price format. Expected an object or JSON string." });
				}
			}
			// Optional: you could validate specific pricing fields here if they are required for update
		}

		const result = await vehicleService.updateVehicleDetails(_id, payload);
		if (!result.success) return res.status(404).json(result);
		return res.status(200).json(result);
	} catch (error) {
		console.log("updateVehicle_details controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.deleteVehicle = async (req, res) => {
	try {
		const {id} = req.params;
		
		const result = await vehicleService.deleteVehicle(id);
		if (!result.success) return res.status(404).json(result);
		return res.status(200).json(result);
	} catch (error) {
		console.log("deleteVehicle controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.getAll_vehicles = async (req, res) => {
	try {
		const result = await vehicleService.getAllVehicles();
		if (!result.success) return res.status(400).json(result);
		return res.status(200).json(result);
	} catch (error) {
		console.log("getAll_vehicles controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.getVehicles_byCapacity = async (req, res) => {
	try {
		const { capacity } = req.query;
		if (!capacity) {
			return res.status(400).json({ success: false, message: "Capacity is required" });
		}
		const result = await vehicleService.getVehiclesByCapacity(capacity);
		if (!result.success) return res.status(400).json(result);
		return res.status(200).json(result);
	} catch (error) {
		console.log("getVehicles_byCapacity controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};
