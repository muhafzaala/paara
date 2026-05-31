const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["order_placed", "order_status", "review_received", "verification_update", "payout_sent", "system", "new_user_registered", "new_product_submitted", "product_approved", "product_rejected", "product_resubmit_requested", "admin_request_submitted", "admin_request_reviewed"], required: true },
  title: String, message: String,
  link: String,
  read: { type: Boolean, default: false, index: true },
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });
schema.index({ user: 1, read: 1, createdAt: -1 });
module.exports = mongoose.model("Notification", schema);
