const dashboardService = require("../services/dashboard");

exports.get_dashboardData = async (req, res) => {
    try {
        const result = await dashboardService.getDashboardStats(req.query || {});
        if (!result.success) return res.status(400).json(result);
        return res.status(200).json(result);
    } catch (error) {
        console.log("get_dashboardData controller error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.get_bookingsReport = async (req, res) => {
    try {
        const result = await dashboardService.getBookingsReport(req.query || {});
        if (!result.success) return res.status(400).json(result);
        return res.status(200).json(result);
    } catch (error) {
        console.log("get_bookingsReport controller error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.export_bookingsCsv = async (req, res) => {
    try {
        const result = await dashboardService.getBookingsCsv(req.query || {});
        if (!result.success) return res.status(400).json(result);
        const from = req.query.from || "all";
        const to = req.query.to || "all";
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="shine-limos-bookings-${from}-to-${to}.csv"`);
        return res.status(200).send(result.csv);
    } catch (error) {
        console.log("export_bookingsCsv controller error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
