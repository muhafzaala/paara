const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  buyer:           { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true, index: true },
  product:         { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  title:           { type: String, maxlength: 80 },
  note:            { type: String, required: true, maxlength: 500 },
  imageUrl:        String,
  status:          { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  rejectionReason: String,
  reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt:      Date,
}, { timestamps: true });

module.exports = mongoose.model("BuyerStory", schema);
