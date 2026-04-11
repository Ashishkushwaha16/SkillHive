import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { getPlatformOverview, sendConnectRequest } from "../services/userService";

const About = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [connecting, setConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState("none");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const result = await getPlatformOverview();
        setData(result);
        setConnectionState(result.connectionState || "none");
      } catch (error) {
        setMessage({ type: "error", text: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const handleConnectDeveloper = async () => {
    if (!data?.developer?._id) {
      return;
    }

    try {
      setConnecting(true);
      const result = await sendConnectRequest(data.developer._id);
      setConnectionState("pending");
      setMessage({ type: "success", text: result.message || "Request sent" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-slate-600">Loading about section...</p>;
  }

  return (
    <PageLayout title="About SkillHive" subtitle="A community where learners and mentors grow together.">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="ui-card p-6 text-slate-700">
          <p>
            SkillHive is a peer-to-peer learning platform where users can learn and teach skills by connecting
            with mentors.
          </p>
          <p className="mt-4 text-sm text-slate-600">
            Total users on platform: <span className="font-semibold text-slate-900">{data?.stats?.totalUsers ?? 0}</span>
          </p>
        </div>

        <div className="ui-card p-6 text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">Developer</h2>
          {data?.developer ? (
            <>
              <p className="mt-3"><span className="font-semibold">Name:</span> {data.developer.name}</p>
              <p><span className="font-semibold">Email:</span> {data.developer.email}</p>
              <button
                type="button"
                onClick={handleConnectDeveloper}
                disabled={connecting || connectionState === "pending" || connectionState === "connected"}
                className={`mt-4 rounded-xl px-4 py-2 font-semibold text-white transition-colors duration-200 ${
                  connectionState === "connected"
                    ? "cursor-not-allowed bg-emerald-500"
                    : connectionState === "pending"
                      ? "cursor-not-allowed bg-slate-400"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {connectionState === "connected"
                  ? "Connected"
                  : connectionState === "pending"
                    ? "Pending"
                    : connecting
                      ? "Sending..."
                      : "Connect with Developer"}
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-600">Developer info not available yet.</p>
          )}
        </div>
      </div>

      {message.text ? (
        <p className={`mt-4 text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {message.text}
        </p>
      ) : null}
    </PageLayout>
  );
};

export default About;
