const bookingService = require("../services/booking");

exports.create_newBooking = async (req, res) => {
	try {
		const payload = req.body;

		// 1. Step 1: Only trip_details are provided
		if (payload.trip_details && !payload.vehicle_details && !payload.contact_details) {
			const result = await bookingService.initiateBooking(payload.trip_details);
			if (!result.success) return res.status(400).json(result);
			return res.status(201).json(result);
		}

		// 2. Step 2: Finalize booking with booking_id, vehicle_details, and contact_details
		if (payload.booking_id && payload.vehicle_details && payload.contact_details) {
			const result = await bookingService.finalizeBooking(
				payload.booking_id, 
				payload.vehicle_details, 
				payload.contact_details,
				payload.special_requests
			);
			if (!result.success) return res.status(400).json(result);
			return res.status(200).json(result);
		}

		// 3. Fallback: Full booking in one go
		if (!payload.trip_details || !payload.vehicle_details || !payload.contact_details) {
			return res.status(400).json({ 
				success: false, 
				message: "Missing required sections for full booking: trip_details, vehicle_details, or contact_details" 
			});
		}

		const result = await bookingService.createBooking(payload);
		if (!result.success) return res.status(400).json(result);
		return res.status(201).json(result);
	} catch (error) {
		console.log("create_newBooking controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.request_payment = async (req, res) => {
	try {
		const { booking_id } = req.body;
		if (!booking_id) return res.status(400).json({ success: false, message: "booking_id is required" });
		
		const result = await bookingService.requestPayment(booking_id);
		if (!result.success) return res.status(400).json(result);
		return res.status(200).json(result);
	} catch (error) {
		console.log("request_payment controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.get_allBookings = async (req, res) => {
	try {
		const result = await bookingService.getAllBookings();
		return res.status(200).json(result);
	} catch (error) {
		console.log("get_allBookings controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.get_todayBookings = async (req, res) => {
	try {
		const result = await bookingService.getTodayBookings();
		return res.status(200).json(result);
	} catch (error) {
		console.log("get_todayBookings controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.update_bookingStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;
		if (!status) return res.status(400).json({ success: false, message: "Status is required" });
		
		const result = await bookingService.updateBookingStatus(id, status);
		if (!result.success) return res.status(400).json(result);
		return res.status(200).json(result);
	} catch (error) {
		console.log("update_bookingStatus controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};
