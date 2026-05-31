const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const SellerProfile = require("../models/SellerProfile");
const { notifyAllAdmins } = require("../utils/notify");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const u = user.toObject();
  delete u.password;
  res.status(statusCode).json({ success: true, token, user: u });
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// POST /api/v1/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, shopName, city } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email already registered" });

    const allowedRoles = ["buyer", "seller"];
    const userRole = allowedRoles.includes(role) ? role : "buyer";

    const otp = generateOtp();
    const user = await User.create({
      name, email, password,
      role: userRole,
      city: city || "",
      emailOtp: hashOtp(otp),
      emailOtpExpires: Date.now() + 10 * 60 * 1000, // 10 min
    });

    // Auto-create empty SellerProfile for seller-role registrations so
    // the onboarding wizard has a record to write into.
    if (user.role === "seller") {
      await SellerProfile.create({ user: user._id });
    }

    notifyAllAdmins({
      type: "new_user_registered",
      title: "New user registered",
      message: `${user.name} (${user.role}) created an account.`,
      link: "/admin/users",
    });

    // In production replace `otp` with an email send; never expose it in the response
    res.status(201).json({
      success: true,
      message: "Account created. Enter the OTP sent to your email to verify.",
      email: user.email,
      otp, // ⚠ DEV ONLY — remove when email sending is configured
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/auth/verify-email-otp
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const user = await User.findOne({
      email,
      emailOtp: hashOtp(otp),
      emailOtpExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/auth/resend-email-otp
exports.resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "No account with that email" });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: "Email already verified" });

    const otp = generateOtp();
    user.emailOtp = hashOtp(otp);
    user.emailOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: "New OTP sent to your email.",
      otp, // ⚠ DEV ONLY — remove when email sending is configured
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password +twoFactorSecret");
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    if (!user.isActive) return res.status(403).json({ success: false, message: "Account deactivated" });

    // Admin: require 2FA
    if (user.role === "admin") {
      if (user.adminStatus !== "active")
        return res.status(403).json({ success: false, message: `Admin ${user.adminStatus}` });

      if (user.twoFactorEnabled && user.twoFactorSecret) {
        // Admin has TOTP set up — challenge via authenticator app
        const challengeToken = jwt.sign(
          { sub: user._id, stage: "admin_totp" },
          process.env.JWT_SECRET, { expiresIn: "10m" }
        );
        return res.json({ success: true, twoFactor: true, stage: "totp", challengeToken, message: "Enter your authenticator code" });
      } else {
        // Admin has no TOTP yet — fall back to console OTP, flag setup required
        const { createOTP } = require("../utils/otp");
        await createOTP(user._id, "admin_2fa", "console", req.ip);
        const challengeToken = jwt.sign(
          { sub: user._id, stage: "admin_otp" },
          process.env.JWT_SECRET, { expiresIn: "10m" }
        );
        return res.json({ success: true, twoFactor: true, stage: "otp", mustSetupTOTP: true, challengeToken, message: "OTP sent to console" });
      }
    }

    // Seller / buyer: TOTP challenge if they have it enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const challengeToken = jwt.sign(
        { sub: user._id, stage: "user_totp", role: user.role },
        process.env.JWT_SECRET, { expiresIn: "10m" }
      );
      return res.json({ success: true, twoFactor: true, stage: "totp", challengeToken, message: "Enter your authenticator code" });
    }

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, twoFactorEnabled: user.twoFactorEnabled || false, city: user.city, addresses: user.addresses },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/v1/auth/verify-2fa  (console OTP path for admins without TOTP)
exports.verify2FA = async (req, res) => {
  try {
    const { challengeToken, code } = req.body;
    const decoded = jwt.verify(challengeToken, process.env.JWT_SECRET);
    // Accept both old "admin_2fa" and new "admin_otp" stage names
    if (!["admin_2fa", "admin_otp"].includes(decoded.stage))
      return res.status(400).json({ success: false, message: "Invalid challenge" });
    const { verifyOTP } = require("../utils/otp");
    await verifyOTP(decoded.sub, "admin_2fa", code);
    const user = await User.findById(decoded.sub);
    if (!user || user.role !== "admin" || user.adminStatus !== "active")
      return res.status(403).json({ success: false, message: "Not allowed" });
    const token = jwt.sign(
      { sub: user._id, role: user.role, twoFA: true },
      process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({
      success: true, token,
      mustSetupTOTP: !user.twoFactorEnabled,
      user: {
        _id: user._id, name: user.name, email: user.email, role: user.role,
        isPrimaryAdmin: user.isPrimaryAdmin,
        twoFactorEnabled: user.twoFactorEnabled || false,
        twoFactorRequired: user.twoFactorRequired || false,
      },
    });
  } catch (err) { res.status(err.status || 400).json({ success: false, message: err.message }); }
};

// POST /api/v1/auth/verify-totp  (authenticator app TOTP — admin, seller, buyer)
exports.verifyAdminTOTP = async (req, res) => {
  try {
    const { challengeToken, code } = req.body;
    const decoded = jwt.verify(challengeToken, process.env.JWT_SECRET);
    const validStages = ["admin_totp", "user_totp"];
    if (!validStages.includes(decoded.stage))
      return res.status(400).json({ success: false, message: "Invalid challenge" });

    const speakeasy = require("speakeasy");
    const user = await User.findById(decoded.sub).select("+twoFactorSecret");
    if (!user || !user.isActive)
      return res.status(403).json({ success: false, message: "Not allowed" });

    // Admin-specific extra check
    if (user.role === "admin" && user.adminStatus !== "active")
      return res.status(403).json({ success: false, message: `Admin account ${user.adminStatus}` });

    if (!user.twoFactorEnabled || !user.twoFactorSecret)
      return res.status(400).json({ success: false, message: "TOTP not configured for this account" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1,
    });
    if (!verified) return res.status(400).json({ success: false, message: "Invalid authenticator code" });

    const token = jwt.sign(
      { sub: user._id, role: user.role, twoFA: true },
      process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({
      success: true, token,
      user: {
        _id: user._id, name: user.name, email: user.email, role: user.role,
        avatar: user.avatar,
        isPrimaryAdmin: user.isPrimaryAdmin,
        twoFactorEnabled: true,
        twoFactorRequired: user.twoFactorRequired || false,
        city: user.city,
        addresses: user.addresses,
      },
    });
  } catch (err) { res.status(err.status || 400).json({ success: false, message: err.message }); }
};

// POST /api/v1/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { challengeToken, purpose = "admin_2fa" } = req.body;
    const decoded = jwt.verify(challengeToken, process.env.JWT_SECRET);
    const { createOTP } = require("../utils/otp");
    await createOTP(decoded.sub, purpose, "console", req.ip);
    res.json({ success: true, message: "Code resent" });
  } catch (err) { res.status(err.status || 400).json({ success: false, message: err.message }); }
};

// POST /api/v1/auth/request-otp  (authenticated)
exports.requestOTP = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
    const { purpose = "email_verify", channel = "console" } = req.body;
    const { createOTP } = require("../utils/otp");
    await createOTP(req.user._id, purpose, channel, req.ip);
    res.json({ success: true, message: "Code sent" });
  } catch (err) { res.status(err.status || 400).json({ success: false, message: err.message }); }
};

// POST /api/v1/auth/verify-otp  (authenticated)
exports.verifyGenericOTP = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
    const { code, purpose } = req.body;
    const { verifyOTP } = require("../utils/otp");
    await verifyOTP(req.user._id, purpose, code);
    res.json({ success: true });
  } catch (err) { res.status(err.status || 400).json({ success: false, message: err.message }); }
};

// GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/auth/logout
exports.logout = (req, res) => {
  res.json({ success: true, message: "Logged out" });
};

// POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: "No account with that email" });

    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    // In production: send email with reset link
    res.json({ success: true, message: "Password reset email sent (check console in dev)", resetToken: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: "Token expired or invalid" });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
