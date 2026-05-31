const Notification = require("../models/Notification");
const User = require("../models/User");

async function notifyUser(userId, { type, title, message, link, metadata } = {}) {
  try {
    await Notification.create({ user: userId, type, title, message, link, metadata });
  } catch (e) {
    console.error("[notify] notifyUser failed:", e.message);
  }
}

async function notifyAllAdmins({ type, title, message, link, metadata } = {}) {
  try {
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    if (!admins.length) return;
    await Notification.insertMany(
      admins.map((a) => ({ user: a._id, type, title, message, link, metadata })),
      { ordered: false }
    );
  } catch (e) {
    console.error("[notify] notifyAllAdmins failed:", e.message);
  }
}

async function notifyAllBuyers({ type, title, message, link, metadata } = {}) {
  try {
    const buyers = await User.find({ role: "buyer" }).select("_id").lean();
    if (!buyers.length) return;
    await Notification.insertMany(
      buyers.map((b) => ({ user: b._id, type, title, message, link, metadata })),
      { ordered: false }
    );
  } catch (e) {
    console.error("[notify] notifyAllBuyers failed:", e.message);
  }
}

module.exports = { notifyUser, notifyAllAdmins, notifyAllBuyers };
