const BuyerStory = require("../models/BuyerStory");
const { notifyAllAdmins, notifyUser } = require("../utils/notify");

// POST /api/v1/buyer-stories  (protected — buyer)
exports.submit = async (req, res) => {
  try {
    const { note, imageUrl, title, product } = req.body;
    if (!note || !imageUrl)
      return res.status(400).json({ success: false, message: "note and imageUrl are required" });

    const story = await BuyerStory.create({
      buyer: req.user._id,
      note, imageUrl,
      ...(title   && { title }),
      ...(product && { product }),
    });

    notifyAllAdmins({
      type: "system",
      title: "New buyer story for review",
      message: `${req.user.name} submitted a story for moderation.`,
      link: "/admin/stories",
    });

    res.status(201).json({ success: true, story });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// GET /api/v1/buyer-stories  (public)
exports.listApproved = async (req, res) => {
  try {
    const stories = await BuyerStory.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate("buyer", "name")
      .populate("product", "name");
    res.json({ success: true, stories });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/v1/buyer-stories/mine  (protected)
exports.listMine = async (req, res) => {
  try {
    const stories = await BuyerStory.find({ buyer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("product", "name images");
    res.json({ success: true, stories });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/v1/admin/buyer-stories  (admin)
exports.listForModeration = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const stories = await BuyerStory.find({ status })
      .sort({ createdAt: -1 })
      .populate("buyer", "name email")
      .populate("product", "name");
    res.json({ success: true, stories });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PATCH /api/v1/admin/buyer-stories/:id/review  (admin)
exports.review = async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!["approve", "reject"].includes(action))
      return res.status(400).json({ success: false, message: "action must be approve or reject" });

    const story = await BuyerStory.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });

    story.status      = action === "approve" ? "approved" : "rejected";
    story.reviewedBy  = req.user._id;
    story.reviewedAt  = new Date();
    if (action === "reject" && reason) story.rejectionReason = reason;
    await story.save();

    if (action === "approve") {
      notifyUser(story.buyer, {
        type: "system",
        title: "Your story was published!",
        message: "Your community story is now live on the PAARA homepage.",
        link: "/account/stories",
      });
    } else {
      notifyUser(story.buyer, {
        type: "system",
        title: "Story not approved",
        message: reason ? `Your story was not approved: ${reason}` : "Your story was not approved.",
        link: "/account/stories",
      });
    }

    res.json({ success: true, story });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
