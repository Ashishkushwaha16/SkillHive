import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setDevResetUrl("");
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      setMessage(result.message || "Password reset link sent if email exists.");
      setDevResetUrl(result.devResetUrl || "");
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.22)] backdrop-blur sm:p-8 md:p-10">
      <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
        Account recovery
      </div>
      <h2 className="mt-3 text-xl font-black tracking-tight bg-gradient-to-r from-blue-950 to-blue-700 bg-clip-text text-transparent sm:text-2xl">Forgot Password</h2>
      <p className="mt-2 text-sm text-slate-600">
        Enter your account email. We will send you a password reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="ui-input"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="ui-btn-primary w-full rounded-xl py-3.5"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {devResetUrl ? (
        <p className="mt-4 break-all rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          Dev reset link: <a href={devResetUrl} className="font-semibold underline">{devResetUrl}</a>
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-600">
        Back to <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">Login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
