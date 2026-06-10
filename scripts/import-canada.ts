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
 * The script pages through the OFF Canada search endpoint, scores each food product,
 * and upserts into gorilla_product_cache in batches of 200.
 * A summary row is written to gorilla_import_log when finished.
 */

import { config } from "dotenv";
import path from "path";

// Load .env.local from project root
config({ path: path.resolve(process.cwd(), ".env.local") });

import { batchUpsertProductCache, logImportRun } from "../app/scan/lib/productCache";
import type { UpsertPayload } from "../app/scan/lib/productCache";
import { buildOffRow } from "../app/scan/lib/productClassify";

const OFF_V2_BASE = "https://world.openfoodfacts.org/api/v2/search";
const OFF_USER_AGENT = "GorillFuel-Import/1.0 (gorillafuel.ca; alex@gorillafuel.ca)";
const PAGE_DELAY_MS = 2000;  // 2s between pages to stay under rate limit
const BATCH_SIZE = 200;
const MAX_RETRIES = 3;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const pagesArg = args.find((a) => a.startsWith("--pages="));
const maxPages = pagesArg ? parseInt(pagesArg.split("=")[1], 10) : 100;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns { products, isRateLimit, isEmpty } */
async function fetchPage(page: number): Promise<{ products: Record<string, unknown>[]; isRateLimit: boolean; isEmpty: boolean }> {
  const params = new URLSearchParams({
    countries_tags_en: "canada",
    page_size: "1000",
    page: String(page),
    fields: "code,product_name,brands,categories_tags,ingredients_text,nutriments,nova_group,image_url,serving_size",
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${OFF_V2_BASE}?${params}`, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": OFF_USER_AGENT },
      });

      if (res.status === 429 || res.status === 503) {
        const wait = attempt * 10_000; // 10s, 20s, 30s
        console.log(`  [rate-limit ${res.status}] waiting ${wait / 1000}s before retry ${attempt}/${MAX_RETRIES}…`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        console.log(`  [HTTP ${res.status}] skipping page ${page}`);
        return { products: [], isRateLimit: false, isEmpty: false };
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        // HTML error page returned
        console.log(`  [HTML response] rate-limited — waiting 15s before retry ${attempt}/${MAX_RETRIES}…`);
        await sleep(15_000);
        continue;
      }

      const data = await res.json() as { products?: Record<string, unknown>[]; count?: number };
      const products = data.products ?? [];
      return { products, isRateLimit: false, isEmpty: products.length === 0 };

    } catch (e) {
      if (attempt < MAX_RETRIES) {
        console.log(`  [error] ${e} — retry ${attempt}/${MAX_RETRIES}…`);
        await sleep(5_000);
      } else {
        console.log(`  [error] ${e} — giving up on page ${page}`);
        return { products: [], isRateLimit: false, isEmpty: false };
      }
    }
  }

  return { products: [], isRateLimit: true, isEmpty: false };
}

async function main() {
  console.log(`\n🦍 Gorilla Fuel — OFF Canada Import`);
  console.log(`   Max pages : ${maxPages}  (up to ${maxPages * 1000} products)`);
  console.log(`   Dry run   : ${dryRun}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Page delay: ${PAGE_DELAY_MS}ms\n`);

  const startedAt = Date.now();
  let total = 0, food = 0, alcoholCount = 0, suppl = 0, withNutr = 0, withoutNutr = 0;
  let consecutiveEmpty = 0;
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

    const { products, isRateLimit, isEmpty } = await fetchPage(page);

    if (isRateLimit) {
      console.log("rate-limit exhaused — stopping.");
      break;
    }
    if (isEmpty) {
      consecutiveEmpty++;
      console.log("empty");
      if (consecutiveEmpty >= 3) {
        console.log("  3 consecutive empty pages — end of dataset.");
        break;
      }
    } else {
      consecutiveEmpty = 0;
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

    if (products.length > 0) {
      console.log(`${pageCount} products`);
      if (total % 1000 < pageCount) {
        console.log(`  ── ${total.toLocaleString()} total so far (${food} food / ${alcoholCount} alcohol / ${suppl} suppl) ──`);
      }
    }

    // Polite delay between pages
    if (page < maxPages) await sleep(PAGE_DELAY_MS);
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
