const Booking = require("../models/bookingModel");
const Vehicle = require("../models/vehiclesModels");
const Admin = require("../models/adminModel");
const moment = require("moment");
const socketUtil = require("../../socket");
const { sendEmail } = require("../utils/emailService");

// Helper to notify admin via socket and save to DB
const notifyAdmin = async (booking, type = "Booking", message = "New booking received!") => {
	try {
		const notificationData = {
			booking_id: booking._id,
			booker_name: `${booking.contact_details.booker.first_name} ${booking.contact_details.booker.last_name}`,
			email: booking.contact_details.booker.email,
			phone: booking.contact_details.booker.primary_phone.number,
			pickup: booking.trip_details[0].pickup_location,
			dropoff: booking.trip_details[0].dropoff_location,
			estimated_price: booking.vehicle_details.estimated_price,
			vehicle_name: booking.vehicle_details.vehicle_name,
			date: moment(booking.trip_details[0].date).format("MMM DD, YYYY"),
			time: booking.trip_details[0].start_time,
			message: message,
			type: type,
			payment_status: booking.payment_status || "Pending"
		};

		// 1. Emit real-time notification
		const io = socketUtil.getIO();
		io.emit(type === "Payment Request" ? "payment_request" : "new_booking", notificationData);

		// 2. Save notification to all admins in the database
		// Also update any existing notifications for this booking to avoid duplicates or status mismatch
		await Admin.updateMany(
			{ "notifications.booking_id": booking._id },
			{ $set: { "notifications.$[elem].payment_status": notificationData.payment_status } },
			{ arrayFilters: [{ "elem.booking_id": booking._id }] }
		);

		await Admin.updateMany(
			{}, 
			{ $push: { notifications: { $each: [notificationData], $position: 0 } } }
		);

		// 3. Send email to admin if it's a payment request
		if (type === "Payment Request") {
			const adminList = await Admin.find({});
			const adminEmails = adminList.map(a => a.email);
			
			const adminDashboardUrl = process.env.ADMIN_DASHBOARD_URL || "http://localhost:3000/admin";
			
			for (const email of adminEmails) {
				await sendEmail({
					to: email,
					subject: `Payment Request - Booking #${booking._id}`,
					html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
							<h2 style="color: #d4af37; text-align: center;">Payment Request Received</h2>
							<p>A new payment request has been made for booking <strong>#${booking._id}</strong>.</p>
							<hr style="border: 0; border-top: 1px solid #eee;" />
							<div style="margin: 20px 0;">
								<p><strong>Booker:</strong> ${notificationData.booker_name}</p>
								<p><strong>Email:</strong> ${notificationData.email}</p>
								<p><strong>Amount:</strong> $${notificationData.estimated_price}</p>
								<p><strong>Vehicle:</strong> ${notificationData.vehicle_name}</p>
							</div>
							<div style="text-align: center; margin-top: 30px;">
								<a href="${adminDashboardUrl}/bookings/${booking._id}" style="background-color: #d4af37; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking & Send Payment Link</a>
							</div>
							<p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">This is an automated notification from Shine Limos.</p>
						</div>
					`
				});
			}
		}

	} catch (err) {
		console.log("Admin notification error:", err.message);
	}
};

// Helper to extract numeric hours from duration string (e.g., "2 hours" -> 2)
const parseDurationToHours = (durationStr) => {
	if (!durationStr) return 0;
	const match = durationStr.match(/(\d+)/);
	return match ? parseInt(match[1]) : 0;
};

// Helper to extract numeric minutes from duration (e.g., "2 hours" -> 120)
const parseDurationToMinutes = (durationStr) => {
	if (!durationStr) return 0;
	const hours = parseDurationToHours(durationStr);
	return hours * 60;
};

const axios = require("axios");

// Helper to get coordinates from address details using Mapbox Geocoding API
const getCoordsFromAddressMapbox = async (loc, details) => {
	// If frontend already provided coordinates, use them directly for accurate pin drop
	if (details && details.lat && details.lng) {
		console.log(`[Mapbox Geocoding] Using provided coordinates: ${details.lat}, ${details.lng}`);
		return { lat: details.lat, lng: details.lng };
	}

	const token = process.env.MAPBOX_ACCESS_TOKEN;
	if (!token) {
		console.log("MAPBOX_ACCESS_TOKEN is missing in environment variables");
		return null;
	}
	try {
		// Construct query from address details
		// Priority order: street address parts first, then city/state/zip
		const uniqueQueryParts = [...new Set([
			details.flat_no,
			details.area,
			details.landmark,
			details.city,
			details.state,
			details.postal_code
		])].filter(Boolean);
		
		// If we have specific address details, prioritize those over the generic city name
		let query = uniqueQueryParts.length > 0 ? uniqueQueryParts.join(", ") : loc;
		
		// Mapbox Geocoding Specific: If it's a known airport name, we can improve accuracy
		if (loc.includes("Dulles") || loc.includes("IAD")) {
			query = "Dulles International Airport, VA, 20166";
		} else if (loc.includes("Reagan") || loc.includes("DCA")) {
			query = "Ronald Reagan Washington National Airport, VA, 22202";
		} else if (loc.includes("Washington") && loc.includes("D.C.")) {
			// Ensure DC center is targeted correctly if no specific address
			if (uniqueQueryParts.length <= 3) { // Just city/state/zip
				query = "Washington, D.C., 20001";
			}
		}
		console.log(`[Mapbox Geocoding] Searching for: "${query}" (Original: "${loc}")`);
		
		const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`, {
			params: {
				access_token: token,
				limit: 1,
				types: 'address,poi,postcode,place,locality'
			}
		});

		if (response.data && response.data.features && response.data.features.length > 0) {
			const [lng, lat] = response.data.features[0].center;
			console.log(`[Mapbox Geocoding] Found coordinates for "${query}": ${lat}, ${lng}`);
			
			return { lat, lng };
		}

		// Fallback: Try with the original location string if structured query failed
		if (queryParts.length > 0 && loc && loc !== query) {
			console.log(`[Mapbox Geocoding] Retrying with original location: "${loc}"`);
			const fallbackResponse = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(loc)}.json`, {
				params: {
					access_token: token,
					limit: 1,
					types: 'address,poi,postcode,place,locality'
				}
			});

			if (fallbackResponse.data && fallbackResponse.data.features && fallbackResponse.data.features.length > 0) {
				const [lng, lat] = fallbackResponse.data.features[0].center;
				console.log(`[Mapbox Geocoding] Found coordinates for fallback "${loc}": ${lat}, ${lng}`);
				return { lat, lng };
			}
		}

		console.log(`[Mapbox Geocoding] No results found for: "${query}" or "${loc}"`);
		return null;
	} catch (error) {
		console.log(`Mapbox Geocoding error:`, error.message);
		return null;
	}
};

// Helper to get accurate road distance using Mapbox Directions API
const getRoadDistanceMapbox = async (origin, destination) => {
	const token = process.env.MAPBOX_ACCESS_TOKEN;
	if (!token || !origin || !destination) return 10; // Fallback distance

	try {
		// Mapbox coordinates format is [longitude, latitude]
		const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
		console.log(`[Mapbox Directions] Requesting route: ${origin.lat},${origin.lng} to ${destination.lat},${destination.lng}`);
		
		const response = await axios.get(url, {
			params: {
				access_token: token,
				overview: 'simplified'
			}
		});

		if (response.data && response.data.routes && response.data.routes.length > 0) {
			const distanceInMeters = response.data.routes[0].distance;
			const distanceInMiles = distanceInMeters / 1609.34;
			console.log(`[Mapbox Directions] Found road distance: ${distanceInMiles.toFixed(2)} miles`);
			
			return distanceInMiles;
		}
		console.log(`[Mapbox Directions] No routes found.`);
		return 10;
	} catch (error) {
		console.log(`Mapbox Directions error:`, error.message);
		return 10;
	}
};

exports.initiateBooking = async (tripData) => {
	try {
		// 1. Process trip data with accurate Mapbox distance calculation
		const processedTripData = await Promise.all(tripData.map(async (segment) => {
			// Get coordinates for both pickup and dropoff using Mapbox Geocoding
			const pickupCoords = await getCoordsFromAddressMapbox(segment.pickup_location, segment.pickup_details);
			const dropoffCoords = await getCoordsFromAddressMapbox(segment.dropoff_location, segment.dropoff_details);

			// Calculate road distance using Mapbox Directions API
			const distance = await getRoadDistanceMapbox(pickupCoords, dropoffCoords);

			return {
				...segment,
				pickup_details: {
					...segment.pickup_details,
					latitude: pickupCoords ? pickupCoords.lat : 0,
					longitude: pickupCoords ? pickupCoords.lng : 0
				},
				dropoff_details: {
					...segment.dropoff_details,
					latitude: dropoffCoords ? dropoffCoords.lat : 0,
					longitude: dropoffCoords ? dropoffCoords.lng : 0
				},
				distance_miles: distance
			};
		}));

		// 2. Save initial trip details
		const booking = new Booking({ trip_details: processedTripData });
		const savedBooking = await booking.save();

		// 3. Get total passengers and luggage from all segments
		let totalPass = 0;
		let totalLuggage = 0;
		processedTripData.forEach(segment => {
			totalPass = Math.max(totalPass, parseInt(segment.total_passengers || 0));
			totalLuggage = Math.max(totalLuggage, parseInt(segment.total_luggage || 0));
		});

		// 4. Find suitable vehicles
		const vehicles = await Vehicle.find({});
		const suitableVehicles = vehicles.filter(v => 
			parseInt(v.passenger_capacity) >= totalPass &&
			parseInt(v.luggage_capacity) >= totalLuggage
		);

		// 5. Calculate pricing for each vehicle
		const vehiclesWithPrice = await Promise.all(suitableVehicles.map(async (vehicle) => {
			let totalPrice = 0;

			// Support for old string-based pricing (fallback)
			let pricing = {
				base_price: 0,
				price_per_minute: 0,
				price_per_mile: 0,
				price_per_hour: 0
			};

			if (vehicle.price && typeof vehicle.price === 'object' && vehicle.price.price_per_hour !== undefined) {
				pricing = vehicle.price;
			} else if (vehicle.price) {
				const priceNum = parseFloat(vehicle.price) || 0;
				pricing.base_price = priceNum;
				pricing.price_per_hour = priceNum;
			}

			for (const segment of processedTripData) {
				const durationHours = parseDurationToHours(segment.duration);
				const durationMinutes = parseDurationToMinutes(segment.duration);
				const distanceMiles = segment.distance_miles || 10;

				console.log(`[Pricing] Calculating segment for vehicle: ${vehicle.vehicle_name}`);
				console.log(`[Pricing] Trip Type: ${segment.trip_type}, Distance: ${distanceMiles.toFixed(2)} mi, Duration: ${segment.duration}`);

				if (segment.trip_type === "Hourly") {
					const segmentPrice = Math.max(1, durationHours) * (pricing.price_per_hour || 0);
					console.log(`[Pricing] Hourly Calc: ${Math.max(1, durationHours)} hrs * $${pricing.price_per_hour}/hr = $${segmentPrice}`);
					totalPrice += segmentPrice;
				} else if (segment.trip_type === "Round Trip") {
					const base = (pricing.base_price || 0);
					const distPrice = (distanceMiles * 2 * (pricing.price_per_mile || 0));
					const timePrice = (durationMinutes * (pricing.price_per_minute || 0));
					const segmentPrice = base + distPrice + timePrice;
					
					console.log(`[Pricing] Round Trip Calc: Base($${base}) + Distance(${distanceMiles.toFixed(2)}*2 * $${pricing.price_per_mile}) + Time(${durationMinutes}m * $${pricing.price_per_minute}) = $${segmentPrice}`);
					totalPrice += segmentPrice;
				} else {
					const base = (pricing.base_price || 0);
					const distPrice = (distanceMiles * (pricing.price_per_mile || 0));
					const timePrice = (durationMinutes * (pricing.price_per_minute || 0));
					const segmentPrice = base + distPrice + timePrice;

					console.log(`[Pricing] One Way Calc: Base($${base}) + Distance(${distanceMiles.toFixed(2)} * $${pricing.price_per_mile}) + Time(${durationMinutes}m * $${pricing.price_per_minute}) = $${segmentPrice}`);
					totalPrice += segmentPrice;
				}
			}
			console.log(`[Pricing] Total Estimated Price for ${vehicle.vehicle_name}: $${totalPrice.toFixed(2)}`);

			return {
				_id: vehicle._id,
				vehicle_name: vehicle.vehicle_name,
				image: vehicle.image,
				passenger_capacity: vehicle.passenger_capacity,
				luggage_capacity: vehicle.luggage_capacity,
				estimated_price: totalPrice.toFixed(2)
			};
		}));

		return { 
			success: true, 
			booking_id: savedBooking._id, 
			available_vehicles: vehiclesWithPrice 
		};
	} catch (error) {
		console.log("initiateBooking error:", error);
		return { success: false, message: error.message || error };
	}
};

exports.finalizeBooking = async (bookingId, vehicleDetails, contactDetails, specialRequests) => {
	try {
		const updateData = {
			vehicle_details: vehicleDetails,
			contact_details: contactDetails,
			special_requests: specialRequests,
			booking_status: "pending",
			updated_at: Date.now()
		};

		// If booker is also the passenger, sync booker info to passenger info if not provided
		if (contactDetails.booker && contactDetails.booker.is_passenger) {
			if (!contactDetails.passenger || !contactDetails.passenger.first_name) {
				updateData.contact_details.passenger = {
					first_name: contactDetails.booker.first_name,
					last_name: contactDetails.booker.last_name,
					email: contactDetails.booker.email,
					primary_phone: contactDetails.booker.primary_phone,
					secondary_phone: contactDetails.booker.secondary_phone
				};
			}
		}

		const updated = await Booking.findByIdAndUpdate(
			bookingId,
			updateData,
			{ new: true }
		);
		if (!updated) return { success: false, message: "Booking not found" };

		// Notify admin via socket
		notifyAdmin(updated);

		return { success: true, message: "Booking finalized successfully", booking: updated };
	} catch (error) {
		console.log("finalizeBooking error:", error);
		return { success: false, message: error.message || error };
	}
};

exports.createBooking = async (bookingData) => {
	try {
		const booking = new Booking(bookingData);
		const saved = await booking.save();
		return { success: true, message: "Booking created successfully", booking: saved };
	} catch (error) {
		console.log("createBooking error:", error);
		return { success: false, message: error.message || error };
	}
};

exports.getAllBookings = async () => {
	try {
		const bookings = await Booking.find().populate("vehicle_details.vehicle_id");
		return { success: true, bookings };
	} catch (error) {
		console.log("getAllBookings error:", error);
		return { success: false, message: error.message || error };
	}
};

exports.getTodayBookings = async () => {
	try {
		const todayStart = moment().startOf('day').toDate();
		const todayEnd = moment().endOf('day').toDate();
		
		const bookings = await Booking.find({
			created_at: { $gte: todayStart, $lte: todayEnd }
		}).sort({ created_at: -1 });

		return { success: true, bookings };
	} catch (error) {
		console.log("getTodayBookings error:", error);
		return { success: false, message: error.message || error };
	}
};

exports.requestPayment = async (bookingId) => {
	try {
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return { success: false, message: "Booking not found" };
		}

		booking.payment_status = "requested";
		await booking.save();

		// Notify admin
		await notifyAdmin(booking, "Payment Request", "Customer requested to make a payment");

		return { success: true, message: "Payment request sent to admin" };
	} catch (error) {
		console.log("requestPayment error:", error);
		return { success: false, message: error.message || error };
	}
};

exports.updateBookingStatus = async (id, status) => {
	try {
		const updated = await Booking.findByIdAndUpdate(
			id,
			{ booking_status: status, updated_at: Date.now() },
			{ new: true }
		);
		if (!updated) return { success: false, message: "Booking not found" };
		return { success: true, message: `Booking ${status} successfully`, booking: updated };
	} catch (error) {
		console.log("updateBookingStatus error:", error);
		return { success: false, message: error.message || error };
	}
};
