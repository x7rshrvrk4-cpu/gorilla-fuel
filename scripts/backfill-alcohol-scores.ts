/**
 * Alcohol score backfill — wire computeAlcoholScore into null alcohol rows post
 * tag-fix. The bulk OFF import never ran the alcohol engine (buildOffRow only did
 * food scoring), so imported is_alcohol=true rows carry a null gorilla_score. This
 * scores them with the dedicated alcohol engine (detectAlcoholKind +
 * computeAlcoholScore) and persists the score + alcohol grade.
 *
 *   npx tsx scripts/backfill-alcohol-scores.ts           # DRY-RUN (default)
 *   npx tsx scripts/backfill-alcohol-scores.ts --write     # persist
 *
 * DATA CAVEAT: scores use the STORED nutrition_data, which persists only the food
 * subset — carbohydrates_100g and alcohol_100g (ABV) are NOT stored, and ~half the
 * rows also lack kcal/ingredients. Where inputs are missing the engine returns
 * neutral defaults, so many rows land at a flat ~70/Moderate. The score reflects
 * available data, not fabricated numbers; richer scores await ABV/carb data.
 *
 * SAFETY:
 *   • Filters gorilla_score=is.null & is_alcohol=eq.true — only touches unscored
 *     alcohol rows; the PATCH re-asserts both, so it can't overwrite a score or a
 *     non-alcohol row.
 *   • Excludes the Part-1 food-misclassified candidates (candy flavored with
 *     alcohol words — Rum & Butter, liqueur chocolates) — those await a separate
 *     reclassify-to-food decision, NOT an alcohol score.
 *   • Excludes curated_picks (0 expected) and the 12 benchmarks (not alcohol).
 *   • Pre-write assertion aborts if the null-alcohol count drifted.
 *   • Logs each write to gorilla_score_corrections under one batch_id.
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { randomUUID } from "node:crypto";
import { computeAlcoholScore, detectAlcoholKind } from "../app/scan/lib/alcoholScoring";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
if (!URL || !KEY) { console.error("Missing Supabase env"); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const BATCH_ID = randomUUID();
const REASON = "alcohol backfill — wire computeAlcoholScore into null alcohol rows post tag-fix";
// Part-1 food-misclassified candidates (candy flavored with alcohol words) — NOT alcohol; excluded pending reclassify.
const FOOD_MISCLASS = new Set(["0627987433173", "3120470128701"]);
const BENCH = new Set(["0028400090308","0044000030131","0069000019832","0069000008947","0062100012284","0028400590679","0028400090155","0072030007972","0817939020025","0602652179864","0041570050000","0069000019849"]);
const EXPECTED_NULL_ALCOHOL = 140;
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

async function main() {
  console.log(`🍺 Alcohol score backfill — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);

  const cr = await retry(() => fetch(`${URL}/rest/v1/curated_picks?select=barcode`, { headers: H }), "curated");
  const curated = new Set(((await cr.json()) as any[]).map((c) => c.barcode));

  const rows: Row[] = [];
  for (let off = 0; ; off += 1000) {
    const r = await retry(() => fetch(`${URL}/rest/v1/gorilla_product_cache?select=barcode,product_name,brand,categories,ingredients_text,nutrition_data&is_alcohol=eq.true&gorilla_score=is.null&order=barcode.asc`, {
      headers: { ...H, Range: `${off}-${off + 999}` },
    }), "fetch");
    const j = (await r.json()) as Row[];
    if (!j.length) break; rows.push(...j); if (j.length < 1000) break;
  }
  console.log(`PRE-WRITE ASSERTION: null-alcohol count = ${rows.length} (expected ${EXPECTED_NULL_ALCOHOL})`);
  if (rows.length !== EXPECTED_NULL_ALCOHOL) { console.error(`ABORT — expected ${EXPECTED_NULL_ALCOHOL}, got ${rows.length}. State drifted since diagnosis.`); process.exit(1); }

  const plan: Array<{ bc: string; name: string; kind: string; score: number; grade: string; hadKcal: boolean; hadIng: boolean }> = [];
  let foodSkip = 0, curatedSkip = 0, benchSkip = 0, failed = 0;
  for (const row of rows) {
    if (FOOD_MISCLASS.has(row.barcode)) { foodSkip++; continue; }
    if (curated.has(row.barcode)) { curatedSkip++; continue; }
    if (BENCH.has(row.barcode)) { benchSkip++; continue; }
    let cats: string[] = []; try { cats = typeof row.categories === "string" ? JSON.parse(row.categories) : (row.categories ?? []); } catch { /* */ }
    let nd = row.nutrition_data; if (typeof nd === "string") { try { nd = JSON.parse(nd); } catch { nd = {}; } }
    try {
      const kind = detectAlcoholKind(cats);
      const res = computeAlcoholScore(nd ?? {}, row.ingredients_text ?? undefined, kind);
      if (typeof res.score !== "number" || !Number.isFinite(res.score)) { failed++; continue; }
      plan.push({ bc: row.barcode, name: row.product_name ?? "?", kind, score: res.score, grade: res.grade, hadKcal: res.kcalPer100ml != null, hadIng: res.hasIngredients });
    } catch { failed++; }
  }
  const grades: Record<string, number> = {};
  for (const p of plan) grades[p.grade] = (grades[p.grade] ?? 0) + 1;
  const neutral70 = plan.filter((p) => p.score === 70).length;
  console.log(`food-misclass excluded: ${foodSkip} | curated excluded: ${curatedSkip} | benchmark excluded: ${benchSkip} | failed: ${failed}`);
  console.log(`BACKFILL TARGETS: ${plan.length}`);
  console.log(`grade distribution: ${JSON.stringify(grades)}`);
  console.log(`  landing at exactly 70 (neutral default, thin data): ${neutral70} | with real kcal: ${plan.filter((p) => p.hadKcal).length} | with ingredients: ${plan.filter((p) => p.hadIng).length}`);

  if (DRY) { console.log(`\nDRY-RUN — nothing written. Re-run with --write.`); return; }

  let wrote = 0, patchFail = 0, logged = 0;
  for (const p of plan) {
    const res = await retry(() => fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(p.bc)}&gorilla_score=is.null&is_alcohol=eq.true`, {
      method: "PATCH", headers: wH,
      body: JSON.stringify({ gorilla_score: p.score, score_grade: p.grade, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }),
    }), "patch");
    if (!res.ok) { patchFail++; console.error(`  PATCH FAIL ${p.bc}: ${res.status}`); continue; }
    wrote++;
    const lg = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
      method: "POST", headers: wH,
      body: JSON.stringify({ product_name: p.name, barcode: p.bc, old_score: null, new_score: p.score, correction_reason: REASON, grade_before: null, grade_after: p.grade, algorithm_version: ALGO_VERSION, batch_id: BATCH_ID }),
    }).catch(() => null);
    if (lg && lg.ok) logged++;
    if (wrote % 30 === 0) console.log(`  ${wrote}/${plan.length}...`);
  }
  console.log(`\nWRITE — backfilled ${wrote}, patchFails ${patchFail}, corrections-logged ${logged}, batch_id ${BATCH_ID}`);
  if (patchFail > 0) process.exit(1);
}
main();
