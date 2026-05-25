const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 500 },
  status: {
    type: String,
    enum: ["pending", "processing", "paid", "rejected"],
    default: "pending",
  },
  bankDetails: {
    accountTitle: String,
    accountNumber: String,
    bankName: String,
    branchCode: String,
    iban: String,
  },
  easyPaisa: String,
  jazzCash: String,
  method: { type: String, enum: ["bank", "easypaisa", "jazzcash"], default: "bank" },
  requestedAt: { type: Date, default: Date.now },
  processedAt: Date,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rejectionReason: String,
  transactionRef: String,
  notes: String,
  periodStart: Date,
  periodEnd: Date,
}, { timestamps: true });

payoutSchema.index({ seller: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Payout", payoutSchema);
