const express = require("express");
const router = express.Router();
const {
  applyForVerification, addDocument, getMyStatus, submitAppeal,
  getAdminStats, getAllApplications, getApplication,
  advanceStage, rejectApplication, suspendSeller, assignReviewer,
  addNote, scheduleFieldVisit, submitFieldReport, assignBadge, reviewAppeal,
} = require("../controllers/verificationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Seller routes
router.post("/apply",      protect, applyForVerification);
router.post("/documents",  protect, addDocument);
router.get("/my-status",   protect, getMyStatus);
router.post("/appeal",     protect, submitAppeal);

// Admin routes
router.get("/admin/stats",             protect, adminOnly, getAdminStats);
router.get("/admin/all",               protect, adminOnly, getAllApplications);
router.get("/admin/:id",               protect, adminOnly, getApplication);
router.patch("/admin/:id/advance",     protect, adminOnly, advanceStage);
router.patch("/admin/:id/reject",      protect, adminOnly, rejectApplication);
router.patch("/admin/:id/suspend",     protect, adminOnly, suspendSeller);
router.patch("/admin/:id/assign",      protect, adminOnly, assignReviewer);
router.post("/admin/:id/note",         protect, adminOnly, addNote);
router.patch("/admin/:id/field",       protect, adminOnly, scheduleFieldVisit);
router.post("/admin/:id/field-report", protect, adminOnly, submitFieldReport);
router.patch("/admin/:id/badge",       protect, adminOnly, assignBadge);
router.patch("/admin/:id/appeal",      protect, adminOnly, reviewAppeal);

module.exports = router;
