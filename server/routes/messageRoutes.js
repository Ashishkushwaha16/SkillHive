const express = require("express");
const messageController = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// POST - Send contact message (no auth required)
router.post("/", messageController.sendMessage);

// GET - Get all messages (protected - would need admin later)
router.get("/", protect, messageController.getMessages);

module.exports = router;
