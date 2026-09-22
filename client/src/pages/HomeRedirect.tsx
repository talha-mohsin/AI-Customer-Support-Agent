import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Navigate to={user.role === "SUPPORT_AGENT" ? "/support/tickets" : "/dashboard"} replace />
  );
}
