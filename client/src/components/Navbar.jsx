import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
    isActive
      ? "bg-blue-100 text-blue-800"
      : "text-slate-700 hover:bg-blue-50 hover:text-blue-800"
  }`;

const Navbar = ({ isAuthenticated, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="text-xl font-bold tracking-tight text-blue-900">
          SkillHive
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2">
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
                Messages
              </NavLink>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-900"
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
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
