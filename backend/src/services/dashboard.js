const Booking = require("../models/bookingModel");
const moment = require("moment");

// Phase 1: dashboard aggregates accept an optional { from, to } date
// filter (ISO dates, applied to created_at). Without it, behaviour is
// unchanged (all-time). Trends are now COMPUTED against the previous
// equal-length period — the old hardcoded "-0.03%" / "+6.08%" placeholders
// are gone and must not come back.

function parseDateRange(query) {
    const from = query && query.from ? moment(query.from).startOf("day").toDate() : null;
    const to = query && query.to ? moment(query.to).endOf("day").toDate() : null;
    if ((query && query.from && !moment(query.from).isValid()) || (query && query.to && !moment(query.to).isValid())) {
        return { error: "Invalid from/to date. Use YYYY-MM-DD." };
    }
    const match = {};
    if (from || to) {
        match.created_at = {};
        if (from) match.created_at.$gte = from;
        if (to) match.created_at.$lte = to;
    }
    // Previous equal-length period, for trend comparison.
    let prevMatch = null;
    if (from && to) {
        const spanMs = to.getTime() - from.getTime();
        prevMatch = { created_at: { $gte: new Date(from.getTime() - spanMs), $lte: new Date(from.getTime() - 1) } };
    } else if (from) {
        prevMatch = { created_at: { $lt: from } };
    } else if (to) {
        prevMatch = { created_at: { $lt: moment(to).startOf("day").toDate() } };
    }
    return { match, prevMatch, from, to };
}

function trendPct(current, previous) {
    if (previous === 0) return current > 0 ? "+100%" : "+0%";
    const pct = ((current - previous) / previous * 100).toFixed(2);
    return `${Number(pct) >= 0 ? "+" : ""}${pct}%`;
}

async function sumEstimated(match) {
    const result = await Booking.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$vehicle_details.estimated_price" } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
}

exports.getDashboardStats = async (query = {}) => {
    try {
        const { match, prevMatch, error } = parseDateRange(query);
        if (error) return { success: false, message: error };

        const now = moment();
        const totalBookings = await Booking.countDocuments(match);
        const uniqueCustomers = await Booking.distinct("contact_details.booker.email", match);
        const totalNewCustomers = uniqueCustomers.length;
        const totalEarning = await sumEstimated(match);

        // Trends vs the previous period (all-time when no filter: vs last
        // month, preserving the original booking-trend behaviour).
        let bookingTrend, customerTrend, earningTrend;
        if (prevMatch) {
            const prevBookings = await Booking.countDocuments(prevMatch);
            const prevCustomers = (await Booking.distinct("contact_details.booker.email", prevMatch)).length;
            const prevEarning = await sumEstimated(prevMatch);
            bookingTrend = trendPct(totalBookings, prevBookings);
            customerTrend = trendPct(totalNewCustomers, prevCustomers);
            earningTrend = trendPct(totalEarning, prevEarning);
        } else {
            const startOfLastMonth = now.clone().subtract(1, "month").startOf("month").toDate();
            const endOfLastMonth = now.clone().subtract(1, "month").endOf("month").toDate();
            const lastMonthBookings = await Booking.countDocuments({ created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
            const lastMonthCustomers = (await Booking.distinct("contact_details.booker.email", { created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth } })).length;
            const lastMonthEarning = await sumEstimated({ created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
            bookingTrend = trendPct(totalBookings, lastMonthBookings);
            customerTrend = trendPct(totalNewCustomers, lastMonthCustomers);
            earningTrend = trendPct(totalEarning, lastMonthEarning);
        }

        // 2. Revenue Overview (Monthly) — within the filter when given.
        const revenueOverview = await Booking.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { month: { $month: "$created_at" }, year: { $year: "$created_at" } },
                    revenue: { $sum: "$vehicle_details.estimated_price" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 3. Total Trips Status — all five enum statuses, not just two.
        const statusCounts = {};
        for (const status of ["pending", "confirmed", "dispatched", "completed", "cancelled"]) {
            statusCounts[status] = await Booking.countDocuments({ ...match, booking_status: status });
        }
        const totalStatus = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

        // 4. Top Destinations
        const topDestinations = await Booking.aggregate([
            { $match: match },
            { $unwind: "$trip_details" },
            {
                $group: {
                    _id: "$trip_details.dropoff_location",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 5. Recent Bookings
        const recentBookings = await Booking.find(match)
            .sort({ created_at: -1 })
            .limit(10)
            .populate("driver_details.driver_id");

        return {
            success: true,
            filter: {
                from: query.from || null,
                to: query.to || null,
            },
            overview: {
                total_booking: { value: totalBookings, trend: bookingTrend },
                total_new_customers: { value: totalNewCustomers, trend: customerTrend },
                // NOTE: this is the sum of estimated prices, not money
                // actually collected — Stripe payments are not summed here.
                total_earning: { value: totalEarning, trend: earningTrend }
            },
            revenue_overview: {
                this_year: revenueOverview.filter(r => r._id.year === now.year()).map(r => ({ month: moment().month(r._id.month - 1).format("MMM"), revenue: r.revenue })),
                last_year: revenueOverview.filter(r => r._id.year === now.year() - 1).map(r => ({ month: moment().month(r._id.month - 1).format("MMM"), revenue: r.revenue }))
            },
            trip_summary: [
                { name: "Complete", sales: ((statusCounts.completed / totalStatus) * 100).toFixed(0), count: statusCounts.completed },
                { name: "Pending", sales: ((statusCounts.pending / totalStatus) * 100).toFixed(0), count: statusCounts.pending },
                { name: "Confirmed", sales: ((statusCounts.confirmed / totalStatus) * 100).toFixed(0), count: statusCounts.confirmed },
                { name: "Dispatched", sales: ((statusCounts.dispatched / totalStatus) * 100).toFixed(0), count: statusCounts.dispatched },
                { name: "Cancelled", sales: ((statusCounts.cancelled / totalStatus) * 100).toFixed(0), count: statusCounts.cancelled },
            ],
            top_destinations: topDestinations.map(d => ({
                name: d._id,
                percentage: totalBookings ? ((d.count / totalBookings) * 100).toFixed(1) : "0.0"
            })),
            recent_bookings: recentBookings.map(b => ({
                id: b._id,
                _id: b._id,
                name: b.contact_details?.booker ? `${b.contact_details.booker.first_name || ""} ${b.contact_details.booker.last_name || ""}`.trim() || "Unknown" : "Unknown",
                email: b.contact_details?.booker?.email || "N/A",
                trip: b.trip_details?.[0]?.trip_type || "N/A",
                date: moment(b.created_at).format("DD MMM YYYY"),
                price: b.vehicle_details?.estimated_price ? `$${b.vehicle_details.estimated_price}` : "N/A",
                phone: b.contact_details?.booker?.primary_phone?.number || "N/A",
                status: b.booking_status || "pending",
                vehicle_arrived: Boolean(b.vehicle_arrived),
                arrival_time: b.arrival_time,
                ride_started: Boolean(b.ride_started),
                ride_start_time: b.ride_start_time,
                vehicle_details: b.vehicle_details,
                trip_details: b.trip_details,
                contact_details: b.contact_details,
                price_breakdown: b.price_breakdown,
                waiting_minutes: b.waiting_minutes || 0,
                waiting_fee: b.waiting_fee || 0,
                additional_stops_count: b.additional_stops_count || 0,
                driver_details: b.driver_details || null
            }))
        };
    } catch (error) {
        console.log("getDashboardStats error:", error);
        return { success: false, message: error.message || error };
    }
};

// Reports v1: bookings filtered by period, vehicle name, payment status
// and assigned driver, plus summary counts. Used by both the report
// endpoint and the CSV export so the two can never disagree.
exports.getBookingsReport = async (query = {}) => {
    try {
        const { match, error } = parseDateRange(query);
        if (error) return { success: false, message: error };
        if (query.vehicle) match["vehicle_details.vehicle_name"] = query.vehicle;
        if (query.payment_status) match.payment_status = query.payment_status;
        if (query.driver) match["driver_details.driver_name"] = query.driver;
        if (query.status) match.booking_status = query.status;

        const bookings = await Booking.find(match)
            .sort({ created_at: -1 })
            .populate("driver_details.driver_id")
            .populate("vehicle_details.vehicle_id");

        const byStatus = {};
        const byVehicle = {};
        const byDriver = {};
        const byPaymentStatus = {};
        let totalEstimated = 0;
        for (const b of bookings) {
            byStatus[b.booking_status || "pending"] = (byStatus[b.booking_status || "pending"] || 0) + 1;
            const vehicleName = b.vehicle_details?.vehicle_name || "Unknown";
            byVehicle[vehicleName] = (byVehicle[vehicleName] || 0) + 1;
            const driverName = b.driver_details?.driver_name || "Unassigned";
            byDriver[driverName] = (byDriver[driverName] || 0) + 1;
            byPaymentStatus[b.payment_status || "pending"] = (byPaymentStatus[b.payment_status || "pending"] || 0) + 1;
            totalEstimated += Number(b.vehicle_details?.estimated_price || 0);
        }

        return {
            success: true,
            filter: {
                from: query.from || null,
                to: query.to || null,
                vehicle: query.vehicle || null,
                payment_status: query.payment_status || null,
                driver: query.driver || null,
                status: query.status || null,
            },
            summary: {
                total_bookings: bookings.length,
                total_estimated_price: totalEstimated,
                by_status: byStatus,
                by_vehicle: byVehicle,
                by_driver: byDriver,
                by_payment_status: byPaymentStatus,
            },
            bookings: bookings.map(b => ({
                id: b._id,
                created_at: b.created_at,
                trip_date: b.trip_details?.[0]?.date || null,
                pickup: b.trip_details?.[0]?.pickup_location || "",
                dropoff: b.trip_details?.[0]?.dropoff_location || "",
                trip_type: b.trip_details?.[0]?.trip_type || "",
                customer_name: b.contact_details?.booker ? `${b.contact_details.booker.first_name || ""} ${b.contact_details.booker.last_name || ""}`.trim() : "",
                customer_email: b.contact_details?.booker?.email || "",
                vehicle_name: b.vehicle_details?.vehicle_name || "",
                driver_name: b.driver_details?.driver_name || "",
                booking_status: b.booking_status || "pending",
                payment_status: b.payment_status || "pending",
                estimated_price: b.vehicle_details?.estimated_price ?? null,
                source: b.source || "website",
            })),
        };
    } catch (error) {
        console.log("getBookingsReport error:", error);
        return { success: false, message: error.message || error };
    }
};

function csvEscape(value) {
    if (value === null || value === undefined) return "";
    const text = String(value);
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
}

exports.getBookingsCsv = async (query = {}) => {
    const report = await exports.getBookingsReport(query);
    if (!report.success) return report;
    const header = ["Booking ID", "Created", "Trip Date", "Pickup", "Dropoff", "Trip Type", "Customer", "Customer Email", "Vehicle", "Driver", "Booking Status", "Payment Status", "Estimated Price", "Source"];
    const lines = [header.join(",")];
    for (const b of report.bookings) {
        lines.push([
            b.id, b.created_at ? moment(b.created_at).format("YYYY-MM-DD") : "",
            b.trip_date ? moment(b.trip_date).format("YYYY-MM-DD") : "",
            b.pickup, b.dropoff, b.trip_type, b.customer_name, b.customer_email,
            b.vehicle_name, b.driver_name, b.booking_status, b.payment_status,
            b.estimated_price ?? "", b.source,
        ].map(csvEscape).join(","));
    }
    return { success: true, csv: lines.join("\n"), summary: report.summary, filter: report.filter };
};
