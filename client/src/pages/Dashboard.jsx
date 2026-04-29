import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import {
  acceptConnectRequest,
  getProfile,
  rejectConnectRequest,
} from "../services/userService";

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const profile = await getProfile();
      setRequests(profile.requestsReceived || []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (userId) => {
    try {
      await acceptConnectRequest(userId);
      setMessage({ type: "success", text: "Request accepted" });
      await loadRequests();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectConnectRequest(userId);
      setMessage({ type: "success", text: "Request rejected" });
      await loadRequests();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <PageLayout title="Dashboard" subtitle="Manage your learning and mentoring activity.">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Workspace</p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-blue-950 to-emerald-800 bg-clip-text text-transparent">Welcome back.</h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                Track incoming requests, keep your profile current, and move learning conversations forward from
                one place.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Pending requests", value: requests.length.toString(), tone: "blue" },
              { label: "Status", value: loadingRequests ? "Syncing" : "Ready", tone: "emerald" },
              { label: "Next step", value: "Review inbox", tone: "slate" },
            ].map((item) => {
              const toneBg = item.tone === "emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : item.tone === "blue" ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-slate-50 border-slate-200 text-slate-900";
              return (
                <div key={item.label} className={`rounded-lg border p-5 shadow-sm hover:shadow-md transition-all duration-200 ${toneBg}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">{item.label}</p>
                  <p className={`mt-3 text-2xl font-black ${item.tone === "emerald" ? "text-emerald-900" : item.tone === "blue" ? "text-blue-900" : "text-slate-900"}`}>{item.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-blue-50/50 to-white p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">📄 Incoming Requests</h3>
                <p className="mt-1 text-sm text-slate-600">Accept or reject new connection requests.</p>
              </div>
            </div>

            {loadingRequests ? (
              <p className="mt-4 text-sm text-slate-600">Loading requests...</p>
            ) : requests.length ? (
              <div className="mt-5 space-y-3">
                {requests.map((requestUser) => (
                  <div
                    key={requestUser._id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{requestUser.name}</p>
                      <p className="text-sm text-slate-600">{requestUser.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAccept(requestUser._id)}
                        className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_4px_12px_-4px_rgba(16,185,129,0.4)] active:scale-95"
                      >
                        ✓ Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(requestUser._id)}
                        className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_4px_12px_-4px_rgba(220,38,38,0.4)] active:scale-95"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No incoming requests.</p>
            )}
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
        </section>

        <aside className="rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 to-white p-6 md:p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Quick actions</p>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "📄 Update profile",
                text: "Keep your skills and intro current so mentors can understand your goals quickly.",
                tone: "amber",
                to: "/profile",
              },
              {
                title: "🔍 Explore mentors",
                text: "Search for people with the expertise you need and send a connection request.",
                tone: "sky",
                to: "/explore",
              },
              {
                title: "📥 Review inbox",
                text: "Respond to requests quickly to keep conversations moving.",
                tone: "emerald",
                to: "/messages",
              },
            ].map((item) => {
              const toneClasses =
                item.tone === "amber"
                  ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-300"
                  : item.tone === "sky"
                    ? "border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-300"
                    : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-300";

              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className={`block rounded-lg border p-4 shadow-sm hover:shadow-md transition-all duration-200 ${toneClasses}`}
                >
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
