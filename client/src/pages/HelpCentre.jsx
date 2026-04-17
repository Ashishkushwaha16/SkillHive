import PageLayout from "../components/PageLayout";

const HelpCentre = () => {
  return (
    <PageLayout title="Support" subtitle="Need help with SkillHive? Start here.">
      <div className="grid gap-5 md:grid-cols-2">
        <section className="ui-card p-6 text-slate-700">
          <h2 className="text-xl font-bold text-slate-900">About SkillHive</h2>
          <p className="mt-3 text-sm leading-7">
            SkillHive is a real-time skill exchange platform where learners and mentors connect,
            collaborate, and grow through direct conversations and structured profiles.
          </p>
        </section>

        <section className="ui-card p-6 text-slate-700">
          <h2 className="text-xl font-bold text-slate-900">Contact</h2>
          <p className="mt-3 text-sm">Email: support@skillhive.app</p>
        </section>
      </div>

      <section className="ui-card-soft mt-6 p-6">
        <h2 className="text-xl font-bold text-slate-900">AI Assistant Ready</h2>
        <p className="mt-2 text-sm text-slate-700">
          This support module is intentionally structured for upcoming AI assistant integration,
          including intent routing for account, profile, and messaging queries.
        </p>
      </section>
    </PageLayout>
  );
};

export default HelpCentre;
