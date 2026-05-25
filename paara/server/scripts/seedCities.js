require("dotenv").config();
const mongoose = require("mongoose");
const { City } = require("../models/extras");

const CITIES = [
  { name: "Lahore",     region: "Punjab",           province: "Punjab",              craftSpecialties: ["Textile", "Phulkari", "Wood Inlay", "Ivory Work"], sortOrder: 1 },
  { name: "Multan",     region: "Punjab",           province: "Punjab",              craftSpecialties: ["Blue Pottery", "Camel Skin", "Multani Kashi", "Handicrafts"], sortOrder: 2 },
  { name: "Hunza",      region: "Gilgit-Baltistan", province: "Gilgit-Baltistan",    craftSpecialties: ["Woodwork", "Hunza Caps", "Gemstones", "Embroidery"], sortOrder: 3 },
  { name: "Peshawar",   region: "KPK",              province: "Khyber Pakhtunkhwa", craftSpecialties: ["Copper", "Brass", "Chappal", "Peshawari Sandals"], sortOrder: 4 },
  { name: "Karachi",    region: "Sindh",            province: "Sindh",               craftSpecialties: ["Ajrak", "Block Print", "Sindhi Embroidery", "Kaam"], sortOrder: 5 },
  { name: "Skardu",     region: "Gilgit-Baltistan", province: "Gilgit-Baltistan",    craftSpecialties: ["Jade", "Gemstones", "Stone Carving", "Walnut Wood"], sortOrder: 6 },
  { name: "Gilgit",     region: "Gilgit-Baltistan", province: "Gilgit-Baltistan",    craftSpecialties: ["Silver Jewelry", "Tribal Craft", "Carved Wood"], sortOrder: 7 },
  { name: "Balochistan",region: "Balochistan",      province: "Balochistan",         craftSpecialties: ["Mirror Work", "Balochi Embroidery", "Tribal Rugs"], sortOrder: 8 },
  { name: "Islamabad",  region: "Federal Capital",  province: "ICT",                 craftSpecialties: ["Marble", "Stone Work", "Contemporary Craft"], sortOrder: 9 },
  { name: "Faisalabad", region: "Punjab",           province: "Punjab",              craftSpecialties: ["Khaddar", "Textiles", "Lawn Fabric"], sortOrder: 10 },
  { name: "Mardan",     region: "KPK",              province: "Khyber Pakhtunkhwa", craftSpecialties: ["Leather", "Pottery", "Traditional Sweets"], sortOrder: 11 },
  { name: "Quetta",     region: "Balochistan",      province: "Balochistan",         craftSpecialties: ["Carpet Weaving", "Tribal Jewelry", "Baluchi Rugs"], sortOrder: 12 },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    for (const city of CITIES) {
      await City.findOneAndUpdate({ name: city.name }, city, { upsert: true, new: true });
      console.log(`✅ Seeded: ${city.name}`);
    }
    console.log(`\nSeeded ${CITIES.length} cities successfully`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
})();
