const express = require("express");
const router  = express.Router();
const { getFieldResearchQueue, getFieldVisit, scheduleVisit, submitReport, getStats } = require("../controllers/fieldResearchController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);
router.get("/admin/field-research",             getFieldResearchQueue);
router.get("/admin/field-research/stats",       getStats);
router.get("/admin/field-research/:id",         getFieldVisit);
router.post("/admin/field-research/:id/schedule",scheduleVisit);
router.post("/admin/field-research/:id/report", submitReport);

module.exports = router;
