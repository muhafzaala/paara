const express = require("express");
const router  = express.Router();
const { register, login, getMe, logout, forgotPassword, resetPassword, verifyEmailOtp, resendEmailOtp } = require("../controllers/authController");
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

// 2FA
router.post("/2fa/setup",    protect, setup2FA);
router.post("/2fa/verify",   protect, verify2FA);
router.post("/2fa/disable",  protect, disable2FA);
router.post("/2fa/validate", validate2FA);

module.exports = router;
