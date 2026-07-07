/* -------------------------------------------------------------------------- */
/*  Domain model — a "pet" is now a real Pokémon snapshot fetched from PokéAPI  */
/*  and cached in the persisted store so it never needs re-fetching.           */
/* -------------------------------------------------------------------------- */

export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
export type Rarity = (typeof RARITIES)[number];

export const RARITY_META: Record<Rarity, { token: string; label: string }> = {
  Common: { token: "common", label: "Comune" },
  Uncommon: { token: "uncommon", label: "Non comune" },
  Rare: { token: "rare", label: "Raro" },
  Epic: { token: "epic", label: "Epico" },
  Legendary: { token: "legendary", label: "Leggendario" },
};

export interface PokemonPet {
  /** Stable per-species id: one card per Pokédex entry. */
  id: string;
  speciesId: number;
  name: string; // display-cased, e.g. "Bulbasaur"
  sprite: string; // official artwork URL
  types: string[]; // e.g. ["grass", "poison"]
  stats: { hp: number; attack: number; defense: number; speed: number };
  baseTotal: number;
  rarity: Rarity;
  /** Position within its real evolution chain (0 = base form). */
  stage: number;
  favorite: boolean;
  acquiredAt: number;
}

/** Rarity from base-stat total — legendaries land at the top naturally. */
export function rarityFromTotal(total: number): Rarity {
  if (total >= 580) return "Legendary";
  if (total >= 500) return "Epic";
  if (total >= 420) return "Rare";
  if (total >= 320) return "Uncommon";
  return "Common";
}

export function petId(speciesId: number): string {
  return `pkmn-${speciesId}`;
}

export function pokemonAltText(p: PokemonPet): string {
  return `Pokémon ${p.name}, stage ${p.stage}, tipo ${p.types.join("/")}, rarità ${
    RARITY_META[p.rarity].label
  }`;
}

/** Official type palette (hex) for the type chips. */
export const TYPE_COLORS: Record<string, string> = {
  normal: "#9099a1",
  fire: "#ff9c54",
  water: "#4d90d5",
  electric: "#f3d23b",
  grass: "#63bb5b",
  ice: "#74cec0",
  fighting: "#ce4066",
  poison: "#ab6ac8",
  ground: "#d97746",
  flying: "#8fa8dd",
  psychic: "#f97176",
  bug: "#90c12c",
  rock: "#c7b78b",
  ghost: "#5269ac",
  dragon: "#0a6dc4",
  dark: "#5a5366",
  steel: "#5a8ea1",
  fairy: "#ec8fe6",
};
