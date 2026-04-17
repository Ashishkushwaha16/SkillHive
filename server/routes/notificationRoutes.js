const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, listNotifications);
router.put("/read-all", protect, markAllNotificationsRead);
router.put("/:id/read", protect, markNotificationRead);

module.exports = router;
