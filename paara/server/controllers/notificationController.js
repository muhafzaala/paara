const Notification = require("../models/Notification");

exports.list = async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unread = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, notifications: items, unread });
};

exports.markRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true });
};

exports.create = async (user, type, title, message, link, metadata = {}) =>
  Notification.create({ user, type, title, message, link, metadata });
