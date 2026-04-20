const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { auditAdminAction } = require("../middleware/adminAuditMiddleware");
const {
	submitFeedback,
	getFeedbackEntries,
} = require("../controllers/feedbackController");

const router = express.Router();

router.post("/", protect, submitFeedback);
router.get(
	"/",
	protect,
	authorizeRoles("admin"),
	auditAdminAction("feedback.read_all"),
	getFeedbackEntries
);

module.exports = router;
