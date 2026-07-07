"use client";

import { motion } from "framer-motion";
import { Heart, Swords, Shield, Wind } from "lucide-react";
import type { PokemonPet } from "@/lib/pokemon";
import { RarityBadge, TypeChips } from "./ui";

const STAT_META = [
  { key: "hp", label: "HP", icon: Heart, token: "secondary" },
  { key: "attack", label: "Attack", icon: Swords, token: "epic" },
  { key: "defense", label: "Defense", icon: Shield, token: "primary" },
  { key: "speed", label: "Speed", icon: Wind, token: "accent" },
] as const;

// Pokémon base stats top out around 180-255; scale bars against a sane max.
const STAT_MAX = 200;

export default function PetStatsPanel({ pet, mounted }: { pet: PokemonPet; mounted: boolean }) {
  return (
    <div className="rounded-[12px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">
            {pet.name}{" "}
            <span className="text-xs font-normal text-muted">
              #{String(pet.speciesId).padStart(3, "0")}
            </span>
          </h3>
          <p className="text-xs text-muted">
            Stage {pet.stage} · Base total {pet.baseTotal}
          </p>
        </div>
        <RarityBadge rarity={pet.rarity} />
      </div>

      <TypeChips types={pet.types} className="mb-4 justify-start" />

      <dl className="space-y-3">
        {STAT_META.map(({ key, label, icon: Icon, token }) => {
          const val = pet.stats[key];
          const pct = Math.min(100, (val / STAT_MAX) * 100);
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Icon className="size-3.5" style={{ color: `var(--color-${token})` }} />
                  {label}
                </dt>
                <dd className="font-medium tabular-nums">{val}</dd>
              </div>
              <div className="h-2 overflow-hidden rounded-[9999px] bg-surface-2">
                <motion.div
                  className="h-full rounded-[9999px]"
                  style={{ backgroundColor: `var(--color-${token})` }}
                  initial={false}
                  animate={{ width: mounted ? `${pct}%` : "0%" }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                />
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
