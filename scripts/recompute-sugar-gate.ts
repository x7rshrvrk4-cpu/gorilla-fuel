/**
 * RECOMPUTE — sugar-severity gate (commit 76c9a8c). Re-scores ONLY the cache rows
 * whose FINAL score moved because of the gate (old-final != new-final), attributed
 * by diffing the pre-commit scorer (HEAD~1 snapshot) against the current one — so
 * unrelated pre-existing drift is NOT swept into this batch.
 *
 * Writes ONLY gorilla_score / score_grade / scored_at / algorithm_version, and logs
 * each to gorilla_score_corrections under one batch_id. Never product_name, never
 * is_alcohol, never nutrition source data, never the scanner. Curated (gate-pinned)
 * rows are skipped; alcohol/beauty/supplement excluded.
 *
 *   npx tsx scripts/recompute-sugar-gate.ts            # DRY-RUN
 *   npx tsx scripts/recompute-sugar-gate.ts --write
 */
import { config } from "dotenv"; config({ path: ".env.local", override: true });
import { randomUUID } from "node:crypto";
import { computeScore as computeNew, type Nutriments } from "../app/scan/lib/scoring";
import { computeScore as computeOld } from "../app/scan/lib/_scoring_old";
import { applyScoringGate } from "../app/scan/lib/curatedScores";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const BATCH_ID = randomUUID();
const REASON = "sugar-severity gate (76c9a8c) — withheld ungated fiber/protein offset + sugar-alone <=55 cap for sugar>20g/100g";
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
  const gate = (fin: number, nova: number) => applyScoringGate(fin, { barcode: row.barcode, productName: row.product_name ?? "", brand: row.brand, ingredientsText: row.ingredients_text, categoriesTags: cats, novaGroup: row.nova_group ?? nova, nutriments: row.nutrition_data! });
  const oB = computeOld(row.nutrition_data!, row.ingredients_text, ctx); const oldOut = gate(oB.finalScore, oB.novaGroup);
  const nB = computeNew(row.nutrition_data!, row.ingredients_text, ctx); const newOut = gate(nB.finalScore, nB.novaGroup);
  return { oldOut, newOut };
}

async function main() {
  console.log(`♻️  Recompute sugar-gate — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);
  const changes: any[] = []; let scanned = 0, curated = 0, errors = 0, benchSeen: string[] = [], scopeViol = 0;
  for (let off = 0; ; off += BATCH) {
    const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&${FOOD}&order=barcode.asc&offset=${off}&limit=${BATCH}`, { headers });
    if (!res.ok) { console.error(`Fetch fail ${res.status}`); process.exit(1); }
    const rows: Row[] = await res.json(); if (!rows.length) break;
    for (const row of rows) {
      if (!row.nutrition_data || row.gorilla_score === null) continue; scanned++;
      let out; try { out = scoreBoth(row); } catch { errors++; continue; }
      if (out.newOut.scoreSource === "gorilla-verified") { curated++; continue; } // curated-pinned, skip
      if (out.oldOut.score === out.newOut.score) continue;                          // MY change didn't move final
      const sugar = (row.nutrition_data as any).sugars_100g;
      if (!(typeof sugar === "number" && sugar > 20)) scopeViol++;                   // invariant: only sugar>20 should move
      if (BENCH.has(row.barcode)) benchSeen.push(`${row.barcode} ${out.oldOut.score}->${out.newOut.score}`);
      changes.push({ bc: row.barcode, name: row.product_name ?? "?", stored: row.gorilla_score, oldFinal: out.oldOut.score, after: out.newOut.score, grade: out.newOut.grade, d: out.newOut.score - row.gorilla_score, sugar });
    }
    if (rows.length < BATCH) break;
  }

  const buckets: Record<string, number> = { "1-9": 0, "10-19": 0, "20-29": 0, "30+": 0 };
  for (const c of changes) { const drop = -c.d; buckets[drop < 10 ? "1-9" : drop < 20 ? "10-19" : drop < 30 ? "20-29" : "30+"]++; }
  console.log(`scanned ${scanned} | curated-skipped ${curated} | errors ${errors}`);
  console.log(`FINAL-score changes attributable to the gate: ${changes.length}`);
  console.log(`  scope invariant — changed rows with sugar<=20 (must be 0): ${scopeViol}`);
  console.log(`  benchmark rows in change set (must be 0): ${benchSeen.length} ${benchSeen.join(", ")}`);
  console.log(`  final-Δ drop buckets: ${JSON.stringify(buckets)}`);
  console.log(`  rows currently >=75 (/top-visible) that drop: ${changes.filter(c => c.stored >= 75).length}`);
  console.log(`\n  worst 15 drops:`);
  for (const c of changes.slice().sort((a,b)=>a.d-b.d).slice(0,15))
    console.log(`   ${String(c.stored).padStart(3)} -> ${String(c.after).padStart(3)} (${c.d}) sugar=${c.sugar.toFixed(0).padStart(3)} | ${c.name.slice(0,40)}`);

  if (DRY) { console.log("\nDRY-RUN — nothing written."); return; }
  if (scopeViol > 0 || benchSeen.length > 0) { console.error("\nABORT — scope/benchmark invariant violated."); process.exit(1); }

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
