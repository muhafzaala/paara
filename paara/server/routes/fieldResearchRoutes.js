const express = require("express");
const router  = express.Router();
const { getFieldResearchQueue, getFieldVisit, scheduleVisit, submitReport, getStats } = require("../controllers/fieldResearchController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/admin/field-research",               protect, adminOnly, getFieldResearchQueue);
router.get("/admin/field-research/stats",         protect, adminOnly, getStats);
router.get("/admin/field-research/:id",           protect, adminOnly, getFieldVisit);
router.post("/admin/field-research/:id/schedule", protect, adminOnly, scheduleVisit);
router.post("/admin/field-research/:id/report",   protect, adminOnly, submitReport);

module.exports = router;
