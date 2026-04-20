import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import { getFeedbackEntries, getMessages } from "../services/userService";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const [messagesData, feedbackData] = await Promise.all([
          getMessages(),
          getFeedbackEntries(),
        ]);
        setMessages(messagesData);
        setFeedbackEntries(feedbackData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  const filteredFeedbackEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return feedbackEntries.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      if (normalizedSearch) {
        const userName = item.user?.name?.toLowerCase() || "";
        const userEmail = item.user?.email?.toLowerCase() || "";
        const feedbackText = item.message?.toLowerCase() || "";
        const matchFound =
          userName.includes(normalizedSearch) ||
          userEmail.includes(normalizedSearch) ||
          feedbackText.includes(normalizedSearch);

        if (!matchFound) {
          return false;
        }
      }

      const createdAt = new Date(item.createdAt);
      if (fromDate) {
        const fromBoundary = new Date(`${fromDate}T00:00:00`);
        if (createdAt < fromBoundary) {
          return false;
        }
      }

      if (toDate) {
        const toBoundary = new Date(`${toDate}T23:59:59.999`);
        if (createdAt > toBoundary) {
          return false;
        }
      }

      return true;
    });
  }, [feedbackEntries, selectedCategory, searchTerm, fromDate, toDate]);

  return (
    <PageLayout
      title="Admin Contact Inbox"
      subtitle="Messages submitted through the public contact form."
    >
      <div className="ui-card p-6">
        {loading ? <p className="text-slate-600">Loading messages...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error ? (
          messages.length ? (
            <div className="space-y-4">
              {messages.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.subject}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-slate-700">
                    From: <span className="font-semibold">{item.name}</span> ({item.email})
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No messages found.</p>
          )
        ) : null}

        {!loading && !error ? (
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-base font-bold text-slate-900">Product Feedback Inbox</h3>
            <p className="mt-1 text-xs text-slate-500">
              Feedback submitted from Contact Us - Product Feedback section.
            </p>

            <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Category
                </label>
                <select
                  className="ui-input"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="all">All</option>
                  <option value="general">General</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="ui">UI / UX</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  User or text
                </label>
                <input
                  type="text"
                  className="ui-input"
                  placeholder="Name, email, or keyword"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  From date
                </label>
                <input
                  type="date"
                  className="ui-input"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  To date
                </label>
                <input
                  type="date"
                  className="ui-input"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </div>
            </div>

            {filteredFeedbackEntries.length ? (
              <div className="mt-4 space-y-4">
                {filteredFeedbackEntries.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-blue-100 bg-blue-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                        {item.category}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-slate-700">
                      By: <span className="font-semibold">{item.user?.name || "Unknown user"}</span>
                      {item.user?.email ? ` (${item.user.email})` : ""}
                    </p>

                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-slate-600">No product feedback found for selected filters.</p>
            )}
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
};

export default AdminMessages;