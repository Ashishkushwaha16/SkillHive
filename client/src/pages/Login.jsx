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
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr,0.95fr]">
      <div className="hidden min-h-[32rem] flex-col justify-between rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white lg:flex shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)]">
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

      <div className="w-full rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] backdrop-blur sm:p-8 md:p-10">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            Welcome back
          </div>
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
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            required
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            required
          />

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
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

        {message && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">✓ {message}</div>}
        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">✕ {error}</div>}

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/forgot-password" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">Forgot password?</Link>
        </p>

        <p className="mt-6 text-center text-sm text-slate-600">
          New here? <Link to="/register" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
