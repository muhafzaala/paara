const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Product images storage
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "paara/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
  },
});

// Avatar / profile photo storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "paara/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto" }],
  },
});

// Verification document storage
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "paara/documents",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

// Review photo storage
const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "paara/reviews",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
  },
});

const uploadProduct  = multer({ storage: productStorage,  limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
const uploadAvatar   = multer({ storage: avatarStorage,   limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB
const uploadDocument = multer({ storage: documentStorage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
const uploadReview   = multer({ storage: reviewStorage,   limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// Helper: delete a file from Cloudinary by URL
const deleteFromCloudinary = async (url) => {
  if (!url || !url.includes("cloudinary.com")) return;
  try {
    const parts = url.split("/");
    const publicIdWithExt = parts.slice(-2).join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

module.exports = { cloudinary, uploadProduct, uploadAvatar, uploadDocument, uploadReview, deleteFromCloudinary };
