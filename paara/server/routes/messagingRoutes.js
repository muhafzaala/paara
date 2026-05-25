const express = require("express");
const router  = express.Router();
const { getConversations, getMessages, sendMessage, markRead, getUnreadCount } = require("../controllers/messagingController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/messages",                getConversations);
router.get("/messages/unread-count",   getUnreadCount);
router.get("/messages/:conversationId",getMessages);
router.post("/messages",               sendMessage);
router.patch("/messages/:id/read",     markRead);

module.exports = router;
