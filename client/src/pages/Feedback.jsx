import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { submitFeedback } from "../services/userService";

const Feedback = () => {
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const result = await submitFeedback({ category, message });
      setStatus({ type: "success", text: result.message || "Feedback submitted" });
      setMessage("");
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Feedback"
      subtitle="Tell us what works, what breaks, and what you want next in SkillHive."
    >
      <section className="ui-card mx-auto max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedback-category" className="mb-1 block text-sm font-semibold text-slate-700">
              Category
            </label>
            <select
              id="feedback-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="ui-input"
            >
              <option value="general">General</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="ui">UI / UX</option>
            </select>
          </div>

          <div>
            <label htmlFor="feedback-message" className="mb-1 block text-sm font-semibold text-slate-700">
              Message
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="ui-input resize-none"
              placeholder="Share your feedback in detail"
              required
            />
          </div>

          <button type="submit" disabled={submitting || message.trim().length < 8} className="ui-btn-primary">
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>

        {status.text ? (
          <p className={`mt-4 text-sm ${status.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>
            {status.text}
          </p>
        ) : null}
      </section>
    </PageLayout>
  );
};

export default Feedback;
