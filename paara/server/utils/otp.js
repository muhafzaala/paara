const crypto = require("crypto");
const OTPVerification = require("../models/OTPVerification");

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

function gen6() { return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0"); }

async function createOTP(userId, purpose, channel = "console", ip) {
  const recent = await OTPVerification.findOne({ user: userId, purpose, consumed: false }).sort({ createdAt: -1 });
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())) / 1000);
    throw Object.assign(new Error(`Wait ${wait}s before requesting another code`), { status: 429 });
  }
  await OTPVerification.updateMany({ user: userId, purpose, consumed: false }, { consumed: true });
  const code = gen6();
  const doc = await OTPVerification.create({
    user: userId, code, purpose, channel,
    expiresAt: new Date(Date.now() + OTP_TTL_MS), ip,
  });
  await deliver(channel, userId, code, purpose);
  return doc;
}

async function verifyOTP(userId, purpose, code) {
  const otp = await OTPVerification.findOne({ user: userId, purpose, consumed: false }).sort({ createdAt: -1 });
  if (!otp) throw Object.assign(new Error("No active code. Request a new one."), { status: 400 });
  if (otp.expiresAt < new Date()) throw Object.assign(new Error("Code expired. Request a new one."), { status: 400 });
  if (otp.attempts >= MAX_ATTEMPTS) {
    otp.consumed = true; await otp.save();
    throw Object.assign(new Error("Too many attempts. Request a new code."), { status: 429 });
  }
  otp.attempts++;
  if (otp.code !== code) { await otp.save(); throw Object.assign(new Error("Invalid code"), { status: 400 }); }
  otp.consumed = true; await otp.save();
  return true;
}

async function deliver(channel, userId, code, purpose) {
  if (channel === "console" || process.env.NODE_ENV !== "production") {
    console.log(`\n📨 [OTP] user=${userId} purpose=${purpose} code=${code}\n`);
  }
  // TODO: hook email (nodemailer) / sms (twilio) here when keys provided
}

module.exports = { createOTP, verifyOTP };
