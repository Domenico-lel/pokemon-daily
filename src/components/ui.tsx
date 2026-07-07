"use client";

import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RARITY_META, TYPE_COLORS, type Rarity } from "@/lib/pokemon";

/** Primary/secondary/ghost button with a tactile press micro-interaction. */
export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: {
  variant?: "primary" | "secondary" | "ghost";
} & ComponentProps<typeof motion.button>) {
  const styles: Record<string, string> = {
    primary:
      "bg-primary text-primary-fg shadow-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-surface-2 text-fg border border-border hover:bg-surface disabled:opacity-50",
    ghost: "text-muted hover:text-fg hover:bg-surface-2",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[9999px] px-5 py-2.5 text-sm font-medium transition-colors",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/** Rarity chip coloured by the rarity design token. */
export function RarityBadge({ rarity, className }: { rarity: Rarity; className?: string }) {
  const token = RARITY_META[rarity].token;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[9999px] px-2.5 py-0.5 text-[11px] font-medium",
        className
      )}
      style={{
        color: `var(--color-${token})`,
        backgroundColor: `color-mix(in oklch, var(--color-${token}) 16%, transparent)`,
        border: `1px solid color-mix(in oklch, var(--color-${token}) 40%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: `var(--color-${token})` }}
      />
      {RARITY_META[rarity].label}
    </span>
  );
}

/** Coloured Pokémon type chips (grass, fire, …). */
export function TypeChips({ types, className }: { types: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-1", className)}>
      {types.map((t) => (
        <span
          key={t}
          className="rounded-[9999px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
          style={{ backgroundColor: TYPE_COLORS[t] ?? "#8a8f98" }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/** Rounded surface card. */
export function Card({
  className,
  children,
  ...props
}: { children: ReactNode } & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-border bg-surface p-5 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
