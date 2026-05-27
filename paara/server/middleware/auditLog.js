const AuditLog = require("../models/AuditLog");
module.exports = function audit(action, targetType) {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode >= 200 && res.statusCode < 400 && req.user) {
        try {
          await AuditLog.create({
            actor: req.user._id,
            actorRole: req.user.role,
            action,
            targetType,
            targetId: req.params.id || undefined,
            metadata: { body: req.body, params: req.params, query: req.query },
            ip: req.ip,
            userAgent: req.headers["user-agent"],
          });
        } catch (e) { /* swallow */ }
      }
    });
    next();
  };
};
