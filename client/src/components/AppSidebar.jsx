import { NavLink } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const navClass = ({ isActive }) =>
  `group flex items-center justify-between rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.3)]"
      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm"
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
}) => {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/profile", label: "Profile" },
    { to: "/messages", label: "Messages", badge: unreadMessagesCount },
    { to: "/settings", label: "Settings" },
    { to: "/contact", label: "Contact Us" },
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
        className={`fixed inset-y-0 left-0 z-40 w-72 sm:w-80 max-w-[88vw] border-r border-slate-100 bg-white transition-transform duration-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white px-3 sm:px-4 py-4 sm:py-5">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <BrandLogo />
                <p className="mt-2 sm:mt-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Workspace</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-2 sm:px-3 py-4 sm:py-5">
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

          <div className="mt-auto border-t border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 sm:p-4">
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg sm:rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_4px_12px_-4px_rgba(220,38,38,0.4)] active:scale-95"
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
