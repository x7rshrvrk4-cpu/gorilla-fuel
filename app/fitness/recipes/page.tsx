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
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/85">
        Pick what&apos;s in your fridge and pantry — we&apos;ll rank {RECIPES.length} healthy, high-protein meals by how
        much you can make right now. Every recipe is built around Gorilla-scored whole foods. No AI bill, no account,
        nothing leaves your device.
      </p>

      <p className="mt-3 text-xs leading-relaxed text-foreground/75">
        Each meal gets a <span className="text-gold">Gorilla Meal Score</span>{" "}out of 100 — a blend of every
        ingredient&apos;s Gorilla score (whole foods score high, refined/fried ones drag it down) and its protein
        balance. It&apos;s why a turkey burger with potatoes and broccoli rates far above a burger, fries and a salad.
      </p>
      <p className="mt-2 text-xs text-foreground/75">
        Chasing a target too? Run the{" "}
        <Link href="/fitness" className="text-gold underline hover:text-foreground">macro calculator</Link>{" "}
        first, then build your day from these.
      </p>

      {/* Recipe Scorer cross-link */}
      <Link
        href="/fitness/recipe-scorer"
        className="group mt-6 flex items-center justify-between gap-3 rounded-sm border border-gold/40 bg-gold/[0.06] px-5 py-4 transition-colors hover:border-gold hover:bg-gold/10"
      >
        <span className="text-sm leading-snug text-foreground/85">
          <span className="font-display text-gold">Have your own recipe?</span> Build it ingredient-by-ingredient and get
          its Gorilla Meal Score — plus a grocery list. Save it to your collection.
        </span>
        <span className="shrink-0 font-display text-gold transition-transform group-hover:translate-x-1">Score it →</span>
      </Link>

      <RecipesClient />
    </div>
  );
}
