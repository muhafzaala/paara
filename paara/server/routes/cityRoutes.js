const express = require("express");
const router  = express.Router();
const { getCities, getCityDetail, createCity, updateCity, deleteCity } = require("../controllers/cityController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/cities",      getCities);
router.get("/cities/:name",getCityDetail);
router.post("/cities",     protect, adminOnly, createCity);
router.put("/cities/:id",  protect, adminOnly, updateCity);
router.delete("/cities/:id",protect, adminOnly, deleteCity);

module.exports = router;
