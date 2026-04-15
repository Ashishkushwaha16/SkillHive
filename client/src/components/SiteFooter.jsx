import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Explore Mentors", to: "/explore" },
  { label: "Profile", to: "/profile" },
  { label: "About", to: "/about" },
  { label: "Help Centre", to: "/help" },
  { label: "Contact Us", to: "/contact" },
  { label: "Leaderboard", to: "/leaderboard" },
];

const SiteFooter = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.3fr,1fr]">
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              SkillHive
            </div>
            <h2 className="mt-4 max-w-xl text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              A focused place to find mentors, build trust, and grow through real conversations.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Designed for learners and mentors who want a clean, direct experience without clutter.
            </p>
            <p className="mt-6 text-sm text-slate-300">
              Need help? Visit <Link to="/help" className="font-semibold text-white hover:text-blue-200">Help Centre</Link> or use the contact form.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300 transition-colors duration-200 hover:border-blue-400/40 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} SkillHive. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
