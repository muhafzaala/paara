/** Migration: set verificationStatus=none for all sellers that have no value */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.updateMany(
    { role: "seller", verificationStatus: { $exists: false } },
    { $set: { verificationStatus: "none" } }
  );
  console.log(`Updated ${result.modifiedCount} sellers`);
  await mongoose.disconnect();
  process.exit(0);
})();
