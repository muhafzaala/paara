require("dotenv").config();
const mongoose = require("mongoose");
const SellerProfile = require("../models/SellerProfile");

// Status normalization map — old User schema enum → new SellerProfile enum
const STATUS_MAP = {
  "none":                "none",
  "not_applied":         "none",
  "pending":             "applied",
  "under_review":        "documents_under_review",
  "field_visit":         "field_visit_scheduled",
  "approved":            "approved",
  "rejected":            "rejected",
  "suspended":           "rejected",
};

const STAGE_MAP = {
  "none": 0, "applied": 1, "documents_under_review": 2,
  "field_visit_scheduled": 3, "approved": 4, "rejected": 0,
};

async function main() {
  console.log("─── PAARA Seller Profile Migration (raw Mongo) ────────────");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected:", mongoose.connection.host);

  // Read raw User docs — bypass Mongoose schema (which no longer has shop fields)
  const rawUsers = await mongoose.connection.collection("users")
    .find({ role: { $in: ["seller", "admin"] } }).toArray();
  console.log(`Found ${rawUsers.length} seller/admin user(s) in raw DB.`);

  let created = 0, alreadyExists = 0, skippedEmpty = 0;

  for (const u of rawUsers) {
    const hasSellerData = (u.shopName && u.shopName.trim()) ||
                          (u.shopDescription && u.shopDescription.trim()) ||
                          (u.verificationStatus && !["none", "not_applied", undefined, null, ""].includes(u.verificationStatus));
    if (!hasSellerData) {
      skippedEmpty++;
      continue;
    }

    const existing = await SellerProfile.findOne({ user: u._id });
    if (existing) {
      alreadyExists++;
      continue;
    }

    const normalizedStatus = STATUS_MAP[u.verificationStatus] || "none";
    const badges = Array.isArray(u.heritageBadges) ? u.heritageBadges : [];

    await SellerProfile.create({
      user: u._id,
      shopName: u.shopName || "",
      shopDescription: u.shopDescription || "",
      shopBanner: u.shopBanner || "",
      city: u.city || "",
      region: u.region || "",
      verificationStatus: normalizedStatus,
      verificationStage: STAGE_MAP[normalizedStatus] || 0,
      appliedAt: normalizedStatus !== "none" ? u.createdAt : undefined,
      approvedAt: normalizedStatus === "approved" ? u.updatedAt : undefined,
      heritageBadges: badges.filter((b) =>
        ["authentic", "master_artisan", "heritage_keeper", "top_rated", "community_favorite"].includes(b)
      ),
      isActive: u.isActive !== false,
    });
    created++;
    console.log(`   ➕ ${u.email || u._id} — "${u.shopName || "(no shop)"}"`);
  }

  console.log("─── Summary ──────────────────────────────────────────────");
  console.log(`   Created new profiles:   ${created}`);
  console.log(`   Already had profile:    ${alreadyExists}`);
  console.log(`   Skipped (no shop data): ${skippedEmpty}`);
  console.log(`   Total SellerProfiles:   ${await SellerProfile.countDocuments({})}`);
  console.log("──────────────────────────────────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
