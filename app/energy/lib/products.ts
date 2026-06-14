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
  /**
   * Caffeine in mg per can. Drives the caffeine band (green <100 · yellow
   * 100–200 · red >200). Omit when an exact figure isn't verified and use
   * `caffeineNote` instead — never present an unverified number as fact.
   */
  caffeineMg?: number;
  /**
   * Honest caffeine text shown INSTEAD of a numeric badge when no exact mg
   * figure is verified (e.g. a reformulated Canadian SKU). Rendered in a
   * neutral badge so it doesn't imply a false band colour.
   */
  caffeineNote?: string;
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
  /**
   * Free-text allergen note shown in a warning block (same treatment as the PKU
   * warning) — e.g. coconut/tree-nut. Omit when there's no allergen to flag.
   */
  allergenWarning?: string;
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

  // ───────────────────────── MONSTER ─────────────────────────
  {
    id: "monster-energy-original-473",
    category: "Energy Drinks",
    brand: "Monster",
    name: "Monster Energy (Original)",
    servingMl: 473,
    calories: 210,
    caloriesEstimated: true,
    sugar: 54,
    caffeineMg: 164,
    sweetener: "Sugar + glucose + sucralose",
    ingredients:
      "Carbonated water, sucrose, glucose, citric acid, natural flavours, sodium citrate, grape skin extract (natural colour), sorbic acid, benzoic acid, sodium chloride, sucralose, maltodextrin, taurine, panax ginseng, caffeine, niacinamide, d-glucuronolactone, inositol, guarana, B6, riboflavin, B12",
    nutritionEstimated: true,
    availability: "Real Canadian Superstore — wide availability",
    gorillaAnalysis:
      "A full 473 mL can carries roughly 54 g of sugar — about three times a 250 mL Red Bull Original — plus 164 mg of caffeine, near half an adult's daily ceiling in one can. The sugar load alone sinks the nutrition score; it also pairs sugar with sucralose, so you get both. The zero-sugar Ultra is the materially better Monster.",
  },
  {
    id: "monster-zero-ultra-473",
    category: "Energy Drinks",
    brand: "Monster",
    name: "Monster Zero Ultra",
    servingMl: 473,
    calories: 10,
    sugar: 0,
    caffeineMg: 137,
    sweetener: "Erythritol + sucralose + acesulfame-K",
    ingredients:
      "Carbonated water, citric acid, erythritol, taurine, sodium citrate, natural & artificial flavours, panax ginseng, caffeine, sorbic acid, sucralose, benzoic acid, acesulfame potassium, niacinamide, d-calcium pantothenate, sodium chloride, d-glucuronolactone, guarana, inositol, B6, B12",
    availability: "Real Canadian Superstore — wide availability",
    gorillaAnalysis:
      "Zero sugar drops the calories to nil, the right move versus the Original. The catch is a triple-sweetener system (erythritol + sucralose + acesulfame-K) on top of two preservatives (sorbic + benzoic acid), so the additive load is what holds the score back rather than the macros.",
  },
  {
    id: "monster-juice-mango-loco-473",
    category: "Energy Drinks",
    brand: "Monster",
    name: "Monster Juice Mango Loco",
    servingMl: 473,
    calories: 230,
    sugar: 50,
    caffeineMg: 151,
    sweetener: "Sugar + sucralose",
    ingredients:
      "Carbonated water, sugar, mango juice concentrate, guava puree, white grape juice concentrate, glucose, apple juice concentrate, citric acid, taurine, pineapple syrup, pineapple juice concentrate, potassium citrate, flavours, panax ginseng, sodium citrate, potassium sorbate, caffeine, niacinamide, sucralose, xanthan gum, sodium alginate, gum arabic, sodium benzoate, B6, riboflavin, ester gum, salt, allura red, B12",
    nutritionEstimated: true,
    availability: "Real Canadian Superstore — wide availability",
    gorillaAnalysis:
      "The 'juice' framing hides a ~50 g+ sugar can — the juice content doesn't make it a health drink. On additives it's one of the heaviest here: it still uses sucralose despite the sugar, and it carries Allura Red (Red 40), an artificial azo dye carrying an EU hyperactivity warning label. Both the sugar and the dye drag this one down.",
  },

  // ───────────────────────── CELSIUS ─────────────────────────
  {
    id: "celsius-original-355",
    category: "Energy Drinks",
    brand: "Celsius",
    name: "Celsius Energy",
    servingMl: 355,
    calories: 10,
    sugar: 0,
    // No verified Canadian mg figure: the US 200 mg label is non-compliant in
    // Canada and the CA can is reformulated. Show honest text, not a fabricated number.
    caffeineNote: "≤180 mg (Health Canada compliant) — exact figure pending physical-can verification",
    sweetener: "Sucralose + acesulfame-K",
    ingredients:
      "Carbonated water, citric acid, taurine, instant green tea, caffeine, calcium carbonate, ascorbic acid, glucuronolactone, sucralose, acesulfame potassium, calcium pantothenate, niacinamide, flavour, ginger, B6, riboflavin, beta-carotene, biotin, B12",
    availability: "Canadian grocery & pharmacy — wide availability",
    gorillaAnalysis:
      "The Canadian Celsius is reformulated to meet Health Canada's caffeine cap — the widely cited US 200 mg figure does not apply here, so we show a compliant ceiling rather than invent a number until we verify a physical can. Zero sugar is good; the score reflects the sucralose + acesulfame-K pairing. It does use friendlier antioxidants (ascorbic acid, beta-carotene) that are flag-only, not penalties.",
  },

  // ───────────────────────── PRIME ─────────────────────────
  {
    id: "prime-energy-355",
    category: "Energy Drinks",
    brand: "Prime",
    name: "Prime Energy",
    servingMl: 355,
    calories: 10,
    sugar: 0,
    caffeineMg: 140,
    sweetener: "Sucralose + acesulfame-K",
    allergenWarning:
      "Contains coconut water. Coconut is classified as a tree nut for allergen-labelling purposes — those with tree-nut allergy should treat with caution.",
    ingredients:
      "Carbonated filtered water, coconut water from concentrate, citric acid, calcium lactate, magnesium citrate, potassium citrate, sodium citrate, caffeine, sucralose, potassium sorbate, sodium benzoate, L-theanine, acesulfame potassium, inositol, taurine, glucuronolactone, B6, B12",
    availability: "Canadian grocery & big-box — wide availability",
    gorillaAnalysis:
      "Zero sugar and an electrolyte/coconut-water angle, but the sweetener system is the familiar sucralose + acesulfame-K, and it stacks two preservatives (potassium sorbate + sodium benzoate). The coconut-water base means tree-nut-allergic drinkers should take note. Solid macros, mid additive load.",
  },

  // ───────────────────────── ROCKSTAR ─────────────────────────
  {
    id: "rockstar-original-473",
    category: "Energy Drinks",
    brand: "Rockstar",
    name: "Rockstar Energy (Original)",
    servingMl: 473,
    calories: 250,
    caloriesEstimated: true,
    sugar: 63,
    caffeineMg: 160,
    sweetener: "Sugar + glucose",
    ingredients:
      "Carbonated water, sugar, glucose, citric acid, taurine, sodium citrate, caffeine, potassium sorbate, sodium benzoate, calcium pantothenate, inositol, niacinamide, dicalcium phosphate, riboflavin, B6, panax ginseng, guarana, B12, caramel colour, natural & artificial flavour",
    nutritionEstimated: true,
    availability: "Real Canadian Superstore — wide availability",
    gorillaAnalysis:
      "Among the sweetest cans on the board at roughly 63 g of sugar — more than a can of Coke — which is the dominant reason it scores poorly. Caffeine is the brand-standard ~160 mg pending can verification. Sugar aside, it also runs two preservatives and caramel colour. The Sugar Free version is the only sensible Rockstar pick.",
  },
  {
    id: "rockstar-sugar-free-473",
    category: "Energy Drinks",
    brand: "Rockstar",
    name: "Rockstar Sugar Free",
    servingMl: 473,
    calories: 10,
    sugar: 0,
    caffeineMg: 160,
    sweetener: "Acesulfame-K + sucralose",
    ingredients:
      "Carbonated water, citric acid, taurine, flavour, sodium citrate, caffeine, caramel colour, sodium benzoate, potassium sorbate, acesulfame potassium, sucralose, calcium pantothenate, inositol, milk thistle extract, ginkgo biloba extract, niacinamide, guarana, riboflavin, panax ginseng, B6, B12",
    availability: "Real Canadian Superstore — wide availability",
    gorillaAnalysis:
      "Cutting the 63 g of sugar transforms the macros and lifts it far above the Original. What's left holding it back is the additive stack: acesulfame-K + sucralose plus two preservatives and caramel colour. Caffeine is the brand-standard ~160 mg pending verification.",
  },

  // ───────────────────────── BANG ─────────────────────────
  {
    id: "bang-473",
    category: "Energy Drinks",
    brand: "Bang",
    name: "Bang Energy",
    servingMl: 473,
    calories: 0,
    sugar: 0,
    caffeineMg: 180,
    sweetener: "Sucralose + acesulfame-K",
    ingredients:
      "Carbonated water, citric acid, natural & artificial flavours, L-leucine, L-isoleucine, caffeine, L-valine, potassium sorbate, sodium citrate, sucralose, acesulfame potassium, potassium phosphate, sodium benzoate, magnesium chloride, calcium chloride, niacinamide, B6, B12",
    availability: "Canadian grocery & supplement retailers",
    gorillaAnalysis:
      "Genuinely zero calories with a high 180 mg caffeine hit and added BCAAs. The macros are clean, so the score is driven entirely by additives: sucralose + acesulfame-K, two preservatives (potassium sorbate + sodium benzoate), and potassium phosphate. Well-formulated on paper, but it leans hard on the sweetener-and-preservative toolkit.",
  },

  // ───────────────────────── REIGN ─────────────────────────
  {
    id: "reign-473",
    category: "Energy Drinks",
    brand: "Reign",
    name: "Reign Total Body Fuel",
    servingMl: 473,
    calories: 10,
    sugar: 0,
    caffeineMg: 180,
    sweetener: "Sucralose",
    ingredients:
      "Carbonated water, citric acid, natural flavours, sodium citrate, L-leucine, caffeine, L-isoleucine, L-valine, sucralose, potassium sorbate, sodium benzoate, potassium citrate, niacinamide, magnesium citrate, CoQ10, B6, B12",
    availability: "Canadian grocery & supplement retailers",
    gorillaAnalysis:
      "One of the cleaner zero-sugar performance cans here: it relies on a single sweetener (sucralose) rather than the usual sucralose + acesulfame-K pairing, which meaningfully lifts its additive score versus most rivals. Still carries two preservatives, but the shorter additive list shows. 180 mg caffeine is on the high side.",
  },

  // ───────────────────────── C4 ─────────────────────────
  {
    id: "c4-performance-473",
    category: "Energy Drinks",
    brand: "C4",
    name: "C4 Performance Energy",
    servingMl: 473,
    calories: 0,
    sugar: 0,
    caffeineMg: 140,
    sweetener: "Sucralose + acesulfame-K",
    ingredients:
      "Carbonated water, taurine, citric acid, malic acid, L-arginine, natural & artificial flavours, potassium sorbate, caffeine anhydrous, sucralose, acesulfame potassium, niacinamide, B12",
    availability: "Canadian supplement & grocery retailers",
    gorillaAnalysis:
      "The shortest ingredient list of the performance cans — zero calories, one preservative, and no dyes or gums. That brevity is exactly why its additive score is among the highest here. The only real knock is the sucralose + acesulfame-K pairing; otherwise this is about as clean as a flavoured zero-sugar energy drink gets.",
  },

  // ───────────────────────── NOS ─────────────────────────
  {
    id: "nos-473",
    category: "Energy Drinks",
    brand: "NOS",
    name: "NOS Energy",
    servingMl: 473,
    calories: 210,
    sugar: 54,
    caffeineMg: 160,
    sweetener: "Glucose-fructose + sucralose",
    ingredients:
      "Carbonated water, glucose-fructose, citric acid, sodium citrate, sodium hexametaphosphate, flavours, taurine, caffeine, gum arabic, potassium sorbate, ester gum, tartrazine, sucralose, inositol, calcium disodium EDTA, B6, sunset yellow, guarana, B12",
    nutritionEstimated: true,
    availability: "Canadian grocery & convenience — availability varies",
    gorillaAnalysis:
      "The most additive-heavy can on the board, and it pairs that with ~54 g of sugar. It carries TWO artificial azo dyes — Tartrazine (Yellow 5) and Sunset Yellow (Yellow 6) — both flagged under the EU hyperactivity warning, alongside sucralose, phosphates, and EDTA. High sugar and the worst additive profile here put it at the bottom.",
  },
];
