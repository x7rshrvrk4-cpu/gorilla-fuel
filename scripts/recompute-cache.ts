/**
 * RECOMPUTE re-score — re-runs the FULL scan-time scoring composition
 *   score = applyScoringGate(computeScore(nutrition_data, ingredients_text, ctx).finalScore, …)
 * on cached rows and writes the result, which CAN RISE (unlike rescore-cache.ts,
 * which only caps down via the gate and never calls computeScore).
 *
 * TARGETED at PRODUCE / whole-food candidates only — NOT the full cache — to apply
 * the isWholeFood() fix without the additives_tags-loss regressions a full re-score
 * would cause on processed products (the cache has no additives_tags column).
 *
 *   npx tsx scripts/recompute-cache.ts            # DRY-RUN (default): compute deltas, write NOTHING
 *   npx tsx scripts/recompute-cache.ts --write    # persist gorilla_score + score_grade (+scored_at, algorithm_version)
 *
 * Surgical: only rows that ACTUALLY pass isWholeFood() are recomputed/written, so
 * processed items caught by the broad category pre-filter are skipped (no additive
 * divergence). Curated barcodes are gate-pinned (gorilla-verified) and left as-is.
 * Writes ONLY score fields — never nutrition_data/ingredients_text. Idempotent,
 * resumable (page by barcode.asc), loud on PATCH errors.
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { writeFileSync } from "fs";
import { computeScore, isWholeFood, type Nutriments } from "../app/scan/lib/scoring";
import { applyScoringGate } from "../app/scan/lib/curatedScores";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
const BATCH = 500;

if (!URL || !KEY) { console.error("Missing Supabase env vars — aborting."); process.exit(1); }
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };

// Produce / whole-food candidate net (broad — isWholeFood() then confirms each row).
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false&gorilla_score=not.is.null";
const OR = "or=(nova_group.eq.1,categories.ilike.*fruit*,categories.ilike.*vegetable*,categories.ilike.*berries*,categories.ilike.*legume*)";
const SELECT = "barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score,score_grade";

type Row = {
  barcode: string; product_name: string | null; brand: string | null;
  categories: string | null; labels_tags: string[] | null; ingredients_text: string | null;
  nutrition_data: Nutriments | null; nova_group: number | null; serving_size: string | null;
  gorilla_score: number | null; score_grade: string | null;
};

async function main() {
  console.log(`🦍 Recompute re-score — ${DRY ? "DRY-RUN (no writes)" : "WRITE"} | algo ${ALGO_VERSION}\n`);
  let offset = 0, target = 0, skippedNonWhole = 0, curatedPinned = 0, noData = 0;
  let rise = 0, fall = 0, same = 0, patchFail = 0, logFail = 0;
  const deltas: number[] = [];
  const samples: string[] = [];
  const log: string[] = [];
  const fallLog: string[] = [];

  for (;;) {
    const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&${FOOD}&${OR}&order=barcode.asc&offset=${offset}&limit=${BATCH}`, { headers });
    if (!res.ok) { console.error(`Fetch failed at offset ${offset}: ${res.status} ${await res.text().catch(() => "")}`); process.exit(1); }
    const rows: Row[] = await res.json();
    if (rows.length === 0) break;

    for (const row of rows) {
      target++;
      if (!row.nutrition_data || row.gorilla_score === null) { noData++; continue; }
      let cats: string[] = [];
      try { cats = JSON.parse(row.categories ?? "[]"); } catch { /* ignore */ }
      const ctx = {
        servingSize: row.serving_size,
        novaGroup: row.nova_group,
        labelsTags: row.labels_tags,
        categoriesTags: cats,
        productName: row.product_name ?? "",
        additivesTags: null, // cache has no additives_tags column; produce has none anyway
      };

      // SURGICAL: only recompute rows that are genuinely whole foods (the fix's scope).
      if (!isWholeFood(row.nutrition_data, ctx)) { skippedNonWhole++; continue; }

      const base = computeScore(row.nutrition_data, row.ingredients_text, ctx);
      const outcome = applyScoringGate(base.finalScore, {
        barcode: row.barcode,
        productName: row.product_name ?? "",
        brand: row.brand,
        ingredientsText: row.ingredients_text,
        categoriesTags: cats,
        novaGroup: row.nova_group ?? base.novaGroup,
        nutriments: row.nutrition_data,
      });

      // Curated barcodes are pinned by the gate (gorilla-verified) — leave untouched.
      if (outcome.scoreSource === "gorilla-verified") { curatedPinned++; continue; }

      if (outcome.score === row.gorilla_score) { same++; continue; }
      const delta = outcome.score - row.gorilla_score;
      // This produce pass is meant to RAISE items that were over-penalized for
      // missing data. A FALL signals a processed item we shouldn't touch (e.g.
      // additives-loss divergence on salsa/chili-beans) — skip it, never lower here.
      if (delta < 0) {
        fall++;
        fallLog.push(`SKIP-FALL ${delta}  ${row.gorilla_score}->${outcome.score}  ${(row.brand ?? "").slice(0, 18)} | ${(row.product_name ?? "?").slice(0, 38)}  (${row.barcode})`);
        continue;
      }
      deltas.push(delta);
      rise++;
      const line = `${delta > 0 ? "+" : ""}${delta}  ${row.gorilla_score}->${outcome.score} [${outcome.grade}]  ${(row.brand ?? "").slice(0, 18)} | ${(row.product_name ?? "?").slice(0, 38)}  (${row.barcode})`;
      log.push(line);
      if (samples.length < 40) samples.push(line);

      if (!DRY) {
        const patch = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(row.barcode)}`, {
          method: "PATCH", headers,
          body: JSON.stringify({ gorilla_score: outcome.score, score_grade: outcome.grade, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }),
        });
        if (!patch.ok) { patchFail++; console.error(`  PATCH FAIL ${row.barcode}: ${patch.status} ${await patch.text().catch(() => "")}`); continue; }
        const logRes = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
          method: "POST", headers,
          body: JSON.stringify({ product_name: row.product_name, barcode: row.barcode, old_score: row.gorilla_score, new_score: outcome.score, correction_reason: "recompute: whole-food data-gap exemption" }),
        }).catch(() => null);
        if (!logRes || !logRes.ok) logFail++;
      }
    }
    offset += BATCH;
    if (rows.length < BATCH) break;
  }

  const avgRise = deltas.filter((d) => d > 0).reduce((a, b) => a + b, 0) / (rise || 1);
  const buckets: Record<string, number> = { "1-5": 0, "6-15": 0, "16-30": 0, "31-50": 0, "50+": 0 };
  for (const d of deltas) { const a = Math.abs(d); if (a <= 5) buckets["1-5"]++; else if (a <= 15) buckets["6-15"]++; else if (a <= 30) buckets["16-30"]++; else if (a <= 50) buckets["31-50"]++; else buckets["50+"]++; }

  console.log("──── SAMPLE (up to 40) ────");
  samples.forEach((s) => console.log("  " + s));
  console.log("\n──── SUMMARY ────");
  console.log(`candidates scanned       : ${target}`);
  console.log(`  whole-food confirmed   : ${rise + fall + same + curatedPinned}`);
  console.log(`  skipped (not wholefood): ${skippedNonWhole}  <- processed items caught by broad pre-filter, NOT touched`);
  console.log(`  skipped (no nutr/score): ${noData}`);
  console.log(`  curated (gate-pinned)  : ${curatedPinned}  <- unchanged`);
  console.log(`changes: RISE ${rise} (written) | FALL ${fall} (SKIPPED — never lower in produce pass) | SAME ${same}`);
  console.log(`avg rise: +${Math.round(avgRise)} | delta distribution (|Δ| of rises): ${JSON.stringify(buckets)}`);
  if (fallLog.length) { console.log("\n──── SKIPPED FALLS (not written) ────"); fallLog.forEach((s) => console.log("  " + s)); }
  console.log(`\nMODE: ${DRY ? "DRY-RUN — nothing written. Re-run with --write to persist." : `WRITE — patchFails ${patchFail}, logFails ${logFail}`}`);
  writeFileSync("recompute-dryrun-log.txt", log.join("\n"), "utf8");
  if (!DRY && patchFail > 0) { console.error(`\n✗ ${patchFail} PATCH failures — divergence.`); process.exit(1); }
}
main();
