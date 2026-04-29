import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import PageLayout from "../components/PageLayout";
import { SOCKET_ORIGIN } from "../config/api";
import {
  getCallHistory,
  getChatConversations,
  getDirectMessages,
  getLastSeen,
  getProfile,
  markDirectMessagesRead,
  rateUser,
  sendDirectMessage,
} from "../services/userService";

const Messages = () => {
  const [connections, setConnections] = useState([]);
  const [activePeerId, setActivePeerId] = useState("");
  const [roomMeta, setRoomMeta] = useState({});
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingPeers, setLoadingPeers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [typingByUser, setTypingByUser] = useState({});
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [callStatus, setCallStatus] = useState({ type: "", text: "" });
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      return null;
    }
  });
  const [mentorFeedback, setMentorFeedback] = useState({
    rating: "",
    comment: "",
    open: false,
    submitting: false,
    result: null,
  });
  const [callModal, setCallModal] = useState({
    isOpen: false,
    mode: "video",
    room: "",
  });
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activePeer = useMemo(
    () => connections.find((item) => item._id === activePeerId) || null,
    [connections, activePeerId]
  );

  const isActivePeerOnline = onlineUserIds.includes(activePeerId);

  const resolveAvatarUrl = (peer) => {
    if (!peer) {
      return "";
    }

    if (typeof peer.avatar === "string") {
      return peer.avatar;
    }

    return peer.avatar?.url || "";
  };

  const renderAvatar = (peer) => {
    const avatarUrl = resolveAvatarUrl(peer);

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={peer.name}
          className="h-10 w-10 rounded-xl object-cover"
        />
      );
    }

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
        {(peer?.name || "U").slice(0, 1).toUpperCase()}
      </div>
    );
  };

  const closeCallModal = () => {
    if (socketRef.current && activeCall?.roomId) {
      socketRef.current.emit("call:end", {
        roomId: activeCall.roomId,
        reason: "ended_from_modal",
      });
    }

    setActiveCall(null);
    setCallModal({
      isOpen: false,
      mode: "video",
      room: "",
    });
  };

  const callUrl = callModal.room
    ? `https://meet.jit.si/${callModal.room}#config.startWithVideoMuted=${
        callModal.mode === "audio" ? "true" : "false"
      }&config.startWithAudioMuted=false&config.prejoinPageEnabled=true`
    : "";

  const getLastSeenText = (userId) => {
    const lastSeen = lastSeenMap[userId];
    if (!lastSeen) return "Last seen unknown";
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    getProfile()
      .then((profile) => {
        setCurrentUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMentorFeedback({
      rating: "",
      comment: "",
      open: false,
      submitting: false,
      result: null,
    });
  }, [activePeerId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to access chat");
      return;
    }

    const socket = io(SOCKET_ORIGIN, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect_error", () => {
      setError("Live chat connection failed");
    });

    socket.on("presence:users", (userIds) => {
      if (Array.isArray(userIds)) {
        setOnlineUserIds(userIds.map((id) => id.toString()));
      }
    });

    socket.on("typing:start", ({ fromUserId }) => {
      if (fromUserId) {
        setTypingByUser((prev) => ({ ...prev, [fromUserId]: true }));
      }
    });

    socket.on("typing:stop", ({ fromUserId }) => {
      if (fromUserId) {
        setTypingByUser((prev) => {
          const next = { ...prev };
          delete next[fromUserId];
          return next;
        });
      }
    });

    socket.on("chat:message", (incoming) => {
      if (!incoming) {
        return;
      }

      const senderId = incoming?.sender?._id?.toString?.() || incoming?.sender?.toString?.();
      const receiverId = incoming?.receiver?._id?.toString?.() || incoming?.receiver?.toString?.();

      if (!activePeerId) {
        return;
      }

      const isRelevant = senderId === activePeerId || receiverId === activePeerId;
      if (!isRelevant) {
        return;
      }

      setMessages((prev) => [...prev, incoming]);
      window.dispatchEvent(new Event("chatUnreadChange"));
      setTypingByUser((prev) => {
        const next = { ...prev };
        if (senderId) {
          delete next[senderId];
        }
        return next;
      });
    });

    socket.on("chat:messageRead", ({ readBy, messageIds }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id.toString()) ? { ...msg, readAt: new Date() } : msg
        )
      );
      window.dispatchEvent(new Event("chatUnreadChange"));
    });

    socket.on("call:incoming", (payload) => {
      setIncomingCall(payload);
      setCallStatus({
        type: "incoming",
        text: `${payload.fromName} is calling...`,
      });
    });

    socket.on("call:ringing", () => {
      setCallStatus({
        type: "ringing",
        text: "Ringing...",
      });
    });

    socket.on("call:accepted", (payload) => {
      setCallStatus({
        type: "active",
        text: "Call connected",
      });

      const roomId = payload.roomId;
      const mode = payload.mode || "video";
      setActiveCall({ roomId, mode });
      setCallModal({
        isOpen: true,
        room: roomId,
        mode,
      });
      setIncomingCall(null);
    });

    socket.on("call:busy", () => {
      setCallStatus({
        type: "busy",
        text: "User is busy on another call",
      });
    });

    socket.on("call:ended", ({ status }) => {
      const label = status === "missed" ? "Call missed" : status === "rejected" ? "Call rejected" : "Call ended";
      setCallStatus({
        type: "ended",
        text: label,
      });
      if (status === "ended" || status === "accepted" || status === "rejected" || status === "missed") {
        setMentorFeedback((prev) => ({
          ...prev,
          open: true,
          result: null,
        }));
      }
      setIncomingCall(null);
      setActiveCall(null);
      setCallModal({
        isOpen: false,
        mode: "video",
        room: "",
      });
      getCallHistory(20)
        .then((logs) => setCallHistory(logs || []))
        .catch(() => {});
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activePeerId]);

  useEffect(() => {
    const loadPeers = async () => {
      try {
        setLoadingPeers(true);
        const [payload, logs] = await Promise.all([
          getChatConversations(),
          getCallHistory(20),
        ]);
        const peers = (payload.conversations || []).map((item) => ({
          ...item.peer,
          unreadCount: item.unreadCount,
          lastMessageAt: item.lastMessageAt,
        }));
        const nextRoomMeta = {};

        for (const conversation of payload.conversations || []) {
          nextRoomMeta[conversation.peer._id] = {
            lastMessage: conversation.lastMessage,
            unreadCount: conversation.unreadCount,
            lastMessageAt: conversation.lastMessageAt,
          };
        }

        setConnections(peers);
        setRoomMeta(nextRoomMeta);
        setCallHistory(logs || []);

        if (peers.length) {
          setActivePeerId(peers[0]._id.toString());
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingPeers(false);
      }
    };

    loadPeers();
  }, []);

  useEffect(() => {
    const loadMessagesForPeer = async () => {
      if (!activePeerId) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(true);
        setError("");
        const payload = await getDirectMessages(activePeerId, { limit: 100 });
        setMessages(payload.messages || []);

        // Auto-mark as read
        try {
          await markDirectMessagesRead(activePeerId);
          setRoomMeta((prev) => ({
            ...prev,
            [activePeerId]: {
              ...(prev[activePeerId] || {}),
              unreadCount: 0,
            },
          }));
          window.dispatchEvent(new Event("chatUnreadChange"));
        } catch (err) {
          console.warn("Failed to mark as read:", err);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessagesForPeer();
  }, [activePeerId]);

  useEffect(() => {
    if (activePeerId) {
      getLastSeen(activePeerId)
        .then((data) => {
          setLastSeenMap((prev) => ({
            ...prev,
            [activePeerId]: data.lastSeen,
          }));
        })
        .catch(() => {
          // Ignore errors
        });
    }
  }, [activePeerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const emitTyping = () => {
    if (!socketRef.current || !activePeerId) {
      return;
    }

    socketRef.current.emit("typing:start", { toUserId: activePeerId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("typing:stop", { toUserId: activePeerId });
      }
    }, 900);
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!activePeerId || !text.trim() || sending) {
      return;
    }

    const messageText = text.trim();
    setText("");
    setSending(true);

    try {
      if (socketRef.current && socketRef.current.connected) {
        await new Promise((resolve, reject) => {
          socketRef.current.emit(
            "chat:send",
            { toUserId: activePeerId, text: messageText },
            (ack) => {
              if (ack?.ok) {
                resolve();
              } else {
                reject(new Error(ack?.message || "Failed to send message"));
              }
            }
          );
        });
      } else {
        const created = await sendDirectMessage(activePeerId, messageText);
        setMessages((prev) => [...prev, created]);
      }
      window.dispatchEvent(new Event("chatUnreadChange"));
    } catch (err) {
      setError(err.message);
      setText(messageText);
    } finally {
      setSending(false);
      if (socketRef.current) {
        socketRef.current.emit("typing:stop", { toUserId: activePeerId });
      }
    }
  };

  const handleStartCall = async (mode = "video") => {
    if (!socketRef.current || !activePeerId) {
      return;
    }

    setCallStatus({
      type: "ringing",
      text: "Starting call...",
    });

    socketRef.current.emit(
      "call:invite",
      {
        toUserId: activePeerId,
        mode,
      },
      (ack) => {
        if (!ack?.ok) {
          setCallStatus({
            type: "error",
            text: ack?.message || "Failed to start call",
          });
          return;
        }

        setActiveCall({
          roomId: ack.roomId,
          mode,
        });
      }
    );
  };

  const handleAcceptIncomingCall = () => {
    if (!socketRef.current || !incomingCall?.roomId) {
      return;
    }

    socketRef.current.emit("call:accept", { roomId: incomingCall.roomId }, (ack) => {
      if (!ack?.ok) {
        setCallStatus({
          type: "error",
          text: ack?.message || "Failed to accept call",
        });
      }
    });
  };

  const handleRejectIncomingCall = () => {
    if (!socketRef.current || !incomingCall?.roomId) {
      return;
    }

    socketRef.current.emit("call:reject", { roomId: incomingCall.roomId }, () => {
      setIncomingCall(null);
      setCallStatus({
        type: "ended",
        text: "Call rejected",
      });
    });
  };

  const renderCallStatus = () => {
    if (!callStatus.text) {
      return null;
    }

    const palette =
      callStatus.type === "error"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : callStatus.type === "active"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-blue-200 bg-blue-50 text-blue-700";

    return (
      <p className={`mt-2 rounded-lg border px-3 py-2 text-xs font-semibold ${palette}`}>
        {callStatus.text}
      </p>
    );
  };

  const submitMentorFeedback = async (event) => {
    event.preventDefault();
    if (!activePeerId) {
      return;
    }

    const rating = Number(mentorFeedback.rating);
    if (!rating || rating < 1 || rating > 5) {
      setMentorFeedback((prev) => ({
        ...prev,
        result: { type: "error", text: "Please select a rating between 1 and 5." },
      }));
      return;
    }

    try {
      setMentorFeedback((prev) => ({ ...prev, submitting: true, result: null }));
      const result = await rateUser(activePeerId, rating, mentorFeedback.comment.trim());
      setMentorFeedback((prev) => ({
        ...prev,
        submitting: false,
        open: false,
        rating: "",
        comment: "",
        result: {
          type: "success",
          text: `Thanks. Mentor rating updated to ${result.newRating?.toFixed?.(1) || result.newRating}.`,
        },
      }));
    } catch (error) {
      setMentorFeedback((prev) => ({
        ...prev,
        submitting: false,
        result: { type: "error", text: error.message },
      }));
    }
  };

  return (
    <PageLayout
      title="Messages"
      subtitle="Real-time 1-to-1 chat with your connected users."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
          <h2 className="px-2 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Connected Users
          </h2>

          {loadingPeers ? <p className="p-2 text-sm text-slate-600">Loading connections...</p> : null}

          {!loadingPeers && connections.length === 0 ? (
            <p className="p-2 text-sm text-slate-600">No connections yet. Connect from Explore page first.</p>
          ) : null}

          <div className="mt-2 space-y-2">
            {connections.map((peer) => {
              const peerId = peer._id.toString();
              const isActive = activePeerId === peerId;
              const isOnline = onlineUserIds.includes(peerId);
              const allowPresence = peer?.showOnlineStatus !== false;
              const unreadCount = roomMeta[peerId]?.unreadCount ?? peer.unreadCount ?? 0;
              const lastMessage = roomMeta[peerId]?.lastMessage;
              const lastMessageAt = roomMeta[peerId]?.lastMessageAt ?? peer.lastMessageAt;

              return (
                <button
                  type="button"
                  key={peerId}
                  onClick={() => setActivePeerId(peerId)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                    isActive
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {renderAvatar(peer)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-slate-900">{peer.name}</p>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 ? (
                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          ) : null}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                              allowPresence && isOnline
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {allowPresence ? (isOnline ? "Online" : "Offline") : "Hidden"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{peer.email}</p>
                      {lastMessage?.text ? (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{lastMessage.text}</p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">No messages yet</p>
                      )}
                      {lastMessageAt ? (
                        <p className="mt-1 text-[11px] text-slate-400">
                          {new Date(lastMessageAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          {activePeer ? (
            <>
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {renderAvatar(activePeer)}
                    <h3 className="text-lg font-semibold text-slate-900">{activePeer.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      onClick={() => handleStartCall("audio")}
                    >
                      Audio Call
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                      onClick={() => handleStartCall("video")}
                    >
                      Video Call
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {activePeer?.showOnlineStatus === false ? (
                    <span>Status hidden</span>
                  ) : isActivePeerOnline ? (
                    <span className="text-emerald-600">Online</span>
                  ) : (
                    <span>{getLastSeenText(activePeerId)}</span>
                  )}
                </p>
                {renderCallStatus()}
              </div>

              <div className="mt-4 h-[26rem] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                {loadingMessages ? (
                  <p className="text-sm text-slate-600">Loading chat...</p>
                ) : messages.length ? (
                  <div className="space-y-3">
                    {messages.map((item) => {
                      const senderId = item?.sender?._id?.toString?.() || item?.sender?.toString?.();
                      const myId = currentUser?._id || JSON.parse(localStorage.getItem("user") || "{}")._id;
                      const isMine = senderId === myId;
                      const isRead = !!item.readAt;
                      const senderMeta = isMine ? currentUser || JSON.parse(localStorage.getItem("user") || "{}") : activePeer;

                      return (
                        <div key={item._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`flex max-w-[85%] items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                            {renderAvatar(senderMeta)}
                            <div className={`rounded-2xl px-3 py-2 text-sm ${isMine ? "bg-slate-900 text-white" : "bg-white text-slate-800"}`}>
                              <p className="whitespace-pre-wrap">{item.text}</p>
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <p className={`text-[10px] ${isMine ? "text-slate-300" : "text-slate-500"}`}>
                                  {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                                {isMine ? (
                                  <span className={`text-[10px] font-semibold ${isRead ? "text-blue-400" : "text-slate-400"}`}>
                                    {isRead ? "✓✓" : "✓"}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No messages yet. Start the conversation.</p>
                )}

                {typingByUser[activePeerId] ? (
                  <p className="mt-3 text-xs font-medium text-blue-700">{activePeer.name} is typing...</p>
                ) : null}
              </div>

              <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    emitTyping();
                  }}
                  placeholder="Type a message"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200 flex-1"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold transition-all duration-200 hover:shadow-[0_4px_12px_-4px_rgba(37,99,235,0.4)] active:scale-95 disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>

              {activePeer ? (
                <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">Mentor Feedback</h4>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      onClick={() => setMentorFeedback((prev) => ({ ...prev, open: !prev.open, result: null }))}
                    >
                      {mentorFeedback.open ? "Hide" : "Rate Mentor"}
                    </button>
                  </div>

                  {mentorFeedback.result ? (
                    <p
                      className={`mt-2 text-sm ${
                        mentorFeedback.result.type === "success" ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {mentorFeedback.result.text}
                    </p>
                  ) : null}

                  {mentorFeedback.open ? (
                    <form onSubmit={submitMentorFeedback} className="mt-3 space-y-2">
                      <select
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200"
                        value={mentorFeedback.rating}
                        onChange={(event) =>
                          setMentorFeedback((prev) => ({ ...prev, rating: event.target.value }))
                        }
                        required
                      >
                        <option value="">Select rating</option>
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                      </select>
                      <textarea
                        rows="3"
                        className="ui-input resize-none"
                        placeholder="How was your conversation with this mentor?"
                        value={mentorFeedback.comment}
                        onChange={(event) =>
                          setMentorFeedback((prev) => ({ ...prev, comment: event.target.value }))
                        }
                      />
                      <button type="submit" className="ui-btn-secondary" disabled={mentorFeedback.submitting}>
                        {mentorFeedback.submitting ? "Submitting..." : "Submit Mentor Feedback"}
                      </button>
                    </form>
                  ) : null}
                </section>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-slate-600">Select a connection to start chatting.</p>
          )}
        </section>
      </div>

      <section className="ui-card mt-6 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">Recent Calls</h3>
        {!callHistory.length ? (
          <p className="mt-3 text-sm text-slate-500">No call history yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {callHistory.slice(0, 8).map((log) => {
              const myId = JSON.parse(localStorage.getItem("user") || "{}")._id;
              const isOutgoing = log?.caller?._id === myId;
              const peer = isOutgoing ? log.callee : log.caller;
              return (
                <div key={log._id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">
                      {isOutgoing ? "Outgoing" : "Incoming"} {log.mode} call {peer?.name ? `with ${peer.name}` : ""}
                    </p>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{log.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString()} {log.durationSec ? `- ${log.durationSec}s` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {callModal.isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">In-app call</p>
                <h3 className="text-base font-bold text-slate-900">
                  {callModal.mode === "audio" ? "Audio" : "Video"} Call with {activePeer?.name || "User"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeCallModal}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                End Call
              </button>
            </div>

            <div className="h-full w-full bg-black">
              <iframe
                title="SkillHive Call"
                src={callUrl}
                className="h-full w-full border-0"
                allow="camera; microphone; fullscreen; display-capture"
              />
            </div>
          </div>
        </div>
      ) : null}

      {incomingCall ? (
        <div className="fixed inset-x-4 top-4 z-50 mx-auto w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Incoming {incomingCall.mode} call</p>
          <h4 className="mt-1 text-lg font-bold text-slate-900">{incomingCall.fromName}</h4>
          <p className="mt-1 text-sm text-slate-600">Accept to open call inside SkillHive.</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              onClick={handleAcceptIncomingCall}
            >
              Accept
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={handleRejectIncomingCall}
            >
              Reject
            </button>
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
};

export default Messages;
