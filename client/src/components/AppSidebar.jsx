import { NavLink } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const navClass = ({ isActive }) =>
  `group flex items-center justify-between rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
  }`;

const itemBadge = (count) => {
  if (!count) {
    return null;
  }

  return (
    <span className="rounded-full bg-rose-500 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white whitespace-nowrap">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const AppSidebar = ({
  isOpen,
  onClose,
  isAdmin,
  onLogout,
  unreadMessagesCount,
  unreadNotificationsCount,
}) => {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/profile", label: "Profile" },
    { to: "/messages", label: "Messages", badge: unreadMessagesCount },
    { to: "/notifications", label: "Notifications", badge: unreadNotificationsCount },
    { to: "/settings", label: "Settings" },
    { to: "/feedback", label: "Feedback" },
    { to: "/help", label: "Support" },
  ];

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden"
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 sm:w-80 max-w-[88vw] border-r border-slate-200 bg-white transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <BrandLogo />
                <p className="mt-1.5 sm:mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
              </div>
            </div>
          </div>

          <nav className="space-y-0.5 sm:space-y-1 px-2 sm:px-3 py-3 sm:py-4">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass} onClick={onClose}>
                <span className="truncate">{item.label}</span>
                {itemBadge(item.badge)}
              </NavLink>
            ))}
            {isAdmin ? (
              <>
                <NavLink to="/admin/messages" className={navClass} onClick={onClose}>
                  <span className="truncate">Admin Inbox</span>
                </NavLink>
                <NavLink to="/admin/posts" className={navClass} onClick={onClose}>
                  <span className="truncate">Admin Posts</span>
                </NavLink>
              </>
            ) : null}
          </nav>

          <div className="mt-auto border-t border-slate-200 p-2.5 sm:p-3">
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg sm:rounded-xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
