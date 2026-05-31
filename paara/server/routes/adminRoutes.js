const express = require("express");
const router  = express.Router();
const {
  getDashboard, getUsers, updateUser, toggleUserActive, deleteUser,
  getProducts, moderateProduct,
  getOrders,
  getSellers, verifySeller,
  getAnalytics, getFullStats,
  getAuditLog, getPlatformStats,
  getRegionLeaderboard,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes (no auth)
router.get("/leaderboard/regions", getRegionLeaderboard);

router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard",               getDashboard);
router.get("/stats",                   getFullStats);

// User management
router.get("/users",                   getUsers);
router.patch("/users/:id",             updateUser);
router.patch("/users/:id/toggle-active", toggleUserActive);
router.delete("/users/:id",            deleteUser);

// Product moderation
router.get("/products",                getProducts);
router.patch("/products/:id/moderate", moderateProduct);

// Orders
router.get("/orders",                  getOrders);

// Seller verification
router.get("/sellers",                 getSellers);
router.patch("/sellers/:id/verify",    verifySeller);

// Analytics
router.get("/analytics/overview",      getAnalytics);

// Audit log & platform stats
router.get("/audit-log",               getAuditLog);
router.get("/platform-stats",          getPlatformStats);

module.exports = router;
