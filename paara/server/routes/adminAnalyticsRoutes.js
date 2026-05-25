const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
router.get("/admin/analytics/overview", protect, adminOnly, getAnalytics);
module.exports = router;
