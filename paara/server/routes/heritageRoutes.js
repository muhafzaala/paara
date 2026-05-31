const express = require("express");
const router = express.Router();
const { list, getOne, getMine, create, update, remove } = require("../controllers/heritageController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", list);
router.get("/mine", protect, getMine);
router.get("/:id", getOne);
router.post("/", protect, create);
router.put("/:id", protect, update);
router.delete("/:id", protect, remove);

module.exports = router;
