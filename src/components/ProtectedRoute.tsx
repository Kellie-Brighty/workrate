import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "employer" | "employee";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
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

  // If requiredRole is specified and userData is loaded, check if the user has the correct role
  if (requiredRole && userData && userData.userType !== requiredRole) {
    // Redirect to the appropriate dashboard based on the user's actual role
    return <Navigate to={`/${userData.userType}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
