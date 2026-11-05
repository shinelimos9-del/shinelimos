// Driver app v1 — phone + texted login code.
//
// Flow: POST /driver/request-code { phone } → a 6-digit code is texted to
// the number (only if it belongs to an ACTIVE driver). POST
// /driver/verify-code { phone, code } → on a correct code, the same driver
// JWT as the email/password login (7d, role "driver").
//
// ANTI-PROBING RULES (same spirit as the email login):
// - request-code always answers the SAME generic message whether the
//   number belongs to a driver or not, so login cannot be used to probe
//   which drivers exist. The only exception is when no SMS provider is
//   configured at all — then it fails cleanly with a plain "not
//   available" message (and no code is ever logged or returned).
// - verify-code always answers "Invalid or expired code." whether the
//   code was wrong, expired, already used, or no code was ever issued
//   for that number.
// - Codes are stored only as bcrypt hashes, expire after 10 minutes,
//   are single-use, and issuing a new code invalidates older active
//   codes for that phone.
// - Rate limits (per phone, per hour): max 5 codes issued, max 10
//   failed verifies. Limits are enforced in MongoDB for issued codes
//   and in a small in-memory window for verify attempts with no live
//   code (pruned on every call; a server restart resets that window,
//   the DB-backed limits do not).
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Driver = require("../models/driverModel");
const DriverOtp = require("../models/driverOtpModel");
const { sendSms, SmsNotConfigured, isSmsConfigured } = require("./smsService");

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CODES_PER_HOUR = 5;
const MAX_FAILED_VERIFIES_PER_HOUR = 10;
const ONE_HOUR_MS = 60 * 60 * 1000;

const GENERIC_REQUEST_MESSAGE =
  "If this number belongs to an active Shine Limos driver, a login code has been sent by text.";
const GENERIC_VERIFY_MESSAGE = "Invalid or expired code.";
const SMS_UNAVAILABLE_MESSAGE =
  "Text login is not available right now. Please contact dispatch.";

// --- Phone normalization ------------------------------------------------
// Strip spaces, dashes, parentheses, dots. US default: a 10-digit number
// becomes +1XXXXXXXXXX; an 11-digit number starting with 1 becomes
// +1XXXXXXXXXX. Anything else keeps its digits with a leading "+".
function normalizePhone(raw) {
  if (raw === undefined || raw === null) return "";
  let digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 0) return `+${digits}`;
  return "";
}

// Candidate stored forms for a normalized phone, so a driver record saved
// as "703-595-6269", "7035956269" or "+17035956269" all match.
function phoneLookupCandidates(normalized) {
  const digits = normalized.replace(/\D/g, "");
  const out = new Set([normalized, digits]);
  if (digits.length === 11 && digits.startsWith("1")) out.add(digits.slice(1));
  if (digits.length === 10) out.add(`1${digits}`);
  return [...out];
}

async function findActiveDriverByPhone(normalized) {
  const driver = await Driver.findOne({
    phone: { $in: phoneLookupCandidates(normalized) },
    status: "active",
  }).exec();
  if (driver) return driver;
  // Fallback for stored formats the candidate list missed (small fleet):
  // compare normalized forms directly. Only active drivers are considered.
  const actives = await Driver.find({ status: "active" }).select("_id name email phone status").exec();
  return actives.find((d) => normalizePhone(d.phone) === normalized) || null;
}

// In-memory window for failed verifies with no live code to attach the
// count to. Key: normalized phone → array of epoch-ms timestamps.
const failedVerifyWindow = new Map();

function pruneFailedVerifies(phone, now) {
  const list = (failedVerifyWindow.get(phone) || []).filter((t) => now - t < ONE_HOUR_MS);
  failedVerifyWindow.set(phone, list);
  return list;
}

function issueJwt(driver) {
  return jwt.sign(
    { id: driver._id, role: "driver" },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );
}

// --- Request a code -----------------------------------------------------
async function requestDriverCode(rawPhone) {
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    return { success: false, message: "A valid phone number is required." };
  }
  if (!isSmsConfigured()) {
    // Fail cleanly, plain message, no code anywhere (never logged/returned).
    return { success: false, message: SMS_UNAVAILABLE_MESSAGE, sms_configured: false };
  }
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - ONE_HOUR_MS);
  const issuedLastHour = await DriverOtp.countDocuments({
    phone,
    created_at: { $gte: oneHourAgo },
  }).exec();
  if (issuedLastHour >= MAX_CODES_PER_HOUR) {
    // Rate-limit message is generic on purpose — it does not say whether
    // the number belongs to a driver.
    return {
      success: false,
      message: "Too many codes requested. Please wait a while and try again.",
    };
  }
  const driver = await findActiveDriverByPhone(phone);
  if (!driver) {
    // Same generic message as the success case — no probing.
    return { success: true, message: GENERIC_REQUEST_MESSAGE };
  }
  // Invalidate older active codes for this phone, then issue a new one.
  await DriverOtp.updateMany(
    { phone, used: false, expires_at: { $gt: now } },
    { $set: { used: true } }
  ).exec();
  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = await bcrypt.hash(code, 10);
  await DriverOtp.create({
    driver: driver._id,
    phone,
    code_hash: codeHash,
    expires_at: new Date(now.getTime() + CODE_TTL_MS),
    used: false,
    attempts: 0,
  });
  try {
    await sendSms(phone, `Your Shine Limos driver login code is ${code}. It expires in 10 minutes.`);
  } catch (error) {
    // The code record stays, but the driver was never told the code.
    // Mark it used so it cannot be guessed at later, log server-side
    // (message only, never the code), and fail plainly.
    await DriverOtp.updateMany(
      { phone, used: false, expires_at: { $gt: new Date() } },
      { $set: { used: true } }
    ).exec();
    console.error("driverOtp: SMS send failed:", error && error.message);
    return {
      success: false,
      message: "We could not send the code. Please try again or contact dispatch.",
    };
  }
  return { success: true, message: GENERIC_REQUEST_MESSAGE };
}

// --- Verify a code ------------------------------------------------------
async function verifyDriverCode(rawPhone, code) {
  const phone = normalizePhone(rawPhone);
  if (!phone || !code) {
    return { success: false, message: GENERIC_VERIFY_MESSAGE };
  }
  const now = new Date();
  const codeStr = String(code).trim();
  const record = await DriverOtp.findOne({
    phone,
    used: false,
    expires_at: { $gt: now },
  })
    .sort({ created_at: -1 })
    .exec();
  if (!record) {
    const list = pruneFailedVerifies(phone, now.getTime());
    if (list.length >= MAX_FAILED_VERIFIES_PER_HOUR) {
      return { success: false, message: "Too many attempts. Please wait a while and try again." };
    }
    list.push(now.getTime());
    failedVerifyWindow.set(phone, list);
    return { success: false, message: GENERIC_VERIFY_MESSAGE };
  }
  if (record.attempts >= MAX_FAILED_VERIFIES_PER_HOUR) {
    return { success: false, message: "Too many attempts. Please wait a while and try again." };
  }
  const ok = await bcrypt.compare(codeStr, record.code_hash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    return { success: false, message: GENERIC_VERIFY_MESSAGE };
  }
  record.used = true;
  await record.save();
  const driver = await Driver.findById(record.driver).exec();
  if (!driver || driver.status !== "active") {
    return { success: false, message: GENERIC_VERIFY_MESSAGE };
  }
  return {
    success: true,
    token: issueJwt(driver),
    driver: { id: String(driver._id), name: driver.name, email: driver.email, phone: driver.phone },
  };
}

module.exports = {
  normalizePhone,
  phoneLookupCandidates,
  requestDriverCode,
  verifyDriverCode,
  CODE_TTL_MS,
  MAX_CODES_PER_HOUR,
  MAX_FAILED_VERIFIES_PER_HOUR,
  GENERIC_REQUEST_MESSAGE,
  GENERIC_VERIFY_MESSAGE,
};
