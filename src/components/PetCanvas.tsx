"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import type { PokemonPet } from "@/lib/pokemon";
import { pokemonAltText } from "@/lib/pokemon";
import PokemonSprite from "./PokemonSprite";

interface Props {
  pet: PokemonPet;
  /** Bumped on each evolution to retrigger the celebratory burst. */
  evolveTick: number;
  size?: number;
}

const SOFT = { stiffness: 220, damping: 22, mass: 0.6 };

export default function PetCanvas({ pet, evolveTick, size = 260 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Magnetic 3D tilt following the pointer.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), SOFT);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), SOFT);

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function reset() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="relative grid place-items-center"
      style={{ perspective: 1000 }}
    >
      {/* Soft platform shadow */}
      <div
        className="absolute bottom-4 h-6 rounded-[9999px] bg-black/10 blur-md dark:bg-black/40"
        style={{ width: size * 0.5 }}
        aria-hidden
      />

      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <EvolutionBurst tick={evolveTick}>
            <PokemonSprite
              src={pet.sprite}
              alt={pokemonAltText(pet)}
              size={size}
              priority
            />
          </EvolutionBurst>
        </motion.div>
      </motion.div>
    </div>
  );
}

function EvolutionBurst({
  tick,
  children,
}: {
  tick: number;
  children: React.ReactNode;
}) {
  const first = useRef(true);
  useEffect(() => {
    first.current = false;
  }, []);

  return (
    <motion.div
      key={tick}
      initial={first.current ? false : { scale: 0.8, rotate: 0 }}
      animate={{ scale: [0.8, 1.2, 1], rotate: [0, 15, -15, 0] }}
      transition={{ duration: 0.48, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
