import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { openMobileSidebar } from "../store/slices/uiSlice";
import { useAuth } from "../hooks/useAuth";
import { customerNav, supportNav } from "./navConfig";

function usePageTitle(): string {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const items = user?.role === "SUPPORT_AGENT" ? supportNav : customerNav;

  const match = items
    .filter((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];

  return match?.label ?? "Support AI";
}

export function Topbar() {
  const dispatch = useAppDispatch();
  const title = usePageTitle();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 md:hidden">
      <button
        type="button"
        onClick={() => dispatch(openMobileSidebar())}
        className="rounded-md p-1.5 text-muted hover:bg-surface-alt hover:text-text"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <span className="text-sm font-semibold text-text">{title}</span>
    </header>
  );
}
