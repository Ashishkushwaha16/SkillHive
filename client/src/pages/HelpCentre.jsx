import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import ChatBot from "../components/ChatBot";
import { LEGAL_LAST_UPDATED, LEGAL_VERSION, SUPPORT_EMAIL } from "../config/siteMeta";

const HelpCentre = () => {
  return (
    <PageLayout title="Support" subtitle="Get help with account access, profile setup, messaging, and calls.">
      <section className="ui-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Support Scope</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">How we can help you</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          SkillHive support covers login and account recovery, profile media issues, mentor matching,
          message delivery, notifications, and call troubleshooting.
        </p>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Preferred support channel: <span className="font-semibold">{SUPPORT_EMAIL}</span>
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="ui-card p-6 text-slate-700">
          <h3 className="text-lg font-bold text-slate-900">Response timeline</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            <li>General questions: within 24-48 hours</li>
            <li>Account lockout or security concern: within 12-24 hours</li>
            <li>Critical messaging/call outage: priority triage</li>
          </ul>
        </section>

        <section className="ui-card p-6 text-slate-700">
          <h3 className="text-lg font-bold text-slate-900">Please include in your request</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            <li>Registered email ID</li>
            <li>Issue summary and expected behavior</li>
            <li>Time of issue and affected screen</li>
            <li>Screenshot or error text (if available)</li>
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="ui-card-soft p-6">
          <h3 className="text-lg font-bold text-slate-900">Common issue guides</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>Avatar uploaded but not visible: reopen the app and refresh profile session.</li>
            <li>Message count mismatch: open the conversation to sync read state.</li>
            <li>No call audio/video: check browser permissions for microphone and camera.</li>
            <li>No notifications: ensure session is active and app tab is not blocked.</li>
          </ul>
        </section>

        <section className="ui-card-soft p-6">
          <h3 className="text-lg font-bold text-slate-900">Policy links</h3>
          <p className="mt-2 text-sm text-slate-700">
            Review platform rules and data practices before raising compliance requests.
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <Link to="/privacy" className="font-semibold text-blue-700 hover:text-blue-800">Privacy Policy</Link>
            <br />
            <Link to="/terms" className="font-semibold text-blue-700 hover:text-blue-800">Terms of Service</Link>
            <p className="mt-2 text-xs text-slate-500">
              Current legal release: {LEGAL_VERSION} | Last updated: {LEGAL_LAST_UPDATED}
            </p>
          </div>
        </section>
      </div>

      <ChatBot />
    </PageLayout>
  );
};

export default HelpCentre;
