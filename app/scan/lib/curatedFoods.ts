/**
 * Hardcoded curated food database — common Canadian consumer products that must
 * always return a result regardless of external API availability.
 *
 * Nutrition values are per 100ml (for beverages) or per 100g (for foods).
 * These go through the normal food scoring pipeline — no special cases.
 */

import type { OffProduct } from "./openFoodFacts";
import type { Nutriments } from "./scoring";

type CuratedFoodEntry = {
  barcode: string;
  name: string;
  brand: string;
  servingSize?: string;
  categoriesTags: string[];
  ingredientsText: string;
  nutriments: Nutriments;
  novaGroup?: number;
};

// ── Per-100ml soft drink nutrition ────────────────────────────────────────────
// Standard 355ml can → divide by 3.55 for per-100ml values.

const SODAS: CuratedFoodEntry[] = [
  {
    barcode: "0062100012284",
    name: "Canada Dry Zero Sugar Ginger Ale",
    brand: "Canada Dry",
    servingSize: "355ml",
    categoriesTags: ["en:beverages", "en:carbonated-drinks", "en:sodas", "en:diet-sodas"],
    ingredientsText: "Carbonated water, citric acid, natural flavours, sodium citrate, aspartame, acesulfame potassium, sodium benzoate",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 0,
      carbohydrates_100g: 0,
      sugars_100g: 0,
      proteins_100g: 0,
      salt_100g: 0.05,
    },
  },
  {
    barcode: "0062100012291",
    name: "Canada Dry Ginger Ale",
    brand: "Canada Dry",
    servingSize: "355ml",
    categoriesTags: ["en:beverages", "en:carbonated-drinks", "en:sodas"],
    ingredientsText: "Carbonated water, high fructose corn syrup, citric acid, natural flavours, sodium citrate, caramel colour, sodium benzoate",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 39,
      carbohydrates_100g: 11,
      sugars_100g: 11,
      proteins_100g: 0,
      salt_100g: 0.02,
    },
  },
  {
    barcode: "0069000019832",
    name: "Coca-Cola Classic",
    brand: "Coca-Cola",
    servingSize: "355ml",
    categoriesTags: ["en:beverages", "en:carbonated-drinks", "en:sodas", "en:colas"],
    ingredientsText: "Carbonated water, high fructose corn syrup, caramel colour (class IV), phosphoric acid, natural flavours, caffeine",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 39,
      carbohydrates_100g: 11,
      sugars_100g: 11,
      proteins_100g: 0,
      salt_100g: 0.01,
    },
  },
  {
    barcode: "0069000012527",
    name: "Diet Coke",
    brand: "Coca-Cola",
    servingSize: "355ml",
    categoriesTags: ["en:beverages", "en:carbonated-drinks", "en:sodas", "en:diet-sodas", "en:colas"],
    ingredientsText: "Carbonated water, caramel colour (class IV), phosphoric acid, natural flavours, citric acid, aspartame, acesulfame potassium, caffeine",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 0,
      carbohydrates_100g: 0,
      sugars_100g: 0,
      proteins_100g: 0,
      salt_100g: 0.01,
    },
  },
  {
    barcode: "0069000008947",
    name: "Pepsi",
    brand: "PepsiCo",
    servingSize: "355ml",
    categoriesTags: ["en:beverages", "en:carbonated-drinks", "en:sodas", "en:colas"],
    ingredientsText: "Carbonated water, high fructose corn syrup, caramel colour, phosphoric acid, caffeine, citric acid, natural flavours",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 42,
      carbohydrates_100g: 11.5,
      sugars_100g: 11.5,
      proteins_100g: 0,
      salt_100g: 0.01,
    },
  },
  {
    barcode: "0069000016534",
    name: "Diet Pepsi",
    brand: "PepsiCo",
    servingSize: "355ml",
    categoriesTags: ["en:beverages", "en:carbonated-drinks", "en:sodas", "en:diet-sodas", "en:colas"],
    ingredientsText: "Carbonated water, caramel colour, phosphoric acid, citric acid, aspartame, acesulfame potassium, caffeine, natural flavours",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 0,
      carbohydrates_100g: 0,
      sugars_100g: 0,
      proteins_100g: 0,
      salt_100g: 0.01,
    },
  },
  {
    barcode: "0069000019849",
    name: "Sprite",
    brand: "Coca-Cola",
    servingSize: "355ml",
    categoriesTags: ["en:beverages", "en:carbonated-drinks", "en:sodas"],
    ingredientsText: "Carbonated water, high fructose corn syrup, citric acid, natural flavours, sodium citrate, sodium benzoate",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 39,
      carbohydrates_100g: 10.7,
      sugars_100g: 10.7,
      proteins_100g: 0,
      salt_100g: 0.02,
    },
  },
];

// ── Per-100g packaged food nutrition ─────────────────────────────────────────

const PACKAGED_FOODS: CuratedFoodEntry[] = [
  {
    barcode: "0057000021691",
    name: "Tomato Ketchup",
    brand: "Heinz",
    servingSize: "15g",
    categoriesTags: ["en:condiments", "en:sauces", "en:ketchup"],
    ingredientsText: "Tomato concentrate, distilled vinegar, high fructose corn syrup, corn syrup, salt, spice, onion powder, natural flavoring",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 133,
      carbohydrates_100g: 33,
      sugars_100g: 27,
      proteins_100g: 1.5,
      salt_100g: 2.3,
      "saturated-fat_100g": 0,
    },
  },
  {
    // Barcode corrected 2026-06: 0028400090308 is Doritos, not Lay's.
    barcode: "0028400090155",
    name: "Lay's Classic",
    brand: "Frito-Lay",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:chips-and-crisps", "en:salty-snacks"],
    ingredientsText: "Potatoes, vegetable oil (sunflower, corn, and/or canola oil), salt",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 536,
      carbohydrates_100g: 54,
      sugars_100g: 0.5,
      proteins_100g: 7,
      salt_100g: 1.8,
      "saturated-fat_100g": 1.8,
    },
  },
  {
    barcode: "0028400090308",
    name: "Doritos Nacho Cheese",
    brand: "Frito-Lay",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:chips-and-crisps", "en:salty-snacks", "en:tortilla-chips"],
    ingredientsText: "Corn, vegetable oil, seasoning (whey, cheddar cheese, maltodextrin, salt, monosodium glutamate, artificial colours [Yellow 6, Yellow 5, Red 40], natural and artificial flavours, lactic acid, citric acid)",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 500,
      carbohydrates_100g: 60,
      sugars_100g: 2.8,
      proteins_100g: 7,
      salt_100g: 1.6,
      "saturated-fat_100g": 4,
    },
  },
  {
    barcode: "0028400590679",
    name: "Tostitos Restaurant Style",
    brand: "Frito-Lay",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:chips-and-crisps", "en:salty-snacks", "en:tortilla-chips"],
    ingredientsText: "Corn, vegetable oil (corn, canola, and/or sunflower oil), salt",
    novaGroup: 3,
    nutriments: {
      "energy-kcal_100g": 500,
      carbohydrates_100g: 68,
      sugars_100g: 0,
      proteins_100g: 7,
      salt_100g: 1.0,
      "saturated-fat_100g": 1.8,
    },
  },
  {
    barcode: "0044000030131",
    name: "Oreo Original",
    brand: "Nabisco",
    servingSize: "34g",
    categoriesTags: ["en:snacks", "en:sweet-snacks", "en:biscuits-and-cakes", "en:cookies"],
    ingredientsText: "Unbleached enriched flour, sugar, palm and/or canola oil, cocoa (processed with alkali), high fructose corn syrup, leavening, cornstarch, salt, soy lecithin, vanillin (artificial flavour)",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 471,
      carbohydrates_100g: 74,
      sugars_100g: 41,
      proteins_100g: 5,
      salt_100g: 1.3,
      "saturated-fat_100g": 7.4,
    },
  },
];

// ── Gorilla Approved whole foods (Canadian brands + international staples) ────

const APPROVED_FOODS: CuratedFoodEntry[] = [
  {
    barcode: "0628451026059",
    name: "Nomz Energy Bites",
    brand: "Nomz",
    servingSize: "30g",
    categoriesTags: ["en:snacks", "en:energy-bars", "en:snack-bars"],
    ingredientsText: "Dates, almonds, cashews, coconut, cacao",
    novaGroup: 1,
    nutriments: {
      "energy-kcal_100g": 470,
      carbohydrates_100g: 55,
      sugars_100g: 44,
      proteins_100g: 8,
      "saturated-fat_100g": 6,
      salt_100g: 0.03,
    },
  },
  {
    barcode: "0058755001231",
    name: "Liberté Greek Yogurt Plain 0%",
    brand: "Liberté",
    servingSize: "175g",
    categoriesTags: ["en:dairy", "en:fermented-foods", "en:yogurts", "en:greek-yogurts"],
    ingredientsText: "Skim milk, live active cultures (Lactobacillus bulgaricus, Streptococcus thermophilus)",
    novaGroup: 1,
    nutriments: {
      "energy-kcal_100g": 51,
      carbohydrates_100g: 3.9,
      sugars_100g: 3.9,
      proteins_100g: 8.6,
      "saturated-fat_100g": 0,
      salt_100g: 0.1,
    },
  },
  {
    barcode: "0067040303010",
    name: "Hardbite Chips Sea Salt",
    brand: "Hardbite",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:chips-and-crisps", "en:salty-snacks"],
    ingredientsText: "Potatoes, sunflower oil, sea salt",
    novaGroup: 3,
    nutriments: {
      "energy-kcal_100g": 536,
      carbohydrates_100g: 58,
      sugars_100g: 0.5,
      proteins_100g: 7,
      "saturated-fat_100g": 1.5,
      salt_100g: 1.2,
    },
  },
  {
    barcode: "0041660300047",
    name: "SkinnyPop Original Popcorn",
    brand: "SkinnyPop",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:popcorn", "en:salty-snacks"],
    ingredientsText: "Popcorn, sunflower oil, salt",
    novaGroup: 2,
    nutriments: {
      "energy-kcal_100g": 536,
      carbohydrates_100g: 64,
      sugars_100g: 0,
      proteins_100g: 11,
      "saturated-fat_100g": 3.5,
      salt_100g: 0.9,
    },
  },
  {
    barcode: "0858547004149",
    name: "RXBAR Chocolate Sea Salt",
    brand: "RXBAR",
    servingSize: "52g",
    categoriesTags: ["en:snacks", "en:energy-bars", "en:snack-bars", "en:protein-bars"],
    ingredientsText: "Dates, egg whites, almonds, cashews, cocoa, sea salt, natural chocolate flavour",
    novaGroup: 1,
    nutriments: {
      "energy-kcal_100g": 404,
      carbohydrates_100g: 46,
      sugars_100g: 25,
      proteins_100g: 23,
      "saturated-fat_100g": 3.8,
      salt_100g: 0.5,
    },
  },
  {
    barcode: "0021908516890",
    name: "Larabar Apple Pie",
    brand: "Larabar",
    servingSize: "45g",
    categoriesTags: ["en:snacks", "en:energy-bars", "en:snack-bars"],
    ingredientsText: "Dates, almonds, unsweetened apples, walnuts, cinnamon",
    novaGroup: 1,
    nutriments: {
      "energy-kcal_100g": 422,
      carbohydrates_100g: 71,
      sugars_100g: 47,
      proteins_100g: 6.7,
      "saturated-fat_100g": 1.1,
      salt_100g: 0,
    },
  },
];

// ── Cheat list Canadian products ──────────────────────────────────────────────

const CHEAT_LIST_FOODS: CuratedFoodEntry[] = [
  {
    barcode: "0060410016476",
    name: "Miss Vickie's Sea Salt & Malt Vinegar",
    brand: "Miss Vickie's",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:chips-and-crisps", "en:kettle-chips", "en:salty-snacks"],
    ingredientsText: "Potatoes, sunflower oil, seasoning (malt vinegar powder, sea salt, maltodextrin, yeast extract)",
    novaGroup: 3,
    nutriments: {
      "energy-kcal_100g": 536,
      carbohydrates_100g: 62,
      sugars_100g: 1.5,
      proteins_100g: 7,
      "saturated-fat_100g": 1.8,
      salt_100g: 1.4,
    },
  },
  {
    barcode: "0063600013113",
    name: "Breton Original Crackers",
    brand: "Dare Foods",
    servingSize: "30g",
    categoriesTags: ["en:snacks", "en:crackers", "en:biscuits-and-cakes"],
    ingredientsText: "Wheat flour, vegetable oil (palm, canola), whole wheat flour, sugar, salt, leavening agents, soy lecithin",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 444,
      carbohydrates_100g: 65,
      sugars_100g: 5,
      proteins_100g: 8,
      "saturated-fat_100g": 4,
      salt_100g: 1.6,
    },
  },
  {
    barcode: "0607813037016",
    name: "Boom Chicka Pop White Cheddar Popcorn",
    brand: "Angie's Boomchickapop",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:popcorn", "en:salty-snacks"],
    ingredientsText: "Popcorn, sunflower oil, white cheddar seasoning (whey, cheddar cheese, salt, natural flavours, lactic acid)",
    novaGroup: 3,
    nutriments: {
      "energy-kcal_100g": 536,
      carbohydrates_100g: 57,
      sugars_100g: 3.6,
      proteins_100g: 10.7,
      "saturated-fat_100g": 6,
      salt_100g: 1.4,
    },
  },
];

// ── Stay Away Canadian products ───────────────────────────────────────────────

const STAY_AWAY_FOODS: CuratedFoodEntry[] = [
  {
    barcode: "0060383060019",
    name: "Old Dutch Party Mix",
    brand: "Old Dutch Foods",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:salty-snacks", "en:snack-mixes"],
    ingredientsText: "Corn meal, vegetable oil, potato starch, salt, sugar, seasonings, artificial colour, TBHQ",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 480,
      carbohydrates_100g: 65,
      sugars_100g: 3,
      proteins_100g: 7,
      "saturated-fat_100g": 5,
      salt_100g: 1.5,
    },
  },
  {
    barcode: "0060383070025",
    name: "Humpty Dumpty Cheese Sticks",
    brand: "Old Dutch Foods",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:salty-snacks", "en:chips-and-crisps"],
    ingredientsText: "Cornmeal, vegetable oil, cheddar cheese seasoning (whey powder, cheddar cheese, maltodextrin, salt, natural cheese flavour, Yellow 5, Yellow 6)",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 536,
      carbohydrates_100g: 60,
      sugars_100g: 2,
      proteins_100g: 7,
      "saturated-fat_100g": 8,
      salt_100g: 1.5,
    },
  },
  {
    barcode: "0060383089027",
    name: "Arriba Nacho Chips",
    brand: "Old Dutch Foods",
    servingSize: "28g",
    categoriesTags: ["en:snacks", "en:chips-and-crisps", "en:salty-snacks", "en:tortilla-chips"],
    ingredientsText: "Corn masa flour, vegetable oil, salt, seasoning (maltodextrin, monosodium glutamate, artificial colour)",
    novaGroup: 4,
    nutriments: {
      "energy-kcal_100g": 500,
      carbohydrates_100g: 62,
      sugars_100g: 1,
      proteins_100g: 7,
      "saturated-fat_100g": 4,
      salt_100g: 1.4,
    },
  },
];

// ── Curated supplement fallback (guaranteed hits for top-selling supplements) ──
// Nutrition values per 100g of product (not per serving).

const SUPPLEMENTS: CuratedFoodEntry[] = [
  {
    barcode: "748927059380",
    name: "Gold Standard Creatine Monohydrate",
    brand: "Optimum Nutrition",
    servingSize: "5g",
    categoriesTags: ["en:dietary-supplements", "en:sports-nutrition", "en:creatine"],
    ingredientsText: "Creatine Monohydrate, Silicon Dioxide",
    novaGroup: 1,
    nutriments: {
      "energy-kcal_100g": 0,
      carbohydrates_100g: 0,
      sugars_100g: 0,
      proteins_100g: 0,
      salt_100g: 0,
    },
  },
  {
    barcode: "768990027710",
    name: "Ultimate Omega Fish Oil",
    brand: "Nordic Naturals",
    servingSize: "2 softgels (2.6g)",
    categoriesTags: ["en:dietary-supplements", "en:omega-3", "en:fish-oil"],
    ingredientsText: "Fish oil concentrate (anchovy, sardine), gelatin, glycerin, water, natural lemon flavour",
    novaGroup: 1,
    nutriments: {
      "energy-kcal_100g": 962,
      carbohydrates_100g: 0,
      sugars_100g: 0,
      proteins_100g: 0,
      "saturated-fat_100g": 19.2,
      salt_100g: 0,
    },
  },
  {
    barcode: "689076626498",
    name: "Whey+ Protein Powder",
    brand: "Legion Athletics",
    servingSize: "35g",
    categoriesTags: ["en:dietary-supplements", "en:sports-nutrition", "en:protein-powders", "en:whey-protein"],
    ingredientsText: "Whey protein isolate, whey protein concentrate, natural flavours, sunflower lecithin, stevia leaf extract",
    novaGroup: 3,
    nutriments: {
      "energy-kcal_100g": 371,
      carbohydrates_100g: 11.4,
      sugars_100g: 5.7,
      proteins_100g: 62.9,
      "saturated-fat_100g": 2.9,
      salt_100g: 0.4,
    },
  },
  {
    barcode: "850002454025",
    name: "Creatine HMB",
    brand: "Transparent Labs",
    servingSize: "14.5g",
    categoriesTags: ["en:dietary-supplements", "en:sports-nutrition", "en:creatine"],
    ingredientsText: "Creatine monohydrate, calcium beta-hydroxy beta-methylbutyrate (HMB), malic acid, silicon dioxide, stevia leaf extract",
    novaGroup: 1,
    nutriments: {
      "energy-kcal_100g": 0,
      carbohydrates_100g: 0,
      sugars_100g: 0,
      proteins_100g: 0,
      salt_100g: 0,
    },
  },
];

const ALL_ENTRIES: CuratedFoodEntry[] = [...SODAS, ...PACKAGED_FOODS, ...APPROVED_FOODS, ...CHEAT_LIST_FOODS, ...STAY_AWAY_FOODS, ...SUPPLEMENTS];

// Normalise a barcode string: strip non-digits, strip leading zeros.
function normBarcode(b: string): string {
  return b.replace(/\D/g, "").replace(/^0+/, "") || "0";
}

/** Search curated foods (non-supplement) by name or brand (case-insensitive). */
export function searchCuratedFoods(query: string, limit = 5): CuratedFoodEntry[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const nonSuppl = ALL_ENTRIES.filter((e) => !e.categoriesTags.includes("en:dietary-supplements"));
  return nonSuppl.filter(
    (e) => e.name.toLowerCase().includes(q) || e.brand.toLowerCase().includes(q)
  ).slice(0, limit);
}

/** Search curated supplements by name or brand (case-insensitive). */
export function searchCuratedSupplements(query: string, limit = 4): CuratedFoodEntry[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return SUPPLEMENTS.filter(
    (e) => e.name.toLowerCase().includes(q) || e.brand.toLowerCase().includes(q)
  ).slice(0, limit);
}

/**
 * Look up a barcode in the curated food database.
 * Returns an OffProduct ready for the normal food scoring pipeline, or null.
 */
export function lookupCuratedFood(barcode: string): OffProduct | null {
  const norm = normBarcode(barcode);
  const entry = ALL_ENTRIES.find((e) => normBarcode(e.barcode) === norm);
  if (!entry) return null;

  return {
    code: barcode,
    product_name: entry.name,
    brands: entry.brand,
    serving_size: entry.servingSize,
    categories_tags: entry.categoriesTags,
    ingredients_text: entry.ingredientsText,
    nutriments: entry.nutriments,
    nova_group: entry.novaGroup,
  };
}
