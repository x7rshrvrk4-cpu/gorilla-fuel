import {
  computeScore,
  type Nutriments,
  type ScoreResult,
} from "../../scan/lib/scoring";

export type EnergyCategory = "Energy Drinks";

export const ENERGY_CATEGORIES: EnergyCategory[] = ["Energy Drinks"];

export type EnergyDrinkProduct = {
  id: string;
  category: EnergyCategory;
  brand: string;
  name: string;
  /** Can/serving size in mL — energy drinks are scored and shown per single can. */
  servingMl: number;
  /** Calories per can. */
  calories: number;
  /** True when the calorie figure is estimated/approximate, not label-verified. */
  caloriesEstimated?: boolean;
  /** Sugar grams per can. */
  sugar: number;
  /** Carbohydrate grams per can (optional — omit when not verified). */
  carbs?: number;
  /** Caffeine in mg per can. Drives the caffeine band (green <100 · yellow 100–200 · red >200). */
  caffeineMg: number;
  /** Human-readable sweetener summary shown on the card. */
  sweetener: string;
  /**
   * Full Canadian-market ingredient text. Fed verbatim to the existing scoring
   * engine (computeScore → scoreAdditives) so additive detection is identical to
   * a real scan — no bespoke energy-drink scoring formula.
   */
  ingredients: string;
  /** True when any nutrition value is estimated rather than label-verified. */
  nutritionEstimated?: boolean;
  /** Aspartame-containing products MUST warn for phenylketonuria (PKU). */
  phenylalanineWarning?: boolean;
  /** Real scannable barcodes — left empty until verified against a physical can. */
  barcodes?: string[];
  availability: string;
  /** Optional editorial writeup shown on the product card. */
  gorillaAnalysis?: string;
};

// ── Caffeine band ─────────────────────────────────────────────────────────────
// Mirrors the alcohol ABV badge: a single at-a-glance colour band.
// Green <100 mg · Yellow 100–200 mg · Red >200 mg.
export type CaffeineBand = "green" | "yellow" | "red";

export function caffeineBand(mg: number): CaffeineBand {
  if (mg < 100) return "green";
  if (mg <= 200) return "yellow";
  return "red";
}

/**
 * Health Canada caffeine guidance — shown ONCE for the whole section, not per
 * product. Verbatim safety note required on all energy-drink listings.
 */
export const CAFFEINE_DISCLAIMER =
  "Health Canada advises a maximum of 400 mg of caffeine per day for adults " +
  "(200 mg if pregnant). Not recommended for children, adolescents, pregnant or " +
  "breastfeeding people, or those sensitive to caffeine or with heart conditions.";

/**
 * Score an energy drink with the SAME engine that scores a live scan. We
 * normalise the per-can macros to per-100 mL for the engine's per-100g bands
 * and also pass the per-serving figures + serving size so the serving-aware
 * logic engages exactly as it would for an Open Food Facts product.
 *
 * Energy drinks are ultra-processed (NOVA 4). Saturated fat is zero by
 * definition and sodium is negligible (well below every penalty band), so both
 * are modelled as 0 — that is the honest value, and it also prevents the
 * "missing critical nutrient" precautionary penalty from firing on data that
 * isn't actually unknown.
 */
export function energyScore(p: EnergyDrinkProduct): ScoreResult {
  const per100 = 100 / p.servingMl;
  const round1 = (v: number) => Math.round(v * 10) / 10;

  const nutriments: Nutriments = {
    sugars_100g: round1(p.sugar * per100),
    sugars_serving: p.sugar,
    "energy-kcal_100g": Math.round(p.calories * per100),
    "energy-kcal_serving": p.calories,
    "saturated-fat_100g": 0,
    "saturated-fat_serving": 0,
    salt_100g: 0,
    salt_serving: 0,
  };
  if (p.carbs !== undefined) {
    nutriments.carbohydrates_100g = round1(p.carbs * per100);
    nutriments.carbohydrates_serving = p.carbs;
  }

  return computeScore(nutriments, p.ingredients, {
    servingSize: `${p.servingMl}ml`,
    novaGroup: 4,
    productName: `${p.brand} ${p.name}`,
    categoriesTags: ["en:energy-drinks", "en:beverages"],
  });
}

// Canadian-market data verified June 2026 from redbull.com/ca-en and Canadian
// retailer listings (Real Canadian Superstore, Voilà, Save-On-Foods). Barcodes
// intentionally omitted until confirmed against a physical can.
export const ENERGY_PRODUCTS: EnergyDrinkProduct[] = [
  // ───────────────────────── RED BULL ─────────────────────────
  {
    id: "red-bull-original-250",
    category: "Energy Drinks",
    brand: "Red Bull",
    name: "Red Bull Energy Drink (Original)",
    servingMl: 250,
    calories: 112,
    sugar: 27,
    carbs: 28,
    caffeineMg: 80,
    sweetener: "Sugar (sucrose + glucose)",
    ingredients:
      "Carbonated water, sugars (sugar, glucose-fructose), citric acid, taurine, sodium bicarbonate, magnesium carbonate, caffeine, niacinamide, pyridoxine hydrochloride, calcium D-pantothenate, cyanocobalamin, artificial flavour, caramel colour, riboflavin",
    availability: "Real Canadian Superstore — wide availability",
    gorillaAnalysis:
      "The original formula's problem isn't the caffeine — at 80 mg it's roughly one coffee — it's the 27 g of sugar in a single 250 mL can, the same as a small can of cola. The sugar load is what drives this score down. If you reach for Red Bull, the zero-sugar formulas are the materially better call; the only question between them is which sweetener system you prefer.",
  },
  {
    id: "red-bull-sugarfree-250",
    category: "Energy Drinks",
    brand: "Red Bull",
    name: "Red Bull Sugarfree",
    servingMl: 250,
    calories: 10,
    caloriesEstimated: true,
    sugar: 0,
    caffeineMg: 80,
    sweetener: "Aspartame + acesulfame-K (Canadian formula)",
    phenylalanineWarning: true,
    // Canadian can lists "colour" generically — likely caramel + riboflavin but
    // NOT asserted here because it isn't specified on the Canadian label.
    ingredients:
      "Carbonated water, citric acid, taurine, sodium bicarbonate, magnesium carbonate, caffeine, acesulfame potassium, aspartame, niacin, pantothenate, vitamin B6, vitamin B12, xanthan gum, artificial flavour, colour",
    nutritionEstimated: true,
    availability: "Voilà, Save-On-Foods — wide availability",
    gorillaAnalysis:
      "The Canadian Sugarfree can is sweetened with aspartame plus acesulfame-K — note this differs from the US can, which uses sucralose. Because it contains aspartame it carries a phenylalanine warning and is unsuitable for people with phenylketonuria (PKU). Dropping the sugar lifts it well above the Original, but the artificial-sweetener load keeps it out of 'good' territory. The 'colour' is listed generically on the Canadian label, so we don't claim which one it is.",
  },
  {
    id: "red-bull-zero-250",
    category: "Energy Drinks",
    brand: "Red Bull",
    name: "Red Bull Zero",
    servingMl: 250,
    calories: 11,
    caloriesEstimated: true,
    sugar: 0,
    caffeineMg: 80,
    sweetener: "Erythritol + sucralose (no aspartame, no ace-K)",
    ingredients:
      "Carbonated water, erythritol, taurine, citric acid, lactic acid, malic acid, caffeine, sodium bicarbonate, sucralose, magnesium carbonate, xanthan gum, niacinamide, pyridoxine hydrochloride, calcium D-pantothenate, cyanocobalamin, artificial flavour, caramel colour, riboflavin",
    nutritionEstimated: true,
    availability: "Real Canadian Superstore (250 mL) — availability confirmed",
    gorillaAnalysis:
      "A genuinely different product from Sugarfree, not a rename: Zero uses erythritol plus sucralose and contains no aspartame or acesulfame-K, so there's no PKU concern. The trade-off is a longer additive list (it also carries caramel colour), which nudges it just below Sugarfree. Both zero-sugar Red Bulls land far ahead of the 27 g-sugar Original. Only the 250 mL Zero is confirmed in Canada.",
  },
];
