const express = require("express");
const router  = express.Router();
const { register, login, getMe, logout, forgotPassword, resetPassword, verifyEmailOtp, resendEmailOtp, verify2FA: verifyAdmin2FA, resendOTP, requestOTP, verifyGenericOTP } = require("../controllers/authController");
const { setup2FA, verify2FA, disable2FA, validate2FA } = require("../controllers/twoFactorController");
const { protect } = require("../middleware/authMiddleware");

// Auth
router.post("/register",              register);
router.post("/verify-email-otp",      verifyEmailOtp);
router.post("/resend-email-otp",      resendEmailOtp);
router.post("/login",                 login);
router.post("/logout",              protect, logout);
router.get("/me",                   protect, getMe);
router.post("/forgot-password",     forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Admin 2FA challenge (unauthenticated — uses challengeToken)
router.post("/verify-2fa",   verifyAdmin2FA);
router.post("/resend-otp",   resendOTP);

// Authenticated OTP (email verify, etc.)
router.post("/request-otp",  protect, requestOTP);
router.post("/verify-otp",   protect, verifyGenericOTP);

// Prefixed aliases (for clients that include /auth/ in the path)
router.post("/auth/verify-2fa",    verifyAdmin2FA);
router.post("/auth/resend-otp",    resendOTP);
router.post("/auth/otp/request",   protect, requestOTP);
router.post("/auth/otp/verify",    protect, verifyGenericOTP);

// TOTP 2FA (existing)
router.post("/2fa/setup",    protect, setup2FA);
router.post("/2fa/verify",   protect, verify2FA);
router.post("/2fa/disable",  protect, disable2FA);
router.post("/2fa/validate", validate2FA);

module.exports = router;
