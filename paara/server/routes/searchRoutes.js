const express = require("express");
const router  = express.Router();
const { search, getSearchSuggestions } = require("../controllers/searchController");

router.get("/search",             search);
router.get("/search/suggestions", getSearchSuggestions);

module.exports = router;
