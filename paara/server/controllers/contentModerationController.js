const Product = require("../models/Product");
const Review  = require("../models/Review");
const User    = require("../models/User");
const { createNotification } = require("../utils/notificationHelper");

// In-memory flag store (for this version — in production use a Flag model)
// We'll use the Product.moderationNotes field to track flags

// GET /api/v1/admin/content/flagged  — flagged products & reviews
exports.getFlaggedContent = async (req, res) => {
  try {
    const { type = "all", page = 1, limit = 20 } = req.query;

    const flaggedProducts = type === "all" || type === "products"
      ? await Product.find({ status: { $in: ["pending", "suspended"] } })
          .populate("seller", "name shopName")
          .sort({ updatedAt: -1 })
          .limit(Number(limit))
      : [];

    const suspiciousReviews = type === "all" || type === "reviews"
      ? await Review.find({ isApproved: false })
          .populate("user", "name email")
          .populate("product", "name")
          .sort({ createdAt: -1 })
          .limit(Number(limit))
      : [];

    res.json({
      success: true,
      flaggedProducts,
      suspiciousReviews,
      summary: {
        pendingProducts: await Product.countDocuments({ status: "pending" }),
        suspendedProducts: await Product.countDocuments({ status: "suspended" }),
        flaggedReviews: await Review.countDocuments({ isApproved: false }),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/admin/content/flag-review/:id
exports.flagReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/content/approve-review/:id
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/admin/content/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    // Recalculate product rating
    const stats = await Review.aggregate([
      { $match: { product: review.product, isApproved: true } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await Product.findByIdAndUpdate(review.product, { rating: stats[0]?.avg || 0, numReviews: stats[0]?.count || 0 });
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/admin/content/warn-user/:id
exports.warnUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    await createNotification({
      user: user._id, type: "system",
      title: "Account Warning",
      message: reason || "Your account has received a warning for violating PAARA community guidelines.",
    });
    res.json({ success: true, message: "Warning sent to user" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
