const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");

// GET /api/v1/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [users, products, orders, revenue] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: "approved" }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { "payment.status": "paid" } }, { $group: { _id: null, total: { $sum: "$pricing.total" } } }]),
    ]);
    const pendingProducts = await Product.countDocuments({ status: "pending" });
    const pendingSellers = await User.countDocuments({ role: "seller", verificationStatus: "pending" });
    res.json({ success: true, stats: { users, products, orders, revenue: revenue[0]?.total || 0, pendingProducts, pendingSellers } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).select("-password");
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/users/:id
// Whitelist: admins can only edit profile fields via this endpoint.
// Forbidden via this route (must use dedicated endpoints):
//   - role            → privilege change must go through a dedicated flow
//   - email           → identity change must go through a verified flow
//   - password        → users only, via /users/change-password (preserves bcrypt hashing)
//   - verificationStatus, heritageBadges → use /verification/admin/:id/* endpoints
//   - twoFactorEnabled, twoFactorSecret, passwordResetToken, passwordResetExpires,
//     isEmailVerified, emailOtp, emailOtpExpires → auth state, never admin-settable
//   - addresses       → user-owned, via /users/addresses endpoints
//   - _id, createdAt, updatedAt, __v → Mongoose internals
const ADMIN_UPDATABLE_USER_FIELDS = [
  "name",
  "phone",
  "city",
  "isActive",
  "shopName",
  "shopDescription",
  "shopBanner",
  "region",
  "favoriteCategories",
  "favoriteCities",
];

exports.updateUser = async (req, res) => {
  try {
    // Build a safe update payload — only whitelisted fields pass through
    const updates = {};
    for (const field of ADMIN_UPDATABLE_USER_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updatable fields provided. Allowed: " + ADMIN_UPDATABLE_USER_FIELDS.join(", "),
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/products
exports.getProducts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).populate("seller", "name shopName");
    res.json({ success: true, products, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/products/:id/moderate
exports.moderateProduct = async (req, res) => {
  try {
    const { action, notes } = req.body; // approve | reject | suspend
    const statusMap = { approve: "approved", reject: "rejected", suspend: "suspended" };
    if (!statusMap[action]) return res.status(400).json({ success: false, message: "Invalid action" });
    const product = await Product.findByIdAndUpdate(req.params.id, { status: statusMap[action], moderationNotes: notes, moderatedBy: req.user._id, moderatedAt: new Date() }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/orders
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).populate("buyer", "name email");
    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/sellers
exports.getSellers = async (req, res) => {
  try {
    const { verificationStatus, page = 1, limit = 20 } = req.query;
    const query = { role: "seller" };
    if (verificationStatus) query.verificationStatus = verificationStatus;
    const total = await User.countDocuments(query);
    const sellers = await User.find(query).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).select("-password");
    res.json({ success: true, sellers, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/sellers/:id/verify
exports.verifySeller = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findOneAndUpdate({ _id: req.params.id, role: "seller" }, { verificationStatus: status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "Seller not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/analytics/overview
exports.getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [revenueData, topProducts, topRegions] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$pricing.total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Product.find({ status: "approved" }).sort({ numSold: -1 }).limit(5).select("name numSold city category"),
      Product.aggregate([{ $group: { _id: "$city", count: { $sum: "$numSold" } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
    ]);
    res.json({ success: true, revenueData, topProducts, topRegions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/users/:id/toggle-active
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ success: false, message: "Cannot deactivate admin accounts" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user: { _id: user._id, isActive: user.isActive }, message: `User ${user.isActive ? "activated" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/admin/users/:id  (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ success: false, message: "Cannot delete admin accounts" });
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();
    res.json({ success: true, message: "User account deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/stats  (extended overview)
exports.getFullStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [buyers, sellers, admins, products, orders, revenue, pendingProducts, pendingSellers, recentOrders] = await Promise.all([
      User.countDocuments({ role: "buyer", isActive: true }),
      User.countDocuments({ role: "seller", isActive: true }),
      User.countDocuments({ role: "admin" }),
      Product.countDocuments({ status: "approved" }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { "payment.status": "paid" } }, { $group: { _id: null, total: { $sum: "$pricing.total" } } }]),
      Product.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "seller", verificationStatus: "pending" }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("buyer", "name email"),
    ]);
    res.json({ success: true, stats: { buyers, sellers, admins, users: buyers + sellers + admins, products, orders, revenue: revenue[0]?.total || 0, pendingProducts, pendingSellers }, recentOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
