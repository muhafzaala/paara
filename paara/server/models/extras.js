const mongoose = require("mongoose");

// ─── SellerVerification ───────────────────────────────────────
const sellerVerificationSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  stage: { type: String, enum: ["applied", "document_review", "field_visit_scheduled", "approved", "rejected", "suspended"], default: "applied" },
  businessName: String,
  businessType: String,
  craftSpecialization: [String],
  city: String,
  region: String,
  cnicNumber: String,
  workshopAddress: String,
  yearsOfExperience: Number,
  documents: [{ type: { type: String }, url: String, uploadedAt: Date, status: { type: String, default: "pending" } }],
  notes: [{ text: String, by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, createdAt: { type: Date, default: Date.now } }],
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
  rejectionReason: String,
  heritageBadges: [String],
  fieldVisit: { scheduledAt: Date, completedAt: Date, report: String, by: { type: mongoose.Schema.Types.ObjectId, ref: "User" } },
  appeal: { text: String, submittedAt: Date, decision: String, decidedAt: Date },
}, { timestamps: true });

const SellerVerification = mongoose.model("SellerVerification", sellerVerificationSchema);

// ─── Message ─────────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

// ─── City ────────────────────────────────────────────────────
const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  region: String,
  province: String,
  image: String,
  description: String,
  craftSpecialties: [String],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

const City = mongoose.model("City", citySchema);

// ─── Collection ──────────────────────────────────────────────
const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  image: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Collection = mongoose.model("Collection", collectionSchema);

module.exports = { SellerVerification, Message, City, Collection };
