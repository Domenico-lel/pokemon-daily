"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { PokemonPet } from "@/lib/pokemon";
import { pokemonAltText } from "@/lib/pokemon";
import { cn } from "@/lib/cn";
import PokemonSprite from "./PokemonSprite";
import { RarityBadge, TypeChips } from "./ui";

interface Props {
  pet: PokemonPet;
  active: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.32, 0.72, 0, 1] } },
};

export default function GalleryItem({ pet, active, onSelect, onToggleFavorite }: Props) {
  return (
    <motion.div variants={item} style={{ perspective: 1000 }}>
      <motion.button
        onClick={() => onSelect(pet.id)}
        whileHover={{ rotateX: -5, rotateY: 5 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        aria-label={`Seleziona ${pokemonAltText(pet)}`}
        aria-pressed={active}
        className={cn(
          "group relative flex w-full flex-col items-center rounded-[12px] border bg-surface p-3 text-center shadow-sm transition-colors",
          active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <span className="absolute left-2 top-2 text-[10px] font-semibold tabular-nums text-muted">
          #{String(pet.speciesId).padStart(3, "0")}
        </span>

        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(pet.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(pet.id);
            }
          }}
          aria-label={pet.favorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          aria-pressed={pet.favorite}
          className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-[9999px] bg-bg/70 text-muted backdrop-blur transition-colors hover:text-accent"
        >
          <Heart
            className={cn("size-3.5 transition-all", pet.favorite && "scale-110")}
            fill={pet.favorite ? "var(--color-accent)" : "none"}
            stroke={pet.favorite ? "var(--color-accent)" : "currentColor"}
          />
        </span>

        <div className="pointer-events-none">
          <PokemonSprite src={pet.sprite} alt={pokemonAltText(pet)} size={112} />
        </div>

        <p className="mt-1 line-clamp-1 text-sm font-medium">{pet.name}</p>
        <TypeChips types={pet.types} className="mb-2 mt-1" />
        <RarityBadge rarity={pet.rarity} />
      </motion.button>
    </motion.div>
  );
}
