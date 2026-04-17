import { useEffect, useState } from "react";
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
        <section className="ui-card p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Workspace</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Welcome back.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Track incoming requests, keep your profile current, and move learning conversations forward from
                one place.
              </p>
            </div>

          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Pending requests", value: requests.length.toString() },
              { label: "Status", value: loadingRequests ? "Syncing" : "Ready" },
              { label: "Next step", value: "Review inbox" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Incoming Requests</h3>
                <p className="mt-1 text-sm text-slate-600">Accept or reject new connection requests.</p>
              </div>
            </div>

            {loadingRequests ? (
              <p className="mt-4 text-sm text-slate-600">Loading requests...</p>
            ) : requests.length ? (
              <div className="mt-4 space-y-3">
                {requests.map((requestUser) => (
                  <div
                    key={requestUser._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{requestUser.name}</p>
                      <p className="text-sm text-slate-600">{requestUser.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAccept(requestUser._id)}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(requestUser._id)}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
                      >
                        Reject
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
            <p className={`mt-4 text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {message.text}
            </p>
          ) : null}
        </section>

        <aside className="ui-card-soft p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Quick actions</p>
          <div className="mt-4 space-y-4">
            {[
              {
                title: "Update profile",
                text: "Keep your skills and intro current so mentors can understand your goals quickly.",
              },
              {
                title: "Explore mentors",
                text: "Search for people with the expertise you need and send a connection request.",
              },
              {
                title: "Review inbox",
                text: "Respond to requests quickly to keep conversations moving.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
