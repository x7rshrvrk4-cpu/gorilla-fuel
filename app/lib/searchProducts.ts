// Shared product-search matcher — single source of truth used by both the live
// dropdown (UniversalSearch, small per-group caps) and the full results page
// (/search, uncapped). Pure functions + types only, no JSX.

import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { PRODUCTS as RANKED_SUPPLEMENTS } from "../rankings/lib/products";
import { INTEL_APPROVED, INTEL_CHEAT, INTEL_AVOID, type IntelProduct } from "../intel/lib/products";
import { KIDS_APPROVED, KIDS_CHEAT, KIDS_STAY_AWAY, type KidsProduct } from "../kids/lib/products";
import { searchCuratedFoods, searchCuratedSupplements } from "../scan/lib/curatedFoods";
import { gradeFromScore } from "../scan/lib/scoring";
import type { SearchProduct } from "../api/search/route";

const KIDS_ALL: KidsProduct[] = [...KIDS_APPROVED, ...KIDS_CHEAT, ...KIDS_STAY_AWAY];

const INTEL_ALL: { product: IntelProduct; path: string }[] = [
  ...INTEL_APPROVED.map((product) => ({ product, path: "/approved" })),
  ...INTEL_CHEAT.map((product) => ({ product, path: "/cheat" })),
  ...INTEL_AVOID.map((product) => ({ product, path: "/avoid" })),
];

export type AlcoholResult = {
  type: "alcohol";
  id: string;
  name: string;
  brand: string;
  abv?: number;
  gorillaPour: number;
  category: string;
  barcode?: string;
};

export type CacheResult = {
  type: "food" | "supplement" | "beauty" | "alcohol-cache";
  barcode: string;
  name: string;
  brand: string | null;
  score: number | null;
  grade: string | null;
};

export type CuratedFoodResult = {
  type: "curated-food";
  barcode: string;
  name: string;
  brand: string;
};

export type RankedSupplementResult = {
  type: "ranked-supplement";
  id: string;
  name: string;
  brand: string;
  grade: string;
};

export type IntelResult = {
  type: "intel";
  id: string;
  name: string;
  path: string;
  score: number;
};

export type KidsResult = {
  type: "kids";
  id: string;
  name: string;
  score: number;
};

export type SearchResult =
  | AlcoholResult
  | CacheResult
  | CuratedFoodResult
  | RankedSupplementResult
  | IntelResult
  | KidsResult;

export type GroupedResults = {
  food: (CacheResult | CuratedFoodResult)[];
  // Curated alcohol (AlcoholResult) plus scanned alcohol rows from the product
  // cache (CacheResult, type "alcohol-cache"), same union shape as `food`.
  alcohol: (AlcoholResult | CacheResult)[];
  wine: AlcoholResult[];
  supplement: CacheResult[];
  ranked: RankedSupplementResult[];
  intel: IntelResult[];
  kids: KidsResult[];
};

export function emptyGrouped(): GroupedResults {
  return { food: [], alcohol: [], wine: [], supplement: [], ranked: [], intel: [], kids: [] };
}

export function gradeColor(grade: string | null): string {
  switch (grade) {
    case "A+": case "A": return "text-emerald-400";
    case "B+": case "B": return "text-green-400";
    case "C": return "text-amber-400";
    case "D": return "text-orange-400";
    case "F": return "text-red-400";
    default: return "text-slate-400";
  }
}

/** Deep links: every result lands on its own card, never the homepage. */
export function getProductLink(result: SearchResult): string {
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
  const barcode =
    result.type === "food" || result.type === "supplement" || result.type === "beauty" || result.type === "alcohol-cache" || result.type === "curated-food"
      ? result.barcode
      : undefined;
  if (barcode) return `/scan?b=${encodeURIComponent(barcode)}`;
  return "/scan";
}

/** Map a Supabase cache row to a CacheResult (food/beauty). */
export function cacheRowToFood(r: SearchProduct): CacheResult {
  // Derive the food tier from the numeric score (unchanged) so search labels track
  // the current 4-tier cutoffs, not the stale stored score_grade string.
  return { type: "food", barcode: r.barcode, name: r.product_name, brand: r.brand, score: r.gorilla_score, grade: r.gorilla_score != null ? gradeFromScore(r.gorilla_score) : null };
}

/** Map a Supabase cache row to a CacheResult (supplement). */
export function cacheRowToSupplement(r: SearchProduct): CacheResult {
  return { type: "supplement", barcode: r.barcode, name: r.product_name, brand: r.brand, score: r.gorilla_score, grade: r.score_grade };
}

/** Map a Supabase cache row to a CacheResult (scanned alcohol). Alcohol keeps its own
 *  grade vocabulary, so pass the stored score_grade through as-is (same as supplement). */
export function cacheRowToAlcohol(r: SearchProduct): CacheResult {
  return { type: "alcohol-cache", barcode: r.barcode, name: r.product_name, brand: r.brand, score: r.gorilla_score, grade: r.score_grade };
}

/** Per-group caps. Omitted/undefined = uncapped (results page); the dropdown
 *  passes its exact small caps so its behavior is unchanged. */
export type CuratedCaps = {
  wine?: number;
  beer?: number;
  food?: number;
  supplement?: number;
  ranked?: number;
  intel?: number;
  kids?: number;
};

/**
 * Curated/client-side matcher — searches the in-repo catalogues (alcohol,
 * curated foods + supplements, ranked supplements, Gorilla Intel, Kids) using
 * order-independent token matching on name + brand. Returns curated-only
 * groups; cache results are merged in separately by the caller.
 */
export function searchCurated(q: string, caps: CuratedCaps = {}): GroupedResults {
  if (q.trim().length < 2) return emptyGrouped();
  const ql = q.toLowerCase();
  const tokens = ql.split(/\s+/).filter(Boolean);
  const matchesTokens = (hay: string) => tokens.every((t) => hay.includes(t));

  const cap = (n: number | undefined) => (n === undefined ? Infinity : n);

  // ── Alcohol: token-match the full list, split wine vs beer, cap each group ──
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
  const alcoholMatches = ALCOHOL_PRODUCTS.filter((p) => matchesTokens(`${p.name} ${p.brand}`.toLowerCase()));
  const wine = alcoholMatches.filter((p) => p.category === "Wines").slice(0, cap(caps.wine)).map(toAlcoholResult);
  const alcohol = alcoholMatches.filter((p) => p.category !== "Wines").slice(0, cap(caps.beer)).map(toAlcoholResult);

  // ── Curated foods + supplements ──
  const food: CuratedFoodResult[] = searchCuratedFoods(q, cap(caps.food)).map((e) => ({
    type: "curated-food",
    barcode: e.barcode,
    name: e.name,
    brand: e.brand,
  }));
  const supplement: CacheResult[] = searchCuratedSupplements(q, cap(caps.supplement)).map((e) => ({
    type: "supplement",
    barcode: e.barcode,
    name: e.name,
    brand: e.brand,
    score: null,
    grade: null,
  }));

  // ── Ranked supplements ──
  const ranked: RankedSupplementResult[] = RANKED_SUPPLEMENTS.filter((p) =>
    matchesTokens(`${p.name} ${p.brand}`.toLowerCase())
  )
    .slice(0, cap(caps.ranked))
    .map((p) => ({ type: "ranked-supplement", id: p.id, name: p.name, brand: p.brand, grade: p.grade }));

  // ── Gorilla Intel tiers ──
  const intel: IntelResult[] = INTEL_ALL.filter(({ product }) =>
    matchesTokens(`${product.name} ${product.brand}`.toLowerCase())
  )
    .slice(0, cap(caps.intel))
    .map(({ product, path }) => ({ type: "intel", id: product.id, name: product.name, path, score: product.score }));

  // ── Kids section ──
  const kids: KidsResult[] = KIDS_ALL.filter((p) => matchesTokens(p.name.toLowerCase()))
    .slice(0, cap(caps.kids))
    .map((p) => ({ type: "kids", id: p.id, name: p.name, score: p.score }));

  return { food, alcohol, wine, supplement, ranked, intel, kids };
}
