"use client";

import { motion } from "framer-motion";
import { useGame } from "@/store/useGame";

export default function EvolutionBar({ mounted }: { mounted: boolean }) {
  const evolveEvery = useGame((s) => s.evolveEvery);
  const progress = useGame((s) => s.evolveProgress);
  const value = mounted ? progress : 0;
  const remaining = evolveEvery - value;
  const pct = (value / evolveEvery) * 100;

  return (
    <div className="rounded-[12px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold">Prossima evoluzione</h3>
        <span className="text-xs text-muted tabular-nums">
          {remaining === evolveEvery ? evolveEvery : remaining} giorn{remaining === 1 ? "o" : "i"} rimanenti
        </span>
      </div>

      <div
        className="relative h-3 w-full overflow-hidden rounded-[9999px] bg-surface-2"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={evolveEvery}
        aria-label="Avanzamento verso la prossima evoluzione"
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-[9999px] bg-gradient-to-r from-primary to-secondary"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>

      {/* Numbered step dots */}
      <ol className="mt-3 flex items-center justify-between" aria-hidden>
        {Array.from({ length: evolveEvery }, (_, i) => {
          const done = i < value;
          return (
            <li
              key={i}
              className="grid size-6 place-items-center rounded-full border text-[10px] font-medium tabular-nums transition-colors"
              style={{
                borderColor: done ? "var(--color-primary)" : "var(--color-border)",
                backgroundColor: done ? "var(--color-primary)" : "transparent",
                color: done ? "var(--color-primary-fg)" : "var(--color-muted)",
              }}
              title={`Giorno ${i + 1}`}
            >
              {i + 1}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
