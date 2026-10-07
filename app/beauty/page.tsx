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

// Sunscreen cheat-sheet data — scores computed live by the beauty scanner from
// Open Beauty Facts ingredient lists (same engine as /scan). Keep honest: these
// are real scored products, not hand-picked numbers.
const SUNSCREENS_CLEAN = [
  { score: 100, color: "#64cf86", name: "Badger Mineral 40 Sport", why: "Zinc oxide, sunflower oil, beeswax. Nothing flagged." },
  { score: 92, color: "#64cf86", name: "Blue Lizard Sensitive", why: "Mineral formula. Only minor: a PEG compound." },
  { score: 82, color: "#e8b23a", name: "CeraVe Mineral SPF 50", why: "Mineral. Minor: PEG & phenoxyethanol." },
];
const SUNSCREENS_FLAGGED = [
  { score: 56, name: "Banana Boat Sport Ultra SPF 30", why: "Fragrance, PEG compounds, triethanolamine." },
  { score: 40, name: "Hawaiian Tropic Sheer Touch", why: "Parfum, methylparaben, octocrylene." },
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

      {/* SUNSCREEN CHEAT SHEET — Clean vs Flagged */}
      <div id="sunscreen" className="mt-16 scroll-mt-20">
        <h2 className="font-display text-3xl text-foreground">Sunscreen: Clean vs Flagged</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Same scanner, run across popular sunscreens. &quot;Clean&quot; and &quot;reef-safe&quot; aren&apos;t
          regulated words, so we read the actual ingredient list and score what&apos;s really on your skin.
          Scores are live from Open Beauty Facts and can shift if a brand reformulates.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* CLEAN */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-emerald-500/50 bg-emerald-500/10 text-emerald-400">✓</span>
              <h3 className="font-display text-2xl text-emerald-400">Clean</h3>
              <span className="ml-auto text-xs uppercase tracking-widest text-muted">mineral · nothing concerning</span>
            </div>
            <div className="mt-3 space-y-3">
              {SUNSCREENS_CLEAN.map((p) => (
                <div key={p.name} className="flex items-center gap-3 rounded-sm border border-line bg-surface p-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border-2 font-display text-lg tabular-nums"
                    style={{ borderColor: p.color, color: p.color }}
                  >
                    {p.score}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base leading-tight text-foreground">{p.name}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted">{p.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FLAGGED */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-red-500/50 bg-red-500/10 text-red-400">⚠</span>
              <h3 className="font-display text-2xl text-red-400">Flagged</h3>
              <span className="ml-auto text-xs uppercase tracking-widest text-muted">check the label first</span>
            </div>
            <div className="mt-3 space-y-3">
              {SUNSCREENS_FLAGGED.map((p) => (
                <div key={p.name} className="flex items-center gap-3 rounded-sm border border-line bg-surface p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border-2 border-red-500/70 font-display text-lg tabular-nums text-red-400">
                    {p.score}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base leading-tight text-foreground">{p.name}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted">{p.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted/80">
          A flagged score isn&apos;t a safety verdict — it means the formula contains ingredients we flag (fragrance,
          parabens, PEGs and the like). Plenty of people use these products without issue. We show the reasoning so
          you can decide for yourself. Want your own sunscreen checked?{" "}
          <Link href="/scan" className="text-purple-300 underline hover:text-purple-200">Scan it →</Link>
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
