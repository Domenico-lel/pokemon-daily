"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Gift, FastForward, Loader2 } from "lucide-react";
import { Button } from "./ui";

interface Props {
  claimed: boolean;
  busy: boolean;
  onClaim: () => void;
  onAdvance: () => void;
  streak: number;
}

export default function RewardCard({ claimed, busy, onClaim, onAdvance, streak }: Props) {
  return (
    <div className="rounded-[12px] border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">Ricompensa giornaliera</h3>
          <p className="mt-1 text-sm text-muted">
            Torna ogni giorno per nutrire il tuo pet e farlo evolvere.
          </p>
        </div>
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-[12px] transition-colors ${
            claimed ? "bg-secondary/15 text-secondary" : "bg-accent/15 text-accent"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {claimed ? (
              <motion.span
                key="done"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              >
                <Check className="size-5" />
              </motion.span>
            ) : (
              <motion.span key="gift" exit={{ scale: 0.6, opacity: 0 }}>
                <Gift className="size-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate([30, 15, 30]);
            }
            onClaim();
          }}
          disabled={claimed || busy}
          aria-label="Riscatta la ricompensa giornaliera"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Evoluzione…
            </>
          ) : claimed ? (
            <>
              <Check className="size-4" /> Riscattata oggi
            </>
          ) : (
            <>
              <Gift className="size-4" /> Claim Daily Reward
            </>
          )}
        </Button>

        {claimed && (
          <Button
            variant="ghost"
            onClick={onAdvance}
            disabled={busy}
            aria-label="Avanza di un giorno (modalità demo)"
            className="text-xs"
          >
            <FastForward className="size-3.5" /> Avanza giorno (demo)
          </Button>
        )}
      </div>

      {streak > 0 && (
        <p className="mt-3 text-xs text-muted">
          🔥 Serie attiva: <span className="font-medium text-fg tabular-nums">{streak}</span>{" "}
          giorni consecutivi.
        </p>
      )}
    </div>
  );
}
