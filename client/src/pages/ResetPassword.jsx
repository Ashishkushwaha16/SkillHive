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
    <div className="ui-card w-full max-w-xl p-8 md:p-10">
      <h2 className="text-3xl font-black tracking-tight text-slate-950">Reset Password</h2>
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
          className="ui-btn-primary w-full rounded-full py-3.5"
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
