/**
 * Shared product classification helpers used by both the API import route
 * and the local import script. Single source of truth — edit here only.
 */

import { computeScore } from "./scoring";
import { applyScoringGate } from "./curatedScores";
import type { UpsertPayload } from "./productCache";

/** Bumped whenever the scoring algorithm or gate logic changes materially.
 *  Stored on every cache row so rescore-all can target stale entries. */
export const ALGO_VERSION = "v2.2";

const ALCOHOL_KW = [
  "beer", "wine", "spirit", "cider", "seltzer", "alcoholic", "liqueur",
  "whisky", "whiskey", "vodka", "rum", "gin", "tequila", "brandy", "mead",
];
const SUPPLEMENT_KW = [
  "supplement", "vitamin", "protein", "creatine", "pre-workout",
  "amino", "bcaa", "collagen", "probiotic", "omega",
];

export function isOffAlcohol(categoriesTags: string[]): boolean {
  return categoriesTags.some((c) =>
    ALCOHOL_KW.some((kw) => c.toLowerCase().includes(kw))
  );
}

export function isOffSupplement(categoriesTags: string[]): boolean {
  return categoriesTags.some((c) =>
    SUPPLEMENT_KW.some((kw) => c.toLowerCase().includes(kw))
  );
}

/**
 * Map a raw OFF product record to a UpsertPayload.
 * Returns null for records with no usable barcode.
 */
export function buildOffRow(p: Record<string, unknown>): UpsertPayload | null {
  const barcode = (p.code as string) || (p._id as string) || "";
  if (!barcode || barcode.length < 4) return null;

  const cats: string[] = Array.isArray(p.categories_tags)
    ? (p.categories_tags as string[])
    : [];

  const n = (p.nutriments as Record<string, number> | undefined) ?? {};
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

  const alcohol = isOffAlcohol(cats);
  const supplement = isOffSupplement(cats);

  // ── Quality filter (import only) ──────────────────────────────────────────
  // Skip empty shells that have NO data to score from — no usable nutrition AND
  // no ingredients text. This mirrors what the scorer already needs to produce a
  // genuine score; it is not a stricter bar. Alcohol/supplements legitimately may
  // lack food nutrition, so they are exempt (preserve existing behavior — only the
  // missing-barcode guard applies to them).
  const ingredientsText = ((p.ingredients_text as string) ?? "").trim();
  const hasUsableNutrition =
    nutrition_data !== null &&
    Object.values(nutrition_data).some((v) => typeof v === "number" && Number.isFinite(v));
  if (!alcohol && !supplement && !hasUsableNutrition && ingredientsText.length === 0) {
    return null;
  }

  let gorilla_score: number | null = null;
  let score_grade: string | null = null;

  if (nutrition_data && !alcohol && !supplement) {
    try {
      const result = computeScore(
        nutrition_data as Parameters<typeof computeScore>[0],
        (p.ingredients_text as string) ?? "",
        {
          servingSize: (p.serving_size as string) ?? "100g",
          novaGroup: (p.nova_group as number) || undefined,
          categoriesTags: cats,
        }
      );
      // Full gate: curated overrides → brand caps → category caps → ingredient sanity
      const gated = applyScoringGate(result.finalScore, {
        barcode,
        productName: (p.product_name as string) ?? "",
        brand: (p.brands as string) ?? null,
        ingredientsText: (p.ingredients_text as string) ?? null,
        categoriesTags: cats,
        novaGroup: (p.nova_group as number) || null,
      });
      gorilla_score = gated.score;
      score_grade = gated.grade;
    } catch {
      // Non-fatal — store the row without a score
    }
  }

  const scoredAt = gorilla_score !== null ? new Date().toISOString() : null;

  return {
    barcode,
    product_name: (p.product_name as string) || null,
    brand: (p.brands as string) || null,
    categories: cats.length > 0 ? JSON.stringify(cats) : null,
    ingredients_text: (p.ingredients_text as string) || null,
    nutrition_data,
    gorilla_score,
    score_grade,
    // nova_group: 0 is not a valid NOVA group (1–4) so || null is safe here
    nova_group: (p.nova_group as number) || null,
    data_source: "open-food-facts",
    image_url: (p.image_url as string) || null,
    is_alcohol: alcohol,
    is_supplement: supplement,
    is_beauty: false,
    algorithm_version: ALGO_VERSION,
    scored_at: scoredAt,
  };
}
