const Booking = require("../models/bookingModel");
const moment = require("moment");

exports.getDashboardStats = async () => {
    try {
        const now = moment();
        const startOfMonth = now.clone().startOf('month').toDate();
        const startOfLastMonth = now.clone().subtract(1, 'month').startOf('month').toDate();
        const endOfLastMonth = now.clone().subtract(1, 'month').endOf('month').toDate();

        // 1. Overview Stats
        const totalBookings = await Booking.countDocuments();
        const lastMonthBookings = await Booking.countDocuments({ created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
        
        const uniqueCustomers = await Booking.distinct("contact_details.booker.email");
        const totalNewCustomers = uniqueCustomers.length;

        const totalEarningResult = await Booking.aggregate([
            { $group: { _id: null, total: { $sum: "$vehicle_details.estimated_price" } } }
        ]);
        const totalEarning = totalEarningResult.length > 0 ? totalEarningResult[0].total : 0;

        // Trends (Simple calculation vs last month)
        const bookingTrend = lastMonthBookings === 0 ? 100 : ((totalBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(2);

        // 2. Revenue Overview (Monthly)
        const revenueOverview = await Booking.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$created_at" }, year: { $year: "$created_at" } },
                    revenue: { $sum: "$vehicle_details.estimated_price" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 3. Total Trips Status
        const completeTrips = await Booking.countDocuments({ booking_status: "completed" });
        const pendingTrips = await Booking.countDocuments({ booking_status: "pending" });
        
        const totalStatus = completeTrips + pendingTrips || 1; // avoid div by zero

        // 4. Top Destinations
        const topDestinations = await Booking.aggregate([
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
        const recentBookings = await Booking.find()
            .sort({ created_at: -1 })
            .limit(10);

        return {
            success: true,
            overview: {
                total_booking: { value: totalBookings, trend: `+${bookingTrend}%` },
                total_new_customers: { value: totalNewCustomers, trend: "-0.03%" }, // Placeholder trend
                total_earning: { value: totalEarning, trend: "+6.08%" } // Placeholder trend
            },
            revenue_overview: {
                this_year: revenueOverview.filter(r => r._id.year === now.year()).map(r => ({ month: moment().month(r._id.month - 1).format("MMM"), revenue: r.revenue })),
                last_year: revenueOverview.filter(r => r._id.year === now.year() - 1).map(r => ({ month: moment().month(r._id.month - 1).format("MMM"), revenue: r.revenue }))
            },
            trip_summary: [
                { name: "Complete", sales: ((completeTrips / totalStatus) * 100).toFixed(0), count: completeTrips },
                { name: "Pending", sales: ((pendingTrips / totalStatus) * 100).toFixed(0), count: pendingTrips }
            ],
            top_destinations: topDestinations.map(d => ({
                name: d._id,
                percentage: ((d.count / totalBookings) * 100).toFixed(1)
            })),
            recent_bookings: recentBookings.map(b => ({
                id: b._id,
                name: b.contact_details?.booker ? `${b.contact_details.booker.first_name || ""} ${b.contact_details.booker.last_name || ""}`.trim() || "Unknown" : "Unknown",
                email: b.contact_details?.booker?.email || "N/A",
                trip: b.trip_details?.[0]?.trip_type || "N/A",
                date: moment(b.created_at).format("DD MMM YYYY"),
                price: b.vehicle_details?.estimated_price ? `$${b.vehicle_details.estimated_price}` : "N/A",
                phone: b.contact_details?.booker?.primary_phone?.number || "N/A",
                status: b.booking_status || "pending"
            }))
        };
    } catch (error) {
        console.log("getDashboardStats error:", error);
        return { success: false, message: error.message || error };
    }
};
