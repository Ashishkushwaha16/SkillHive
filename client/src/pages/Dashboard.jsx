import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import {
  acceptConnectRequest,
  getProfile,
  rejectConnectRequest,
} from "../services/userService";

const Dashboard = () => {
  const navigate = useNavigate();
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

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
      <div className="ui-card p-8">
        <h2 className="text-xl font-semibold text-slate-900">Welcome to SkillHive</h2>
        <p className="mt-2 text-slate-600">Use the navbar to explore mentors and update your profile.</p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
          <h3 className="text-lg font-semibold text-slate-900">Incoming Requests</h3>

          {loadingRequests ? (
            <p className="mt-3 text-sm text-slate-600">Loading requests...</p>
          ) : requests.length ? (
            <div className="mt-4 space-y-3">
              {requests.map((requestUser) => (
                <div
                  key={requestUser._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{requestUser.name}</p>
                    <p className="text-sm text-slate-600">{requestUser.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(requestUser._id)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(requestUser._id)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No incoming requests.</p>
          )}
        </div>

        {message.text ? (
          <p className={`mt-4 text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
            {message.text}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
