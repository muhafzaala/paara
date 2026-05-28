const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  code: { type: String, required: true },
  purpose: { type: String, enum: ["login", "register", "password_reset", "admin_2fa", "email_verify"], required: true },
  channel: { type: String, enum: ["email", "sms", "console"], default: "console" },
  expiresAt: { type: Date, required: true, index: true },
  consumed: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  ip: String,
}, { timestamps: true });
schema.index({ user: 1, purpose: 1, consumed: 1, createdAt: -1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("OTPVerification", schema);
