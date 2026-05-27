const User          = require("../models/User");
const SellerProfile = require("../models/SellerProfile");
const Product       = require("../models/Product");
const Order         = require("../models/Order");
const Review        = require("../models/Review");

// Helper — fetch or auto-create empty profile (for sellers who registered before migration)
async function ensureProfile(userId) {
  let profile = await SellerProfile.findOne({ user: userId });
  if (!profile) profile = await SellerProfile.create({ user: userId });
  return profile;
}

// GET /api/v1/shops/:id  — Public seller profile
exports.getPublicSellerProfile = async (req, res) => {
  try {
    const seller = await User.findOne({ _id: req.params.id, role: "seller" })
      .select("name avatar city createdAt");
    if (!seller) return res.status(404).json({ success: false, message: "Shop not found" });

    const profile = await SellerProfile.findOne({ user: req.params.id });
    if (!profile || !profile.isVisible) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const products = await Product.find({ seller: req.params.id, status: "approved", isActive: true })
      .select("name price images rating numReviews city category artisan isDemo")
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
      seller: {
        _id: seller._id,
        name: seller.name,
        avatar: seller.avatar,
        // Shop fields now live on profile
        shopName: profile.shopName,
        shopDescription: profile.shopDescription,
        shopBanner: profile.shopBanner,
        shopLogo: profile.shopLogo,
        shopStory: profile.shopStory,
        yearEstablished: profile.yearEstablished,
        city: profile.city || seller.city,
        region: profile.region,
        craftSpecialties: profile.craftSpecialties,
        verificationStatus: profile.verificationStatus,
        heritageBadges: profile.heritageBadges,
        memberSince: seller.createdAt,
      },
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
    const profile = await ensureProfile(req.user._id);
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
        verificationStatus: profile.verificationStatus,
        verificationStage: profile.verificationStage,
        shopName: profile.shopName,
        heritageBadges: profile.heritageBadges,
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
    const query = {};
    if (verificationStatus) query.verificationStatus = verificationStatus;

    const total = await SellerProfile.countDocuments(query);
    const profiles = await SellerProfile.find(query)
      .populate("user", "name email avatar phone isActive createdAt")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, sellers: profiles, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/seller/profile  (seller) — read own profile
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await ensureProfile(req.user._id);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/seller/profile  (seller) — update own profile
exports.updateMyProfile = async (req, res) => {
  try {
    const profile = await ensureProfile(req.user._id);

    // Whitelist allowed fields — never let the seller change verificationStatus or badges directly
    const ALLOWED = [
      "shopName", "shopDescription", "shopBanner", "shopLogo", "yearEstablished",
      "shopStory", "city", "region", "craftSpecialties", "languagesSpoken", "isVisible",
    ];
    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) profile[field] = req.body[field];
    }
    // Bank details are nested
    if (req.body.bank) {
      profile.bank = { ...profile.bank, ...req.body.bank };
    }
    // Documents are nested
    if (req.body.documents) {
      profile.documents = { ...profile.documents, ...req.body.documents };
    }

    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/v1/seller/profile/submit-application  (seller)
exports.submitApplication = async (req, res) => {
  try {
    let profile = await SellerProfile.findOne({ user: req.user._id });
    if (!profile) profile = await SellerProfile.create({ user: req.user._id });

    // Require minimum data before submitting
    const required = ["shopName", "shopDescription", "city"];
    const missing = required.filter((f) => !profile[f] || String(profile[f]).trim() === "");
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Please complete: ${missing.join(", ")} before submitting.`,
        missing,
      });
    }
    if (!profile.documents?.cnicFront || !profile.documents?.cnicBack) {
      return res.status(400).json({
        success: false,
        message: "Please upload both sides of your CNIC before submitting.",
      });
    }

    // Transition to applied
    profile.verificationStatus = "applied";
    profile.verificationStage = 1;
    profile.appliedAt = new Date();
    profile.verificationHistory.push({
      stage: "applied",
      notes: "Seller submitted onboarding application.",
      by: req.user._id,
      at: new Date(),
    });
    await profile.save();

    res.json({
      success: true,
      message: "Application submitted. Our team will review it within 3-5 business days.",
      profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/seller-profiles/:id/advance
exports.advanceVerification = async (req, res) => {
  try {
    const { stage, notes } = req.body;
    const VALID = ["applied", "documents_under_review", "field_visit_scheduled", "approved", "rejected"];
    if (!VALID.includes(stage)) return res.status(400).json({ success: false, message: "Invalid stage" });

    const profile = await SellerProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const STAGE_IDX = { applied: 1, documents_under_review: 2, field_visit_scheduled: 3, approved: 4, rejected: 0 };
    profile.verificationStatus = stage;
    profile.verificationStage = STAGE_IDX[stage];
    if (stage === "approved") {
      profile.approvedAt = new Date();
      if (!profile.heritageBadges.includes("authentic")) profile.heritageBadges.push("authentic");
    }
    if (stage === "rejected") {
      profile.rejectedAt = new Date();
      profile.rejectionReason = notes || "Not specified";
    }
    profile.verificationHistory.push({ stage, notes: notes || "", by: req.user._id, at: new Date() });
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PATCH /api/v1/admin/seller-profiles/:id/badges
exports.awardBadge = async (req, res) => {
  try {
    const { badge, action } = req.body; // action: "add" | "remove"
    const VALID = ["authentic", "master_artisan", "heritage_keeper", "top_rated", "community_favorite"];
    if (!VALID.includes(badge)) return res.status(400).json({ success: false, message: "Invalid badge" });

    const profile = await SellerProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: "Not found" });

    if (action === "add" && !profile.heritageBadges.includes(badge)) profile.heritageBadges.push(badge);
    if (action === "remove") profile.heritageBadges = profile.heritageBadges.filter(b => b !== badge);
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
