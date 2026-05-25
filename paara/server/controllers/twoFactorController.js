const speakeasy = require("speakeasy");
const QRCode    = require("qrcode");
const User      = require("../models/User");

// POST /api/v1/auth/2fa/setup  — Generate secret & QR code
exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name:   `PAARA (${req.user.email})`,
      issuer: "PAARA Heritage Marketplace",
      length: 32,
    });

    // Store temp secret (not enabled yet)
    await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret.base32 });

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ success: true, secret: secret.base32, qrCode: qrDataUrl, otpauthUrl: secret.otpauth_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/auth/2fa/verify  — Verify token & enable 2FA
exports.verify2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+twoFactorSecret");
    if (!user.twoFactorSecret)
      return res.status(400).json({ success: false, message: "2FA not set up. Call /setup first." });

    const verified = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: "base32",
      token:    req.body.token,
      window:   1,
    });

    if (!verified) return res.status(400).json({ success: false, message: "Invalid code. Please try again." });

    user.twoFactorEnabled = true;
    await user.save();
    res.json({ success: true, message: "2FA enabled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/auth/2fa/disable  — Disable 2FA (requires password)
exports.disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password +twoFactorSecret");
    if (!user.twoFactorEnabled)
      return res.status(400).json({ success: false, message: "2FA is not enabled" });

    const passwordOk = await user.matchPassword(req.body.password);
    if (!passwordOk) return res.status(401).json({ success: false, message: "Incorrect password" });

    user.twoFactorEnabled = false;
    user.twoFactorSecret  = undefined;
    await user.save();
    res.json({ success: true, message: "2FA disabled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/auth/2fa/validate  — Validate during login (if 2FA is on)
exports.validate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).select("+twoFactorSecret");
    if (!user || !user.twoFactorEnabled)
      return res.status(400).json({ success: false, message: "2FA not enabled for this user" });

    const verified = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: "base32",
      token:    req.body.token,
      window:   1,
    });

    if (!verified) return res.status(400).json({ success: false, message: "Invalid 2FA code" });

    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });
    const u = user.toObject(); delete u.password; delete u.twoFactorSecret;
    res.json({ success: true, token, user: u });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
