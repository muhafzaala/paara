const express = require("express");
const router  = express.Router();
const { getPublicSellerProfile, getSellerDashboard, getSellerAnalytics, getSellerOrders, getAllSellerProfiles } = require("../controllers/sellerProfileController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.get("/shops/:id", getPublicSellerProfile);

// Seller (protected)
router.get("/seller/dashboard", protect, getSellerDashboard);
router.get("/seller/analytics", protect, getSellerAnalytics);
router.get("/seller/orders",    protect, getSellerOrders);

// Admin
router.get("/admin/seller-profiles", protect, adminOnly, getAllSellerProfiles);

module.exports = router;
