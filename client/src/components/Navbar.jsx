import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
  }`;

const Navbar = ({ isAuthenticated, isAdmin, onLogout, unreadMessagesCount = 0 }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_-24px_rgba(15,23,42,0.3)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-500 text-lg font-black text-white shadow-lg shadow-blue-200 transition-transform duration-200 group-hover:-translate-y-0.5">
            S
          </div>
          <div className="text-left">
            <div className="text-lg font-extrabold tracking-tight text-slate-950">SkillHive</div>
            <div className="text-xs font-medium text-slate-500">Skill sharing that feels personal</div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              <NavLink to="/explore" className={navLinkClass}>
                Explore
              </NavLink>
              <NavLink to="/leaderboard" className={navLinkClass}>
                Leaderboard
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
              <NavLink to="/messages" className={navLinkClass}>
                <div className="relative flex items-center">
                  Messages
                  {unreadMessagesCount > 0 ? (
                    <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                    </span>
                  ) : null}
                </div>
              </NavLink>
              {isAdmin ? (
                <NavLink to="/admin/messages" className={navLinkClass}>
                  Admin Inbox
                </NavLink>
              ) : null}
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/leaderboard" className={navLinkClass}>
                Leaderboard
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Join Now
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
