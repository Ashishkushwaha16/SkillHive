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
      <div className="rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div key={item.question} className="rounded-lg border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200">
              <h3 className="text-lg font-bold text-slate-900">📄 {item.question}</h3>
              <p className="mt-2.5 text-slate-700 leading-6">→ {item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQ;
