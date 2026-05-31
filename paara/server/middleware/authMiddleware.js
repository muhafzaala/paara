const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id ?? decoded.sub).select("-password");
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
      req.user = await User.findById(decoded.id ?? decoded.sub).select("-password");
    } catch { req.user = null; }
  }
  next();
};

const primaryAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin" || !req.user.isPrimaryAdmin) {
    return res.status(403).json({ success: false, message: "Primary admin only" });
  }
  next();
};

const activeAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  if (req.user.adminStatus !== "active") {
    return res.status(403).json({ success: false, message: `Admin account ${req.user.adminStatus}` });
  }
  next();
};

const require2FA = (req, res, next) => {
  if (req.user?.role === "admin" && !req.session2FAVerified) {
    return res.status(403).json({ success: false, message: "2FA verification required", twoFactor: true });
  }
  next();
};

module.exports = { protect, adminOnly, sellerOnly, sellerOrAdmin, optionalAuth, primaryAdminOnly, activeAdminOnly, require2FA };
