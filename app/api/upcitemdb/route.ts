import { type NextRequest, NextResponse } from "next/server";
import type { OffProduct } from "../../scan/lib/openFoodFacts";

type UpcItemDbItem = {
  title?: string;
  brand?: string;
  category?: string;
  description?: string;
  images?: string[];
  stores?: { store_name?: string }[];
  upc?: string;
};

type UpcItemDbResponse = {
  code?: string;
  total?: number;
  items?: UpcItemDbItem[];
};

/**
 * Server-side proxy to the UPCitemdb free product database.
 * No API key required — uses the free trial endpoint (100 req/day).
 * Returns product name, brand, and category for millions of consumer products.
 *
 * GET /api/upcitemdb?barcode=<barcode>
 * Returns an OffProduct-shaped object, or null if not found.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return NextResponse.json(null);

    const data: UpcItemDbResponse = await res.json();
    const items = data?.items ?? [];
    if (items.length === 0) return NextResponse.json(null);

    const item = items[0];
    if (!item?.title) return NextResponse.json(null);

    const category = item.category?.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const product: OffProduct = {
      code: barcode,
      product_name: item.title,
      brands: item.brand ?? undefined,
      // NOTE: item.description is deliberately NOT mapped to ingredients_text.
      // UPCitemdb's `description` is marketing prose ("…made with no artificial
      // colours or flavours…"), not an ingredient list. Feeding it to the additive
      // detector produced negation-blind false positives (a "no artificial colours"
      // claim matched the "Artificial colours" additive) AND falsely satisfied the
      // hasIngredientText check, disabling the additivesUnverified conservative cap
      // (→50). Leaving ingredients_text empty is correct: UPCitemdb has no real
      // ingredient list, so the unverified cap applies and no prose-derived flags fire.
      nutriments: {},
      categories_tags: category ? [`en:${category}`] : [],
    };

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
