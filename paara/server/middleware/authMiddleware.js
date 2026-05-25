const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) return res.status(401).json({ success: false, message: "User not found" });
      next();
    } catch {
      return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ success: false, message: "Admin access required" });
};

const sellerOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authorized" });
  if (req.user.role === "admin") return next();
  if (req.user.role === "seller" && req.user.verificationStatus === "approved") return next();
  res.status(403).json({ success: false, message: "Approved seller account required" });
};

const sellerOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authorized" });
  if (["seller", "admin"].includes(req.user.role)) return next();
  res.status(403).json({ success: false, message: "Seller or admin access required" });
};

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch { req.user = null; }
  }
  next();
};

module.exports = { protect, adminOnly, sellerOnly, sellerOrAdmin, optionalAuth };
