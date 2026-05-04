import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import {
  acceptConnectRequest,
  getProfile,
  getSkillMatches,
  getUsers,
  rejectConnectRequest,
  sendConnectRequest,
} from "../services/userService";

const getProfileCompletion = (profile = {}) => {
  const checks = [
    { done: Boolean(profile?.avatar?.url), action: "Add profile photo" },
    { done: Boolean((profile?.about || "").trim().length >= 30), action: "Write a stronger About section" },
    { done: Array.isArray(profile?.skills) && profile.skills.length >= 3, action: "Add at least 3 skills" },
    { done: Boolean(profile?.resume?.url), action: "Upload your resume" },
    { done: Array.isArray(profile?.achievements) && profile.achievements.length >= 1, action: "Add one achievement" },
  ];

  const completed = checks.filter((item) => item.done).length;
  const percent = Math.round((completed / checks.length) * 100);
  const nextStep = checks.find((item) => !item.done)?.action || "Start a new mentor conversation";

  return { percent, nextStep };
};

const buildStatusMap = (profile = {}) => {
  const next = {};

  (profile.connections || []).forEach((item) => {
    const id = item?._id || item;
    if (id) next[id.toString()] = "connected";
  });

  (profile.requestsSent || []).forEach((item) => {
    const id = item?._id || item;
    if (id && !next[id.toString()]) next[id.toString()] = "pending";
  });

  return next;
};

const getSharedSkills = (userSkills = [], mentorSkills = []) => {
  const userSet = new Set((userSkills || []).map((item) => String(item).trim().toLowerCase()));
  return (mentorSkills || []).filter((item) => userSet.has(String(item).trim().toLowerCase()));
};

const QUICK_ACTIONS = [
  {
    title: "Update profile",
    text: "Keep your skills and intro current so mentors can understand your goals quickly.",
    tone: "amber",
    to: "/profile",
    icon: "M12 2a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 0 0 1 5-5Zm0 12c4.42 0 8 2.24 8 5v3H4v-3c0-2.76 3.58-5 8-5Z",
  },
  {
    title: "Explore mentors",
    text: "Search for people with the expertise you need and send a connection request.",
    tone: "sky",
    to: "/explore",
    icon: "M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm8.5 14.5-4.35-4.35",
  },
  {
    title: "Review inbox",
    text: "Respond to requests quickly to keep conversations moving.",
    tone: "emerald",
    to: "/messages",
    icon: "M4 6h16v12H4z M4 7l8 6 8-6",
  },
];

const getQuickActionToneClasses = (tone) => {
  if (tone === "amber") {
    return {
      card: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-300",
      icon: "border-amber-200 text-amber-700",
    };
  }

  if (tone === "sky") {
    return {
      card: "border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-300",
      icon: "border-sky-200 text-sky-700",
    };
  }

  return {
    card: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-300",
    icon: "border-emerald-200 text-emerald-700",
  };
};

const Dashboard = () => {
  const [profile, setProfile] = useState({});
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [suggestedMentorPool, setSuggestedMentorPool] = useState([]);
  const [loadingSuggested, setLoadingSuggested] = useState(true);
  const [statusByUser, setStatusByUser] = useState({});
  const [toast, setToast] = useState({ open: false, type: "success", text: "" });
  const toastTimerRef = useRef(null);

  const userSkills = useMemo(() => (Array.isArray(profile.skills) ? profile.skills : []), [profile]);
  const profileCompletion = useMemo(() => getProfileCompletion(profile), [profile]);

  const dashboardMetrics = useMemo(
    () => [
      { label: "Pending requests", value: requests.length.toString(), tone: "blue" },
      { label: "Profile readiness", value: loadingRequests ? "Syncing" : `${profileCompletion.percent}%`, tone: "emerald" },
      { label: "Next step", value: loadingRequests ? "Syncing" : profileCompletion.nextStep, tone: "slate" },
    ],
    [loadingRequests, profileCompletion.nextStep, profileCompletion.percent, requests.length],
  );

  const visibleSuggestedMentors = useMemo(
    () =>
      suggestedMentorPool
        .filter((mentor) => {
          const id = mentor?._id?.toString?.();
          return id && statusByUser[id] !== "connected" && statusByUser[id] !== "pending";
        })
        .slice(0, 3),
    [statusByUser, suggestedMentorPool],
  );

  const showToast = (type, text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ open: true, type, text });
    toastTimerRef.current = setTimeout(() => {
      setToast({ open: false, type: "success", text: "" });
    }, 2600);
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      setLoadingSuggested(true);

      const nextProfile = (await getProfile()) || {};
      setProfile(nextProfile);
      setRequests(nextProfile.requestsReceived || []);

      const nextStatus = buildStatusMap(nextProfile);
      setStatusByUser(nextStatus);

      const skillQuery = Array.isArray(nextProfile.skills) ? nextProfile.skills.slice(0, 5).join(",") : "";
      const mentorCandidates = skillQuery
        ? await getSkillMatches({
            skills: skillQuery,
            minRating: 2,
            sortBy: "matchScore",
            sortOrder: "desc",
            limit: 6,
          })
        : await getUsers("", {
            sortBy: "rating",
            sortOrder: "desc",
            limit: 6,
          });

      const cleanMentors = (mentorCandidates || [])
        .filter((item) => item?._id && item._id.toString() !== nextProfile?._id?.toString())
        .filter((item) => {
          const id = item._id?.toString?.();
          return nextStatus[id] !== "connected" && nextStatus[id] !== "pending";
        })
        .slice(0, 8);

      setSuggestedMentorPool(cleanMentors);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoadingRequests(false);
      setLoadingSuggested(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
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

  const handleConnectSuggested = async (userId) => {
    const id = userId.toString();
    const removedMentor = suggestedMentorPool.find((item) => item?._id?.toString?.() === id);
    const shouldRefreshSuggestions = suggestedMentorPool.length <= 4;

    try {
      setStatusByUser((prev) => ({ ...prev, [id]: "pending" }));
      setSuggestedMentorPool((prev) => prev.filter((item) => item?._id?.toString?.() !== id));

      const result = await sendConnectRequest(id);
      const text = result.message || "Connection request sent";
      setMessage({ type: "success", text });
      showToast("success", text);

      if (shouldRefreshSuggestions) {
        loadRequests();
      }
    } catch (error) {
      setStatusByUser((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      if (removedMentor) {
        setSuggestedMentorPool((prev) => [removedMentor, ...prev]);
      }

      setMessage({ type: "error", text: error.message });
      showToast("error", error.message || "Unable to send request");
    }
  };

  return (
    <PageLayout title="Dashboard" subtitle="Manage your learning and mentoring activity.">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="animate-fade-up rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Workspace</p>
              <h2 className="mt-4 text-2xl font-black tracking-tight bg-gradient-to-r from-blue-950 to-emerald-800 bg-clip-text text-transparent sm:text-3xl">
                Welcome back.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                Track incoming requests, keep your profile current, and move learning conversations forward from one place.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {dashboardMetrics.map((item) => {
              const toneBg =
                item.tone === "emerald"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : item.tone === "blue"
                    ? "bg-blue-50 border-blue-200 text-blue-900"
                    : "bg-slate-50 border-slate-200 text-slate-900";
              const toneIcon =
                item.tone === "emerald"
                  ? "M9 12.75 11.25 15 15 9.75"
                  : item.tone === "blue"
                    ? "M12 4v16m8-8H4"
                    : "M5 12h14M12 5l7 7-7 7";

              return (
                <div key={item.label} className={`rounded-lg border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${toneBg}`}>
                  <div
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                      item.tone === "emerald"
                        ? "border-emerald-200 bg-white text-emerald-700"
                        : item.tone === "blue"
                          ? "border-blue-200 bg-white text-blue-700"
                          : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d={toneIcon} />
                    </svg>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">{item.label}</p>
                  <p
                    className={`mt-3 ${item.label === "Next step" ? "text-sm font-bold leading-6" : "text-2xl font-black"} ${
                      item.tone === "emerald"
                        ? "text-emerald-900"
                        : item.tone === "blue"
                          ? "text-blue-900"
                          : "text-slate-900"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-blue-50/50 to-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                  </span>
                  Incoming Requests
                </div>
                <p className="mt-1 text-sm text-slate-600">Accept or reject new connection requests.</p>
              </div>
            </div>

            {loadingRequests ? (
              <div className="mt-4 space-y-3">
                {[0, 1].map((item) => (
                  <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="ui-skeleton h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="ui-skeleton h-3 w-40" />
                        <div className="ui-skeleton h-3 w-56" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : requests.length ? (
              <div className="mt-5 space-y-3">
                {requests.map((requestUser) => (
                  <div
                    key={requestUser._id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-sm font-bold text-white shadow-sm">
                        {(requestUser.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{requestUser.name}</p>
                        <p className="text-sm text-slate-600">{requestUser.email}</p>
                      </div>
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
            <div
              className={`mt-4 rounded-lg border p-3.5 text-sm font-medium ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? "✓" : "✕"} {message.text}
            </div>
          ) : null}
        </section>

        <aside className="animate-fade-up rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Quick actions</p>
          <div className="mt-5 space-y-3">
            {QUICK_ACTIONS.map((item) => {
              const toneClasses = getQuickActionToneClasses(item.tone);

              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className={`block rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${toneClasses.card}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border bg-white ${toneClasses.icon}`}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </span>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested mentors</p>
            <p className="mt-1 text-sm text-slate-600">People you can connect with right now.</p>

            {loadingSuggested ? (
              <div className="mt-3 space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="ui-skeleton h-3 w-32" />
                        <div className="ui-skeleton h-3 w-20" />
                      </div>
                      <div className="ui-skeleton h-7 w-20 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleSuggestedMentors.length ? (
              <div className="mt-3 space-y-3">
                {visibleSuggestedMentors.map((mentor) => {
                  const status = statusByUser[mentor._id];
                  const isPending = status === "pending";
                  const sharedSkills = getSharedSkills(userSkills, mentor.skills).slice(0, 2);

                  return (
                    <div key={mentor._id} className="animate-fade-up rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{mentor.name}</p>
                          <p className="text-xs text-slate-500">Rating {(mentor.rating ?? 0).toFixed(1)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleConnectSuggested(mentor._id)}
                          disabled={isPending}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 ${
                            isPending
                              ? "cursor-not-allowed bg-slate-400"
                              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-[0_8px_16px_-10px_rgba(37,99,235,0.6)]"
                          }`}
                        >
                          {isPending ? "Pending" : "Connect"}
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {typeof mentor.matchScore === "number" ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                            Match {mentor.matchScore}%
                          </span>
                        ) : null}

                        {sharedSkills.length ? (
                          sharedSkills.map((skill) => (
                            <span
                              key={`${mentor._id}-${skill}`}
                              className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Top rated mentor
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Add more skills in Profile to unlock better mentor suggestions.</p>
            )}
          </div>
        </aside>
      </div>

      {toast.open ? (
        <div className="pointer-events-none fixed right-4 top-20 z-50">
          <div
            className={`animate-soft-pop rounded-xl border px-4 py-3 text-sm font-semibold shadow-[0_14px_30px_-16px_rgba(15,23,42,0.45)] ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {toast.type === "success" ? "✓" : "✕"} {toast.text}
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
};

export default Dashboard;
