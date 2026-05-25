const express = require("express");
const { createReview, voteHelpful, sellerResponse, getMyReviews, getProductReviews } = require("../controllers/reviewController");
const { protect, sellerOrAdmin } = require("../middleware/authMiddleware");

const productReviewRouter = express.Router({ mergeParams: true });
productReviewRouter.get("/:productId/reviews", getProductReviews);

const standaloneReviewRouter = express.Router();
standaloneReviewRouter.post("/reviews", protect, createReview);
standaloneReviewRouter.patch("/reviews/:id/helpful", protect, voteHelpful);
standaloneReviewRouter.patch("/reviews/:id/seller-response", protect, sellerOrAdmin, sellerResponse);
standaloneReviewRouter.get("/reviews/my", protect, getMyReviews);

module.exports = { productReviewRouter, standaloneReviewRouter };
