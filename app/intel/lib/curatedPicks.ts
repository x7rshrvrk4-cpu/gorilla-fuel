// Cache-backed curated picks for /approved + /cheat. Reads the curated_picks
// table (the hand-approved barcode → tier list) and joins to gorilla_product_cache
// for name/brand/image/score — so the score shown is exactly the scanner's score.
//
// Read-only. Returns [] on any failure (table absent, network, misconfig) so the
// pages degrade gracefully to their editorial content with no curated section.

export type CuratedTier = "approved" | "cheat" | "avoid";

export type CuratedPick = {
  barcode: string;
  product_name: string | null;
  /** Display-only English name (Phase A); render via display_name_en ?? product_name. */
  display_name_en?: string | null;
  brand: string | null;
  gorilla_score: number | null;
  score_grade: string | null;
  image_url: string | null;
  rank: number;
};

export const CURATED_REVALIDATE = 3600;

function sbUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""; }
function sbKey() { return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""; }

const normBarcode = (b: string) => b.replace(/\D/g, "").replace(/^0+/, "") || "0";

/**
 * Per-barcode allowlist for Amazon affiliate links on the curated grid. ONLY
 * national-brand, shelf-stable products get a tagged search link — retailer
 * house brands, perishables (fresh produce/dairy/eggs/bread), and obscure or
 * not-yet-reviewed items stay link-free. Barcodes are stored normalized (digits,
 * leading zeros stripped). Add more here as you review additional picks.
 */
const AMAZON_LINK_BARCODES = new Set<string>([
  "39978002167", "39978004949", "39978325464", "5000354926662", "55000207669",
  "55577101100", "55577101681", "55577331002", "55900002265", "58854431105",
  "59443200218", "59443602166", "62356501198", "62356543006", "627843610229",
  "628451868729", "64200130738", "64200130790", "64821122808", "66200020118",
  "6717401", "68062021388", "68062021517", "685666003307", "692991201339",
  "70177229993", "722252121479", "72878290470", "74410518790", "76808011036",
  "770795520884", "779921000658", "8033406261210", "807176540572", "812582000527",
  "833125001108", "8332669642065", "848860046246", "85981311659", "8734963003649",
  "877693003454", "886930000323", "9765800001", "98100010012", "990312098164",
]);

/** True when this product is on the affiliate-link allowlist. */
export function hasAmazonLink(barcode: string): boolean {
  return AMAZON_LINK_BARCODES.has(normBarcode(barcode));
}

/** Chunk an array into groups of `size` (keeps PostgREST in.() URLs bounded). */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Hand-approved curated products for a tier, joined to the live cache and sorted
 * by rank (asc), then score (desc), then barcode. Returns [] on any failure.
 */
export async function getCuratedPicks(tier: CuratedTier): Promise<CuratedPick[]> {
  const url = sbUrl(), key = sbKey();
  if (!url || !key) return [];
  const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" };
  try {
    // 1) the approved barcode → rank list for this tier
    const pickEndpoint = new URL(`${url}/rest/v1/curated_picks`);
    pickEndpoint.searchParams.set("select", "barcode,rank");
    pickEndpoint.searchParams.set("tier", `eq.${tier}`);
    pickEndpoint.searchParams.set("order", "rank.asc");
    const pickRes = await fetch(pickEndpoint.toString(), { headers, next: { revalidate: CURATED_REVALIDATE } });
    if (!pickRes.ok) return [];
    const picks: Array<{ barcode: string; rank: number }> = await pickRes.json();
    if (!picks.length) return [];
    const rankBy = new Map(picks.map((p) => [p.barcode, p.rank ?? 0]));

    // 2) live cache rows for those barcodes (chunked in.() lookups)
    const rows: Record<string, unknown>[] = [];
    for (const group of chunk(picks.map((p) => p.barcode), 150)) {
      const build = (withEn: boolean) => {
        const ep = new URL(`${url}/rest/v1/gorilla_product_cache`);
        ep.searchParams.set("select", `barcode,product_name,${withEn ? "display_name_en," : ""}brand,gorilla_score,score_grade,image_url`);
        ep.searchParams.set("barcode", `in.(${group.join(",")})`);
        return ep;
      };
      // Prefer the English display column; fall back without it (works pre-Phase-A column).
      let r = await fetch(build(true).toString(), { headers, next: { revalidate: CURATED_REVALIDATE } });
      if (!r.ok) r = await fetch(build(false).toString(), { headers, next: { revalidate: CURATED_REVALIDATE } });
      if (r.ok) rows.push(...(await r.json()));
    }

    const merged: CuratedPick[] = rows.map((r) => ({
      barcode: String(r.barcode),
      product_name: (r.product_name as string) ?? null,
      display_name_en: (r.display_name_en as string) ?? null,
      brand: (r.brand as string) ?? null,
      gorilla_score: (r.gorilla_score as number) ?? null,
      score_grade: (r.score_grade as string) ?? null,
      image_url: (r.image_url as string) ?? null,
      rank: rankBy.get(String(r.barcode)) ?? 0,
    }));

    return merged.sort(
      (a, b) => a.rank - b.rank || (b.gorilla_score ?? 0) - (a.gorilla_score ?? 0) || a.barcode.localeCompare(b.barcode)
    );
  } catch {
    return [];
  }
}
