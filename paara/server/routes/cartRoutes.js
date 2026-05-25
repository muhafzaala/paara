const express = require("express");
const router  = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cartController");
const { checkout } = require("../controllers/orderController");
const { validateCoupon } = require("../controllers/couponController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/",                   getCart);
router.post("/",                  addToCart);
router.post("/checkout",          checkout);
router.post("/coupons/validate",  validateCoupon);
router.post("/clear",             clearCart);           // POST /cart/clear — avoids DELETE / ambiguity
router.put("/:productId",         updateCartItem);
router.delete("/:productId",      removeFromCart);
// Keep DELETE / as well for completeness
router.delete("/",                clearCart);

module.exports = router;
