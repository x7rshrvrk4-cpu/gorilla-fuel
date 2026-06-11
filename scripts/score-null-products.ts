/**
 * Re-score all gorilla_product_cache rows that have gorilla_score IS NULL.
 *
 * Usage:
 *   npx tsx scripts/score-null-products.ts [--dry-run] [--limit=N]
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (or SUPABASE_SERVICE_ROLE_KEY)
 */

import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

import { computeScore } from "../app/scan/lib/scoring";
import type { Nutriments, ScoringContext } from "../app/scan/lib/scoring";
import { tryParseCategories } from "../app/scan/lib/productCache";
import type { CachedProduct } from "../app/scan/lib/productCache";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";
const TABLE = "gorilla_product_cache";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const batchLimit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 1000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function baseHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function fetchNullScoreRows(offset: number, limit: number): Promise<CachedProduct[]> {
  const endpoint = new URL(`${SUPABASE_URL}/rest/v1/${TABLE}`);
  endpoint.searchParams.set("gorilla_score", "is.null");
  endpoint.searchParams.set("is_alcohol", "eq.false");
  endpoint.searchParams.set("is_beauty", "eq.false");
  endpoint.searchParams.set("select", "barcode,product_name,categories,ingredients_text,nutrition_data,nova_group,is_alcohol,is_supplement,is_beauty");
  endpoint.searchParams.set("order", "scan_count.desc");
  endpoint.searchParams.set("limit", String(limit));
  endpoint.searchParams.set("offset", String(offset));

  const res = await fetch(endpoint.toString(), {
    headers: baseHeaders(),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    console.error("  fetch error:", res.status, await res.text());
    return [];
  }
  return res.json();
}

async function patchScore(barcode: string, score: number, grade: string): Promise<boolean> {
  if (dryRun) return true;
  const endpoint = new URL(`${SUPABASE_URL}/rest/v1/${TABLE}`);
  endpoint.searchParams.set("barcode", `eq.${barcode}`);
  const res = await fetch(endpoint.toString(), {
    method: "PATCH",
    headers: { ...baseHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({ gorilla_score: score, score_grade: grade }),
    signal: AbortSignal.timeout(5_000),
  });
  return res.ok || res.status === 204;
}

async function main() {
  console.log(`\n=== Score Null Products ${dryRun ? "(DRY RUN)" : ""} ===`);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE env vars. Check .env.local");
    process.exit(1);
  }

  let offset = 0;
  let totalScored = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  while (true) {
    const rows = await fetchNullScoreRows(offset, 200);
    if (rows.length === 0) break;
    if (offset + rows.length > batchLimit) break;

    console.log(`  Batch offset=${offset}: ${rows.length} rows`);

    for (const row of rows) {
      if (!row.nutrition_data || Object.keys(row.nutrition_data).length === 0) {
        totalSkipped++;
        continue;
      }

      const nutriments = row.nutrition_data as Nutriments;
      const categories = tryParseCategories(row.categories);
      const context: ScoringContext = {
        categoriesTags: categories,
        novaGroup: row.nova_group ?? undefined,
      };

      try {
        const { finalScore, grade } = computeScore(nutriments, row.ingredients_text ?? undefined, context);
        const ok = await patchScore(row.barcode, finalScore, grade);
        if (ok) {
          totalScored++;
          if (dryRun) {
            console.log(`    [DRY RUN] ${row.product_name} → ${finalScore} ${grade}`);
          }
        } else {
          totalFailed++;
        }
      } catch {
        totalFailed++;
      }

      await sleep(20);
    }

    offset += rows.length;
    if (rows.length < 200) break;
    await sleep(500);
  }

  console.log(`\n✓ Done`);
  console.log(`  Scored  : ${totalScored}`);
  console.log(`  Skipped : ${totalSkipped} (no nutrition data)`);
  console.log(`  Failed  : ${totalFailed}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
