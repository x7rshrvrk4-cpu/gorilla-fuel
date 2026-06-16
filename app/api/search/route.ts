import { type NextRequest, NextResponse } from "next/server";

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
 * GET /api/search?q=<query>
 * Searches gorilla_product_cache for products matching the query by product_name.
 * Returns up to 10 results. Minimum 2 characters required.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

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
    endpoint.searchParams.set("limit", "10");

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
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
