const { Collection } = require("../models/extras");
const Product         = require("../models/Product");

// GET /api/v1/collections  — Public
exports.getCollections = async (req, res) => {
  try {
    const { featured } = req.query;
    const query = { isActive: true };
    if (featured === "true") query.isFeatured = true;
    const collections = await Collection.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, collections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/collections/:slug  — Public
exports.getCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug, isActive: true })
      .populate({
        path: "products",
        match: { status: "approved", isActive: true },
        select: "name price images rating numReviews city category artisan",
      });
    if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });
    res.json({ success: true, collection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/collections  (admin)
exports.createCollection = async (req, res) => {
  try {
    if (!req.body.slug) {
      req.body.slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    const collection = await Collection.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, collection });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "Slug already in use" });
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/collections/:id  (admin)
exports.updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });
    res.json({ success: true, collection });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/collections/:id/products  (admin — add/remove products)
exports.updateCollectionProducts = async (req, res) => {
  try {
    const { add, remove } = req.body;
    const update = {};
    if (add?.length)    update.$addToSet = { products: { $each: add } };
    if (remove?.length) update.$pull     = { products: { $in: remove } };
    const collection = await Collection.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });
    res.json({ success: true, collection });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/collections/:id  (admin)
exports.deleteCollection = async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Collection deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
