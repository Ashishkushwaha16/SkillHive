import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const footerLinks = [
  { label: "Explore Mentors", to: "/explore" },
  { label: "Profile", to: "/profile" },
  { label: "About", to: "/about" },
  { label: "Support", to: "/help" },
  { label: "Contact Us", to: "/contact" },
  { label: "Leaderboard", to: "/leaderboard" },
];

const SiteFooter = () => {
  return (
    <footer className="mt-12 sm:mt-16 border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 py-8 sm:py-12">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-[1.3fr,1fr]">
          <div>
            <BrandLogo />
            <h2 className="mt-3 sm:mt-4 max-w-xl text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              A focused place to find mentors, build trust, and grow through real conversations.
            </h2>
            <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm leading-6 text-slate-400">
              Designed for learners and mentors who want a clean, direct experience without clutter.
            </p>
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-300">
              Need help? Visit <Link to="/help" className="font-semibold text-white hover:text-blue-200">Support</Link> or use the contact form.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2.5 sm:px-4 py-2 sm:py-3 text-slate-300 transition-colors duration-200 hover:border-blue-400/40 hover:bg-white/10 hover:text-white text-center sm:text-left"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2 sm:gap-3 border-t border-white/10 pt-4 sm:pt-6 text-xs sm:text-sm text-slate-500">
          <p>© {new Date().getFullYear()} SkillHive. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
            <Link to="/help" className="hover:text-slate-300">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
