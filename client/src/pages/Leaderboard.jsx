import { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";
import { getLeaderboard } from "../services/userService";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <PageLayout
      title="Top Mentors"
      subtitle="Discover the best mentors on SkillHive based on rating and expertise"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Visible mentors", value: users.length.toString() },
          {
            label: "Average rating",
            value: users.length ? (users.reduce((sum, user) => sum + user.rating, 0) / users.length).toFixed(1) : "0.0",
          },
          { label: "Community focus", value: "Expert help" },
        ].map((item) => (
          <div key={item.label} className="ui-card-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="ui-card p-8 text-center text-slate-600">Loading leaderboard...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Error: {error}
        </div>
      ) : users.length === 0 ? (
        <div className="ui-card p-8 text-center text-slate-600">No mentors yet</div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="ui-card-soft border border-transparent p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
                    #{user.rank}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-right">
                  <div className="text-3xl font-semibold text-blue-700">{user.rating.toFixed(1)}</div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-700">Rating</p>
                </div>
              </div>

              {user.about && <p className="mt-4 text-sm leading-6 text-slate-600">{user.about}</p>}

              {user.skills && user.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Leaderboard;
