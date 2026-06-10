/**
 * Bulk-import Open Food Facts Canada products into the Gorilla Product Cache.
 *
 * Usage:
 *   npx tsx scripts/import-canada.ts [--pages=N] [--dry-run]
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
import { buildOffRow } from "../app/scan/lib/productClassify";

const OFF_URL =
  "https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=canada&json=1&page_size=1000&page=";

const BATCH_SIZE = 200;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const pagesArg = args.find((a) => a.startsWith("--pages="));
const maxPages = pagesArg ? parseInt(pagesArg.split("=")[1], 10) : 100;

async function fetchPage(page: number): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${OFF_URL}${page}`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) return [];
  const data = await res.json() as { products?: Record<string, unknown>[] };
  return data.products ?? [];
}

async function main() {
  console.log(`\n🦍 Gorilla Fuel — OFF Canada Import`);
  console.log(`   Max pages : ${maxPages}  (up to ${maxPages * 1000} products)`);
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
      const row = buildOffRow(p);
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
