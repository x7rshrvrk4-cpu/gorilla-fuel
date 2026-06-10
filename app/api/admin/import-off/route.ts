import { type NextRequest, NextResponse } from "next/server";
import { batchUpsertProductCache, logImportRun } from "../../../scan/lib/productCache";
import type { UpsertPayload } from "../../../scan/lib/productCache";
import { computeScore } from "../../../scan/lib/scoring";

const OFF_SEARCH_URL =
  "https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=canada&json=1&page_size=1000&page=";

const ALCOHOL_CATEGORIES = [
  "beer", "wine", "spirit", "cider", "seltzer", "alcoholic", "liqueur",
  "whisky", "whiskey", "vodka", "rum", "gin", "tequila", "brandy", "mead",
];
const SUPPLEMENT_CATEGORIES = [
  "supplement", "vitamin", "protein", "creatine", "pre-workout",
  "amino", "bcaa", "collagen", "probiotic", "omega",
];

function isAlcohol(categoriesTags: string[]): boolean {
  return categoriesTags.some((c) =>
    ALCOHOL_CATEGORIES.some((kw) => c.toLowerCase().includes(kw))
  );
}
function isSupplement(categoriesTags: string[]): boolean {
  return categoriesTags.some((c) =>
    SUPPLEMENT_CATEGORIES.some((kw) => c.toLowerCase().includes(kw))
  );
}

function toUpsertRow(product: Record<string, unknown>): UpsertPayload | null {
  const barcode =
    (product.code as string) ||
    (product._id as string) ||
    "";
  if (!barcode || barcode.length < 4) return null;

  const categoriesTags: string[] = Array.isArray(product.categories_tags)
    ? (product.categories_tags as string[])
    : [];

  const n = (product.nutriments as Record<string, number> | undefined) ?? {};
  const nutrition_data =
    Object.keys(n).length > 0
      ? {
          "energy-kcal_100g": n["energy-kcal_100g"] ?? n["energy_100g"],
          sugars_100g: n["sugars_100g"],
          "saturated-fat_100g": n["saturated-fat_100g"],
          salt_100g: n["salt_100g"],
          proteins_100g: n["proteins_100g"],
          fiber_100g: n["fiber_100g"],
        }
      : null;

  const alcohol = isAlcohol(categoriesTags);
  const supplement = isSupplement(categoriesTags);

  let gorilla_score: number | null = null;
  let score_grade: string | null = null;

  if (nutrition_data && !alcohol && !supplement) {
    try {
      const result = computeScore(nutrition_data as Parameters<typeof computeScore>[0], (product.ingredients_text as string) ?? "", {
        servingSize: (product.serving_size as string) ?? "100g",
        novaGroup: (product.nova_group as number) ?? undefined,
        categoriesTags,
      });
      gorilla_score = result.finalScore;
      score_grade = result.grade;
    } catch {
      // Non-fatal — save the row without a score
    }
  }

  return {
    barcode,
    product_name: (product.product_name as string) || null,
    brand: (product.brands as string) || null,
    categories: categoriesTags.length > 0 ? JSON.stringify(categoriesTags) : null,
    ingredients_text: (product.ingredients_text as string) || null,
    nutrition_data,
    gorilla_score,
    score_grade,
    nova_group: (product.nova_group as number) || null,
    data_source: "open-food-facts",
    image_url: (product.image_url as string) || null,
    is_alcohol: alcohol,
    is_supplement: supplement,
    is_beauty: false,
  };
}

/**
 * POST /api/admin/import-off
 *
 * Triggers a paginated bulk import from Open Food Facts Canada.
 * Body (JSON): { pages?: number }  — defaults to 50 (50 000 products max)
 *
 * Returns import stats after completion.
 */
export async function POST(request: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey) {
    const provided =
      request.headers.get("x-admin-key") ??
      new URL(request.url).searchParams.get("key");
    if (provided !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let maxPages = 50;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.pages === "number") maxPages = Math.min(body.pages, 200);
  } catch {
    // Use default
  }

  const startedAt = Date.now();
  let total = 0, food = 0, alcoholCount = 0, suppl = 0, withNutr = 0, withoutNutr = 0;

  for (let page = 1; page <= maxPages; page++) {
    let products: Record<string, unknown>[];
    try {
      const res = await fetch(`${OFF_SEARCH_URL}${page}`, {
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) break;
      const data = await res.json() as { products?: Record<string, unknown>[] };
      products = data.products ?? [];
    } catch {
      break;
    }
    if (products.length === 0) break;

    const rows: UpsertPayload[] = [];
    for (const p of products) {
      const row = toUpsertRow(p);
      if (!row) continue;
      rows.push(row);
      total++;
      if (row.is_alcohol) alcoholCount++;
      else if (row.is_supplement) suppl++;
      else food++;
      if (row.nutrition_data) withNutr++; else withoutNutr++;
    }

    if (rows.length > 0) {
      await batchUpsertProductCache(rows);
    }
  }

  const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
  await logImportRun({
    total_processed: total,
    food_count: food,
    alcohol_count: alcoholCount,
    supplement_count: suppl,
    with_nutrition: withNutr,
    without_nutrition: withoutNutr,
    duration_seconds: durationSeconds,
    notes: `API import — ${maxPages} pages requested`,
  });

  return NextResponse.json({
    success: true,
    duration_seconds: durationSeconds,
    stats: {
      total_processed: total,
      food_count: food,
      alcohol_count: alcoholCount,
      supplement_count: suppl,
      with_nutrition: withNutr,
      without_nutrition: withoutNutr,
    },
  });
}
