import PageLayout from "../components/PageLayout";
import { LEGAL_LAST_UPDATED, LEGAL_VERSION, SUPPORT_EMAIL } from "../config/siteMeta";

const Privacy = () => {
  return (
    <PageLayout
      title="Privacy Policy"
      subtitle="How SkillHive collects, uses, and protects user data across profiles, messaging, and calls."
    >
      <section className="ui-card p-6 text-slate-700">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Legal Version</p>
        <p className="mt-1 text-sm">{LEGAL_VERSION}</p>
        <p className="mt-1 text-sm text-slate-600">Last updated: {LEGAL_LAST_UPDATED}</p>
        <h2 className="mt-3 text-xl font-bold text-slate-900">1. Data we collect</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>Account details: name, email, encrypted password.</li>
          <li>Profile data: skills, about section, achievements, avatar, certificates, resume links.</li>
          <li>Usage data: messages metadata, notifications, connection actions, and call logs.</li>
          <li>Security data: login activity and basic abuse-prevention signals.</li>
        </ul>
      </section>

      <section className="ui-card mt-6 p-6 text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">2. How we use data</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>To authenticate users and secure accounts.</li>
          <li>To enable mentor discovery, messaging, calls, and feedback workflows.</li>
          <li>To deliver real-time notifications and improve product reliability.</li>
          <li>To detect abuse, fraud, and policy violations.</li>
        </ul>
      </section>

      <section className="ui-card mt-6 p-6 text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">3. Data sharing and storage</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>We do not sell personal data to third parties.</li>
          <li>Files uploaded to profiles may be stored using configured cloud storage providers.</li>
          <li>Public profile elements and mentor ratings are visible to other platform users by design.</li>
          <li>Internal access is limited to operational and security needs.</li>
        </ul>
      </section>

      <section className="ui-card mt-6 p-6 text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">4. User controls and rights</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>You can update profile data and privacy preferences in account settings.</li>
          <li>You can remove your avatar and manage uploaded profile assets.</li>
          <li>You can contact support for account-related data correction requests.</li>
        </ul>
      </section>

      <section className="ui-card-soft mt-6 p-6 text-sm text-slate-700">
        For privacy or data questions, contact <span className="font-semibold">{SUPPORT_EMAIL}</span>.
      </section>
    </PageLayout>
  );
};

export default Privacy;
