require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Drop stale unique index on phone (leftover from old schema — current model doesn't use it)
  try {
    await User.collection.dropIndex("phone_1");
    console.log("🗑  Dropped stale unique index: phone_1");
  } catch (_) {
    // Index didn't exist — nothing to do
  }

  const existing = await User.findOne({ email: "admin@paara.pk" });
  if (existing) {
    existing.role = "admin";
    existing.password = "Admin@2026!";
    existing.isActive = true;
    existing.isEmailVerified = true;
    existing.name = "PAARA Admin";
    await existing.save();
    console.log("✅ Admin updated: admin@paara.pk / Admin@2026!");
  } else {
    await User.create({ name: "PAARA Admin", email: "admin@paara.pk", password: "Admin@2026!", role: "admin", isActive: true, isEmailVerified: true });
    console.log("✅ Admin created: admin@paara.pk / Admin@2026!");
  }
  await mongoose.disconnect();
  process.exit(0);
})();
