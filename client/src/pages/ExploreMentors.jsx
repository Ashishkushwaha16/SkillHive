import { useCallback, useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import {
  getProfile,
  getUsers,
  rateUser,
  sendConnectRequest,
} from "../services/userService";

const ExploreMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusByUser, setStatusByUser] = useState({});
  const [ratingByUser, setRatingByUser] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

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

  const loadMentors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [usersData, profileData] = await Promise.all([getUsers(), getProfile()]);

      setMentors(usersData);
      setStatusByUser(buildStatusMap(profileData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  const handleConnect = async (id) => {
    const userId = id.toString();

    setStatusByUser((prev) => ({ ...prev, [userId]: "pending" }));
    setMessage({ type: "", text: "" });

    try {
      await sendConnectRequest(userId);
      setMessage({ type: "success", text: "Connection request sent!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setStatusByUser((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleRate = async (userId, value) => {
    try {
      const result = await rateUser(userId, value);

      setMentors((prev) =>
        prev.map((item) =>
          item._id === userId ? { ...item, rating: result.newRating } : item
        )
      );

      setRatingByUser((prev) => ({ ...prev, [userId]: value }));
      setMessage({ type: "success", text: "Rating submitted successfully." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <PageLayout title="Top Mentors" subtitle="Browse and connect with experienced mentors on SkillHive.">
      {message.text && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
          message.type === "success"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {loading && <p className="text-center text-slate-600 py-8">Loading mentors...</p>}
      {error && <p className="text-center text-red-600 py-8">{error}</p>}

      {!loading && !error ? (
        <div className="grid gap-4 md:grid-cols-2">
          {mentors.length ? (
            mentors.map((mentor) => (
              <div key={mentor._id} className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{mentor.name}</h3>
                    <p className="text-sm text-slate-600">{mentor.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end gap-1 mb-1">
                      {renderStars(mentor.rating ?? 0)}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{(mentor.rating ?? 0).toFixed(1)}</p>
                  </div>
                </div>

                {mentor.about && (
                  <p className="text-sm text-slate-600 italic mb-3 line-clamp-2">{mentor.about}</p>
                )}

                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills?.length ? (
                      mentor.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No skills added</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnect(mentor._id)}
                  disabled={statusByUser[mentor._id] === "pending" || statusByUser[mentor._id] === "connected"}
                  className={`w-full rounded-lg px-4 py-2 font-semibold text-white transition-all duration-200 ${
                    statusByUser[mentor._id] === "connected"
                      ? "bg-green-600 hover:bg-green-700"
                      : statusByUser[mentor._id] === "pending"
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {statusByUser[mentor._id] === "connected"
                    ? "✓ Connected"
                    : statusByUser[mentor._id] === "pending"
                      ? "⏳ Pending"
                      : "+ Connect"}
                </button>

                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-500">Rate Mentor</p>
                  <div className="mt-2 flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRate(mentor._id, value)}
                        className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                          ratingByUser[mentor._id] === value
                            ? "bg-yellow-400 text-slate-900"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {value}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-600">No mentors found.</p>
          )}
        </div>
      ) : null}
    </PageLayout>
  );
};

export default ExploreMentors;
