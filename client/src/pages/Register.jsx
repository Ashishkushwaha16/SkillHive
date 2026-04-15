import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
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
      <div className="ui-card-soft hidden min-h-[32rem] flex-col justify-between p-8 text-slate-950 lg:flex">
        <div>
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
            Join SkillHive
          </div>
          <h2 className="mt-6 max-w-sm text-4xl font-black tracking-tight">
            Build a profile that actually helps people find you.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            Add your skills, connect with the right people, and keep your learning activity organized in one place.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
            Fast profile setup with email and password.
          </div>
          <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
            Skill-based discovery and connection requests.
          </div>
          <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
            A focused, low-noise learning network.
          </div>
        </div>
      </div>

      <div className="ui-card w-full p-8 md:p-10">
        <div className="mb-6">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Start learning and mentoring on SkillHive.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="ui-input"
            required
          />

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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
