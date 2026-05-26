require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Product = require("../models/Product");

const DEMO_SELLER_EMAIL = "demo.artisans@paara.pk";
const DEMO_SELLER_PASSWORD = "DemoArtisans2026!";

// 16 authentic Pakistani regional crafts. Each product is owned by the demo seller,
// pre-approved, and marked isDemo so the frontend can render a "DEMO" badge.
const DEMO_PRODUCTS = [
  {
    name: "Multani Blue Pottery Vase",
    nameUrdu: "کاشی کاری گلدان",
    description: "Hand-painted in cobalt blue and turquoise on a chalk-white ground, this vase carries the kashi-kari tradition of Multan into the modern home. Each piece is glazed, fired, and hand-finished by a master potter.",
    price: 4200, category: "Pottery", city: "Multan", region: "Punjab",
    stock: 30, material: "Earthenware Clay", craftType: "Kashi-Kari Blue Pottery",
    artisan: "Ustad Muhammad Yousaf",
    originStory: "Multan's kashi-kari tradition dates back to the 14th century, brought by Sufi saints and refined under the Mughals. The signature cobalt and turquoise palette is unique to southern Punjab.",
    images: ["/demo-products/multani-blue-pottery-1.jpg"],
  },
  {
    name: "Hunza Walnut Wood Carved Tray",
    nameUrdu: "اخروٹ کا منقش طبق",
    description: "Carved from a single piece of mountain walnut, this tray showcases the geometric latticework that defines Hunza woodcraft. Food-safe oil finish.",
    price: 6500, category: "Woodwork", city: "Hunza", region: "Gilgit-Baltistan",
    stock: 25, material: "Mountain Walnut Wood", craftType: "Geometric Wood Carving",
    artisan: "Ghulam Hussain",
    originStory: "Walnut woodcarving in the Hunza valley has been a winter craft for generations, with motifs inspired by Karakoram mountain geometry and Wakhi cultural symbols.",
    images: ["/demo-products/hunza-walnut-tray-1.jpg"],
  },
  {
    name: "Sindhi Ajrak Shawl",
    nameUrdu: "اجرک شال",
    description: "Block-printed by hand with natural indigo and madder dyes through a 16-stage process. Traditional crimson and indigo geometric motifs on pure cotton.",
    price: 4800, category: "Textile", city: "Hyderabad", region: "Sindh",
    stock: 40, material: "100% Cotton", craftType: "Ajrak Block Print",
    artisan: "Ali Hassan Soomro",
    originStory: "Ajrak is the cultural emblem of Sindh, with origins traced to the Indus Valley Civilization. Each shawl passes through 16 stages of washing, dyeing, and resist-printing over several weeks.",
    images: ["/demo-products/sindhi-ajrak-1.jpg"],
  },
  {
    name: "Peshawari Copper Pitcher",
    nameUrdu: "تانبے کا صراحی",
    description: "Hand-hammered from a single sheet of copper, finished with traditional repoussé patterns. Keeps water naturally cool.",
    price: 5800, category: "Metalwork", city: "Peshawar", region: "Khyber Pakhtunkhwa",
    stock: 35, material: "Hand-Hammered Copper", craftType: "Naqashi Copper Work",
    artisan: "Haji Faiz Muhammad",
    originStory: "The coppersmiths of Peshawar's Misgaran Bazaar have practiced naqashi — the art of patterned copper hammering — for over 200 years, with techniques passed father-to-son.",
    images: ["/demo-products/peshawari-copper-pitcher-1.jpg"],
  },
  {
    name: "Sialkot Hand-Stitched Leather Football",
    nameUrdu: "چمڑے کا فٹبال",
    description: "Match-grade football with 32 hand-stitched panels. Sialkot supplies the majority of the world's premium hand-stitched footballs.",
    price: 3200, category: "Sporting Goods", city: "Sialkot", region: "Punjab",
    stock: 50, material: "Genuine Leather", craftType: "Hand-Stitched Sportcraft",
    artisan: "Sialkot Craftsmen's Cooperative",
    originStory: "Sialkot has been the world's hand-stitched football capital since the 1880s. Every FIFA World Cup since 1982 has used balls partially or fully crafted here.",
    images: ["/demo-products/sialkot-football-1.jpg"],
  },
  {
    name: "Wazirabad Damascus Steel Chef Knife",
    nameUrdu: "وزیر آبادی چاقو",
    description: "Forged from 67-layer Damascus steel with a Pakistani walnut handle. Mirror-polished edge, hand-sharpened to 15°.",
    price: 7500, category: "Cutlery", city: "Wazirabad", region: "Punjab",
    stock: 30, material: "Damascus Steel + Walnut", craftType: "Pattern-Welded Bladesmithing",
    artisan: "Muhammad Aslam & Sons",
    originStory: "Wazirabad has been the cutlery capital of South Asia since Mughal times. Modern Wazirabad smiths preserve the ancient pattern-welding technique that produces Damascus steel.",
    images: ["/demo-products/wazirabad-knife-1.jpg"],
  },
  {
    name: "Chiniot Hand-Carved Walnut Side Table",
    nameUrdu: "چنیوٹی منقش میز",
    description: "Solid walnut with hand-carved floral filigree on all four sides. A statement piece reflecting Chiniot's centuries-old furniture tradition.",
    price: 18500, category: "Furniture", city: "Chiniot", region: "Punjab",
    stock: 15, material: "Solid Walnut Wood", craftType: "Chiniot Wood Carving",
    artisan: "Master Carpenter Allah Ditta",
    originStory: "Chiniot has been Pakistan's furniture-making heartland since the 18th century. Its hand-carved walnut and rosewood pieces graced the courts of Sikh maharajas and Mughal nobles.",
    images: ["/demo-products/chiniot-side-table-1.jpg"],
  },
  {
    name: "Peshawari Chappal (Hand-Stitched)",
    nameUrdu: "پشاوری چپل",
    description: "Traditional Pashtun open-toe sandal with hand-stitched leather sole and natural buffalo leather upper. Worn across the region for generations.",
    price: 4500, category: "Footwear", city: "Peshawar", region: "Khyber Pakhtunkhwa",
    stock: 40, material: "Buffalo Leather", craftType: "Pashtun Footwear",
    artisan: "Khan Saddar Cobblers",
    originStory: "The Peshawari Chappal predates Pakistan itself, traditionally worn by Pashtun tribesmen. Hand-stitching and natural tanning produce footwear that lasts decades and conforms to the foot.",
    images: ["/demo-products/peshawari-chappal-1.jpg"],
  },
  {
    name: "Hunza Apricot Kernel Oil (250ml)",
    nameUrdu: "ہنزائی خوبانی کا تیل",
    description: "Cold-pressed from wild apricot kernels in the Hunza valley. Used by locals for centuries as a hair, skin, and culinary oil.",
    price: 1800, category: "Wellness", city: "Hunza", region: "Gilgit-Baltistan",
    stock: 50, material: "Wild Apricot Kernel", craftType: "Traditional Cold Pressing",
    artisan: "Hunza Women's Cooperative",
    originStory: "The Hunza people are famed for their longevity, and apricot kernel oil — pressed by local women's cooperatives — is central to their wellness tradition.",
    images: ["/demo-products/hunza-apricot-oil-1.jpg"],
  },
  {
    name: "Kashmiri Pashmina Shawl",
    nameUrdu: "کشمیری پشمینہ شال",
    description: "Hand-woven from pure Changthangi pashmina (cashmere). So fine it passes through a wedding ring. Embroidered border in muted silk.",
    price: 12500, category: "Textile", city: "Muzaffarabad", region: "Azad Jammu & Kashmir",
    stock: 20, material: "Pure Changthangi Pashmina", craftType: "Kashmiri Handloom",
    artisan: "Rashid Ahmad Pashmina Works",
    originStory: "Pashmina has been Kashmir's signature export since the 15th century, prized by Mughal emperors and European royalty. Each shawl takes 4-6 months to weave by hand.",
    images: ["/demo-products/kashmiri-pashmina-1.jpg"],
  },
  {
    name: "Bahawalpuri Hand-Embroidered Cushion Cover",
    nameUrdu: "بہاولپوری کڑھائی والا تکیہ",
    description: "Vibrant silk-thread embroidery on cotton base. Cholistani geometric motifs in fuschia, marigold, and emerald.",
    price: 2800, category: "Home Decor", city: "Bahawalpur", region: "Punjab",
    stock: 45, material: "Cotton + Silk Embroidery", craftType: "Cholistani Embroidery",
    artisan: "Cholistan Women's Embroidery Guild",
    originStory: "The desert region of Cholistan has a centuries-old embroidery tradition practiced by nomadic women, with motifs reflecting desert flora and tribal heraldry.",
    images: ["/demo-products/bahawalpuri-cushion-1.jpg"],
  },
  {
    name: "Balochi Mirror-Work Wall Tapestry",
    nameUrdu: "بلوچی شیشے کی کڑھائی",
    description: "Hand-embroidered with intricate shisha (mirror) work in traditional Balochi geometric patterns. A vibrant statement piece.",
    price: 5200, category: "Home Decor", city: "Quetta", region: "Balochistan",
    stock: 28, material: "Cotton + Glass Mirrors + Silk Thread", craftType: "Balochi Shisha Embroidery",
    artisan: "Mehrgarh Artisan Collective",
    originStory: "Shisha embroidery is a defining Baloch craft, with mirrors stitched into textiles to ward off evil. Patterns are passed mother-to-daughter and carry tribal identity.",
    images: ["/demo-products/balochi-tapestry-1.jpg"],
  },
  {
    name: "Lahori Hand-Embroidered Khussa",
    nameUrdu: "لاہوری کھسہ",
    description: "Traditional flat shoe with hand-embroidered upper in metallic thread, leather sole. Comfortable, elegant, distinctly Punjabi.",
    price: 3500, category: "Footwear", city: "Lahore", region: "Punjab",
    stock: 40, material: "Leather + Zari Embroidery", craftType: "Khussa Craft",
    artisan: "Anarkali Bazaar Khussa Makers",
    originStory: "The khussa traces to the Mughal courts of Lahore, where it was the courtly footwear of choice. Today's khussa preserves the same flat-soled, embroidered form.",
    images: ["/demo-products/lahori-khussa-1.jpg"],
  },
  {
    name: "Karachi Sea-Shell Inlay Jewelry Box",
    nameUrdu: "سیپ کا جواہر بکس",
    description: "Mango wood box with mother-of-pearl inlay sourced from the Karachi coastline. Velvet-lined interior.",
    price: 4000, category: "Home Decor", city: "Karachi", region: "Sindh",
    stock: 35, material: "Mango Wood + Mother-of-Pearl", craftType: "Sindhi Shell Inlay",
    artisan: "Karachi Coastal Craftsmen",
    originStory: "Sindh's coastal craftsmen have inlaid mother-of-pearl in wood for centuries, drawing on the abundance of the Arabian Sea coast for materials.",
    images: ["/demo-products/karachi-jewelry-box-1.jpg"],
  },
  {
    name: "Swat Hand-Woven Wool Shawl",
    nameUrdu: "سواتی اونی شال",
    description: "Hand-loomed from highland sheep wool, finished with traditional Swati geometric edging. Warm, lightweight, breathable.",
    price: 6200, category: "Textile", city: "Mingora", region: "Khyber Pakhtunkhwa",
    stock: 30, material: "Pure Highland Wool", craftType: "Swati Handloom",
    artisan: "Swat Valley Weavers",
    originStory: "Swat Valley's handloom tradition produced textiles for the Gandharan civilization. Modern Swati weavers preserve the same drawloom techniques across centuries of regional change.",
    images: ["/demo-products/swat-wool-shawl-1.jpg"],
  },
  {
    name: "Gilgit Lapis Lazuli Pendant Necklace",
    nameUrdu: "لاجورد کا ہار",
    description: "Sterling silver pendant set with a deep-blue lapis lazuli stone from the mountains of Northern Pakistan. Adjustable silver chain.",
    price: 8500, category: "Jewelry", city: "Gilgit", region: "Gilgit-Baltistan",
    stock: 25, material: "Sterling Silver + Lapis Lazuli", craftType: "Northern Areas Lapidary",
    artisan: "Karakoram Gem Crafters",
    originStory: "Lapis lazuli from the Pamir-Karakoram region was traded along the Silk Road for over 6,000 years. Pakistani lapis is among the world's finest, with deep azure flecked by golden pyrite.",
    images: ["/demo-products/gilgit-lapis-necklace-1.jpg"],
  },
  {
    name: "Multani Sohan Halwa",
    nameUrdu: "ملتانی سوہن حلوہ",
    description: "Multan's iconic dense, ghee-rich sweet studded with pistachios, almonds, and cashews. Slow-cooked over hours in a copper kadhai. Boxed in a traditional metal tin.",
    price: 1800, category: "Sweets & Mithai", city: "Multan", region: "Punjab",
    stock: 50, material: "Wheat Flour, Pure Ghee, Sugar, Mixed Nuts", craftType: "Multani Halwa Craft",
    artisan: "Hafiz Sohan Halwa House",
    originStory: "Multan's sohan halwa dates to the 16th century and is one of South Asia's most distinctive sweets. Made by a handful of dedicated halwai families who guard their recipes across generations, each tin carries the city's culinary heritage.",
    images: ["/demo-products/multani-sohan-halwa-1.jpg"],
  },
  {
    name: "Mardan Pairay (Traditional Milk Sweet)",
    nameUrdu: "مردانی پیڑے",
    description: "Hand-rolled milk-based sweets from Mardan, with the unmistakable smoky-caramelized flavor of slow-reduced cream and pure khoya. Sold by weight, packed in traditional ghee paper.",
    price: 1200, category: "Sweets & Mithai", city: "Mardan", region: "Khyber Pakhtunkhwa",
    stock: 60, material: "Pure Khoya, Sugar, Cardamom", craftType: "Pashtun Mithai Craft",
    artisan: "Mardan Halwai Cooperative",
    originStory: "Mardan's pairay are famed across Pakistan as the gold standard for milk-based sweets. The town's halwais reduce fresh buffalo milk over wood fires for hours, producing a deeply caramelized, smoky-sweet flavor unique to the region.",
    images: ["/demo-products/mardan-pairay-1.jpg"],
  },
  {
    name: "Khushab Dhoda (Special Sweet)",
    nameUrdu: "خوشاب کا ڈھوڈا",
    description: "Khushab's signature dense sweet made from gram flour, ghee, and sugar, studded generously with pistachios and almonds. Has the granular bite and slow-melting texture that defines authentic dhoda.",
    price: 1500, category: "Sweets & Mithai", city: "Khushab", region: "Punjab",
    stock: 50, material: "Gram Flour, Pure Ghee, Sugar, Pistachios, Almonds", craftType: "Khushab Dhoda Craft",
    artisan: "Khushab Heritage Sweet Makers",
    originStory: "Khushab dhoda originated in the 19th century in the small Punjab town of Khushab. Its preparation — slow-simmering gram flour in pure ghee — has remained essentially unchanged for over 150 years, making it a living piece of Punjab's culinary history.",
    images: ["/demo-products/khushab-dhoda-1.jpg"],
  },
];

async function main() {
  console.log("─── PAARA Demo Product Seeder ────────────────────────────");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected:", mongoose.connection.host);

  // STEP 1 — Find or create the demo seller account
  let demoSeller = await User.findOne({ email: DEMO_SELLER_EMAIL });
  if (!demoSeller) {
    console.log("🪡 Creating demo seller account...");
    const hashedPassword = await bcrypt.hash(DEMO_SELLER_PASSWORD, 10);
    demoSeller = await User.create({
      name: "PAARA Demo Artisans",
      email: DEMO_SELLER_EMAIL,
      password: hashedPassword,
      role: "seller",
      shopName: "PAARA Demo Artisans Collective",
      shopDescription: "Showcase storefront for PAARA's curated heritage crafts. Demonstration products only.",
      city: "Multan",
      region: "Punjab",
      verificationStatus: "approved",
      isEmailVerified: true,
      isActive: true,
    });
    console.log(`   ✅ Created seller _id: ${demoSeller._id}`);
  } else {
    console.log(`✓ Demo seller exists (_id: ${demoSeller._id})`);
  }

  // STEP 2 — Upsert products. If a product exists, update its images and core fields;
  // otherwise create it. Always idempotent.
  let created = 0, updated = 0;
  for (const p of DEMO_PRODUCTS) {
    const exists = await Product.findOne({ seller: demoSeller._id, name: p.name });
    if (exists) {
      // Update just the fields we want re-syncable
      exists.images = p.images;
      exists.description = p.description;
      exists.price = p.price;
      exists.stock = p.stock;
      exists.originStory = p.originStory;
      exists.isDemo = true;
      exists.status = "approved";
      exists.isActive = true;
      if (p.nameUrdu) exists.set("nameUrdu", p.nameUrdu, { strict: false });
      await exists.save();
      updated++;
      console.log(`   🔄 ${p.name} (${p.city})`);
    } else {
      await Product.create({
        ...p,
        seller: demoSeller._id,
        status: "approved",
        isDemo: true,
        isActive: true,
        moderationNotes: "Pre-approved demo product.",
      });
      created++;
      console.log(`   ➕ ${p.name} (${p.city})`);
    }
  }

  console.log("─── Summary ──────────────────────────────────────────────");
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Total demo products in DB: ${await Product.countDocuments({ isDemo: true })}`);
  console.log("──────────────────────────────────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeder failed:", err);
  process.exit(1);
});
