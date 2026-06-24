import type { Metadata } from "next";
import Link from "next/link";
import StatsTicker from "./components/StatsTicker";
import CrossLinkBanner from "./components/CrossLinkBanner";
import UniversalSearch from "./components/UniversalSearch";
import { ALCOHOL_PRODUCTS } from "./alcohol/lib/products";
import { INTEL_APPROVED, amazonUrl } from "./intel/lib/products";
import { PRODUCTS, GRADE_RANK } from "./rankings/lib/products";

export const metadata: Metadata = {
  description:
    "Canada's free barcode scanner for food, supplements and alcohol. Scan any product and get an instant no-BS health score. No ads. No sponsors. Just data.",
  alternates: { canonical: "/" },
};

// ISR: hourly revalidation. The Picks / Category doors / Pillars are computed
// from in-memory data arrays, so the page is effectively static between builds.
export const revalidate = 3600;

// ── Auto picks — computed server-side from live data arrays ──────────────────

/** Alcohol pick: highest gorillaPour, non-alcoholic excluded, lowest cal as tiebreaker. */
function getAlcoholPick() {
  return [...ALCOHOL_PRODUCTS]
    .filter(
      (p) =>
        p.category !== "Non-Alcoholic" &&
        p.gorillaPour >= 4 &&
        !!p.gorillaAnalysis
    )
    .sort(
      (a, b) =>
        b.gorillaPour - a.gorillaPour || (a.caloriesPerCan ?? 0) - (b.caloriesPerCan ?? 0)
    )[0];
}

/** Food pick: highest score in Gorilla Approved. */
function getFoodPick() {
  return [...INTEL_APPROVED].sort((a, b) => b.score - a.score)[0];
}

/** Supplement pick: best grade first, then highest purity score. */
function getSuppPick() {
  return [...PRODUCTS].sort(
    (a, b) =>
      GRADE_RANK[b.grade] - GRADE_RANK[a.grade] ||
      b.purityScore - a.purityScore
  )[0];
}

// ── Category doors data ───────────────────────────────────────────────────────
const DOORS = [
  {
    href: "/alcohol",
    label: "ALCOHOL",
    sub: "Beer · Wine · Seltzer · Non-Alcoholic",
    tagline: "500+ products scored",
  },
  {
    href: "/approved",
    label: "FOOD & SNACKS",
    sub: "Approved · Cheat List · Stay Away · Kids · Gluten Free",
    tagline: "Scan anything instantly",
  },
  {
    href: "/rankings",
    label: "SUPPLEMENTS",
    sub: "Protein · Performance · Recovery · Vitamins",
    tagline: "150+ products ranked",
  },
  {
    href: "/top",
    label: "TOP RATED",
    sub: "Highest-scoring foods in the database, ranked live",
    tagline: "250+ foods ranked",
  },
];

// ── Pillars data ──────────────────────────────────────────────────────────────
const PILLARS = [
  {
    title: "CANADIAN FIRST",
    body: "Built specifically for Beer Store and LCBO shoppers. Every product you actually buy in Ontario is in here.",
  },
  {
    title: "NO BRAND PAYS FOR PLACEMENT",
    body: "Your Gorilla Score is based on ingredients, not marketing budgets. It has never been any other way and it never will be.",
  },
  {
    title: "15 DATA SOURCES",
    body: "Open Food Facts, USDA, Health Canada, WineAlign, Wine Spectator, and more. One scan pulls from all of them simultaneously.",
  },
];

export default function Home() {
  const alcoholPick = getAlcoholPick();
  const foodPick = getFoodPick();
  const suppPick = getSuppPick();

  return (
    <>
      {/* STATS TICKER */}
      <StatsTicker />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-line bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,215,0,0.08),_transparent_60%)]" />
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center sm:py-32">
          <h1 className="font-display text-6xl leading-[0.9] text-gold sm:text-8xl md:text-9xl">
            SCAN IT.<br />SCORE IT.<br />KNOW IT.
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted sm:text-xl">
            Free Canadian product intelligence for beer, wine, supplements and
            food. No brand pays for placement. Ever.
          </p>

          {/* WHOLE-DATABASE LIVE SEARCH — curated catalogue + scanned cache.
              z-30 so the results dropdown (z-[9999] inside) paints over the
              category doors and picks below it. */}
          <div className="relative z-30 w-full max-w-lg">
            <UniversalSearch placeholder="Search any product by name, brand, or barcode…" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/scan"
              className="rounded-sm bg-gold px-8 py-4 font-display text-xl tracking-widest text-background transition-opacity hover:opacity-90"
            >
              SCAN A PRODUCT
            </Link>
            <Link
              href="/explore"
              className="rounded-sm border border-gold px-8 py-4 font-display text-xl tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
            >
              BROWSE RANKINGS
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORY DOORS ───────────────────────────────────────────────── */}
      <section className="border-b border-line bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DOORS.map((door) => (
              <Link
                key={door.href}
                href={door.href}
                className="group flex min-h-[220px] flex-col justify-between rounded-sm border border-gold/40 bg-surface p-8 transition-all hover:border-gold hover:shadow-[0_0_24px_rgba(255,215,0,0.12)]"
              >
                <div>
                  <h2 className="font-display text-3xl tracking-widest text-gold sm:text-4xl">
                    {door.label}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {door.sub}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted/70">
                    {door.tagline}
                  </span>
                  <span className="font-display text-gold opacity-0 transition-opacity group-hover:opacity-100">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── THIS WEEK'S GORILLA PICKS ─────────────────────────────────────── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <p className="font-display text-sm tracking-[0.3em] text-gold">
            HAND-PICKED BY GORILLA FUEL
          </p>
          <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
            This Week&apos;s Gorilla Picks
          </h2>
          <p className="mt-3 text-sm text-muted">
            Our top editorial pick in each category.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {/* Alcohol pick */}
            {alcoholPick && (
              <div className="gorilla-card flex flex-col rounded-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-sm border border-amber-600/40 bg-amber-900/20 px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.2em] text-amber-400">
                      Alcohol
                    </span>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-foreground">
                      {alcoholPick.name}
                    </h3>
                    <p className="text-sm text-muted">{alcoholPick.brand}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-4xl text-gold leading-none">
                      {alcoholPick.gorillaPour}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted">
                      / 5 Pour
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {alcoholPick.gorillaAnalysis}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-gold">
                    🦍 Gorilla Verified
                  </span>
                  <Link
                    href="/alcohol"
                    className="ml-auto font-display text-xs tracking-widest text-gold hover:underline"
                  >
                    See all alcohol →
                  </Link>
                </div>
              </div>
            )}

            {/* Food pick */}
            {foodPick && (
              <div className="gorilla-card flex flex-col rounded-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-sm border border-emerald-600/40 bg-emerald-900/20 px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                      Food
                    </span>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-foreground">
                      {foodPick.name}
                    </h3>
                    <p className="text-sm text-muted">{foodPick.brand}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`font-display text-4xl leading-none ${
                        foodPick.score >= 70
                          ? "text-emerald-400"
                          : foodPick.score >= 50
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {foodPick.score}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted">
                      / 100
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {foodPick.blurb}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-gold">
                    🦍 Gorilla Verified
                  </span>
                  {foodPick.amazonQuery && (
                    <a
                      href={amazonUrl(foodPick.amazonQuery)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="ml-auto font-display text-xs tracking-widest text-gold hover:underline"
                    >
                      Buy on Amazon →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Supplement pick */}
            {suppPick && (
              <div className="gorilla-card flex flex-col rounded-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-sm border border-blue-600/40 bg-blue-900/20 px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.2em] text-blue-400">
                      Supplement
                    </span>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-foreground">
                      {suppPick.name}
                    </h3>
                    <p className="text-sm text-muted">{suppPick.brand}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-4xl leading-none text-emerald-400">
                      {suppPick.grade}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted">
                      Grade
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {suppPick.analysis}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-gold">
                    🦍 Gorilla Verified
                  </span>
                  <a
                    href={`https://www.amazon.ca/s?k=${encodeURIComponent(suppPick.brand + " " + suppPick.name)}&tag=gorillafuel-20`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="ml-auto font-display text-xs tracking-widest text-gold hover:underline"
                  >
                    Buy on Amazon →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="grid gap-0 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {PILLARS.map((p) => (
              <div key={p.title} className="px-0 py-8 sm:px-8 sm:py-0">
                <h3 className="font-display text-2xl leading-tight text-gold sm:text-3xl">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCAN ANYTHING CALLOUT ─────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <h2 className="font-display text-5xl text-foreground sm:text-6xl md:text-7xl">
            SCAN ANYTHING
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Point your camera at any barcode on any beer can, wine bottle,
            supplement tub, or food package and get an instant Gorilla Score.
            Free. No account needed. No app to download. Works on any phone
            browser.
          </p>
          <Link
            href="/scan"
            className="mt-8 inline-block rounded-sm bg-gold px-10 py-5 font-display text-2xl tracking-widest text-background transition-opacity hover:opacity-90"
          >
            SCAN A PRODUCT
          </Link>
        </div>
      </section>

      <CrossLinkBanner />
    </>
  );
}
