const express = require("express");
const router = express.Router();
const { protect, primaryAdminOnly, activeAdminOnly } = require("../middleware/authMiddleware");
const c = require("../controllers/adminMgmtController");

router.post("/admin-requests", protect, c.submitRequest);
router.get("/admin-requests/mine", protect, c.myRequest);

router.get("/admin/admin-requests", protect, activeAdminOnly, primaryAdminOnly, c.listRequests);
router.patch("/admin/admin-requests/:id/review", protect, activeAdminOnly, primaryAdminOnly, c.reviewRequest);
router.get("/admin/admins", protect, activeAdminOnly, primaryAdminOnly, c.listAdmins);
router.patch("/admin/admins/:id/status", protect, activeAdminOnly, primaryAdminOnly, c.updateAdminStatus);
router.delete("/admin/admins/:id", protect, activeAdminOnly, primaryAdminOnly, c.removeAdmin);
router.get("/admin/admin-activity", protect, activeAdminOnly, primaryAdminOnly, c.adminActivity);

module.exports = router;
