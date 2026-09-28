"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "quickkart-theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // On mount, read the saved preference (falls back to the OS setting).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldUseDark = saved ? saved === "dark" : prefersDark;
      setIsDark(shouldUseDark);
      document.documentElement.classList.toggle("dark", shouldUseDark);
    } catch {
      // Storage unavailable — default to light mode.
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // Non-fatal — preference just won't persist across reloads.
    }
  }

  return (
    <button
  onClick={toggleTheme}
  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
  className="
    flex h-10 w-10 items-center justify-center
    rounded-xl
    border border-slate-200/80
    bg-white/80
    text-slate-700
    shadow-sm
    backdrop-blur-sm
    transition-all duration-200
    hover:-translate-y-0.5
    hover:bg-white
    hover:text-slate-900
    hover:shadow-md
    active:translate-y-0
    dark:border-white/10
    dark:bg-white/10
    dark:text-slate-200
    dark:hover:bg-white/15
    dark:hover:text-white
  "
>
  {isDark ? (
    <Sun className="h-[17px] w-[17px]" strokeWidth={2} />
  ) : (
    <Moon className="h-[17px] w-[17px]" strokeWidth={2} />
  )}
</button>
  );
}
