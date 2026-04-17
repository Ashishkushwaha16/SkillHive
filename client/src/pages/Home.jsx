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
      <section className="ui-card-soft p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Professional Skill Network</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Learn faster with real people, not random content.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              SkillHive helps you connect with the right people by skills, exchange knowledge through direct chat,
              and build a meaningful long-term learning network.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/explore" : "/register")}
                className="ui-btn-primary"
              >
                {isAuthenticated ? "Explore Mentors" : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/messages")}
                className="ui-btn-secondary"
              >
                Open Messages
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Users</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-950">{stats.totalUsers}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Connections</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-950">{stats.totalConnections}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Top Mentors</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-950">{topMentors.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="ui-card p-5">
          <h3 className="text-lg font-bold text-slate-900">Profile-driven discovery</h3>
          <p className="mt-2 text-sm text-slate-600">Find people by actual skill sets, ratings, and meaningful profile context.</p>
        </article>
        <article className="ui-card p-5">
          <h3 className="text-lg font-bold text-slate-900">Real-time communication</h3>
          <p className="mt-2 text-sm text-slate-600">Message your connections instantly with read receipts and presence awareness.</p>
        </article>
        <article className="ui-card p-5">
          <h3 className="text-lg font-bold text-slate-900">Trust and growth loop</h3>
          <p className="mt-2 text-sm text-slate-600">Build credibility through ratings, achievements, and verified profile assets.</p>
        </article>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-slate-950">Home Feed</h2>
          <button
            type="button"
            onClick={() => navigate("/leaderboard")}
            className="ui-btn-secondary"
          >
            View Leaderboard
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-600">Loading feed...</p> : null}

        <div className="space-y-4">
          {posts.length ? (
            posts.map((post) => (
              <article key={post._id} className="ui-card p-6">
                <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Posted {new Date(post.createdAt).toLocaleString()}
                </p>
              </article>
            ))
          ) : (
            <div className="ui-card p-6 text-sm text-slate-600">
              No posts published yet. Ask an admin to publish the first update.
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Home;
