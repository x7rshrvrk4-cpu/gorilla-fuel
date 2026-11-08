import type { Metadata } from "next";
import Link from "next/link";
import { getHeroStats } from "./lib/siteStats";
import CrossLinkBanner from "./components/CrossLinkBanner";
import UniversalSearch from "./components/UniversalSearch";
import { amazonUrl } from "./intel/lib/products";
import { getWeeklyPicks } from "./lib/weeklyPicks";
import { RECIPES, mealScore } from "./fitness/lib/recipes";
import { wineGorillaScore } from "./alcohol/lib/products";
import GorillaSpotlight from "./components/GorillaSpotlight";

export const metadata: Metadata = {
  description:
    "Canada's free barcode scanner for food, supplements and alcohol. Scan any product and get an instant no-BS health score. Scores you can't buy — just the data.",
  alternates: { canonical: "/" },
};

// ISR: hourly revalidation. The Picks / Category doors / Pillars are computed
// from in-memory data arrays, so the page is effectively static between builds.
export const revalidate = 3600;

// ── Category doors data ───────────────────────────────────────────────────────
const DOOR = {
  alcohol: { href: "/alcohol", label: "ALCOHOL", sub: "Beer · Wine · Seltzer · Non-Alcoholic", tagline: "15,000+ drinks in the database" },
  food: { href: "/approved", label: "FOOD & SNACKS", sub: "Approved · Cheat List · Stay Away · Kids · Beauty", tagline: "Scan anything instantly" },
  top: { href: "/top", label: "TOP RATED", sub: "Highest-scoring foods in the database, ranked live", tagline: "250+ foods ranked" },
  fitness: { href: "/fitness", label: "FITNESS", sub: "Macro calculator · BMR → TDEE → your daily calorie & protein targets", tagline: "Free tool" },
  supp: { href: "/rankings", label: "SUPPLEMENTS", sub: "Protein · Performance · Recovery · Vitamins", tagline: "150+ products ranked" },
};

function DoorCard({ door }: { door: { href: string; label: string; sub: string; tagline: string } }) {
  return (
    <Link
      href={door.href}
      className="group flex min-h-[220px] flex-col justify-between rounded-sm border border-gold/40 bg-surface p-8 transition-all hover:border-gold hover:shadow-[0_0_24px_rgba(255,215,0,0.12)]"
    >
      <div>
        <h2 className="font-display text-3xl tracking-widest text-gold sm:text-4xl">{door.label}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{door.sub}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-muted/85">{door.tagline}</span>
        <span className="font-display text-gold opacity-0 transition-opacity group-hover:opacity-100">→</span>
      </div>
    </Link>
  );
}

// ── Pillars data ──────────────────────────────────────────────────────────────
const PILLARS = [
  {
    title: "CANADIAN FIRST",
    body: "Built specifically for Beer Store and LCBO shoppers. Every product you actually buy in Ontario is in here.",
  },
  {
    title: "SCORES CAN'T BE BOUGHT",
    body: "Your Gorilla Score comes from the ingredients and the data — not a marketing budget. A brand can pay to spotlight a product, but it can never pay to change its score.",
  },
  {
    title: "15 DATA SOURCES",
    body: "Open Food Facts, USDA, Health Canada, WineAlign, Wine Spectator, and more. One scan pulls from all of them simultaneously.",
  },
];

const HERO_PILLS: { label: string; href: string }[] = [
  { label: "Beer", href: "/alcohol" },
  { label: "Wine", href: "/alcohol" },
  { label: "Supplements", href: "/rankings" },
  { label: "Food & snacks", href: "/approved" },
  { label: "Smoothies", href: "/smoothies" },
  { label: "Gluten free", href: "/glutenfree" },
  { label: "Holistic", href: "/holistic" },
];

export default async function Home() {
  const stats = await getHeroStats();
  const { alcohol: alcoholPick, food: foodPick, supp: suppPick, meal: mealPick, smoothie: smoothiePick, wine: winePick } = getWeeklyPicks();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero-glow relative border-b border-line">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 pb-10 pt-14 text-center sm:pt-20">
          <h1 className="font-display text-6xl leading-[0.95] text-foreground sm:text-7xl md:text-8xl">
            SCAN IT. SCORE IT.
            <br />
            <span className="gold-metal inline-block rounded px-[0.18em] pt-[0.06em] leading-none">KNOW IT.</span>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted sm:text-xl">
            Point your phone at any barcode for an honest, ad-free health score in seconds. Beer, wine, supplements and food.
          </p>

          {/* WHOLE-DATABASE LIVE SEARCH — curated catalogue + scanned cache.
              z-30 so the results dropdown (z-[9999] inside) paints over the
              category doors and picks below it. */}
          <div className="relative z-30 w-full max-w-xl">
            <UniversalSearch placeholder="Search a product or barcode" className="[&_input]:pr-12" />
            <Link
              href="/scan"
              aria-label="Scan a barcode with your camera"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm text-gold-dim hover:text-gold"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            <Link
              href="/scan"
              className="gold-metal gold-metal-btn rounded-sm px-9 py-4 font-display text-xl tracking-widest transition-opacity hover:opacity-90"
            >
              SCAN A PRODUCT
            </Link>
            <Link
              href="/explore"
              className="border-b-2 border-gold pb-0.5 font-display text-lg tracking-widest text-foreground hover:text-gold"
            >
              BROWSE RANKINGS →
            </Link>
          </div>

          <div className="flex max-w-xl flex-wrap justify-center gap-2">
            {HERO_PILLS.map((p) => (
              <Link
                key={p.href + p.label}
                href={p.href}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-foreground transition-colors hover:border-gold"
              >
                {p.label}
              </Link>
            ))}
          </div>

          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.12em] text-muted">
            <li>🍁 Made in Canada</li>
            <li>✓ Free, no account</li>
            <li>✓ Scores can&apos;t be bought</li>
          </ul>

          <dl className="mt-4 grid w-full max-w-3xl grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-3">
            <div className="flex flex-col-reverse gap-1">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">Wines searchable</dt>
              <dd className="font-display text-4xl text-foreground">{stats.wines.toLocaleString("en-CA")}+</dd>
            </div>
            {stats.products !== null && (
              <div className="flex flex-col-reverse gap-1">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">Products in the database</dt>
                <dd className="font-display text-4xl text-foreground">{stats.products.toLocaleString("en-CA")}+</dd>
              </div>
            )}
            <div className="col-span-2 flex flex-col-reverse gap-1 sm:col-span-1">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">Live data sources</dt>
              <dd className="font-display text-4xl text-foreground">{stats.sources}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── CATEGORY DOORS (order: Alcohol, Meal Finder, Food, Top Rated, Gluten Free, Fitness, Supplements) ── */}
      <section className="border-b border-line bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            <DoorCard door={DOOR.alcohol} />
            <Link
              href="/fitness/recipes"
              className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-sm border border-gold bg-gradient-to-br from-gold/15 to-gold/[0.03] p-8 transition-all hover:shadow-[0_0_28px_rgba(255,215,0,0.18)] lg:col-span-2"
            >
              <span className="absolute right-6 top-6 rounded-sm bg-gold px-2 py-0.5 font-display text-[10px] tracking-[0.2em] text-background">
                NEW
              </span>
              <div>
                <p className="font-display text-xs tracking-[0.3em] text-gold">🍳 GORILLA FITNESS</p>
                <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Meal Finder</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  Tell us what&apos;s in your fridge — we rank the healthy, high-protein meals you can make right now.
                  Every ingredient Gorilla-scored. Free, no account.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-muted/85">{RECIPES.length} recipes · scored</span>
                <span className="font-display text-gold transition-transform group-hover:translate-x-1">Find your meal →</span>
              </div>
            </Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DoorCard door={DOOR.food} />
            <DoorCard door={DOOR.top} />
          </div>

          {/* GLUTEN-FREE feature banner — surfaces the whole GF section (food + alcohol) */}
          <Link
            href="/glutenfree"
            className="group mt-4 flex flex-col justify-between gap-4 overflow-hidden rounded-sm border border-green-500/50 bg-gradient-to-br from-green-500/15 to-green-500/[0.03] p-8 transition-all hover:shadow-[0_0_28px_rgba(34,197,94,0.18)] sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-display text-xs tracking-[0.3em] text-green-400">🌾 GLUTEN-FREE, FOR REAL</p>
              <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">The whole gluten-free guide</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                Celiac-safe beer, cider &amp; 230 gluten-free drinks — plus GF breads, pastas, snacks &amp; flours,
                each scored with buy links. Gluten-free ≠ healthy; we show you which is which.
              </p>
            </div>
            <span className="shrink-0 font-display text-green-400 transition-transform group-hover:translate-x-1">
              Explore →
            </span>
          </Link>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DoorCard door={DOOR.fitness} />
            <DoorCard door={DOOR.supp} />
          </div>

          {/* BUDGET PLANNER feature banner */}
          <Link
            href="/planner"
            className="group mt-4 flex flex-col justify-between gap-4 overflow-hidden rounded-sm border border-gold/60 bg-gradient-to-br from-gold/15 to-gold/[0.03] p-8 transition-all hover:shadow-[0_0_28px_rgba(255,215,0,0.18)] sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-display text-xs tracking-[0.3em] text-gold">🛒 BUDGET MEAL PLANNER · NEW</p>
              <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Your budget in, a week of meals out</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                Enter what you can spend, how many days and how many people. We pick the highest-scoring recipes that fit,
                and build one grocery list with estimated costs from Ontario prices.
              </p>
            </div>
            <span className="shrink-0 font-display text-gold transition-transform group-hover:translate-x-1">Plan my week →</span>
          </Link>

          {/* HOLISTIC NUTRITION feature banner */}
          <Link
            href="/holistic"
            className="group mt-4 flex flex-col justify-between gap-4 overflow-hidden rounded-sm border border-sky-500/50 bg-gradient-to-br from-sky-500/15 to-sky-500/[0.03] p-8 transition-all hover:shadow-[0_0_28px_rgba(14,165,233,0.18)] sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-display text-xs tracking-[0.3em] text-sky-400">🌿 HOLISTIC NUTRITION</p>
              <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">What the research actually supports</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                18 vitamins and minerals, 24 foods and 4 herbs — every claim labelled by strength of evidence, with food
                sources, who is at risk, and medication cautions.
              </p>
            </div>
            <span className="shrink-0 font-display text-sky-400 transition-transform group-hover:translate-x-1">Explore →</span>
          </Link>

          {/* SMOOTHIES & JUICES feature banner */}
          <Link
            href="/smoothies"
            className="group mt-4 flex flex-col justify-between gap-4 overflow-hidden rounded-sm border border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.03] p-8 transition-all hover:shadow-[0_0_28px_rgba(16,185,129,0.18)] sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-display text-xs tracking-[0.3em] text-emerald-400">🥤 SMOOTHIES &amp; JUICES</p>
              <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Honest numbers on every drink</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                37 recipes with calories, protein, sugar and fibre per serving, a sugar flag, and what the research
                actually supports — plus a guide to 58 fruits, vegetables and herbs.
              </p>
            </div>
            <span className="shrink-0 font-display text-emerald-400 transition-transform group-hover:translate-x-1">Explore →</span>
          </Link>
        </div>
      </section>

      {/* ── GORILLA SPOTLIGHT (paid, labeled; renders only when a sponsor is active) ── */}
      <GorillaSpotlight />

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
            Six rotating picks: alcohol, wine, food, meal, smoothie and supplement. New picks every Monday.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Alcohol pick */}
            {alcoholPick && (
              <div className="gorilla-card flex flex-col rounded-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-sm border border-amber-600/40 bg-amber-50 px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.2em] text-amber-400">
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
                    <span className="inline-flex rounded-sm border border-emerald-600/40 bg-emerald-50 px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.2em] text-emerald-400">
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
                    <span className="inline-flex rounded-sm border border-blue-600/40 bg-blue-50 px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.2em] text-blue-400">
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

            {/* Wine pick */}
            {winePick && (
              <div className="gorilla-card flex flex-col rounded-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-sm border border-rose-600/40 bg-rose-50 px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.2em] text-rose-400">
                      Wine
                    </span>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-foreground">{winePick.name}</h3>
                    <p className="text-sm text-muted">{[winePick.varietal, winePick.region].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-4xl leading-none text-emerald-400">{wineGorillaScore(winePick)}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted">/ 100</p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {winePick.caloriesPerCan} kcal and {winePick.sugarPerCan} g sugar per 148 mL pour
                  {winePick.wineQuality ? `, and a critic score of ${winePick.wineQuality}${winePick.wineQualitySource ? ` (${winePick.wineQualitySource})` : ""}` : ""}.
                  Chosen because it scores well on both nutrition and quality.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-gold">
                    🦍 Gorilla Sweet Spot
                  </span>
                  <Link href={`/alcohol?p=${winePick.id}`} className="ml-auto font-display text-xs tracking-widest text-gold hover:underline">
                    See this wine →
                  </Link>
                </div>
              </div>
            )}

            {/* Meal pick */}
            {mealPick && (
              <div className="gorilla-card flex flex-col rounded-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-sm border border-orange-600/40 bg-orange-50 px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.2em] text-orange-400">
                      Meal
                    </span>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-foreground">{mealPick.title}</h3>
                    <p className="text-sm text-muted capitalize">
                      {mealPick.mealType} · {mealPick.timeMin} min · {mealPick.macros.calories} kcal · {mealPick.macros.protein} g protein
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-4xl leading-none text-emerald-400">{mealScore(mealPick)}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted">/ 100</p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{mealPick.gorillaNote}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-gold">
                    🦍 Gorilla Verified
                  </span>
                  <Link href="/planner" className="ml-auto font-display text-xs tracking-widest text-gold hover:underline">
                    Plan your week →
                  </Link>
                </div>
              </div>
            )}

            {/* Smoothie pick */}
            {smoothiePick && (
              <div className="gorilla-card flex flex-col rounded-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-sm border border-fuchsia-600/40 bg-fuchsia-50 px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.2em] text-fuchsia-400">
                      Smoothie
                    </span>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-foreground">{smoothiePick.name}</h3>
                    <p className="text-sm text-muted">
                      {smoothiePick.perServing.kcal} kcal · {smoothiePick.perServing.protein} g protein · {smoothiePick.perServing.sugar} g sugar
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-2xl leading-none text-emerald-400 capitalize">{smoothiePick.sugarFlag}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted">Sugar</p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{smoothiePick.flavour}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-gold">
                    🦍 Gorilla Verified
                  </span>
                  <Link href="/smoothies" className="ml-auto font-display text-xs tracking-widest text-gold hover:underline">
                    See all smoothies →
                  </Link>
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
