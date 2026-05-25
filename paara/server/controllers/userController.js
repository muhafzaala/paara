const User = require("../models/User");
const Order = require("../models/Order");

// GET /api/v1/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city, shopName, shopDescription, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, city, shopName, shopDescription, avatar }, { new: true, runValidators: true }).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/v1/users/addresses
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/users/addresses
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/users/addresses/:id
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: "Address not found" });
    if (req.body.isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
    Object.assign(addr, req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/users/addresses/:id
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/users/cultural-journey
exports.getCulturalJourney = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id, status: "delivered" }).populate("items.product", "city category");
    const cities = {};
    const categories = {};
    orders.forEach((o) => {
      o.items.forEach((i) => {
        if (i.product?.city) cities[i.product.city] = (cities[i.product.city] || 0) + 1;
        if (i.product?.category) categories[i.product.category] = (categories[i.product.category] || 0) + 1;
      });
    });
    res.json({ success: true, cities, categories, totalOrders: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Both currentPassword and newPassword are required" });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
    if (currentPassword === newPassword)
      return res.status(400).json({ success: false, message: "New password must differ from current password" });

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    // Issue a fresh JWT so the new password takes effect immediately;
    // old tokens remain valid until natural expiry (stateless JWT limitation).
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    res.json({
      success: true,
      message: "Password updated successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/users/account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete your account.",
      });
    }
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ success: false, message: "Incorrect password" });
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();
    res.json({ success: true, message: "Account deactivated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
