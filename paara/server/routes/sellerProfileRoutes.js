const express = require("express");
const router  = express.Router();
const { getPublicSellerProfile, getSellerDashboard, getSellerAnalytics, getSellerOrders, getAllSellerProfiles, getMyProfile, updateMyProfile, submitApplication, advanceVerification, awardBadge } = require("../controllers/sellerProfileController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.get("/shops/:id", getPublicSellerProfile);

// Seller (protected)
router.get("/seller/dashboard",                     protect, getSellerDashboard);
router.get("/seller/analytics",                     protect, getSellerAnalytics);
router.get("/seller/orders",                        protect, getSellerOrders);
router.get("/seller/profile",                       protect, getMyProfile);
router.patch("/seller/profile",                     protect, updateMyProfile);
router.post("/seller/profile/submit-application",   protect, submitApplication);

// Admin
router.get("/admin/seller-profiles",                    protect, adminOnly, getAllSellerProfiles);
router.patch("/admin/seller-profiles/:id/advance",      protect, adminOnly, advanceVerification);
router.patch("/admin/seller-profiles/:id/badges",       protect, adminOnly, awardBadge);

module.exports = router;
