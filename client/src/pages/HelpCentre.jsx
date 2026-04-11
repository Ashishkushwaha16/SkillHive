import PageLayout from "../components/PageLayout";

const HelpCentre = () => {
  return (
    <PageLayout title="Help Centre" subtitle="Simple steps to get started on SkillHive.">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg text-slate-700">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Create your account and complete your profile.</li>
          <li>Add your skills in Profile section.</li>
          <li>Explore mentors by skills and send connection requests.</li>
          <li>Manage incoming requests from your dashboard.</li>
        </ol>
      </div>
    </PageLayout>
  );
};

export default HelpCentre;
