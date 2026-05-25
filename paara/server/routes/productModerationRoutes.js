const express = require("express");
const router = express.Router();
const { moderateProduct } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
router.patch("/admin/products/:id/moderate", protect, adminOnly, moderateProduct);
module.exports = router;
