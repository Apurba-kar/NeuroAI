import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-darker)",
        }}
      >
        <LoadingSpinner size="lg" message="Verifying authentication..." />
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location we were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
