const express = require("express");
const router  = express.Router();
const { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, getCulturalJourney, changePassword, deleteAccount } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/profile",          getProfile);
router.put("/profile",          updateProfile);
router.patch("/change-password",changePassword);
router.delete("/account",       deleteAccount);
router.get("/addresses",        getAddresses);
router.post("/addresses",       addAddress);
router.put("/addresses/:id",    updateAddress);
router.delete("/addresses/:id", deleteAddress);
router.get("/cultural-journey", getCulturalJourney);

module.exports = router;
