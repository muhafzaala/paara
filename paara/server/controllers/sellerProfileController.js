const User    = require("../models/User");
const Product = require("../models/Product");
const Order   = require("../models/Order");
const Review  = require("../models/Review");

// GET /api/v1/shops/:id  — Public seller profile
exports.getPublicSellerProfile = async (req, res) => {
  try {
    const seller = await User.findOne({ _id: req.params.id, role: "seller" })
      .select("name shopName shopDescription shopBanner avatar city region verificationStatus heritageBadges createdAt");
    if (!seller) return res.status(404).json({ success: false, message: "Shop not found" });

    const products = await Product.find({ seller: req.params.id, status: "approved", isActive: true })
      .select("name price images rating numReviews city category artisan")
      .sort({ createdAt: -1 });

    const totalSold = await Order.aggregate([
      { $match: { "items.seller": seller._id } },
      { $unwind: "$items" },
      { $match: { "items.seller": seller._id } },
      { $group: { _id: null, total: { $sum: "$items.quantity" } } },
    ]);

    const avgRating = await Review.aggregate([
      { $lookup: { from: "products", localField: "product", foreignField: "_id", as: "prod" } },
      { $unwind: "$prod" },
      { $match: { "prod.seller": seller._id, isApproved: true } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      seller,
      products,
      stats: {
        totalProducts: products.length,
        totalSold: totalSold[0]?.total || 0,
        avgRating: avgRating[0] ? Math.round(avgRating[0].avg * 10) / 10 : 0,
        totalReviews: avgRating[0]?.count || 0,
        memberSince: seller.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/seller/dashboard  (seller)
exports.getSellerDashboard = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalOrders, pendingOrders, totalProducts, activeProducts, revenue30d, recentOrders] = await Promise.all([
      Order.countDocuments({ "items.seller": req.user._id }),
      Order.countDocuments({ "items.seller": req.user._id, status: { $in: ["pending", "confirmed"] } }),
      Product.countDocuments({ seller: req.user._id }),
      Product.countDocuments({ seller: req.user._id, status: "approved", isActive: true }),
      Order.aggregate([
        { $match: { "items.seller": req.user._id, createdAt: { $gte: thirtyDaysAgo }, "payment.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
      Order.find({ "items.seller": req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("buyer", "name")
        .populate("items.product", "name images"),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        totalProducts,
        activeProducts,
        revenue30d: revenue30d[0]?.total || 0,
      },
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/seller/analytics  (seller)
exports.getSellerAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [revenueData, topProducts, categoryBreakdown] = await Promise.all([
      Order.aggregate([
        { $match: { "items.seller": req.user._id, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$pricing.total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Product.find({ seller: req.user._id, status: "approved" })
        .sort({ numSold: -1 })
        .limit(5)
        .select("name numSold price images city category"),
      Product.aggregate([
        { $match: { seller: req.user._id } },
        { $group: { _id: "$category", count: { $sum: 1 }, totalSold: { $sum: "$numSold" } } },
        { $sort: { totalSold: -1 } },
      ]),
    ]);

    res.json({ success: true, revenueData, topProducts, categoryBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/seller/orders  (seller)
exports.getSellerOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const match = { "items.seller": req.user._id };
    if (status) match.status = status;

    const total = await Order.countDocuments(match);
    const orders = await Order.find(match)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("buyer", "name email phone")
      .populate("items.product", "name images price");

    res.json({ success: true, orders, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/seller-profiles  (admin)
exports.getAllSellerProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, verificationStatus } = req.query;
    const query = { role: "seller" };
    if (verificationStatus) query.verificationStatus = verificationStatus;

    const total = await User.countDocuments(query);
    const sellers = await User.find(query)
      .select("-password -twoFactorSecret")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, sellers, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
