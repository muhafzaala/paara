const express = require("express");
const router  = express.Router();
const { getConversations, getMessages, sendMessage, markRead, getUnreadCount } = require("../controllers/messagingController");
const { protect } = require("../middleware/authMiddleware");

router.get("/messages",                 protect, getConversations);
router.get("/messages/unread-count",    protect, getUnreadCount);
router.get("/messages/:conversationId", protect, getMessages);
router.post("/messages",                protect, sendMessage);
router.patch("/messages/:id/read",      protect, markRead);

module.exports = router;
