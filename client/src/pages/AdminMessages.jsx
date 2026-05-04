import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import {
  getAiSearchQuickIssues,
  getFeedbackEntries,
  getMessages,
  updateAiSearchQuickIssues,
} from "../services/userService";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [quickIssues, setQuickIssues] = useState([]);
  const [quickIssuesLoading, setQuickIssuesLoading] = useState(true);
  const [quickIssuesSaving, setQuickIssuesSaving] = useState(false);
  const [quickIssuesError, setQuickIssuesError] = useState("");
  const [quickIssuesSuccess, setQuickIssuesSuccess] = useState("");

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const [messagesData, feedbackData, quickIssueData] = await Promise.all([
          getMessages(),
          getFeedbackEntries(),
          getAiSearchQuickIssues(),
        ]);
        setMessages(messagesData);
        setFeedbackEntries(feedbackData);
        setQuickIssues(Array.isArray(quickIssueData?.issues) ? quickIssueData.issues : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setQuickIssuesLoading(false);
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

  const updateQuickIssueField = (index, field, value) => {
    setQuickIssues((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item
      )
    );
    setQuickIssuesSuccess("");
    setQuickIssuesError("");
  };

  const addQuickIssue = () => {
    setQuickIssues((prev) => [
      ...prev,
      {
        id: `issue-${Date.now()}`,
        label: "",
        prompt: "",
      },
    ]);
    setQuickIssuesSuccess("");
    setQuickIssuesError("");
  };

  const removeQuickIssue = (index) => {
    setQuickIssues((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    setQuickIssuesSuccess("");
    setQuickIssuesError("");
  };

  const saveQuickIssues = async () => {
    setQuickIssuesSaving(true);
    setQuickIssuesError("");
    setQuickIssuesSuccess("");

    try {
      const payload = quickIssues.map((item) => ({
        id: String(item.id || "").trim(),
        label: String(item.label || "").trim(),
        prompt: String(item.prompt || "").trim(),
      }));

      const duplicateCheck = new Set();
      for (const item of payload) {
        if (!item.id || !item.label || !item.prompt) {
          throw new Error("Each quick issue must include id, label, and prompt.");
        }
        if (duplicateCheck.has(item.id)) {
          throw new Error(`Duplicate quick issue id found: ${item.id}`);
        }
        duplicateCheck.add(item.id);
      }

      const response = await updateAiSearchQuickIssues(payload);
      setQuickIssues(Array.isArray(response?.issues) ? response.issues : payload);
      setQuickIssuesSuccess("AI Search quick issues updated successfully.");
    } catch (saveError) {
      setQuickIssuesError(saveError.message || "Failed to update quick issues");
    } finally {
      setQuickIssuesSaving(false);
    }
  };

  return (
    <PageLayout
      title="Admin Contact Inbox"
      subtitle="Messages submitted through the public contact form."
    >
      <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.22)] backdrop-blur">
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

        {!loading && !error ? (
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Search Quick Issues</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Manage one-click prompts shown in Support &gt; AI Search Engine.
                </p>
              </div>
              <button
                type="button"
                onClick={addQuickIssue}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Add Issue
              </button>
            </div>

            {quickIssuesLoading ? <p className="mt-3 text-sm text-slate-600">Loading quick issue config...</p> : null}
            {quickIssuesError ? <p className="mt-3 text-sm text-red-600">{quickIssuesError}</p> : null}
            {quickIssuesSuccess ? <p className="mt-3 text-sm text-emerald-600">{quickIssuesSuccess}</p> : null}

            {!quickIssuesLoading && quickIssues.length ? (
              <div className="mt-4 space-y-3">
                {quickIssues.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="grid gap-3 md:grid-cols-12">
                      <div className="md:col-span-3">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          ID
                        </label>
                        <input
                          type="text"
                          className="ui-input"
                          value={item.id}
                          onChange={(event) => updateQuickIssueField(index, "id", event.target.value)}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Label
                        </label>
                        <input
                          type="text"
                          className="ui-input"
                          value={item.label}
                          onChange={(event) => updateQuickIssueField(index, "label", event.target.value)}
                        />
                      </div>

                      <div className="md:col-span-5">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Prompt
                        </label>
                        <input
                          type="text"
                          className="ui-input"
                          value={item.prompt}
                          onChange={(event) => updateQuickIssueField(index, "prompt", event.target.value)}
                        />
                      </div>

                      <div className="flex items-end md:col-span-1">
                        <button
                          type="button"
                          onClick={() => removeQuickIssue(index)}
                          className="w-full rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!quickIssuesLoading && !quickIssues.length ? (
              <p className="mt-4 text-sm text-slate-600">No quick issues configured yet.</p>
            ) : null}

            <div className="mt-4">
              <button
                type="button"
                onClick={saveQuickIssues}
                disabled={quickIssuesSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {quickIssuesSaving ? "Saving..." : "Save Quick Issues"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
};

export default AdminMessages;