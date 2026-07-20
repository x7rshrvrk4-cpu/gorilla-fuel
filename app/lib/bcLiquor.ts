// Read-only access to the bc_liquor staging table (BC Liquor Distribution Branch
// product price list, ~8,224 rows). Powers the /bc-liquor browse page.
//
// AUTH: bc_liquor has RLS enabled with NO public policy (service-role-only by
// design — see supabase/bc_liquor.sql), so the anon/publishable key returns zero
// rows. These helpers run ONLY in server components and read with the service-role
// key, which stays on the server and is never shipped to the browser. If the key
// is absent (e.g. a preview env without it set) every helper degrades to empty,
// so the page renders a graceful empty state instead of crashing.
//
// FILTERING: all facets are applied SERVER-SIDE via PostgREST (like the original
// `kind` filter), NOT client-side — because a facet like "BC Wine" (837 rows) can
// exceed the per-view page cap, so client filtering over one loaded page would miss
// matches. Every filter maps to a real, structured BCLDB column; there is no
// editorial/derived data here (see the /bc-liquor curation audit).

export const BC_REVALIDATE = 3600;

export const BC_KINDS = ["wine", "spirits", "beer", "cider", "refreshment", "other"] as const;
export type BcKind = (typeof BC_KINDS)[number];

// Wine style — derived from the class column, which follows a catalogue-wide
// "<origin> <Style> Wine" pattern (e.g. "France Red Wine", "Canada - BC Ice Wine"),
// so this facet applies to ALL wines, not just BC. Matched via ILIKE "%<token>%".
export const WINE_STYLES = [
  { key: "red", label: "Red", token: "Red Wine" },
  { key: "white", label: "White", token: "White Wine" },
  { key: "rose", label: "Rosé", token: "Rose Wine" },
  { key: "sparkling", label: "Sparkling", token: "Sparkling Wine" },
  { key: "ice", label: "Ice", token: "Ice Wine" },
  { key: "dessert", label: "Dessert", token: "Dessert Wine" },
  { key: "fruit", label: "Fruit", token: "Fruit Wine" },
] as const;

// Sweetness — BCLDB publishes a numeric 0–10 sweetness_code (higher = sweeter) but
// does NOT publish the label boundaries. These buckets are an approximation of the
// standard dry→sweet convention, calibrated against the actual data: dry table wines
// sit at 0, off-dry/Late-Harvest climb through the middle, and Ice/dessert wines land
// at 10 (verified: BC icewines are code 10). Boundaries are our reasonable mapping,
// not an official BCLDB scale — adjust if BCLDB documents exact cut points.
export const SWEETNESS_BUCKETS = [
  { key: "dry", label: "Dry", codes: ["0"] },
  { key: "offdry", label: "Off-Dry", codes: ["1", "2"] },
  { key: "medium", label: "Medium", codes: ["3", "4", "5"] },
  { key: "sweet", label: "Sweet", codes: ["6", "7", "8", "9"] },
  { key: "verysweet", label: "Very Sweet", codes: ["10"] },
] as const;

// BC craft-beer tier — the class column encodes a genuine macro→craft tier for
// BC-made beer. Exact strings verified from the data.
export const BEER_TIERS = [
  { key: "micro", label: "Micro Brew", cls: "Domestic - BC Micro Brew Beer" },
  { key: "regional", label: "Regional", cls: "Domestic - BC Regional Beer" },
  { key: "commercial", label: "Commercial", cls: "Domestic - BC Commercial Beer" },
] as const;

// BC-made wine is flagged by this exact subcategory value (837 rows, all wine).
export const BC_WINE_SUBCATEGORY = "Canada - BC";

export type BcFilters = {
  kind: string | null;
  bcWine: boolean; // BC-made wine (subcategory = "Canada - BC")
  style: string | null; // WINE_STYLES key
  sweet: string | null; // SWEETNESS_BUCKETS key
  tier: string | null; // BEER_TIERS key
  country: string | null; // exact country_origin
};

export type BcLiquorRow = {
  barcode: string | null;
  product_name: string | null;
  category: string | null;
  kind: string | null;
  subcategory: string | null;
  class: string | null;
  abv: number | null;
  price: number | null;
  litres_per_container: number | null;
  country_origin: string | null;
  sweetness_code: string | null;
};

export type BcCounts = {
  total: number;
  withBarcode: number;
  byKind: Record<string, number>;
  bcWine: number;
  beerTiers: Record<string, number>;
};

function creds(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // service-role: bypasses RLS, server-only
  return url && key ? { url, key } : null;
}

/** Apply the active facets to a PostgREST endpoint's search params (shared by the
 *  row fetch and the count so they always agree). */
function applyFilters(ep: URL, f: BcFilters) {
  if (f.kind && (BC_KINDS as readonly string[]).includes(f.kind)) ep.searchParams.set("kind", `eq.${f.kind}`);
  if (f.bcWine) ep.searchParams.set("subcategory", `eq.${BC_WINE_SUBCATEGORY}`);
  if (f.style) {
    const s = WINE_STYLES.find((x) => x.key === f.style);
    if (s) ep.searchParams.set("class", `ilike.*${s.token}*`);
  }
  if (f.tier) {
    const t = BEER_TIERS.find((x) => x.key === f.tier);
    if (t) ep.searchParams.set("class", `eq.${t.cls}`); // note: overrides style if both set (tier is beer-only, style wine-only)
  }
  if (f.sweet) {
    const b = SWEETNESS_BUCKETS.find((x) => x.key === f.sweet);
    if (b) ep.searchParams.set("sweetness_code", `in.(${b.codes.join(",")})`);
  }
  if (f.country) ep.searchParams.set("country_origin", `eq.${f.country}`);
}

const EMPTY_FILTERS: BcFilters = { kind: null, bcWine: false, style: null, sweet: null, tier: null, country: null };

/** Exact row count for a filter set, via PostgREST count=exact + Content-Range. */
async function countRows(c: { url: string; key: string }, f: BcFilters): Promise<number> {
  const ep = new URL(`${c.url}/rest/v1/bc_liquor`);
  ep.searchParams.set("select", "barcode");
  applyFilters(ep, f);
  const res = await fetch(ep.toString(), {
    headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, Prefer: "count=exact", Range: "0-0" },
    next: { revalidate: BC_REVALIDATE },
  });
  const cr = res.headers.get("content-range"); // e.g. "0-0/8224"
  if (!cr || !cr.includes("/")) return 0;
  const n = parseInt(cr.split("/")[1], 10);
  return Number.isFinite(n) ? n : 0;
}

/** Count for an arbitrary single-filter (helper for facet tallies). */
async function countWith(c: { url: string; key: string }, patch: Partial<BcFilters>): Promise<number> {
  return countRows(c, { ...EMPTY_FILTERS, ...patch });
}

/** Total / barcode / per-kind counts + the headline facet tallies (BC wine, beer tiers). */
export async function getBcLiquorCounts(): Promise<BcCounts> {
  const c = creds();
  const empty: BcCounts = { total: 0, withBarcode: 0, byKind: {}, bcWine: 0, beerTiers: {} };
  if (!c) return empty;
  try {
    const kinds = BC_KINDS;
    const results = await Promise.all([
      countRows(c, EMPTY_FILTERS), // total
      (async () => {
        const ep = new URL(`${c.url}/rest/v1/bc_liquor`);
        ep.searchParams.set("select", "barcode");
        ep.searchParams.set("barcode", "not.is.null");
        const res = await fetch(ep.toString(), { headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, Prefer: "count=exact", Range: "0-0" }, next: { revalidate: BC_REVALIDATE } });
        const cr = res.headers.get("content-range");
        return cr && cr.includes("/") ? parseInt(cr.split("/")[1], 10) || 0 : 0;
      })(),
      ...kinds.map((k) => countWith(c, { kind: k })),
      countWith(c, { kind: "wine", bcWine: true }), // BC wine
      ...BEER_TIERS.map((t) => countWith(c, { kind: "beer", tier: t.key })),
    ]);
    let i = 0;
    const total = results[i++];
    const withBarcode = results[i++];
    const byKind: Record<string, number> = {};
    kinds.forEach((k) => (byKind[k] = results[i++]));
    const bcWine = results[i++];
    const beerTiers: Record<string, number> = {};
    BEER_TIERS.forEach((t) => (beerTiers[t.key] = results[i++]));
    return { total, withBarcode, byKind, bcWine, beerTiers };
  } catch {
    return empty;
  }
}

/** Distinct country_origin values with counts, for the country facet dropdown.
 *  Pages the single column and aggregates; cached hourly. */
export async function getBcCountries(): Promise<{ country: string; count: number }[]> {
  const c = creds();
  if (!c) return [];
  try {
    const counts: Record<string, number> = {};
    for (let off = 0; off < 9000; off += 1000) {
      const ep = new URL(`${c.url}/rest/v1/bc_liquor`);
      ep.searchParams.set("select", "country_origin");
      const res = await fetch(ep.toString(), {
        headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, Range: `${off}-${off + 999}`, Accept: "application/json" },
        next: { revalidate: BC_REVALIDATE },
      });
      if (!res.ok) break;
      const page = (await res.json()) as { country_origin: string | null }[];
      for (const r of page) {
        const co = r.country_origin;
        if (co) counts[co] = (counts[co] ?? 0) + 1;
      }
      if (page.length < 1000) break;
    }
    return Object.entries(counts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

/**
 * A page of products for the active filter set, ordered by name. Capped at `limit`
 * (default 500) — the catalogue is ~8,224 rows; the UI shows "first N of <count>"
 * and the facets narrow the set. All filtering is server-side.
 */
export async function getBcLiquor(f: BcFilters, limit = 500): Promise<BcLiquorRow[]> {
  const c = creds();
  if (!c) return [];
  try {
    const ep = new URL(`${c.url}/rest/v1/bc_liquor`);
    ep.searchParams.set("select", "barcode,product_name,category,kind,subcategory,class,abv,price,litres_per_container,country_origin,sweetness_code");
    applyFilters(ep, f);
    ep.searchParams.set("order", "product_name.asc.nullslast");
    ep.searchParams.set("limit", String(limit));
    const res = await fetch(ep.toString(), {
      headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, Accept: "application/json" },
      next: { revalidate: BC_REVALIDATE },
    });
    if (!res.ok) return [];
    return (await res.json()) as BcLiquorRow[];
  } catch {
    return [];
  }
}

/** Count for the currently-active filter combination (for the "first N of M" line). */
export async function getBcLiquorFilteredCount(f: BcFilters): Promise<number> {
  const c = creds();
  if (!c) return 0;
  try {
    return await countRows(c, f);
  } catch {
    return 0;
  }
}
