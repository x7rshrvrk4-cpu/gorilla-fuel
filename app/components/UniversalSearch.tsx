"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { PRODUCTS as RANKED_SUPPLEMENTS } from "../rankings/lib/products";
import { INTEL_APPROVED, INTEL_CHEAT, INTEL_AVOID, type IntelProduct } from "../intel/lib/products";
import { KIDS_APPROVED, KIDS_CHEAT, KIDS_STAY_AWAY, type KidsProduct } from "../kids/lib/products";

const KIDS_ALL: KidsProduct[] = [...KIDS_APPROVED, ...KIDS_CHEAT, ...KIDS_STAY_AWAY];
import { searchCuratedFoods, searchCuratedSupplements } from "../scan/lib/curatedFoods";
import type { SearchProduct } from "../api/search/route";

const INTEL_ALL: { product: IntelProduct; path: string }[] = [
  ...INTEL_APPROVED.map((product) => ({ product, path: "/approved" })),
  ...INTEL_CHEAT.map((product) => ({ product, path: "/cheat" })),
  ...INTEL_AVOID.map((product) => ({ product, path: "/avoid" })),
];

type AlcoholResult = {
  type: "alcohol";
  id: string;
  name: string;
  brand: string;
  abv?: number;
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

type RankedSupplementResult = {
  type: "ranked-supplement";
  id: string;
  name: string;
  brand: string;
  grade: string;
};

type IntelResult = {
  type: "intel";
  id: string;
  name: string;
  path: string;
  score: number;
};

type KidsResult = {
  type: "kids";
  id: string;
  name: string;
  score: number;
};

type SearchResult = AlcoholResult | CacheResult | CuratedFoodResult | RankedSupplementResult | IntelResult | KidsResult;

type GroupedResults = {
  food: (CacheResult | CuratedFoodResult)[];
  alcohol: AlcoholResult[];
  wine: AlcoholResult[];
  supplement: CacheResult[];
  ranked: RankedSupplementResult[];
  intel: IntelResult[];
  kids: KidsResult[];
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
  const [results, setResults] = useState<GroupedResults>({ food: [], alcohol: [], wine: [], supplement: [], ranked: [], intel: [], kids: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mobile keyboard height (iOS Safari + Android Chrome) via visualViewport —
  // applied as dropdown bottom padding so results aren't hidden behind it.
  const [keyboardPad, setKeyboardPad] = useState(0);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;
    const update = () => {
      const overlap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardPad(overlap > 80 ? overlap : 0); // ignore tiny browser-chrome shifts
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

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
      setResults({ food: [], alcohol: [], wine: [], supplement: [], ranked: [], intel: [], kids: [] });
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    const ql = q.toLowerCase();

    // Token matching: every query word must appear somewhere in name+brand,
    // order-independent — so "Thorne Creatine" finds brand "Thorne" + name
    // "Creatine", and "Santa Carolina Cabernet" finds "Santa Carolina Reserva
    // Cabernet Sauvignon" even though the words aren't contiguous.
    const tokens = ql.split(/\s+/).filter(Boolean);
    const matchesTokens = (hay: string) => tokens.every((t) => hay.includes(t));

    // ── Client-side: alcohol (instant) ──────────────────────────────────────
    // Token-match the FULL list, THEN split wine vs beer, THEN cap each group
    // independently. Capping before the split let beers consume the limit and
    // crowd out wines, which live at the end of ALCOHOL_PRODUCTS (bulk wine
    // batches) — so common brand/grape queries never reached them.
    const toAlcoholResult = (p: (typeof ALCOHOL_PRODUCTS)[number]): AlcoholResult => ({
      type: "alcohol",
      id: p.id,
      name: p.name,
      brand: p.brand,
      abv: p.abv,
      gorillaPour: p.gorillaPour,
      category: p.category,
      barcode: p.barcodes?.[0],
    });

    const alcoholMatches = ALCOHOL_PRODUCTS.filter((p) =>
      matchesTokens(`${p.name} ${p.brand}`.toLowerCase())
    );
    const wineHits = alcoholMatches
      .filter((p) => p.category === "Wines")
      .slice(0, 6)
      .map(toAlcoholResult);
    const beerHits = alcoholMatches
      .filter((p) => p.category !== "Wines")
      .slice(0, 6)
      .map(toAlcoholResult);

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

    // ── Client-side: ranked supplements (rankings hub) ───────────────────────
    const rankedHits: RankedSupplementResult[] = RANKED_SUPPLEMENTS.filter((p) =>
      matchesTokens(`${p.name} ${p.brand}`.toLowerCase())
    )
      .slice(0, 4)
      .map((p) => ({ type: "ranked-supplement", id: p.id, name: p.name, brand: p.brand, grade: p.grade }));

    // ── Client-side: Gorilla Intel tiers ─────────────────────────────────────
    const intelHits: IntelResult[] = INTEL_ALL.filter(({ product }) =>
      matchesTokens(`${product.name} ${product.brand}`.toLowerCase())
    )
      .slice(0, 3)
      .map(({ product, path }) => ({ type: "intel", id: product.id, name: product.name, path, score: product.score }));

    // ── Client-side: Kids section ────────────────────────────────────────────
    const kidsHits: KidsResult[] = KIDS_ALL.filter((p) => matchesTokens(p.name.toLowerCase()))
      .slice(0, 3)
      .map((p) => ({ type: "kids", id: p.id, name: p.name, score: p.score }));

    // Optimistically render what we have before Supabase returns
    setResults({ food: curatedHits, alcohol: beerHits, wine: wineHits, supplement: curatedSupplHits, ranked: rankedHits, intel: intelHits, kids: kidsHits });

    // ── Async: Supabase cache search ─────────────────────────────────────────
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const cacheRows: SearchProduct[] = await res.json();
        // No new data — skip the second render so dropdown rows aren't
        // replaced mid-tap (the cause of "tapping a result does nothing").
        if (cacheRows.length === 0) return;

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
          ranked: rankedHits,
          intel: intelHits,
          kids: kidsHits,
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
    results.food.length + results.alcohol.length + results.wine.length +
    results.supplement.length + results.ranked.length + results.intel.length + results.kids.length;

  const getProductLink = (result: SearchResult): string => {
    // Deep links: every result lands on its own card, never the homepage.
    if (result.type === "alcohol") {
      return `/alcohol?p=${encodeURIComponent(result.id)}`;
    }
    if (result.type === "ranked-supplement") {
      return `/rankings?p=${encodeURIComponent(result.id)}`;
    }
    if (result.type === "intel") {
      return `${result.path}?p=${encodeURIComponent(result.id)}`;
    }
    if (result.type === "kids") {
      return `/kids?p=${encodeURIComponent(result.id)}`;
    }
    const barcode = result.type === "food" || result.type === "supplement" || result.type === "beauty" || result.type === "curated-food"
      ? result.barcode
      : undefined;
    if (barcode) return `/scan?b=${encodeURIComponent(barcode)}`;
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
          style={keyboardPad > 0 ? { paddingBottom: keyboardPad } : undefined}
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
                      sub={r.abv !== undefined ? `${r.brand} · ${r.abv}% ABV` : r.brand}
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
                      sub={r.abv !== undefined ? `${r.brand} · ${r.abv}% ABV` : r.brand}
                      right={<GorillaPourMini rating={r.gorillaPour} />}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}

              {/* RANKED SUPPLEMENTS */}
              {results.ranked.length > 0 && (
                <ResultGroup label="Supplement Rankings">
                  {results.ranked.map((r) => (
                    <ResultRow
                      key={r.id}
                      href={getProductLink(r)}
                      name={r.name}
                      sub={r.brand}
                      right={<span className="font-display text-base text-gold">{r.grade}</span>}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}

              {/* GORILLA INTEL */}
              {results.intel.length > 0 && (
                <ResultGroup label="Gorilla Intel" accentClass="text-emerald-400/80">
                  {results.intel.map((r) => (
                    <ResultRow
                      key={`intel-${r.id}`}
                      href={getProductLink(r)}
                      name={r.name}
                      sub={r.path === "/approved" ? "Gorilla Approved" : r.path === "/cheat" ? "Cheat List" : "Stay Away"}
                      right={<span className={`font-display text-base ${r.score >= 70 ? "text-emerald-400" : r.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{r.score}</span>}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}

              {/* KIDS */}
              {results.kids.length > 0 && (
                <ResultGroup label="Kids Snacks" accentClass="text-sky-300/80">
                  {results.kids.map((r) => (
                    <ResultRow
                      key={`kids-${r.id}`}
                      href={getProductLink(r)}
                      name={r.name}
                      sub="Kids Snack Guide"
                      right={<span className={`font-display text-base ${r.score >= 70 ? "text-emerald-400" : r.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{r.score}</span>}
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
      // iOS Safari: when the search input is focused (keyboard up), the first
      // tap on a dropdown item is otherwise consumed by blurring the input /
      // dismissing the keyboard — and the visualViewport reflow shifts the row
      // out from under the finger, so the link's click never fires ("tap does
      // nothing"). Preventing default on pointer/mouse-down stops the input
      // from blurring, so the keyboard stays, the row doesn't move, and the
      // click reliably navigates. Using mousedown (not pointerdown/touchstart)
      // is deliberate: Safari fires it before blur and honours preventDefault
      // for focus, but it does NOT cancel the resulting click/navigation.
      onMouseDown={(e) => e.preventDefault()}
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
