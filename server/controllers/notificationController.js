const Notification = require("../models/Notification");
const { emitUnreadCount } = require("../utils/notificationService");

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const listNotifications = async (req, res) => {
  try {
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    const io = req.app.get("io");
    await emitUnreadCount(io, req.user._id);

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    const io = req.app.get("io");
    await emitUnreadCount(io, req.user._id);

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
