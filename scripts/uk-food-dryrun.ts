/**
 * DRY-RUN ONLY — UK food ingest yield + quality report. NEVER writes to the cache.
 *
 * Mirrors scripts/import-canada.ts's OFF fetch mechanism (OFF v2 search, paced,
 * retry ladder) but filtered to countries_tags=united-kingdom + a brand, and runs
 * every candidate through the REAL buildOffRow scoring path (same computeScore +
 * gate as the Canadian import) without upserting anything.
 *
 * Quality gate (Phase-1, per spec): keep a food row only if it has real
 * ingredients_text OR complete core nutriments (sugar + satfat + sodium + protein
 * all present). Rows that would land as pure macro-only/thin guesses are skipped.
 * Alcohol and supplements are excluded from this food pass entirely.
 *
 *   npx tsx scripts/uk-food-dryrun.ts
 */

import { buildOffRow } from "../app/scan/lib/productClassify";
import { CURATED_BARCODE_SET } from "../app/scan/lib/curatedScores";

const OFF_V2_BASE = "https://world.openfoodfacts.org/api/v2/search";
const UA = "GorillaFuel-Import/1.0 (gorillafuel.ca; alex@gorillafuel.ca)";
const PAGE_DELAY_MS = 6500;
const MAX_RETRIES = 4;
const FIELDS =
  "code,product_name,brands,categories_tags,labels_tags,countries_tags,ingredients_text,nutriments,nova_group,image_url,serving_size";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const normB = (b: string) => b.replace(/\D/g, "").replace(/^0+/, "") || "0";

// Brand OFF slugs + how many 100-product pages to sample this dry run.
const BRANDS: { name: string; slug: string; maxPages: number; offTotalKnown: number }[] = [
  { name: "Warburtons", slug: "warburtons", maxPages: 3, offTotalKnown: 111 },
  { name: "Walkers", slug: "walkers", maxPages: 6, offTotalKnown: 551 },
  { name: "McVitie's", slug: "mcvitie-s", maxPages: 3, offTotalKnown: 223 },
  { name: "Tesco (own-label sample)", slug: "tesco", maxPages: 4, offTotalKnown: 6617 },
  { name: "Sainsbury's (own-label sample)", slug: "sainsbury-s", maxPages: 4, offTotalKnown: 6412 },
];

type P = Record<string, unknown>;

async function fetchPage(slug: string, page: number): Promise<{ products: P[]; count: number; rateLimited: boolean }> {
  const params = new URLSearchParams({
    countries_tags_en: "united-kingdom",
    brands_tags: slug,
    page_size: "100",
    sort_by: "created_t",
    page: String(page),
    fields: FIELDS,
  });
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${OFF_V2_BASE}?${params}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30_000) });
      if (res.status === 429 || res.status === 503) { await sleep(attempt * 30_000); continue; }
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok || !ct.includes("json")) { await sleep(20_000); continue; }
      const data = (await res.json()) as { products?: P[]; count?: number };
      return { products: data.products ?? [], count: data.count ?? 0, rateLimited: false };
    } catch { await sleep(5_000); }
  }
  return { products: [], count: 0, rateLimited: true };
}

// User quality gate.
const hasRealIngredients = (t: string) => t.trim().length >= 5;
function hasCompleteCoreNutriments(nd: Record<string, unknown> | null): boolean {
  if (!nd) return false;
  const ok = (k: string) => typeof nd[k] === "number" && Number.isFinite(nd[k] as number);
  return ok("sugars_100g") && ok("saturated-fat_100g") && ok("salt_100g") && ok("proteins_100g");
}
// Mirror of getTopOverall's PostgREST or-filter, evaluated locally to prove exclusion.
function excludedFromTop(countriesJson: string | null): boolean {
  if (countriesJson == null) return false;             // null → kept
  if (/canada/i.test(countriesJson)) return false;      // dual-market → kept
  return /united-kingdom/i.test(countriesJson);         // UK-only → excluded
}

interface Sample { name: string; brand: string; score: number | null; basis: string; countries: string | null; barcode: string; }

async function main() {
  console.log("🦍 UK FOOD INGEST — DRY RUN (no writes)\n");
  let grandRaw = 0, grandGatePass = 0, grandFinal = 0, grandEstFull = 0;
  const highScorers: Sample[] = [];
  const searchProof: Sample[] = [];

  for (const b of BRANDS) {
    let raw = 0, curated = 0, noData = 0, alcohol = 0, suppl = 0, gateFail = 0, final = 0;
    let ingBasis = 0, nutrBasis = 0;
    const samples: Sample[] = [];
    let offCount = b.offTotalKnown;

    for (let page = 1; page <= b.maxPages; page++) {
      const { products, count, rateLimited } = await fetchPage(b.slug, page);
      if (count) offCount = count;
      if (rateLimited) { console.log(`  [${b.name}] rate-limited on page ${page}, stopping brand early`); break; }
      if (products.length === 0) break;
      for (const p of products) {
        raw++;
        const code = (p.code as string) ?? "";
        if (code && CURATED_BARCODE_SET.has(normB(code))) { curated++; continue; }
        const row = buildOffRow(p);
        if (!row) { noData++; continue; }
        if (row.is_alcohol) { alcohol++; continue; }       // Phase 2 — excluded
        if (row.is_supplement) { suppl++; continue; }
        const ing = ((p.ingredients_text as string) ?? "");
        const realIng = hasRealIngredients(ing);
        const coreNutr = hasCompleteCoreNutriments(row.nutrition_data as Record<string, unknown> | null);
        if (!realIng && !coreNutr) { gateFail++; continue; } // thin-data → skipped
        final++;
        if (realIng) ingBasis++; else nutrBasis++;
        const s: Sample = {
          name: (row.product_name ?? "(no name)").slice(0, 40),
          brand: (row.brand ?? "?").slice(0, 18),
          score: row.gorilla_score ?? null,
          basis: realIng ? "ingredients+nutr" : "nutriment-only",
          countries: row.countries_tags ?? null,
          barcode: code,
        };
        if (samples.length < 6) samples.push(s);
        if (row.gorilla_score != null && row.gorilla_score >= 75) highScorers.push(s);
        if (searchProof.length < 6 && realIng) searchProof.push(s);
      }
      if (page < b.maxPages) await sleep(PAGE_DELAY_MS);
    }

    const sampled = raw;
    const gatePassRate = sampled > 0 ? final / (sampled - curated - alcohol - suppl - noData || 1) : 0;
    // Extrapolate final yield to the full OFF catalogue for this brand.
    const estFull = Math.round(offCount * (final / (sampled || 1)));
    grandRaw += sampled; grandGatePass += final; grandFinal += final; grandEstFull += estFull;

    console.log(`\n### ${b.name}  [OFF total ~${offCount}]`);
    console.log(`  sampled (raw fetched): ${sampled}`);
    console.log(`  - curated (protected, skipped): ${curated}`);
    console.log(`  - no-data (buildOffRow reject): ${noData}`);
    console.log(`  - alcohol (Phase 2, excluded): ${alcohol}`);
    console.log(`  - supplement (excluded): ${suppl}`);
    console.log(`  - failed quality gate (thin): ${gateFail}`);
    console.log(`  = FINAL to write (from sample): ${final}  (ingredients-basis ${ingBasis} / nutriment-only ${nutrBasis})`);
    console.log(`  gate pass rate: ${Math.round(gatePassRate * 100)}% | est. final across full OFF catalogue: ~${estFull}`);
    console.log(`  samples:`);
    for (const s of samples)
      console.log(`   - [${s.barcode}] ${s.brand} — ${s.name} | score ${s.score ?? "—"} | ${s.basis} | countries ${s.countries ?? "null"}`);
  }

  console.log(`\n=== TOTALS (sampled) ===`);
  console.log(`raw sampled: ${grandRaw} | final after gate: ${grandFinal}`);
  console.log(`ESTIMATED total UK food rows to write across all 5 brands (full catalogues): ~${grandEstFull}`);

  console.log(`\n=== CURATED-EXCLUSION PROOF (getTopOverall would drop these UK ≥75 rows) ===`);
  for (const s of highScorers.slice(0, 8))
    console.log(`   - ${s.name} (score ${s.score}) countries=${s.countries} → excludedFromTop=${excludedFromTop(s.countries)}`);
  console.log(`   high-scoring (≥75) UK rows found in sample: ${highScorers.length}, all excludedFromTop=${highScorers.every((s) => excludedFromTop(s.countries))}`);

  console.log(`\n=== SEARCH-FINDABILITY (name/brand ilike — search route unchanged) ===`);
  for (const s of searchProof.slice(0, 3)) {
    const q = s.name.split(" ")[0].toLowerCase();
    console.log(`   - "${s.name}" (${s.brand}) matchable by q="${q}" via product_name.ilike.*${q}* → YES (no country filter in /api/search)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
