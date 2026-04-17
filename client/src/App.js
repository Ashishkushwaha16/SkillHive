import { useEffect, useRef, useState } from "react";
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
import Leaderboard from "./pages/Leaderboard";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Feedback from "./pages/Feedback";
import AdminMessages from "./pages/AdminMessages";
import AdminPosts from "./pages/AdminPosts";
import NotFound from "./pages/NotFound";
import usePageTitle from "./hooks/usePageTitle";
import {
  getChatConversations,
  getProfile,
  getNotifications,
} from "./services/userService";
import { SOCKET_ORIGIN } from "./config/api";

const AppShell = ({
  isAuthenticated,
  isAdmin,
  onLogout,
  currentUser,
  unreadMessagesCount,
  unreadNotificationsCount,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [topSearch, setTopSearch] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
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
    "/feedback": "Feedback",
    "/faq": "FAQ",
    "/leaderboard": "Leaderboard",
    "/about": "About",
    "/contact": "Contact",
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
  }, [location.pathname]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-[#eef4ff] to-[#f6faf8]">
      {!isAuthPage && isAuthenticated ? (
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          unreadMessagesCount={unreadMessagesCount}
          unreadNotificationsCount={unreadNotificationsCount}
        />
      ) : null}

      <div className={!isAuthPage && isAuthenticated && sidebarOpen ? "lg:pl-72 xl:pl-80" : ""}>
        {!isAuthPage && isAuthenticated ? (
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="rounded-lg border border-slate-300 p-1.5 sm:p-2 text-slate-700 hover:bg-slate-100 flex-shrink-0"
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                title={sidebarOpen ? "Close menu" : "Open menu"}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16" />
                </svg>
              </button>

              <form onSubmit={handleTopSearch} className="mx-1 flex flex-1 items-center overflow-hidden rounded-full border border-slate-300 bg-white shadow-sm">
                <input
                  type="text"
                  value={topSearch}
                  onChange={(event) => setTopSearch(event.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-700 outline-none"
                  aria-label="Search"
                />
                <button
                  type="submit"
                  className="border-l border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-100"
                  aria-label="Submit search"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20L17 17" />
                  </svg>
                </button>
              </form>

              <div ref={profileMenuRef} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-900 text-sm font-bold text-white"
                  aria-label="Open profile menu"
                >
                  {currentUser?.avatar?.url ? (
                    <img src={currentUser.avatar.url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    profileLetter
                  )}
                </button>

                {profileMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="text-sm font-bold text-slate-900">{currentUser?.name || "User"}</p>
                      <p className="truncate text-xs text-slate-500">{currentUser?.email || ""}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/profile")}
                      className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
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
            <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
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

  const syncAuthState = () => {
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
  };

  const refreshCurrentUser = async () => {
    if (!localStorage.getItem("token")) {
      setCurrentUser(null);
      return;
    }

    try {
      const profile = await getProfile();
      localStorage.setItem("user", JSON.stringify(profile));
      setCurrentUser(profile);
    } catch (error) {
      const fallbackUser = JSON.parse(localStorage.getItem("user") || "null");
      setCurrentUser(fallbackUser);
    }
  };

  const refreshUnreadMessagesCount = async () => {
    if (!localStorage.getItem("token")) {
      setUnreadMessagesCount(0);
      return;
    }

    try {
      const data = await getChatConversations();
      setUnreadMessagesCount(data.totalUnreadCount || 0);
    } catch (error) {
      setUnreadMessagesCount(0);
    }
  };

  const refreshNotifications = async () => {
    if (!localStorage.getItem("token")) {
      setUnreadNotificationsCount(0);
      return;
    }

    try {
      const data = await getNotifications(20);
      setUnreadNotificationsCount(data.unreadCount || 0);
    } catch (error) {
      setUnreadNotificationsCount(0);
    }
  };

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
  }, []);

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

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <AppShell
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        currentUser={currentUser}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setCurrentUser(null);
          setUnreadMessagesCount(0);
          setUnreadNotificationsCount(0);
          window.dispatchEvent(new Event("authChange"));
        }}
      />
    </BrowserRouter>
  );
}

export default App;
