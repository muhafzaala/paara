const Payout = require("../models/Payout");
const Order  = require("../models/Order");
const { createNotification } = require("../utils/notificationHelper");

// Helper: calculate seller's available balance (paid orders – payouts already paid)
const getSellerBalance = async (sellerId) => {
  const earningsAgg = await Order.aggregate([
    { $match: { "items.seller": sellerId, "payment.status": "paid", status: "delivered" } },
    { $unwind: "$items" },
    { $match: { "items.seller": sellerId } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
  ]);
  const earnings = earningsAgg[0]?.total || 0;

  const paidAgg = await Payout.aggregate([
    { $match: { seller: sellerId, status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const paid = paidAgg[0]?.total || 0;

  // Platform takes 10% commission
  return Math.floor((earnings * 0.9) - paid);
};

// GET /api/v1/payouts/seller
exports.getSellerPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ seller: req.user._id }).sort({ createdAt: -1 });
    const balance = await getSellerBalance(req.user._id);
    const pendingAmount = payouts.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);

    res.json({ success: true, payouts, balance, pendingAmount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/payouts/request
exports.requestPayout = async (req, res) => {
  try {
    const { amount, method, bankDetails, easyPaisa, jazzCash } = req.body;
    if (!amount || amount < 500)
      return res.status(400).json({ success: false, message: "Minimum payout amount is PKR 500" });

    const balance = await getSellerBalance(req.user._id);
    if (amount > balance)
      return res.status(400).json({ success: false, message: `Insufficient balance. Available: PKR ${balance}` });

    const payout = await Payout.create({
      seller: req.user._id, amount, method: method || "bank",
      bankDetails, easyPaisa, jazzCash,
      status: "pending",
    });

    await createNotification({
      user: req.user._id, type: "payout",
      title: "Payout request received",
      message: `Your payout request of PKR ${amount} has been received and will be processed within 3–5 business days.`,
    });

    res.status(201).json({ success: true, payout, message: "Payout request submitted. Processing in 3–5 business days." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/v1/payouts/balance  (seller — check available balance)
exports.getBalance = async (req, res) => {
  try {
    const balance = await getSellerBalance(req.user._id);
    res.json({ success: true, balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin payout management ──────────────────────────────────

// GET /api/v1/payouts/admin/all
exports.getAllPayouts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Payout.countDocuments(query);
    const payouts = await Payout.find(query)
      .populate("seller", "name shopName email")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ success: true, payouts, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/payouts/admin/:id/process
exports.processPayout = async (req, res) => {
  try {
    const { status, transactionRef, rejectionReason, notes } = req.body;
    if (!["processing", "paid", "rejected"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      { status, transactionRef, rejectionReason, notes, processedAt: new Date(), processedBy: req.user._id },
      { new: true }
    ).populate("seller", "name email");

    if (!payout) return res.status(404).json({ success: false, message: "Payout not found" });

    const notifMsg = status === "paid"
      ? `Your payout of PKR ${payout.amount} has been processed. Ref: ${transactionRef || "N/A"}`
      : status === "rejected"
      ? `Your payout request was rejected: ${rejectionReason || "No reason provided"}`
      : `Your payout of PKR ${payout.amount} is being processed.`;

    await createNotification({ user: payout.seller._id, type: "payout", title: `Payout ${status}`, message: notifMsg });

    res.json({ success: true, payout });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
