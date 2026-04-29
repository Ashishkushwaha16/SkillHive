import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import ChatBot from "../components/ChatBot";
import { LEGAL_LAST_UPDATED, LEGAL_VERSION, SUPPORT_EMAIL } from "../config/siteMeta";

const HelpCentre = () => {
  return (
    <PageLayout title="Support" subtitle="Get help with account access, profile setup, messaging, and calls.">
      <section className="rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Support Scope</p>
        <h2 className="mt-4 text-xl sm:text-2xl font-black text-slate-950">How we can help you</h2>
        <p className="mt-4 text-base leading-8 text-slate-700">
          SkillHive support covers login and account recovery, profile media issues, mentor matching,
          message delivery, notifications, and call troubleshooting.
        </p>
        <p className="mt-3 text-base leading-8 text-slate-700">
          The support chatbot includes two sections: <span className="font-bold text-slate-900">AI Assistant</span> for conversational guidance
          and <span className="font-bold text-slate-900">AI Search Engine</span> for direct knowledge-base answers about the app.
        </p>
        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-slate-700">
          Preferred support channel: <span className="font-bold text-slate-900">{SUPPORT_EMAIL}</span>
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-slate-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm hover:shadow-md transition-all duration-200 text-slate-700">
          <h3 className="text-lg font-bold text-slate-900">Response timeline</h3>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            <li>General questions: within 24-48 hours</li>
            <li>Account lockout or security concern: within 12-24 hours</li>
            <li>Critical messaging/call outage: priority triage</li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm hover:shadow-md transition-all duration-200 text-slate-700">
          <h3 className="text-lg font-bold text-slate-900">Please include in your request</h3>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            <li>Registered email ID</li>
            <li>Issue summary and expected behavior</li>
            <li>Time of issue and affected screen</li>
            <li>Screenshot or error text (if available)</li>
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Common issue guides</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700 leading-7">
            <li>Avatar uploaded but not visible: reopen the app and refresh profile session.</li>
            <li>Message count mismatch: open the conversation to sync read state.</li>
            <li>No call audio/video: check browser permissions for microphone and camera.</li>
            <li>No notifications: ensure session is active and app tab is not blocked.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Policy links</h3>
          <p className="mt-2 text-sm text-slate-700 leading-6">
            Review platform rules and data practices before raising compliance requests.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <Link to="/privacy" className="inline-flex font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Privacy Policy
            </Link>
            <br />
            <Link to="/terms" className="inline-flex font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Terms of Service
            </Link>
            <p className="mt-3 text-xs text-slate-500">
              Legal release: {LEGAL_VERSION} | Updated: {LEGAL_LAST_UPDATED}
            </p>
          </div>
        </section>
      </div>

      <ChatBot />
    </PageLayout>
  );
};

export default HelpCentre;
