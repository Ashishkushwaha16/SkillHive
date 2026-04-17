const Notification = require("../models/Notification");

const emitUnreadCount = async (io, userId) => {
  if (!io || !userId) {
    return;
  }

  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });

  io.to(`user:${userId.toString()}`).emit("notification:unreadCount", {
    unreadCount,
  });
};

const createUserNotification = async ({ io, userId, type, title, body, metadata = {} }) => {
  if (!userId) {
    return null;
  }

  const notification = await Notification.create({
    user: userId,
    type,
    title,
    body,
    metadata,
  });

  if (io) {
    io.to(`user:${userId.toString()}`).emit("notification:new", notification);
    await emitUnreadCount(io, userId);
  }

  return notification;
};

module.exports = {
  createUserNotification,
  emitUnreadCount,
};
