/**
 * Bulk-import Open Food Facts Canada products into the Gorilla Product Cache.
 *
 * Usage:
 *   npx tsx scripts/import-canada.ts [--pages N] [--dry-run]
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (or SUPABASE_SERVICE_ROLE_KEY for higher throughput)
 *
 * The script pages through the OFF Canada search endpoint (1 000 products per page),
 * scores each food product, and upserts the results into gorilla_product_cache in
 * batches of 200. Alcohol and supplement products are flagged but not scored.
 * A summary row is written to gorilla_import_log when finished.
 */

import { config } from "dotenv";
import path from "path";

// Load .env.local from project root
config({ path: path.resolve(process.cwd(), ".env.local") });

import { batchUpsertProductCache, logImportRun } from "../app/scan/lib/productCache";
import type { UpsertPayload } from "../app/scan/lib/productCache";
import { computeScore } from "../app/scan/lib/scoring";

const OFF_URL =
  "https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=canada&json=1&page_size=1000&page=";

const BATCH_SIZE = 200;

const ALCOHOL_KW = ["beer", "wine", "spirit", "cider", "seltzer", "alcoholic", "liqueur", "whisky", "whiskey", "vodka", "rum", "gin", "tequila", "brandy", "mead"];
const SUPPLEMENT_KW = ["supplement", "vitamin", "protein", "creatine", "pre-workout", "amino", "bcaa", "collagen", "probiotic", "omega"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const pagesArg = args.find((a) => a.startsWith("--pages="));
const maxPages = pagesArg ? parseInt(pagesArg.split("=")[1], 10) : 100;

function isAlcohol(cats: string[]) {
  return cats.some((c) => ALCOHOL_KW.some((k) => c.toLowerCase().includes(k)));
}
function isSupplement(cats: string[]) {
  return cats.some((c) => SUPPLEMENT_KW.some((k) => c.toLowerCase().includes(k)));
}

function buildRow(p: Record<string, unknown>): UpsertPayload | null {
  const barcode = (p.code as string) || (p._id as string) || "";
  if (!barcode || barcode.length < 4) return null;

  const cats: string[] = Array.isArray(p.categories_tags) ? (p.categories_tags as string[]) : [];
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

  const alcohol = isAlcohol(cats);
  const supplement = isSupplement(cats);

  let gorilla_score: number | null = null;
  let score_grade: string | null = null;

  if (nutrition_data && !alcohol && !supplement) {
    try {
      const r = computeScore(
        nutrition_data as Parameters<typeof computeScore>[0],
        (p.ingredients_text as string) ?? "",
        {
          servingSize: (p.serving_size as string) ?? "100g",
          novaGroup: (p.nova_group as number) ?? undefined,
          categoriesTags: cats,
        }
      );
      gorilla_score = r.finalScore;
      score_grade = r.grade;
    } catch {
      // non-fatal
    }
  }

  return {
    barcode,
    product_name: (p.product_name as string) || null,
    brand: (p.brands as string) || null,
    categories: cats.length > 0 ? JSON.stringify(cats) : null,
    ingredients_text: (p.ingredients_text as string) || null,
    nutrition_data,
    gorilla_score,
    score_grade,
    nova_group: (p.nova_group as number) || null,
    data_source: "open-food-facts",
    image_url: (p.image_url as string) || null,
    is_alcohol: alcohol,
    is_supplement: supplement,
    is_beauty: false,
  };
}

async function fetchPage(page: number): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${OFF_URL}${page}`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) return [];
  const data = await res.json() as { products?: Record<string, unknown>[] };
  return data.products ?? [];
}

async function main() {
  console.log(`\n🦍 Gorilla Fuel — OFF Canada Import`);
  console.log(`   Max pages : ${maxPages}  (${maxPages * 1000} products)`);
  console.log(`   Dry run   : ${dryRun}`);
  console.log(`   Batch size: ${BATCH_SIZE}\n`);

  const startedAt = Date.now();
  let total = 0, food = 0, alcoholCount = 0, suppl = 0, withNutr = 0, withoutNutr = 0;
  let buffer: UpsertPayload[] = [];

  async function flush() {
    if (buffer.length === 0 || dryRun) {
      buffer = [];
      return;
    }
    await batchUpsertProductCache(buffer);
    buffer = [];
  }

  for (let page = 1; page <= maxPages; page++) {
    process.stdout.write(`  Page ${String(page).padStart(3)} / ${maxPages} … `);
    let products: Record<string, unknown>[];
    try {
      products = await fetchPage(page);
    } catch (e) {
      console.error(`FETCH ERROR: ${e}`);
      break;
    }
    if (products.length === 0) {
      console.log("empty — stopping.");
      break;
    }

    let pageCount = 0;
    for (const p of products) {
      const row = buildRow(p);
      if (!row) continue;
      buffer.push(row);
      total++;
      pageCount++;
      if (row.is_alcohol) alcoholCount++;
      else if (row.is_supplement) suppl++;
      else food++;
      if (row.nutrition_data) withNutr++; else withoutNutr++;
      if (buffer.length >= BATCH_SIZE) await flush();
    }
    console.log(`${pageCount} products`);
  }

  await flush();

  const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
  console.log(`\n✓ Import complete in ${durationSeconds}s`);
  console.log(`  Total    : ${total}`);
  console.log(`  Food     : ${food}`);
  console.log(`  Alcohol  : ${alcoholCount}`);
  console.log(`  Suppl    : ${suppl}`);
  console.log(`  w/ Nutr  : ${withNutr}`);
  console.log(`  w/o Nutr : ${withoutNutr}`);

  if (!dryRun) {
    await logImportRun({
      total_processed: total,
      food_count: food,
      alcohol_count: alcoholCount,
      supplement_count: suppl,
      with_nutrition: withNutr,
      without_nutrition: withoutNutr,
      duration_seconds: durationSeconds,
      notes: `Local script — ${maxPages} pages`,
    });
    console.log("  Import log saved to gorilla_import_log ✓");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
