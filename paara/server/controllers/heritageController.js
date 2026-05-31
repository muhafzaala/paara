const HeritageStory = require("../models/HeritageStory");

exports.list = async (req, res) => {
  try {
    const { region, craft, page = 1, limit = 12 } = req.query;
    const filter = { isPublished: true };
    if (region) filter.region = region;
    if (craft) filter.craft = craft;
    const skip = (Number(page) - 1) * Number(limit);
    const [stories, total] = await Promise.all([
      HeritageStory.find(filter)
        .populate("seller", "name shopName")
        .populate("product", "name images price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      HeritageStory.countDocuments(filter),
    ]);
    res.json({ success: true, stories, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const story = await HeritageStory.findOneAndUpdate(
      { _id: req.params.id, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("seller", "name shopName city")
      .populate("product", "name images price _id");
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    res.json({ success: true, story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMine = async (req, res) => {
  try {
    const stories = await HeritageStory.find({ seller: req.user._id })
      .populate("product", "name images")
      .sort({ createdAt: -1 });
    res.json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, excerpt, body, coverImage, images, product, region, craft, tags, isPublished } = req.body;
    const story = await HeritageStory.create({
      title, excerpt, body,
      coverImage: coverImage || "",
      images: Array.isArray(images) ? images : [],
      product: product || null,
      region: region || "",
      craft: craft || "",
      tags: Array.isArray(tags) ? tags : [],
      isPublished: !!isPublished,
      seller: req.user._id,
    });
    res.status(201).json({ success: true, story });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const story = await HeritageStory.findOne({ _id: req.params.id, seller: req.user._id });
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    const allowed = ["title", "excerpt", "body", "coverImage", "images", "product", "region", "craft", "tags", "isPublished"];
    allowed.forEach((k) => { if (req.body[k] !== undefined) story[k] = req.body[k]; });
    await story.save();
    res.json({ success: true, story });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await HeritageStory.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!deleted) return res.status(404).json({ success: false, message: "Story not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
