/**
 * Targeted recompute — monocalcium phosphate name-form matcher (a0d6a05). Adding
 * name("Monocalcium phosphate") to the E341 phosphate entry made rows that spell
 * the additive out (without the E341 code) newly register the phosphate penalty.
 * This persists the small (~-2/-3) additive-side correction for those rows.
 *
 *   npx tsx scripts/recompute-monocalcium-phosphate.ts           # DRY-RUN (default)
 *   npx tsx scripts/recompute-monocalcium-phosphate.ts --write     # persist
 *
 * SAFETY:
 *   • Scope: ingredients_text ILIKE '%monocalcium phosphate%', food only, where the
 *     live recompute differs from the cached score. Only those are written.
 *   • Skips curated_picks (defense-in-depth) and the 12 benchmarks.
 *   • Skips curated score-pins (applyScoringGate → gorilla-verified).
 *   • PATCH re-asserts the barcode; writes only score fields.
 *   • Pre-write assertion aborts if the change-count drifted from the dry-run (27).
 *   • Logs each write to gorilla_score_corrections under one batch_id.
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { randomUUID } from "node:crypto";
import { computeScore, type Nutriments } from "../app/scan/lib/scoring";
import { applyScoringGate } from "../app/scan/lib/curatedScores";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
if (!URL || !KEY) { console.error("Missing Supabase env"); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const BATCH_ID = randomUUID();
const REASON = "monocalcium phosphate name-form matcher added (a0d6a05) — persisting newly-caught additive penalty for rows spelling it out without the E341 code.";
const BENCH = new Set(["0028400090308","0044000030131","0069000019832","0069000008947","0062100012284","0028400590679","0028400090155","0072030007972","0817939020025","0602652179864","0041570050000","0069000019849"]);
const EXPECTED_CHANGES = 27;
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
function rc(row: Row) {
  let cats: string[] = []; try { cats = typeof row.categories === "string" ? JSON.parse(row.categories) : (row.categories ?? []); } catch { /* */ }
  let nd = row.nutrition_data; if (typeof nd === "string") { try { nd = JSON.parse(nd); } catch { nd = null; } }
  const ctx: any = { barcode: row.barcode, productName: row.product_name ?? "", brand: row.brand ?? null, ingredientsText: row.ingredients_text ?? null, categoriesTags: cats, novaGroup: row.nova_group ?? null, servingSize: row.serving_size ?? null, labelsTags: row.labels_tags ?? null };
  const res = computeScore(nd ?? {}, row.ingredients_text ?? null, ctx);
  const g = applyScoringGate(res.finalScore, { ...ctx, nutriments: nd });
  return { score: g.score, grade: g.grade, src: g.scoreSource };
}

async function main() {
  console.log(`🧪 Recompute monocalcium-phosphate rows — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);

  const cr = await retry(() => fetch(`${URL}/rest/v1/curated_picks?select=barcode`, { headers: H }), "curated");
  const curated = new Set(((await cr.json()) as any[]).map((c) => c.barcode));

  const sel = "barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score,is_alcohol,is_supplement,is_beauty";
  const cr2 = await retry(() => fetch(`${URL}/rest/v1/gorilla_product_cache?ingredients_text=ilike.*monocalcium%20phosphate*&select=${sel}&limit=500`, { headers: H }), "fetch");
  const rows = (await cr2.json()) as Row[];
  console.log(`monocalcium-phosphate rows: ${rows.length}`);

  const targets: Array<{ bc: string; name: string; before: number | null; score: number; grade: string }> = [];
  let unchanged = 0, curatedSkip = 0, benchSkip = 0, pinSkip = 0, nonFood = 0;
  for (const row of rows) {
    if (row.is_alcohol || row.is_supplement || row.is_beauty) { nonFood++; continue; }
    if (curated.has(row.barcode)) { curatedSkip++; continue; }
    if (BENCH.has(row.barcode)) { benchSkip++; continue; }
    const o = rc(row);
    if (o.src === "gorilla-verified") { pinSkip++; continue; }
    if (row.gorilla_score === o.score) { unchanged++; continue; }
    targets.push({ bc: row.barcode, name: row.product_name ?? "?", before: row.gorilla_score, score: o.score, grade: o.grade });
  }
  console.log(`unchanged: ${unchanged} | curated-skip: ${curatedSkip} | benchmark-skip: ${benchSkip} | pin-skip: ${pinSkip} | non-food: ${nonFood}`);
  console.log(`CHANGES TO WRITE: ${targets.length}`);

  console.log(`\nPRE-WRITE ASSERTION: ${targets.length} == expected ${EXPECTED_CHANGES}?`);
  if (targets.length !== EXPECTED_CHANGES) { console.error(`ABORT — expected ${EXPECTED_CHANGES} changes, got ${targets.length}. State drifted since dry-run.`); process.exit(1); }

  targets.sort((a, b) => (a.score - (a.before ?? 0)) - (b.score - (b.before ?? 0)));
  for (const t of targets) console.log(`  ${String(t.before).padStart(3)} -> ${String(t.score).padStart(3)} [${t.grade}]  ${t.bc}  ${(t.name).slice(0, 34)}`);

  if (DRY) { console.log(`\nDRY-RUN — nothing written. Re-run with --write.`); return; }

  let wrote = 0, patchFail = 0, logged = 0;
  for (const t of targets) {
    const p = await retry(() => fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(t.bc)}`, {
      method: "PATCH", headers: wH,
      body: JSON.stringify({ gorilla_score: t.score, score_grade: t.grade, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }),
    }), "patch");
    if (!p.ok) { patchFail++; console.error(`  PATCH FAIL ${t.bc}: ${p.status}`); continue; }
    wrote++;
    const lg = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
      method: "POST", headers: wH,
      body: JSON.stringify({ product_name: t.name, barcode: t.bc, old_score: t.before, new_score: t.score, correction_reason: REASON, grade_after: t.grade, algorithm_version: ALGO_VERSION, batch_id: BATCH_ID }),
    }).catch(() => null);
    if (lg && lg.ok) logged++;
  }
  console.log(`\nWRITE — wrote ${wrote}, patchFails ${patchFail}, corrections-logged ${logged}, batch_id ${BATCH_ID}`);
  if (patchFail > 0) process.exit(1);
}
main();
