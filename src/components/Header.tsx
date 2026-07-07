"use client";

import { Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useGame } from "@/store/useGame";
import { useTheme } from "./providers";
import { Sun, Moon } from "lucide-react";

export default function Header({ mounted }: { mounted: boolean }) {
  const streak = useGame((s) => s.streak);
  const evolveEvery = useGame((s) => s.evolveEvery);
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-fg shadow-sm">
            <Sparkles className="size-4" />
          </span>
          <span className="tracking-tight">
            Pet<span className="text-primary">Chronicles</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <motion.div
            key={streak}
            initial={mounted ? { scale: 0.85 } : false}
            animate={{ scale: 1 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="flex items-center gap-1.5 rounded-[9999px] border border-border bg-surface px-3 py-1.5 text-sm font-medium shadow-sm"
            aria-label={`Streak: ${mounted ? streak : 0} di ${evolveEvery} giorni`}
          >
            <Flame className="size-4 text-accent" />
            <span className="tabular-nums">
              {mounted ? streak : 0}
              <span className="text-muted"> / {evolveEvery}</span>
            </span>
          </motion.div>

          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Passa a tema chiaro" : "Passa a tema scuro"}
            aria-pressed={theme === "dark"}
            className="grid size-9 place-items-center rounded-[9999px] border border-border bg-surface text-muted shadow-sm transition-colors hover:text-fg"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
