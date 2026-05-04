import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/userService";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(60);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleNewNotification = (event) => {
      const incoming = event?.detail;
      if (!incoming?._id) {
        return;
      }

      setNotifications((prev) => {
        const exists = prev.some((item) => item._id === incoming._id);
        if (exists) {
          return prev;
        }

        return [incoming, ...prev].slice(0, 60);
      });
      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener("notification:new", handleNewNotification);
    window.addEventListener("focus", load);

    return () => {
      window.removeEventListener("notification:new", handleNewNotification);
      window.removeEventListener("focus", load);
    };
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PageLayout title="Notifications" subtitle="Track real-time platform events in one place.">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17c0 .53-.21 1.04-.59 1.41L4 17h5" />
            </svg>
          </span>
          <p className="text-sm font-semibold text-slate-700">Unread: {unreadCount}</p>
        </div>
        <button type="button" onClick={handleReadAll} className="ui-btn-secondary">
          Mark all as read
        </button>
      </div>

      {loading ? <p className="text-slate-600">Loading notifications...</p> : null}
      {error ? <p className="text-rose-700">{error}</p> : null}

      <div className="space-y-3">
        {notifications.map((note) => (
          <article
            key={note._id}
            className={`rounded-3xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-16px_rgba(15,23,42,0.22)] ${
              note.isRead ? "border-slate-100 bg-white/90" : "border-blue-200 bg-gradient-to-br from-blue-50 to-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${note.isRead ? "bg-slate-100 text-slate-500" : "bg-white text-blue-700 shadow-sm"}`}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17c0 .53-.21 1.04-.59 1.41L4 17h5" />
                    </svg>
                  </span>
                  <h3 className="font-semibold text-slate-900">{note.title}</h3>
                </div>
                <p className="mt-1 text-sm text-slate-700">{note.body}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
              {!note.isRead ? (
                <button type="button" onClick={() => handleRead(note._id)} className="ui-btn-primary">
                  Mark read
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </PageLayout>
  );
};

export default Notifications;
