const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1, min: 1 },
    variant: String,
    price: Number,
    savedForLater: { type: Boolean, default: false },
  }],
  couponCode: String,
  couponDiscount: { type: Number, default: 0 },
  giftWrap: {
    enabled: { type: Boolean, default: false },
    style: String,
    message: String,
    hidePrice: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
