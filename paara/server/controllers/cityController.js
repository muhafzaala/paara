const { City } = require("../models/extras");
const Product   = require("../models/Product");

// GET /api/v1/cities  — Public
exports.getCities = async (req, res) => {
  try {
    let cities = await City.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });

    if (!cities.length) {
      // Static seed fallback — used before DB is seeded
      return res.json({
        success: true,
        cities: [
          { name: "Lahore",    region: "Punjab",           province: "Punjab",        craftSpecialties: ["Textile", "Phulkari", "Wood Inlay"] },
          { name: "Multan",    region: "Punjab",           province: "Punjab",        craftSpecialties: ["Blue Pottery", "Camel Skin", "Multani Kashi"] },
          { name: "Hunza",     region: "Gilgit-Baltistan", province: "Gilgit-Baltistan", craftSpecialties: ["Woodwork", "Hunza Caps", "Gemstones"] },
          { name: "Peshawar",  region: "KPK",              province: "Khyber Pakhtunkhwa", craftSpecialties: ["Copper", "Brass", "Chappal"] },
          { name: "Karachi",   region: "Sindh",            province: "Sindh",         craftSpecialties: ["Ajrak", "Block Print", "Sindhi Embroidery"] },
          { name: "Skardu",    region: "Gilgit-Baltistan", province: "Gilgit-Baltistan", craftSpecialties: ["Jade", "Gemstones", "Stone Carving"] },
          { name: "Gilgit",    region: "Gilgit-Baltistan", province: "Gilgit-Baltistan", craftSpecialties: ["Silver Jewelry", "Tribal Craft"] },
          { name: "Balochistan",region: "Balochistan",     province: "Balochistan",   craftSpecialties: ["Mirror Work", "Balochi Embroidery"] },
          { name: "Islamabad", region: "Federal Capital",  province: "ICT",           craftSpecialties: ["Marble", "Stone Work"] },
          { name: "Faisalabad",region: "Punjab",           province: "Punjab",        craftSpecialties: ["Khaddar", "Textiles", "Lawn"] },
          { name: "Mardan",    region: "KPK",              province: "Khyber Pakhtunkhwa", craftSpecialties: ["Leather", "Pottery"] },
          { name: "Quetta",    region: "Balochistan",      province: "Balochistan",   craftSpecialties: ["Carpet Weaving", "Tribal Jewelry"] },
        ],
      });
    }

    res.json({ success: true, cities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/cities/:name  — Public (city detail with product count)
exports.getCityDetail = async (req, res) => {
  try {
    const cityName = req.params.name;
    const [city, productCount] = await Promise.all([
      City.findOne({ name: new RegExp(`^${cityName}$`, "i") }),
      Product.countDocuments({ city: new RegExp(`^${cityName}$`, "i"), status: "approved" }),
    ]);
    res.json({ success: true, city: city || { name: cityName }, productCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/cities  (admin)
exports.createCity = async (req, res) => {
  try {
    const city = await City.create(req.body);
    res.status(201).json({ success: true, city });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "City already exists" });
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/cities/:id  (admin)
exports.updateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!city) return res.status(404).json({ success: false, message: "City not found" });
    res.json({ success: true, city });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/cities/:id  (admin)
exports.deleteCity = async (req, res) => {
  try {
    await City.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "City deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
