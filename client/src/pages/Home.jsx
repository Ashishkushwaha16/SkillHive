import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaderboard, getPlatformOverview } from "../services/userService";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Connect with Mentors,<br /> Learn Together
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          SkillHive is a peer-to-peer learning platform where you can discover mentors, share skills,
          and grow together with a community of learners.
        </p>

        {!isAuthenticated && (
          <div className="flex gap-4 justify-center mb-12">
            <button
              onClick={() => navigate("/register")}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        )}

        {isAuthenticated && (
          <div className="flex gap-4 justify-center mb-12">
            <button
              onClick={() => navigate("/explore")}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Explore Mentors
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              View Dashboard
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mx-auto max-w-4xl px-4 pb-4 text-center">
          <p className="text-sm text-slate-500">Loading live platform insights...</p>
        </div>
      ) : null}

      <div className="mx-auto max-w-4xl px-4 pb-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-600 shadow-sm">
          Trusted by learners building real-world skills in web development, data, and product careers.
        </div>
      </div>

      {/* Stats Section */}
      {!loading && stats && isAuthenticated && (
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-12">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
              <div className="text-4xl font-bold text-blue-700 mb-2">
                {stats.stats?.totalUsers || 0}
              </div>
              <p className="text-slate-600 font-semibold">Mentors & Learners</p>
              <p className="text-sm text-slate-500 mt-1">Active community members</p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">
                {stats.stats?.totalUsers || 0}
              </div>
              <p className="text-slate-600 font-semibold">Connections Made</p>
              <p className="text-sm text-slate-500 mt-1">Active learning partnerships</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Mentors Section */}
      {!loading && topMentors.length > 0 && (
        <div className="mx-auto max-w-4xl px-4 py-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            🏆 Top Mentors
          </h2>

          <div className="space-y-4">
            {topMentors.map((mentor) => (
              <div
                key={mentor._id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => isAuthenticated ? navigate("/explore") : navigate("/login")}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-slate-900 w-8">
                      #{mentor.rank}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{mentor.name}</h3>
                      <p className="text-sm text-slate-600">{mentor.skillCount} skills</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-700">
                      {mentor.rating.toFixed(1)}
                    </div>
                    <p className="text-xs text-slate-500">Rating</p>
                  </div>
                </div>

                {mentor.skills && mentor.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {mentor.skills.length > 3 && (
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                        +{mentor.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isAuthenticated ? (
            <button
              onClick={() => navigate("/leaderboard")}
              className="w-full mt-8 border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              View Full Leaderboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/leaderboard")}
              className="w-full mt-8 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              View Full Leaderboard
            </button>
          )}
        </div>
      )}

      {/* Features Section */}
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          Why Join SkillHive?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Find Your Mentor</h3>
            <p className="text-slate-600">
              Discover experienced mentors in any skill you want to learn.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Make Connections</h3>
            <p className="text-slate-600">
              Build meaningful relationships with learners and experts in your field.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Grow Together</h3>
            <p className="text-slate-600">
              Learn, teach, and grow with a supportive community of learners.
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Ready to start your learning journey?
        </h2>
        {!isAuthenticated && (
          <button
            onClick={() => navigate("/register")}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Create Your Account Now
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
