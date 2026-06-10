import { type NextRequest, NextResponse } from "next/server";
import type { Nutriments } from "../../scan/lib/scoring";
import type { OffProduct } from "../../scan/lib/openFoodFacts";

type FatSecretServing = {
  calories?: string;
  fat?: string;
  saturated_fat?: string;
  carbohydrate?: string;
  sugar?: string;
  fiber?: string;
  protein?: string;
  sodium?: string;
  serving_size?: string;
  serving_description?: string;
  number_of_units?: string;
  measurement_description?: string;
};

type FatSecretFood = {
  food_id?: string;
  food_name?: string;
  brand_name?: string;
  food_type?: string;
  food_category?: string;
  servings?: { serving?: FatSecretServing | FatSecretServing[] };
};

function parseNum(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
}

function servingToNutriments(serving: FatSecretServing): Nutriments {
  const n: Nutriments = {};
  // FatSecret returns per-serving values; we treat them as per-100g (close enough for scoring)
  const cal = parseNum(serving.calories);
  if (cal !== undefined) n["energy-kcal_100g"] = cal;
  // total fat not tracked in Nutriments — skip
  const satFat = parseNum(serving.saturated_fat);
  if (satFat !== undefined) n["saturated-fat_100g"] = satFat;
  const carbs = parseNum(serving.carbohydrate);
  if (carbs !== undefined) n["carbohydrates_100g"] = carbs;
  const sugar = parseNum(serving.sugar);
  if (sugar !== undefined) n["sugars_100g"] = sugar;
  const fiber = parseNum(serving.fiber);
  if (fiber !== undefined) n["fiber_100g"] = fiber;
  const protein = parseNum(serving.protein);
  if (protein !== undefined) n["proteins_100g"] = protein;
  const sodium = parseNum(serving.sodium);
  // FatSecret sodium in mg → salt g/100g
  if (sodium !== undefined) n["salt_100g"] = (sodium / 1000) * 2.5;
  return n;
}

/**
 * Server-side proxy to the FatSecret Platform API (barcode lookup via OAuth 2.0).
 * Requires FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET env vars.
 * Returns null immediately if credentials are absent or any step fails.
 *
 * GET /api/fatsecret?barcode=<barcode>
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json(null);

  try {
    // Step 1 — OAuth 2.0 client_credentials token
    const tokenRes = await fetch("https://oauth.fatsecret.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials&scope=basic",
      signal: AbortSignal.timeout(4000),
    });

    if (!tokenRes.ok) return NextResponse.json(null);
    const tokenData = await tokenRes.json();
    const token: string = tokenData?.access_token;
    if (!token) return NextResponse.json(null);

    // Step 2 — Find food_id by barcode
    const findUrl = new URL("https://platform.fatsecret.com/rest/server.api");
    findUrl.searchParams.set("method", "food.find_id_for_barcode");
    findUrl.searchParams.set("barcode", barcode);
    findUrl.searchParams.set("format", "json");

    const findRes = await fetch(findUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });

    if (!findRes.ok) return NextResponse.json(null);
    const findData = await findRes.json();
    const foodId: string | undefined = findData?.food_id?.value ?? findData?.food_id;
    if (!foodId) return NextResponse.json(null);

    // Step 3 — Get food details
    const getUrl = new URL("https://platform.fatsecret.com/rest/server.api");
    getUrl.searchParams.set("method", "food.get.v4");
    getUrl.searchParams.set("food_id", foodId);
    getUrl.searchParams.set("format", "json");

    const getRes = await fetch(getUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });

    if (!getRes.ok) return NextResponse.json(null);
    const getData = await getRes.json();
    const food: FatSecretFood = getData?.food ?? getData;
    if (!food?.food_name) return NextResponse.json(null);

    const servingsData = food.servings?.serving;
    const firstServing: FatSecretServing | undefined = Array.isArray(servingsData)
      ? servingsData[0]
      : servingsData;

    const nutriments = firstServing ? servingToNutriments(firstServing) : {};
    const category = food.food_category?.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const product: OffProduct = {
      code: barcode,
      product_name: food.food_name,
      brands: food.brand_name ?? undefined,
      nutriments,
      serving_size: firstServing?.serving_description ?? firstServing?.serving_size,
      categories_tags: category ? [`en:${category}`] : [],
    };

    return NextResponse.json(product);
  } catch (err) {
    console.error("[Gorilla] FatSecret lookup failed:", err);
    return NextResponse.json(null);
  }
}
