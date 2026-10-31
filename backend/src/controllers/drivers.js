const bcrypt = require("bcryptjs");
const Driver = require("../models/driverModel");

// Phase 2: only these fields may be written from an admin payload, and
// the password hash is never returned. `password` in a payload is
// hashed into password_hash; an empty/absent password leaves the
// existing hash untouched. `has_login` tells the admin UI whether this
// driver can log in yet, without exposing the hash.
const DRIVER_WRITABLE = ["name", "phone", "email", "license_number", "license_expiry", "status", "notes", "photo"];

function sanitizeDriver(driver) {
  if (!driver) return driver;
  const obj = typeof driver.toObject === "function" ? driver.toObject() : { ...driver };
  const has_login = Boolean(obj.password_hash);
  delete obj.password_hash;
  delete obj.password;
  return { ...obj, has_login };
}

async function applyDriverPayload(doc, payload) {
  for (const key of DRIVER_WRITABLE) {
    if (payload[key] !== undefined) doc[key] = payload[key];
  }
  if (payload.password !== undefined && String(payload.password).trim() !== "") {
    doc.password_hash = await bcrypt.hash(String(payload.password), 10);
  }
  doc.updated_at = Date.now();
  return doc;
}

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
    return { success: true, drivers: drivers.map(sanitizeDriver) };
  } catch (error) {
    console.log("getAllDrivers error:", error);
    return { success: false, message: error.message || error };
  }
};

exports.addDriver = async (payload) => {
  try {
    const error = validateDriverPayload(payload);
    if (error) return { success: false, message: error };
    const driver = new Driver();
    await applyDriverPayload(driver, payload);
    await driver.save();
    return { success: true, message: "Driver added successfully", driver: sanitizeDriver(driver) };
  } catch (error) {
    console.log("addDriver error:", error);
    return { success: false, message: error.message || error };
  }
};

exports.updateDriver = async (id, payload) => {
  try {
    const error = payload.status ? validateDriverPayload({ name: "x", phone: "x", license_number: "x", status: payload.status }) : null;
    if (error) return { success: false, message: error };
    const driver = await Driver.findById(id);
    if (!driver) return { success: false, message: "Driver not found" };
    await applyDriverPayload(driver, payload);
    await driver.save();
    return { success: true, message: "Driver updated successfully", driver: sanitizeDriver(driver) };
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
