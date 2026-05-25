const express = require("express");
const router  = express.Router();
const { getCollections, getCollection, createCollection, updateCollection, updateCollectionProducts, deleteCollection } = require("../controllers/collectionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/collections",                    getCollections);
router.get("/collections/:slug",              getCollection);
router.post("/collections",                   protect, adminOnly, createCollection);
router.put("/collections/:id",                protect, adminOnly, updateCollection);
router.patch("/collections/:id/products",     protect, adminOnly, updateCollectionProducts);
router.delete("/collections/:id",             protect, adminOnly, deleteCollection);

module.exports = router;
