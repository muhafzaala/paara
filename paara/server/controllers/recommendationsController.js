const Product = require("../models/Product");
const Order   = require("../models/Order");

// GET /api/v1/recommendations?productId=&city=&category=&limit=
exports.getRecommendations = async (req, res) => {
  try {
    const { productId, city, category, limit = 8 } = req.query;
    const query = { status: "approved", isActive: true };

    if (productId) {
      query._id = { $ne: productId };
      // Get the source product for context
      const source = await Product.findById(productId).select("city category tags");
      if (source) {
        // Prefer same city OR same category
        const cityProducts = await Product.find({ ...query, city: source.city })
          .sort({ rating: -1, numSold: -1 })
          .limit(Number(limit))
          .populate("seller", "name shopName");

        if (cityProducts.length >= 4) return res.json({ success: true, products: cityProducts });

        const categoryProducts = await Product.find({ ...query, category: source.category })
          .sort({ rating: -1, numSold: -1 })
          .limit(Number(limit))
          .populate("seller", "name shopName");

        const merged = [...cityProducts, ...categoryProducts.filter(p => !cityProducts.some(c => c._id.equals(p._id)))].slice(0, Number(limit));
        return res.json({ success: true, products: merged });
      }
    }

    if (city) query.city = city;
    if (category) query.category = category;

    const products = await Product.find(query)
      .sort({ rating: -1, numSold: -1, isFeatured: -1 })
      .limit(Number(limit))
      .populate("seller", "name shopName");

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/recommendations/trending  — top-selling last 30 days
exports.getTrending = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trending = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const productIds = trending.map((t) => t._id);
    const products = await Product.find({ _id: { $in: productIds }, status: "approved" })
      .populate("seller", "name shopName");

    // Re-sort to match trending order
    const sorted = productIds.map(id => products.find(p => p._id.equals(id))).filter(Boolean);
    res.json({ success: true, products: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/recommendations/featured  — featured / editorial picks
exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ status: "approved", isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate("seller", "name shopName avatar verificationStatus");
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
