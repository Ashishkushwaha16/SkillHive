import PageLayout from "../components/PageLayout";

const faqs = [
  {
    question: "How do I add my skills?",
    answer: "Open Profile page, type a skill, and click Add.",
  },
  {
    question: "How can I connect with a mentor?",
    answer: "Go to Explore Mentors and click Connect on a user card.",
  },
  {
    question: "Can I edit my about section?",
    answer: "Yes, use the About editor in your Profile page and save changes.",
  },
];

const FAQ = () => {
  return (
    <PageLayout title="FAQ" subtitle="Quick answers for common SkillHive questions.">
      <div className="ui-card p-6">
        <div className="space-y-5">
          {faqs.map((item) => (
            <div key={item.question} className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
              <p className="mt-2 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQ;
