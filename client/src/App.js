import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AppSidebar from "./components/AppSidebar";
import SiteFooter from "./components/SiteFooter";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import HelpCentre from "./pages/HelpCentre";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Leaderboard from "./pages/Leaderboard";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import AdminMessages from "./pages/AdminMessages";
import AdminPosts from "./pages/AdminPosts";
import NotFound from "./pages/NotFound";
import usePageTitle from "./hooks/usePageTitle";
import {
  getChatConversations,
  getProfile,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./services/userService";
import { SOCKET_ORIGIN } from "./config/api";

const AppShell = ({
  isAuthenticated,
  isAdmin,
  onLogout,
  authNotice,
  onDismissAuthNotice,
  currentUser,
  unreadMessagesCount,
  unreadNotificationsCount,
  setUnreadNotificationsCount,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [topSearch, setTopSearch] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationPanelLoading, setNotificationPanelLoading] = useState(false);
  const [notificationPanelActionLoading, setNotificationPanelActionLoading] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  const pageTitleMap = {
    "/": "Home",
    "/login": "Login",
    "/register": "Register",
    "/forgot-password": "Forgot Password",
    "/reset-password": "Reset Password",
    "/dashboard": "Dashboard",
    "/profile": "Profile",
    "/explore": "Explore",
    "/notifications": "Notifications",
    "/settings": "Settings",
    "/faq": "FAQ",
    "/leaderboard": "Leaderboard",
    "/about": "About",
    "/contact": "Contact",
    "/privacy": "Privacy",
    "/terms": "Terms",
    "/messages": "Messages",
    "/admin/messages": "Admin Inbox",
    "/admin/posts": "Admin Posts",
    "/help": "Support",
  };

  usePageTitle(pageTitleMap[location.pathname] || "Not Found");

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    setProfileMenuOpen(false);
    setNotificationPanelOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const clickedProfile = profileMenuRef.current && profileMenuRef.current.contains(event.target);
      const clickedNotifications =
        notificationMenuRef.current && notificationMenuRef.current.contains(event.target);

      if (!clickedProfile) {
        setProfileMenuOpen(false);
      }

      if (!clickedNotifications) {
        setNotificationPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleTopSearch = (event) => {
    event.preventDefault();
    const keyword = topSearch.trim();
    if (!keyword) {
      navigate("/explore");
      return;
    }

    navigate(`/explore?skills=${encodeURIComponent(keyword)}`);
  };

  const profileLetter = (currentUser?.name || "U").slice(0, 1).toUpperCase();

  const formatNotificationTime = (value) => {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationMeta = (type) => {
    switch (type) {
      case "new_message":
        return { label: "Message", icon: "M4 5h16v10H7l-3 3V5z" };
      case "connection_request":
        return { label: "Request", icon: "M7 12a4 4 0 1 1 8 0" };
      case "request_accepted":
        return { label: "Accepted", icon: "M5 12l4 4L19 6" };
      case "missed_call":
        return { label: "Missed Call", icon: "M7 7l10 10M17 7L7 17" };
      default:
        return { label: "Alert", icon: "M12 6v6m0 4h.01" };
    }
  };

  const visibleNotificationItems =
    notificationFilter === "unread"
      ? notificationItems.filter((item) => !item.isRead)
      : notificationItems;

  const loadNotificationPanel = async () => {
    if (!localStorage.getItem("token")) {
      setNotificationItems([]);
      return;
    }

    try {
      setNotificationPanelLoading(true);
      const data = await getNotifications(20);
      setNotificationItems(data.notifications || []);
      setUnreadNotificationsCount(data.unreadCount || 0);
    } catch (error) {
      setNotificationItems([]);
    } finally {
      setNotificationPanelLoading(false);
    }
  };

  const toggleNotificationPanel = async () => {
    setProfileMenuOpen(false);
    setNotificationPanelOpen((prev) => {
      const next = !prev;
      if (next) {
        setNotificationFilter("all");
        loadNotificationPanel();
      }
      return next;
    });
  };

  const handleNotificationRead = async (notificationId) => {
    try {
      setNotificationPanelActionLoading(true);
      await markNotificationRead(notificationId);
      await loadNotificationPanel();
    } catch (error) {
      await loadNotificationPanel();
    } finally {
      setNotificationPanelActionLoading(false);
    }
  };

  const handleNotificationReadAll = async () => {
    try {
      setNotificationPanelActionLoading(true);
      await markAllNotificationsRead();
      await loadNotificationPanel();
    } finally {
      setNotificationPanelActionLoading(false);
    }
  };

  useEffect(() => {
    const handleIncomingNotification = (event) => {
      const incoming = event?.detail;
      if (!incoming?._id) {
        return;
      }

      setNotificationItems((prev) => {
        const exists = prev.some((item) => item._id === incoming._id);
        if (exists) {
          return prev;
        }

        return [incoming, ...prev].slice(0, 20);
      });
    };

    window.addEventListener("notification:new", handleIncomingNotification);

    return () => {
      window.removeEventListener("notification:new", handleIncomingNotification);
    };
  }, []);

  useEffect(() => {
    if (!authNotice) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      onDismissAuthNotice();
    }, 4500);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [authNotice, onDismissAuthNotice]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-[#eef4ff] to-[#f6faf8]">
      {authNotice ? (
        <div className="fixed right-3 top-3 z-[70] w-[22rem] max-w-[92vw] rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-amber-900">{authNotice}</p>
            <button
              type="button"
              onClick={onDismissAuthNotice}
              className="rounded-md border border-amber-300 bg-white px-2 py-0.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              aria-label="Dismiss session notice"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {!isAuthPage && isAuthenticated ? (
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          unreadMessagesCount={unreadMessagesCount}
        />
      ) : null}

      <div className={!isAuthPage && isAuthenticated && sidebarOpen ? "lg:pl-72 xl:pl-80" : ""}>
        {!isAuthPage && isAuthenticated ? (
          <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(15,23,42,0.3)]">
            <div className="flex flex-wrap items-center gap-2 px-3 sm:gap-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="flex-shrink-0 rounded-full border border-slate-200 bg-white p-1.5 text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:shadow-[0_10px_20px_-12px_rgba(37,99,235,0.45)] sm:p-2"
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                title={sidebarOpen ? "Close menu" : "Open menu"}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16" />
                </svg>
              </button>

              <form onSubmit={handleTopSearch} className="order-3 mx-0 flex min-w-0 flex-[1_1_100%] items-center overflow-hidden rounded-full border border-slate-200 bg-white/90 shadow-sm transition-all duration-200 focus-within:border-blue-300 focus-within:shadow-[0_12px_24px_-18px_rgba(37,99,235,0.45)] sm:order-none sm:mx-1 sm:flex-[1_1_auto]">
                <input
                  type="text"
                  value={topSearch}
                  onChange={(event) => setTopSearch(event.target.value)}
                  placeholder="Search"
                  className="min-w-0 w-full bg-transparent px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  aria-label="Search"
                />
                <button
                  type="submit"
                  className="border-l border-slate-200 px-3 py-2 text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
                  aria-label="Submit search"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20L17 17" />
                  </svg>
                </button>
              </form>

              <div ref={notificationMenuRef} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={toggleNotificationPanel}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:h-9 sm:w-9"
                  aria-label="Open notifications"
                  title="Notifications"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17c0 .53-.21 1.04-.59 1.41L4 17h5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 17a2 2 0 0 0 4 0" />
                  </svg>
                  {unreadNotificationsCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                      {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                    </span>
                  ) : null}
                </button>

                {notificationPanelOpen ? (
                  <div className="absolute right-0 mt-2 w-[22rem] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Notifications</p>
                        <p className="text-sm font-bold text-slate-900">Stay on top of activity</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleNotificationReadAll}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        disabled={notificationPanelActionLoading}
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2">
                      <button
                        type="button"
                        onClick={() => setNotificationFilter("all")}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          notificationFilter === "all"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotificationFilter("unread")}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          notificationFilter === "unread"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Unread
                      </button>
                    </div>

                    <div className="max-h-[24rem] overflow-y-auto p-2">
                      {notificationPanelLoading ? (
                        <p className="px-3 py-4 text-sm text-slate-600">Loading notifications...</p>
                      ) : visibleNotificationItems.length ? (
                        <div className="space-y-2">
                          {visibleNotificationItems.map((item) => {
                            const meta = getNotificationMeta(item.type);

                            return (
                              <article
                                key={item._id}
                                className={`rounded-2xl border px-3 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${
                                  item.isRead ? "border-slate-100 bg-white" : "border-blue-200 bg-gradient-to-br from-blue-50 to-white"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-slate-900 to-blue-900 text-white shadow-sm">
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                                        </svg>
                                      </span>
                                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-600">{item.body}</p>
                                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-500">
                                        {meta.label}
                                      </span>
                                      <span>{formatNotificationTime(item.createdAt)}</span>
                                    </div>
                                  </div>
                                  {!item.isRead ? (
                                      <button
                                      type="button"
                                      onClick={() => handleNotificationRead(item._id)}
                                      className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-[0_8px_18px_-10px_rgba(37,99,235,0.55)] active:scale-95"
                                      disabled={notificationPanelActionLoading}
                                    >
                                      Read
                                    </button>
                                  ) : null}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="px-3 py-4 text-sm text-slate-600">No notifications yet.</p>
                      )}
                    </div>

                    <div className="border-t border-slate-100 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate("/notifications")}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Open full notifications page
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div ref={profileMenuRef} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-900 text-sm font-bold text-white sm:h-9 sm:w-9"
                  aria-label="Open profile menu"
                >
                  {currentUser?.avatar?.url ? (
                    <img src={currentUser.avatar.url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    profileLetter
                  )}
                </button>

                {profileMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-slate-100 bg-white/95 p-2 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.28)] backdrop-blur">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="text-sm font-bold text-slate-900">{currentUser?.name || "User"}</p>
                      <p className="truncate text-xs text-slate-500">{currentUser?.email || ""}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/profile")}
                      className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition-colors duration-200 hover:bg-rose-50"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>
        ) : null}

        <main className={isAuthPage ? "flex min-h-screen items-center justify-center px-3 sm:px-4 py-8 sm:py-10" : "pb-8 sm:pb-10"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/feedback" element={<Navigate to="/contact" replace />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPosts />
                </ProtectedRoute>
              }
            />
            <Route path="/help" element={<HelpCentre />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>

        {!isAuthPage ? <SiteFooter /> : null}
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("token")));
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [authNotice, setAuthNotice] = useState(() => sessionStorage.getItem("authNotice") || "");

  const dismissAuthNotice = useCallback(() => {
    sessionStorage.removeItem("authNotice");
    setAuthNotice("");
  }, []);

  const clearAuthSession = useCallback((options = {}) => {
    const shouldShowNotice = Boolean(options.showExpiredNotice);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setUnreadMessagesCount(0);
    setUnreadNotificationsCount(0);

    if (shouldShowNotice) {
      const message = "Session expired. Please login again.";
      sessionStorage.setItem("authNotice", message);
      setAuthNotice(message);
    }

    window.dispatchEvent(new Event("authChange"));
  }, []);

  const isUnauthorizedError = useCallback((error) => {
    const message = (error?.message || "").toLowerCase();
    return (
      message.includes("not authorized") ||
      message.includes("session expired") ||
      message.includes("invalid token")
    );
  }, []);

  const syncAuthState = useCallback(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setIsAuthenticated(Boolean(token));

    if (!storedUser) {
      setIsAdmin(false);
      setCurrentUser(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setIsAdmin(parsedUser?.role === "admin");
      setCurrentUser(parsedUser);
    } catch (error) {
      localStorage.removeItem("user");
      setIsAdmin(false);
      setCurrentUser(null);
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setCurrentUser(null);
      return;
    }

    try {
      const profile = await getProfile();
      localStorage.setItem("user", JSON.stringify(profile));
      setCurrentUser(profile);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession({ showExpiredNotice: true });
        return;
      }

      const fallbackUser = JSON.parse(localStorage.getItem("user") || "null");
      setCurrentUser(fallbackUser);
    }
  }, [clearAuthSession, isUnauthorizedError]);

  const refreshUnreadMessagesCount = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setUnreadMessagesCount(0);
      return;
    }

    try {
      const data = await getChatConversations();
      setUnreadMessagesCount(data.totalUnreadCount || 0);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession({ showExpiredNotice: true });
        return;
      }

      setUnreadMessagesCount(0);
    }
  }, [clearAuthSession, isUnauthorizedError]);

  const refreshNotifications = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setUnreadNotificationsCount(0);
      return;
    }

    try {
      const data = await getNotifications(20);
      setUnreadNotificationsCount(data.unreadCount || 0);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession({ showExpiredNotice: true });
        return;
      }

      setUnreadNotificationsCount(0);
    }
  }, [clearAuthSession, isUnauthorizedError]);

  useEffect(() => {
    syncAuthState();
    refreshCurrentUser();
    refreshUnreadMessagesCount();
    refreshNotifications();

    window.addEventListener("storage", syncAuthState);
    const handleAuthChange = () => {
      syncAuthState();
      refreshCurrentUser();
      refreshUnreadMessagesCount();
      refreshNotifications();
    };

    window.addEventListener("authChange", handleAuthChange);

    const handleChatUnreadChange = () => {
      refreshUnreadMessagesCount();
    };

    window.addEventListener("chatUnreadChange", handleChatUnreadChange);
    window.addEventListener("focus", refreshNotifications);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("chatUnreadChange", handleChatUnreadChange);
      window.removeEventListener("focus", refreshNotifications);
    };
  }, [
    refreshCurrentUser,
    refreshNotifications,
    refreshUnreadMessagesCount,
    syncAuthState,
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return undefined;
    }

    const socket = io(SOCKET_ORIGIN, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("notification:unreadCount", ({ unreadCount }) => {
      setUnreadNotificationsCount(unreadCount || 0);
    });

    socket.on("notification:new", (notification) => {
      window.dispatchEvent(
        new CustomEvent("notification:new", {
          detail: notification,
        })
      );
    });

    socket.on("connect_error", (error) => {
      if (isUnauthorizedError(error)) {
        clearAuthSession({ showExpiredNotice: true });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, clearAuthSession, isUnauthorizedError]);

  return (
    <BrowserRouter>
      <AppShell
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        authNotice={authNotice}
        onDismissAuthNotice={dismissAuthNotice}
        currentUser={currentUser}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        setUnreadNotificationsCount={setUnreadNotificationsCount}
        onLogout={clearAuthSession}
      />
    </BrowserRouter>
  );
}

export default App;
