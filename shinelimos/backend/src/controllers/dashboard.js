const dashboardService = require("../services/dashboard");

exports.get_dashboardData = async (req, res) => {
    try {
        const result = await dashboardService.getDashboardStats();
        if (!result.success) return res.status(400).json(result);
        return res.status(200).json(result);
    } catch (error) {
        console.log("get_dashboardData controller error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
