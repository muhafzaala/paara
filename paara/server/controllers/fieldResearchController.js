const { SellerVerification } = require("../models/extras");
const User = require("../models/User");

// GET /api/v1/admin/field-research  — sellers needing field visits
exports.getFieldResearchQueue = async (req, res) => {
  try {
    const { stage = "field_visit_scheduled", page = 1, limit = 20 } = req.query;
    const query = stage === "all" ? {} : { stage };

    const total = await SellerVerification.countDocuments(query);
    const visits = await SellerVerification.find(query)
      .populate("seller", "name shopName email city phone")
      .populate("fieldVisit.by", "name")
      .sort({ "fieldVisit.scheduledAt": 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, visits, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/field-research/:id
exports.getFieldVisit = async (req, res) => {
  try {
    const visit = await SellerVerification.findById(req.params.id)
      .populate("seller", "name shopName email city phone region workshopAddress")
      .populate("fieldVisit.by", "name email")
      .populate("reviewedBy", "name email");
    if (!visit) return res.status(404).json({ success: false, message: "Visit not found" });
    res.json({ success: true, visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/admin/field-research/:id/schedule
exports.scheduleVisit = async (req, res) => {
  try {
    const { scheduledAt, assignedTo } = req.body;
    const v = await SellerVerification.findByIdAndUpdate(
      req.params.id,
      {
        "fieldVisit.scheduledAt": new Date(scheduledAt),
        "fieldVisit.by": assignedTo || req.user._id,
        stage: "field_visit_scheduled",
      },
      { new: true }
    ).populate("seller", "name email");
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    await User.findByIdAndUpdate(v.seller._id, { verificationStatus: "field_visit" });
    res.json({ success: true, visit: v });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/v1/admin/field-research/:id/report
exports.submitReport = async (req, res) => {
  try {
    const { report, recommendation, photos } = req.body;
    const v = await SellerVerification.findByIdAndUpdate(
      req.params.id,
      {
        "fieldVisit.report": report,
        "fieldVisit.completedAt": new Date(),
        $push: { notes: { text: `Field report: ${recommendation || "pending decision"}`, by: req.user._id } },
      },
      { new: true }
    );
    if (!v) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, visit: v, message: "Field report submitted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/field-research/stats
exports.getStats = async (req, res) => {
  try {
    const stats = await SellerVerification.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
