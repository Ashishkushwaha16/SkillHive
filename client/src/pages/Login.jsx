import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth, loginUser } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isGoogleEnabled = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google login failed. Please try again.");
      return;
    }

    setError("");
    setMessage("");
    setGoogleLoading(true);

    try {
      const data = await googleAuth(credentialResponse.credential);
      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      window.dispatchEvent(new Event("authChange"));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      window.dispatchEvent(new Event("authChange"));
      setMessage("Login successful");
      setFormData({ email: "", password: "" });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1.05fr,0.95fr]">
      <div className="hidden min-h-[32rem] flex-col justify-between rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white lg:flex shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)]">
        <div>
          <div className="inline-flex rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm border border-white/30">
            Welcome back
          </div>
          <h2 className="mt-8 max-w-sm text-2xl sm:text-3xl font-black tracking-tight">
            Pick up where you left off.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-blue-50">
            Continue conversations, review requests, and keep your mentor network moving.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 text-sm font-medium text-white hover:bg-white/15 transition-all duration-200">
            ✓ Access your dashboard and pending requests
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 text-sm font-medium text-white hover:bg-white/15 transition-all duration-200">
            ✓ Explore mentors and keep your profile up to date
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 text-sm font-medium text-white hover:bg-white/15 transition-all duration-200">
            ✓ Stable auth and a clean user experience
          </div>
        </div>
      </div>

      <div className="w-full p-8 md:p-10 rounded-2xl bg-white border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-950 to-blue-700 bg-clip-text text-transparent">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600">Login to continue your SkillHive journey.</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm"
          required
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm"
          required
        />

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full px-4 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {isGoogleEnabled ? (
        <div className="mt-4">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Or continue with</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed. Please try again.")}
            />
          </div>
        </div>
      ) : null}

      {message && <div className="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">✓ {message}</div>}
      {error && <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200">✕ {error}</div>}

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</Link>
      </p>

      <p className="mt-6 text-center text-sm text-slate-600">
        New here? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Create account</Link>
      </p>
      </div>
    </div>
  );
};

export default Login;
