/**
 * BC Liquor CSV — ABV backfill onto the 16 barcode-matched alcohol cache rows.
 * Persists the real PRODUCT_ALCOHOL_PERCENT into nutrition_data.alcohol_100g (jsonb —
 * no schema change) and re-derives the alcohol score.
 *
 *   npx tsx scripts/backfill-bc-abv.ts           # DRY-RUN (default)
 *   npx tsx scripts/backfill-bc-abv.ts --write     # persist
 *
 * IMPORTANT (honest scope): computeAlcoholScore only consumes ABV for the BEER
 * formula, so of these 16, only the beer row moves score (Cariboo Blonde 70→68).
 * The other 15 (spirits/wine/RTD) keep their score — ABV isn't a scoring input for
 * them. The ABV is still persisted for data hygiene, the "higher-strength pour"
 * display flag, and any future scorer that weights ABV across kinds.
 *
 * SAFETY: touches only these 16 explicit is_alcohol barcodes; PATCH re-asserts
 * is_alcohol=eq.true; adds alcohol_100g to existing nutrition_data (never removes
 * fields); logs each to gorilla_score_corrections under one batch_id.
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { randomUUID } from "node:crypto";
import { computeAlcoholScore, detectAlcoholKind } from "../app/scan/lib/alcoholScoring";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const KEY = SVC || (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "");
const DRY = !process.argv.includes("--write");
if (!URL || !KEY) { console.error("Missing Supabase env"); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const BATCH_ID = randomUUID();
const REASON = "BC Liquor CSV ABV backfill — closes alcohol-scoring flatline gap for barcode-matched rows";

// barcode -> ABV (from BC PRODUCT_ALCOHOL_PERCENT, matched by normalized UPC in the diagnosis)
const ABV: Record<string, number> = {
  "0048415510806": 40, "0050037596038": 40, "0065912006977": 5.5, "0088004400163": 33,
  "0620213025609": 40, "0620213180902": 40, "0622153625048": 40, "0626990098638": 5,
  "0631470000131": 13.5, "0774558001306": 5.5, "0835229001305": 40, "0850047003003": 43.3,
  "5000104123280": 5.3, "5000299609354": 40, "5000329002353": 40, "8437012435285": 11.5,
};
const BENCH = new Set(["0028400090308","0044000030131","0069000019832","0069000008947","0062100012284","0028400590679","0028400090155","0072030007972","0817939020025","0602652179864","0041570050000","0069000019849"]);

async function main() {
  console.log(`🍷 BC ABV backfill — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);
  const cr = await fetch(`${URL}/rest/v1/curated_picks?select=barcode`, { headers: H });
  const curated = new Set(((await cr.json()) as any[]).map((c) => c.barcode));

  const bcs = Object.keys(ABV).join(",");
  const rows = (await (await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=in.(${bcs})&select=barcode,product_name,categories,ingredients_text,nutrition_data,gorilla_score,score_grade,is_alcohol`, { headers: H })).json()) as any[];
  console.log(`PRE-WRITE ASSERTION: fetched ${rows.length} rows (expected 16), all is_alcohol=${rows.every((r) => r.is_alcohol)}`);
  if (rows.length !== 16 || !rows.every((r) => r.is_alcohol)) { console.error("ABORT — row set drifted or not all alcohol."); process.exit(1); }
  console.log(`curated overlap: ${rows.filter((r) => curated.has(r.barcode)).length} | benchmark overlap: ${rows.filter((r) => BENCH.has(r.barcode)).length}\n`);

  const plan: any[] = [];
  for (const r of rows) {
    if (curated.has(r.barcode) || BENCH.has(r.barcode)) continue; // defense-in-depth (expected 0)
    let cats: string[] = []; try { cats = typeof r.categories === "string" ? JSON.parse(r.categories) : (r.categories ?? []); } catch {}
    let nd = r.nutrition_data; if (typeof nd === "string") { try { nd = JSON.parse(nd); } catch { nd = {}; } }
    nd = nd ?? {};
    const abv = ABV[r.barcode];
    const kind = detectAlcoholKind(cats);
    const ndNew = { ...nd, alcohol_100g: abv };
    const res = computeAlcoholScore(ndNew, r.ingredients_text ?? undefined, kind);
    plan.push({ bc: r.barcode, name: r.product_name ?? "?", kind, abv, before: r.gorilla_score, beforeGrade: r.score_grade, after: res.score, afterGrade: res.grade, ndNew });
  }

  console.log("barcode          kind      before -> after   Δ   ABV   product");
  for (const p of plan) console.log(`  ${p.bc.padEnd(15)} ${p.kind.padEnd(9)} ${String(p.before).padStart(4)} -> ${String(p.after).padStart(4)}  ${String(p.after - (p.before ?? 0)).padStart(3)}  ${String(p.abv).padStart(5)}  ${p.name.slice(0, 26)}`);
  const scoreChanged = plan.filter((p) => p.before !== p.after);
  console.log(`\nABV persisted (nutrition_data.alcohol_100g): ${plan.length} | SCORE changed: ${scoreChanged.length} (${scoreChanged.map((p) => p.name.slice(0, 14) + " " + p.before + "→" + p.after).join(", ") || "none"})`);

  if (DRY) { console.log("\nDRY-RUN — nothing written."); return; }

  let wrote = 0, patchFail = 0, logged = 0;
  for (const p of plan) {
    const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(p.bc)}&is_alcohol=eq.true`, {
      method: "PATCH", headers: wH,
      body: JSON.stringify({ nutrition_data: p.ndNew, gorilla_score: p.after, score_grade: p.afterGrade, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }),
    });
    if (!res.ok) { patchFail++; console.error(`  PATCH FAIL ${p.bc}: ${res.status} ${await res.text().catch(() => "")}`); continue; }
    wrote++;
    const lg = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
      method: "POST", headers: wH,
      body: JSON.stringify({ product_name: `${p.name} (ABV ${p.abv}% backfilled)`, barcode: p.bc, old_score: p.before, new_score: p.after, correction_reason: REASON, grade_before: p.beforeGrade, grade_after: p.afterGrade, algorithm_version: ALGO_VERSION, batch_id: BATCH_ID }),
    }).catch(() => null);
    if (lg && lg.ok) logged++;
  }
  console.log(`\nWRITE — rows updated ${wrote}, patchFails ${patchFail}, corrections-logged ${logged}, batch_id ${BATCH_ID}`);
  if (patchFail > 0) process.exit(1);
}
main();
