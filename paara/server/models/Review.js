const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },
  photoUrl: String,
  isVerifiedPurchase: { type: Boolean, default: false },
  sellerReply: { text: String, respondedAt: Date },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  unhelpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isApproved: { type: Boolean, default: true },
  verifiedPurchase: { type: Boolean, default: false },
  sellerResponse: { type: String, default: "" },
  reportedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, reason: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
