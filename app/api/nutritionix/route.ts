import { type NextRequest, NextResponse } from "next/server";
import type { Nutriments } from "../../scan/lib/scoring";
import type { OffProduct } from "../../scan/lib/openFoodFacts";

type NxFood = {
  food_name?: string;
  brand_name?: string;
  serving_qty?: number;
  serving_unit?: string;
  serving_weight_grams?: number;
  nf_calories?: number;
  nf_total_fat?: number;
  nf_saturated_fat?: number;
  nf_total_carbohydrate?: number;
  nf_sugars?: number;
  nf_dietary_fiber?: number;
  nf_protein?: number;
  nf_sodium?: number;
  nix_item_name?: string;
  photo?: { thumb?: string; highres?: string };
};

/** Normalize Nutritionix per-serving values to per-100g Nutriments. */
function nxToNutriments(food: NxFood): Nutriments {
  const weight = food.serving_weight_grams;
  if (!weight || weight <= 0) return {};

  const scale = 100 / weight;
  const n: Nutriments = {};

  if (food.nf_calories !== undefined) n["energy-kcal_100g"] = Math.round(food.nf_calories * scale * 10) / 10;
  if (food.nf_saturated_fat !== undefined) n["saturated-fat_100g"] = Math.round(food.nf_saturated_fat * scale * 100) / 100;
  if (food.nf_total_carbohydrate !== undefined) n["carbohydrates_100g"] = Math.round(food.nf_total_carbohydrate * scale * 100) / 100;
  if (food.nf_sugars !== undefined) n["sugars_100g"] = Math.round(food.nf_sugars * scale * 100) / 100;
  if (food.nf_dietary_fiber !== undefined) n["fiber_100g"] = Math.round(food.nf_dietary_fiber * scale * 100) / 100;
  if (food.nf_protein !== undefined) n["proteins_100g"] = Math.round(food.nf_protein * scale * 100) / 100;
  if (food.nf_sodium !== undefined) {
    // nf_sodium is in mg/serving; convert to g/100g salt (×2.5 / 1000)
    n["salt_100g"] = Math.round((food.nf_sodium * scale / 1000) * 2.5 * 1000) / 1000;
  }

  return n;
}

/**
 * Server-side proxy to the Nutritionix track API (barcode lookup).
 * Requires NUTRITIONIX_APP_ID and NUTRITIONIX_APP_KEY environment variables.
 * Free tier: 500 requests/day. Sign up at developer.nutritionix.com.
 *
 * GET /api/nutritionix?barcode=<barcode>
 * Returns an OffProduct-shaped object normalized to per-100g, or null if not found.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  const appId = process.env.NUTRITIONIX_APP_ID;
  const appKey = process.env.NUTRITIONIX_APP_KEY;
  if (!appId || !appKey) return NextResponse.json(null);

  try {
    const url = new URL("https://trackapi.nutritionix.com/v2/search/item");
    url.searchParams.set("upc", barcode);

    const res = await fetch(url.toString(), {
      headers: {
        "x-app-id": appId,
        "x-app-key": appKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 86400 },
    });

    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();
    const foods: NxFood[] = data?.foods ?? [];
    if (foods.length === 0) return NextResponse.json(null);

    const food = foods[0];
    const name = food.nix_item_name ?? food.food_name;
    if (!name) return NextResponse.json(null);

    const nutriments = nxToNutriments(food);

    const product: OffProduct = {
      code: barcode,
      product_name: name,
      brands: food.brand_name ?? undefined,
      image_front_url: food.photo?.highres ?? food.photo?.thumb ?? undefined,
      nutriments,
      serving_size: food.serving_weight_grams
        ? `${food.serving_weight_grams}g`
        : undefined,
      categories_tags: [],
    };

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
