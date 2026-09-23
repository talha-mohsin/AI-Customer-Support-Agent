import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-surface text-sm text-muted transition-colors hover:bg-surface-alt hover:text-text ${
        collapsed ? "md:w-9 md:flex-none" : ""
      }`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className={collapsed ? "md:hidden" : ""}>{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
