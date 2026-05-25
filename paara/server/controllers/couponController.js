const Coupon = require("../models/Coupon");

// GET /api/v1/coupons  (admin — all coupons)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/coupons  (admin)
exports.createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minCartValue, maxDiscount, expiryDate, usageLimit } = req.body;
    const coupon = await Coupon.create({ code: code.toUpperCase(), description, discountType, discountValue, minCartValue, maxDiscount, expiryDate: expiryDate ? new Date(expiryDate) : undefined, usageLimit, isActive: true, createdBy: req.user._id });
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "Coupon code already exists" });
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/coupons/:id  (admin)
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/coupons/:id  (admin)
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/coupons/validate  (public with cart value)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartValue } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Coupon code required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });
    if (coupon.expiryDate && coupon.expiryDate < new Date())
      return res.status(400).json({ success: false, message: "This coupon has expired" });
    if (coupon.usageLimit && coupon.usedBy.length >= coupon.usageLimit)
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    if (Number(cartValue) < coupon.minCartValue)
      return res.status(400).json({ success: false, message: `Minimum order value PKR ${coupon.minCartValue} required` });

    // Check if user already used it
    if (req.user) {
      const userUsage = coupon.usedBy.find(u => u.userId?.toString() === req.user._id.toString());
      if (userUsage && coupon.usageLimit === 1)
        return res.status(400).json({ success: false, message: "You have already used this coupon" });
    }

    const discount = coupon.discountType === "percentage"
      ? Math.min((Number(cartValue) * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
      : coupon.discountValue;

    res.json({
      success: true,
      discount: Math.round(discount),
      coupon: { code: coupon.code, description: coupon.description, discountType: coupon.discountType, discountValue: coupon.discountValue },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
