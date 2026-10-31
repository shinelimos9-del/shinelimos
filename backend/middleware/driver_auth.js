// Phase 2 — driver auth middleware. Separate from admin auth on purpose:
// a driver token must never open an admin route, and an admin token must
// never open a driver route. The token must carry role: "driver" and its
// id must belong to an active driver record.
const jwt = require("jsonwebtoken");
const driver_model = require("../src/models/driverModel");

async function driver_auth(req, res, next) {
  try {
    const tokenHead = req.headers["authorization"];
    if (!tokenHead) {
      return res.status(401).json({ message: "Authorization header is missing", success: false });
    }
    const token = tokenHead.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Driver is not logged in", success: false });
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode || decode.role !== "driver") {
      return res.status(403).json({ message: "Driver access only", success: false });
    }
    const driver = await driver_model.findById(decode.id).exec();
    if (!driver) return res.status(403).json({ message: "Driver not found", success: false });
    if (driver.status !== "active") {
      return res.status(403).json({ message: "Driver account is inactive", success: false });
    }
    req.driver = driver;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: error.message || "Invalid driver token", success: false });
  }
}

module.exports = driver_auth;
