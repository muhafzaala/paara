require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const PRIMARY = {
  name: "Afzaal",
  email: "mafzaala333@gmail.com",
  password: "PaaraPrimary@2026!",
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let u = await User.findOne({ email: PRIMARY.email });
  const hash = await bcrypt.hash(PRIMARY.password, 10);
  if (u) {
    u.role = "admin";
    u.isPrimaryAdmin = true;
    u.adminStatus = "active";
    u.twoFactorRequired = true;
    u.isActive = true;
    u.password = hash;
    u.name = PRIMARY.name;
    await u.save();
    console.log("✓ Primary admin updated:", u._id);
  } else {
    u = await User.create({
      name: PRIMARY.name,
      email: PRIMARY.email,
      password: hash,
      role: "admin",
      isPrimaryAdmin: true,
      adminStatus: "active",
      twoFactorRequired: true,
      isActive: true,
    });
    console.log("✓ Primary admin created:", u._id);
  }
  console.log(`Credentials: ${PRIMARY.email} / ${PRIMARY.password}`);
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
