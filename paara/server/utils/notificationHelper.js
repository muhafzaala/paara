const Notification = require("../models/Notification");

const createNotification = async ({ user, type, title, message, data }) => {
  try {
    return await Notification.create({ user, type, title, message, data });
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};

module.exports = { createNotification };
