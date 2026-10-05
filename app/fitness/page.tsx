import type { Metadata } from "next";
import Link from "next/link";
import FitnessClient from "./FitnessClient";

export const metadata: Metadata = {
  title: "Fitness Calculator — Gorilla Fuel",
  description:
    "Free BMR → TDEE → goal → macro calculator (Mifflin-St Jeor). Get your daily calorie and protein targets, then scan products to hit them — and see the cleanest scored protein powders.",
  alternates: { canonical: "/fitness" },
};

export default function FitnessPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FITNESS</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        Macro <span className="text-gold">Calculator</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        Mifflin-St Jeor BMR → TDEE → goal → macros. Get your daily calorie and protein targets,
        then scan products to hit them. Nothing leaves your device — your numbers are saved locally.
      </p>

      <Link
        href="/fitness/recipes"
        className="mt-6 flex items-center justify-between gap-3 rounded-sm border border-gold/40 bg-gold/[0.06] px-4 py-3 transition-colors hover:border-gold hover:bg-gold/10"
      >
        <span>
          <span className="font-display text-sm tracking-[0.15em] text-gold">🍳 MEAL FINDER</span>
          <span className="mt-0.5 block text-xs text-muted">
            Got ingredients but no plan? See what healthy meals you can make right now.
          </span>
        </span>
        <span className="shrink-0 font-display text-gold">→</span>
      </Link>

      <FitnessClient />
    </div>
  );
}
