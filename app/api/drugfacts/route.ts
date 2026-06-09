import { type NextRequest, NextResponse } from "next/server";

export type DrugProduct = {
  barcode: string;
  name: string;
  brand: string;
  ingredientsText: string | null;
  categoriesTags: string[];
  image: string | null;
};

/**
 * Server-side proxy to the Open Drug Facts API.
 * Open Drug Facts is the Open Food Facts foundation's database for OTC drugs and medications.
 * Free to use, no key required — same API shape as Open Food Facts.
 *
 * GET /api/drugfacts?barcode=<barcode>
 * Returns basic drug product data, or null if not found.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://world.opendrugsfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();
    if (data.status !== 1 || !data.product) return NextResponse.json(null);

    const p = data.product;
    const name = p.product_name ?? p.product_name_en;
    if (!name) return NextResponse.json(null);

    const product: DrugProduct = {
      barcode,
      name,
      brand: p.brands ?? p.brand ?? "",
      ingredientsText:
        p.ingredients_text ?? p.ingredients_text_en ?? p.active_ingredients ?? null,
      categoriesTags: p.categories_tags ?? [],
      image: p.image_front_url ?? p.image_url ?? null,
    };

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
