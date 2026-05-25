const { deleteFromCloudinary } = require("../utils/cloudinary");

// POST /api/v1/upload/product-images  (seller — up to 6 images)
exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded" });

    const urls = req.files.map((f) => f.path);
    res.status(201).json({ success: true, urls, message: `${urls.length} image(s) uploaded` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/upload/avatar  (any authenticated user)
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const User = require("../models/User");
    const user = await User.findById(req.user._id);
    if (user.avatar) await deleteFromCloudinary(user.avatar);

    user.avatar = req.file.path;
    await user.save();
    res.json({ success: true, url: req.file.path, message: "Avatar updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/upload/review-photo  (buyer)
exports.uploadReviewPhoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });
    res.status(201).json({ success: true, url: req.file.path });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/upload/document  (seller verification)
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const { SellerVerification } = require("../models/extras");
    const docType = req.body.type || "other";

    await SellerVerification.findOneAndUpdate(
      { seller: req.user._id },
      {
        $push: {
          documents: { type: docType, url: req.file.path, uploadedAt: new Date(), status: "pending" },
        },
      },
      { upsert: true }
    );

    res.status(201).json({ success: true, url: req.file.path, type: docType, message: "Document uploaded" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
