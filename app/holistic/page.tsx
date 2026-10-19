import type { Metadata } from "next";
import Link from "next/link";
import HolisticClient from "./HolisticClient";
import { NUTRIENTS, FOODS, HERBS } from "./lib/holisticData";

export const metadata: Metadata = {
  title: "Holistic Nutrition Guide — Gorilla Fuel",
  description:
    "Vitamins, minerals, foods and herbs with evidence labels on every claim: what the research supports, where each nutrient comes from, who is at risk of low intake, and medication cautions. Sourced from NIH, Harvard, Health Canada and the European Medicines Agency.",
  alternates: { canonical: "/holistic" },
};

export default function HolisticPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FUEL</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        Holistic <span className="text-gold">Nutrition Guide</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/85">
        {NUTRIENTS.length} vitamins and minerals, {FOODS.length} foods and {HERBS.length} herbs. Every claim carries an
        evidence label, so you can tell a well-established nutrient role from a hopeful headline. Where research shows no
        benefit, or a higher risk in some groups, we say so.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-foreground/75">
        Wording is <em>associated with</em> or <em>supports</em> — nothing here is a treatment or a cure. Evidence labels
        are our judgement from the cited pages, not an official grade. Looking for fruit and vegetable profiles? See the{" "}
        <Link href="/smoothies/produce" className="text-gold underline hover:text-foreground">Produce Guide</Link>.
      </p>
      <HolisticClient />
      <p className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-foreground/70">
        General information, not medical advice. Supplement doses, pregnancy, kidney disease and medicines change what is
        safe for you — talk to your doctor or pharmacist before starting a supplement or changing your diet for a health
        condition.
      </p>
    </div>
  );
}
