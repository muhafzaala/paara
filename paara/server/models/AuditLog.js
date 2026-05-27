const mongoose = require("mongoose");
const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  actorRole: { type: String, enum: ["buyer", "seller", "admin", "system"], required: true },
  action: { type: String, required: true, index: true },
  targetType: { type: String, enum: ["User", "Product", "Order", "SellerProfile", "Review"] },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: String,
  userAgent: String,
}, { timestamps: true });
auditLogSchema.index({ createdAt: -1 });
module.exports = mongoose.model("AuditLog", auditLogSchema);
