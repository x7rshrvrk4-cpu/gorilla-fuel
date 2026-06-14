import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS } from "../rankings/lib/products";
import { ENERGY_PRODUCTS } from "../energy/lib/products";

export const metadata: Metadata = {
  title: "Browse All Rankings — Gorilla Fuel",
  description:
    "Every Gorilla Fuel ranking in one place — food & snacks, energy drinks, sports & hydration, alcohol, wine and supplements. No brand pays for placement.",
  alternates: { canonical: "/explore" },
};

// Honest, auto-updating counts pulled straight from the data arrays.
const SUPPLEMENT_COUNT = PRODUCTS.length;
const ENERGY_COUNT = ENERGY_PRODUCTS.filter((p) => p.category === "Energy Drinks").length;

type Tile = { href: string; label: string; sub: string; tagline: string };

// Reuses the homepage "category doors" tile pattern so the hub matches the site look.
const TILES: Tile[] = [
  {
    href: "/approved",
    label: "FOOD & SNACKS",
    sub: "Approved · Cheat List · Stay Away",
    tagline: "Curated lists + scan anything",
  },
  {
    href: "/energy",
    label: "ENERGY DRINKS",
    sub: "Caffeine, scored honestly",
    tagline: `${ENERGY_COUNT}+ energy drinks ranked`,
  },
  {
    href: "/energy",
    label: "SPORTS & HYDRATION",
    sub: "Electrolytes · recovery",
    tagline: "Hydration drinks ranked",
  },
  {
    href: "/alcohol",
    label: "ALCOHOL",
    sub: "Beer · Seltzer · Cider · Non-Alc",
    tagline: "500+ products scored",
  },
  {
    href: "/alcohol",
    label: "WINE",
    sub: "VQA & beyond, LCBO-verified scores",
    tagline: "Ontario wines with proof links",
  },
  {
    href: "/rankings",
    label: "SUPPLEMENTS",
    sub: "Protein · Performance · Recovery",
    tagline: `${SUPPLEMENT_COUNT} products ranked`,
  },
];

export default function ExplorePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {/* HEADER */}
      <div className="max-w-2xl">
        <p className="font-display text-sm tracking-[0.3em] text-gold">RANKINGS HUB</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          Browse All <span className="text-gold">Rankings</span>.
        </h1>
        <p className="mt-4 text-muted">
          Every Gorilla Fuel ranking in one place — pick a section. Food, drinks, alcohol, wine and
          supplements, each scored the same no-BS way. No brand pays for placement.
        </p>
      </div>

      {/* TILE GRID — same pattern as the homepage category doors */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group flex min-h-[220px] flex-col justify-between rounded-sm border border-gold/40 bg-surface p-8 transition-all hover:border-gold hover:shadow-[0_0_24px_rgba(255,215,0,0.12)]"
          >
            <div>
              <h2 className="font-display text-3xl tracking-widest text-gold sm:text-4xl">{tile.label}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{tile.sub}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted/70">{tile.tagline}</span>
              <span className="font-display text-gold opacity-0 transition-opacity group-hover:opacity-100">→</span>
            </div>
          </Link>
        ))}

        {/* MEAL OF THE WEEK — honestly marked Coming Soon: no link, dimmed, no gold hover. */}
        <div
          aria-disabled="true"
          className="flex min-h-[220px] cursor-default flex-col justify-between rounded-sm border border-line bg-surface/50 p-8 opacity-60"
        >
          <div>
            <h2 className="font-display text-3xl tracking-widest text-muted sm:text-4xl">MEAL OF THE WEEK</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">Recipes, ingredient-scored</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-muted/70">Coming soon</span>
            <span className="rounded-sm border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted/60">
              Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
