import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, LogOut, Headset, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { closeMobileSidebar, toggleSidebarCollapsed } from "../store/slices/uiSlice";
import { customerNav, supportNav } from "./navConfig";
import { Avatar } from "../components/ui/Avatar";
import { ThemeToggle } from "../components/ThemeToggle";

export function Sidebar() {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);
  const items = user?.role === "SUPPORT_AGENT" ? supportNav : customerNav;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => dispatch(closeMobileSidebar())}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-border bg-surface transition-all duration-200 md:sticky md:top-0 md:translate-x-0 ${
          collapsed ? "md:w-[76px]" : "md:w-64"
        } w-64 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <div className={`flex items-center gap-2 overflow-hidden ${collapsed ? "md:w-0 md:opacity-0" : ""}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
              <Headset size={17} />
            </div>
            <span className="whitespace-nowrap text-[15px] font-semibold text-text">Support AI</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(closeMobileSidebar())}
            className="rounded-md p-1.5 text-muted hover:bg-surface-alt hover:text-text md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
          <button
            type="button"
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="hidden rounded-md p-1.5 text-muted hover:bg-surface-alt hover:text-text md:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => dispatch(closeMobileSidebar())}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      collapsed ? "md:justify-center md:px-0" : ""
                    } ${
                      isActive
                        ? "bg-accent-soft text-accent"
                        : "text-muted hover:bg-surface-alt hover:text-text"
                    }`
                  }
                >
                  <item.icon size={18} className="shrink-0" strokeWidth={2} />
                  <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <div
            className={`mb-3 flex items-center gap-2.5 rounded-md ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <Avatar name={user?.name ?? "?"} size={34} />
            <div className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-sm font-medium text-text">{user?.name}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          </div>

          <div className={`flex gap-2 ${collapsed ? "md:flex-col md:items-center" : ""}`}>
            <ThemeToggle collapsed={collapsed} />
            <button
              type="button"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
              className={`flex h-9 flex-1 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-surface text-sm font-medium text-muted transition-colors hover:bg-danger-soft hover:text-danger ${
                collapsed ? "md:w-9 md:flex-none" : ""
              }`}
            >
              <LogOut size={16} />
              <span className={collapsed ? "md:hidden" : ""}>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
