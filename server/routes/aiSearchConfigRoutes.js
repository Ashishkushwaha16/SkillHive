const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { auditAdminAction } = require("../middleware/adminAuditMiddleware");
const {
  getAiSearchQuickIssues,
  updateAiSearchQuickIssues,
} = require("../controllers/aiSearchConfigController");

const router = express.Router();

router.get(
  "/quick-issues",
  protect,
  authorizeRoles("admin"),
  auditAdminAction("ai_search.quick_issues.read"),
  getAiSearchQuickIssues
);

router.put(
  "/quick-issues",
  protect,
  authorizeRoles("admin"),
  auditAdminAction("ai_search.quick_issues.update"),
  updateAiSearchQuickIssues
);

module.exports = router;
