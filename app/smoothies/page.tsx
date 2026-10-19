import type { Metadata } from "next";
import Link from "next/link";
import DrinksClient from "./DrinksClient";
import { DRINKS } from "./lib/drinkData";
import { PRODUCE } from "./lib/produceData";

export const metadata: Metadata = {
  title: "Smoothies & Juices — Gorilla Fuel",
  description:
    "37 smoothie and juice recipes with honest numbers: calories, protein, sugar and fibre per serving, a sugar flag on every drink, what the research actually supports, and medication cautions. Nutrients from Health Canada's Canadian Nutrient File.",
  alternates: { canonical: "/smoothies" },
};

export default function SmoothiesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FUEL</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        Smoothies <span className="text-gold">&amp; Juices</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/85">
        {DRINKS.length} drinks built from {PRODUCE.length} fruits, vegetables and herbs. Every recipe shows calories,
        protein, sugar and fibre per serving, a sugar flag, why the combination works for flavour and for nutrition, and
        any cautions. Health claims are worded as <em>associated with</em> or <em>supports</em> — never as treatment.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-foreground/75">
        Nutrient values come from Health Canada&apos;s Canadian Nutrient File. Blending keeps the fibre; juicing removes it
        and concentrates the sugar, which is why Canada&apos;s Food Guide recommends whole fruit and vegetables over juice
        and why every juice here carries a note. Sugar flags are our own convention: <strong>HIGH</strong> is 20 g or
        more per serving, <strong>moderate</strong> 12–19.9 g, <strong>low</strong> under 12 g.
      </p>

      <Link
        href="/smoothies/produce"
        className="group mt-6 flex items-center justify-between gap-3 rounded-sm border border-gold/40 bg-gold/[0.06] px-5 py-4 transition-colors hover:border-gold hover:bg-gold/10"
      >
        <span className="text-sm leading-snug text-foreground/85">
          <span className="font-display text-gold">Produce Guide.</span> What each fruit and vegetable actually does, how
          strong the evidence is, and who should check with a clinician first.
        </span>
        <span className="shrink-0 font-display text-gold transition-transform group-hover:translate-x-1">Browse →</span>
      </Link>

      <DrinksClient />

      <p className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-foreground/70">
        General information, not medical advice. If you take blood thinners, blood-pressure, diabetes or kidney
        medicines, or any medicine with a grapefruit warning, check with your pharmacist or doctor before changing what
        you drink. Ingredients may trigger food allergies. Cup measures are approximations; grams are what the numbers use.
      </p>
    </div>
  );
}
