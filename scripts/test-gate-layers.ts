// One-off verification of brand caps, category caps, and ingredient sanity.
import { applyScoringGate } from "../app/scan/lib/curatedScores";

const cases: { name: string; algo: number; input: Parameters<typeof applyScoringGate>[1]; expectMax: number; expectSource: string }[] = [
  // Brand caps — the Humpty Dumpty 73 bug
  { name: "Humpty Dumpty Dill Pickle (algo 73)", algo: 73,
    input: { barcode: "0060383099999", productName: "Humpty Dumpty Dill Pickle Chips", brand: "Old Dutch Foods" },
    expectMax: 35, expectSource: "brand-capped" },
  { name: "Pringles Sour Cream (algo 68)", algo: 68,
    input: { barcode: "111", productName: "Pringles Sour Cream & Onion", brand: "Kellogg's" },
    expectMax: 40, expectSource: "brand-capped" },
  { name: "Lay's Classic exempt from flavoured cap", algo: 58,
    input: { barcode: "112", productName: "Lay's Classic Original", brand: "Frito-Lay" },
    expectMax: 58, expectSource: "gorilla-verified" }, // name-matches curated entry
  // Category caps
  { name: "generic cheese puffs (algo 70)", algo: 70,
    input: { barcode: "113", productName: "Crunchy Cheese Puffs", brand: "Generic" },
    expectMax: 25, expectSource: "category-scored" },
  { name: "candy category (algo 60)", algo: 60,
    input: { barcode: "114", productName: "Rainbow Belts", categoriesTags: ["en:candies"], brand: "Generic" },
    expectMax: 35, expectSource: "category-scored" },
  { name: "instant ramen (algo 55)", algo: 55,
    input: { barcode: "115", productName: "Chicken Instant Noodles", brand: "Generic" },
    expectMax: 35, expectSource: "category-scored" },
  // Ingredient sanity
  { name: "Red 40 product (algo 75)", algo: 75,
    input: { barcode: "116", productName: "Zero Sugar Energy Mix", ingredientsText: "citric acid, red 40, sucralose" },
    expectMax: 50, expectSource: "ingredient-flagged" },
  { name: "two dyes (algo 75)", algo: 75,
    input: { barcode: "117", productName: "Party Drink", ingredientsText: "water, yellow 5, blue 1" },
    expectMax: 40, expectSource: "ingredient-flagged" },
  { name: "artificial flavour + colour (algo 60)", algo: 60,
    input: { barcode: "118", productName: "Snack Thing", ingredientsText: "corn, artificial flavour, yellow 6" },
    expectMax: 38, expectSource: "ingredient-flagged" },
  { name: "MSG (algo 70)", algo: 70,
    input: { barcode: "119", productName: "Savoury Bites", ingredientsText: "rice, monosodium glutamate, salt" },
    expectMax: 55, expectSource: "ingredient-flagged" },
  { name: "HFCS (algo 60)", algo: 60,
    input: { barcode: "120", productName: "Sweet Sauce", ingredientsText: "glucose-fructose, tomato paste" },
    expectMax: 45, expectSource: "ingredient-flagged" },
  { name: "NOVA 4 (algo 72)", algo: 72,
    input: { barcode: "121", productName: "Mystery Meal", ingredientsText: "stuff", novaGroup: 4 },
    expectMax: 50, expectSource: "ingredient-flagged" },
  { name: "clean product passes untouched (algo 84)", algo: 84,
    input: { barcode: "122", productName: "Plain Rolled Oats", ingredientsText: "whole grain rolled oats" },
    expectMax: 84, expectSource: "algorithm" },
];

let fail = 0;
for (const c of cases) {
  const r = applyScoringGate(c.algo, c.input);
  const ok = r.score <= c.expectMax && r.score === Math.min(c.algo, c.expectMax) && r.scoreSource === c.expectSource;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.name}: score=${r.score} source=${r.scoreSource}${r.capReason ? ` (${r.capReason})` : ""}`);
}
console.log(fail === 0 ? "\n✓ all gate layer tests passed" : `\n✗ ${fail} failures`);
process.exit(fail === 0 ? 0 : 1);
