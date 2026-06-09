"use client";

import { useMemo, useState } from "react";
import CrossLinkBanner from "../components/CrossLinkBanner";
import AlcoholDisclaimer from "../scan/components/AlcoholDisclaimer";
import AlcoholProductCard from "./components/AlcoholProductCard";
import { ALCOHOL_CATEGORIES, ALCOHOL_PRODUCTS, type AlcoholCategory } from "./lib/products";

type FilterKey = "all" | "cleanest" | "low-carb" | "low-cal" | "seltzer";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "cleanest", label: "Cleanest" },
  { key: "low-carb", label: "Low Carb (under 5g)" },
  { key: "low-cal", label: "Low Cal (under 100 cal/serving)" },
  { key: "seltzer", label: "Seltzer Only" },
];

export default function AlcoholRankingsPage() {
  const [category, setCategory] = useState<AlcoholCategory>("Light Beers");
  const [filter, setFilter] = useState<FilterKey>("all");

  const products = useMemo(() => {
    return ALCOHOL_PRODUCTS.filter((p) => p.category === category)
      .filter((p) => {
        switch (filter) {
          case "cleanest":
            return p.additiveCount === 0;
          case "low-carb":
            return p.carbsPerCan < 5;
          case "low-cal":
            return p.caloriesPerCan < 100;
          case "seltzer":
            return p.category === "Hard Seltzers";
          default:
            return true;
        }
      })
      .sort((a, b) => b.gorillaPour - a.gorillaPour || a.caloriesPerCan - b.caloriesPerCan);
  }, [category, filter]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        <p className="font-display text-sm tracking-[0.3em] text-amber-400">BEER &amp; ALCOHOL INTELLIGENCE</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          The <span className="text-amber-400">Alcohol</span> Rankings.
        </h1>
        <p className="mt-4 text-muted">
          {ALCOHOL_PRODUCTS.length} drinks across {ALCOHOL_CATEGORIES.length} categories, curated for the
          fitness-minded drinker — ABV, calories, carbs, additive counts, and a Gorilla Pour rating for how
          drinkable each one is without derailing your goals. All available at Beer Store or LCBO in Canada.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-sm border border-amber-400/30 bg-amber-400/8 px-3 py-1.5 text-xs text-amber-300/80">
          <span className="text-amber-400">✓</span>
          Nutritional data last verified June 2026 — sourced from manufacturer disclosures and official product labels
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-sm border border-amber-400/20">
        <AlcoholDisclaimer />
      </div>

      {/* CATEGORY TABS */}
      <div className="mt-10 flex flex-wrap gap-2">
        {ALCOHOL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-sm px-5 py-2.5 font-display text-lg tracking-widest transition-colors ${
              category === cat
                ? "bg-amber-400 text-slate-950"
                : "border border-slate-700 text-slate-400 hover:border-amber-400/50 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
              filter === f.key
                ? "border-amber-400 text-amber-400"
                : "border-slate-700 text-slate-400 hover:border-amber-400/50 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* PRODUCT LIST */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {products.length > 0 ? (
          products.map((product) => <AlcoholProductCard key={product.id} product={product} />)
        ) : (
          <div className="col-span-full rounded-sm border border-slate-800 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-400">No drinks in {category} match this filter. Try another combination.</p>
          </div>
        )}
      </div>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
    </div>
  );
}
