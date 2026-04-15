import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaderboard, getPlatformOverview } from "../services/userService";

const homepageHighlights = [
  {
    title: "Profile-first matching",
    description: "Users discover people through skills, not noisy feeds or irrelevant content.",
  },
  {
    title: "Direct connection flow",
    description: "Send, accept, and manage requests from one clear workspace.",
  },
  {
    title: "Admin visibility",
    description: "Support messages and platform actions stay auditable and organized.",
  },
];

const heroMetrics = [
  { label: "Community members", key: "totalUsers" },
  { label: "Connections made", key: "totalConnections" },
  { label: "Top mentors shown", key: "topMentors" },
];

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topMentors, setTopMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch top mentors (always available)
        const mentors = await getLeaderboard();
        setTopMentors(mentors.slice(0, 3));

        // Fetch platform overview if authenticated
        if (isAuthenticated) {
          try {
            const overview = await getPlatformOverview();
            setStats(overview);
          } catch (err) {
            // Fail silently if not authenticated
            setStats(null);
          }
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:pb-16 md:pt-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 shadow-sm backdrop-blur">
              Real skills. Real people. Real progress.
            </div>
            <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
              Find mentors, start conversations, and grow faster.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              SkillHive is a focused learning platform where users discover people by skill, build trust through profiles, and keep the connection flow simple.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate(isAuthenticated ? "/explore" : "/register")}
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                {isAuthenticated ? "Explore Mentors" : "Get Started"}
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                View Leaderboard
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {heroMetrics.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-950">
                    {item.key === "topMentors"
                      ? topMentors.length
                      : item.key === "totalUsers"
                        ? stats?.stats?.totalUsers ?? 0
                        : stats?.stats?.totalConnections ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="ui-card-soft overflow-hidden p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Live platform snapshot</p>
                <p className="mt-1 text-sm text-slate-600">Community activity updated from the database.</p>
              </div>
              <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                Live
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-500">Mentors & Learners</p>
                <p className="mt-2 text-4xl font-black text-slate-950">{stats?.stats?.totalUsers ?? 0}</p>
                <p className="mt-2 text-sm text-slate-600">Active members currently in the network.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-500">Connections Made</p>
                <p className="mt-2 text-4xl font-black text-slate-950">{stats?.stats?.totalConnections ?? 0}</p>
                <p className="mt-2 text-sm text-slate-600">Mutual learning relationships created.</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold text-slate-300">How it works</p>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-xl bg-white/5 p-3">
                  <span className="text-blue-300">01.</span> Create your profile
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <span className="text-blue-300">02.</span> Explore by skills
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <span className="text-blue-300">03.</span> Send a request
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="mx-auto max-w-6xl px-4 pb-4 text-center">
          <p className="text-sm text-slate-500">Loading live platform insights...</p>
        </div>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {homepageHighlights.map((item) => (
            <article key={item.title} className="ui-card p-6">
              <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Feature
              </div>
              <h2 className="text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {!loading && topMentors.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Community leaders</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Top mentors right now</h2>
            </div>
            <button
              onClick={() => navigate("/leaderboard")}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Open Leaderboard
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {topMentors.map((mentor) => (
              <button
                key={mentor._id}
                type="button"
                className="ui-card-soft group text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_80px_-28px_rgba(37,99,235,0.35)]"
                onClick={() => (isAuthenticated ? navigate("/explore") : navigate("/login"))}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Rank #{mentor.rank}</p>
                      <h3 className="mt-2 text-xl font-extrabold text-slate-950">{mentor.name}</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-950 px-3 py-2 text-right text-white">
                      <p className="text-2xl font-black leading-none">{mentor.rating.toFixed(1)}</p>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Rating</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">{mentor.skillCount} skills listed</p>

                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mentor.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="ui-card flex flex-col gap-6 bg-slate-950 p-8 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">Start today</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Build your profile and begin learning with purpose.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Join a clean, focused platform where the interface stays out of the way and the connections stay meaningful.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Create Account
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Sign In
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5"
              >
                Open Dashboard
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
