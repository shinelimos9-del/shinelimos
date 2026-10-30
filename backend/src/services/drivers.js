const Driver = require("../models/driverModel");

const DRIVER_STATUS = ["active", "inactive"];

function validateDriverPayload(payload) {
  const missing = ["name", "phone", "license_number"].filter(
    (k) => !payload || payload[k] === undefined || String(payload[k]).trim() === ""
  );
  if (missing.length) return `Missing fields: ${missing.join(", ")}`;
  if (payload.status && !DRIVER_STATUS.includes(payload.status)) {
    return `Invalid status: ${payload.status}. Expected one of: ${DRIVER_STATUS.join(", ")}`;
  }
  return null;
}

exports.getAllDrivers = async (onlyActive = false) => {
  try {
    const filter = onlyActive ? { status: "active" } : {};
    const drivers = await Driver.find(filter).sort({ name: 1 });
    return { success: true, drivers };
  } catch (error) {
    console.log("getAllDrivers error:", error);
    return { success: false, message: error.message || error };
  }
};

exports.addDriver = async (payload) => {
  try {
    const error = validateDriverPayload(payload);
    if (error) return { success: false, message: error };
    const driver = await Driver.create({ ...payload, updated_at: Date.now() });
    return { success: true, message: "Driver added successfully", driver };
  } catch (error) {
    console.log("addDriver error:", error);
    return { success: false, message: error.message || error };
  }
};

exports.updateDriver = async (id, payload) => {
  try {
    const error = payload.status ? validateDriverPayload({ name: "x", phone: "x", license_number: "x", status: payload.status }) : null;
    if (error) return { success: false, message: error };
    const driver = await Driver.findByIdAndUpdate(
      id,
      { ...payload, updated_at: Date.now() },
      { new: true }
    );
    if (!driver) return { success: false, message: "Driver not found" };
    return { success: true, message: "Driver updated successfully", driver };
  } catch (error) {
    console.log("updateDriver error:", error);
    return { success: false, message: error.message || error };
  }
};

exports.deleteDriver = async (id) => {
  try {
    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) return { success: false, message: "Driver not found" };
    // Bookings keep their driver_name snapshot when a driver is deleted,
    // so trip history is not rewritten; only the live reference is gone.
    // (No cascade: deleting a driver must never delete bookings.)
    return { success: true, message: "Driver deleted successfully" };
  } catch (error) {
    console.log("deleteDriver error:", error);
    return { success: false, message: error.message || error };
  }
};
