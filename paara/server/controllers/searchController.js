const Product = require("../models/Product");
const User    = require("../models/User");

// GET /api/v1/search?q=&city=&category=&page=&limit=
exports.search = async (req, res) => {
  try {
    const { q, city, category, page = 1, limit = 20 } = req.query;
    if (!q || q.trim().length < 2)
      return res.json({ success: true, products: [], sellers: [], total: 0 });

    const productQuery = {
      $text: { $search: q.trim() },
      status: "approved",
      isActive: true,
    };
    if (city)     productQuery.city     = new RegExp(city, "i");
    if (category) productQuery.category = category;

    const [products, sellers] = await Promise.all([
      Product.find(productQuery, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate("seller", "name shopName avatar verificationStatus")
        .lean(),
      User.find({
        role: "seller",
        verificationStatus: "approved",
        $or: [
          { shopName: new RegExp(q.trim(), "i") },
          { name:     new RegExp(q.trim(), "i") },
          { city:     new RegExp(q.trim(), "i") },
        ],
      }).select("name shopName avatar city heritageBadges").limit(5),
    ]);

    const total = await Product.countDocuments(productQuery);

    res.json({ success: true, products, sellers, total, page: Number(page), q: q.trim() });
  } catch (err) {
    // Fallback: text index may not exist — use regex search
    try {
      const { q, city, category, page = 1, limit = 20 } = req.query;
      const regex = new RegExp(q, "i");
      const query = {
        $or: [{ name: regex }, { description: regex }, { artisan: regex }, { tags: regex }],
        status: "approved",
        isActive: true,
      };
      if (city) query.city = new RegExp(city, "i");
      if (category) query.category = category;

      const products = await Product.find(query)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate("seller", "name shopName avatar");
      res.json({ success: true, products, sellers: [], total: products.length });
    } catch (fallbackErr) {
      res.status(500).json({ success: false, message: fallbackErr.message });
    }
  }
};

// GET /api/v1/search/suggestions?q=
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ success: true, suggestions: [] });
    const regex = new RegExp(`^${q.trim()}`, "i");
    const products = await Product.find({ name: regex, status: "approved" }).limit(5).select("name city category");
    const suggestions = products.map((p) => ({ text: p.name, type: "product", city: p.city }));
    res.json({ success: true, suggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
