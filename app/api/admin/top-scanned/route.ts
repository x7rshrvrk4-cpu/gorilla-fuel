import { type NextRequest, NextResponse } from "next/server";
import { getTopScanned } from "../../../scan/lib/productCache";
import { gradeFromScore } from "../../../scan/lib/scoring";

/**
 * GET /api/admin/top-scanned
 *
 * Returns the top 50 most-scanned products, sorted by scan_count descending.
 * Used for brewery and supplement brand sponsorship pitch data.
 *
 * Auth: header x-admin-key or ?key= must match ADMIN_API_KEY env var.
 * ADMIN_API_KEY must always be set — the endpoint is never open without it.
 *
 * Optional query params:
 *   ?limit=N        Override the default 50 (max 200)
 *   ?since=YYYY-MM-DD  Only include products last scanned on or after this date
 */
export async function GET(request: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { error: "ADMIN_API_KEY is not configured on this server." },
      { status: 403 }
    );
  }
  const provided =
    request.headers.get("x-admin-key") ??
    request.nextUrl.searchParams.get("key");
  if (provided !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(Number(limitParam) || 50, 200);

  const sinceParam = request.nextUrl.searchParams.get("since");
  const sinceDate = sinceParam ? new Date(sinceParam) : undefined;

  const products = await getTopScanned(limit, sinceDate);

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    count: products.length,
    filters: { limit, since: sinceParam ?? null },
    products: products.map((p) => ({
      barcode: p.barcode,
      product_name: p.product_name,
      brand: p.brand,
      gorilla_score: p.gorilla_score,
      // Derive the food tier live (4-tier bands recut in 15a9f96) instead of the
      // stored column; alcohol/supplement/beauty keep their own grade vocabularies.
      score_grade:
        !p.is_alcohol && !p.is_supplement && !p.is_beauty && p.gorilla_score != null
          ? gradeFromScore(p.gorilla_score)
          : p.score_grade,
      data_source: p.data_source,
      is_alcohol: p.is_alcohol,
      is_supplement: p.is_supplement,
      scan_count: p.scan_count,
      last_scanned_at: p.last_scanned_at,
    })),
  });
}
