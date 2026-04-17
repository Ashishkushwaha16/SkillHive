import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  let currentUser = null;
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (error) {
      localStorage.removeItem("user");
    }
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
