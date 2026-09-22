import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "SUPPORT_AGENT" ? "/support/tickets" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
