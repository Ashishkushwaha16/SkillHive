const mongoose = require("mongoose");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const { getDirectRoomId } = require("../utils/chatRoom");
const { createUserNotification } = require("../utils/notificationService");

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const ensureConnected = (user, targetUserId) =>
  (user.connections || []).some((id) => id.toString() === targetUserId.toString());

const getConversationSummaries = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId).populate(
      "connections",
      "name email skills rating avatar lastSeen privacy"
    );

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversations = await Promise.all(
      (currentUser.connections || []).map(async (peer) => {
        const roomId = getDirectRoomId(currentUserId, peer._id);

        const [lastMessage, unreadCount] = await Promise.all([
          ChatMessage.findOne({ roomId })
            .sort({ createdAt: -1 })
            .populate("sender", "name email avatar")
            .populate("receiver", "name email avatar"),
          ChatMessage.countDocuments({
            roomId,
            receiver: currentUserId,
            sender: peer._id,
            readAt: { $exists: false },
          }),
        ]);

        return {
          peer: {
            _id: peer._id,
            name: peer.name,
            email: peer.email,
            avatar: peer.avatar || { url: "", publicId: "" },
            skills: peer.skills,
            rating: peer.rating,
            lastSeen: peer.lastSeen,
            showOnlineStatus: peer?.privacy?.showOnlineStatus !== false,
          },
          roomId,
          lastMessage: lastMessage || null,
          lastMessageAt: lastMessage?.createdAt || null,
          unreadCount,
        };
      })
    );

    conversations.sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });

    const totalUnreadCount = conversations.reduce((sum, item) => sum + item.unreadCount, 0);

    return res.status(200).json({ conversations, totalUnreadCount });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDirectMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (currentUserId.toString() === otherUserId.toString()) {
      return res.status(400).json({ message: "Cannot open chat with yourself" });
    }

    const currentUser = await User.findById(currentUserId).select("connections");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!ensureConnected(currentUser, otherUserId)) {
      return res.status(403).json({ message: "You can only chat with connected users" });
    }

    const roomId = getDirectRoomId(currentUserId, otherUserId);
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 50), 100);
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ roomId })
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      roomId,
      messages: messages.reverse(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const postDirectMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (currentUserId.toString() === otherUserId.toString()) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const cleanText = text.trim();
    if (cleanText.length > 2000) {
      return res.status(400).json({ message: "Message text too long" });
    }

    const currentUser = await User.findById(currentUserId).select("connections");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!ensureConnected(currentUser, otherUserId)) {
      return res.status(403).json({ message: "You can only chat with connected users" });
    }

    const roomId = getDirectRoomId(currentUserId, otherUserId);

    const createdMessage = await ChatMessage.create({
      roomId,
      sender: currentUserId,
      receiver: otherUserId,
      text: cleanText,
    });

    const populated = await ChatMessage.findById(createdMessage._id)
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar");

    const io = req.app.get("io");
    if (io && populated) {
      io.to(`user:${currentUserId.toString()}`).emit("chat:message", populated);
      io.to(`user:${otherUserId.toString()}`).emit("chat:message", populated);

      await createUserNotification({
        io,
        userId: otherUserId,
        type: "new_message",
        title: "New message",
        body: `${req.user.name} sent you a message`,
        metadata: {
          fromUserId: currentUserId,
          roomId,
        },
      });
    }

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markDirectMessagesRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const roomId = getDirectRoomId(currentUserId, otherUserId);
    const now = new Date();

    const updated = await ChatMessage.updateMany(
      {
        roomId,
        receiver: currentUserId,
        readAt: { $exists: false },
      },
      { readAt: now }
    );

    const io = req.app.get("io");
    if (io) {
      io.emit("chat:roomRead", {
        roomId,
        readBy: currentUserId,
        readAt: now,
      });
    }

    return res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: updated.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getLastSeen = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(userId).select("lastSeen privacy");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      req.user._id.toString() !== userId.toString() &&
      user?.privacy?.showOnlineStatus === false
    ) {
      return res.status(200).json({
        lastSeen: null,
        isHidden: true,
      });
    }

    return res.status(200).json({
      lastSeen: user.lastSeen,
      isHidden: false,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversationSummaries,
  getDirectMessages,
  postDirectMessage,
  markDirectMessagesRead,
  getLastSeen,
};