import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const customerLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/chat", label: "Chat" },
  { to: "/conversations", label: "Conversations" },
  { to: "/tickets", label: "Tickets" },
  { to: "/profile", label: "Profile" },
];

const supportLinks = [
  { to: "/support/tickets", label: "Tickets" },
  { to: "/profile", label: "Profile" },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const links = user?.role === "SUPPORT_AGENT" ? supportLinks : customerLinks;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white p-4">
        <div className="mb-6 px-2 text-lg font-semibold text-slate-900">Support AI</div>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 border-t border-slate-200 pt-4 px-2">
          <p className="text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 text-sm text-red-600 hover:underline"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
