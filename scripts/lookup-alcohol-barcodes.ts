/**
 * Automatically look up verified barcodes for curated alcohol products that
 * currently have no barcode, using the Open Food Facts API.
 *
 * Usage:
 *   npx tsx scripts/lookup-alcohol-barcodes.ts [--dry-run] [--limit=N]
 *
 * NOTE: This script queries the OFF API. Run only when OFF is accessible and
 * not rate-limiting (avoid during peak hours). A 2s delay between requests
 * is enforced to stay under rate limits.
 *
 * Barcodes are NEVER fabricated. A match is only accepted when:
 *   1. OFF search returns exactly one product for the name+brand query, OR
 *   2. The top result has name similarity ≥ 0.85 AND brand similarity ≥ 0.70.
 *
 * Accepted barcodes are printed to stdout. After reviewing the output,
 * manually add them to the barcodes[] array in app/alcohol/lib/products.ts,
 * then run seed-curated-alcohol.ts to populate the cache.
 *
 * This script NEVER writes to any file or database — it is read-only output only.
 */

import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

import { ALCOHOL_PRODUCTS } from "../app/alcohol/lib/products";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 50;

const OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";
const USER_AGENT = "GorillFuel-BarcodeAudit/1.0 (gorillafuel.ca; alex@gorillafuel.ca)";
const DELAY_MS = 2500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Word-overlap similarity: ratio of shared words to union of both word sets. */
function wordSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

type OffSearchProduct = {
  code: string;
  product_name?: string;
  brands?: string;
};

async function searchOff(name: string, brand: string): Promise<OffSearchProduct[]> {
  const query = `${name} ${brand}`.trim();
  const params = new URLSearchParams({
    action: "process",
    search_terms: query,
    tagtype_0: "countries",
    tag_contains_0: "contains",
    tag_0: "canada",
    json: "1",
    page_size: "5",
    fields: "code,product_name,brands",
  });
  const res = await fetch(`${OFF_SEARCH}?${params}`, {
    signal: AbortSignal.timeout(15_000),
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`OFF HTTP ${res.status}`);
  const data = await res.json() as { products?: OffSearchProduct[] };
  return data.products ?? [];
}

async function main() {
  console.log("\nGorilla Fuel — Alcohol Barcode Lookup");
  console.log(`Dry run: ${dryRun} | Limit: ${limit} products\n`);

  const missing = ALCOHOL_PRODUCTS.filter(
    (p) => !p.barcodes || p.barcodes.length === 0
  ).slice(0, limit);

  console.log(`Products without barcodes: ${ALCOHOL_PRODUCTS.filter((p) => !p.barcodes || p.barcodes.length === 0).length}`);
  console.log(`Querying first ${missing.length} in this run…\n`);

  const accepted: { id: string; name: string; brand: string; barcode: string; offName: string; nameSim: number }[] = [];
  const rejected: { id: string; name: string; reason: string }[] = [];

  for (const product of missing) {
    process.stdout.write(`  ${product.name} (${product.brand})… `);

    let results: OffSearchProduct[];
    try {
      results = await searchOff(product.name, product.brand);
    } catch (e) {
      console.log(`ERROR: ${e}`);
      rejected.push({ id: product.id, name: product.name, reason: `fetch error: ${e}` });
      await sleep(DELAY_MS);
      continue;
    }

    if (results.length === 0) {
      console.log("no results");
      rejected.push({ id: product.id, name: product.name, reason: "no OFF results" });
      await sleep(DELAY_MS);
      continue;
    }

    const top = results[0];
    const offName = top.product_name ?? "";
    const offBrand = top.brands ?? "";
    const barcode = top.code ?? "";

    if (!barcode || !/^\d{8,14}$/.test(barcode)) {
      console.log("no valid barcode in top result");
      rejected.push({ id: product.id, name: product.name, reason: "no valid barcode" });
      await sleep(DELAY_MS);
      continue;
    }

    const nameSim = wordSimilarity(product.name, offName);
    const brandSim = wordSimilarity(product.brand, offBrand);

    if (nameSim >= 0.85 && brandSim >= 0.70) {
      console.log(`MATCH → ${barcode} "${offName}" (nameSim=${nameSim.toFixed(2)}, brandSim=${brandSim.toFixed(2)})`);
      accepted.push({ id: product.id, name: product.name, brand: product.brand, barcode, offName, nameSim });
    } else {
      console.log(`LOW CONFIDENCE — nameSim=${nameSim.toFixed(2)}, brandSim=${brandSim.toFixed(2)} → "${offName}"`);
      rejected.push({ id: product.id, name: product.name, reason: `low confidence: nameSim=${nameSim.toFixed(2)}` });
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Accepted: ${accepted.length} | Rejected/No-match: ${rejected.length}`);

  if (accepted.length > 0) {
    console.log("\n── COPY THESE INTO app/alcohol/lib/products.ts ──\n");
    for (const hit of accepted) {
      console.log(`  // ${hit.name} (${hit.brand}) — OFF: "${hit.offName}" sim=${hit.nameSim.toFixed(2)}`);
      console.log(`  // id: "${hit.id}"`);
      console.log(`  barcodes: ["${hit.barcode}"],\n`);
    }
    console.log("── After updating products.ts, run: ──");
    console.log("  npx tsx scripts/seed-curated-alcohol.ts\n");
  }

  if (dryRun) {
    console.log("[dry-run] No changes made.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
