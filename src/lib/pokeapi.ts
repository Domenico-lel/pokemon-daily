import {
  petId,
  rarityFromTotal,
  type PokemonPet,
} from "./pokemon";

/**
 * Thin PokéAPI client. Fetches are cached in-memory per session; the resulting
 * PokemonPet snapshots are persisted by the store, so a returning user pays
 * zero network cost for creatures they already own.
 */

const API = "https://pokeapi.co/api/v2";

/** Species range we draw starters from — Gen 1 (iconic, manageable). */
export const SPECIES_RANGE: readonly [number, number] = [1, 151];

const memo = new Map<string, Promise<unknown>>();

function get<T>(path: string): Promise<T> {
  const key = path;
  if (!memo.has(key)) {
    memo.set(
      key,
      fetch(`${API}/${path}`).then((r) => {
        if (!r.ok) throw new Error(`PokéAPI ${path} → ${r.status}`);
        return r.json();
      })
    );
  }
  return memo.get(key) as Promise<T>;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function idFromUrl(url: string): number {
  return Number(url.split("/").filter(Boolean).pop());
}

/* --------------------------- raw response shapes -------------------------- */

interface RawPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other: { "official-artwork": { front_default: string | null } };
  };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

interface RawSpecies {
  evolution_chain: { url: string };
}

interface ChainLink {
  species: { name: string; url: string };
  evolves_to: ChainLink[];
}
interface RawChain {
  chain: ChainLink;
}

/* ------------------------------- public API ------------------------------- */

/** Build a fully-materialised PokemonPet for a species id. */
export async function fetchPet(speciesId: number, stage: number): Promise<PokemonPet> {
  const d = await get<RawPokemon>(`pokemon/${speciesId}`);
  const stat = (name: string) =>
    d.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
  const baseTotal = d.stats.reduce((sum, s) => sum + s.base_stat, 0);

  return {
    id: petId(speciesId),
    speciesId,
    name: cap(d.name.replace(/-/g, " ")),
    sprite:
      d.sprites.other["official-artwork"].front_default ??
      d.sprites.front_default ??
      "",
    types: d.types.map((t) => t.type.name),
    stats: {
      hp: stat("hp"),
      attack: stat("attack"),
      defense: stat("defense"),
      speed: stat("speed"),
    },
    baseTotal,
    rarity: rarityFromTotal(baseTotal),
    stage,
    favorite: false,
    acquiredAt: Date.now(),
  };
}

/**
 * Ordered species ids of an evolution chain, rooted at the base form.
 * Branching chains (e.g. Eevee) collapse to the first branch — a single line.
 */
export async function fetchLineagePath(speciesId: number): Promise<number[]> {
  const species = await get<RawSpecies>(`pokemon-species/${speciesId}`);
  const chainId = idFromUrl(species.evolution_chain.url);
  const chain = await get<RawChain>(`evolution-chain/${chainId}`);

  const path: number[] = [];
  let node: ChainLink | undefined = chain.chain;
  while (node) {
    path.push(idFromUrl(node.species.url));
    node = node.evolves_to[0];
  }
  return path.length ? path : [speciesId];
}

/** Start a brand-new lineage from a random Gen-1 base form. */
export async function startLineage(): Promise<number[]> {
  const [lo, hi] = SPECIES_RANGE;
  const pick = lo + Math.floor(Math.random() * (hi - lo + 1));
  // fetchLineagePath re-roots at the chain base, so mid-evolution picks still
  // start the player at stage 0.
  return fetchLineagePath(pick);
}
