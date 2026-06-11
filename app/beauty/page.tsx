import type { Metadata } from "next";
import Link from "next/link";
import CrossLinkBanner from "../components/CrossLinkBanner";

export const metadata: Metadata = {
  title: "Beauty & Personal Care Scanner — Gorilla Fuel",
  description:
    "Scan any shampoo, moisturizer, makeup, sunscreen or personal care product for an instant ingredient check — parabens, sulphates, endocrine disruptors and more.",
};

const FLAGGED = [
  {
    name: "Parabens",
    detail: "Methylparaben, propylparaben, butylparaben, ethylparaben.",
  },
  {
    name: "Sulphates",
    detail: "Sodium lauryl sulphate, sodium laureth sulphate.",
  },
  {
    name: "Endocrine disruptors",
    detail: "Oxybenzone, BHA, BHT, triclosan.",
  },
  {
    name: "Artificial fragrance & parfum",
    detail: "Catch-all terms that can hide hundreds of undisclosed compounds.",
  },
  {
    name: "PEG compounds",
    detail: "Penetration enhancers that may carry contaminants.",
  },
  {
    name: "Formaldehyde-releasing preservatives",
    detail: "Slow-release preservatives flagged across evidence tiers.",
  },
];

export default function BeautyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-purple-400">
        GORILLA FUEL BEAUTY
      </p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
        Beauty &amp; Personal Care <span className="text-purple-400">Scanner</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Point your camera at any shampoo, moisturizer, makeup, sunscreen or
        personal care product and get an instant ingredient check.
      </p>

      {/* SCAN BUTTON */}
      <div className="mt-8">
        <Link
          href="/scan"
          className="pulse-glow inline-block rounded-sm bg-gold px-12 py-5 text-center font-display text-2xl tracking-widest text-background transition-transform hover:scale-105"
        >
          Scan a Beauty Product →
        </Link>
        <p className="mt-3 text-xs text-muted">
          Beauty mode activates automatically when a cosmetic barcode is
          detected — you&apos;ll see the purple <span className="text-purple-400">BEAUTY PRODUCT</span> banner
          instead of the gold food banner.
        </p>
      </div>

      {/* WHAT WE FLAG */}
      <div className="mt-14">
        <h2 className="font-display text-3xl text-foreground">What We Flag</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          The Gorilla Fuel beauty scanner checks your personal care products
          against Open Beauty Facts — a global database of cosmetic and
          personal care ingredients.
        </p>
        <div className="mt-5 grid gap-px overflow-hidden rounded-sm border border-purple-900/50 bg-purple-900/30 sm:grid-cols-2">
          {FLAGGED.map((item) => (
            <div key={item.name} className="bg-surface p-5">
              <h3 className="font-display text-xl text-purple-300">{item.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Ingredients are graded with the same evidence tier system used for
          food — <span className="text-foreground">Strong Consensus</span>,{" "}
          <span className="text-foreground">Emerging</span>,{" "}
          <span className="text-foreground">Contested</span>, and{" "}
          <span className="text-foreground">Precautionary</span>.
        </p>
      </div>

      {/* DATA COVERAGE NOTE */}
      <div className="mt-10 rounded-sm border border-purple-500/40 bg-purple-950/30 px-5 py-4">
        <p className="text-sm leading-relaxed text-purple-200/90">
          <span className="font-display tracking-wide text-purple-300">⚠ DATA COVERAGE — </span>
          Beauty product data comes from Open Beauty Facts, a community
          maintained database. Coverage varies by product. Canadian personal
          care products are not required to disclose all ingredients in the
          same way food products are. Always verify ingredients on the product
          label.
        </p>
      </div>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
    </div>
  );
}
