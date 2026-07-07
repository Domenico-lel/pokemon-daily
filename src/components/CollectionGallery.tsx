"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Heart } from "lucide-react";
import { RARITIES, type PokemonPet, type Rarity } from "@/lib/pokemon";
import { cn } from "@/lib/cn";
import GalleryItem from "./GalleryItem";
import { Button } from "./ui";

const PAGE = 10;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

interface Props {
  collection: PokemonPet[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function CollectionGallery({
  collection,
  activeId,
  onSelect,
  onToggleFavorite,
}: Props) {
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [favOnly, setFavOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return collection
      .filter((p) => (rarity === "all" ? true : p.rarity === rarity))
      .filter((p) => (favOnly ? p.favorite : true))
      .slice()
      .reverse(); // newest first
  }, [collection, rarity, favOnly]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // Reset paging when filters change.
  useEffect(() => setVisible(PAGE), [rarity, favOnly]);

  // Auto load-more via IntersectionObserver (no infinite scroll of the whole DB).
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible((v) => v + PAGE);
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore]);

  return (
    <section aria-labelledby="collection-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="collection-heading" className="font-display text-xl font-bold">
            Il tuo Pokédex
          </h2>
          <p className="text-sm text-muted">
            {collection.length} Pokémon catturati · evoluti giorno dopo giorno
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted">
            <Filter className="size-3.5" /> Filtra
          </span>
          <FilterPill active={rarity === "all"} onClick={() => setRarity("all")}>
            Tutti
          </FilterPill>
          {RARITIES.map((r) => (
            <FilterPill key={r} active={rarity === r} onClick={() => setRarity(r)} token={r}>
              {r}
            </FilterPill>
          ))}
          <button
            onClick={() => setFavOnly((v) => !v)}
            aria-pressed={favOnly}
            className={cn(
              "flex items-center gap-1 rounded-[9999px] border px-2.5 py-1 text-xs font-medium transition-colors",
              favOnly
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted hover:text-fg"
            )}
          >
            <Heart className="size-3" fill={favOnly ? "var(--color-accent)" : "none"} /> Preferiti
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-[12px] border border-dashed border-border bg-surface-2 p-8 text-center text-sm text-muted">
          Nessun pet con questi filtri.
        </p>
      ) : (
        <motion.div
          key={`${rarity}-${favOnly}`}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {shown.map((pet) => (
            <GalleryItem
              key={pet.id}
              pet={pet}
              active={pet.id === activeId}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </motion.div>
      )}

      {hasMore && (
        <div ref={sentinel} className="mt-6 grid place-items-center">
          <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE)}>
            Carica altri
          </Button>
        </div>
      )}
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  token,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  token?: Rarity;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-[9999px] border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted hover:text-fg"
      )}
    >
      {children}
    </button>
  );
}
