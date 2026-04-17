const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");
const CallLog = require("../models/CallLog");
const { getDirectRoomId } = require("../utils/chatRoom");
const { createUserNotification } = require("../utils/notificationService");

const onlineUsers = new Map();
const activeCalls = new Map();
const userCallState = new Map();
const ringingTimeouts = new Map();
const RING_TIMEOUT_MS = 30000;

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

const setUserBusy = (userId, roomId) => {
  if (!userId || !roomId) {
    return;
  }

  userCallState.set(userId.toString(), roomId);
};

const clearUserBusy = (userId, roomId) => {
  if (!userId) {
    return;
  }

  const key = userId.toString();
  if (!userCallState.has(key)) {
    return;
  }

  if (!roomId || userCallState.get(key) === roomId) {
    userCallState.delete(key);
  }
};

const isUserBusy = (userId) => userCallState.has(userId.toString());

const clearRingingTimeout = (roomId) => {
  if (!ringingTimeouts.has(roomId)) {
    return;
  }

  clearTimeout(ringingTimeouts.get(roomId));
  ringingTimeouts.delete(roomId);
};

const finalizeCall = async ({ io, roomId, status, endedByUserId = null, endReason = "" }) => {
  const entry = activeCalls.get(roomId);
  if (!entry) {
    return null;
  }

  clearRingingTimeout(roomId);
  activeCalls.delete(roomId);
  clearUserBusy(entry.callerId, roomId);
  clearUserBusy(entry.calleeId, roomId);

  const now = new Date();
  const connectedAt = entry.callLog?.connectedAt || null;
  const durationSec = connectedAt ? Math.max(0, Math.floor((now - connectedAt) / 1000)) : 0;

  entry.callLog.status = status;
  entry.callLog.endedAt = now;
  entry.callLog.durationSec = durationSec;
  entry.callLog.endReason = endReason;
  await entry.callLog.save();

  io.to(`user:${entry.callerId}`).emit("call:ended", {
    roomId,
    status,
    endedByUserId,
    endReason,
    durationSec,
  });

  io.to(`user:${entry.calleeId}`).emit("call:ended", {
    roomId,
    status,
    endedByUserId,
    endReason,
    durationSec,
  });

  return entry.callLog;
};

const getVisibleOnlineUserIdsFor = async (viewerUserId) => {
  const onlineIds = getOnlineUserIds();
  if (!onlineIds.length) {
    return [];
  }

  const visibleUsers = await User.find({
    _id: { $in: onlineIds },
    $or: [{ "privacy.showOnlineStatus": { $ne: false } }, { _id: viewerUserId }],
  }).select("_id");

  return visibleUsers.map((item) => item._id.toString());
};

const emitPresenceToAllSockets = async (io) => {
  const sockets = Array.from(io.sockets.sockets.values());
  await Promise.all(
    sockets.map(async (socket) => {
      const viewerId = socket.user?._id;
      if (!viewerId) {
        return;
      }

      const visibleIds = await getVisibleOnlineUserIdsFor(viewerId);
      socket.emit("presence:users", visibleIds);
    })
  );
};

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token;

    if (!token) {
      return next(new Error("Not authorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "_id name email avatar connections lastSeen privacy"
    );

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
    await emitPresenceToAllSockets(io);

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
          .populate("sender", "name email avatar")
          .populate("receiver", "name email avatar");

        io.to(`user:${currentUserId}`).emit("chat:message", populated);
        io.to(`user:${receiverId}`).emit("chat:message", populated);

        await createUserNotification({
          io,
          userId: receiverId,
          type: "new_message",
          title: "New message",
          body: `${socket.user.name} sent you a message`,
          metadata: {
            fromUserId: currentUserId,
            roomId,
          },
        });

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

        io.to(`user:${currentUserId}`).emit("chat:messageRead", {
          messageIds,
          readAt: now,
          readBy: currentUserId,
        });

        io.emit("chat:messageRead", {
          messageIds,
          readAt: now,
          readBy: currentUserId,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("call:invite", async ({ toUserId, mode }, ack) => {
      try {
        const calleeId = toUserId?.toString?.();
        const callMode = mode === "audio" ? "audio" : "video";

        if (!calleeId || calleeId === currentUserId) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Invalid callee" });
          }
          return;
        }

        const caller = await User.findById(currentUserId).select("_id name connections");
        const callee = await User.findById(calleeId).select("_id name");

        if (!caller || !callee) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "User not found" });
          }
          return;
        }

        const isConnected = (caller.connections || []).some((id) => id.toString() === calleeId);
        if (!isConnected) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "You can only call connected users" });
          }
          return;
        }

        if (isUserBusy(currentUserId)) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "You are already in another call" });
          }
          return;
        }

        if (isUserBusy(calleeId)) {
          const busyLog = await CallLog.create({
            roomId: `skillhive-${Date.now()}-${currentUserId}-${calleeId}`,
            caller: currentUserId,
            callee: calleeId,
            initiatedBy: currentUserId,
            mode: callMode,
            status: "busy",
            endedAt: new Date(),
            endReason: "callee_busy",
          });

          io.to(`user:${currentUserId}`).emit("call:busy", {
            toUserId: calleeId,
            mode: callMode,
            callLogId: busyLog._id,
          });

          if (typeof ack === "function") {
            ack({ ok: false, message: "User is busy" });
          }
          return;
        }

        const roomId = `skillhive-${callMode}-${Date.now()}-${currentUserId}-${calleeId}`;

        const callLog = await CallLog.create({
          roomId,
          caller: currentUserId,
          callee: calleeId,
          initiatedBy: currentUserId,
          mode: callMode,
          status: "ringing",
        });

        activeCalls.set(roomId, {
          roomId,
          callerId: currentUserId,
          calleeId,
          mode: callMode,
          callLog,
        });
        setUserBusy(currentUserId, roomId);
        setUserBusy(calleeId, roomId);

        const timeoutId = setTimeout(async () => {
          const entry = activeCalls.get(roomId);
          if (!entry || entry.callLog.status !== "ringing") {
            return;
          }

          await finalizeCall({
            io,
            roomId,
            status: "missed",
            endedByUserId: currentUserId,
            endReason: "ring_timeout",
          });

          await createUserNotification({
            io,
            userId: calleeId,
            type: "missed_call",
            title: "Missed call",
            body: `${socket.user.name} tried to call you`,
            metadata: {
              fromUserId: currentUserId,
              roomId,
              mode: callMode,
            },
          });
        }, RING_TIMEOUT_MS);

        ringingTimeouts.set(roomId, timeoutId);

        io.to(`user:${calleeId}`).emit("call:incoming", {
          roomId,
          fromUserId: currentUserId,
          fromName: socket.user.name,
          mode: callMode,
        });

        io.to(`user:${currentUserId}`).emit("call:ringing", {
          roomId,
          toUserId: calleeId,
          mode: callMode,
        });

        if (typeof ack === "function") {
          ack({ ok: true, roomId, mode: callMode });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, message: "Failed to start call" });
        }
      }
    });

    socket.on("call:accept", async ({ roomId }, ack) => {
      try {
        const entry = activeCalls.get(roomId);
        if (!entry || entry.calleeId !== currentUserId) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Call not found" });
          }
          return;
        }

        if (entry.callLog.status !== "ringing") {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Call is no longer available" });
          }
          return;
        }

        clearRingingTimeout(roomId);
        entry.callLog.status = "accepted";
        entry.callLog.connectedAt = new Date();
        await entry.callLog.save();

        io.to(`user:${entry.callerId}`).emit("call:accepted", {
          roomId,
          acceptedByUserId: currentUserId,
          mode: entry.mode,
        });
        io.to(`user:${entry.calleeId}`).emit("call:accepted", {
          roomId,
          acceptedByUserId: currentUserId,
          mode: entry.mode,
        });

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, message: "Failed to accept call" });
        }
      }
    });

    socket.on("call:reject", async ({ roomId }, ack) => {
      try {
        const entry = activeCalls.get(roomId);
        if (!entry || entry.calleeId !== currentUserId) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Call not found" });
          }
          return;
        }

        await finalizeCall({
          io,
          roomId,
          status: "rejected",
          endedByUserId: currentUserId,
          endReason: "rejected_by_callee",
        });

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, message: "Failed to reject call" });
        }
      }
    });

    socket.on("call:end", async ({ roomId, reason }, ack) => {
      try {
        const entry = activeCalls.get(roomId);
        if (!entry) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Call not found" });
          }
          return;
        }

        if (entry.callerId !== currentUserId && entry.calleeId !== currentUserId) {
          if (typeof ack === "function") {
            ack({ ok: false, message: "Not allowed" });
          }
          return;
        }

        const nextStatus = entry.callLog.status === "accepted" ? "ended" : "cancelled";
        await finalizeCall({
          io,
          roomId,
          status: nextStatus,
          endedByUserId: currentUserId,
          endReason: reason || "ended_by_user",
        });

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, message: "Failed to end call" });
        }
      }
    });

    socket.on("disconnect", async () => {
      const activeRoom = userCallState.get(currentUserId);
      if (activeRoom && activeCalls.has(activeRoom)) {
        const entry = activeCalls.get(activeRoom);
        if (entry.callLog.status === "ringing" && entry.calleeId === currentUserId) {
          await finalizeCall({
            io,
            roomId: activeRoom,
            status: "missed",
            endedByUserId: currentUserId,
            endReason: "callee_disconnected",
          });

          await createUserNotification({
            io,
            userId: currentUserId,
            type: "missed_call",
            title: "Missed call",
            body: "You missed a call",
            metadata: {
              roomId: activeRoom,
            },
          });
        } else {
          await finalizeCall({
            io,
            roomId: activeRoom,
            status: entry.callLog.status === "accepted" ? "ended" : "cancelled",
            endedByUserId: currentUserId,
            endReason: "user_disconnected",
          });
        }
      }

      removeOnlineSocket(currentUserId, socket.id);

      // Update lastSeen on disconnect
      await User.findByIdAndUpdate(currentUserId, { lastSeen: new Date() });

      await emitPresenceToAllSockets(io);
    });
  });

  return io;
};

module.exports = {
  initChatSocket,
};