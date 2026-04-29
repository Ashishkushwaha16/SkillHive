import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth, registerUser } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
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
      setError("Google signup failed. Please try again.");
      return;
    }

    setMessage("");
    setError("");
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
      const data = await registerUser(formData);
      setMessage(data.message || "Registration successful");
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[0.95fr,1.05fr]">
      <div className="hidden min-h-[32rem] flex-col justify-between rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-8 text-white lg:flex shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]">
        <div>
          <div className="inline-flex rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm border border-white/30">
            Join SkillHive
          </div>
          <h2 className="mt-8 max-w-sm text-2xl sm:text-3xl font-black tracking-tight">
            Build a profile that actually helps people find you.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-emerald-50">
            Add your skills, connect with the right people, and keep your learning activity organized in one place.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 text-sm font-medium text-white hover:bg-white/15 transition-all duration-200">
            ✓ Fast profile setup with email and password
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 text-sm font-medium text-white hover:bg-white/15 transition-all duration-200">
            ✓ Skill-based discovery and connection requests
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 text-sm font-medium text-white hover:bg-white/15 transition-all duration-200">
            ✓ A focused, low-noise learning network
          </div>
        </div>
      </div>

      <div className="w-full p-8 md:p-10 rounded-2xl bg-white border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-950 to-emerald-700 bg-clip-text text-transparent">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Start learning and mentoring on SkillHive.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm"
            required
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm"
            required
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all duration-200 font-medium text-sm"
            required
          />

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full px-4 py-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {isGoogleEnabled ? (
          <div className="mt-4">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Or continue with</p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google signup failed. Please try again.")}
              />
            </div>
          </div>
        ) : null}

        {message && <div className="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">✓ {message}</div>}
        {error && <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200">✕ {error}</div>}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
