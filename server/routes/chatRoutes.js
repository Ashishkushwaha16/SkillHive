const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getConversationSummaries,
  getDirectMessages,
  postDirectMessage,
  markDirectMessagesRead,
  getLastSeen,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/conversations", protect, getConversationSummaries);
router.get("/direct/:userId", protect, getDirectMessages);
router.post("/direct/:userId", protect, postDirectMessage);
router.put("/direct/:userId/read", protect, markDirectMessagesRead);
router.get("/lastSeen/:userId", protect, getLastSeen);

module.exports = router;