import { type NextRequest, NextResponse } from "next/server";
import type { Nutriments } from "../../scan/lib/scoring";
import type { OffProduct } from "../../scan/lib/openFoodFacts";

type FdcNutrient = {
  nutrientName?: string;
  value?: number;
  unitName?: string;
};

type FdcFood = {
  fdcId?: number;
  description?: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  foodNutrients?: FdcNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  gtinUpc?: string;
  foodCategory?: string;
};

function fdcNutrientsToNutriments(nutrients: FdcNutrient[]): Nutriments {
  const n: Nutriments = {};
  for (const item of nutrients) {
    const name = (item.nutrientName ?? "").toLowerCase().trim();
    const value = item.value;
    const unit = (item.unitName ?? "").toLowerCase();
    if (value === undefined || value === null) continue;

    if (name === "energy" && unit === "kcal") {
      n["energy-kcal_100g"] = value;
    } else if (/fatty acids.*saturated|saturated fat/.test(name)) {
      n["saturated-fat_100g"] = value;
    } else if (/^carbohydrate/.test(name) && !/fiber|dietary fiber/.test(name)) {
      n["carbohydrates_100g"] = value;
    } else if (/^total sugars|sugars, total/.test(name)) {
      n["sugars_100g"] = value;
    } else if (/fiber.*dietary|dietary.*fiber|total dietary fiber/.test(name)) {
      n["fiber_100g"] = value;
    } else if (name === "protein") {
      n["proteins_100g"] = value;
    } else if (/^sodium/.test(name) && unit === "mg") {
      // FDC sodium is mg/100g; convert to salt g/100g (×2.5 / 1000)
      n["salt_100g"] = (value / 1000) * 2.5;
    }
  }
  return n;
}

/**
 * Server-side proxy to the USDA FoodData Central branded-food search.
 * Searches by barcode/UPC string and returns the best match normalized as an OffProduct.
 * Uses DEMO_KEY by default — set USDA_API_KEY env var in Vercel for higher rate limits.
 *
 * GET /api/usda?barcode=<barcode>
 * Returns an OffProduct-shaped object (already normalized to per-100g), or null if not found.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  const apiKey = process.env.USDA_API_KEY ?? "DEMO_KEY";

  try {
    const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    url.searchParams.set("query", barcode);
    url.searchParams.set("dataType", "Branded");
    url.searchParams.set("pageSize", "10");
    url.searchParams.set("api_key", apiKey);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();
    const foods: FdcFood[] = data?.foods ?? [];
    if (foods.length === 0) return NextResponse.json(null);

    // Prefer exact UPC match; fall back to first result
    const norm = (b: string) => b.replace(/\D/g, "").replace(/^0+/, "");
    const normalizedBarcode = norm(barcode);
    const food =
      foods.find((f) => norm(f.gtinUpc ?? "") === normalizedBarcode) ?? foods[0];

    if (!food?.description) return NextResponse.json(null);

    const nutriments = fdcNutrientsToNutriments(food.foodNutrients ?? []);

    const product: OffProduct = {
      code: barcode,
      product_name: food.description,
      brands: food.brandOwner ?? food.brandName ?? undefined,
      ingredients_text: food.ingredients ?? undefined,
      nutriments,
      serving_size: food.servingSize
        ? `${food.servingSize}${food.servingSizeUnit ?? "g"}`
        : undefined,
      categories_tags: food.foodCategory ? [`en:${food.foodCategory.toLowerCase().replace(/\s+/g, "-")}`] : [],
    };

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
