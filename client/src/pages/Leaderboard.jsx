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
          { label: "Visible mentors", value: users.length.toString(), color: "blue" },
          {
            label: "Average rating",
            value: users.length ? (users.reduce((sum, user) => sum + user.rating, 0) / users.length).toFixed(1) : "0.0",
            color: "emerald",
          },
          { label: "Community focus", value: "Expert help", color: "slate" },
        ].map((item) => {
          const colorClasses = {
            blue: "border-blue-200 bg-blue-50",
            emerald: "border-emerald-200 bg-emerald-50",
            slate: "border-slate-200 bg-slate-50",
          };
          const textClasses = {
            blue: "text-blue-700",
            emerald: "text-emerald-700",
            slate: "text-slate-600",
          };
          return (
            <div key={item.label} className={`rounded-xl border ${colorClasses[item.color]} p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${textClasses[item.color]}`}>{item.label}</p>
              <p className="mt-2.5 text-2xl font-black text-slate-900">{item.value}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center text-slate-600 font-medium">
          ⏳ Loading leaderboard...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 font-medium">
          ✕ Error: {error}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center text-slate-600 font-medium">
          No mentors yet
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user, idx) => (
            <div
              key={user._id}
              className="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 transition-all duration-200 hover:shadow-md hover:border-blue-300 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-lg text-lg font-black text-white shadow-sm ${
                    idx === 0
                      ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                      : idx === 1
                        ? "bg-gradient-to-br from-slate-400 to-slate-500"
                        : idx === 2
                          ? "bg-gradient-to-br from-orange-400 to-orange-500"
                          : "bg-gradient-to-br from-blue-600 to-blue-700"
                  }`}>
                    #{user.rank}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-right shadow-sm">
                  <div className="text-3xl font-black text-blue-700">{user.rating.toFixed(1)}</div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">⭐ Rating</p>
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
