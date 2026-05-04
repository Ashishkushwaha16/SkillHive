import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import SkillSearch from "../components/SkillSearch";
import {
  getProfile,
  getSkillMatches,
  getUserReviews,
  getUsers,
  rateUser,
  sendConnectRequest,
} from "../services/userService";

const Explore = () => {
  const [searchParams] = useSearchParams();
  const [skill, setSkill] = useState("");
  const [matchMode, setMatchMode] = useState("any");
  const [viewMode, setViewMode] = useState("all");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");
  const [minScore, setMinScore] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusByUser, setStatusByUser] = useState({});
  const [ratingDraftByUser, setRatingDraftByUser] = useState({});
  const [ratingLoadingByUser, setRatingLoadingByUser] = useState({});
  const [reviewsByUser, setReviewsByUser] = useState({});
  const [reviewsLoadingByUser, setReviewsLoadingByUser] = useState({});
  const [expandedReviewsUserId, setExpandedReviewsUserId] = useState("");
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

  const fetchUsers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError("");
      const {
        searchSkill = "",
        skillMode = "any",
        searchViewMode = "all",
        searchMinRating = "",
        searchMaxRating = "",
        searchSortBy = "rating",
        searchSortOrder = "desc",
        searchMinScore = "",
      } = filters;

      const [usersData, profileData] = await Promise.all([
        searchViewMode === "matches"
          ? getSkillMatches({
              skills: searchSkill,
              minScore: searchMinScore,
              minRating: searchMinRating,
              sortBy: searchSortBy === "createdAt" ? "matchScore" : searchSortBy,
              sortOrder: searchSortOrder,
              limit: 100,
            })
          : getUsers(searchSkill, {
              multi: true,
              mode: skillMode,
              minRating: searchMinRating,
              maxRating: searchMaxRating,
              sortBy: searchSortBy,
              sortOrder: searchSortOrder,
              limit: 100,
            }),
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
    const skillFromUrl = searchParams.get("skills") || "";
    setSkill(skillFromUrl);
    fetchUsers({ searchSkill: skillFromUrl });
  }, [searchParams, fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers({
      searchSkill: skill,
      skillMode: matchMode,
      searchViewMode: viewMode,
      searchMinRating: minRating,
      searchMaxRating: maxRating,
      searchSortBy: sortBy,
      searchSortOrder: sortOrder,
      searchMinScore: minScore,
    });
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

  const handleRateUser = async (userId) => {
    const id = userId.toString();
    const selectedRating = Number(ratingDraftByUser[id]);

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setMessage({ type: "error", text: "Please select rating between 1 and 5" });
      return;
    }

    setRatingLoadingByUser((prev) => ({ ...prev, [id]: true }));
    setMessage({ type: "", text: "" });

    try {
      const result = await rateUser(id, selectedRating);
      setUsers((prev) =>
        prev.map((item) =>
          item._id.toString() === id
            ? { ...item, rating: typeof result.newRating === "number" ? result.newRating : item.rating }
            : item
        )
      );

      setMessage({
        type: "success",
        text: `Rating submitted. New rating: ${result.newRating?.toFixed?.(1) || result.newRating}`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setRatingLoadingByUser((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleReviews = async (userId) => {
    const id = userId.toString();

    if (expandedReviewsUserId === id) {
      setExpandedReviewsUserId("");
      return;
    }

    setExpandedReviewsUserId(id);

    if (reviewsByUser[id]) {
      return;
    }

    try {
      setReviewsLoadingByUser((prev) => ({ ...prev, [id]: true }));
      const reviews = await getUserReviews(id);
      setReviewsByUser((prev) => ({ ...prev, [id]: reviews || [] }));
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setReviewsLoadingByUser((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <PageLayout title="Explore Mentors" subtitle="Find people by skill and start connecting.">
      <div className="space-y-6">
        <SkillSearch
          skill={skill}
          matchMode={matchMode}
          viewMode={viewMode}
          minRating={minRating}
          maxRating={maxRating}
          sortBy={sortBy}
          sortOrder={sortOrder}
          minScore={minScore}
          onSkillChange={setSkill}
          onMatchModeChange={setMatchMode}
          onViewModeChange={setViewMode}
          onMinRatingChange={setMinRating}
          onMaxRatingChange={setMaxRating}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          onMinScoreChange={setMinScore}
          onSearch={handleSearch}
          onClear={() => {
            setSkill("");
            setMatchMode("any");
            setViewMode("all");
            setMinRating("");
            setMaxRating("");
            setSortBy("rating");
            setSortOrder("desc");
            setMinScore("");
            fetchUsers({});
          }}
          connectedCount={Object.values(statusByUser).filter((value) => value === "connected").length}
          pendingCount={Object.values(statusByUser).filter((value) => value === "pending").length}
          resultsCount={users.length}
        />

        {skill.trim() && (
          <p className="text-sm text-slate-500">
            Active filter: <span className="font-semibold text-slate-950">{skill.trim()}</span>
          </p>
        )}

        {message.text && (
          <p className={`text-sm font-medium ${message.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
            {message.text}
          </p>
        )}

        {loading ? (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="ui-skeleton h-5 w-24 rounded-full" />
                    <div className="ui-skeleton h-4 w-36" />
                    <div className="ui-skeleton h-3 w-44" />
                  </div>
                  <div className="ui-skeleton h-12 w-14 rounded-2xl" />
                </div>
                <div className="mt-4 ui-skeleton h-3 w-full" />
                <div className="mt-2 ui-skeleton h-3 w-5/6" />
                <div className="mt-4 flex gap-2">
                  <div className="ui-skeleton h-6 w-16 rounded-full" />
                  <div className="ui-skeleton h-6 w-20 rounded-full" />
                </div>
                <div className="mt-4 ui-skeleton h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : null}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {users.length > 0 ? (
              users.map((user) => (
                <article key={user._id} className="animate-fade-up rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_18px_40px_-22px_rgba(37,99,235,0.3)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
                          <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                        Mentor
                      </div>
                      <h3 className="mt-2 text-lg sm:text-xl font-extrabold text-slate-950 truncate">{user.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 truncate">{user.email}</p>
                    </div>
                    <div className="rounded-lg sm:rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950 px-2 sm:px-3 py-2 text-right text-white flex-shrink-0 shadow-sm">
                      <p className="text-lg sm:text-2xl font-black leading-none">{(user.rating ?? 0).toFixed(1)}</p>
                      <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.14em] text-slate-300">Rating</p>
                    </div>
                  </div>

                  {typeof user.matchScore === "number" ? (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5 9 16.5 19 6.5" />
                        </svg>
                      </span>
                      Match {user.matchScore}%
                    </div>
                  ) : null}

                  {user.about && (
                    <p className="mt-3 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600 line-clamp-2">{user.about}</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {user.skills?.length ? (
                      user.skills.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/70 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No skills</span>
                    )}
                    {user.skills?.length > 3 && (
                      <span className="rounded-full border border-white/70 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                        +{user.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConnect(user._id)}
                    disabled={statusByUser[user._id] === "pending" || statusByUser[user._id] === "connected"}
                    className={`mt-4 w-full rounded-lg sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-200 ${
                      statusByUser[user._id] === "connected"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : statusByUser[user._id] === "pending"
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-slate-950 hover:-translate-y-0.5 hover:bg-slate-800"
                    }`}
                  >
                    {statusByUser[user._id] === "connected"
                      ? "Connected"
                      : statusByUser[user._id] === "pending"
                        ? "Pending"
                        : "Connect"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleReviews(user._id)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {expandedReviewsUserId === user._id.toString() ? "Hide Feedback" : "View Feedback"}
                  </button>

                  {expandedReviewsUserId === user._id.toString() ? (
                    <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Public mentor feedback
                      </p>
                      {reviewsLoadingByUser[user._id] ? (
                        <p className="mt-2 text-sm text-slate-600">Loading feedback...</p>
                      ) : (reviewsByUser[user._id] || []).length ? (
                        <div className="mt-2 space-y-2">
                          {(reviewsByUser[user._id] || []).slice(0, 3).map((review) => (
                            <article key={review._id} className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900">
                                  {(review.reviewer?.name || "User")}
                                </p>
                                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                                  {review.rating}/5
                                </span>
                              </div>
                              {review.comment ? (
                                <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
                              ) : (
                                <p className="mt-1 text-sm text-slate-500">No comment added.</p>
                              )}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-600">No public feedback yet.</p>
                      )}
                    </div>
                  ) : null}

                    {statusByUser[user._id] === "connected" ? (
                      <div className="mt-3 rounded-lg sm:rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-2.5 sm:p-3 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Rate</p>
                        <div className="mt-2 flex flex-col sm:flex-row flex-wrap items-center gap-2">
                          <select
                            value={ratingDraftByUser[user._id] || ""}
                            onChange={(e) =>
                              setRatingDraftByUser((prev) => ({
                                ...prev,
                                [user._id]: e.target.value,
                              }))
                            }
                            className="w-full sm:flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm"
                          >
                            <option value="">Select</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRateUser(user._id)}
                            disabled={ratingLoadingByUser[user._id]}
                            className="w-full sm:w-auto ui-btn-secondary rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm"
                          >
                            {ratingLoadingByUser[user._id] ? "..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                </article>
              ))
            ) : (
              <div className="ui-card col-span-full p-6 sm:p-8 text-center text-slate-600">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Explore;
