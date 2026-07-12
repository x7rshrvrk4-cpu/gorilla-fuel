import { type NextRequest, NextResponse } from "next/server";
import { gradeFromScore } from "../../scan/lib/scoring";

export type SearchProduct = {
  barcode: string;
  product_name: string;
  brand: string | null;
  gorilla_score: number | null;
  score_grade: string | null;
  is_alcohol: boolean;
  is_supplement: boolean;
  is_beauty: boolean;
};

/**
 * GET /api/search?q=<query>[&limit=N]
 * Searches gorilla_product_cache by product_name, brand, or barcode.
 * Returns up to `limit` results (default 10 — used by the live dropdown; the
 * full results page passes a larger limit). Minimum 2 characters required.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  // Default 10 (dropdown). Clamp to a sane max so the results page can request
  // many without allowing abuse.
  const limitParam = parseInt(request.nextUrl.searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 10;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.json([]);

  try {
    const endpoint = new URL(`${supabaseUrl}/rest/v1/gorilla_product_cache`);
    endpoint.searchParams.set("select", "barcode,product_name,brand,gorilla_score,score_grade,is_alcohol,is_supplement,is_beauty");
    // Match product_name, brand, OR barcode so the cached catalogue is
    // searchable the same way curated items already are (name + brand + code).
    endpoint.searchParams.set(
      "or",
      `(product_name.ilike.*${q}*,brand.ilike.*${q}*,barcode.ilike.*${q}*)`
    );
    endpoint.searchParams.set("order", "scan_count.desc");
    endpoint.searchParams.set("limit", String(limit));

    const res = await fetch(endpoint.toString(), {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 60 },
    });

    if (!res.ok) return NextResponse.json([]);
    const rows: SearchProduct[] = await res.json();
    // Derive the food tier live (4-tier bands recut in 15a9f96) rather than trusting
    // the stored score_grade column, which can lag the current cutoffs. Alcohol/
    // supplement/beauty keep their own grade vocabularies, so pass those through.
    const derived = rows.map((r) =>
      !r.is_alcohol && !r.is_supplement && !r.is_beauty && r.gorilla_score != null
        ? { ...r, score_grade: gradeFromScore(r.gorilla_score) }
        : r
    );
    return NextResponse.json(derived);
  } catch {
    return NextResponse.json([]);
  }
}
