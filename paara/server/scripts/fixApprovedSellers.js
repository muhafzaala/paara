/**
 * Migration: ensure all sellers with stage=approved in SellerVerification
 * have verificationStatus=approved on their User document.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const { SellerVerification } = require("../models/extras");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const approved = await SellerVerification.find({ stage: "approved" }).select("seller");
  let fixed = 0;
  for (const v of approved) {
    const result = await User.updateOne(
      { _id: v.seller, verificationStatus: { $ne: "approved" } },
      { verificationStatus: "approved" }
    );
    if (result.modifiedCount) fixed++;
  }
  console.log(`Fixed ${fixed} seller(s)`);
  await mongoose.disconnect();
  process.exit(0);
})();
