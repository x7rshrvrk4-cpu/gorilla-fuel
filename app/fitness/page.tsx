import type { Metadata } from "next";
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
        Staying healthy, <span className="text-gold">as easy as 1 → 6</span>.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        Six steps: find a meal, pick a plan, learn your numbers, then hit them. Each one explains itself — tap the{" "}
        <span className="text-gold">+</span> to open the actual tool. Every number is an estimate from your own inputs,
        and nothing leaves your device.
      </p>

      <FitnessClient />
    </div>
  );
}
