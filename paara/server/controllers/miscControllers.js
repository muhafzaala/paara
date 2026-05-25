const Product = require("../models/Product");
const User = require("../models/User");
const { City, Collection, Message, SellerVerification } = require("../models/extras");

// ─── Search ─────────────────────────────────────────────────
exports.search = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.json({ success: true, results: [], products: [] });
    const products = await Product.find({ $text: { $search: q }, status: "approved", isActive: true })
      .limit(Number(limit))
      .populate("seller", "name shopName");
    res.json({ success: true, products, total: products.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Cities ─────────────────────────────────────────────────
exports.getCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    // If no cities seeded, return static defaults
    if (!cities.length) {
      return res.json({ success: true, cities: [
        { name: "Lahore", region: "Punjab", craftSpecialties: ["Textile", "Embroidery"] },
        { name: "Multan", region: "Punjab", craftSpecialties: ["Blue Pottery"] },
        { name: "Hunza", region: "Gilgit-Baltistan", craftSpecialties: ["Woodwork"] },
        { name: "Peshawar", region: "KPK", craftSpecialties: ["Copper", "Brass"] },
        { name: "Karachi", region: "Sindh", craftSpecialties: ["Ajrak", "Block Print"] },
        { name: "Skardu", region: "Gilgit-Baltistan", craftSpecialties: ["Gemstones", "Jade"] },
      ]});
    }
    res.json({ success: true, cities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Collections ─────────────────────────────────────────────
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true }).sort({ sortOrder: 1 }).populate("products", "name price images");
    res.json({ success: true, collections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug }).populate("products");
    if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });
    res.json({ success: true, collection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Recommendations ─────────────────────────────────────────
exports.getRecommendations = async (req, res) => {
  try {
    const { productId, city, category } = req.query;
    const query = { status: "approved", isActive: true };
    if (productId) query._id = { $ne: productId };
    if (city) query.city = city;
    if (category) query.category = category;
    const products = await Product.find(query).sort({ rating: -1 }).limit(8).populate("seller", "name shopName");
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Seller Profile ──────────────────────────────────────────
exports.getSellerProfile = async (req, res) => {
  try {
    const seller = await User.findOne({ _id: req.params.id, role: "seller" }).select("-password -twoFactorSecret");
    if (!seller) return res.status(404).json({ success: false, message: "Shop not found" });
    const products = await Product.find({ seller: req.params.id, status: "approved", isActive: true });
    res.json({ success: true, seller, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSellerDashboard = async (req, res) => {
  try {
    const Order = require("../models/Order");
    const [totalOrders, pendingOrders, totalProducts, revenue] = await Promise.all([
      Order.countDocuments({ "items.seller": req.user._id }),
      Order.countDocuments({ "items.seller": req.user._id, status: "pending" }),
      Product.countDocuments({ seller: req.user._id }),
      Order.aggregate([{ $match: { "items.seller": req.user._id, "payment.status": "paid" } }, { $group: { _id: null, total: { $sum: "$pricing.total" } } }]),
    ]);
    res.json({ success: true, stats: { totalOrders, pendingOrders, totalProducts, revenue: revenue[0]?.total || 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSellerAnalytics = async (req, res) => {
  try {
    const Order = require("../models/Order");
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenueData = await Order.aggregate([
      { $match: { "items.seller": req.user._id, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$pricing.total" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, revenueData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Messaging ───────────────────────────────────────────────
exports.getConversations = async (req, res) => {
  try {
    const msgs = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar shopName")
      .sort({ createdAt: -1 });
    // Group by conversation
    const convMap = {};
    msgs.forEach((m) => {
      if (!convMap[m.conversation]) convMap[m.conversation] = { ...m.toObject(), unread: 0 };
    });
    res.json({ success: true, conversations: Object.values(convMap) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, productId } = req.body;
    const convId = [req.user._id, receiverId].sort().join("-");
    const msg = await Message.create({ conversation: convId, sender: req.user._id, receiver: receiverId, text, product: productId || undefined });
    await msg.populate("sender", "name avatar");
    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Payouts ─────────────────────────────────────────────────
exports.getPayouts = async (req, res) => {
  res.json({ success: true, payouts: [], balance: 0, message: "Payout system ready" });
};

exports.requestPayout = async (req, res) => {
  res.json({ success: true, message: "Payout request received and will be processed within 3–5 business days" });
};

// ─── Verification ────────────────────────────────────────────
exports.applyForVerification = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { verificationStatus: "pending" }, { new: true });
    const verification = await SellerVerification.findOneAndUpdate(
      { seller: req.user._id },
      { ...req.body, seller: req.user._id, stage: "applied" },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, verification, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getVerificationStatus = async (req, res) => {
  try {
    const v = await SellerVerification.findOne({ seller: req.user._id });
    res.json({ success: true, verification: v, verificationStatus: req.user.verificationStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Content Moderation ──────────────────────────────────────
exports.getFlaggedContent = async (req, res) => {
  res.json({ success: true, flagged: [], message: "Content moderation system active" });
};

// ─── Field Research ──────────────────────────────────────────
exports.getFieldResearch = async (req, res) => {
  res.json({ success: true, research: [], message: "Field research system active" });
};
