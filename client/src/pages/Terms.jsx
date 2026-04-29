import PageLayout from "../components/PageLayout";
import { LEGAL_LAST_UPDATED, LEGAL_VERSION, SUPPORT_EMAIL } from "../config/siteMeta";

const Terms = () => {
  return (
    <PageLayout
      title="Terms of Service"
      subtitle="Platform usage rules for SkillHive users, mentors, and admins."
    >
      <section className="rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] text-slate-700">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Legal</span>
          <span className="font-semibold text-blue-900">{LEGAL_VERSION}</span>
        </div>
        <p className="text-sm text-slate-600">Last updated: {LEGAL_LAST_UPDATED}</p>
        <h2 className="mt-6 text-2xl font-bold text-slate-950">1. Acceptance of terms</h2>
        <p className="mt-4 text-base leading-8">
          By creating an account or using SkillHive, you agree to these terms and applicable platform policies.
          If you do not agree, you should stop using the service.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 to-white p-8 md:p-10 shadow-sm text-slate-700">
        <h2 className="text-2xl font-bold text-slate-950">2. Account responsibilities</h2>
        <ul className="mt-4 space-y-3 text-base leading-8">
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold mt-1">✓</span> <span>Provide accurate account and profile information.</span></li>
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold mt-1">✓</span> <span>Maintain confidentiality of your credentials.</span></li>
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold mt-1">✓</span> <span>Do not impersonate other users or organizations.</span></li>
          <li className="flex items-start gap-3"><span className="text-blue-600 font-bold mt-1">✓</span> <span>You are responsible for activity performed through your account.</span></li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-sm text-slate-700">
        <h2 className="text-2xl font-bold text-slate-950">3. Acceptable use</h2>
        <ul className="mt-4 space-y-3 text-base leading-8">
          <li className="flex items-start gap-3"><span className="text-red-600 font-bold mt-1">×</span> <span>No harassment, abuse, hate speech, or illegal content.</span></li>
          <li className="flex items-start gap-3"><span className="text-red-600 font-bold mt-1">×</span> <span>No spam, phishing, scraping, or unauthorized automation.</span></li>
          <li className="flex items-start gap-3"><span className="text-red-600 font-bold mt-1">×</span> <span>No attempts to disrupt realtime messaging, call systems, or API operations.</span></li>
          <li className="flex items-start gap-3"><span className="text-red-600 font-bold mt-1">×</span> <span>Mentor ratings and feedback must be genuine and based on real interactions.</span></li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-sm text-slate-700">
        <h2 className="text-2xl font-bold text-slate-950">4. Content and moderation</h2>
        <p className="mt-4 text-base leading-8">
          Users retain ownership of content they upload, but grant SkillHive permission to process and display
          required content for platform functionality. We may remove content or suspend accounts that violate
          security, legal, or community standards.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-emerald-50 to-white p-8 md:p-10 shadow-sm text-slate-700">
        <h2 className="text-2xl font-bold text-slate-950">5. Service availability and liability</h2>
        <p className="mt-4 text-base leading-8">
          SkillHive is provided on an as-available basis. While we work to maintain reliable service, temporary
          downtime, third-party provider interruptions, or network issues may occur. Liability is limited to the
          maximum extent permitted by law.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6 md:p-8 shadow-sm text-base text-slate-700">
        For terms or legal requests, contact <span className="font-bold text-slate-900">{SUPPORT_EMAIL}</span>.
      </section>
    </PageLayout>
  );
};

export default Terms;
