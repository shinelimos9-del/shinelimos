// SMS sender for the driver app (v1, phone + texted login code).
//
// Provider abstraction — credentials ONLY from environment variables,
// never hardcoded and never written to any file:
//   Zadarma (first):  ZADARMA_KEY, ZADARMA_SECRET, SMS_SENDER (optional
//                     caller_id / SenderID — a verified Zadarma number or
//                     registered text SenderID; omit to use the default)
//   Twilio (fallback): TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
//
// If neither provider is configured, sendSms() throws SmsNotConfigured
// and the caller must fail cleanly — a login code is NEVER logged or
// returned in any response, so there is no dev-mode fallback that
// prints the code.
//
// Zadarma auth (per Zadarma API docs, /v1/sms/send/):
//   params are sorted alphabetically, paramsString is the URL-encoded
//   key=value pairs joined by "&", md5Params = md5(paramsString),
//   signature = base64(HMAC-SHA1(method + paramsString + md5Params,
//   secret)), header: Authorization: {key}:{signature}
//   method is the endpoint path, e.g. "/v1/sms/send/".
//   Params: number (digits, country code included), message,
//   caller_id (optional).
const axios = require("axios");
const crypto = require("crypto");

const ZADARMA_API_BASE = "https://api.zadarma.com";

class SmsNotConfigured extends Error {
  constructor() {
    super("No SMS provider is configured.");
    this.name = "SmsNotConfigured";
    this.code = "SMS_NOT_CONFIGURED";
  }
}

function isSmsConfigured() {
  if (process.env.ZADARMA_KEY && process.env.ZADARMA_SECRET) return true;
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  ) {
    return true;
  }
  return false;
}

// Pure helper (exported for testing): build the Zadarma Authorization
// header for a POST to `method` with `params` (plain object).
function zadarmaAuthHeader(key, secret, method, params) {
  const sortedKeys = Object.keys(params).sort();
  const paramsString = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
  const md5Params = crypto.createHash("md5").update(paramsString).digest("hex");
  const signatureString = method + paramsString + md5Params;
  const signature = crypto
    .createHmac("sha1", secret)
    .update(signatureString)
    .digest("base64");
  return `${key}:${signature}`;
}

async function sendViaZadarma(to, message) {
  const key = process.env.ZADARMA_KEY;
  const secret = process.env.ZADARMA_SECRET;
  const method = "/v1/sms/send/";
  const params = {
    number: String(to).replace(/\D/g, ""),
    message,
  };
  if (process.env.SMS_SENDER) params.caller_id = process.env.SMS_SENDER;
  const auth = zadarmaAuthHeader(key, secret, method, params);
  const body = new URLSearchParams(params).toString();
  const res = await axios.post(`${ZADARMA_API_BASE}${method}`, body, {
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: 15000,
  });
  // Zadarma answers { status: "success", ... } on accepted sends.
  if (!res.data || res.data.status !== "success") {
    throw new Error(
      `Zadarma SMS send failed: ${JSON.stringify(res.data || {})}`
    );
  }
  return { provider: "zadarma", response: res.data };
}

async function sendViaTwilio(to, message) {
  // Twilio client is created lazily so the module loads even when Twilio
  // is not configured (Zadarma-first deployments never touch it).
  const twilio = require("twilio");
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  const res = await client.messages.create({
    body: message,
    from: process.env.TWILIO_FROM,
    to,
  });
  return { provider: "twilio", sid: res.sid };
}

// Send a plain-text SMS. Provider order: Zadarma first, Twilio fallback.
// Throws SmsNotConfigured when neither is configured; throws on send
// failure so the caller can fail cleanly (never fall back to logging
// or returning the message content).
async function sendSms(to, message) {
  if (!to || !message) throw new Error("SMS recipient and message are required.");
  if (process.env.ZADARMA_KEY && process.env.ZADARMA_SECRET) {
    return sendViaZadarma(to, message);
  }
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  ) {
    return sendViaTwilio(to, message);
  }
  throw new SmsNotConfigured();
}

module.exports = {
  SmsNotConfigured,
  isSmsConfigured,
  zadarmaAuthHeader,
  sendSms,
};
