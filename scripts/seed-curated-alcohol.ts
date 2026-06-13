/**
 * Seed all curated alcohol products that have verified barcodes into gorilla_product_cache.
 *
 * Usage:
 *   npx tsx scripts/seed-curated-alcohol.ts [--dry-run]
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (or SUPABASE_SERVICE_ROLE_KEY)
 *
 * Each barcode gets its own cache row with:
 *   is_curated  = true
 *   is_alcohol  = true
 *   gorilla_score = derived from gorillaPour (so STEP 0 returns the exact page rating)
 *   ingredients_text = joined knownAdditives (so additive detection works in STEP 0)
 *
 * Run after adding new barcodes to ALCOHOL_PRODUCTS.
 * Safe to re-run — upserts merge on barcode.
 */

import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

import { ALCOHOL_PRODUCTS, type AlcoholCategory } from "../app/alcohol/lib/products";
import { batchUpsertProductCache } from "../app/scan/lib/productCache";
import type { UpsertPayload } from "../app/scan/lib/productCache";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

/** Maps gorillaPour (1–5) to a numeric score consistent with alcoholGradeFromScore thresholds. */
function gorillaPourToScore(pour: number): number {
  if (pour >= 5) return 87;
  if (pour >= 4) return 77;
  if (pour >= 3) return 60;
  if (pour >= 2) return 39;
  return 20;
}

function gorillaPourToGrade(pour: number): string {
  if (pour >= 4) return "Clean Pour";
  if (pour >= 3) return "Moderate";
  if (pour >= 2) return "Heavy";
  return "Avoid";
}

function categoryToTags(category: AlcoholCategory): string[] {
  switch (category) {
    case "Light Beer":     return ["en:alcoholic-beverages", "en:beers", "en:light-beers"];
    case "IPA & Craft Ale": return ["en:alcoholic-beverages", "en:beers", "en:ales"];
    case "Lager":          return ["en:alcoholic-beverages", "en:beers", "en:lagers"];
    case "Hard Seltzer":   return ["en:alcoholic-beverages", "en:hard-seltzers"];
    case "Cider":          return ["en:alcoholic-beverages", "en:ciders"];
    case "Wines":          return ["en:alcoholic-beverages", "en:wines"];
    case "Non-Alcoholic":  return ["en:non-alcoholic-beverages", "en:beers"];
    default:               return ["en:alcoholic-beverages"];
  }
}

async function main() {
  console.log("\nGorilla Fuel — Seed Curated Alcohol Cache");
  console.log(`Dry run: ${dryRun}\n`);

  const rows: UpsertPayload[] = [];
  const seen = new Map<string, string>(); // barcode → product name (for duplicate detection)

  for (const product of ALCOHOL_PRODUCTS) {
    if (!product.barcodes || product.barcodes.length === 0) continue;

    const servingMl = product.servingMl ?? 355;
    const kcalPer100ml = (product.caloriesPerCan / servingMl) * 100;
    const carbsPer100ml = (product.carbsPerCan / servingMl) * 100;
    const sugarPer100ml = (product.sugarPerCan / servingMl) * 100;

    const nutrition_data = {
      "energy-kcal_100g": kcalPer100ml,
      carbohydrates_100g: carbsPer100ml,
      sugars_100g: sugarPer100ml,
      alcohol_100g: product.abv,
    };

    const categoryTags = categoryToTags(product.category);
    const gorilla_score = gorillaPourToScore(product.gorillaPour);
    const score_grade = gorillaPourToGrade(product.gorillaPour);

    const ingredients_text = product.knownAdditives.length > 0
      ? product.knownAdditives.join(", ")
      : null;

    for (const barcode of product.barcodes) {
      if (seen.has(barcode)) {
        console.warn(`  ⚠ Duplicate barcode ${barcode}: already assigned to "${seen.get(barcode)}", skipping "${product.name}"`);
        continue;
      }
      seen.set(barcode, product.name);

      rows.push({
        barcode,
        product_name: product.name,
        brand: product.brand,
        categories: JSON.stringify(categoryTags),
        ingredients_text,
        nutrition_data,
        gorilla_score,
        score_grade,
        nova_group: null,
        data_source: "gorilla-curated",
        image_url: null,
        is_alcohol: true,
        is_supplement: false,
        is_beauty: false,
        is_curated: true,
        scored_at: new Date().toISOString(),
        algorithm_version: "curated",
      });
    }
  }

  console.log(`Products with barcodes : ${[...seen.values()].length > 0 ? new Set([...seen.values()]).size : 0}`);
  console.log(`Total barcode entries  : ${rows.length}`);

  if (rows.length === 0) {
    console.log("Nothing to seed.");
    return;
  }

  console.log("\nSampling rows to seed:");
  for (const row of rows.slice(0, 5)) {
    console.log(`  ${row.barcode.padEnd(15)} ${String(row.product_name).padEnd(30)} score=${row.gorilla_score} grade="${row.score_grade}"`);
  }
  if (rows.length > 5) console.log(`  … and ${rows.length - 5} more`);

  if (dryRun) {
    console.log("\n[dry-run] No writes performed.");
    return;
  }

  const BATCH = 50;
  let written = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const n = await batchUpsertProductCache(batch);
    written += n;
    console.log(`  Upserted batch ${Math.floor(i / BATCH) + 1}: ${n}/${batch.length} rows`);
  }

  console.log(`\n✓ Done — ${written}/${rows.length} rows upserted into gorilla_product_cache`);
}

main().catch((e) => { console.error(e); process.exit(1); });
