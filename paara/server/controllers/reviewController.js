const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(productId, { rating: Math.round(stats[0].avgRating * 10) / 10, numReviews: stats[0].count });
  }
};

// GET /api/v1/products/:id/reviews
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id, isApproved: true })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/reviews
exports.createReview = async (req, res) => {
  try {
    const { product, rating, title, comment } = req.body;
    const exists = await Review.findOne({ product, user: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: "You already reviewed this product" });

    const verified = await Order.findOne({ buyer: req.user._id, "items.product": product, status: "delivered" });

    const review = await Review.create({ product, user: req.user._id, rating, title, comment, isVerifiedPurchase: !!verified });
    await updateProductRating(product);
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/reviews/:id/helpful
exports.voteHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    const uid = req.user._id;
    if (review.helpfulVotes.includes(uid)) {
      review.helpfulVotes.pull(uid);
    } else {
      review.helpfulVotes.push(uid);
      review.unhelpfulVotes.pull(uid);
    }
    await review.save();
    res.json({ success: true, helpful: review.helpfulVotes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/reviews/:id/seller-response  (seller)
exports.sellerResponse = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate("product");
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    if (review.product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not your product" });
    review.sellerReply = { text: req.body.text, respondedAt: new Date() };
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/reviews/user/my-reviews
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("product", "name images")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
