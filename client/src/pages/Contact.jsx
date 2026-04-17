import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { sendMessage } from "../services/userService";

const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || "hello@skillhive.app";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

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
        </aside>
      </div>
    </PageLayout>
  );
};

export default Contact;
