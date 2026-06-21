// Single source of truth for the "Top Scored" ranking, shared by the /top page
// and the home-page "Top Rated Foods" rail so they can never diverge.
//
// Behaviour is preserved EXACTLY from the original inline /top implementation:
// scored food rows, gorilla_score >= 75, non-alcohol / non-beauty, junk/blank
// name filtered (NO name dedup, seasonings kept). Fetched in ONE query ordered
// by (gorilla_score desc, barcode asc) — a stable, unique secondary key, so there
// is no non-unique-pagination artifact — then sorted in memory by score desc →
// (protein + fiber) density desc → barcode, and sliced to `limit`.

export const TOP_REVALIDATE = 3600;

export type CacheRow = {
  barcode: string;
  product_name: string | null;
  brand: string | null;
  gorilla_score: number | null;
  score_grade: string | null;
  image_url: string | null;
  nutrition_data: Record<string, number | undefined> | null;
};

function normBc(b: string) { return b.replace(/\D/g, "").replace(/^0+/, "") || "0"; }
function isJunkBarcode(bc: string) {
  const d = bc.replace(/\D/g, "");
  return d.length < 8 || /^0+$/.test(d) || normBc(bc).length < 5;
}
function isGarbageName(name: string | null) {
  const n = (name ?? "").trim();
  if (n.length < 3) return true;
  if (!/[a-zA-Z]{3,}/.test(n)) return true;
  if (/^(test|tester|xxx|aaa|dummy|sample|unknown|n\/a|na|tbd|product|produit|item|untitled|no name|sans nom)\b/i.test(n)) return true;
  return false;
}

/** Read a finite numeric nutriment value from the jsonb blob, or null. */
export const macro = (n: CacheRow["nutrition_data"], k: string): number | null =>
  n && typeof n[k] === "number" && Number.isFinite(n[k]) ? (n[k] as number) : null;

/**
 * Top `limit` food products by Gorilla Score, then (protein + fiber) density,
 * then barcode (deterministic). Read-only on the cache. Returns [] on any
 * failure so callers degrade gracefully (empty state / hidden rail).
 */
export async function getTopOverall(limit: number): Promise<CacheRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const endpoint = new URL(`${url}/rest/v1/gorilla_product_cache`);
    endpoint.searchParams.set(
      "select",
      "barcode,product_name,brand,gorilla_score,score_grade,image_url,nutrition_data"
    );
    endpoint.searchParams.set("gorilla_score", "gte.75");
    endpoint.searchParams.set("is_alcohol", "eq.false");
    endpoint.searchParams.set("is_beauty", "eq.false");
    // Exclude supplements: the food engine is miscalibrated for them (scoring a
    // protein tub on sugar/sat-fat bands is meaningless), so their scores are
    // invalid for a foods ranking.
    endpoint.searchParams.set("is_supplement", "eq.false");
    endpoint.searchParams.set("order", "gorilla_score.desc,barcode.asc"); // stable, non-artifact
    endpoint.searchParams.set("limit", "1000");
    const res = await fetch(endpoint.toString(), {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
      next: { revalidate: TOP_REVALIDATE },
    });
    if (!res.ok) return [];
    const rows: CacheRow[] = await res.json();
    const tb = (r: CacheRow) => (macro(r.nutrition_data, "proteins_100g") ?? 0) + (macro(r.nutrition_data, "fiber_100g") ?? 0);
    return rows
      .filter((r) => !isJunkBarcode(r.barcode) && !isGarbageName(r.product_name))
      .sort((a, b) =>
        (b.gorilla_score! - a.gorilla_score!) || (tb(b) - tb(a)) || a.barcode.localeCompare(b.barcode)
      )
      .slice(0, limit);
  } catch {
    return [];
  }
}
