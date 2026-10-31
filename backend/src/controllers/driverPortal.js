const driverPortalService = require("../services/driverPortal");

exports.driver_login = async (req, res) => {
  try {
    const result = await driverPortalService.loginDriver(
      req.body ? req.body.email : undefined,
      req.body ? req.body.password : undefined
    );
    if (!result.success) return res.status(401).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("driver_login controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.get_my_trips = async (req, res) => {
  try {
    const result = await driverPortalService.getMyTrips(req.driver._id);
    return res.status(200).json(result);
  } catch (error) {
    console.log("get_my_trips controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.get_my_trip = async (req, res) => {
  try {
    const result = await driverPortalService.getMyTrip(req.driver._id, req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("get_my_trip controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.update_my_trip_status = async (req, res) => {
  try {
    const result = await driverPortalService.advanceTripStatus(
      req.driver._id,
      req.params.id,
      req.body ? req.body.status : undefined
    );
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("update_my_trip_status controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
