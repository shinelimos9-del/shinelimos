const driverService = require("../services/drivers");

exports.get_allDrivers = async (req, res) => {
  try {
    const result = await driverService.getAllDrivers(req.query.active === "true");
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("get_allDrivers controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.add_newDriver = async (req, res) => {
  try {
    const result = await driverService.addDriver(req.body || {});
    if (!result.success) return res.status(400).json(result);
    return res.status(201).json(result);
  } catch (error) {
    console.log("add_newDriver controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.update_driver = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Driver ID is required" });
    const result = await driverService.updateDriver(id, req.body || {});
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("update_driver controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.delete_driver = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Driver ID is required" });
    const result = await driverService.deleteDriver(id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log("delete_driver controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
