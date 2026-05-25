const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");

// POST /api/v1/cart/checkout — place order from cart
exports.checkout = async (req, res) => {
  try {
    const { shippingAddress, payment, couponCode, giftWrap } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    // Build order items & calculate pricing
    let subtotal = 0;
    const items = [];
    for (const item of cart.items.filter((i) => !i.savedForLater)) {
      if (!item.product) continue;
      const price = item.product.price;
      subtotal += price * item.quantity;
      items.push({
        product: item.product._id,
        seller: item.product.seller,
        name: item.product.name,
        image: item.product.images?.[0] || "",
        price,
        quantity: item.quantity,
        variant: item.variant,
      });
    }

    if (items.length === 0)
      return res.status(400).json({ success: false, message: "No active items in cart" });

    // Coupon
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && (!coupon.expiryDate || coupon.expiryDate > new Date()) && subtotal >= coupon.minCartValue) {
        discount = coupon.discountType === "percentage"
          ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
          : coupon.discountValue;
        coupon.usedBy.push({ userId: req.user._id, usedCount: 1, lastUsedAt: new Date() });
        await coupon.save();
      }
    }

    const shippingFee = subtotal - discount > 10000 ? 0 : 450;
    const total = subtotal - discount + shippingFee + (giftWrap?.enabled ? (giftWrap.price || 0) : 0);

    const order = await Order.create({
      buyer: req.user._id,
      items,
      shippingAddress,
      payment: { method: payment?.method || "cod" },
      pricing: { subtotal, shipping: shippingFee, discount, total },
      couponCode: couponCode || undefined,
      giftWrap: giftWrap || { enabled: false },
      status: "pending",
      statusHistory: [{ status: "pending", notes: "Order placed" }],
    });

    // Update product sold counts
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { numSold: item.quantity, stock: -item.quantity } });
    }

    // Clear cart
    cart.items = [];
    cart.couponCode = undefined;
    cart.couponDiscount = 0;
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name images price");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("items.product", "name images price")
      .populate("items.seller", "name shopName");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.buyer._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/orders/:id/tracking
exports.getTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product", "name images");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, tracking: { status: order.status, statusHistory: order.statusHistory, courierName: order.courierName, courierTrackingNumber: order.courierTrackingNumber, courierTrackingUrl: order.courierTrackingUrl, estimatedDeliveryDate: order.estimatedDeliveryDate, deliveredAt: order.deliveredAt }, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/orders/:id/status  (seller or admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes, courierName, courierTrackingNumber, courierTrackingUrl, estimatedDeliveryDate } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    order.statusHistory.push({ status, notes, updatedBy: req.user._id });
    if (courierName) order.courierName = courierName;
    if (courierTrackingNumber) order.courierTrackingNumber = courierTrackingNumber;
    if (courierTrackingUrl) order.courierTrackingUrl = courierTrackingUrl;
    if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;
    if (status === "delivered") order.deliveredAt = new Date();

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!["pending", "confirmed"].includes(order.status))
      return res.status(400).json({ success: false, message: "Cannot cancel this order" });

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || "Cancelled by buyer";
    order.statusHistory.push({ status: "cancelled", notes: order.cancelReason });
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/seller/orders  (seller's orders)
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.seller": req.user._id })
      .sort({ createdAt: -1 })
      .populate("buyer", "name email phone")
      .populate("items.product", "name images price");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
