import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import PageLayout from "../components/PageLayout";
import { SOCKET_ORIGIN } from "../config/api";
import {
  getChatConversations,
  getDirectMessages,
  getLastSeen,
  markDirectMessagesRead,
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
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activePeer = useMemo(
    () => connections.find((item) => item._id === activePeerId) || null,
    [connections, activePeerId]
  );

  const isActivePeerOnline = onlineUserIds.includes(activePeerId);

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

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activePeerId]);

  useEffect(() => {
    const loadPeers = async () => {
      try {
        setLoadingPeers(true);
        const payload = await getChatConversations();
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

  return (
    <PageLayout
      title="Messages"
      subtitle="Real-time 1-to-1 chat with your connected users."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="ui-card-soft p-4">
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
              const unreadCount = roomMeta[peerId]?.unreadCount ?? peer.unreadCount ?? 0;
              const lastMessage = roomMeta[peerId]?.lastMessage;

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
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{peer.name}</p>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 ? (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      ) : null}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{peer.email}</p>
                  {lastMessage?.text ? (
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                      {lastMessage.text}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="ui-card p-5">
          {activePeer ? (
            <>
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-semibold text-slate-900">{activePeer.name}</h3>
                <p className="text-xs text-slate-500">
                  {isActivePeerOnline ? (
                    <span className="text-emerald-600">Online</span>
                  ) : (
                    <span>{getLastSeenText(activePeerId)}</span>
                  )}
                </p>
              </div>

              <div className="mt-4 h-[26rem] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                {loadingMessages ? (
                  <p className="text-sm text-slate-600">Loading chat...</p>
                ) : messages.length ? (
                  <div className="space-y-3">
                    {messages.map((item) => {
                      const senderId = item?.sender?._id?.toString?.() || item?.sender?.toString?.();
                      const myId = JSON.parse(localStorage.getItem("user") || "{}")._id;
                      const isMine = senderId === myId;
                      const isRead = !!item.readAt;

                      return (
                        <div key={item._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isMine ? "bg-slate-900 text-white" : "bg-white text-slate-800"}`}>
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
                  className="ui-input flex-1"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="ui-btn-primary rounded-xl px-4"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <p className="text-sm text-slate-600">Select a connection to start chatting.</p>
          )}
        </section>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </PageLayout>
  );
};

export default Messages;
