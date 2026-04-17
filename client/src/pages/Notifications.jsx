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
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">Unread: {unreadCount}</p>
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
            className={`rounded-2xl border p-4 ${
              note.isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{note.title}</h3>
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
