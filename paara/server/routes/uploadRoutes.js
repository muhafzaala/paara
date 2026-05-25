const express = require("express");
const router  = express.Router();
const { uploadProductImages, uploadAvatar, uploadReviewPhoto, uploadDocument } = require("../controllers/uploadController");
const { uploadProduct, uploadAvatar: multerAvatar, uploadReview, uploadDocument: multerDoc } = require("../utils/cloudinary");
const { protect, sellerOrAdmin } = require("../middleware/authMiddleware");

// Product images — seller only, up to 6 at once
router.post(
  "/product-images",
  protect,
  sellerOrAdmin,
  uploadProduct.array("images", 6),
  uploadProductImages
);

// Avatar — any authenticated user
router.post(
  "/avatar",
  protect,
  multerAvatar.single("avatar"),
  uploadAvatar
);

// Review photo — buyer
router.post(
  "/review-photo",
  protect,
  uploadReview.single("photo"),
  uploadReviewPhoto
);

// Verification document — seller
router.post(
  "/document",
  protect,
  multerDoc.single("document"),
  uploadDocument
);

module.exports = router;
