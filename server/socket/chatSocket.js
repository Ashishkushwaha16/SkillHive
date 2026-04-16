const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");
const { getDirectRoomId } = require("../utils/chatRoom");

const onlineUsers = new Map();

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

const addOnlineSocket = (userId, socketId) => {
  const key = userId.toString();
  if (!onlineUsers.has(key)) {
    onlineUsers.set(key, new Set());
  }
  onlineUsers.get(key).add(socketId);
};

const removeOnlineSocket = (userId, socketId) => {
  const key = userId.toString();
  if (!onlineUsers.has(key)) {
    return;
  }

  const sockets = onlineUsers.get(key);
  sockets.delete(socketId);

  if (!sockets.size) {
    onlineUsers.delete(key);
  }
};

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token;

    if (!token) {
      return next(new Error("Not authorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id name email connections lastSeen");

    if (!user) {
      return next(new Error("Not authorized"));
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error("Not authorized"));
  }
};

const initChatSocket = (server, allowedOrigin) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigin || "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    const currentUserId = socket.user._id.toString();

    // Update lastSeen on connect
    await User.findByIdAndUpdate(currentUserId, { lastSeen: new Date() });

    socket.join(`user:${currentUserId}`);
    addOnlineSocket(currentUserId, socket.id);
    io.emit("presence:users", getOnlineUserIds());

    socket.on("typing:start", ({ toUserId }) => {
      if (!toUserId || toUserId.toString() === currentUserId) {
        return;
      }

      io.to(`user:${toUserId}`).emit("typing:start", {
        fromUserId: currentUserId,
      });
    });

    socket.on("typing:stop", ({ toUserId }) => {
      if (!toUserId || toUserId.toString() === currentUserId) {
        return;
      }

      io.to(`user:${toUserId}`).emit("typing:stop", {
        fromUserId: currentUserId,
      });
    });

    socket.on("chat:send", async ({ toUserId, text }, ack) => {
      try {
        if (!toUserId || !text || typeof text !== "string" || !text.trim()) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Invalid payload" });
          }
          return;
        }

        const receiverId = toUserId.toString();
        if (receiverId === currentUserId) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Cannot message yourself" });
          }
          return;
        }

        const cleanText = text.trim();
        if (cleanText.length > 2000) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Message text too long" });
          }
          return;
        }

        const sender = await User.findById(currentUserId).select("connections");
        if (!sender) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Sender not found" });
          }
          return;
        }

        const isConnected = (sender.connections || []).some(
          (id) => id.toString() === receiverId
        );

        if (!isConnected) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "You can only chat with connected users" });
          }
          return;
        }

        const roomId = getDirectRoomId(currentUserId, receiverId);

        const created = await ChatMessage.create({
          roomId,
          sender: currentUserId,
          receiver: receiverId,
          text: cleanText,
        });

        const populated = await ChatMessage.findById(created._id)
          .populate("sender", "name email")
          .populate("receiver", "name email");

        io.to(`user:${currentUserId}`).emit("chat:message", populated);
        io.to(`user:${receiverId}`).emit("chat:message", populated);

        if (typeof ack === "function") {
          ack({ ok: true, message: populated });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, message: "Failed to send message" });
        }
      }
    });

    socket.on("chat:markRead", async ({ messageIds }) => {
      try {
        if (!Array.isArray(messageIds) || !messageIds.length) {
          return;
        }

        const now = new Date();
        await ChatMessage.updateMany(
          { _id: { $in: messageIds }, readAt: { $exists: false } },
          { readAt: now }
        );

        io.emit("chat:messageRead", {
          messageIds,
          readAt: now,
          readBy: currentUserId,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("disconnect", async () => {
      removeOnlineSocket(currentUserId, socket.id);

      // Update lastSeen on disconnect
      await User.findByIdAndUpdate(currentUserId, { lastSeen: new Date() });

      io.emit("presence:users", getOnlineUserIds());
    });
  });

  return io;
};

module.exports = {
  initChatSocket,
};