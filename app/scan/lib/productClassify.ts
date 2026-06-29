/**
 * Shared product classification helpers used by both the API import route
 * and the local import script. Single source of truth — edit here only.
 */

import { computeScore } from "./scoring";
import { applyScoringGate } from "./curatedScores";
import type { UpsertPayload } from "./productCache";

/** Bumped whenever the scoring algorithm or gate logic changes materially.
 *  Stored on every cache row so rescore-all can target stale entries. */
export const ALGO_VERSION = "v2.3";

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

// ── Name/ABV alcohol fallback ────────────────────────────────────────────────
// OFF classification keys off categories_tags only. Coolers/seltzers/spirits that
// arrive with EMPTY or non-alcohol category tags (e.g. "7% Vodka Soda", "Coors
// Selter") silently fall through to is_alcohol=false and leak into food scoring.
// This fallback reads the NAME (the ABV/spirit is obvious there) when categories
// did not already classify it alcohol.
//
// Two-tier, exclusion-wins design:
//  • HARD EXCLUDE always wins — explicit non-alcoholic markers and different
//    product types (root beer, ginger beer/ale, kombucha) that merely sound boozy.
//  • FOOD-FORM context cancels even a strong spirit word — a spirit named here is
//    a flavour, not a drink (rum cake, vodka SAUCE, rum raisin ice cream).
//  • STRONG spirit/RTD words → alcohol (unless excluded/food-form).
//  • A bare ABV "%" is the WEAKEST signal — also cancelled by a dairy/cocoa fat
//    context so cream 35% / 10% milk / cocoa % never trip it.
// Always-wins exclusions: explicit non-alcoholic markers, dealcoholized/low-ABV
// (0.0–0.5%) products, and different product types that merely sound boozy.
const ALC_HARD_EXCLUDE =
  /\b(non[-\s]?alcoholic|non[-\s]?alcoholique|non[-\s]?alcool|sans\s*alcool|alcohol[-\s]?free|alcool[-\s]?free|spirit[-\s]?free|de-?alcoholi|desalcooli|dealcooli|mocktail|virgin|root\s*beer|racinette|ginger\s*beer|ginger\s*ale|kombucha)\b|\bn\/a\b|\b0\.[05]\s?%|\b0\s?%/i;
// Food FORM/flavour context: a spirit word here is a flavour, not a drink
// (rum cake, vodka SAUCE, whisky jerky, cognac pâté, brandy beans, 18% Meat
// Protein, cheddar with brandy…). Spirit-flavoured foods must stay in food.
const ALC_FOOD_FORM =
  /\b(sauce|vinegar|vinaigre|vinaigrette|dressing|coleslaw|slaw|cake|gateau|g[aâ]teau|cookie|biscuit|caramels?|candy|candies|fudge|truffles?|chocolate|chocolat|choco|\bpie\b|tarts?|loaf|muffins?|scones?|crumbles?|crumbs?|gummy|gummies|jell(y|o)|\bjam\b|confiture|syrup|sirop|extract|vanilla|raisins?|baba|frosting|icing|marinade|glaze|rub|seasoning|chipotle|bbq|barbeque|barbecue|ice\s*cream|gelato|sorbet|popcorn|brownie|do?nut|doughnut|granola|cereals?|salami|bacon|sausage|\bham\b|turkey|chicken|\bbeef\b|\bpork\b|\bmeat\b|protein|moisture|jerky|p[aâ]t[eé]|terrine|\bbeans?\b|f[eè]ves|mustard|moutarde|kisse?s?|butterscotch|cheese|cheddar|gouda|\bbrie\b|parmesan|pecorino|mozz?arella|kefir|yogou?rt|\bdah?l\b|\bspam\b|vegemite|brussel|sprouts?|cutlets?|steak|ribber|riblets?|roasted)\b/i;
// Explicit ABV notation only — "5% Alc./Vol", "7% ABV", "5% alcohol". A bare
// number-% is NOT used (it false-fires on "18% Meat Protein", "Kefir 2.5%",
// "35% cream"); the spirit/RTD words below carry the real RTDs.
const ALC_ABV =
  /\b\d{1,2}(\.\d+)?\s?%\s?(alc|abv|alcohol|alc\.?\s?\/?\s?vol)\b|\balc(ohol)?\.?\s?\/\s?vol\b/i;
// Strong spirit/RTD signals — the product itself is alcohol.
const ALC_STRONG =
  /\b(vodka|whisky|whiskey|whiskies|tequila|\brum\b|brandy|liqueur|cognac|schnapps|absinthe|aperol)\b|\b(hard\s*selt?z?er|spiked|vodka\s*soda|vodka\s*cooler|hard\s*cooler|wine\s*cooler|malt\s*beverage)\b|\bseltz?er\b|\b(hard|dry)\s+(\w+\s+){0,2}cider\b|\bgin\b|\b(white\s*claw|whiteclaw|vizzy|nutrl|smirnoff|happy\s*dad|twisted\s*tea|high\s*noon|social\s*lite|palm\s*bay|mike'?s\s*hard)\b/i;

const stripD = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "");

// Dedicated non-alcoholic / spirit-free beverage brands. Their entire catalogue
// is alcohol-free, so a spirit/RTD word in the name (e.g. "Gin & Tonic",
// "Tequila Sunrise", "Spiced Rum Profile") is a style descriptor, not booze.
// Checked against name AND brand; future SKUs from these brands stay food.
const NON_ALCOHOLIC_BRANDS = /\baelo\b|\bm'?aqua\b|\bfreedom\s*spirits\b/i;

// Specific SKUs the name detector flags but which are confirmed non-alcoholic and
// whose signal does NOT generalize (ambiguous brand that also makes real spirits,
// or a one-off flavour/product name). Normalized (no leading zeros).
const normBarcode = (b: string) => b.replace(/\D/g, "").replace(/^0+/, "");
const NON_ALCOHOLIC_BARCODES = new Set([
  "628075802628", // Hickson Gin Boréal — distillery also makes real gin; conservative keep-as-food
  "893335000766", // Eatable "Pop The Salt & Tequila" — popcorn seasoning (sibling has "popcorn")
  "627987624069", // "Sweet Whiskey Heat Extra Hot" — whiskey-flavoured hot sauce
  "56500040329",  // "al seltzer" — likely Alka-Seltzer (medication), not a drink
]);

/**
 * Name-based alcohol fallback. Returns true only when the name positively reads
 * alcoholic AND no exclusion/food-form/brand/barcode guard applies. Conservative
 * by design — a missed cooler is recoverable; mislabeling food as alcohol hides
 * it from the food ranking, so the guards win. Diacritics are stripped first so
 * accented terms match and "lactosérum" does not look like "rum".
 */
export function detectAlcoholByName(
  name: string | null | undefined,
  brand?: string | null,
  barcode?: string | null
): boolean {
  if (barcode && NON_ALCOHOLIC_BARCODES.has(normBarcode(barcode))) return false;
  const s = stripD((name ?? "").toLowerCase().trim());
  const b = stripD((brand ?? "").toLowerCase().trim());
  if (!s && !b) return false;
  if (NON_ALCOHOLIC_BRANDS.test(s) || NON_ALCOHOLIC_BRANDS.test(b)) return false;
  if (!s) return false;
  if (ALC_HARD_EXCLUDE.test(s)) return false;
  if (ALC_FOOD_FORM.test(s)) return false; // flavour/form context — not a drink
  if (ALC_STRONG.test(s)) return true;
  if (ALC_ABV.test(s)) return true; // explicit ABV notation
  return false;
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

  // OFF stores organic certification in labels_tags (e.g. "en:organic",
  // "fr:bio"), NOT in categories_tags — pass it through so the scorer's
  // organic bonus can fire on imported products.
  const labels: string[] = Array.isArray(p.labels_tags) ? (p.labels_tags as string[]) : [];

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

  // Category tags are the primary signal; the name/ABV fallback recovers alcohol
  // whose OFF category tags are absent or non-alcohol (e.g. "7% Vodka Soda").
  const alcohol = isOffAlcohol(cats) || detectAlcoholByName(p.product_name as string, p.brands as string, barcode);
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
          labelsTags: labels,
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
        nutriments: nutrition_data as Parameters<typeof computeScore>[0],
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
