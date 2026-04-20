import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { SUPPORT_EMAIL } from "../config/siteMeta";
import { sendMessage, submitFeedback } from "../services/userService";

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
    if (!isAuthenticated) {
      setProductFeedback({ type: "error", message: "Please login first to submit platform feedback." });
      return;
    }

    setFeedbackLoading(true);
    setProductFeedback(null);

    try {
      const result = await submitFeedback({
        category: feedbackForm.category,
        message: feedbackForm.message,
      });
      setProductFeedback({ type: "success", message: result.message || "Feedback submitted successfully." });
      setFeedbackForm({ category: "general", message: "" });
    } catch (error) {
      setProductFeedback({ type: "error", message: error.message });
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <PageLayout title="Contact Us" subtitle="We'd love to hear from you. Send us a message!">
      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="ui-card p-8 md:p-10">
          <div className="mb-6 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Support channel
          </div>

          {feedback && (
            <div
              className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="ui-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  className="ui-input"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What is this about?"
                className="ui-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Tell us more..."
                rows="7"
                className="ui-input resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ui-btn-primary w-full rounded-2xl py-3.5 text-base"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="ui-card-soft p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Support</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">We reply fast and keep it practical.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use the form for bugs, account issues, or product feedback. We keep responses concise and actionable.
            </p>
          </div>

          <div className="ui-card p-6">
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Support Email</p>
                <p className="mt-1 font-semibold text-slate-950">{SUPPORT_EMAIL}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Response Time</p>
                <p className="mt-1 text-slate-600">Usually within 24 hours on working days.</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Best for</p>
                <p className="mt-1 text-slate-600">Bug reports, feature requests, and account help.</p>
              </div>
            </div>
          </div>

          <div className="ui-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Product Feedback</p>
            <h3 className="mt-2 text-xl font-extrabold text-slate-950">Share your app experience</h3>
            <p className="mt-2 text-sm text-slate-600">
              This section has moved here from the separate feedback page.
            </p>

            {productFeedback ? (
              <div
                className={`mt-4 rounded-xl px-3 py-2 text-sm font-medium ${
                  productFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {productFeedback.message}
              </div>
            ) : null}

            <form onSubmit={handleProductFeedbackSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="feedback-category" className="mb-1 block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  id="feedback-category"
                  className="ui-input"
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
                <label htmlFor="feedback-message" className="mb-1 block text-sm font-semibold text-slate-700">
                  Feedback
                </label>
                <textarea
                  id="feedback-message"
                  rows="4"
                  className="ui-input resize-none"
                  placeholder="Tell us what we should improve"
                  value={feedbackForm.message}
                  onChange={(event) =>
                    setFeedbackForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={feedbackLoading || feedbackForm.message.trim().length < 8}
                className="ui-btn-secondary w-full"
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
