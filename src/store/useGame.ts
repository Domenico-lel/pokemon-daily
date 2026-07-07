"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type PokemonPet } from "@/lib/pokemon";
import { fetchPet, fetchLineagePath, startLineage } from "@/lib/pokeapi";

/** Local date key (YYYY-MM-DD) in the user's timezone. */
function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function dayDiff(aKey: string, bKey: string): number {
  const a = new Date(aKey + "T00:00:00");
  const b = new Date(bKey + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export interface ClaimResult {
  claimed: boolean;
  evolved: boolean;
  streakBroken: boolean;
  newPet?: PokemonPet;
}

const NO_OP: ClaimResult = { claimed: false, evolved: false, streakBroken: false };

interface GameState {
  booting: boolean;
  busy: boolean;
  error: string | null;

  evolveEvery: number;
  dayCount: number;
  streak: number;
  bestStreak: number;
  lastClaim: string | null;
  evolveProgress: number;

  collection: PokemonPet[];
  activeId: string | null;
  lineagePath: number[]; // species ids of the active evolution chain
  stageIndex: number; // index into lineagePath of the active pet

  init: () => Promise<void>;
  canClaim: () => boolean;
  claim: () => Promise<ClaimResult>;
  advanceDay: () => Promise<ClaimResult>;
  toggleFavorite: (id: string) => void;
  setActive: (id: string) => void;
  reset: () => Promise<void>;
}

/** Add a pet to the collection (one card per species) and make it active. */
function absorb(collection: PokemonPet[], pet: PokemonPet): PokemonPet[] {
  return collection.some((p) => p.id === pet.id) ? collection : [...collection, pet];
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      /** Shared advance logic for real claim + demo advance. */
      async function tick(streakBroken: boolean): Promise<ClaimResult> {
        const s = get();
        if (s.busy) return NO_OP;
        set({ busy: true, error: null });
        try {
          const streak = streakBroken ? 1 : s.streak + 1;
          const patch: Partial<GameState> = {
            dayCount: s.dayCount + 1,
            streak,
            bestStreak: Math.max(s.bestStreak, streak),
          };

          const nextProgress = s.evolveProgress + 1;
          let evolved = false;
          let newPet: PokemonPet | undefined;

          if (nextProgress >= s.evolveEvery) {
            const nextIdx = s.stageIndex + 1;
            if (nextIdx < s.lineagePath.length) {
              // Advance along the real evolution chain.
              newPet = await fetchPet(s.lineagePath[nextIdx], nextIdx);
              patch.stageIndex = nextIdx;
            } else {
              // Chain exhausted → hatch a fresh lineage from a new base form.
              const path = await startLineage();
              newPet = await fetchPet(path[0], 0);
              patch.lineagePath = path;
              patch.stageIndex = 0;
            }
            patch.evolveProgress = 0;
            patch.collection = absorb(s.collection, newPet);
            patch.activeId = newPet.id;
            evolved = true;
          } else {
            patch.evolveProgress = nextProgress;
          }

          set(patch);
          return { claimed: true, evolved, streakBroken, newPet };
        } catch (e) {
          set({ error: e instanceof Error ? e.message : "Errore di rete" });
          return NO_OP;
        } finally {
          set({ busy: false });
        }
      }

      return {
        booting: true,
        busy: false,
        error: null,

        evolveEvery: 7,
        dayCount: 0,
        streak: 0,
        bestStreak: 0,
        lastClaim: null,
        evolveProgress: 0,

        collection: [],
        activeId: null,
        lineagePath: [],
        stageIndex: 0,

        init: async () => {
          const s = get();
          if (s.collection.length > 0) {
            set({ booting: false });
            return;
          }
          set({ booting: true, error: null });
          try {
            const path = await startLineage();
            const starter = await fetchPet(path[0], 0);
            set({
              collection: [starter],
              activeId: starter.id,
              lineagePath: path,
              stageIndex: 0,
            });
          } catch (e) {
            set({ error: e instanceof Error ? e.message : "Errore di rete" });
          } finally {
            set({ booting: false });
          }
        },

        canClaim: () => get().lastClaim !== todayKey(),

        claim: async () => {
          const s = get();
          const today = todayKey();
          if (s.lastClaim === today) return NO_OP;
          const streakBroken = s.lastClaim != null && dayDiff(s.lastClaim, today) > 1;
          const res = await tick(streakBroken);
          if (res.claimed) set({ lastClaim: today });
          return res;
        },

        advanceDay: async () => {
          const res = await tick(false);
          if (res.claimed) set({ lastClaim: todayKey() });
          return res;
        },

        toggleFavorite: (id) =>
          set((s) => ({
            collection: s.collection.map((p) =>
              p.id === id ? { ...p, favorite: !p.favorite } : p
            ),
          })),

        setActive: (id) => {
          const s = get();
          const pet = s.collection.find((p) => p.id === id);
          if (!pet) return;
          set({ activeId: id });
          // Re-align the evolution chain to the selected pet's lineage so the
          // progress bar keeps evolving from where the user is now looking.
          void fetchLineagePath(pet.speciesId).then((path) => {
            const idx = path.indexOf(pet.speciesId);
            set({ lineagePath: path, stageIndex: idx < 0 ? pet.stage : idx });
          });
        },

        reset: async () => {
          set({
            dayCount: 0,
            streak: 0,
            bestStreak: 0,
            lastClaim: null,
            evolveProgress: 0,
            collection: [],
            activeId: null,
            lineagePath: [],
            stageIndex: 0,
          });
          await get().init();
        },
      };
    },
    {
      name: "petchronicles-pkmn-v1",
      partialize: (s) => ({
        evolveEvery: s.evolveEvery,
        dayCount: s.dayCount,
        streak: s.streak,
        bestStreak: s.bestStreak,
        lastClaim: s.lastClaim,
        evolveProgress: s.evolveProgress,
        collection: s.collection,
        activeId: s.activeId,
        lineagePath: s.lineagePath,
        stageIndex: s.stageIndex,
      }),
      onRehydrateStorage: () => (state) => {
        void state?.init();
      },
    }
  )
);
