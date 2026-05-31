const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/assistantController");

// POST /api/v1/assistant/chat — no auth required
router.post("/chat", chat);


module.exports = router;
