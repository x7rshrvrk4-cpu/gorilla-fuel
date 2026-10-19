import type { Metadata } from "next";
import Link from "next/link";
import ProduceClient from "./ProduceClient";
import { PRODUCE } from "../lib/produceData";

export const metadata: Metadata = {
  title: "Produce Guide — Gorilla Fuel",
  description:
    "What 58 fruits, vegetables and herbs actually do: nutrients per 100 g from the Canadian Nutrient File, what the research supports, how strong the evidence is, and who should check with a clinician first.",
  alternates: { canonical: "/smoothies/produce" },
};

export default function ProducePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FUEL</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        Produce <span className="text-gold">Guide</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/85">
        {PRODUCE.length} fruits, vegetables and herbs with what the research actually supports. Most produce earns
        &ldquo;general fruit and vegetable evidence&rdquo; and nothing more — we only name a specific benefit where a
        study backs it, and we say how strong that study is. Where a food interacts with medicines or needs care, it says
        so.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-foreground/75">
        Numbers are per 100 g from Health Canada&apos;s Canadian Nutrient File. Back to the{" "}
        <Link href="/smoothies" className="text-gold underline hover:text-foreground">smoothie &amp; juice recipes</Link>.
      </p>
      <ProduceClient />
      <p className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-foreground/70">
        General information, not medical advice. Evidence ratings are a judgement from the cited sources; almost nothing
        earns &ldquo;strong&rdquo; except established nutrient roles and documented drug interactions.
      </p>
    </div>
  );
}
