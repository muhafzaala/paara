const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  minCartValue: { type: Number, default: 0 },
  maxDiscount: Number,
  expiryDate: Date,
  usageLimit: Number,
  usedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    usedCount: { type: Number, default: 1 },
    lastUsedAt: Date,
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
