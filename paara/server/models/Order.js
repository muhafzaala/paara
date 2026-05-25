const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String, image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    variant: String,
  }],
  shippingAddress: {
    name: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    province: String,
    postalCode: String,
    phone: { type: String, required: true },
  },
  payment: {
    method: { type: String, enum: ["cod", "jazzcash", "easypaisa", "bank", "card"], default: "cod" },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    transactionId: String,
    paidAt: Date,
  },
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  couponCode: String,
  giftWrap: {
    enabled: { type: Boolean, default: false },
    style: String,
    message: String,
    hidePrice: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "dispatched", "in_transit", "delivered", "cancelled", "returned"],
    default: "pending",
  },
  statusHistory: [{
    status: String, notes: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  }],
  courierName: String,
  courierTrackingNumber: String,
  courierTrackingUrl: String,
  estimatedDeliveryDate: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  notes: String,
}, { timestamps: true });

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "items.seller": 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
