"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, PartyPopper, Loader2, WifiOff } from "lucide-react";
import { useGame } from "@/store/useGame";
import { pokemonAltText, type PokemonPet } from "@/lib/pokemon";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PetCanvas from "@/components/PetCanvas";
import RewardCard from "@/components/RewardCard";
import EvolutionBar from "@/components/EvolutionBar";
import PetStatsPanel from "@/components/PetStatsPanel";
import CollectionGallery from "@/components/CollectionGallery";
import { Button, RarityBadge } from "@/components/ui";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [evolveTick, setEvolveTick] = useState(0);
  const [toast, setToast] = useState<PokemonPet | null>(null);

  const booting = useGame((s) => s.booting);
  const busy = useGame((s) => s.busy);
  const error = useGame((s) => s.error);
  const collection = useGame((s) => s.collection);
  const activeId = useGame((s) => s.activeId);
  const streak = useGame((s) => s.streak);
  const lastClaim = useGame((s) => s.lastClaim);
  const claim = useGame((s) => s.claim);
  const advanceDay = useGame((s) => s.advanceDay);
  const setActive = useGame((s) => s.setActive);
  const toggleFavorite = useGame((s) => s.toggleFavorite);

  // Hydration lifecycle — hasHydrated() is already true for sync localStorage.
  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useGame.persist.onFinishHydration(finish);
    if (useGame.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const ready = hydrated && !booting;
  const active = collection.find((p) => p.id === activeId) ?? collection[0];
  const claimedToday = ready && lastClaim === todayKey();

  async function run(action: () => Promise<import("@/store/useGame").ClaimResult>) {
    const res = await action();
    if (res.claimed && res.evolved && res.newPet) {
      setEvolveTick((t) => t + 1);
      setToast(res.newPet);
      setTimeout(() => setToast(null), 3600);
    }
  }
  const onClaim = () => run(claim);
  const onAdvance = () => run(advanceDay);

  return (
    <div id="top" className="min-h-dvh">
      <Header mounted={ready} />

      <div aria-live="polite" className="sr-only">
        {toast ? `Evoluzione! Nuovo Pokémon: ${pokemonAltText(toast)}` : ""}
      </div>

      <main className="mx-auto max-w-screen-2xl px-4 pb-16 sm:px-6">
        {/* HERO ------------------------------------------------------------ */}
        <section className="relative grid items-center gap-8 py-10 lg:grid-cols-2 lg:py-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-grid" aria-hidden />

          <div className="order-2 flex flex-col items-start lg:order-1">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-[9999px] border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-sm">
              <Sparkles className="size-3.5 text-primary" />
              Login streak · evolve · collect
            </span>

            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Accedi, evolvi e{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                cattura
              </span>{" "}
              il tuo Pokémon.
            </h1>

            <p className="mt-4 max-w-md text-balance text-muted">
              Ogni giorno di accesso avvicina il tuo Pokémon alla prossima evoluzione,
              lungo la sua vera catena evolutiva. Quando è al massimo, si schiude un
              nuovo compagno.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                onClick={onClaim}
                disabled={claimedToday || busy || !ready}
                className="px-6 py-3 text-base"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {claimedToday ? "Ricompensa riscattata" : "Claim Daily Reward"}
              </Button>
              {active && ready && <RarityBadge rarity={active.rarity} />}
            </div>

            {error && (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                <WifiOff className="size-4" /> Problema di rete con PokéAPI. Riprova tra poco.
              </p>
            )}
          </div>

          <div className="order-1 lg:order-2">
            {active && ready ? (
              <PetCanvas pet={active} evolveTick={evolveTick} />
            ) : (
              <div className="mx-auto grid aspect-square w-[260px] place-items-center rounded-full bg-surface-2">
                <Loader2 className="size-8 animate-spin text-muted" />
              </div>
            )}
          </div>
        </section>

        {/* DASHBOARD ------------------------------------------------------- */}
        <section id="dashboard" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <RewardCard
            claimed={claimedToday}
            busy={busy}
            onClaim={onClaim}
            onAdvance={onAdvance}
            streak={ready ? streak : 0}
          />
          <EvolutionBar mounted={ready} />
          {active && ready ? (
            <PetStatsPanel pet={active} mounted={ready} />
          ) : (
            <div className="h-56 animate-pulse rounded-[12px] bg-surface-2" />
          )}
        </section>

        {/* COLLECTION ------------------------------------------------------ */}
        <div className="mt-12">
          {ready && (
            <CollectionGallery
              collection={collection}
              activeId={activeId}
              onSelect={setActive}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>
      </main>

      <Footer />

      {/* EVOLUTION TOAST ------------------------------------------------- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-3 rounded-[9999px] border border-border bg-surface px-4 py-2.5 shadow-lg"
            role="status"
          >
            <span className="grid size-8 place-items-center rounded-full bg-accent/15 text-accent">
              <PartyPopper className="size-4" />
            </span>
            <div className="text-sm">
              <span className="font-semibold">Evoluzione!</span>{" "}
              <span className="text-muted">
                {toast.name} · Stage {toast.stage}
              </span>
            </div>
            <RarityBadge rarity={toast.rarity} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
