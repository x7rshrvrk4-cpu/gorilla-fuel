/**
 * Reclassify alcohol→food — cleanup for the isOffAlcohol tag-substring bug
 * (gin→virgin/ginger, cider→cider-vinegar, rum→durum/drumstick/crumbs,
 * alcoholic→non-alcoholic). Finds is_alcohol=true rows that the CURRENT detector
 * (isOffAlcohol + detectAlcoholByName) now classifies as FOOD, flips is_alcohol to
 * false, and computes + persists a food score (these were routed as alcohol at
 * ingest, so they carry a null gorilla_score — this is not just a flag flip).
 *
 *   npx tsx scripts/reclassify-alcohol-to-food.ts           # DRY-RUN (default)
 *   npx tsx scripts/reclassify-alcohol-to-food.ts --write     # persist
 *
 * STRUCTURAL SAFETY:
 *   • Only rows where re-running the live detector returns FOOD are touched — a
 *     genuine-alcohol row (isOffAlcohol OR detectAlcoholByName true) is skipped.
 *   • The PATCH filter re-asserts is_alcohol=eq.true, so it can only flip a row
 *     that is still alcohol (never a food row).
 *   • curated_picks barcodes are excluded (defense-in-depth; dry-run showed 0).
 *   • The 12 benchmarks are excluded (they're not alcohol; belt-and-suspenders).
 *   • Skips any row that can't produce a finite score (none expected).
 *   • Each write logs to gorilla_score_corrections under one batch_id.
 *   • Hardened: retry/backoff + per-row PATCH+log coupling.
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { randomUUID } from "node:crypto";
import { isOffAlcohol, detectAlcoholByName, ALGO_VERSION } from "../app/scan/lib/productClassify";
import { computeScore, type Nutriments } from "../app/scan/lib/scoring";
import { applyScoringGate } from "../app/scan/lib/curatedScores";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
if (!URL || !KEY) { console.error("Missing Supabase env"); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const BATCH_ID = randomUUID();
const REASON = "alcohol→food reclassify: isOffAlcohol tag-substring fix (gin/cider/rum/alcoholic substring false-positives)";
const BENCH = new Set(["0028400090308","0044000030131","0069000019832","0069000008947","0062100012284","0028400590679","0028400090155","0072030007972","0817939020025","0602652179864","0041570050000","0069000019849"]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function retry(fn: () => Promise<Response>, label: string): Promise<Response> {
  for (let a = 0; a < 5; a++) {
    try {
      const r = await fn();
      if (r.ok) return r;
      if (r.status >= 500 || r.status === 429) { await sleep(800 * (a + 1)); continue; }
      throw new Error(`${label} ${r.status} ${await r.text().catch(() => "")}`);
    } catch (e) { if (a === 4) throw e; await sleep(800 * (a + 1)); }
  }
  throw new Error(`${label} exhausted retries`);
}

type Row = any;
function foodScore(row: Row): { score: number; grade: string } | null {
  let cats: string[] = []; try { cats = typeof row.categories === "string" ? JSON.parse(row.categories) : (row.categories ?? []); } catch { /* */ }
  let nd = row.nutrition_data; if (typeof nd === "string") { try { nd = JSON.parse(nd); } catch { nd = null; } }
  let base;
  try {
    base = computeScore(nd ?? {}, row.ingredients_text, {
      servingSize: row.serving_size, novaGroup: row.nova_group ?? undefined, labelsTags: row.labels_tags ?? undefined,
      categoriesTags: cats, productName: row.product_name ?? "", brand: row.brand ?? null,
    } as any);
  } catch { return null; }
  const g = applyScoringGate(base.finalScore, {
    barcode: row.barcode, productName: row.product_name ?? "", brand: row.brand,
    ingredientsText: row.ingredients_text, categoriesTags: cats, novaGroup: row.nova_group ?? base.novaGroup,
    nutriments: nd as Parameters<typeof applyScoringGate>[1]["nutriments"],
  });
  if (typeof g.score !== "number" || !Number.isFinite(g.score)) return null;
  return { score: g.score, grade: g.grade };
}

async function main() {
  console.log(`🔀 Reclassify alcohol→food — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);

  // curated allowlist (exclude)
  const cr = await retry(() => fetch(`${URL}/rest/v1/curated_picks?select=barcode`, { headers: H }), "curated");
  const curated = new Set(((await cr.json()) as any[]).map((c) => c.barcode));

  // fetch all is_alcohol=true
  const rows: Row[] = [];
  for (let off = 0; ; off += 1000) {
    const r = await retry(() => fetch(`${URL}/rest/v1/gorilla_product_cache?select=barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score,is_alcohol&is_alcohol=eq.true&order=barcode.asc`, {
      headers: { ...H, Range: `${off}-${off + 999}` },
    }), "fetch");
    const j = (await r.json()) as Row[];
    if (!j.length) break; rows.push(...j); if (j.length < 1000) break;
  }
  console.log(`PRE-WRITE ASSERTION: is_alcohol=true count = ${rows.length} (dry-run saw 258)`);
  if (rows.length !== 258) { console.error(`ABORT — expected 258 alcohol rows, got ${rows.length}. State changed since dry-run.`); process.exit(1); }

  // classify
  const targets: Array<{ bc: string; name: string; before: number | null; score: number; grade: string }> = [];
  let stillAlc = 0, curatedSkip = 0, benchSkip = 0, unscoreable = 0;
  for (const row of rows) {
    let cats: string[] = []; try { cats = typeof row.categories === "string" ? JSON.parse(row.categories) : (row.categories ?? []); } catch { /* */ }
    const nowAlc = isOffAlcohol(cats) || detectAlcoholByName(row.product_name, row.brand, row.barcode);
    if (nowAlc) { stillAlc++; continue; }
    if (curated.has(row.barcode)) { curatedSkip++; continue; }
    if (BENCH.has(row.barcode)) { benchSkip++; continue; }
    const s = foodScore(row);
    if (!s) { unscoreable++; continue; }
    targets.push({ bc: row.barcode, name: row.product_name ?? "?", before: row.gorilla_score, score: s.score, grade: s.grade });
  }
  console.log(`still-alcohol (skipped): ${stillAlc} | curated-excluded: ${curatedSkip} | benchmark-excluded: ${benchSkip} | unscoreable: ${unscoreable}`);
  console.log(`RECLASSIFY TARGETS: ${targets.length}`);
  console.log(`  needing a score (was null): ${targets.filter((t) => t.before === null).length} | already scored: ${targets.filter((t) => t.before !== null).length}`);

  if (DRY) { console.log(`\nDRY-RUN — nothing written. Re-run with --write.`); return; }

  let wrote = 0, patchFail = 0, logged = 0;
  for (const t of targets) {
    // Guard: re-assert is_alcohol=eq.true — can only flip a still-alcohol row.
    const p = await retry(() => fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(t.bc)}&is_alcohol=eq.true`, {
      method: "PATCH", headers: wH,
      body: JSON.stringify({ is_alcohol: false, gorilla_score: t.score, score_grade: t.grade, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }),
    }), "patch");
    if (!p.ok) { patchFail++; console.error(`  PATCH FAIL ${t.bc}: ${p.status}`); continue; }
    wrote++;
    const lg = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
      method: "POST", headers: wH,
      body: JSON.stringify({ product_name: t.name, barcode: t.bc, old_score: t.before, new_score: t.score, correction_reason: REASON, grade_before: null, grade_after: t.grade, algorithm_version: ALGO_VERSION, batch_id: BATCH_ID }),
    }).catch(() => null);
    if (lg && lg.ok) logged++;
    if (wrote % 30 === 0) console.log(`  ${wrote}/${targets.length}...`);
  }
  console.log(`\nWRITE — reclassified ${wrote}, patchFails ${patchFail}, corrections-logged ${logged}, batch_id ${BATCH_ID}`);
  if (patchFail > 0) process.exit(1);
}
main();
