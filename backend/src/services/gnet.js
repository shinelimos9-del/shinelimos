/**
 * GNet (GRiDD Transportation Network) farm-in receiving service.
 *
 * One endpoint accepts GNet's NEW / UPDATE / CANCEL actions for a farm-in
 * reservation and stores it as a normal website booking, so GNet trips land in
 * the same admin bookings list as website bookings (no Kymark involved).
 *
 * Inbound auth: a shared secret agreed with GRiDD at registration time.
 *   - If GNET_SHARED_SECRET is set, the request must carry it in the
 *     `x-gnet-secret` header (or `Authorization: Bearer <secret>`).
 *   - If it is NOT set, the endpoint refuses everything with 503 so it can
 *     never run unprotected in production. Set it in the host env vars.
 *
 * Outbound status pushes use GNet's providerUpdateStatusByResNo API with the
 * API key issued at registration (GNET_API_KEY). If the key is missing, the
 * push is skipped with a warning and the booking still succeeds.
 *
 * Env vars:
 *   GNET_SHARED_SECRET   required — shared secret for inbound calls
 *   GNET_API_KEY         optional — API key for outbound status pushes
 *   GNET_PROVIDER_ID     optional — Shine's GNet ID (default "shinelimos")
 *   GNET_VEHICLE_MAP     optional — JSON override, e.g. {"SEDAN":"Sedan"}
 *
 * NOTE: GNet's exact trip-field names are confirmed against the sandbox /
 * GNet Robot transcript at test time. The normalizer below reads the
 * documented core fields plus the common variants, and refuses the trip
 * (success: false + message) when pickup, dropoff, or datetime is missing —
 * silently accepting an unacted trip is the failure mode GNet certifies
 * against, so this service never does that.
 */

const axios = require("axios");
const Booking = require("../models/bookingModel");
const Vehicle = require("../models/vehiclesModels");
const { notifyAdmin } = require("./booking");
const { sendEmail } = require("../utils/emailService");

const GNET_API_BASE = "https://api.grdd.net/Platform.svc";
const PROVIDER_ID = process.env.GNET_PROVIDER_ID || "shinelimos";

/* ------------------------------------------------------------------ */
/* Inbound auth                                                        */
/* ------------------------------------------------------------------ */

exports.checkGnetAuth = (req) => {
	const secret = process.env.GNET_SHARED_SECRET;
	if (!secret) {
		return { ok: false, status: 503, message: "GNet endpoint not configured (missing shared secret)" };
	}
	const headerSecret = req.headers["x-gnet-secret"];
	const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
	if (headerSecret === secret || bearer === secret) return { ok: true };
	return { ok: false, status: 401, message: "Invalid GNet credentials" };
};

/* ------------------------------------------------------------------ */
/* Payload normalization                                               */
/* ------------------------------------------------------------------ */

// GNet wraps the trip in affiliateReservation; accept the wrapper or a bare body.
function unwrap(body) {
	if (!body || typeof body !== "object") return {};
	return body.affiliateReservation || body.reservation || body;
}

function pick(obj, ...keys) {
	for (const key of keys) {
		const val = obj[key];
		if (val !== undefined && val !== null && val !== "") return val;
	}
	return undefined;
}

function splitName(fullName) {
	const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return { first_name: "", last_name: "" };
	if (parts.length === 1) return { first_name: parts[0], last_name: "" };
	return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

// Returns { trip } or { error } — error means "refuse with this message".
function normalizeTrip(body) {
	const aff = unwrap(body);

	const action = String(pick(aff, "action") || "").toUpperCase();
	const requesterId = pick(aff, "requesterId", "requester_id");
	const requesterResNo = pick(aff, "requesterResNo", "requester_res_no");
	const providerResNo = pick(aff, "providerResNo", "provider_res_no");
	const accountNumber = pick(aff.account || {}, "accountNumber", "account_number")
		|| pick(aff, "accountNumber", "account_number");
	const transactionId = pick(aff, "transactionId", "transaction_id");

	if (!action) return { error: "Missing action (NEW, UPDATE, or CANCEL)" };
	if (!["NEW", "UPDATE", "CANCEL"].includes(action)) {
		return { error: `Unsupported action: ${action}` };
	}
	if (!requesterResNo) return { error: "Missing requesterResNo" };

	// CANCEL / UPDATE only need the identifiers, but UPDATE may also carry
	// changed trip fields — parse them here so the handler can apply them.
	const pickupObj = aff.pickup || {};
	const dropoffObj = aff.dropoff || {};
	const pickup = pick(pickupObj, "address") || pick(aff, "pickupAddress", "pickup_address", "from", "pickupLocation", "pickup_location");
	const dropoff = pick(dropoffObj, "address") || pick(aff, "dropoffAddress", "dropoff_address", "to", "dropoffLocation", "dropoff_location");
	const dateTimeRaw = pick(pickupObj, "dateTime", "datetime")
		|| pick(aff, "pickupDateTime", "pickup_datetime", "dateTime", "datetime")
		|| (pick(aff, "date", "pickupDate", "pickup_date") && pick(aff, "time", "pickupTime", "pickup_time")
			? `${pick(aff, "date", "pickupDate", "pickup_date")} ${pick(aff, "time", "pickupTime", "pickup_time")}`
			: undefined);
	const passengers = String(pick(aff, "passengers", "passengerCount", "passenger_count", "totalPassengers", "total_passengers") || "");

	if (action !== "NEW") {
		let dateObj, startTime;
		if (dateTimeRaw) {
			dateObj = new Date(dateTimeRaw);
			if (isNaN(dateObj.getTime())) return { error: `Unparseable pickup date/time: ${dateTimeRaw}` };
			startTime = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
		}
		return {
			trip: { action, requesterId, requesterResNo, providerResNo, accountNumber, transactionId, pickup, dropoff, dateObj, startTime, passengers },
		};
	}

	const missing = [];
	if (!pickup) missing.push("pickup");
	if (!dropoff) missing.push("dropoff");
	if (!dateTimeRaw) missing.push("pickup date/time");
	if (missing.length) return { error: `Cannot accept trip, missing: ${missing.join(", ")}` };

	const dateObj = new Date(dateTimeRaw);
	if (isNaN(dateObj.getTime())) return { error: `Unparseable pickup date/time: ${dateTimeRaw}` };

	const customer = aff.customer || aff.passenger || aff.booker || {};
	const name = splitName(pick(customer, "name") || `${pick(customer, "firstName", "first_name") || ""} ${pick(customer, "lastName", "last_name") || ""}`.trim());
	const booker = {
		first_name: name.first_name,
		last_name: name.last_name,
		email: pick(customer, "email") || "",
		primary_phone: { number: pick(customer, "phone", "phoneNumber", "primary_phone") || "", type: "Cellular" },
		is_passenger: true,
	};

	const vehicleType = pick(aff, "vehicleType", "vehicle_type", "vehicle", "vehicleCategory", "vehicle_category", "serviceType", "service_type") || "";
	const totalAmount = pick(aff, "total", "totalAmount", "total_amount", "price", "estimatedTotal", "estimated_total");
	const specialRequests = pick(aff, "notes", "comments", "specialRequests", "special_requests", "comment") || "";

	return {
		trip: {
			action, requesterId, requesterResNo, providerResNo, accountNumber, transactionId,
			pickup, dropoff, dateObj, startTime: dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
			booker, vehicleType, passengers: passengers || "1", totalAmount, specialRequests,
			raw: aff,
		},
	};
}

/* ------------------------------------------------------------------ */
/* Vehicle resolution                                                  */
/* ------------------------------------------------------------------ */

// GNet vehicle type -> website vehicle_name substring. Overridable via
// GNET_VEHICLE_MAP JSON env (keys = GNet type, values = website name).
const DEFAULT_VEHICLE_MAP = {
	SEDAN: "Sedan",
	SEDAN_LUX: "S-Class",
	SUV: "SUV",
	SUV_LUX: "Navigator",
	VAN_MINI: "Sprinter",
	SPRINTER: "Sprinter",
};

function vehicleMap() {
	try {
		return { ...DEFAULT_VEHICLE_MAP, ...(process.env.GNET_VEHICLE_MAP ? JSON.parse(process.env.GNET_VEHICLE_MAP) : {}) };
	} catch (e) {
		console.log("[GNet] Bad GNET_VEHICLE_MAP JSON, using defaults:", e.message);
		return DEFAULT_VEHICLE_MAP;
	}
}

async function resolveVehicle(gnetType) {
	const map = vehicleMap();
	const key = String(gnetType || "").toUpperCase().replace(/[\s-]/g, "_");
	const wanted = map[key] || gnetType || "";
	if (!wanted) return { vehicle_id: undefined, vehicle_name: "" };
	// Vehicle names live in Mongo (admin-managed), not in this repo, so match
	// at runtime. Fall back to a name-only booking if nothing matches.
	const found = await Vehicle.findOne({ vehicle_name: new RegExp(wanted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }).lean();
	if (found) {
		return {
			vehicle_id: found._id,
			vehicle_name: found.vehicle_name,
			image: found.image || "",
			price_snapshot: found.price ? {
				base_price: found.price.base_price,
				price_per_minute: found.price.price_per_minute,
				price_per_mile: found.price.price_per_mile,
				price_per_hour: found.price.price_per_hour,
			} : undefined,
		};
	}
	console.log(`[GNet] No website vehicle matched "${gnetType}" (looked for "${wanted}"); booking without vehicle_id`);
	return { vehicle_id: undefined, vehicle_name: wanted };
}

/* ------------------------------------------------------------------ */
/* Outbound status push                                                */
/* ------------------------------------------------------------------ */

// Best-effort: a failed push is logged, never fatal to the booking itself.
async function pushGnetStatus(booking, gnetStatus) {
	const apiKey = process.env.GNET_API_KEY;
	if (!apiKey) {
		console.log("[GNet] GNET_API_KEY not set, skipping status push:", gnetStatus);
		return { success: false, message: "No API key configured" };
	}
	const g = booking.gnet || {};
	const resNo = g.providerResNo || String(booking._id);
	try {
		const res = await axios.post(
			`${GNET_API_BASE}/providerUpdateStatusByResNo/${PROVIDER_ID}/${resNo}/V1`,
			{
				status: gnetStatus,
				griddID: PROVIDER_ID,
				resNo,
				requesterResNo: g.requesterResNo,
				transactionId: g.transactionId,
				totalAmount: booking.vehicle_details?.estimated_price,
				vehicle: booking.vehicle_details?.vehicle_name,
			},
			{ headers: { token: apiKey }, timeout: 10000 }
		);
		console.log(`[GNet] Status push ${gnetStatus} for ${resNo}:`, res.data);
		return { success: true, response: res.data };
	} catch (err) {
		console.log(`[GNet] Status push ${gnetStatus} for ${resNo} failed:`, err.message);
		return { success: false, message: err.message };
	}
}

/* ------------------------------------------------------------------ */
/* Main handler: one endpoint for NEW / UPDATE / CANCEL                */
/* ------------------------------------------------------------------ */

exports.receive = async (req) => {
	const { trip, error } = normalizeTrip(req.body);
	if (error) return { httpStatus: 200, body: { success: false, message: error } };

	// Find an existing booking for this GNet trip (by either reservation no).
	const existing = trip.providerResNo
		? await Booking.findOne({ "gnet.providerResNo": trip.providerResNo })
		: null;
	const byRequester = !existing && trip.requesterResNo
		? await Booking.findOne({ "gnet.requesterResNo": trip.requesterResNo })
		: null;
	const booking = existing || byRequester;

	/* CANCEL — only ack after actually cancelling (GNet cert rule). */
	if (trip.action === "CANCEL") {
		if (!booking) {
			return { httpStatus: 200, body: { success: false, message: `Reservation not found: ${trip.requesterResNo}` } };
		}
		if (booking.booking_status !== "cancelled") {
			booking.booking_status = "cancelled";
			booking.updated_at = Date.now();
			await booking.save();
		}
		return { httpStatus: 200, body: { success: true, providerResNo: String(booking._id), message: "Reservation cancelled" } };
	}

	/* UPDATE — apply the changed fields, refuse if unknown. */
	if (trip.action === "UPDATE") {
		if (!booking) {
			return { httpStatus: 200, body: { success: false, message: `Reservation not found: ${trip.requesterResNo}` } };
		}
		const t = booking.trip_details[0];
		if (trip.pickup) t.pickup_location = trip.pickup;
		if (trip.dropoff) t.dropoff_location = trip.dropoff;
		if (trip.dateObj) { t.date = trip.dateObj; t.start_time = trip.startTime; }
		if (trip.passengers) t.total_passengers = trip.passengers;
		booking.updated_at = Date.now();
		await booking.save();
		return { httpStatus: 200, body: { success: true, providerResNo: String(booking._id), message: "Reservation updated" } };
	}

	/* NEW — idempotent: a re-delivered requesterResNo returns the first booking. */
	if (booking) {
		return { httpStatus: 200, body: { success: true, providerResNo: String(booking._id), message: "Reservation already received" } };
	}

	const vehicle = await resolveVehicle(trip.vehicleType);
	const created = await Booking.create({
		trip_details: [{
			date: trip.dateObj,
			pickup_location: trip.pickup,
			dropoff_location: trip.dropoff,
			start_time: trip.startTime,
			trip_type: "one_way",
			occasion: "GNet farm-in",
			total_passengers: trip.passengers,
			total_luggage: "0",
		}],
		vehicle_details: {
			...vehicle,
			estimated_price: trip.totalAmount ? Number(trip.totalAmount) : undefined,
		},
		contact_details: {
			booker: trip.booker,
			passenger: { ...trip.booker },
			marketing_consent: false,
		},
		special_requests: trip.specialRequests,
		booking_status: "pending",
		payment_status: "pending",
		source: "gnet",
		gnet: {
			requesterId: trip.requesterId,
			requesterResNo: trip.requesterResNo,
			providerResNo: undefined, // filled below with our booking id
			accountNumber: trip.accountNumber,
			transactionId: trip.transactionId,
			vehicleType: trip.vehicleType,
			raw: trip.raw,
		},
	});

	// Our booking id IS the provider reservation number GNet echoes back.
	created.gnet.providerResNo = String(created._id);
	await created.save();

	// Same admin visibility as website bookings: live socket feed + admin list.
	// (No booker confirmation email: the GNet sender owns customer comms.)
	try {
		await notifyAdmin(created, "Booking", "New GNet farm-in booking received!");
		const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
		if (adminEmail) {
			await sendEmail({
				to: adminEmail,
				subject: `GNet Farm-In Received (#${created._id})`,
				html: `<p>New GNet farm-in reservation received.</p>
					<p><strong>Pickup:</strong> ${trip.pickup}</p>
					<p><strong>Drop-off:</strong> ${trip.dropoff}</p>
					<p><strong>Date & time:</strong> ${trip.dateObj.toLocaleString()}</p>
					<p><strong>Vehicle:</strong> ${vehicle.vehicle_name || trip.vehicleType || "N/A"}</p>
					<p><strong>GNet requester reservation:</strong> ${trip.requesterResNo}</p>`,
			});
		}
	} catch (notifyErr) {
		console.log("[GNet] Admin notification failed (booking still saved):", notifyErr.message);
	}

	// Acknowledge receipt to GNet (best-effort, never blocks the ack below).
	pushGnetStatus(created, "ACKNOWLEDGED");

	return {
		httpStatus: 200,
		body: { success: true, providerResNo: String(created._id), booking_id: String(created._id), message: "Reservation received" },
	};
};
