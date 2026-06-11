"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { searchCuratedFoods, searchCuratedSupplements } from "../scan/lib/curatedFoods";
import type { SearchProduct } from "../api/search/route";

type AlcoholResult = {
  type: "alcohol";
  id: string;
  name: string;
  brand: string;
  abv: number;
  gorillaPour: number;
  category: string;
  barcode?: string;
};

type CacheResult = {
  type: "food" | "supplement" | "beauty";
  barcode: string;
  name: string;
  brand: string | null;
  score: number | null;
  grade: string | null;
};

type CuratedFoodResult = {
  type: "curated-food";
  barcode: string;
  name: string;
  brand: string;
};

type SearchResult = AlcoholResult | CacheResult | CuratedFoodResult;

type GroupedResults = {
  food: (CacheResult | CuratedFoodResult)[];
  alcohol: AlcoholResult[];
  wine: AlcoholResult[];
  supplement: CacheResult[];
};

function gradeColor(grade: string | null): string {
  switch (grade) {
    case "A+": case "A": return "text-emerald-400";
    case "B+": case "B": return "text-green-400";
    case "C": return "text-amber-400";
    case "D": return "text-orange-400";
    case "F": return "text-red-400";
    default: return "text-slate-400";
  }
}

function GorillaPourMini({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-xs leading-none">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-20 grayscale"}>🦍</span>
      ))}
    </span>
  );
}

type Props = {
  placeholder?: string;
  className?: string;
  onActiveChange?: (active: boolean) => void;
};

export default function UniversalSearch({ placeholder = "Search products, beers, wines…", className = "", onActiveChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GroupedResults>({ food: [], alcohol: [], wine: [], supplement: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelBlurClose = useCallback(() => {
    if (blurCloseRef.current) {
      clearTimeout(blurCloseRef.current);
      blurCloseRef.current = null;
    }
  }, []);

  // Close shortly after the input loses focus. The delay lets a tap on a
  // result row complete first — blur fires before click, and closing
  // immediately would unmount the link out from under the tap (iOS Safari
  // never focuses tapped links, so relatedTarget checks don't work there).
  const handleBlur = useCallback(() => {
    cancelBlurClose();
    blurCloseRef.current = setTimeout(() => setOpen(false), 150);
  }, [cancelBlurClose]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults({ food: [], alcohol: [], wine: [], supplement: [] });
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    const ql = q.toLowerCase();

    // ── Client-side: alcohol (instant) ──────────────────────────────────────
    const alcoholHits: AlcoholResult[] = ALCOHOL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(ql) ||
        p.brand.toLowerCase().includes(ql)
    )
      .slice(0, 6)
      .map((p) => ({
        type: "alcohol",
        id: p.id,
        name: p.name,
        brand: p.brand,
        abv: p.abv,
        gorillaPour: p.gorillaPour,
        category: p.category,
        barcode: p.barcodes?.[0],
      }));

    const wineHits = alcoholHits.filter((r) => r.category === "Wines");
    const beerHits = alcoholHits.filter((r) => r.category !== "Wines");

    // ── Client-side: curated foods + supplements (instant) ──────────────────
    const curatedHits: CuratedFoodResult[] = searchCuratedFoods(q, 3).map((e) => ({
      type: "curated-food",
      barcode: e.barcode,
      name: e.name,
      brand: e.brand,
    }));

    const curatedSupplHits: CacheResult[] = searchCuratedSupplements(q, 4).map((e) => ({
      type: "supplement",
      barcode: e.barcode,
      name: e.name,
      brand: e.brand,
      score: null,
      grade: null,
    }));

    // Optimistically render what we have before Supabase returns
    setResults({ food: curatedHits, alcohol: beerHits, wine: wineHits, supplement: curatedSupplHits });

    // ── Async: Supabase cache search ─────────────────────────────────────────
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const cacheRows: SearchProduct[] = await res.json();

        const cacheFood: CacheResult[] = cacheRows
          .filter((r) => !r.is_alcohol && !r.is_supplement && !r.is_beauty)
          .map((r) => ({
            type: "food",
            barcode: r.barcode,
            name: r.product_name,
            brand: r.brand,
            score: r.gorilla_score,
            grade: r.score_grade,
          }));

        const cacheSuppRows: CacheResult[] = cacheRows
          .filter((r) => r.is_supplement)
          .slice(0, 4)
          .map((r) => ({
            type: "supplement",
            barcode: r.barcode,
            name: r.product_name,
            brand: r.brand,
            score: r.gorilla_score,
            grade: r.score_grade,
          }));

        // Merge: curated first, then cache (dedupe by barcode)
        const curatedBarcodes = new Set(curatedHits.map((c) => c.barcode));
        const mergedFood = [
          ...curatedHits,
          ...cacheFood.filter((c) => !curatedBarcodes.has(c.barcode)),
        ].slice(0, 8) as (CacheResult | CuratedFoodResult)[];

        const curatedSupplBarcodes = new Set(curatedSupplHits.map((c) => c.barcode));
        const mergedSuppl = [
          ...curatedSupplHits,
          ...cacheSuppRows.filter((c) => !curatedSupplBarcodes.has(c.barcode)),
        ].slice(0, 4);

        setResults({
          food: mergedFood,
          alcohol: beerHits,
          wine: wineHits,
          supplement: mergedSuppl,
        });
      }
    } catch {
      // Supabase unavailable — keep client-side results
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Notify parent whether search is "active" (dropdown open + 2+ chars typed)
  useEffect(() => {
    onActiveChange?.(open && query.length >= 2);
  }, [open, query, onActiveChange]);

  // Close on outside click/tap
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const totalResults =
    results.food.length + results.alcohol.length + results.wine.length + results.supplement.length;

  const getProductLink = (result: SearchResult): string => {
    const barcode = result.type === "food" || result.type === "supplement" || result.type === "beauty" || result.type === "curated-food"
      ? result.barcode
      : (result as AlcoholResult).barcode;
    if (barcode) return `/scan?b=${encodeURIComponent(barcode)}`;
    if (result.type === "alcohol" || result.type === "curated-food") {
      const r = result as AlcoholResult;
      return r.category === "Wines" ? "/alcohol" : "/alcohol";
    }
    return "/scan";
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* INPUT */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            cancelBlurClose();
            if (query.length >= 2) setOpen(true);
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full rounded-sm border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-slate-500 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
        />
        {loading && (
          <svg
            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gold/60"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* DROPDOWN */}
      {open && query.length >= 2 && (
        <div
          onMouseDown={cancelBlurClose}
          onTouchStart={cancelBlurClose}
          className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-[420px] overflow-y-auto rounded-sm border border-slate-700 bg-slate-900 shadow-2xl pb-24 sm:pb-0"
        >
          {totalResults === 0 && !loading ? (
            <p className="px-5 py-4 text-sm text-slate-400">
              No results for &quot;{query}&quot; — try scanning the barcode directly.
            </p>
          ) : (
            <>
              {/* FOOD */}
              {results.food.length > 0 && (
                <ResultGroup label="Food">
                  {results.food.map((r) => (
                    <ResultRow
                      key={r.barcode}
                      href={getProductLink(r)}
                      name={r.name}
                      sub={r.brand ?? ""}
                      right={
                        r.type === "food" && r.score !== null ? (
                          <span className={`font-display text-base ${gradeColor(r.grade)}`}>{r.score}</span>
                        ) : null
                      }
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}

              {/* ALCOHOL */}
              {results.alcohol.length > 0 && (
                <ResultGroup label="Beer & Alcohol">
                  {results.alcohol.map((r) => (
                    <ResultRow
                      key={r.id}
                      href={getProductLink(r)}
                      name={r.name}
                      sub={`${r.brand} · ${r.abv}% ABV`}
                      right={<GorillaPourMini rating={r.gorillaPour} />}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}

              {/* WINE */}
              {results.wine.length > 0 && (
                <ResultGroup label="Wine" accentClass="text-rose-400">
                  {results.wine.map((r) => (
                    <ResultRow
                      key={r.id}
                      href={getProductLink(r)}
                      name={r.name}
                      sub={`${r.brand} · ${r.abv}% ABV`}
                      right={<GorillaPourMini rating={r.gorillaPour} />}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}

              {/* SUPPLEMENTS */}
              {results.supplement.length > 0 && (
                <ResultGroup label="Supplements">
                  {results.supplement.map((r) => (
                    <ResultRow
                      key={r.barcode}
                      href={getProductLink(r)}
                      name={r.name}
                      sub={r.brand ?? ""}
                      right={
                        r.score !== null ? (
                          <span className={`font-display text-base ${gradeColor(r.grade)}`}>{r.score}</span>
                        ) : null
                      }
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}

              <div className="border-t border-slate-800 px-5 py-2.5">
                <Link
                  href="/scan"
                  onClick={() => setOpen(false)}
                  className="text-[11px] uppercase tracking-[0.18em] text-slate-500 hover:text-gold transition-colors"
                >
                  Scan a barcode instead →
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  accentClass = "text-gold/70",
  children,
}: {
  label: string;
  accentClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className={`border-b border-slate-800 px-5 py-2 text-[10px] uppercase tracking-[0.2em] ${accentClass}`}>
        {label}
      </p>
      {children}
    </div>
  );
}

function ResultRow({
  href,
  name,
  sub,
  right,
  onClick,
}: {
  href: string;
  name: string;
  sub: string;
  right?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-800"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{name}</p>
        {sub && <p className="truncate text-[11px] text-slate-400">{sub}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </Link>
  );
}
