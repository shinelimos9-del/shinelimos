// Driver app v1 — phone + texted code, thin controllers.
// The generic / rate-limit messages come from the service; the controller
// only maps them to status codes (429 for rate limits, 200 for the
// generic request-code answer even when no driver matches, so the
// response cannot be used to probe which drivers exist).
const driverOtpService = require("../services/driverOtp");

exports.request_code = async (req, res) => {
  try {
    const result = await driverOtpService.requestDriverCode(
      req.body ? req.body.phone : undefined
    );
    if (!result.success && result.message && result.message.startsWith("Too many")) {
      return res.status(429).json(result);
    }
    if (!result.success && result.sms_configured === false) {
      return res.status(503).json(result);
    }
    if (!result.success && result.message === "We could not send the code. Please try again or contact dispatch.") {
      return res.status(502).json(result);
    }
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("request_code controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.verify_code = async (req, res) => {
  try {
    const result = await driverOtpService.verifyDriverCode(
      req.body ? req.body.phone : undefined,
      req.body ? req.body.code : undefined
    );
    if (!result.success && result.message && result.message.startsWith("Too many")) {
      return res.status(429).json(result);
    }
    if (!result.success) return res.status(401).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("verify_code controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
