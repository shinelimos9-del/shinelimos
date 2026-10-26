const gnetService = require("../services/gnet");

// POST /api/gnet/receive — single GNet farm-in endpoint (NEW / UPDATE / CANCEL).
// The JSON body IS the acknowledgement GNet reads, so refused trips return
// { success: false, message } with HTTP 200, never a silent accept.
exports.receive = async (req, res) => {
	try {
		const auth = gnetService.checkGnetAuth(req);
		if (!auth.ok) return res.status(auth.status).json({ success: false, message: auth.message });

		const result = await gnetService.receive(req);
		return res.status(result.httpStatus || 200).json(result.body);
	} catch (error) {
		console.log("gnet receive controller error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};
