"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import UniversalSearch from "../components/UniversalSearch";
import type { SearchProduct } from "../api/search/route";
import {
  searchCurated,
  gradeColor,
  getProductLink,
  emptyGrouped,
  cacheRowToFood,
  cacheRowToSupplement,
  cacheRowToAlcohol,
  type GroupedResults,
  type CacheResult,
  type CuratedFoodResult,
  type AlcoholResult,
  type SearchResult,
} from "../lib/searchProducts";

function GorillaPourMini({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-xs leading-none">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-20 grayscale"}>🦍</span>
      ))}
    </span>
  );
}

function colorScore(score: number) {
  return score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";
}

function rightFor(item: SearchResult): React.ReactNode {
  switch (item.type) {
    case "alcohol":
      return <GorillaPourMini rating={item.gorillaPour} />;
    case "ranked-supplement":
      return <span className="font-display text-base text-gold">{item.grade}</span>;
    case "intel":
      return <span className={`font-display text-base ${colorScore(item.score)}`}>{item.score}</span>;
    case "kids":
      return <span className={`font-display text-base ${colorScore(item.score)}`}>{item.score}</span>;
    case "alcohol-cache":
      // Scanned alcohol carries a 0–100 gorilla score; show it like the numeric
      // cache scores rather than the curated 5-gorilla pour rating.
      return item.score !== null ? (
        <span className={`font-display text-base ${colorScore(item.score)}`}>{item.score}</span>
      ) : null;
    case "food":
    case "supplement":
      return item.score !== null ? (
        <span className={`font-display text-base ${gradeColor(item.grade)}`}>{item.score}</span>
      ) : null;
    default:
      return null;
  }
}

function subFor(item: SearchResult): string {
  switch (item.type) {
    case "alcohol":
      return item.abv !== undefined ? `${item.brand} · ${item.abv}% ABV` : item.brand;
    case "ranked-supplement":
      return item.brand;
    case "intel":
      return item.path === "/approved" ? "Gorilla Approved" : item.path === "/cheat" ? "Cheat List" : "Stay Away";
    case "kids":
      return "Kids Snack Guide";
    case "food":
    case "supplement":
    case "alcohol-cache":
      return item.brand ?? "";
    case "curated-food":
      return item.brand;
    default:
      return "";
  }
}

function keyFor(item: SearchResult, i: number): string {
  if (item.type === "alcohol" || item.type === "ranked-supplement" || item.type === "intel" || item.type === "kids") {
    return `${item.type}-${item.id}-${i}`;
  }
  return `${item.type}-${item.barcode}-${i}`;
}

function ResultRow({ item }: { item: SearchResult }) {
  return (
    <Link
      href={getProductLink(item)}
      className="flex items-center justify-between gap-3 rounded-sm border border-line bg-surface px-4 py-3 transition-colors hover:border-gold/50 hover:bg-surface-2"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{item.name}</p>
        {subFor(item) && <p className="truncate text-xs text-muted">{subFor(item)}</p>}
      </div>
      {rightFor(item) && <div className="shrink-0">{rightFor(item)}</div>}
    </Link>
  );
}

export default function SearchResults() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();

  const [results, setResults] = useState<GroupedResults>(emptyGrouped());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.length < 2) {
      setResults(emptyGrouped());
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Curated/client matches — uncapped (no per-group slice).
    const curated = searchCurated(q);
    // Render curated immediately, then merge the cache when it returns.
    setResults(curated);

    (async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=300`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const cacheRows: SearchProduct[] = await res.json();
        if (cancelled || cacheRows.length === 0) return;

        const cacheFood: CacheResult[] = cacheRows
          .filter((r) => !r.is_alcohol && !r.is_supplement && !r.is_beauty)
          .map(cacheRowToFood);
        const cacheSupp: CacheResult[] = cacheRows.filter((r) => r.is_supplement).map(cacheRowToSupplement);
        // Scanned alcohol rows the API already returns (previously discarded here).
        const cacheAlcohol: CacheResult[] = cacheRows.filter((r) => r.is_alcohol).map(cacheRowToAlcohol);

        const foodBarcodes = new Set(curated.food.map((c) => c.barcode));
        const mergedFood = [
          ...curated.food,
          ...cacheFood.filter((c) => !foodBarcodes.has(c.barcode)),
        ] as (CacheResult | CuratedFoodResult)[];

        const supplBarcodes = new Set(curated.supplement.map((c) => c.barcode));
        const mergedSuppl = [...curated.supplement, ...cacheSupp.filter((c) => !supplBarcodes.has(c.barcode))];

        // Dedup scanned alcohol against curated beer + wine barcodes so a product
        // already curated isn't listed twice; appended after the curated matches.
        const alcoholBarcodes = new Set(
          [...curated.alcohol, ...curated.wine]
            .map((a) => ("barcode" in a ? a.barcode : undefined))
            .filter((b): b is string => Boolean(b))
        );
        const mergedAlcohol: (AlcoholResult | CacheResult)[] = [
          ...curated.alcohol,
          ...cacheAlcohol.filter((c) => !alcoholBarcodes.has(c.barcode)),
        ];

        setResults({ ...curated, food: mergedFood, supplement: mergedSuppl, alcohol: mergedAlcohol });
      } catch {
        // Cache unavailable — keep curated results.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [q]);

  const sections: { label: string; accent?: string; items: SearchResult[] }[] = [
    { label: "Food", items: results.food },
    { label: "Beer & Alcohol", items: results.alcohol },
    { label: "Wine", accent: "text-rose-400", items: results.wine },
    { label: "Supplement Rankings", items: results.ranked },
    { label: "Gorilla Intel", accent: "text-emerald-400/80", items: results.intel },
    { label: "Kids Snacks", accent: "text-sky-300/80", items: results.kids },
    { label: "Supplements", items: results.supplement },
  ];

  const total = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">SEARCH RESULTS</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        {q.length >= 2 ? (
          <>
            {total} result{total === 1 ? "" : "s"} for <span className="text-gold">&ldquo;{q}&rdquo;</span>
          </>
        ) : (
          <>Search the database</>
        )}
      </h1>

      {/* Refine search — same component, navigates here on submit */}
      <div className="mt-6 max-w-lg">
        <UniversalSearch placeholder="Search by product name…" />
      </div>

      {q.length < 2 ? (
        <p className="mt-10 text-muted">Type at least two characters to search every product in the database.</p>
      ) : total === 0 && !loading ? (
        <div className="mt-10 rounded-sm border border-line bg-surface px-6 py-8 text-center">
          <p className="font-display text-xl text-foreground">No matches for &ldquo;{q}&rdquo;</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            We may not have it yet. Try a shorter or different term — or scan the barcode directly and help us add it.
          </p>
          <Link
            href="/scan"
            className="mt-5 inline-block rounded-sm bg-gold px-6 py-3 font-display text-sm tracking-widest text-background transition-opacity hover:opacity-90"
          >
            Open Scanner →
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {loading && total === 0 && <p className="text-sm text-muted">Searching…</p>}
          {sections
            .filter((s) => s.items.length > 0)
            .map((s) => (
              <section key={s.label}>
                <h2 className={`mb-3 font-display text-sm uppercase tracking-[0.2em] ${s.accent ?? "text-gold/70"}`}>
                  {s.label} <span className="text-muted/60">({s.items.length})</span>
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {s.items.map((item, i) => (
                    <ResultRow key={keyFor(item, i)} item={item} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
