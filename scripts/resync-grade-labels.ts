/**
 * Grade-label resync — the stored score_grade column went stale when the grade
 * bands were recut in commit 15a9f96 ("no rescore/recompute"), so ~26k food rows
 * carry an old-band label while their gorilla_score is correct. This sweep sets
 * score_grade = gradeFromScore(gorilla_score) for every mismatched FOOD row.
 *
 *   npx tsx scripts/resync-grade-labels.ts           # DRY-RUN (default)
 *   npx tsx scripts/resync-grade-labels.ts --write    # persist score_grade only
 *
 * GRADE LABEL ONLY. The PATCH body contains score_grade and nothing else — it
 * NEVER sends gorilla_score / scored_at / algorithm_version, so the score is
 * structurally untouched. Excludes alcohol/supplement/beauty (different grade
 * vocabularies). Only rows whose grade actually differs are touched. Each change
 * is logged to gorilla_score_corrections under one batch_id with old_score ==
 * new_score and grade_before/grade_after populated — the audit honestly records
 * "grade changed, score did not".
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { randomUUID } from "node:crypto";
import { gradeFromScore } from "../app/scan/lib/scoring";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const KEY = SVC || (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "");
const DRY = !process.argv.includes("--write");
if (!URL || !KEY) { console.error("Missing Supabase env"); process.exit(1); }
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const BATCH_ID = randomUUID();
const REASON = "grade-label resync (15a9f96 band recut, scores unchanged)";
const CHUNK = 400;         // rows processed (patched + logged) together
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fetch with retry/backoff — transient socket resets and 5xx/429 shouldn't crash a long sweep. */
async function retry(fn: () => Promise<Response>, label: string): Promise<Response> {
  for (let a = 0; a < 5; a++) {
    try {
      const r = await fn();
      if (r.ok) return r;
      if (r.status >= 500 || r.status === 429) { await sleep(800 * (a + 1)); continue; }
      throw new Error(`${label} ${r.status} ${await r.text().catch(() => "")}`);
    } catch (e) {
      if (a === 4) throw e;
      await sleep(800 * (a + 1));
    }
  }
  throw new Error(`${label} exhausted retries`);
}

type Mismatch = { barcode: string; product_name: string | null; score: number; oldGrade: string | null; newGrade: string };

async function main() {
  console.log(`🏷️  Grade-label resync — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);
  const SELECT = "barcode,product_name,gorilla_score,score_grade,is_alcohol,is_supplement,is_beauty";

  const rows: Mismatch[] = [];
  let scanned = 0;
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&order=barcode.asc`, {
      headers: { ...headers, Range: `${off}-${off + 999}` },
    });
    if (!r.ok) { console.error("fetch", r.status); process.exit(1); }
    const j = (await r.json()) as any[];
    if (!j.length) break;
    scanned += j.length;
    for (const row of j) {
      if (row.is_alcohol || row.is_supplement || row.is_beauty) continue;
      const s = row.gorilla_score;
      if (typeof s !== "number") continue;
      const correct = gradeFromScore(s);
      if (row.score_grade !== correct) rows.push({ barcode: row.barcode, product_name: row.product_name, score: s, oldGrade: row.score_grade, newGrade: correct });
    }
    if (j.length < 1000) break;
  }

  // direction split
  const dir = new Map<string, number>();
  for (const m of rows) { const k = `${m.oldGrade} -> ${m.newGrade}`; dir.set(k, (dir.get(k) ?? 0) + 1); }
  const scoreWouldChange = 0; // structurally: PATCH never sends gorilla_score

  console.log(`food rows scanned         : ${scanned}`);
  console.log(`GRADE MISMATCHES to resync : ${rows.length}`);
  console.log(`rows whose SCORE would change (must be 0): ${scoreWouldChange}  (PATCH body = {score_grade} only)`);
  console.log(`\ndirection split:`);
  for (const [k, c] of [...dir.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(24)} ${c}`);

  console.log(`\n10 sample before -> after (score stays fixed):`);
  for (const m of rows.slice(0, 10)) console.log(`  score ${String(m.score).padStart(3)}  "${m.oldGrade}" -> "${m.newGrade}"  ${m.barcode}  ${(m.product_name ?? "").slice(0, 30)}`);

  if (DRY) { console.log(`\nMODE: DRY-RUN — nothing written. Re-run with --write to persist.`); return; }

  // ── WRITE: process in chunks, coupling PATCH + audit-log per chunk so a crash
  // leaves a consistent state and a re-run (scan finds only remaining mismatches)
  // resumes cleanly. PATCH body = {score_grade} ONLY — the score is never sent. ──
  const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
  let patched = 0, logged = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    // group this chunk by target grade → one PATCH per distinct grade
    const byGrade = new Map<string, Mismatch[]>();
    for (const m of chunk) { (byGrade.get(m.newGrade) ?? byGrade.set(m.newGrade, []).get(m.newGrade)!).push(m); }
    for (const [grade, list] of byGrade) {
      const inList = list.map((m) => encodeURIComponent(m.barcode)).join(",");
      await retry(() => fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=in.(${inList})`, {
        method: "PATCH", headers: wH, body: JSON.stringify({ score_grade: grade }),
      }), "patch");
      patched += list.length;
    }
    // log this chunk's corrections (old_score == new_score; grade_before/after)
    await retry(() => fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
      method: "POST", headers: wH,
      body: JSON.stringify(chunk.map((m) => ({
        barcode: m.barcode, product_name: m.product_name, old_score: m.score, new_score: m.score,
        correction_reason: REASON, grade_before: m.oldGrade, grade_after: m.newGrade,
        algorithm_version: ALGO_VERSION, batch_id: BATCH_ID,
      }))),
    }), "log");
    logged += chunk.length;
    if (logged % 4000 === 0 || logged === rows.length) console.log(`  ${logged}/${rows.length} (patched ${patched})`);
  }

  console.log(`\nWRITE — score_grade patched ${patched}, corrections-logged ${logged}, batch_id ${BATCH_ID}`);
}
main();
