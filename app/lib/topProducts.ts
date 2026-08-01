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
  /** Display-only English name (Phase A backfill); render via display_name_en ?? product_name.
   *  Never read by scoring — the scorer reads product_name. */
  display_name_en?: string | null;
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
    const build = (withEn: boolean, withCountry: boolean) => {
      const endpoint = new URL(`${url}/rest/v1/gorilla_product_cache`);
      endpoint.searchParams.set(
        "select",
        `barcode,product_name,${withEn ? "display_name_en," : ""}brand,gorilla_score,score_grade,image_url,nutrition_data`
      );
      endpoint.searchParams.set("gorilla_score", "gte.75");
      endpoint.searchParams.set("is_alcohol", "eq.false");
      endpoint.searchParams.set("is_beauty", "eq.false");
      // Exclude supplements: the food engine is miscalibrated for them (scoring a
      // protein tub on sugar/sat-fat bands is meaningless), so their scores are
      // invalid for a foods ranking.
      endpoint.searchParams.set("is_supplement", "eq.false");
      // Canada-first ranking (Phase-1 UK expansion). Keep a row when it is NOT a
      // UK-tagged import: countries_tags is NULL (every pre-Phase-1 row — no
      // backfill), OR it also carries "canada" (dual-market products stay), OR it
      // simply doesn't contain "united-kingdom". Only a row that is UK-tagged AND
      // not Canada-tagged is dropped. This touches ONLY the Top ranking — search
      // (/api/search) and scan never call getTopOverall, so UK products remain
      // fully searchable and scannable. Encoding is JSON-in-text, so substring
      // ilike on "united-kingdom"/"canada" matches the stored tag values.
      if (withCountry) {
        endpoint.searchParams.set(
          "or",
          "(countries_tags.is.null,countries_tags.ilike.*canada*,countries_tags.not.ilike.*united-kingdom*)"
        );
      }
      endpoint.searchParams.set("order", "gorilla_score.desc,barcode.asc"); // stable, non-artifact
      endpoint.searchParams.set("limit", "1000");
      return endpoint;
    };
    const opts = { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" }, next: { revalidate: TOP_REVALIDATE } };
    // Two independent optional columns (display_name_en, countries_tags) may not
    // exist yet depending on migration order. Degrade gracefully so /top never
    // breaks: drop the country filter first (newest column), then the en select.
    // The country filter is Canada-first; if it can't run yet, the page shows the
    // pre-UK behaviour (everything) rather than an empty ranking.
    let res = await fetch(build(true, true).toString(), opts);
    if (!res.ok) res = await fetch(build(true, false).toString(), opts);
    if (!res.ok) res = await fetch(build(false, true).toString(), opts);
    if (!res.ok) res = await fetch(build(false, false).toString(), opts);
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
