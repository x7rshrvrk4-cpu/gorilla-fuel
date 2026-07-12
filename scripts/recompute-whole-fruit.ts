/**
 * TARGETED recompute — whole-fruit intrinsic-sugar waiver (commit de78bac). Re-scores
 * every fruit-category-tagged cache row (the only rows the 18g branch-2 fruit ceiling
 * and the sugar waiver can move) and persists any changed score. Self-contained.
 *
 *   npx tsx scripts/recompute-whole-fruit.ts           # DRY-RUN (default)
 *   npx tsx scripts/recompute-whole-fruit.ts --write    # persist gorilla_score/score_grade (+scored_at, algorithm_version)
 *
 * Writes ONLY score fields; skips curated (gate-pinned). Logs each correction to
 * gorilla_score_corrections under one batch_id.
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
const REASON = "whole-fruit intrinsic-sugar waiver recompute (de78bac)";
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false";
// Fruit-category candidate net — a superset of what the change can move.
const OR = "or=(categories.ilike.*en:fruits*,categories.ilike.*en:berries*,categories.ilike.*en:mangoes*,categories.ilike.*en:cherries*,categories.ilike.*en:citrus*,categories.ilike.*en:peaches*,categories.ilike.*en:pineapples*,categories.ilike.*en:blueberries*,categories.ilike.*en:strawberries*,categories.ilike.*en:raspberries*,categories.ilike.*en:cranberries*)";
const SELECT = "barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score,score_grade";

type Row = any;
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
  console.log(`🍊 Recompute whole-fruit waiver — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);
  const rows: Row[] = [];
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&${FOOD}&${OR}&order=barcode.asc`, {
      headers: { ...headers, Range: `${off}-${off + 999}` },
    });
    if (!r.ok) { console.error("fetch", r.status); process.exit(1); }
    const j = (await r.json()) as Row[];
    if (!j.length) break;
    rows.push(...j);
    if (j.length < 1000) break;
  }
  console.log(`fruit-tagged candidate rows: ${rows.length}\n`);

  let curated = 0, changed = 0, errors = 0, wrote = 0, patchFail = 0, logok = 0;
  const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
  const movers: Array<{ bc: string; name: string; before: number | null; after: number; grade: string }> = [];
  for (const row of rows) {
    if (!row.nutrition_data) continue;
    let o; try { o = rc(row); } catch { errors++; continue; }
    if (o.src === "gorilla-verified") { curated++; continue; }
    // Scope to true RESCORES (had a prior score that the waiver moved). Rows with a
    // null stored score are a separate "unscored produce" gap, not this change.
    if (row.gorilla_score === null || row.gorilla_score === o.score) continue;
    changed++;
    movers.push({ bc: row.barcode, name: row.product_name ?? "?", before: row.gorilla_score, after: o.score, grade: o.grade });
  }

  movers.sort((a, b) => (b.after - (b.before ?? 0)) - (a.after - (a.before ?? 0)));
  console.log(`changed: ${changed} | curated-skipped: ${curated} | errors: ${errors}`);
  console.log(`\n=== movers (before -> after) ===`);
  for (const m of movers) console.log(`  ${String(m.before).padStart(4)} -> ${String(m.after).padStart(3)} [${m.grade}]  ${(m.name).slice(0, 38)}  ${m.bc}`);

  if (DRY) { console.log(`\nDRY-RUN — nothing written. Re-run with --write.`); return; }

  for (const m of movers) {
    const p = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(m.bc)}`, {
      method: "PATCH", headers: wH,
      body: JSON.stringify({ gorilla_score: m.after, score_grade: m.grade, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }),
    });
    if (!p.ok) { patchFail++; console.error(`  PATCH FAIL ${m.bc}: ${p.status}`); continue; }
    wrote++;
    const lg = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
      method: "POST", headers: wH,
      body: JSON.stringify({ product_name: m.name, barcode: m.bc, old_score: m.before, new_score: m.after, correction_reason: REASON, grade_after: m.grade, algorithm_version: ALGO_VERSION, batch_id: BATCH_ID }),
    }).catch(() => null);
    if (lg && lg.ok) logok++;
  }
  console.log(`\nWRITE — wrote ${wrote}, patchFails ${patchFail}, corrections-logged ${logok}, batch_id ${BATCH_ID}`);
  if (patchFail > 0) process.exit(1);
}
main();
