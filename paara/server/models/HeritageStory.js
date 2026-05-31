const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  excerpt: { type: String, default: "" },
  body: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  images: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  region: { type: String, default: "" },
  craft: { type: String, default: "" },
  tags: [String],
  isPublished: { type: Boolean, default: false, index: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

schema.pre("validate", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 72) +
      "-" +
      Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model("HeritageStory", schema);
