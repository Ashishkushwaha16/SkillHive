import { useCallback, useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { getProfile, getUsers, sendConnectRequest } from "../services/userService";

const Explore = () => {
  const [skill, setSkill] = useState("");
  const [matchMode, setMatchMode] = useState("any");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusByUser, setStatusByUser] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const buildStatusMap = (profileData) => {
    const nextStatus = {};

    (profileData.connections || []).forEach((item) => {
      const id = item._id || item;
      nextStatus[id.toString()] = "connected";
    });

    (profileData.requestsSent || []).forEach((item) => {
      const id = item._id || item;
      if (!nextStatus[id.toString()]) {
        nextStatus[id.toString()] = "pending";
      }
    });

    return nextStatus;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else {
        stars.push(<span key={i} className="text-slate-300">★</span>);
      }
    }
    return stars;
  };

  const fetchUsers = useCallback(async (searchSkill = "", mode = "any") => {
    try {
      setLoading(true);
      setError("");
      const [usersData, profileData] = await Promise.all([
        getUsers(searchSkill, { multi: true, mode }),
        getProfile(),
      ]);
      setUsers(usersData);
      setStatusByUser(buildStatusMap(profileData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(skill, matchMode);
  };

  const handleConnect = (userId) => {
    const id = userId.toString();

    setStatusByUser((prev) => ({ ...prev, [id]: "pending" }));

    sendConnectRequest(id)
      .then((result) => {
        setMessage({ type: "success", text: result.message || "Request sent" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      })
      .catch((err) => {
        setStatusByUser((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setMessage({ type: "error", text: err.message });
      });
  };

  return (
    <PageLayout title="Explore Mentors" subtitle="Find people by skill and start connecting.">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">

      <form onSubmit={handleSearch} className="mt-5">
        <input
          type="text"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Search skills (e.g., react,node,mongodb)"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-xs text-slate-500">
            Tip: comma-separated skills allowed.
          </p>
          <label className="text-xs font-semibold text-slate-600" htmlFor="matchMode">
            Match:
          </label>
          <select
            id="matchMode"
            value={matchMode}
            onChange={(e) => setMatchMode(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
          >
            <option value="any">Any Skill</option>
            <option value="all">All Skills</option>
          </select>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSkill("");
              setMatchMode("any");
              fetchUsers();
            }}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </form>

      {skill.trim() && (
        <p className="mt-3 text-sm text-slate-500">
          Active filter: <span className="font-semibold text-blue-700">{skill.trim()}</span>
        </p>
      )}

      {message.text && (
        <p className={`mt-4 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      {loading && <p className="mt-6 text-slate-600">Loading users...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end gap-1 mb-1">
                      {renderStars(user.rating ?? 0)}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{(user.rating ?? 0).toFixed(1)}</p>
                  </div>
                </div>

                {user.about && (
                  <p className="text-sm text-slate-600 italic mb-3">{user.about}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 mb-4">
                  {user.skills?.length ? (
                    user.skills.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No skills added</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleConnect(user._id)}
                  disabled={statusByUser[user._id] === "pending" || statusByUser[user._id] === "connected"}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ${
                    statusByUser[user._id] === "connected"
                      ? "bg-green-600 hover:bg-green-700"
                      : statusByUser[user._id] === "pending"
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {statusByUser[user._id] === "connected"
                    ? "✓ Connected"
                    : statusByUser[user._id] === "pending"
                      ? "⏳ Pending"
                      : "+ Connect"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-600">No users found.</p>
          )}
        </div>
      )}
      </div>
    </PageLayout>
  );
};

export default Explore;
