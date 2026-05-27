const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { list, markRead } = require("../controllers/notificationController");
router.get("/notifications", protect, list);
router.patch("/notifications/read-all", protect, markRead);
module.exports = router;
