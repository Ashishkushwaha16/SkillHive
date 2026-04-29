import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { getHomePosts, getLeaderboard, getPlatformOverview } from "../services/userService";

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalConnections: 0 });
  const [topMentors, setTopMentors] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    const load = async () => {
      try {
        const [leaderboard, feed] = await Promise.all([getLeaderboard(), getHomePosts()]);
        setTopMentors(leaderboard.slice(0, 3));
        setPosts(feed || []);

        if (isAuthenticated) {
          const overview = await getPlatformOverview();
          setStats({
            totalUsers: overview?.stats?.totalUsers || 0,
            totalConnections: overview?.stats?.totalConnections || 0,
          });
        }
      } catch (error) {
        setTopMentors([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated]);

  return (
    <PageLayout
      title="Skill Exchange Platform"
      subtitle="Discover mentors, build trust through profiles, and collaborate in real-time conversations."
    >
      <section className="rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Professional Skill Network</p>
            <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-blue-950 to-emerald-800 bg-clip-text text-transparent md:text-3xl leading-tight">
              Learn faster with real people, not random content.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              SkillHive helps you connect with the right people by skills, exchange knowledge through direct chat,
              and build a meaningful long-term learning network.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/explore" : "/register")}
                className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold transition-all duration-200 hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] active:scale-95"
              >
                {isAuthenticated ? "Explore Mentors" : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/messages")}
                className="px-6 py-3.5 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-semibold transition-all duration-200 hover:border-blue-500 hover:bg-blue-50"
              >
                Open Messages
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Users</p>
              <p className="mt-3 text-3xl font-black text-slate-950">{stats.totalUsers}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Connections</p>
              <p className="mt-3 text-3xl font-black text-emerald-900">{stats.totalConnections}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Top Mentors</p>
              <p className="mt-3 text-3xl font-black text-blue-900">{topMentors.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-2.5 py-1 text-xs font-semibold text-white">Profile</span>
            <h3 className="text-lg font-bold text-blue-900">🎯 Profile-driven discovery</h3>
          </div>
          <p className="mt-2 text-sm text-slate-700 leading-6">Find people by actual skill sets, ratings, and meaningful profile context.</p>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-2.5 py-1 text-xs font-semibold text-white">Realtime</span>
            <h3 className="text-lg font-bold text-emerald-800">💬 Real-time communication</h3>
          </div>
          <p className="mt-2 text-sm text-slate-700 leading-6">Message your connections instantly with read receipts and presence awareness.</p>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-1 text-xs font-semibold text-slate-900">Trust</span>
            <h3 className="text-lg font-bold text-amber-700">⭐ Trust and growth loop</h3>
          </div>
          <p className="mt-2 text-sm text-slate-700 leading-6">Build credibility through ratings, achievements, and verified profile assets.</p>
        </article>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950"> Home Feed</h2>
          <button
            type="button"
            onClick={() => navigate("/leaderboard")}
            className="px-5 py-2.5 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold transition-all duration-200 hover:bg-blue-50"
          >
            View Leaderboard
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-600">Loading feed...</p> : null}

        <div className="space-y-4">
          {posts.length ? (
            posts.map((post) => (
              <article key={post._id} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
                <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  📅 Posted {new Date(post.createdAt).toLocaleString()}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">
              No posts published yet. Ask an admin to publish the first update.
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Home;
