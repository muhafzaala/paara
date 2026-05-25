const express = require("express");
const router  = express.Router();
const { getRecommendations, getTrending, getFeatured } = require("../controllers/recommendationsController");

router.get("/recommendations",          getRecommendations);
router.get("/recommendations/trending", getTrending);
router.get("/recommendations/featured", getFeatured);

module.exports = router;
