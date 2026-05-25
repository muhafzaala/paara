const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product", "name price images stock isActive");
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// GET /api/v1/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    const product = await Product.findOne({ _id: productId, status: "approved", isActive: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: "Insufficient stock" });

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((i) => i.product._id?.toString() === productId && i.variant === variant);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    } else {
      cart.items.push({ product: productId, quantity, variant, price: product.price });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product", "name price images stock");
    res.json({ success: true, cart: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/cart/:productId
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not in cart" });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/cart/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: undefined, couponDiscount: 0 });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/cart/coupons/validate
exports.validateCoupon = async (req, res) => {
  try {
    const Coupon = require("../models/Coupon");
    const { code, cartValue } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    if (coupon.expiryDate && coupon.expiryDate < new Date())
      return res.status(400).json({ success: false, message: "Coupon expired" });
    if (cartValue < coupon.minCartValue)
      return res.status(400).json({ success: false, message: `Minimum order PKR ${coupon.minCartValue} required` });

    const discount = coupon.discountType === "percentage"
      ? Math.min((cartValue * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
      : coupon.discountValue;

    res.json({ success: true, discount: Math.round(discount), coupon: { code: coupon.code, type: coupon.discountType, value: coupon.discountValue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
