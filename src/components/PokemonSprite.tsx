"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Pokémon artwork with a shimmer placeholder until the image decodes.
 * Plain <img> keeps things asset-config-free; the URLs are stable CDN files.
 */
export default function PokemonSprite({ src, alt, size = 200, className, priority }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      {!loaded && (
        <span className="absolute inset-[12%] animate-pulse rounded-full bg-surface-2" aria-hidden />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-contain transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0"
        )}
        style={{ filter: "drop-shadow(0 8px 16px hsla(260,20%,10%,0.25))" }}
      />
    </span>
  );
}
