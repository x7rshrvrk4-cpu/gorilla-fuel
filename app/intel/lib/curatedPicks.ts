// Cache-backed curated picks for /approved + /cheat. Reads the curated_picks
// table (the hand-approved barcode → tier list) and joins to gorilla_product_cache
// for name/brand/image/score — so the score shown is exactly the scanner's score.
//
// Read-only. Returns [] on any failure (table absent, network, misconfig) so the
// pages degrade gracefully to their editorial content with no curated section.

export type CuratedTier = "approved" | "cheat";

export type CuratedPick = {
  barcode: string;
  product_name: string | null;
  brand: string | null;
  gorilla_score: number | null;
  score_grade: string | null;
  image_url: string | null;
  rank: number;
};

export const CURATED_REVALIDATE = 3600;

function sbUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""; }
function sbKey() { return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""; }

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
      const ep = new URL(`${url}/rest/v1/gorilla_product_cache`);
      ep.searchParams.set("select", "barcode,product_name,brand,gorilla_score,score_grade,image_url");
      ep.searchParams.set("barcode", `in.(${group.join(",")})`);
      const r = await fetch(ep.toString(), { headers, next: { revalidate: CURATED_REVALIDATE } });
      if (r.ok) rows.push(...(await r.json()));
    }

    const merged: CuratedPick[] = rows.map((r) => ({
      barcode: String(r.barcode),
      product_name: (r.product_name as string) ?? null,
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
