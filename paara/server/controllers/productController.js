const Product = require("../models/Product");
const { cloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

exports.getProducts = async (req, res) => {
  try {
    const { search, region, city, category, minPrice, maxPrice, sort, page = 1, limit = 20, featured } = req.query;
    const query = { status: "approved", isActive: true };

    if (search) query.$text = { $search: search };
    if (region || city) query.city = region || city;
    if (category) query.category = category;
    if (featured === "true") query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortMap = { newest: { createdAt: -1 }, "price-asc": { price: 1 }, "price-desc": { price: -1 }, popular: { numSold: -1 }, rating: { rating: -1 } };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortBy)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("seller", "name shopName avatar verificationStatus heritageBadges")
      .lean();

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name shopName avatar city verificationStatus heritageBadges shopDescription")
      .populate("questions.askedBy", "name avatar");

    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: "Product not found" });

    product.views += 1;
    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/products  (seller)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, seller: req.user._id });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/products/:id  (seller owns it)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    Object.assign(product, req.body);
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/products/:id  (seller or admin)
exports.deleteProduct = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, seller: req.user._id };
    const product = await Product.findOneAndDelete(filter);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/products/seller/my-products  (seller)
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/products/:id/ask-question
exports.askQuestion = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    product.questions.push({ askedBy: req.user._id, question: req.body.question });
    await product.save();
    res.status(201).json({ success: true, message: "Question submitted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/products/:id/questions/:qid/answer  (seller)
exports.answerQuestion = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const q = product.questions.id(req.params.qid);
    if (!q) return res.status(404).json({ success: false, message: "Question not found" });
    q.answer = req.body.answer;
    q.answeredAt = new Date();
    await product.save();
    res.json({ success: true, message: "Answered" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/v1/search  (public)
exports.searchProducts = async (req, res) => {
  try {
    const { q, category, city, region, minPrice, maxPrice, sort = "newest", page = 1, limit = 24 } = req.query;
    const match = { status: "approved", isActive: true };
    if (q) match.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { artisan: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
    if (category) match.category = category;
    if (city) match.city = city;
    if (region) match.region = region;
    if (minPrice || maxPrice) {
      match.price = {};
      if (minPrice) match.price.$gte = Number(minPrice);
      if (maxPrice) match.price.$lte = Number(maxPrice);
    }
    const sortMap = {
      newest: { createdAt: -1 }, price_low: { price: 1 }, price_high: { price: -1 },
      rating: { rating: -1 }, popular: { numSold: -1 },
    };
    const total = await Product.countDocuments(match);
    const products = await Product.find(match)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const facets = await Product.aggregate([
      { $match: { status: "approved", isActive: true } },
      { $facet: {
        categories: [{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        cities: [{ $group: { _id: "$city", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }],
        regions: [{ $group: { _id: "$region", count: { $sum: 1 } } }],
      }},
    ]);
    res.json({ success: true, products, total, page: Number(page), facets: facets[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
