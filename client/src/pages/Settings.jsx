import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import {
  changeEmail,
  changePassword,
  getProfile,
  updatePrivacySettings,
} from "../services/userService";

const Settings = () => {
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  useEffect(() => {
    getProfile()
      .then((profile) => {
        setShowOnlineStatus(profile?.privacy?.showOnlineStatus !== false);
      })
      .catch(() => {
        setShowOnlineStatus(true);
      });
  }, []);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus({ type: "error", text: "New password and confirm password must match" });
      return;
    }

    try {
      setSavingPassword(true);
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setStatus({ type: "success", text: result.message || "Password updated" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    try {
      setSavingEmail(true);
      const result = await changeEmail({
        newEmail: emailForm.newEmail,
        password: emailForm.password,
      });

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...user, email: result.email || emailForm.newEmail.trim().toLowerCase() };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authChange"));

      setStatus({ type: "success", text: result.message || "Email updated" });
      setEmailForm({ newEmail: "", password: "" });
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePrivacyToggle = async (nextValue) => {
    try {
      setSavingPrivacy(true);
      setShowOnlineStatus(nextValue);
      const result = await updatePrivacySettings({ showOnlineStatus: nextValue });
      setStatus({ type: "success", text: result.message || "Privacy settings updated" });
    } catch (error) {
      setShowOnlineStatus((prev) => !prev);
      setStatus({ type: "error", text: error.message });
    } finally {
      setSavingPrivacy(false);
    }
  };

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage your account security, email identity, and privacy preferences."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
              placeholder="Current password"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200"
              required
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
              }
              placeholder="New password"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200"
              required
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              placeholder="Confirm new password"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200"
              required
            />
            <button type="submit" className="w-full px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold transition-all duration-200 hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] active:scale-95" disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Change Email</h2>
          <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={(event) =>
                setEmailForm((prev) => ({ ...prev, newEmail: event.target.value }))
              }
              placeholder="New email"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200"
              required
            />
            <input
              type="password"
              value={emailForm.password}
              onChange={(event) =>
                setEmailForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="Account password"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all duration-200"
              required
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold transition-all duration-200 hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] active:scale-95"
              disabled={savingEmail}
            >
              {savingEmail ? "Updating..." : "Update Email"}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm mt-6">
        <h2 className="text-xl font-bold text-slate-900">Privacy</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="font-semibold text-slate-900">Show Online Status</p>
            <p className="text-sm text-slate-600">
              Let your connections see when you are online or last active.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handlePrivacyToggle(!showOnlineStatus)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              showOnlineStatus
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-[0_4px_12px_-4px_rgba(16,185,129,0.4)]"
                : "bg-slate-300 text-slate-800 hover:bg-slate-400"
            }`}
            disabled={savingPrivacy}
          >
            {savingPrivacy ? "Saving..." : showOnlineStatus ? "Enabled" : "Disabled"}
          </button>
        </div>
      </section>

      {status.text ? (
        <p className={`mt-5 text-sm ${status.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>
          {status.text}
        </p>
      ) : null}
    </PageLayout>
  );
};

export default Settings;
