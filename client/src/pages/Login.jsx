import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      <div className="ui-card-soft hidden min-h-[32rem] flex-col justify-between p-8 text-slate-950 lg:flex">
        <div>
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
            Welcome back
          </div>
          <h2 className="mt-6 max-w-sm text-4xl font-black tracking-tight">
            Pick up where you left off.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            Continue conversations, review requests, and keep your mentor network moving.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
            Access your dashboard and pending requests.
          </div>
          <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
            Explore mentors and keep your profile up to date.
          </div>
          <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
            Stable auth and a clean user experience.
          </div>
        </div>
      </div>

      <div className="ui-card w-full p-8 md:p-10">
        <div className="mb-6">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600">Login to continue your SkillHive journey.</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="ui-input"
          required
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="ui-input"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="ui-btn-primary w-full rounded-full py-3.5"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      <p className="mt-6 text-center text-sm text-slate-600">
        New here? <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-800">Create account</Link>
      </p>
      </div>
    </div>
  );
};

export default Login;
