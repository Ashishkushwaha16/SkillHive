import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { SUPPORT_EMAIL } from "../config/siteMeta";
import { sendMessage, submitFeedback } from "../services/userService";

const FEEDBACK_MIN_LENGTH = 8;

const buildFeedbackErrorMessage = (rawMessage) => {
  const normalized = String(rawMessage || "").toLowerCase();

  if (
    normalized.includes("not authorized") ||
    normalized.includes("session expired") ||
    normalized.includes("invalid token")
  ) {
    return "Your session has expired. Please login again and submit your feedback.";
  }

  if (normalized.includes("failed to fetch") || normalized.includes("networkerror")) {
    return "Unable to reach the server right now. Please try again in a moment.";
  }

  return rawMessage || "Unable to submit feedback right now. Please try again.";
};

const Contact = () => {
  const isAuthenticated = Boolean(localStorage.getItem("token"));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [feedbackForm, setFeedbackForm] = useState({
    category: "general",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [productFeedback, setProductFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await sendMessage(formData);
      setFeedback({ type: "success", message: "Message sent! We'll respond shortly." });
      setFormData({ name: "", email: "", subject: "", message: "" });

      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleProductFeedbackSubmit = async (e) => {
    e.preventDefault();
    const trimmedFeedbackMessage = feedbackForm.message.trim();

    if (!isAuthenticated) {
      setProductFeedback({
        type: "error",
        message: "Please login first to submit product feedback.",
      });
      return;
    }

    if (trimmedFeedbackMessage.length < FEEDBACK_MIN_LENGTH) {
      setProductFeedback({
        type: "error",
        message: `Please write at least ${FEEDBACK_MIN_LENGTH} characters before submitting.`,
      });
      return;
    }

    setFeedbackLoading(true);
    setProductFeedback(null);

    try {
      const result = await submitFeedback({
        category: feedbackForm.category,
        message: trimmedFeedbackMessage,
      });

      const referenceText = result.feedbackId ? ` Reference ID: ${result.feedbackId}.` : "";
      setProductFeedback({
        type: "success",
        message: `Thanks for your feedback. Our team will review it soon.${referenceText}`,
      });
      setFeedbackForm({ category: "general", message: "" });
    } catch (error) {
      setProductFeedback({ type: "error", message: buildFeedbackErrorMessage(error.message) });
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <PageLayout title="Contact Us" subtitle="We'd love to hear from you. Send us a message!">
      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="ui-card p-8 md:p-10 rounded-2xl bg-white border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
          <div className="mb-6 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
            Support channel
          </div>

          {feedback && (
            <div
              className={`mb-5 rounded-xl px-4 py-3.5 text-sm font-medium border transition-all duration-200 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {feedback.type === "success" ? "✓" : "✕"} {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-slate-900">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-semibold text-slate-900">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-semibold text-slate-900">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What is this about?"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm"
              />
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-semibold text-slate-900">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Tell us more..."
                rows="7"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-base transition-all duration-200 hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Support</p>
            <h2 className="mt-2 text-2xl font-extrabold text-blue-900">We reply fast and keep it practical.</h2>
            <p className="mt-3 text-sm leading-6 text-blue-700">
              Use the form for bugs, account issues, or product feedback. We keep responses concise and actionable.
            </p>
          </div>

          <div className="rounded-2xl p-6 bg-white border border-slate-100 shadow-sm">
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Support Email</p>
                <p className="mt-1.5 font-semibold text-slate-900">{SUPPORT_EMAIL}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Response Time</p>
                <p className="mt-1.5 text-slate-600">Usually within 24 hours on working days.</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Best for</p>
                <p className="mt-1.5 text-slate-600">Bug reports, feature requests, and account help.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-white border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Product Feedback</p>
            <h3 className="mt-2 text-xl font-extrabold text-slate-950">Share your app experience</h3>
            <p className="mt-2 text-sm text-slate-600">
              This section has moved here from the separate feedback page.
            </p>

            {productFeedback ? (
              <div
                role="status"
                aria-live="polite"
                className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium border transition-all duration-200 ${
                  productFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {productFeedback.type === "success" ? "✓" : "✕"} {productFeedback.message}
              </div>
            ) : null}

            <form onSubmit={handleProductFeedbackSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="feedback-category" className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  id="feedback-category"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm"
                  value={feedbackForm.category}
                  onChange={(event) =>
                    setFeedbackForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                >
                  <option value="general">General</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="ui">UI / UX</option>
                </select>
              </div>

              <div>
                <label htmlFor="feedback-message" className="mb-2 block text-sm font-semibold text-slate-700">
                  Feedback
                </label>
                <textarea
                  id="feedback-message"
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm resize-none"
                  placeholder="Tell us what we should improve"
                  value={feedbackForm.message}
                  onChange={(event) =>
                    setFeedbackForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  Minimum {FEEDBACK_MIN_LENGTH} characters.
                  {` ${feedbackForm.message.trim().length}/${FEEDBACK_MIN_LENGTH} completed.`}
                </p>
              </div>

              <button
                type="submit"
                disabled={feedbackLoading || feedbackForm.message.trim().length < FEEDBACK_MIN_LENGTH}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {feedbackLoading ? "Submitting..." : "Submit Product Feedback"}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </PageLayout>
  );
};

export default Contact;
