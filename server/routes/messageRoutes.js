const express = require("express");
const messageController = require("../controllers/messageController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { auditAdminAction } = require("../middleware/adminAuditMiddleware");

const router = express.Router();

// POST - Send contact message (no auth required)
router.post("/", messageController.sendMessage);

// GET - Get all messages (admin only)
router.get(
	"/",
	protect,
	authorizeRoles("admin"),
	auditAdminAction("messages.read_all"),
	messageController.getMessages
);

module.exports = router;
