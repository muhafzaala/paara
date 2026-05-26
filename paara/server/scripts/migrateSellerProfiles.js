require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const SellerProfile = require("../models/SellerProfile");

async function main() {
  console.log("─── PAARA Seller Profile Migration ───────────────────────");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected:", mongoose.connection.host);

  // Find all users with role=seller or role=admin (admins might also have shop fields)
  const sellers = await User.find({ role: { $in: ["seller", "admin"] } });
  console.log(`Found ${sellers.length} seller/admin user(s) to evaluate.`);

  let created = 0, alreadyExists = 0, skippedEmpty = 0;

  for (const u of sellers) {
    // Skip admins that have no shop data — they're not sellers
    const hasSellerData = u.shopName || u.shopDescription || u.verificationStatus !== "none";
    if (!hasSellerData) {
      skippedEmpty++;
      continue;
    }

    const existing = await SellerProfile.findOne({ user: u._id });
    if (existing) {
      alreadyExists++;
      continue;
    }

    // Map heritage badges from old string format to new enum if needed
    const badges = Array.isArray(u.heritageBadges) ? u.heritageBadges : [];

    await SellerProfile.create({
      user: u._id,
      shopName: u.shopName || "",
      shopDescription: u.shopDescription || "",
      shopBanner: u.shopBanner || "",
      city: u.city || "",
      region: u.region || "",
      verificationStatus: u.verificationStatus || "none",
      verificationStage: u.verificationStatus === "approved" ? 4 :
                         u.verificationStatus === "field_visit_scheduled" ? 3 :
                         u.verificationStatus === "documents_under_review" ? 2 :
                         u.verificationStatus === "applied" ? 1 : 0,
      appliedAt: u.verificationStatus !== "none" ? u.createdAt : undefined,
      approvedAt: u.verificationStatus === "approved" ? u.updatedAt : undefined,
      heritageBadges: badges.filter(b =>
        ["authentic", "master_artisan", "heritage_keeper", "top_rated", "community_favorite"].includes(b)
      ),
      isActive: u.isActive !== false,
    });
    created++;
    console.log(`   ➕ Created profile for: ${u.email} (${u.shopName || "no shop name"})`);
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
