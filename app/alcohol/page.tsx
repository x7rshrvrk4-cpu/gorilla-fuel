"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CrossLinkBanner from "../components/CrossLinkBanner";
import AlcoholDisclaimer from "../scan/components/AlcoholDisclaimer";
import AlcoholProductCard from "./components/AlcoholProductCard";
import { ALCOHOL_CATEGORIES, ALCOHOL_PRODUCTS, type AlcoholCategory } from "./lib/products";
import { trackAlcoholRankingViewed } from "../lib/gtag";
import UniversalSearch from "../components/UniversalSearch";

type FilterKey =
  | "all"
  | "cleanest"
  | "low-carb"
  | "low-cal"
  | "london-on"
  | "ontario-craft"
  | "ipa"
  | "lager"
  | "stout"
  | "red"
  | "white"
  | "rose"
  | "sparkling"
  | "sweet"
  | "icewine"
  | "ontario-vqa"
  | "gluten-free"
  | "dry-only";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "gluten-free", label: "✓ Gluten Free" },
  { key: "london-on", label: "London ON" },
  { key: "ontario-craft", label: "Ontario Craft" },
  { key: "ipa", label: "IPA" },
  { key: "lager", label: "Lager" },
  { key: "stout", label: "Stout" },
  { key: "cleanest", label: "Cleanest" },
  { key: "low-carb", label: "Low Carb (<5g)" },
  { key: "low-cal", label: "Low Cal (<100 cal)" },
];

const WINE_FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Wines" },
  { key: "ontario-vqa", label: "🍁 Ontario VQA" },
  { key: "red", label: "Red" },
  { key: "white", label: "White" },
  { key: "rose", label: "Rosé" },
  { key: "sparkling", label: "Sparkling" },
  { key: "sweet", label: "Sweet" },
  { key: "icewine", label: "Icewine" },
  { key: "dry-only", label: "Dry Only (<4g sugar)" },
  { key: "low-cal", label: "Low Cal (<130 cal)" },
];

export default function AlcoholRankingsPage() {
  const [category, setCategory] = useState<AlcoholCategory>("Light Beer");
  const [filter, setFilter] = useState<FilterKey>("all");

  const isWineTab = category === "Wines";

  useEffect(() => {
    trackAlcoholRankingViewed();
  }, []);

  useEffect(() => {
    setFilter("all");
  }, [category]);

  const products = useMemo(() => {
    return ALCOHOL_PRODUCTS.filter((p) => p.category === category)
      .filter((p) => {
        switch (filter) {
          case "cleanest":
            return p.additiveCount === 0 || p.additiveCount === 1;
          case "low-carb":
            return isWineTab ? p.sugarPerCan < 2 : p.carbsPerCan < 5;
          case "low-cal":
            return isWineTab ? p.caloriesPerCan < 130 : p.caloriesPerCan < 100;
          case "london-on":
            return p.londonOntario === true;
          case "ontario-craft":
            return p.ontarioCraft === true;
          case "ipa":
            return p.beerStyle?.toLowerCase().includes("ipa") || p.category === "IPA & Craft Ale";
          case "lager":
            return p.beerStyle?.toLowerCase().includes("lager") || p.beerStyle?.toLowerCase().includes("pilsner") || p.category === "Lager";
          case "stout":
            return p.beerStyle?.toLowerCase().includes("stout") || p.beerStyle?.toLowerCase().includes("porter");
          case "red":
            return p.wineSubcategory === "Red";
          case "white":
            return p.wineSubcategory === "White";
          case "rose":
            return p.wineSubcategory === "Rosé";
          case "sparkling":
            return p.wineSubcategory === "Sparkling";
          case "sweet":
            return p.wineSubcategory === "Sweet";
          case "icewine":
            return p.wineSubcategory === "Icewine";
          case "ontario-vqa":
            return p.ontarioVQA === true;
          case "gluten-free":
            return p.glutenStatus === "certified-gf";
          case "dry-only":
            return p.sugarPerCan < 4;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        // Ontario VQA wines first, then London ON, then Ontario craft, then brand
        if (a.ontarioVQA && !b.ontarioVQA) return -1;
        if (!a.ontarioVQA && b.ontarioVQA) return 1;
        if (a.londonOntario && !b.londonOntario) return -1;
        if (!a.londonOntario && b.londonOntario) return 1;
        if (a.ontarioCraft && !b.ontarioCraft) return -1;
        if (!a.ontarioCraft && b.ontarioCraft) return 1;
        return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
      });
  }, [category, filter, isWineTab]);

  const activeFilters = isWineTab ? WINE_FILTERS : FILTERS;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        {isWineTab ? (
          <>
            <p className="font-display text-sm tracking-[0.3em] text-rose-400">WINE INTELLIGENCE</p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
              The <span className="text-rose-400">Wine</span> Rankings.
            </h1>
            <p className="mt-4 text-muted">
              {ALCOHOL_PRODUCTS.filter((p) => p.category === "Wines").length} wines ranked by sugar, calories per
              148mL pour, and additive count — the fitness drinker's guide to wine without the guesswork.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-sm border border-rose-700/30 bg-rose-700/8 px-3 py-1.5 text-xs text-rose-300/80">
              <span className="text-rose-400">🍷</span>
              All values per standard 148mL pour · sourced from winery disclosures and lab analysis
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-sm tracking-[0.3em] text-amber-400">BEER &amp; ALCOHOL INTELLIGENCE</p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
              The <span className="text-amber-400">Alcohol</span> Rankings.
            </h1>
            <p className="mt-4 text-muted">
              {ALCOHOL_PRODUCTS.filter((p) => p.category !== "Wines").length} beers, seltzers, ciders, and RTDs
              across {ALCOHOL_CATEGORIES.length - 1} categories — including London Ontario craft breweries, Ontario
              craft, and national brands. Filter by style, origin, or macros.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-sm border border-amber-400/30 bg-amber-400/8 px-3 py-1.5 text-xs text-amber-300/80">
              <span className="text-amber-400">✓</span>
              Nutritional data last verified June 2026 — sourced from manufacturer disclosures and official product labels
            </p>
          </>
        )}
      </div>

      <div className="mt-8">
        <UniversalSearch placeholder={isWineTab ? "Search wines by name or winery…" : "Search beers, seltzers, ciders…"} />
      </div>

      {!isWineTab && (
        <div className="mt-4 overflow-hidden rounded-sm border border-amber-400/20">
          <AlcoholDisclaimer />
        </div>
      )}

      {/* CATEGORY TABS */}
      <div className="mt-10 flex flex-wrap gap-2">
        {ALCOHOL_CATEGORIES.map((cat) => {
          const isWineCat = cat === "Wines";
          const isActive = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-sm px-5 py-2.5 font-display text-lg tracking-widest transition-colors ${
                isActive
                  ? isWineCat
                    ? "bg-rose-800 text-white"
                    : "bg-amber-400 text-slate-950"
                  : isWineCat
                  ? "border border-rose-800/50 text-rose-400 hover:border-rose-700 hover:text-rose-300"
                  : "border border-slate-700 text-slate-400 hover:border-amber-400/50 hover:text-foreground"
              }`}
            >
              {cat === "Wines" ? "🍷 " : ""}{cat}
            </button>
          );
        })}
      </div>

      {/* FILTERS */}
      <div className="mt-4 flex flex-wrap gap-2">
        {activeFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
              filter === f.key
                ? f.key === "london-on"
                  ? "border-emerald-500 text-emerald-400"
                  : isWineTab
                  ? "border-rose-500 text-rose-400"
                  : "border-amber-400 text-amber-400"
                : "border-slate-700 text-slate-400 hover:border-amber-400/50 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Gluten free filter note */}
      {filter === "gluten-free" && (
        <div className="mt-4 rounded-sm border border-green-600/40 bg-green-900/20 px-5 py-4">
          <p className="text-xs leading-relaxed text-green-300/90">
            <span className="font-display tracking-wide text-green-200">✓ CERTIFIED GLUTEN FREE — </span>
            Showing only products made entirely from gluten-free ingredients — never
            barley, wheat or rye — and safe for celiac disease. &ldquo;Gluten removed&rdquo;
            beers are deliberately excluded: Health Canada does not permit them to be
            labelled gluten free, and they are not recommended for celiac disease.{" "}
            <Link href="/glutenfree" className="underline hover:text-green-100">Full gluten-free guide →</Link>
          </p>
        </div>
      )}

      {/* London ON spotlight note */}
      {filter === "london-on" && !isWineTab && (
        <div className="mt-4 rounded-sm border border-emerald-700/30 bg-emerald-900/20 px-5 py-4">
          <p className="text-xs leading-relaxed text-emerald-300/80">
            <span className="font-display tracking-wide text-emerald-200">London Ontario craft — home turf.</span>{" "}
            Forked River, Toboggan, Anderson, London Brewing, Powerhouse, Storm Stayed, Dundas &amp; Sons, and Black Fly all
            brew right here in London ON. Support local.
          </p>
        </div>
      )}

      {/* Ontario VQA note */}
      {isWineTab && (filter === "all" || filter === "ontario-vqa") && (
        <div className="mt-4 rounded-sm border border-emerald-700/40 bg-gradient-to-r from-emerald-900/25 to-yellow-900/15 px-5 py-4">
          <p className="text-xs leading-relaxed text-emerald-300/90">
            <span className="font-display tracking-wide text-emerald-200">🍁 ONTARIO VQA — </span>
            Ontario VQA wines are 100% Ontario-grown grapes verified by the Vintners
            Quality Alliance. Every bottle represents a local Ontario winery and
            Canadian farming families.
          </p>
        </div>
      )}

      {/* Icewine note */}
      {isWineTab && filter === "icewine" && (
        <div className="mt-4 rounded-sm border border-amber-500/40 bg-amber-900/20 px-5 py-4">
          <p className="text-xs leading-relaxed text-amber-300/90">
            <span className="font-display tracking-wide text-amber-200">🧊 ICEWINE — </span>
            Icewine is a dessert wine served in 60mL portions, so nutrition is shown
            per 60mL pour rather than the standard 148mL glass. It is naturally high
            in sugar due to the concentration that happens when grapes freeze on the
            vine — that&apos;s the style, not an additive.
          </p>
        </div>
      )}

      {/* Wine helpful note + scoring explanation */}
      {isWineTab && (
        <div className="mt-6 space-y-3">
          <div className="rounded-sm border border-rose-800/30 bg-rose-950/30 px-5 py-4">
            <p className="text-xs leading-relaxed text-rose-300/80">
              <span className="font-display tracking-wide text-rose-200">🍷 Standard glass = 148mL.</span>{" "}
              Calories and carbs shown per glass. Dry wines score highest on Gorilla Fuel due to lower sugar content.
            </p>
          </div>
          <div className="rounded-sm border border-slate-800 bg-slate-900/40 px-5 py-4">
            <p className="text-xs leading-relaxed text-slate-400">
              <span className="font-display tracking-wide text-slate-300">Wine Score methodology:</span>{" "}
              Sugar 40% · Calorie density 30% · Additives 30% — each measured per standard 148mL pour.
              Dry wines (&lt;4g sugar) score highest. Semi-dry 4–8g. Sweet over 8g.
            </p>
          </div>
        </div>
      )}

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
