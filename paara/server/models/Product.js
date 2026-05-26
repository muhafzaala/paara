const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  askedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  question: { type: String, required: true },
  answer: String,
  answeredAt: Date,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: Number,
  category: { type: String, required: true },
  subCategory: String,
  city: { type: String, required: true },
  region: String,
  images: [String],
  stock: { type: Number, default: 10 },
  tags: [String],
  material: String,
  dimensions: String,
  weight: String,
  craftType: String,
  artisan: String,
  // Heritage
  originStory: String,
  cityFacts: String,
  care: String,
  details: String,
  isHeritageVerified: { type: Boolean, default: false },
  // Q&A
  questions: [questionSchema],
  // Stats
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  numSold: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  // Status
  status: { type: String, enum: ["pending", "approved", "rejected", "suspended"], default: "pending" },
  isFeatured: { type: Boolean, default: false },
  isDemo: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true },
  moderationNotes: String,
}, { timestamps: true });

productSchema.index({ name: "text", description: "text", tags: "text", artisan: "text" });
productSchema.index({ city: 1, category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });

module.exports = mongoose.model("Product", productSchema);
