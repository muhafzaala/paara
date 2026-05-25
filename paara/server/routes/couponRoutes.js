const express = require("express");
const router  = express.Router();
const { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } = require("../controllers/couponController");
const { protect, adminOnly, optionalAuth } = require("../middleware/authMiddleware");

// Public with optional auth
router.post("/validate", optionalAuth, validateCoupon);

// Admin only
router.get("/",        protect, adminOnly, getAllCoupons);
router.post("/",       protect, adminOnly, createCoupon);
router.patch("/:id",   protect, adminOnly, updateCoupon);
router.delete("/:id",  protect, adminOnly, deleteCoupon);

module.exports = router;
