const Wishlist = require("../models/Wishlist");
const crypto = require("crypto");

const getOrCreateDefault = async (userId) => {
  let w = await Wishlist.findOne({ user: userId, isDefault: true }).populate("items.product", "name price images isActive");
  if (!w) w = await Wishlist.create({ user: userId, name: "My Wishlist", isDefault: true });
  return w;
};

// GET /api/v1/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const w = await getOrCreateDefault(req.user._id);
    res.json({ success: true, wishlist: w });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/wishlist/all
exports.getAllWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ user: req.user._id }).populate("items.product", "name price images");
    res.json({ success: true, wishlists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/wishlist — add item to default wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let w = await getOrCreateDefault(req.user._id);
    const exists = w.items.find((i) => {
      const pid = i.product?._id || i.product;
      return pid?.toString() === productId;
    });
    if (!exists) {
      w.items.push({ product: productId });
      await w.save();
      // Re-fetch with populate so the response includes full product details
      w = await Wishlist.findById(w._id).populate("items.product", "name price images isActive");
    }
    res.json({ success: true, wishlist: w });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/wishlist/:productId
exports.removeFromWishlist = async (req, res) => {
  try {
    const w = await Wishlist.findOne({ user: req.user._id, isDefault: true });
    if (!w) return res.status(404).json({ success: false, message: "Wishlist not found" });
    w.items = w.items.filter((i) => i.product.toString() !== req.params.productId);
    await w.save();
    res.json({ success: true, wishlist: w });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/wishlist/create — new named wishlist
exports.createWishlist = async (req, res) => {
  try {
    const w = await Wishlist.create({ user: req.user._id, name: req.body.name || "New Wishlist" });
    res.status(201).json({ success: true, wishlist: w });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/v1/wishlist/:id/generate-share-link
exports.generateShareLink = async (req, res) => {
  try {
    const w = await Wishlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!w) return res.status(404).json({ success: false, message: "Wishlist not found" });
    w.shareToken = crypto.randomBytes(16).toString("hex");
    w.shareExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    w.isPublic = true;
    await w.save();
    res.json({ success: true, shareLink: `${process.env.CLIENT_URL || "http://localhost:5173"}/wishlist/share/${w.shareToken}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/wishlist/share/:token — public
exports.getSharedWishlist = async (req, res) => {
  try {
    const w = await Wishlist.findOne({ shareToken: req.params.token, isPublic: true, shareExpiry: { $gt: new Date() } }).populate("items.product", "name price images artisan region");
    if (!w) return res.status(404).json({ success: false, message: "Shared wishlist not found or expired" });
    res.json({ success: true, wishlist: w });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
