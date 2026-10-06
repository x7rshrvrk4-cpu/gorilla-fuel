import type { Metadata } from "next";
import Link from "next/link";
import RecipesClient from "./RecipesClient";
import { RECIPES } from "../lib/recipes";

export const metadata: Metadata = {
  title: "Meal Finder — Gorilla Fuel",
  description:
    "Tell us what's in your kitchen and get healthy, high-protein meals you can make right now — ranked by what you have, built around Gorilla-scored whole foods. Free, no account, nothing leaves your device.",
  alternates: { canonical: "/fitness/recipes" },
};

export default function RecipesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FITNESS</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        Meal <span className="text-gold">Finder</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        Pick what&apos;s in your fridge and pantry — we&apos;ll rank {RECIPES.length} healthy, high-protein meals by how
        much you can make right now. Every recipe is built around Gorilla-scored whole foods. No AI bill, no account,
        nothing leaves your device.
      </p>

      <p className="mt-3 text-xs leading-relaxed text-muted/70">
        Each meal gets a <span className="text-gold">Gorilla Meal Score</span> out of 100 — a blend of every
        ingredient&apos;s Gorilla score (whole foods score high, refined/fried ones drag it down) and its protein
        balance. It&apos;s why a turkey burger with potatoes and broccoli rates far above a burger, fries and a salad.
      </p>
      <p className="mt-2 text-xs text-muted/70">
        Chasing a target too? Run the{" "}
        <Link href="/fitness" className="text-gold underline hover:text-foreground">macro calculator</Link>{" "}
        first, then build your day from these.
      </p>

      <RecipesClient />
    </div>
  );
}
