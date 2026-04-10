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
      {loading ? (
        <div className="text-center text-slate-600 py-8">Loading leaderboard...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-slate-600 py-8">No mentors yet</div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="ui-card-soft p-6 transition-all duration-200 hover:shadow-md"
            >
              {/* Header: Rank, Name, Rating */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-slate-900 w-8">
                    #{user.rank}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-700">
                    {user.rating.toFixed(1)}
                  </div>
                  <p className="text-xs text-slate-500">Rating</p>
                </div>
              </div>

              {/* About */}
              {user.about && (
                <p className="text-sm text-slate-600 mb-3 italic">{user.about}</p>
              )}

              {/* Skills */}
              {user.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
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
