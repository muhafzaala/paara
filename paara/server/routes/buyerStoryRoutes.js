const express = require("express");
const router = express.Router();
const {
  submit, listApproved, listMine, listForModeration, review,
} = require("../controllers/buyerStoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.get("/buyer-stories",              listApproved);

// Buyer (protected)
router.post("/buyer-stories",             protect, submit);
router.get("/buyer-stories/mine",         protect, listMine);

// Admin
router.get("/admin/buyer-stories",        protect, adminOnly, listForModeration);
router.patch("/admin/buyer-stories/:id/review", protect, adminOnly, review);

module.exports = router;
