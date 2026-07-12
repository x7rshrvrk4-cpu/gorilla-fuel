/**
 * TARGETED recompute — physical-plausibility clamp cleanup. Re-scores every cache
 * row whose stored salt_100g > 100 g/100g (physically impossible OFF garbage) so the
 * corrupted persisted scores are overwritten with the clamped (drop-to-missing)
 * values. Self-contained: it scans for the impossible-salt class itself.
 *
 *   npx tsx scripts/recompute-salt-outliers.ts           # DRY-RUN (default)
 *   npx tsx scripts/recompute-salt-outliers.ts --write    # persist gorilla_score/score_grade (+scored_at, algorithm_version)
 *
 * Writes ONLY score fields; skips curated (gate-pinned). Logs each correction to
 * gorilla_score_corrections with one shared batch_id so this cleanup is queryable
 * as a single run.
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
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const BATCH_ID = randomUUID();
const REASON = "impossible-salt clamp recompute (salt_100g >100g/100g dropped-to-missing)";

type Row = {
  barcode: string; product_name: string | null; brand: string | null; categories: string | null;
  labels_tags: string[] | null; ingredients_text: string | null; nutrition_data: Nutriments | null;
  nova_group: number | null; serving_size: string | null; gorilla_score: number | null; score_grade: string | null;
};

function rc(row: Row) {
  let cats: string[] = []; try { cats = JSON.parse(row.categories ?? "[]"); } catch { /* */ }
  const base = computeScore(row.nutrition_data as Nutriments, row.ingredients_text, {
    servingSize: row.serving_size, novaGroup: row.nova_group ?? undefined, labelsTags: row.labels_tags ?? undefined,
    categoriesTags: cats, productName: row.product_name ?? "", brand: row.brand ?? null,
  } as any);
  const g = applyScoringGate(base.finalScore, {
    barcode: row.barcode, productName: row.product_name ?? "", brand: row.brand,
    ingredientsText: row.ingredients_text, categoriesTags: cats, novaGroup: row.nova_group ?? base.novaGroup,
    nutriments: row.nutrition_data as Parameters<typeof applyScoringGate>[1]["nutriments"],
  });
  return { score: g.score, grade: g.grade, src: g.scoreSource };
}

async function main() {
  console.log(`🧂 Recompute impossible-salt outliers — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);
  const SELECT = "barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score,score_grade";

  // Scan the whole cache for salt_100g > 100 (physically impossible).
  const rows: Row[] = [];
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&order=barcode.asc`, {
      headers: { ...headers, Range: `${off}-${off + 999}` },
    });
    if (!r.ok) { console.error("fetch", r.status); process.exit(1); }
    const j = (await r.json()) as Row[];
    if (!j.length) break;
    for (const row of j) {
      const s = (row.nutrition_data as Record<string, unknown> | null)?.["salt_100g"];
      if (typeof s === "number" && s > 100) rows.push(row);
    }
    if (j.length < 1000) break;
  }
  console.log(`impossible-salt rows found: ${rows.length}\n`);

  let curated = 0, changed = 0, same = 0, wrote = 0, patchFail = 0, logok = 0, errors = 0;
  const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
  for (const row of rows) {
    if (!row.nutrition_data) { errors++; continue; }
    let o; try { o = rc(row); } catch { errors++; continue; }
    if (o.src === "gorilla-verified") { curated++; continue; }
    const before = row.gorilla_score;
    const moved = before !== o.score;
    console.log(`  ${String(before).padStart(4)} -> ${String(o.score).padStart(3)} [${o.grade}]${moved ? "" : "  (same)"}  ${(row.product_name ?? "?").slice(0, 34)}  ${row.barcode}`);
    if (!moved) { same++; continue; }
    changed++;
    if (!DRY) {
      const p = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(row.barcode)}`, {
        method: "PATCH", headers: wH,
        body: JSON.stringify({ gorilla_score: o.score, score_grade: o.grade, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }),
      });
      if (!p.ok) { patchFail++; console.error(`  PATCH FAIL ${row.barcode}: ${p.status}`); continue; }
      wrote++;
      const lg = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
        method: "POST", headers: wH,
        body: JSON.stringify({ product_name: row.product_name, barcode: row.barcode, old_score: before, new_score: o.score, correction_reason: REASON, grade_after: o.grade, algorithm_version: ALGO_VERSION, batch_id: BATCH_ID }),
      }).catch(() => null);
      if (lg && lg.ok) logok++;
    }
  }

  console.log(`\n──── SUMMARY ────`);
  console.log(`impossible-salt rows : ${rows.length}`);
  console.log(`  changed            : ${changed}`);
  console.log(`  unchanged          : ${same}`);
  console.log(`  curated (skipped)  : ${curated}`);
  console.log(`  errors             : ${errors}`);
  console.log(DRY ? `\nDRY-RUN — nothing written. Re-run with --write to persist.` : `\nWRITE — wrote ${wrote}, patchFails ${patchFail}, corrections-logged ${logok}, batch_id ${BATCH_ID}`);
  if (!DRY && patchFail > 0) process.exit(1);
}
main();
