"use client";

import { Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface/50">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="text-center text-xs text-muted sm:text-left">
          <p className="font-display font-semibold text-fg">PetChronicles</p>
          <p className="mt-0.5">
            Dati e artwork da{" "}
            <a
              href="https://pokeapi.co"
              target="_blank"
              rel="noreferrer noopener"
              className="underline transition-colors hover:text-fg"
            >
              PokéAPI
            </a>
          </p>
        </div>

        <nav className="flex items-center gap-4 text-xs text-muted" aria-label="Link legali">
          <a href="#" className="transition-colors hover:text-fg">Termini</a>
          <a href="#" className="transition-colors hover:text-fg">Privacy</a>
          <a href="#" className="transition-colors hover:text-fg">Cookie</a>
        </nav>

        <div className="flex items-center gap-2">
          {[
            { Icon: Twitter, label: "Twitter" },
            { Icon: Instagram, label: "Instagram" },
            { Icon: Github, label: "GitHub" },
          ].map(({ Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="grid size-9 place-items-center rounded-[9999px] border border-border bg-surface text-muted transition-colors hover:text-fg"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
