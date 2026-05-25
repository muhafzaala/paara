const express = require("express");
const router  = express.Router();
const { getSellerPayouts, requestPayout, getBalance, getAllPayouts, processPayout } = require("../controllers/payoutController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Seller routes
router.get("/payouts/seller",    protect, getSellerPayouts);
router.get("/payouts/balance",   protect, getBalance);
router.post("/payouts/request",  protect, requestPayout);

// Admin routes
router.get("/payouts/admin/all",          protect, adminOnly, getAllPayouts);
router.patch("/payouts/admin/:id/process",protect, adminOnly, processPayout);

module.exports = router;
