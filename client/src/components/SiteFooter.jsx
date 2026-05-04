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
    <footer className="mt-16 sm:mt-20 border-t border-slate-200 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-300 shadow-[0_-20px_60px_-30px_rgba(15,23,42,0.85)]">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-[1.3fr,1fr]">
          <div>
            <BrandLogo />
            <h2 className="mt-4 sm:mt-5 max-w-xl text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              A focused place to find mentors, build trust, and grow through real conversations.
            </h2>
            <p className="mt-3 sm:mt-4 max-w-xl text-xs sm:text-sm leading-7 text-slate-400 font-medium">
              Designed for learners and mentors who want a clean, direct experience without clutter.
            </p>
            <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-slate-400">
              Need help? Visit <Link to="/help" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline decoration-transparent hover:decoration-blue-400">Support</Link> or use the <Link to="/contact" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline decoration-transparent hover:decoration-blue-400">contact form</Link>.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:gap-4 sm:text-sm">
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-2.5 sm:py-3 text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-300 text-center sm:text-left font-medium shadow-sm hover:shadow-md"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 sm:gap-6 border-t border-white/10 pt-6 sm:pt-8 text-xs sm:text-sm text-slate-400">
          <p className="font-medium">© {new Date().getFullYear()} SkillHive. All rights reserved.</p>
          <div className="flex items-center gap-6 sm:gap-8">
            <Link to="/privacy" className="hover:text-blue-300 transition-colors font-medium">Privacy</Link>
            <Link to="/terms" className="hover:text-blue-300 transition-colors font-medium">Terms</Link>
            <Link to="/help" className="hover:text-blue-300 transition-colors font-medium">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
