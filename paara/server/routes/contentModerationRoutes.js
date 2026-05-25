const express = require("express");
const router  = express.Router();
const { getFlaggedContent, flagReview, approveReview, deleteReview, warnUser } = require("../controllers/contentModerationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/admin/content/flagged",              protect, adminOnly, getFlaggedContent);
router.post("/admin/content/flag-review/:id",     protect, adminOnly, flagReview);
router.patch("/admin/content/approve-review/:id", protect, adminOnly, approveReview);
router.delete("/admin/content/reviews/:id",       protect, adminOnly, deleteReview);
router.post("/admin/content/warn-user/:id",       protect, adminOnly, warnUser);

module.exports = router;
