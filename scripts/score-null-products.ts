/**
 * Null-score cleanup sweep — FOOD ONLY. A single 2026-06-20 bulk-import pass left
 * ~6,435 scoreable food rows with a null gorilla_score (scored_at stamped, score
 * never written). The current ingest scores correctly, so this is a one-time
 * cleanup: compute + persist a score for every null-score food row.
 *
 *   npx tsx scripts/score-null-products.ts           # DRY-RUN (default)
 *   npx tsx scripts/score-null-products.ts --write     # persist gorilla_score/score_grade (+scored_at, algorithm_version)
 *
 * STRUCTURAL SAFETY:
 *   • Query filters gorilla_score=is.null — it can ONLY add scores to null rows;
 *     it never reads or overwrites an existing score. The PATCH re-asserts is.null.
 *   • Curated/pinned rows flow through applyScoringGate → get their PIN, not a
 *     raw recompute.
 *   • Genuinely unscoreable rows (no valid finite number) are skipped and counted,
 *     never written as garbage.
 *   • Each write logs to gorilla_score_corrections (old_score/grade_before = null)
 *     under one batch_id.
 *   • Hardened: retry/backoff + per-chunk PATCH+log coupling so a socket reset
 *     can't crash-partial (re-run resumes cleanly — the IS NULL filter only ever
 *     returns still-unscored rows).
 *
 * Alcohol/supplement/beauty nulls are deliberately OUT OF SCOPE (different engines).
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
const REASON = "null-score cleanup (2026-06-20 bulk-import artifact)";
// gorilla_score=is.null → structurally cannot touch an already-scored row.
const SCOPE = "gorilla_score=is.null&is_alcohol=eq.false&is_supplement=eq.false&is_beauty=eq.false";
const SELECT = "barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score";
const CHUNK = 300;
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
function score(row: Row): { score: number; grade: string; src?: string } | null {
  let cats: string[] = []; try { cats = JSON.parse(row.categories ?? "[]"); } catch { /* */ }
  const nd = row.nutrition_data as Nutriments | null;
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
  return { score: g.score, grade: g.grade, src: g.scoreSource };
}

async function main() {
  console.log(`🩹 Null-score cleanup (FOOD) — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}`);
  console.log(`   scope: ${SCOPE}\n`);

  const rows: Row[] = [];
  for (let off = 0; ; off += 1000) {
    const r = await retry(() => fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&${SCOPE}&order=barcode.asc`, {
      headers: { ...headers, Range: `${off}-${off + 999}` },
    }), "fetch");
    const j = (await r.json()) as Row[];
    if (!j.length) break;
    rows.push(...j);
    if (j.length < 1000) break;
  }
  const withExisting = rows.filter((r) => r.gorilla_score !== null).length; // must be 0 — proves no-overwrite
  console.log(`in-scope null-score food rows: ${rows.length}`);
  console.log(`rows in scope that already have a score (must be 0): ${withExisting}\n`);

  const plan: Array<{ bc: string; name: string; score: number; grade: string }> = [];
  let unscoreable = 0, curatedPinned = 0;
  const unscoreableList: string[] = [];
  for (const row of rows) {
    const s = score(row);
    if (!s) { unscoreable++; unscoreableList.push(`${row.barcode} ${row.product_name ?? ""}`); continue; }
    if (s.src === "gorilla-verified") curatedPinned++;
    plan.push({ bc: row.barcode, name: row.product_name ?? "?", score: s.score, grade: s.grade });
  }

  const bands: Record<string, number> = { "85-100": 0, "65-84": 0, "40-64": 0, "0-39": 0 };
  for (const p of plan) { const b = p.score >= 85 ? "85-100" : p.score >= 65 ? "65-84" : p.score >= 40 ? "40-64" : "0-39"; bands[b]++; }
  console.log(`will score: ${plan.length} | unscoreable (skipped): ${unscoreable} | curated pins applied: ${curatedPinned}`);
  console.log(`would-be score bands: ${JSON.stringify(bands)}`);
  console.log(`produce landing 85-100: ${bands["85-100"]}`);
  if (unscoreable > 0) { console.log("UNSCOREABLE (skipped, not written):"); unscoreableList.slice(0, 20).forEach((x) => console.log("  " + x)); }
  console.log("\nsample (spread high→low):");
  const sorted = [...plan].sort((a, b) => b.score - a.score);
  [...sorted.slice(0, 4), ...sorted.slice(Math.floor(sorted.length / 2), Math.floor(sorted.length / 2) + 2), ...sorted.slice(-3)]
    .forEach((p) => console.log(`  ${String(p.score).padStart(3)} [${p.grade}]  ${(p.name).slice(0, 40)}  ${p.bc}`));

  if (DRY) { console.log(`\nDRY-RUN — nothing written. Re-run with --write.`); return; }

  const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
  let wrote = 0, patchFail = 0, logged = 0;
  for (let i = 0; i < plan.length; i += CHUNK) {
    const chunk = plan.slice(i, i + CHUNK);
    const groups = new Map<string, typeof chunk>();
    for (const p of chunk) { const k = `${p.score}|${p.grade}`; (groups.get(k) ?? groups.set(k, []).get(k)!).push(p); }
    const nowIso = new Date().toISOString();
    for (const [k, list] of groups) {
      const [sc, gr] = k.split("|");
      const inList = list.map((p) => encodeURIComponent(p.bc)).join(",");
      // Re-assert gorilla_score=is.null — even the PATCH can only touch still-null rows.
      const res = await retry(() => fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=in.(${inList})&gorilla_score=is.null`, {
        method: "PATCH", headers: wH,
        body: JSON.stringify({ gorilla_score: Number(sc), score_grade: gr, scored_at: nowIso, algorithm_version: ALGO_VERSION }),
      }), "patch");
      if (res.ok) wrote += list.length; else patchFail += list.length;
    }
    await retry(() => fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
      method: "POST", headers: wH,
      body: JSON.stringify(chunk.map((p) => ({
        barcode: p.bc, product_name: p.name, old_score: null, new_score: p.score,
        correction_reason: REASON, grade_before: null, grade_after: p.grade,
        algorithm_version: ALGO_VERSION, batch_id: BATCH_ID,
      }))),
    }), "log");
    logged += chunk.length;
    if (logged % 3000 === 0 || logged === plan.length) console.log(`  ${logged}/${plan.length} (wrote ${wrote}, patchFail ${patchFail})`);
  }
  console.log(`\nWRITE — scored ${wrote}, patchFails ${patchFail}, corrections-logged ${logged}, batch_id ${BATCH_ID}`);
  if (patchFail > 0) process.exit(1);
}
main();
