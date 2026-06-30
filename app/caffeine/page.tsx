import type { Metadata } from "next";
import CaffeineClient from "./CaffeineClient";

export const metadata: Metadata = {
  title: "Caffeine Half-Life Calculator — Gorilla Fuel",
  description:
    "Free caffeine half-life calculator — log your drinks, set your half-life, and see a decay curve with the time your caffeine drops below the sleep threshold. Uses Gorilla Fuel's verified Canadian energy-drink caffeine data.",
  alternates: { canonical: "/caffeine" },
};

export default function CaffeinePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA CAFFEINE</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        Half-Life <span className="text-gold">Calculator</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        Log what you drank and when, set your personal half-life, and see exactly how much caffeine is
        still in your system at bedtime — with the time it finally clears the sleep threshold.
      </p>
      <CaffeineClient />
    </div>
  );
}
