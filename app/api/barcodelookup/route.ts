import { type NextRequest, NextResponse } from "next/server";
import type { OffProduct } from "../../scan/lib/openFoodFacts";
import type { Nutriments } from "../../scan/lib/scoring";

type BclProduct = {
  barcode_number?: string;
  barcode_type?: string;
  product_name?: string;
  title?: string;
  category?: string;
  brand?: string;
  manufacturer?: string;
  weight?: string;
  description?: string;
  nutrition?: {
    calories?: string;
    fat?: string;
    saturated_fat?: string;
    carbohydrate?: string;
    sugar?: string;
    fiber?: string;
    protein?: string;
    sodium?: string;
  };
  ingredients?: string;
  images?: string[];
};

type BclResponse = {
  products?: BclProduct[];
};

function parseNum(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return isNaN(n) ? undefined : n;
}

/**
 * Server-side proxy to the Barcode Lookup API via RapidAPI.
 * Requires RAPIDAPI_KEY env var.
 *
 * GET /api/barcodelookup?barcode=<barcode>
 * Returns an OffProduct-shaped object, or null if not found.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://barcodelookup.p.rapidapi.com/products?barcode=${encodeURIComponent(barcode)}&formatted=y`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "barcodelookup.p.rapidapi.com",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(1500),
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return NextResponse.json(null);

    const data: BclResponse = await res.json();
    const products = data?.products ?? [];
    if (products.length === 0) return NextResponse.json(null);

    const p = products[0];
    const name = p.product_name ?? p.title;
    if (!name) return NextResponse.json(null);

    const n = p.nutrition;
    const nutriments: Nutriments = {};
    const cal = parseNum(n?.calories);
    if (cal !== undefined) nutriments["energy-kcal_100g"] = cal;
    const satFat = parseNum(n?.saturated_fat);
    if (satFat !== undefined) nutriments["saturated-fat_100g"] = satFat;
    const carbs = parseNum(n?.carbohydrate);
    if (carbs !== undefined) nutriments["carbohydrates_100g"] = carbs;
    const sugar = parseNum(n?.sugar);
    if (sugar !== undefined) nutriments["sugars_100g"] = sugar;
    const fiber = parseNum(n?.fiber);
    if (fiber !== undefined) nutriments["fiber_100g"] = fiber;
    const protein = parseNum(n?.protein);
    if (protein !== undefined) nutriments["proteins_100g"] = protein;
    const sodium = parseNum(n?.sodium);
    if (sodium !== undefined) nutriments["salt_100g"] = (sodium / 1000) * 2.5;

    const category = p.category?.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const product: OffProduct = {
      code: barcode,
      product_name: name,
      brands: p.brand ?? p.manufacturer ?? undefined,
      ingredients_text: p.ingredients ?? undefined,
      nutriments,
      categories_tags: category ? [`en:${category}`] : [],
    };

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
