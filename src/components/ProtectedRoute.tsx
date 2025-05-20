import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "employer" | "employee" | "manager";
  allowManager?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowManager = true,
}) => {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show loading indicator while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && userData) {
    // Allow managers to access employer routes if allowManager is true
    if (
      requiredRole === "employer" &&
      userData.userType === "manager" &&
      allowManager
    ) {
      return <>{children}</>;
    }

    // Block managers from employee routes
    if (requiredRole === "employee" && userData.userType === "manager") {
      return <Navigate to="/employer/dashboard" replace />;
    }

    // Regular role check
    if (userData.userType !== requiredRole) {
      return <Navigate to={`/${userData.userType}/dashboard`} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
