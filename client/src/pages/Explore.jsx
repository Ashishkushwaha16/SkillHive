import { useCallback, useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import {
  getProfile,
  getSkillMatches,
  getUsers,
  rateUser,
  sendConnectRequest,
} from "../services/userService";

const Explore = () => {
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
    fetchUsers({});
  }, [fetchUsers]);

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

  return (
    <PageLayout title="Explore Mentors" subtitle="Find people by skill and start connecting.">
      <div className="space-y-6">
        <section className="ui-card-soft p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr,0.7fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Skill search</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Search by one skill or combine several.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Use comma-separated skills to narrow results. Match mode controls whether all selected skills are required or just one.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Connected</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{Object.values(statusByUser).filter((value) => value === "connected").length}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pending</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{Object.values(statusByUser).filter((value) => value === "pending").length}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Results</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{users.length}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Search skills, e.g. react, node, mongodb"
              className="ui-input"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs text-slate-500">Tip: comma-separated skills are supported.</p>
                  <label className="text-xs font-semibold text-slate-600" htmlFor="viewMode">
                    View:
                  </label>
                  <select
                    id="viewMode"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <option value="all">All users</option>
                    <option value="matches">Smart matches</option>
                  </select>
                <label className="text-xs font-semibold text-slate-600" htmlFor="matchMode">
                  Match mode:
                </label>
                <select
                  id="matchMode"
                  value={matchMode}
                  onChange={(e) => setMatchMode(e.target.value)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <option value="any">Any skill</option>
                  <option value="all">All skills</option>
                </select>
                <label className="text-xs font-semibold text-slate-600" htmlFor="sortBy">
                  Sort by:
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                  <option value="createdAt">Newest</option>
                </select>
                <select
                  aria-label="sort order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <option value="desc">High to low</option>
                  <option value="asc">Low to high</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
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
                  className="ui-btn-secondary rounded-full px-5 py-2.5"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="ui-btn-primary rounded-full px-5 py-2.5"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="Min rating (0-5)"
                className="ui-input"
              />
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={maxRating}
                onChange={(e) => setMaxRating(e.target.value)}
                placeholder="Max rating (0-5)"
                className="ui-input"
                disabled={viewMode === "matches"}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="Min match score (0-100)"
                className="ui-input"
                disabled={viewMode !== "matches"}
              />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                {viewMode === "matches"
                  ? "Smart mode prioritizes skill overlap score."
                  : "All users mode uses backend filters and sorting."}
              </div>
            </div>
          </form>
        </section>

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

        {loading && <p className="text-slate-600">Loading users...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2">
            {users.length > 0 ? (
              users.map((user) => (
                <article key={user._id} className="ui-card-soft p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_80px_-30px_rgba(37,99,235,0.38)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                        Mentor profile
                      </div>
                      <h3 className="mt-3 text-xl font-extrabold text-slate-950">{user.name}</h3>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950 px-3 py-2 text-right text-white">
                      <p className="text-2xl font-black leading-none">{(user.rating ?? 0).toFixed(1)}</p>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Rating</p>
                    </div>
                  </div>

                  {typeof user.matchScore === "number" ? (
                    <div className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      Match {user.matchScore}%
                    </div>
                  ) : null}

                  {user.about && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">{user.about}</p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {user.skills?.length ? (
                      user.skills.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/70 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm"
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
                    className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 ${
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
                        ? "Request pending"
                        : "Connect now"}
                  </button>

                    {statusByUser[user._id] === "connected" ? (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Rate this mentor</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <select
                            value={ratingDraftByUser[user._id] || ""}
                            onChange={(e) =>
                              setRatingDraftByUser((prev) => ({
                                ...prev,
                                [user._id]: e.target.value,
                              }))
                            }
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
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
                            className="ui-btn-secondary rounded-xl px-4 py-2 text-sm"
                          >
                            {ratingLoadingByUser[user._id] ? "Submitting..." : "Submit rating"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                </article>
              ))
            ) : (
              <div className="ui-card p-8 text-slate-600">
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
