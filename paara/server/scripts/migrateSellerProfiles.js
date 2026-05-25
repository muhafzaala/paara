/** Migration: backfill shopName for sellers who have none */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const sellers = await User.find({ role: "seller", $or: [{ shopName: "" }, { shopName: { $exists: false } }] });
  let fixed = 0;
  for (const s of sellers) {
    s.shopName = `${s.name}'s Atelier`;
    await s.save();
    fixed++;
  }
  console.log(`Backfilled ${fixed} seller shop names`);
  await mongoose.disconnect();
  process.exit(0);
})();
