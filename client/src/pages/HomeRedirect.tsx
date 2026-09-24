import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LandingPage } from "./LandingPage";

export function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return (
      <Navigate to={user.role === "SUPPORT_AGENT" ? "/support/dashboard" : "/dashboard"} replace />
    );
  }

  return <LandingPage />;
}

export function NotFoundRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <Navigate to={user.role === "SUPPORT_AGENT" ? "/support/dashboard" : "/dashboard"} replace />
  );
}
