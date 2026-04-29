import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { getPlatformOverview, sendConnectRequest } from "../services/userService";

const About = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [connecting, setConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState("none");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const result = await getPlatformOverview();
        setData(result);
        setConnectionState(result.connectionState || "none");
      } catch (error) {
        setMessage({ type: "error", text: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const handleConnectDeveloper = async () => {
    if (!data?.developer?._id) {
      return;
    }

    try {
      setConnecting(true);
      const result = await sendConnectRequest(data.developer._id);
      setConnectionState("pending");
      setMessage({ type: "success", text: result.message || "Request sent" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-slate-600">Loading about section...</p>;
  }

  return (
    <PageLayout title="About SkillHive" subtitle="A community where learners and mentors grow together.">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Platform story</p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 md:text-3xl">
                Built for practical learning, mentorship, and faster skill growth.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                SkillHive helps people discover mentors, share expertise, and organize meaningful learning
                connections without the noise of a generic social app.
              </p>
            </div>

            <div className="grid min-w-[220px] gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <p className="text-xs uppercase tracking-[0.24em] font-semibold text-slate-600">Total users</p>
                <p className="mt-2.5 text-3xl font-black text-slate-900">{data?.stats?.totalUsers ?? 0}</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <p className="text-xs uppercase tracking-[0.24em] font-semibold text-blue-700">Connection</p>
                <p className="mt-2.5 text-lg font-black text-blue-900 capitalize">{connectionState}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "🔍 Mentor discovery", value: "Fast search and filtering" },
              { label: "💬 Direct contact", value: "Simple requests and follow-ups" },
              { label: "📚 Learning focus", value: "Skills, goals, and progress" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 to-white p-6 md:p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Developer</p>
          {data?.developer ? (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{data.developer.name}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{data.developer.email}</p>
              </div>

              <p className="text-sm leading-7 text-slate-600">
                Reach out to the developer directly if you need support, want to share feedback, or have a
                collaboration request.
              </p>

              <button
                type="button"
                onClick={handleConnectDeveloper}
                disabled={connecting || connectionState === "pending" || connectionState === "connected"}
                className={`w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold transition-all duration-200 ${
                  connectionState === "connected" || connectionState === "pending"
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] active:scale-95"
                }`}
              >
                {connectionState === "connected"
                  ? "✓ Connected"
                  : connectionState === "pending"
                    ? "⏳ Request pending"
                    : connecting
                      ? "Sending..."
                      : "Connect with developer"}
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">Developer info not available yet.</p>
          )}
        </aside>
      </div>

      {message.text ? (
        <div className={`mt-4 p-3.5 rounded-lg text-sm font-medium border ${
          message.type === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {message.type === "success" ? "✓" : "✕"} {message.text}
        </div>
      ) : null}
    </PageLayout>
  );
};

export default About;
