const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" },
  street: String,
  city: String,
  postalCode: String,
  phone: String,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
  avatar: { type: String, default: "" },
  phone: { type: String, default: "" },
  city: { type: String, default: "" },

  // Seller fields
  shopName: { type: String, default: "" },
  shopDescription: { type: String, default: "" },
  shopBanner: { type: String, default: "" },
  region: { type: String, default: "" },
  verificationStatus: {
    type: String,
    enum: ["none", "pending", "under_review", "field_visit", "approved", "rejected", "suspended"],
    default: "none",
  },
  heritageBadges: [String],

  // Buyer profile
  addresses: [addressSchema],
  favoriteCategories: [String],
  favoriteCities: [String],

  // Auth
  isEmailVerified: { type: Boolean, default: false },
  emailOtp: String,
  emailOtpExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  passwordResetToken: String,
  passwordResetExpires: Date,

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
