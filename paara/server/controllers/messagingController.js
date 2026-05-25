const { Message } = require("../models/extras");
const User = require("../models/User");

// GET /api/v1/messages  — list all conversation threads for this user
exports.getConversations = async (req, res) => {
  try {
    // Get latest message per conversation
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$conversation", lastMessage: { $first: "$$ROOT" }, unread: { $sum: { $cond: [{ $and: [{ $eq: ["$receiver", req.user._id] }, { $eq: ["$isRead", false] }] }, 1, 0] } } } },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    // Populate sender/receiver
    const populated = await Message.populate(conversations.map(c => c.lastMessage), [
      { path: "sender", select: "name avatar shopName role" },
      { path: "receiver", select: "name avatar shopName role" },
      { path: "product", select: "name images price" },
    ]);

    const result = conversations.map((c, i) => ({
      conversationId: c._id,
      lastMessage: populated[i],
      unread: c.unread,
    }));

    res.json({ success: true, conversations: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/messages/:conversationId  — get all messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .populate("product", "name images price")
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark all incoming as read
    await Message.updateMany(
      { conversation: req.params.conversationId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/messages  — send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, productId } = req.body;
    if (!receiverId || !text?.trim())
      return res.status(400).json({ success: false, message: "receiverId and text are required" });

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: "Recipient not found" });

    // Conversation ID: sorted pair of user IDs ensures same ID regardless of who initiates
    const conversationId = [req.user._id.toString(), receiverId].sort().join("_");

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim(),
      product: productId || undefined,
    });

    await message.populate([
      { path: "sender", select: "name avatar" },
      { path: "receiver", select: "name avatar shopName" },
      { path: "product", select: "name images price" },
    ]);

    res.status(201).json({ success: true, message, conversationId });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/messages/:id/read
exports.markRead = async (req, res) => {
  try {
    await Message.findOneAndUpdate(
      { _id: req.params.id, receiver: req.user._id },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/messages/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
