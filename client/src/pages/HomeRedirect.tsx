import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <Navigate to={user.role === "SUPPORT_AGENT" ? "/support/dashboard" : "/dashboard"} replace />
  );
}
