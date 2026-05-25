const express = require("express");
const router  = express.Router();
const { getFlaggedContent, flagReview, approveReview, deleteReview, warnUser } = require("../controllers/contentModerationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);
router.get("/admin/content/flagged",            getFlaggedContent);
router.post("/admin/content/flag-review/:id",   flagReview);
router.patch("/admin/content/approve-review/:id",approveReview);
router.delete("/admin/content/reviews/:id",     deleteReview);
router.post("/admin/content/warn-user/:id",     warnUser);

module.exports = router;
