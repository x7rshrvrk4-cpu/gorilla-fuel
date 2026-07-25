/**
 * RECOMPUTE — sodium levers (disclosed-zero skepticism ae49b0c + empty-ingredient-gated
 * salt concentration bands bbc2e69). Re-scores ONLY the cache rows whose FINAL score
 * moved, attributed by diffing the PRE-SODIUM scorer (a snapshot of scoring.ts at
 * ae49b0c~1 = 147d46f) against the current one — so unrelated drift isn't swept in.
 * Both levers are diffed together because Lever 1 shipped without its own recompute,
 * so the cache is behind by both.
 *
 * Writes ONLY gorilla_score / score_grade / scored_at / algorithm_version, and logs
 * each to gorilla_score_corrections under one batch_id. Never product_name, never
 * is_alcohol, never nutrition source data, never the scanner. Curated (gate-pinned)
 * rows skipped; alcohol/beauty/supplement excluded.
 *
 * The pre-sodium scorer is a THROWAWAY snapshot, regenerated before each run and NOT
 * committed. Loaded dynamically via a computed path so a normal build type-checks
 * cleanly when it is absent:
 *   git show ae49b0c~1:app/scan/lib/scoring.ts > app/scan/lib/_scoring_presodium.ts
 *
 *   npx tsx scripts/recompute-sodium-gate.ts            # DRY-RUN
 *   npx tsx scripts/recompute-sodium-gate.ts --write
 */
import { config } from "dotenv"; config({ path: ".env.local", override: true });
import { randomUUID } from "node:crypto";
import { computeScore as computeNew, type Nutriments } from "../app/scan/lib/scoring";
let computeOld: typeof computeNew;
import { applyScoringGate } from "../app/scan/lib/curatedScores";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const BATCH_ID = randomUUID();
const REASON = "sodium levers — disclosed-zero skepticism (ae49b0c) + empty-ingredient-gated salt concentration bands (bbc2e69)";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
if (!URL || !KEY) { console.error("Missing Supabase env"); process.exit(1); }
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false&gorilla_score=not.is.null";
const SELECT = "barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score,score_grade";
const BATCH = 1000;
const BENCH = new Set(["0028400090308","0044000030131","0069000019832","0069000008947","0062100012284","0028400590679","0028400090155","0072030007972","0817939020025","0602652179864","0041570050000","0069000019849"]);

type Row = { barcode: string; product_name: string|null; brand: string|null; categories: string|null; labels_tags: string[]|null; ingredients_text: string|null; nutrition_data: Nutriments|null; nova_group: number|null; serving_size: string|null; gorilla_score: number|null; score_grade: string|null };

function scoreBoth(row: Row) {
  let cats: string[] = []; try { cats = JSON.parse(row.categories ?? "[]"); } catch {}
  const ctx = { servingSize: row.serving_size, novaGroup: row.nova_group, labelsTags: row.labels_tags, categoriesTags: cats, productName: row.product_name ?? "", additivesTags: null };
  const gate = (fin: number, nova: number | null) => applyScoringGate(fin, { barcode: row.barcode, productName: row.product_name ?? "", brand: row.brand, ingredientsText: row.ingredients_text, categoriesTags: cats, novaGroup: row.nova_group ?? nova ?? undefined, nutriments: row.nutrition_data! });
  const oB = computeOld(row.nutrition_data!, row.ingredients_text, ctx); const oldOut = gate(oB.finalScore, oB.novaGroup);
  const nB = computeNew(row.nutrition_data!, row.ingredients_text, ctx); const newOut = gate(nB.finalScore, nB.novaGroup);
  return { oldOut, newOut };
}

async function main() {
  try { ({ computeScore: computeOld } = await import("../app/scan/lib/" + "_scoring_presodium")); }
  catch { console.error("Missing app/scan/lib/_scoring_presodium.ts snapshot — regenerate:\n  git show ae49b0c~1:app/scan/lib/scoring.ts > app/scan/lib/_scoring_presodium.ts"); process.exit(1); }
  console.log(`♻️  Recompute sodium-gate — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);

  const changes: any[] = []; let scanned = 0, curated = 0, errors = 0, benchSeen: string[] = [];
  let docInSet = 0, lever1 = 0, lever2 = 0;
  for (let off = 0; ; off += BATCH) {
    const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&${FOOD}&order=barcode.asc&offset=${off}&limit=${BATCH}`, { headers });
    if (!res.ok) { console.error(`Fetch fail ${res.status}`); process.exit(1); }
    const rows: Row[] = await res.json(); if (!rows.length) break;
    for (const row of rows) {
      if (!row.nutrition_data || row.gorilla_score === null) continue; scanned++;
      let out; try { out = scoreBoth(row); } catch { errors++; continue; }
      if (out.newOut.scoreSource === "gorilla-verified") { curated++; continue; }
      if (out.oldOut.score === out.newOut.score) continue;
      const nd = row.nutrition_data as any; const salt = nd["salt_100g"];
      const hasIng = !!(row.ingredients_text && row.ingredients_text.trim().length > 0);
      if (hasIng) docInSet++;
      if (salt === 0) lever1++; else if (typeof salt === "number" && salt > 2 && !hasIng) lever2++;
      if (BENCH.has(row.barcode)) benchSeen.push(`${row.barcode} ${out.oldOut.score}->${out.newOut.score}`);
      changes.push({ bc: row.barcode, name: row.product_name ?? "?", stored: row.gorilla_score, oldFinal: out.oldOut.score, after: out.newOut.score, grade: out.newOut.grade, d: out.newOut.score - row.gorilla_score, salt, hasIng });
    }
    if (rows.length < BATCH) break;
  }

  const buckets: Record<string, number> = { "1-9": 0, "10-19": 0, "20+": 0 };
  for (const c of changes) { const drop = -c.d; buckets[drop < 10 ? "1-9" : drop < 20 ? "10-19" : "20+"]++; }
  console.log(`scanned ${scanned} | curated-skipped ${curated} | errors ${errors}`);
  console.log(`FINAL-score changes attributable to the sodium levers: ${changes.length}`);
  console.log(`  cause split: Lever 1 (disclosed-zero salt) ${lever1} | Lever 2 (thin-data salt>2) ${lever2} | (other/interaction ${changes.length - lever1 - lever2})`);
  console.log(`  documented-food rows (real ingredient list) in write set: ${docInSet}  [expected: only Lever-1 disclosed-zero meats; Lever 2 cannot touch documented]`);
  console.log(`  benchmark rows in change set (must be 0): ${benchSeen.length} ${benchSeen.join(", ")}`);
  console.log(`  final-Δ drop buckets: ${JSON.stringify(buckets)} | rows >=75 that drop: ${changes.filter(c=>c.stored>=75).length}`);
  console.log(`  stored≠old-fresh (cache-drift sanity): ${changes.filter(c=>c.stored!==c.oldFinal).length}`);

  if (DRY) { console.log("\nDRY-RUN — nothing written."); return; }
  if (benchSeen.length > 0) { console.error("ABORT — benchmark in change set."); process.exit(1); }

  console.log(`\n──── WRITING ${changes.length} rows ────`);
  let ok = 0, fail = 0, logok = 0;
  for (const r of changes) {
    const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(r.bc)}`, { method: "PATCH", headers, body: JSON.stringify({ gorilla_score: r.after, score_grade: r.grade, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }) });
    if (res.ok) ok++; else { fail++; console.error(`  PATCH FAIL ${r.bc}: ${res.status} ${await res.text().catch(()=> "")}`); continue; }
    const lg = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, { method: "POST", headers, body: JSON.stringify({ product_name: r.name, barcode: r.bc, old_score: r.stored, new_score: r.after, correction_reason: REASON, grade_after: r.grade, algorithm_version: ALGO_VERSION, batch_id: BATCH_ID }) }).catch(()=>null);
    if (lg && lg.ok) logok++;
  }
  console.log(`\nWRITE — rows updated ${ok}, patchFails ${fail}, corrections-logged ${logok}, batch_id ${BATCH_ID}`);
  if (fail > 0) process.exit(1);
}
main();
