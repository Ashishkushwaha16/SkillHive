import PageLayout from "../components/PageLayout";
import { LEGAL_LAST_UPDATED, LEGAL_VERSION, SUPPORT_EMAIL } from "../config/siteMeta";

const Privacy = () => {
  return (
    <PageLayout
      title="Privacy Policy"
      subtitle="How SkillHive collects, uses, and protects user data across profiles, messaging, and calls."
    >
      <section className="rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] text-slate-700">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Legal Version</span>
          <span className="font-semibold text-blue-900">{LEGAL_VERSION}</span>
        </div>
        <p className="text-sm text-slate-600">Last updated: {LEGAL_LAST_UPDATED}</p>
        <h2 className="mt-6 text-2xl font-bold text-slate-950">🗒️ 1. Data we collect</h2>
        <ul className="mt-4 space-y-2 text-base leading-7">
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> <span><strong>Account details:</strong> name, email, encrypted password.</span></li>
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> <span><strong>Profile data:</strong> skills, about section, achievements, avatar, certificates, resume links.</span></li>
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> <span><strong>Usage data:</strong> messages metadata, notifications, connection actions, and call logs.</span></li>
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> <span><strong>Security data:</strong> login activity and basic abuse-prevention signals.</span></li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 to-white p-8 md:p-10 shadow-sm text-slate-700">
        <h2 className="text-2xl font-bold text-slate-950">📁 2. How we use data</h2>
        <ul className="mt-4 space-y-2 text-base leading-7">
          <li className="flex items-start gap-3"><span className="text-emerald-600 font-bold">•</span> <span>To authenticate users and secure accounts.</span></li>
          <li className="flex items-start gap-3"><span className="text-emerald-600 font-bold">•</span> <span>To enable mentor discovery, messaging, calls, and feedback workflows.</span></li>
          <li className="flex items-start gap-3"><span className="text-emerald-600 font-bold">•</span> <span>To deliver real-time notifications and improve product reliability.</span></li>
          <li className="flex items-start gap-3"><span className="text-emerald-600 font-bold">•</span> <span>To detect abuse, fraud, and policy violations.</span></li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-sm text-slate-700">
        <h2 className="text-2xl font-bold text-slate-950">📄 3. Data sharing and storage</h2>
        <ul className="mt-4 space-y-2 text-base leading-7">
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> <span>We do not sell personal data to third parties.</span></li>
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> <span>Files uploaded to profiles may be stored using configured cloud storage providers.</span></li>
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> <span>Public profile elements and mentor ratings are visible to other platform users by design.</span></li>
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> <span>Internal access is limited to operational and security needs.</span></li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-sm text-slate-700">
        <h2 className="text-2xl font-bold text-slate-950">⚖️ 4. User controls and rights</h2>
        <ul className="mt-4 space-y-2 text-base leading-7">
          <li className="flex items-start gap-3"><span className="text-emerald-600 font-bold">•</span> <span>You can update profile data and privacy preferences in account settings.</span></li>
          <li className="flex items-start gap-3"><span className="text-emerald-600 font-bold">•</span> <span>You can remove your avatar and manage uploaded profile assets.</span></li>
          <li className="flex items-start gap-3"><span className="text-emerald-600 font-bold">•</span> <span>You can contact support for account-related data correction requests.</span></li>
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6 md:p-8 shadow-sm text-sm text-slate-700">
        <p>For privacy or data questions, contact <span className="font-bold text-slate-900">{SUPPORT_EMAIL}</span>.</p>
      </section>
    </PageLayout>
  );
};

export default Privacy;
