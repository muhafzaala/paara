const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const SellerProfile = require("../models/SellerProfile");

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
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Please provide email and password" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated. Contact support." });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
