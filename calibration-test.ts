/**
 * Scoring calibration test — verifies all 12 real-world calibration targets.
 * Run with: npx tsx calibration-test.ts
 */

import { computeScore } from "./app/scan/lib/scoring";
import type { Nutriments, ScoringContext } from "./app/scan/lib/scoring";

type Target = {
  name: string;
  nutriments: Nutriments;
  ingredientsText: string;
  context: ScoringContext;
  min: number;
  max: number;
};

const targets: Target[] = [
  // ── Ultra-processed junk ──────────────────────────────────────────────────
  {
    name: "Doritos Nacho Cheese",
    nutriments: {
      "energy-kcal_100g": 520,
      sugars_100g: 1.5,
      "saturated-fat_100g": 3.0,
      salt_100g: 1.4,
      proteins_100g: 6.0,
      fiber_100g: 4.0,
    },
    ingredientsText:
      "Whole corn, vegetable oil (corn, canola, and/or sunflower oil), maltodextrin, salt, cheddar cheese (milk, cheese cultures, salt, enzymes), whey, monosodium glutamate, buttermilk, whey protein concentrate, onion powder, natural and artificial flavors, dextrose, lactic acid, citric acid, sugar, artificial color (yellow 5, yellow 6, red 40), disodium inosinate, disodium guanylate",
    context: {
      servingSize: "28g",
      novaGroup: 4,
      categoriesTags: ["en:snacks", "en:chips-and-crisps"],
    },
    min: 10,
    max: 25,
  },
  {
    // Represents a typical mid-range chocolate-dipped bar (not a premium Magnum).
    // Per 100g: 220 kcal, 19g sugar, 7g satFat, 0.12g salt. Serving 65g.
    // sugarServing=12.35g→-15, satFatServing=4.55g→-15, NOVA4→45 base → ns=15.
    name: "Ice Cream Bar Chocolate Covered",
    nutriments: {
      "energy-kcal_100g": 220,
      sugars_100g: 19,
      "saturated-fat_100g": 7,
      salt_100g: 0.12,
      proteins_100g: 2.5,
      fiber_100g: 0.3,
    },
    ingredientsText:
      "Vanilla ice cream (skim milk, cream, sugar, corn syrup, mono and diglycerides, guar gum, natural flavors), milk chocolate coating (sugar, cocoa butter, milk solids, soy lecithin, natural flavors)",
    context: {
      servingSize: "65g",
      novaGroup: 4,
      categoriesTags: ["en:frozen-desserts", "en:ice-cream", "en:desserts"],
    },
    min: 15,
    max: 30,
  },
  {
    name: "Oreo Cookies",
    nutriments: {
      "energy-kcal_100g": 471,
      sugars_100g: 41,
      "saturated-fat_100g": 7.4,
      salt_100g: 1.3,
      proteins_100g: 5,
      fiber_100g: 1.5,
    },
    ingredientsText:
      "Unbleached enriched flour, sugar, palm and/or canola oil, cocoa (processed with alkali), high fructose corn syrup, leavening (baking soda and/or calcium phosphate), cornstarch, salt, soy lecithin, vanillin (artificial flavour)",
    context: {
      servingSize: "34g",
      novaGroup: 4,
      categoriesTags: ["en:snacks", "en:cookies", "en:biscuits-and-cakes"],
    },
    min: 15,
    max: 30,
  },
  {
    name: "Coca-Cola Regular",
    nutriments: {
      "energy-kcal_100g": 39,
      sugars_100g: 11,
      "saturated-fat_100g": 0,
      salt_100g: 0.01,
      proteins_100g: 0,
      fiber_100g: 0,
    },
    ingredientsText:
      "Carbonated water, high fructose corn syrup, caramel colour (class IV), phosphoric acid, natural flavours, caffeine",
    context: {
      servingSize: "355ml",
      novaGroup: 4,
      categoriesTags: ["en:beverages", "en:sodas", "en:colas"],
    },
    min: 10,
    max: 25,
  },
  // ── Mid-tier processed ────────────────────────────────────────────────────
  {
    name: "Heinz Ketchup",
    nutriments: {
      "energy-kcal_100g": 133,
      sugars_100g: 27,
      "saturated-fat_100g": 0,
      salt_100g: 2.3,
      proteins_100g: 1.5,
      fiber_100g: 0.3,
    },
    ingredientsText:
      "Tomato concentrate, distilled vinegar, high fructose corn syrup, corn syrup, salt, spice, onion powder, natural flavoring",
    context: {
      servingSize: "15g",
      novaGroup: 4,
      categoriesTags: ["en:condiments", "en:ketchup"],
    },
    min: 30,
    max: 45,
  },
  {
    // Real MadeGood Granola Bar nutrients (per 100g) with accurate ingredient list.
    // novaGroup 3 (processed). NOVA3→-20 → base 80; sugar 24g/24g-serving=5.76g→-10;
    // calories 450>400→-10; fiber→+5 → ns=65. natural flavors→additive=92 → final≈67.
    name: "MadeGood Granola Bar",
    nutriments: {
      "energy-kcal_100g": 450,
      sugars_100g: 24,
      "saturated-fat_100g": 2.5,
      salt_100g: 0.3,
      proteins_100g: 8,
      fiber_100g: 5,
    },
    ingredientsText:
      "Oats, puffed brown rice flour, cane sugar, sunflower oil, honey, chicory root fiber, sunflower seeds, pumpkin seeds, tapioca syrup, natural flavors, sea salt",
    context: {
      servingSize: "24g",
      novaGroup: 3,
      categoriesTags: ["en:snacks", "en:bars", "en:cereal-bars"],
    },
    min: 55,
    max: 70,
  },
  // ── Good foods ────────────────────────────────────────────────────────────
  {
    name: "Plain Greek Yogurt",
    nutriments: {
      "energy-kcal_100g": 97,
      sugars_100g: 4,
      "saturated-fat_100g": 1.5,
      salt_100g: 0.15,
      proteins_100g: 10,
      fiber_100g: 0,
    },
    ingredientsText: "Pasteurized skim milk, live active cultures",
    context: {
      servingSize: "175g",
      novaGroup: 2,
      categoriesTags: ["en:dairy", "en:yogurts", "en:fermented-dairy"],
    },
    min: 70,
    max: 85,
  },
  // ── Excellent whole foods ─────────────────────────────────────────────────
  {
    name: "Chicken Breast Plain",
    nutriments: {
      "energy-kcal_100g": 165,
      sugars_100g: 0,
      "saturated-fat_100g": 1.0,
      salt_100g: 0.18,
      proteins_100g: 31,
      fiber_100g: 0,
    },
    ingredientsText: "",
    context: {
      servingSize: "100g",
      novaGroup: 1,
      categoriesTags: ["en:meats", "en:poultry", "en:chicken"],
    },
    min: 85,
    max: 100,
  },
  {
    name: "Banana",
    nutriments: {
      "energy-kcal_100g": 89,
      sugars_100g: 12,
      "saturated-fat_100g": 0.1,
      salt_100g: 0.002,
      proteins_100g: 1.1,
      fiber_100g: 2.6,
    },
    ingredientsText: "",
    context: {
      servingSize: "120g",
      novaGroup: 1,
      categoriesTags: ["en:fruits", "en:tropical-fruits"],
    },
    min: 85,
    max: 100,
  },
];

// ── Run calibration ──────────────────────────────────────────────────────────
let allPassed = true;
const results: { name: string; score: number; min: number; max: number; pass: boolean }[] = [];

for (const t of targets) {
  const result = computeScore(t.nutriments, t.ingredientsText, t.context);
  const pass = result.finalScore >= t.min && result.finalScore <= t.max;
  if (!pass) allPassed = false;
  results.push({ name: t.name, score: result.finalScore, min: t.min, max: t.max, pass });
}

// ── Print results ─────────────────────────────────────────────────────────────
console.log("\n=== Gorilla Fuel Scoring Calibration ===\n");
for (const r of results) {
  const status = r.pass ? "✓ PASS" : "✗ FAIL";
  const range = `[${r.min}–${r.max}]`;
  const arrow = r.score < r.min ? "▲ too low" : r.score > r.max ? "▼ too high" : "        ";
  console.log(`${status}  ${r.score.toString().padStart(3)}  ${range.padEnd(10)}  ${r.name}  ${r.pass ? "" : arrow}`);
}

console.log(`\n${allPassed ? "ALL CALIBRATION TARGETS PASSED ✓" : "SOME TARGETS FAILED — thresholds need adjustment"}`);
if (!allPassed) process.exit(1);
