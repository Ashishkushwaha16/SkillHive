import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import NotFound from "./pages/NotFound";
import usePageTitle from "./hooks/usePageTitle";

const AppShell = ({ isAuthenticated, isAdmin, onLogout }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isHomePage = location.pathname === "/";

  const pageTitleMap = {
    "/": "Home",
    "/login": "Login",
    "/register": "Register",
    "/dashboard": "Dashboard",
    "/profile": "Profile",
    "/explore": "Explore",
    "/faq": "FAQ",
    "/leaderboard": "Leaderboard",
    "/about": "About",
    "/contact": "Contact",
    "/messages": "Messages",
    "/help": "Help Centre",
  };

  usePageTitle(pageTitleMap[location.pathname] || "Not Found");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f8fbff] via-[#eef4ff] to-[#f6faf8]">
      {!isAuthPage && (
        <Navbar
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          onLogout={onLogout}
        />
      )}

      <main className={isAuthPage ? "flex flex-1 items-center justify-center px-4 py-10" : isHomePage ? "flex-1" : "flex-1 pb-10"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/messages"
            element={(
              <ProtectedRoute requiredRole="admin">
                <Messages />
              </ProtectedRoute>
            )}
          />
          <Route path="/help" element={<HelpCentre />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      {!isAuthPage && <SiteFooter />}
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("token")));
  const [isAdmin, setIsAdmin] = useState(false);

  const syncAuthState = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setIsAuthenticated(Boolean(token));

    if (!storedUser) {
      setIsAdmin(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setIsAdmin(parsedUser?.role === "admin");
    } catch (error) {
      localStorage.removeItem("user");
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    syncAuthState();

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("authChange", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("authChange", syncAuthState);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppShell
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("authChange"));
        }}
      />
    </BrowserRouter>
  );
}

export default App;
