const AdminActionLog = require("../models/AdminActionLog");

const auditAdminAction = (action) => {
  return async (req, res, next) => {
    try {
      if (req.user && req.user.role === "admin") {
        await AdminActionLog.create({
          admin: req.user._id,
          adminEmail: req.user.email,
          action,
          method: req.method,
          path: req.originalUrl,
          ip: req.ip || "",
          userAgent: req.get("user-agent") || "",
        });
      }
    } catch (error) {
      console.error("Admin audit log failed:", error.message);
    }

    return next();
  };
};

module.exports = {
  auditAdminAction,
};
