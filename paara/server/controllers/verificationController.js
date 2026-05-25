const User = require("../models/User");
const { SellerVerification } = require("../models/extras");
const { createNotification } = require("../utils/notificationHelper");

// POST /api/v1/verification/apply
exports.applyForVerification = async (req, res) => {
  try {
    const { businessName, businessType, craftSpecialization, city, region, cnicNumber, workshopAddress, yearsOfExperience } = req.body;

    const existing = await SellerVerification.findOne({ seller: req.user._id });
    if (existing && ["approved", "under_review"].includes(existing.stage))
      return res.status(400).json({ success: false, message: `Application already ${existing.stage}` });

    const verification = await SellerVerification.findOneAndUpdate(
      { seller: req.user._id },
      { seller: req.user._id, businessName, businessType, craftSpecialization, city, region, cnicNumber, workshopAddress, yearsOfExperience: Number(yearsOfExperience) || 0, stage: "applied" },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user._id, { verificationStatus: "pending" });

    res.status(201).json({ success: true, verification, message: "Application submitted. Our team will review within 3–5 business days." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/v1/verification/documents — upload additional documents link
exports.addDocument = async (req, res) => {
  try {
    const { type, url } = req.body;
    if (!type || !url) return res.status(400).json({ success: false, message: "type and url required" });

    const v = await SellerVerification.findOneAndUpdate(
      { seller: req.user._id },
      { $push: { documents: { type, url, uploadedAt: new Date(), status: "pending" } } },
      { new: true, upsert: true }
    );
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/v1/verification/my-status
exports.getMyStatus = async (req, res) => {
  try {
    const v = await SellerVerification.findOne({ seller: req.user._id });
    res.json({ success: true, verification: v, verificationStatus: req.user.verificationStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/verification/appeal
exports.submitAppeal = async (req, res) => {
  try {
    const v = await SellerVerification.findOne({ seller: req.user._id });
    if (!v || v.stage !== "rejected")
      return res.status(400).json({ success: false, message: "Appeal only available for rejected applications" });
    v.appeal = { text: req.body.text, submittedAt: new Date() };
    v.stage = "applied";
    await v.save();
    await User.findByIdAndUpdate(req.user._id, { verificationStatus: "pending" });
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Admin endpoints ───────────────────────────────────────────

// GET /api/v1/verification/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const stats = await SellerVerification.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);
    const total = await SellerVerification.countDocuments();
    const approved = await SellerVerification.countDocuments({ stage: "approved" });
    res.json({ success: true, stats, total, approvalRate: total ? Math.round((approved / total) * 100) : 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/verification/admin/all
exports.getAllApplications = async (req, res) => {
  try {
    const { stage, page = 1, limit = 20 } = req.query;
    const query = stage ? { stage } : {};
    const total = await SellerVerification.countDocuments(query);
    const verifications = await SellerVerification.find(query)
      .populate("seller", "name email shopName city phone createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ success: true, verifications, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/verification/admin/:id
exports.getApplication = async (req, res) => {
  try {
    const v = await SellerVerification.findById(req.params.id).populate("seller", "name email shopName city phone").populate("reviewedBy", "name email");
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/verification/admin/:id/advance
exports.advanceStage = async (req, res) => {
  try {
    const STAGES = ["applied", "document_review", "field_visit_scheduled", "approved"];
    const v = await SellerVerification.findById(req.params.id);
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });

    const currentIdx = STAGES.indexOf(v.stage);
    const nextStage = req.body.stage || STAGES[Math.min(currentIdx + 1, STAGES.length - 1)];
    v.stage = nextStage;
    v.reviewedBy = req.user._id;
    v.reviewedAt = new Date();
    if (req.body.notes) v.notes.push({ text: req.body.notes, by: req.user._id });
    await v.save();

    // Update user verification status
    const statusMap = { applied: "pending", document_review: "under_review", field_visit_scheduled: "field_visit", approved: "approved" };
    await User.findByIdAndUpdate(v.seller, { verificationStatus: statusMap[nextStage] || "pending" });

    if (nextStage === "approved") {
      await createNotification({ user: v.seller, type: "verification", title: "Application Approved!", message: "Congratulations! Your PAARA seller application has been approved. You can now list products." });
    }

    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/verification/admin/:id/reject
exports.rejectApplication = async (req, res) => {
  try {
    const v = await SellerVerification.findById(req.params.id);
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    v.stage = "rejected";
    v.rejectionReason = req.body.reason || "Application did not meet verification requirements";
    v.reviewedBy = req.user._id;
    v.reviewedAt = new Date();
    await v.save();
    await User.findByIdAndUpdate(v.seller, { verificationStatus: "rejected" });
    await createNotification({ user: v.seller, type: "verification", title: "Application Not Approved", message: `Your application was not approved: ${v.rejectionReason}. You may reapply after 30 days.` });
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/verification/admin/:id/suspend
exports.suspendSeller = async (req, res) => {
  try {
    const v = await SellerVerification.findById(req.params.id);
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    v.stage = "suspended";
    if (req.body.reason) v.notes.push({ text: `Suspended: ${req.body.reason}`, by: req.user._id });
    await v.save();
    await User.findByIdAndUpdate(v.seller, { verificationStatus: "suspended", isActive: false });
    res.json({ success: true, message: "Seller suspended", verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/verification/admin/:id/assign
exports.assignReviewer = async (req, res) => {
  try {
    const v = await SellerVerification.findByIdAndUpdate(req.params.id, { reviewedBy: req.body.reviewerId }, { new: true });
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/v1/verification/admin/:id/note
exports.addNote = async (req, res) => {
  try {
    const v = await SellerVerification.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: req.body.text, by: req.user._id } } },
      { new: true }
    );
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/verification/admin/:id/field
exports.scheduleFieldVisit = async (req, res) => {
  try {
    const v = await SellerVerification.findByIdAndUpdate(
      req.params.id,
      { "fieldVisit.scheduledAt": new Date(req.body.scheduledAt), "fieldVisit.by": req.user._id, stage: "field_visit_scheduled" },
      { new: true }
    );
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    await User.findByIdAndUpdate(v.seller, { verificationStatus: "field_visit" });
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/v1/verification/admin/:id/field-report
exports.submitFieldReport = async (req, res) => {
  try {
    const v = await SellerVerification.findByIdAndUpdate(
      req.params.id,
      { "fieldVisit.report": req.body.report, "fieldVisit.completedAt": new Date() },
      { new: true }
    );
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/verification/admin/:id/badge
exports.assignBadge = async (req, res) => {
  try {
    const { badges } = req.body; // array of badge strings
    const v = await SellerVerification.findByIdAndUpdate(req.params.id, { heritageBadges: badges }, { new: true });
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    await User.findByIdAndUpdate(v.seller, { heritageBadges: badges });
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/verification/admin/:id/appeal
exports.reviewAppeal = async (req, res) => {
  try {
    const { decision, notes } = req.body;
    const v = await SellerVerification.findById(req.params.id);
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    if (v.appeal) { v.appeal.decision = decision; v.appeal.decidedAt = new Date(); }
    if (decision === "approved") {
      v.stage = "approved";
      await User.findByIdAndUpdate(v.seller, { verificationStatus: "approved" });
    }
    if (notes) v.notes.push({ text: notes, by: req.user._id });
    await v.save();
    res.json({ success: true, verification: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
