/**
 * Data gate for the alcohol cards (runs in `prebuild`, after test:scores): a card whose numbers are physically
 * impossible, or that breaks a basic rule, blocks the build and therefore the deploy.
 *
 * FAIL (blocks the build):
 *   1. A card not flagged `nutritionEstimated` lists fewer calories than its own alcohol contains
 *      (ethanol is ~7 kcal/g; an unflagged card is presented as label-verified, so this cannot be true).
 *   2. Sugar is higher than total carbs (sugar is a subset of carbs).
 *   3. The same barcode is on two cards (the scanner returns only the first match), unless listed in KNOWN_DUPLICATE_BARCODES.
 *   4. A duplicate card id, a malformed barcode, or an ABV outside 0-80%.
 * WARN (printed, never blocks): estimated cards whose calories are below the alcohol's energy, and cards with no serving size.
 *
 * To fix a failure: correct the card from a label photo or the brewer's published figures, or mark it `nutritionEstimated: true`.
 * Do not weaken this test to get green.
 */
import { ALCOHOL_PRODUCTS } from "../app/alcohol/lib/products";

/** Barcodes known to sit on two cards. Each needs a follow-up: find which pack size the barcode belongs to and remove the other. */
const KNOWN_DUPLICATE_BARCODES = new Set<string>(["018200007573" /* busch-light and busch-light-473ml */]);

const fails: string[] = [];
const warns: string[] = [];

const cards = ALCOHOL_PRODUCTS.filter((p) => p.category !== "Wines");

const ids = new Map<string, number>();
const codes = new Map<string, string[]>();

for (const p of cards) {
  ids.set(p.id, (ids.get(p.id) ?? 0) + 1);
  const abv = p.abv ?? 0;
  if (abv < 0 || abv > 80) fails.push(`${p.name}: ABV ${abv}% is out of range`);

  for (const b of p.barcodes ?? []) {
    if (!/^\d{8,14}$/.test(b)) fails.push(`${p.name}: malformed barcode "${b}"`);
    codes.set(b, [...(codes.get(b) ?? []), p.name]);
  }

  if (p.caloriesPerCan != null && abv >= 0.6) {
    const ml = p.servingMl ?? 355;
    const alcoholKcal = ml * (abv / 100) * 0.789 * 7;
    if (p.caloriesPerCan < alcoholKcal - 5) {
      const msg = `${p.name}: ${p.caloriesPerCan} kcal is below the ~${Math.round(alcoholKcal)} kcal of its own alcohol (${ml} mL at ${abv}%)`;
      if (p.nutritionEstimated) warns.push(msg + " [flagged estimated]");
      else fails.push(msg + " [not flagged estimated]");
    }
  }

  if (p.sugarPerCan != null && p.carbsPerCan != null && p.sugarPerCan > p.carbsPerCan + 0.5) {
    fails.push(`${p.name}: sugar ${p.sugarPerCan} g is higher than carbs ${p.carbsPerCan} g`);
  }

  if (p.caloriesPerCan != null && p.servingMl == null) warns.push(`${p.name}: no serving size (assumes 355 mL)`);
}

for (const [id, n] of ids) if (n > 1) fails.push(`duplicate card id "${id}" (${n} cards)`);
for (const [code, names] of codes) {
  if (names.length > 1 && !KNOWN_DUPLICATE_BARCODES.has(code)) fails.push(`barcode ${code} is on ${names.length} cards: ${names.join(" | ")}`);
}

console.log(`alcohol data gate: ${cards.length} cards checked | ${fails.length} failures | ${warns.length} warnings`);
if (warns.length) {
  console.log("warnings (do not block):");
  for (const w of warns.slice(0, 12)) console.log("  ~ " + w);
  if (warns.length > 12) console.log(`  ... and ${warns.length - 12} more`);
}
if (fails.length) {
  console.error("FAILURES (build blocked):");
  for (const f of fails) console.error("  x " + f);
  process.exit(1);
}
console.log("alcohol data gate: PASS");
