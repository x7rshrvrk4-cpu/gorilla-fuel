"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { scrollToProduct } from "../lib/scrollHighlight";
import CrossLinkBanner from "../components/CrossLinkBanner";
import BackToTop from "../components/BackToTop";
import AlcoholDisclaimer from "../scan/components/AlcoholDisclaimer";
import AlcoholProductCard from "./components/AlcoholProductCard";
import { ALCOHOL_PRODUCTS, wineGorillaScore, type AlcoholCategory } from "./lib/products";
import { trackAlcoholRankingViewed } from "../lib/gtag";
import UniversalSearch from "../components/UniversalSearch";

// ── Page-level tab groupings ──────────────────────────────────────────────────

type PageTab = "BEER" | "WINE" | "SELTZER & RTD" | "NON-ALCOHOLIC";

const PAGE_TABS: PageTab[] = ["BEER", "WINE", "SELTZER & RTD", "NON-ALCOHOLIC"];

const TAB_CATEGORIES: Record<PageTab, AlcoholCategory[]> = {
  "BEER":          ["Light Beer", "IPA & Craft Ale", "Lager"],
  "WINE":          ["Wines"],
  "SELTZER & RTD": ["Hard Seltzer", "Cider"],
  "NON-ALCOHOLIC": ["Non-Alcoholic"],
};

/** Map any AlcoholCategory to its parent page tab */
function categoryToTab(cat: AlcoholCategory): PageTab {
  for (const [tab, cats] of Object.entries(TAB_CATEGORIES) as [PageTab, AlcoholCategory[]][]) {
    if (cats.includes(cat)) return tab;
  }
  return "BEER";
}

// ── Beer filter chips ─────────────────────────────────────────────────────────

type BeerFilter =
  | "all" | "cleanest" | "low-carb" | "low-cal" | "gluten-free"
  | "london-on" | "ontario-craft" | "toronto" | "hamilton"
  | "niagara-region" | "ottawa" | "eastern-ontario"
  | "ipa" | "lager" | "stout";

const BEER_FILTERS: { key: BeerFilter; label: string }[] = [
  { key: "all",            label: "All" },
  { key: "cleanest",       label: "Cleanest" },
  { key: "low-carb",       label: "Low Carb (<5g)" },
  { key: "low-cal",        label: "Low Cal (<100 cal)" },
  { key: "gluten-free",    label: "✓ Gluten Free" },
  { key: "ipa",            label: "IPA" },
  { key: "lager",          label: "Lager" },
  { key: "stout",          label: "Stout" },
  { key: "london-on",      label: "London ON" },
  { key: "ontario-craft",  label: "Ontario Craft" },
  { key: "toronto",        label: "Toronto" },
  { key: "hamilton",       label: "Hamilton" },
  { key: "niagara-region", label: "Niagara" },
  { key: "ottawa",         label: "Ottawa" },
  { key: "eastern-ontario",label: "Eastern Ontario" },
];

// ── RTD filter chips ──────────────────────────────────────────────────────────

type RtdFilter = "all" | "cleanest" | "low-cal" | "low-carb" | "gluten-free" | "cider" | "seltzer";

const RTD_FILTERS: { key: RtdFilter; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "seltzer",     label: "Hard Seltzer" },
  { key: "cider",       label: "Cider" },
  { key: "low-cal",     label: "Low Cal (<100 cal)" },
  { key: "low-carb",    label: "Low Carb (<5g)" },
  { key: "cleanest",    label: "Cleanest" },
  { key: "gluten-free", label: "✓ Gluten Free" },
];

// ── Wine filter chips ─────────────────────────────────────────────────────────

type WineFilter =
  | "all" | "ontario-vqa" | "red" | "white" | "rose"
  | "sparkling" | "sweet" | "icewine" | "dry-only" | "low-cal";

const WINE_FILTERS: { key: WineFilter; label: string }[] = [
  { key: "all",         label: "All Wines" },
  { key: "ontario-vqa", label: "🍁 Ontario VQA" },
  { key: "red",         label: "Red" },
  { key: "white",       label: "White" },
  { key: "rose",        label: "Rosé" },
  { key: "sparkling",   label: "Sparkling" },
  { key: "sweet",       label: "Sweet" },
  { key: "icewine",     label: "Icewine" },
  { key: "dry-only",    label: "Dry Only (<4g sugar)" },
  { key: "low-cal",     label: "Low Cal (<130 cal)" },
];

type WineSort = "gorilla" | "quality" | "sweet-spot";

const WINE_SORTS: { key: WineSort; label: string }[] = [
  { key: "gorilla",     label: "🦍 Sort by Gorilla Score" },
  { key: "quality",     label: "⭐ Sort by Wine Quality" },
  { key: "sweet-spot",  label: "THE GORILLA SWEET SPOT" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AlcoholClient() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<PageTab>("BEER");
  const [beerFilter, setBeerFilter] = useState<BeerFilter>("all");
  const [rtdFilter, setRtdFilter] = useState<RtdFilter>("all");
  const [wineFilter, setWineFilter] = useState<WineFilter>("all");
  const [wineSort, setWineSort] = useState<WineSort>("gorilla");

  const isWine = tab === "WINE";
  const isRtd = tab === "SELTZER & RTD";
  const isBeer = tab === "BEER";
  const isNonAlc = tab === "NON-ALCOHOLIC";

  useEffect(() => { trackAlcoholRankingViewed(); }, []);

  // Deep link: /alcohol?p=<id> → switch to correct tab and scroll.
  // Depends on the ?p= value (via useSearchParams) so it re-fires even when the
  // user is ALREADY on /alcohol and taps a search result — a same-page,
  // query-only navigation that does NOT remount this component. The old
  // mount-only effect silently did nothing in that case (the iOS "dead tap").
  const deepLinkId = searchParams.get("p");
  useEffect(() => {
    if (!deepLinkId) return;
    const product = ALCOHOL_PRODUCTS.find((x) => x.id === deepLinkId);
    if (!product) return;
    setTab(categoryToTab(product.category));
    return scrollToProduct(deepLinkId);
  }, [deepLinkId]);

  const products = useMemo(() => {
    const cats = TAB_CATEGORIES[tab];
    const base = ALCOHOL_PRODUCTS.filter((p) => cats.includes(p.category));

    const filtered = base.filter((p) => {
      if (isBeer) {
        switch (beerFilter) {
          case "cleanest":        return p.additiveCount <= 1;
          case "low-carb":        return p.carbsPerCan < 5;
          case "low-cal":         return p.caloriesPerCan < 100;
          case "gluten-free":     return p.glutenStatus === "certified-gf";
          case "london-on":       return p.londonOntario === true;
          case "ontario-craft":   return p.ontarioCraft === true;
          case "toronto":         return p.cityRegion === "Toronto";
          case "hamilton":        return p.cityRegion === "Hamilton";
          case "niagara-region":  return p.cityRegion === "Niagara";
          case "ottawa":          return p.cityRegion === "Ottawa";
          case "eastern-ontario": return p.cityRegion === "Ottawa";
          case "ipa":             return p.beerStyle?.toLowerCase().includes("ipa") || p.category === "IPA & Craft Ale";
          case "lager":           return p.beerStyle?.toLowerCase().includes("lager") || p.beerStyle?.toLowerCase().includes("pilsner") || p.category === "Lager";
          case "stout":           return p.beerStyle?.toLowerCase().includes("stout") || p.beerStyle?.toLowerCase().includes("porter");
          default:                return true;
        }
      }
      if (isRtd) {
        switch (rtdFilter) {
          case "seltzer":     return p.category === "Hard Seltzer";
          case "cider":       return p.category === "Cider";
          case "cleanest":    return p.additiveCount <= 1;
          case "low-cal":     return p.caloriesPerCan < 100;
          case "low-carb":    return p.carbsPerCan < 5;
          case "gluten-free": return p.glutenStatus === "certified-gf";
          default:            return true;
        }
      }
      if (isWine) {
        switch (wineFilter) {
          case "ontario-vqa": return p.ontarioVQA === true;
          case "red":         return p.wineSubcategory === "Red";
          case "white":       return p.wineSubcategory === "White";
          case "rose":        return p.wineSubcategory === "Rosé";
          case "sparkling":   return p.wineSubcategory === "Sparkling";
          case "sweet":       return p.wineSubcategory === "Sweet";
          case "icewine":     return p.wineSubcategory === "Icewine";
          case "dry-only":    return p.sugarPerCan < 4;
          case "low-cal":     return p.caloriesPerCan < 130;
          default:            return true;
        }
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (isWine) {
        if (wineSort === "gorilla")    return wineGorillaScore(b) - wineGorillaScore(a) || a.name.localeCompare(b.name);
        if (wineSort === "quality")    return (b.wineQuality ?? -1) - (a.wineQuality ?? -1) || a.name.localeCompare(b.name);
        const combined = (p: typeof a) => p.wineQuality !== undefined ? (wineGorillaScore(p) + p.wineQuality) / 2 : -1;
        return combined(b) - combined(a) || a.name.localeCompare(b.name);
      }
      // Beer / RTD / Non-alc: local first, then brand
      if (a.ontarioVQA && !b.ontarioVQA) return -1;
      if (!a.ontarioVQA && b.ontarioVQA) return 1;
      if (a.londonOntario && !b.londonOntario) return -1;
      if (!a.londonOntario && b.londonOntario) return 1;
      if (a.ontarioCraft && !b.ontarioCraft) return -1;
      if (!a.ontarioCraft && b.ontarioCraft) return 1;
      return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
    });
  }, [tab, beerFilter, rtdFilter, wineFilter, wineSort, isBeer, isRtd, isWine]);

  const searchPlaceholder = isWine ? "Search wines by name or winery…" : "Search beers, seltzers, ciders…";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {/* PAGE HEADER */}
      <div className="max-w-2xl">
        {isWine ? (
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
              {ALCOHOL_PRODUCTS.filter((p) => p.category !== "Wines" && p.category !== "Non-Alcoholic").length} beers,
              seltzers, and ciders — plus London Ontario craft, Ontario craft, and national brands. Filter by style,
              origin, or macros.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-sm border border-amber-400/30 bg-amber-400/8 px-3 py-1.5 text-xs text-amber-300/80">
              <span className="text-amber-400">✓</span>
              Nutritional data last verified June 2026 — sourced from manufacturer disclosures and official product labels
            </p>
          </>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/rankings/alcohol"
          className="inline-block rounded-sm border border-gold px-5 py-2.5 font-display text-base tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-background"
        >
          📊 See Ontario Top 10 Rankings →
        </Link>
      </div>

      <div className="mt-6">
        <UniversalSearch placeholder={searchPlaceholder} />
      </div>

      {!isWine && !isNonAlc && (
        <div className="mt-4 overflow-hidden rounded-sm border border-amber-400/20">
          <AlcoholDisclaimer />
        </div>
      )}

      {/* PAGE TABS */}
      <div className="mt-10 flex flex-wrap gap-2">
        {PAGE_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-sm px-5 py-2.5 font-display text-lg tracking-widest transition-colors ${
              tab === t
                ? t === "WINE"
                  ? "bg-rose-800 text-white"
                  : "bg-amber-400 text-slate-950"
                : t === "WINE"
                ? "border border-rose-800/50 text-rose-400 hover:border-rose-700 hover:text-rose-300"
                : "border border-slate-700 text-slate-400 hover:border-amber-400/50 hover:text-foreground"
            }`}
          >
            {t === "WINE" ? "🍷 " : ""}{t}
          </button>
        ))}
      </div>

      {/* FILTER CHIPS — beer */}
      {isBeer && (
        <div className="mt-4 flex flex-wrap gap-2">
          {BEER_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setBeerFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                beerFilter === f.key
                  ? f.key === "london-on"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-amber-400 text-amber-400"
                  : "border-slate-700 text-slate-400 hover:border-amber-400/50 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* FILTER CHIPS — RTD */}
      {isRtd && (
        <div className="mt-4 flex flex-wrap gap-2">
          {RTD_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setRtdFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                rtdFilter === f.key
                  ? "border-amber-400 text-amber-400"
                  : "border-slate-700 text-slate-400 hover:border-amber-400/50 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* FILTER CHIPS — wine */}
      {isWine && (
        <div className="mt-4 flex flex-wrap gap-2">
          {WINE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setWineFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                wineFilter === f.key
                  ? "border-rose-500 text-rose-400"
                  : "border-slate-700 text-slate-400 hover:border-rose-500/60 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Contextual notes */}
      {isBeer && beerFilter === "gluten-free" && (
        <div className="mt-4 rounded-sm border border-green-600/40 bg-green-900/20 px-5 py-4">
          <p className="text-xs leading-relaxed text-green-300/90">
            <span className="font-display tracking-wide text-green-200">✓ CERTIFIED GLUTEN FREE — </span>
            Showing only products made entirely from gluten-free ingredients. &ldquo;Gluten removed&rdquo; beers are
            deliberately excluded: Health Canada does not permit them to be labelled gluten free, and they are not
            recommended for celiac disease.{" "}
            <Link href="/glutenfree" className="underline hover:text-green-100">Full gluten-free guide →</Link>
          </p>
        </div>
      )}

      {isBeer && beerFilter === "london-on" && (
        <div className="mt-4 rounded-sm border border-emerald-700/30 bg-emerald-900/20 px-5 py-4">
          <p className="text-xs leading-relaxed text-emerald-300/80">
            <span className="font-display tracking-wide text-emerald-200">London Ontario craft — home turf.</span>{" "}
            Forked River, Toboggan, Anderson, London Brewing, Powerhouse, Storm Stayed, Dundas &amp; Sons, and Black Fly all
            brew right here in London ON. Support local.
          </p>
        </div>
      )}

      {/* Wine sort buttons */}
      {isWine && (
        <div className="mt-4 flex flex-wrap gap-2">
          {WINE_SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setWineSort(s.key)}
              className={`rounded-sm border px-4 py-2 font-display text-sm tracking-[0.15em] transition-colors ${
                s.key === "sweet-spot"
                  ? wineSort === s.key
                    ? "border-gold bg-gold text-background"
                    : "border-gold/60 text-gold hover:bg-gold/15"
                  : wineSort === s.key
                  ? "border-rose-500 bg-rose-800/40 text-rose-200"
                  : "border-slate-700 text-slate-400 hover:border-rose-500/60 hover:text-foreground"
              }`}
            >
              {s.label}
              {s.key === "sweet-spot" && <span className="ml-1.5 text-[10px] opacity-80">★ RECOMMENDED</span>}
            </button>
          ))}
        </div>
      )}

      {isWine && (wineFilter === "all" || wineFilter === "ontario-vqa") && (
        <div className="mt-4 rounded-sm border border-emerald-700/40 bg-gradient-to-r from-emerald-900/25 to-yellow-900/15 px-5 py-4">
          <p className="text-xs leading-relaxed text-emerald-300/90">
            <span className="font-display tracking-wide text-emerald-200">🍁 ONTARIO VQA — </span>
            Ontario VQA wines are 100% Ontario-grown grapes verified by the Vintners Quality Alliance. Every bottle
            represents a local Ontario winery and Canadian farming families.
          </p>
        </div>
      )}

      {isWine && wineFilter === "icewine" && (
        <div className="mt-4 rounded-sm border border-amber-500/40 bg-amber-900/20 px-5 py-4">
          <p className="text-xs leading-relaxed text-amber-300/90">
            <span className="font-display tracking-wide text-amber-200">🧊 ICEWINE — </span>
            Served in 60mL portions; nutrition is shown per 60mL pour. Naturally high in sugar from grapes freezing on
            the vine — that&apos;s the style, not an additive.
          </p>
        </div>
      )}

      {isWine && (
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
          <div className="rounded-sm border border-slate-800 bg-slate-900/40 px-5 py-4">
            <p className="text-xs leading-relaxed text-slate-400">
              Wine quality scores sourced from critic ratings on LCBO product pages including James Suckling, Wine
              Spectator, Wine Enthusiast, WineAlign, Decanter, and National Wine Awards of Canada. No brand pays for
              placement on this page.
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
            <p className="text-slate-400">No drinks in {tab} match this filter. Try another combination.</p>
          </div>
        )}
      </div>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
      <BackToTop />
    </div>
  );
}
