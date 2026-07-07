"use client";

import { MotionConfig } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

/** Reads the pre-hydration theme the inline script already applied. */
function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => setTheme(readTheme()), []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem("pc-theme", next);
      } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {/* reducedMotion="user" disables all motion when the OS prefers it. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeCtx.Provider>
  );
}

/** Inline, render-blocking script that sets the theme class before paint. */
export const themeScript = `(function(){try{var t=localStorage.getItem('pc-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;
