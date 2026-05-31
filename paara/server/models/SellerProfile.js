const mongoose = require("mongoose");

const sellerProfileSchema = new mongoose.Schema({
  // 1:1 link to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },

  // ─── Shop basics ────────────────────────────────
  shopName: { type: String, trim: true, maxlength: 100 },
  shopSlug: { type: String, trim: true, unique: true, sparse: true, index: true }, // url-safe, e.g. "test-heritage-crafts"
  shopDescription: { type: String, maxlength: 2000 },
  shopBanner: { type: String, default: "" }, // cloudinary url
  shopLogo: { type: String, default: "" },
  yearEstablished: { type: Number, min: 1900, max: new Date().getFullYear() },
  shopStory: { type: String, maxlength: 5000 }, // longer-form heritage narrative

  // ─── Regional & craft focus ────────────────────
  city: { type: String, trim: true },
  region: { type: String, trim: true },
  craftSpecialties: [{ type: String, trim: true }], // ["Blue Pottery", "Pashmina", ...]
  languagesSpoken: [{ type: String, trim: true, default: ["Urdu"] }],

  // ─── Verification pipeline (4 stages) ──────────
  verificationStatus: {
    type: String,
    enum: ["none", "applied", "documents_under_review", "field_visit_scheduled", "approved", "rejected", "reapply_requested"],
    default: "none",
    index: true,
  },
  verificationStage: { type: Number, default: 0, min: 0, max: 4 }, // 0=none, 1=applied, 2=docs, 3=visit, 4=approved
  verificationHistory: [{
    stage: String,
    notes: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
  }],
  appliedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  adminNotes: String, // latest message from admin (rejection reason or reapply request notes)

  // ─── Identity documents (Cloudinary URLs) ──────
  documents: {
    cnicFront: { type: String, default: "" },
    cnicBack: { type: String, default: "" },
    workshopPhotos: [String], // 3-5 photos of workshop / tools
    craftPhotos: [String],    // photos of finished pieces / work-in-progress
  },

  // ─── Personal / contact info ───────────────────
  phone: { type: String, trim: true },
  cnicNumber: { type: String, trim: true },
  address: { type: String, trim: true, maxlength: 500 },

  // ─── Social media links ─────────────────────────
  socialLinks: {
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    tiktok: { type: String, default: "" },
    website: { type: String, default: "" },
  },

  // ─── Mobile money payouts ───────────────────────
  mobilePay: {
    easypaisa: { type: String, default: "" },
    jazzcash: { type: String, default: "" },
  },

  // ─── Bank details for payouts ──────────────────
  bank: {
    accountHolderName: { type: String, default: "" },
    accountNumber: { type: String, default: "" }, // last 4 digits visible in API responses, full only stored server-side
    bankName: { type: String, default: "" },
    iban: { type: String, default: "" },
  },

  // ─── Heritage badges (multi-tier) ──────────────
  heritageBadges: [{
    type: String,
    enum: ["authentic", "master_artisan", "heritage_keeper", "top_rated", "community_favorite"],
  }],

  // ─── Operational metrics (denormalized for fast reads) ──
  totalProductsListed: { type: Number, default: 0 },
  totalOrdersCompleted: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },

  // ─── Status flags ──────────────────────────────
  isActive: { type: Boolean, default: true },
  isVisible: { type: Boolean, default: true }, // public profile visibility toggle

  // ─── Accent color for storefront theme ──────────
  accentColor: { type: String, default: "#C9921A" },
}, {
  timestamps: true,
});

// Auto-generate shopSlug from shopName on save if not set
sellerProfileSchema.pre("save", function (next) {
  if (this.shopName && !this.shopSlug) {
    this.shopSlug = this.shopName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
  }
  next();
});

module.exports = mongoose.model("SellerProfile", sellerProfileSchema);
