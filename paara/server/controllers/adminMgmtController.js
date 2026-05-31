const User = require("../models/User");
const AdminRequest = require("../models/AdminRequest");
const { notifyUser, notifyAllAdmins } = require("../utils/notify");

// POST /api/v1/admin-requests  (any logged-in user)
exports.submitRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 30)
      return res.status(400).json({ success: false, message: "Reason must be at least 30 characters" });
    if (req.user.role === "admin")
      return res.status(400).json({ success: false, message: "Already an admin" });
    const existing = await AdminRequest.findOne({ user: req.user._id });
    if (existing && existing.status === "pending")
      return res.status(400).json({ success: false, message: "Request already pending" });
    if (existing) {
      existing.reason = reason; existing.status = "pending"; existing.reviewedBy = undefined; existing.reviewedAt = undefined;
      await existing.save();
      notifyAllAdmins({
        type: "admin_request_submitted",
        title: "Admin access re-requested",
        message: `${req.user.name} resubmitted an admin access request.`,
        link: "/admin/admin-requests",
      });
      return res.json({ success: true, request: existing });
    }
    const r = await AdminRequest.create({ user: req.user._id, reason });
    notifyAllAdmins({
      type: "admin_request_submitted",
      title: "New admin access request",
      message: `${req.user.name} has requested admin access.`,
      link: "/admin/admin-requests",
    });
    res.json({ success: true, request: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/v1/admin-requests/mine  (any logged-in)
exports.myRequest = async (req, res) => {
  const r = await AdminRequest.findOne({ user: req.user._id });
  res.json({ success: true, request: r });
};

// GET /api/v1/admin/admin-requests  (primary admin)
exports.listRequests = async (req, res) => {
  const { status = "pending" } = req.query;
  const requests = await AdminRequest.find({ status })
    .populate("user", "name email avatar role createdAt")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, requests });
};

// PATCH /api/v1/admin/admin-requests/:id/review  (primary admin)
exports.reviewRequest = async (req, res) => {
  try {
    const { action, notes } = req.body; // action: "approve" | "reject"
    const r = await AdminRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: "Not found" });
    if (r.status !== "pending") return res.status(400).json({ success: false, message: "Already reviewed" });

    r.reviewedBy = req.user._id;
    r.reviewedAt = new Date();
    r.reviewNotes = notes || "";

    if (action === "approve") {
      r.status = "approved";
      await User.findByIdAndUpdate(r.user, {
        role: "admin",
        adminStatus: "active",
        twoFactorRequired: true,
        adminApprovedBy: req.user._id,
        adminApprovedAt: new Date(),
      });
    } else {
      r.status = "rejected";
    }
    await r.save();
    notifyUser(r.user, {
      type: "admin_request_reviewed",
      title: action === "approve" ? "Admin access approved" : "Admin access request rejected",
      message: action === "approve"
        ? "Your admin access request has been approved. You now have admin privileges."
        : `Your admin access request was not approved${notes ? `: ${notes}` : "."}`,
      link: "/account",
      metadata: { action },
    });
    res.json({ success: true, request: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/v1/admin/admins  (primary admin)
exports.listAdmins = async (req, res) => {
  const { q, status } = req.query;
  const query = { role: "admin" };
  if (status) query.adminStatus = status;
  if (q) query.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
  const admins = await User.find(query)
    .select("name email avatar adminStatus isPrimaryAdmin adminApprovedAt adminApprovedBy createdAt isActive")
    .populate("adminApprovedBy", "name email")
    .sort({ isPrimaryAdmin: -1, createdAt: -1 });
  res.json({ success: true, admins });
};

// PATCH /api/v1/admin/admins/:id/status  (primary admin)
exports.updateAdminStatus = async (req, res) => {
  try {
    const { status } = req.body; // "active" | "suspended"
    const target = await User.findById(req.params.id);
    if (!target || target.role !== "admin") return res.status(404).json({ success: false, message: "Not found" });
    if (target.isPrimaryAdmin) return res.status(403).json({ success: false, message: "Cannot modify primary admin" });
    if (!["active", "suspended"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });
    target.adminStatus = status;
    await target.save();
    res.json({ success: true, admin: target });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// DELETE /api/v1/admin/admins/:id  (primary admin) - demotes to buyer
exports.removeAdmin = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target || target.role !== "admin") return res.status(404).json({ success: false, message: "Not found" });
    if (target.isPrimaryAdmin) return res.status(403).json({ success: false, message: "Cannot remove primary admin" });
    target.role = "buyer";
    target.adminStatus = "active";
    target.twoFactorRequired = false;
    target.isPrimaryAdmin = false;
    await target.save();
    await AdminRequest.updateMany({ user: target._id }, { status: "rejected", reviewNotes: "Admin role revoked" });
    res.json({ success: true, message: "Admin removed" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/v1/admin/admin-activity  (primary admin) — last 200 audit log entries by admins
exports.adminActivity = async (req, res) => {
  const AuditLog = require("../models/AuditLog");
  const logs = await AuditLog.find({ actorRole: "admin" })
    .sort({ createdAt: -1 }).limit(200).populate("actor", "name email isPrimaryAdmin");
  res.json({ success: true, logs });
};
