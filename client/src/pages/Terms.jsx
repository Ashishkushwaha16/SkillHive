import PageLayout from "../components/PageLayout";
import { LEGAL_LAST_UPDATED, LEGAL_VERSION, SUPPORT_EMAIL } from "../config/siteMeta";

const Terms = () => {
  return (
    <PageLayout
      title="Terms of Service"
      subtitle="Platform usage rules for SkillHive users, mentors, and admins."
    >
      <section className="ui-card p-6 text-slate-700">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Legal Version</p>
        <p className="mt-1 text-sm">{LEGAL_VERSION}</p>
        <p className="mt-1 text-sm text-slate-600">Last updated: {LEGAL_LAST_UPDATED}</p>
        <h2 className="mt-3 text-xl font-bold text-slate-900">1. Acceptance of terms</h2>
        <p className="mt-3 text-sm leading-7">
          By creating an account or using SkillHive, you agree to these terms and applicable platform policies.
          If you do not agree, you should stop using the service.
        </p>
      </section>

      <section className="ui-card mt-6 p-6 text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">2. Account responsibilities</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>Provide accurate account and profile information.</li>
          <li>Maintain confidentiality of your credentials.</li>
          <li>Do not impersonate other users or organizations.</li>
          <li>You are responsible for activity performed through your account.</li>
        </ul>
      </section>

      <section className="ui-card mt-6 p-6 text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">3. Acceptable use</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>No harassment, abuse, hate speech, or illegal content.</li>
          <li>No spam, phishing, scraping, or unauthorized automation.</li>
          <li>No attempts to disrupt realtime messaging, call systems, or API operations.</li>
          <li>Mentor ratings and feedback must be genuine and based on real interactions.</li>
        </ul>
      </section>

      <section className="ui-card mt-6 p-6 text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">4. Content and moderation</h2>
        <p className="mt-3 text-sm leading-7">
          Users retain ownership of content they upload, but grant SkillHive permission to process and display
          required content for platform functionality. We may remove content or suspend accounts that violate
          security, legal, or community standards.
        </p>
      </section>

      <section className="ui-card mt-6 p-6 text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">5. Service availability and liability</h2>
        <p className="mt-3 text-sm leading-7">
          SkillHive is provided on an as-available basis. While we work to maintain reliable service, temporary
          downtime, third-party provider interruptions, or network issues may occur. Liability is limited to the
          maximum extent permitted by law.
        </p>
      </section>

      <section className="ui-card-soft mt-6 p-6 text-sm text-slate-700">
        For terms or legal requests, contact <span className="font-semibold">{SUPPORT_EMAIL}</span>.
      </section>
    </PageLayout>
  );
};

export default Terms;
