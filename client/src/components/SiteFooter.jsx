import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Explore Mentors", to: "/mentors" },
  { label: "Profile", to: "/profile" },
  { label: "About", to: "/about" },
  { label: "Help Centre", to: "/help" },
  { label: "Contact Us", to: "/contact" },
  { label: "Leaderboard", to: "/leaderboard" },
];

const SiteFooter = () => {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-base text-slate-200">
          Questions? Contact <Link to="/help" className="underline hover:text-white">SkillHive Support</Link>
        </p>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {footerLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-slate-300 underline decoration-slate-600 underline-offset-2 transition-colors duration-200 hover:text-blue-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} SkillHive. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
