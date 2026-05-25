const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, default: "My Wishlist" },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    priceWhenAdded: Number,
    priceAlertEnabled: { type: Boolean, default: false },
    priceAlertThreshold: Number,
    addedAt: { type: Date, default: Date.now },
  }],
  isDefault: { type: Boolean, default: false },
  shareToken: { type: String, unique: true, sparse: true },
  shareExpiry: Date,
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
