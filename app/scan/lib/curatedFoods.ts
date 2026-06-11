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
    barcode: "0028400090308",
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

const ALL_ENTRIES: CuratedFoodEntry[] = [...SODAS, ...PACKAGED_FOODS, ...SUPPLEMENTS];

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
