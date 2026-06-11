"use client";

import { useState } from "react";
import CrossLinkBanner from "../components/CrossLinkBanner";
import {
  KIDS_APPROVED,
  KIDS_CHEAT,
  KIDS_STAY_AWAY,
  PAIRINGS,
  amazonUrl,
  type KidsProduct,
  type KidsTier,
} from "./lib/products";

type AllergenKey = "all" | "nut-free" | "dairy-free" | "gluten-free" | "egg-free" | "soy-free";

const ALLERGEN_FILTERS: { key: AllergenKey; label: string; field?: keyof KidsProduct }[] = [
  { key: "all", label: "All" },
  { key: "nut-free", label: "Nut Free", field: "nutFree" },
  { key: "dairy-free", label: "Dairy Free", field: "dairyFree" },
  { key: "gluten-free", label: "Gluten Free", field: "glutenFree" },
  { key: "egg-free", label: "Egg Free", field: "eggFree" },
  { key: "soy-free", label: "Soy Free", field: "soyFree" },
];

const TABS: { key: KidsTier; label: string; count: number }[] = [
  { key: "approved", label: "Kids Approved", count: KIDS_APPROVED.length },
  { key: "cheat", label: "Cheat List", count: KIDS_CHEAT.length },
  { key: "stay-away", label: "Stay Away", count: KIDS_STAY_AWAY.length },
];

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-green-400";
  if (score >= 30) return "text-amber-400";
  return "text-red-400";
}

function Badge({ kind }: { kind: "school-safe" | "canadian" | "nut-free" | "artificial" | "toddler" }) {
  switch (kind) {
    case "school-safe":
      return (
        <span className="inline-flex items-center rounded-sm border border-emerald-600/60 bg-emerald-800/20 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-emerald-300">
          ✓ School Safe
        </span>
      );
    case "canadian":
      return (
        <span className="inline-flex items-center gap-1 rounded-sm border border-red-600/60 bg-red-900/25 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-red-300">
          🍁 Canadian
        </span>
      );
    case "nut-free":
      return (
        <span className="inline-flex items-center rounded-sm border border-sky-600/50 bg-sky-800/20 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-sky-300">
          Nut Free
        </span>
      );
    case "artificial":
      return (
        <span className="inline-flex items-center rounded-sm border border-amber-500/60 bg-amber-900/30 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-amber-300">
          ⚠ Artificial Colours
        </span>
      );
    case "toddler":
      return (
        <span className="inline-flex items-center rounded-sm border border-sky-400/50 bg-sky-400/10 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-sky-200">
          Toddler Friendly
        </span>
      );
  }
}

function KidsCard({ product, tier }: { product: KidsProduct; tier: KidsTier }) {
  const hasMacros = product.calories !== undefined;
  return (
    <div className="gorilla-card rounded-sm p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-2xl leading-tight text-foreground">{product.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {product.schoolSafe && <Badge kind="school-safe" />}
            {product.canadian && <Badge kind="canadian" />}
            {product.nutFree && <Badge kind="nut-free" />}
            {product.toddlerFriendly && <Badge kind="toddler" />}
            {product.artificialColours && <Badge kind="artificial" />}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Gorilla Score</p>
          <p className={`font-display text-4xl ${scoreColor(product.score)}`}>{product.score}</p>
        </div>
      </div>

      {hasMacros && (
        <div className="mt-3 grid grid-cols-4 gap-3 border-t border-line pt-3 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Calories</p>
            <p className="mt-0.5 font-display text-lg text-foreground">{product.calories}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Carbs</p>
            <p className="mt-0.5 font-display text-lg text-foreground">{product.carbs}g</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Sugar</p>
            <p className="mt-0.5 font-display text-lg text-foreground">{product.sugar}g</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Protein</p>
            <p className="mt-0.5 font-display text-lg text-foreground">{product.protein}g</p>
          </div>
        </div>
      )}

      <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-muted">{product.blurb}</p>

      {product.betterAlternative && (
        <p className="mt-2 text-sm">
          <span className="text-[11px] uppercase tracking-[0.15em] text-emerald-400">Better alternative: </span>
          <span className="text-foreground">{product.betterAlternative}</span>
        </p>
      )}

      {tier !== "stay-away" && product.amazonQuery && (
        <a
          href={amazonUrl(product.amazonQuery)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-4 inline-block rounded-sm border border-gold-dim px-4 py-2 font-display text-sm tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-background"
        >
          Buy on Amazon.ca ↗
        </a>
      )}
    </div>
  );
}

const EDUCATION = [
  {
    title: "Synthetic Dyes in Canada",
    body: "Red 40, Yellow 5, Yellow 6, Blue 1 and Blue 2 are still permitted by Health Canada, but a ban is in progress — Health Canada announced it is prioritizing removal of Red 40 from Canadian foods. Many Canadian brands have already voluntarily removed synthetic dyes: Canadian Froot Loops uses fruit-based colours while the US version uses synthetic dyes. Gorilla Fuel flags products that still contain synthetic dyes so you can make an informed choice while Health Canada completes its review.",
  },
  {
    title: "High Fructose Corn Syrup",
    body: "Metabolises differently from regular sugar. Found in many snacks specifically marketed to children. Look for it under the name glucose-fructose on Canadian labels.",
  },
  {
    title: "The School Safe Question",
    body: "With over 3% of Canadian children having peanut allergies, many schools are nut free. Look for the Gorilla Fuel SCHOOL SAFE badge, which indicates the product is free from peanuts and tree nuts.",
  },
  {
    title: "The Health Halo Trap",
    body: "Many kids snacks use words like natural, organic, fruit and wholesome on packaging while containing synthetic dyes and high sugar. The Gorilla Score cuts through the marketing and scores what is actually in the ingredient list, not what is on the front of the box.",
  },
];

export default function KidsPage() {
  const [tab, setTab] = useState<KidsTier>("approved");
  const [allergen, setAllergen] = useState<AllergenKey>("all");

  const allProducts =
    tab === "approved" ? KIDS_APPROVED : tab === "cheat" ? KIDS_CHEAT : KIDS_STAY_AWAY;
  const activeFilter = ALLERGEN_FILTERS.find((f) => f.key === allergen);
  const products =
    activeFilter?.field
      ? allProducts.filter((p) => p[activeFilter.field as keyof KidsProduct] === true)
      : allProducts;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FUEL KIDS</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          Scan for your kids.
        </h1>
        <p className="mt-4 text-muted">
          Parents scan products for themselves. Now scan for your kids. The same
          data-driven Gorilla standard applied to the snacks in their lunchbox.
          No cartoon character on the packaging changes what is in the
          ingredients list. All products on this page are manually curated and
          verified. No brand pays for placement.
        </p>
      </div>

      {/* Stricter scoring methodology note */}
      <div className="mt-6 rounded-sm border border-gold-dim bg-surface px-5 py-4">
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-display tracking-wide text-gold">STRICTER SCORING — </span>
          Kids snack scoring on Gorilla Fuel uses a stricter standard than adult
          products. Products marketed to children are held to a higher bar because
          parents are trusting these recommendations. A score of{" "}
          <span className="text-foreground">65 or above</span> represents a genuinely
          good choice. <span className="text-foreground">55–64</span> is acceptable
          occasionally. Below 55 belongs on the Cheat List. Below 40 belongs on
          Stay Away.
        </p>
      </div>

      {/* Artificial colours context note */}
      <div className="mt-6 rounded-sm border border-amber-500/30 bg-amber-900/15 px-5 py-4">
        <p className="text-xs leading-relaxed text-amber-300/90">
          <span className="font-display tracking-wide text-amber-200">⚠ ABOUT ARTIFICIAL COLOURS — </span>
          Synthetic dyes are still permitted in Canada, but Health Canada has begun
          the process of banning Red 40, and several Canadian brands have already
          voluntarily removed them. Products carrying the amber warning badge still
          contain synthetic dyes today.
        </p>
      </div>

      {/* TABS */}
      <div className="mt-10 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-sm px-5 py-2.5 font-display text-lg tracking-widest transition-colors ${
              tab === t.key
                ? t.key === "stay-away"
                  ? "bg-red-700 text-white"
                  : "bg-gold text-background"
                : "border border-line text-muted hover:border-gold-dim hover:text-foreground"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* ALLERGEN FILTERS */}
      <div className="mt-4 flex flex-wrap gap-2">
        {ALLERGEN_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setAllergen(f.key)}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
              allergen === f.key
                ? "border-gold text-gold"
                : "border-line text-muted hover:border-gold-dim hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {allergen !== "all" && (
        <p className="mt-2 text-[11px] text-muted">
          Allergen filters are ingredient-based best effort — always verify the
          current label. Cross-contamination warnings vary by facility.
        </p>
      )}

      {tab === "approved" && (
        <p className="mt-4 text-xs text-muted">
          Kids Approved = genuinely good choices under the stricter kids standard:
          whole food ingredients, zero artificial colours or flavours, and no added
          sugar binders.
        </p>
      )}

      {/* PRODUCT LIST */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {products.length > 0 ? (
          products.map((p) => <KidsCard key={p.id} product={p} tier={tab} />)
        ) : (
          <div className="gorilla-card col-span-full rounded-sm p-8 text-center">
            <p className="text-muted">No products in this tab match that allergen filter.</p>
          </div>
        )}
      </div>

      {/* THE PAIRING RULE — approved tab only */}
      {tab === "approved" && (
        <div className="mt-14">
          <h2 className="font-display text-3xl text-foreground">The Pairing Rule</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            The fastest way to turn any fruit or carb snack into lasting energy is
            to pair it with a protein or fat. This slows digestion and prevents the
            mid-afternoon sugar crash.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PAIRINGS.map((pair) => (
              <div key={pair.carb} className="gorilla-card rounded-sm p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 rounded-sm border border-line bg-surface-2 px-3 py-2 text-center">
                    <p className="text-xs leading-tight text-foreground">{pair.carb}</p>
                  </div>
                  <span className="shrink-0 font-display text-xl text-gold">+</span>
                  <div className="min-w-0 flex-1 rounded-sm border border-emerald-700/40 bg-emerald-900/15 px-3 py-2 text-center">
                    <p className="text-xs leading-tight text-emerald-300">{pair.pair}</p>
                  </div>
                </div>
                <p className="mt-2 text-center text-[11px] text-muted">{pair.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PARENT EDUCATION */}
      <div className="mt-16">
        <h2 className="font-display text-3xl text-foreground">
          What To Watch For On Kids Snack Labels
        </h2>
        <div className="mt-5 flex flex-col gap-3">
          {EDUCATION.map((item, i) => (
            <details
              key={item.title}
              className="group rounded-sm border border-line bg-surface"
            >
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-display text-lg tracking-wide text-foreground transition-colors hover:text-gold [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="mr-3 text-gold-dim">0{i + 1}</span>
                  {item.title}
                </span>
                <span className="text-gold transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="border-t border-line px-5 py-4 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="mt-10 rounded-sm border border-line bg-surface p-5">
        <p className="text-xs leading-relaxed text-muted">
          All products are editorially curated based on ingredient quality and
          nutritional analysis. No brand pays for placement. Individual children
          have different nutritional needs — consult a registered dietitian for
          personalized guidance. Product formulations change — always verify
          current ingredients on the product label before purchasing. As an Amazon
          Associate, Gorilla Fuel earns from qualifying purchases.
        </p>
      </div>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
    </div>
  );
}
