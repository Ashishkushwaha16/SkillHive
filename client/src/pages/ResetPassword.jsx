import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Reset token missing. Please open the link from your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({ token, password });
      setMessage(result.message || "Password reset successful");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.22)] backdrop-blur sm:p-8 md:p-10">
      <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
        New password
      </div>
      <h2 className="mt-3 text-xl font-black tracking-tight bg-gradient-to-r from-emerald-950 to-emerald-700 bg-clip-text text-transparent sm:text-2xl">Reset Password</h2>
      <p className="mt-2 text-sm text-slate-600">
        Set a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="ui-input"
          minLength={6}
          required
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="ui-input"
          minLength={6}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="ui-btn-primary w-full rounded-xl py-3.5"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <p className="mt-6 text-center text-sm text-slate-600">
        Back to <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">Login</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
