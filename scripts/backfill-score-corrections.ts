/**
 * Historical backfill — load the local recompute write-logs into
 * gorilla_score_corrections so the audit trail predating the table isn't lost.
 *
 *   npx tsx scripts/backfill-score-corrections.ts            # DRY-RUN (default) — parse + report, no writes
 *   npx tsx scripts/backfill-score-corrections.ts --write    # insert (requires the table + service key)
 *
 * SOURCES (one batch_id per file; corrected_at = the file's mtime = when that run ran):
 *   recompute-full-write-log.txt  (barcode ⇥ old ⇥ new ⇥ name)            → "full recompute (backfilled from local log)"
 *   recompute-oils-write-log.tsv  (barcode ⇥ old ⇥ new ⇥ name)            → "pure-oil additive+nutrition exemption (backfilled)"
 *   drift-recompute-write-log.txt (barcode ⇥ old ⇥ new ⇥ grade ⇥ name)    → "drift recompute (backfilled)" (grade → grade_after)
 * grade_after: taken from the file for drift; derived via gradeFromScore(new_score) for the others (deterministic).
 * algorithm_version = ALGO_VERSION (v2.3, the logic these runs used).
 *
 * Parsing: product names can contain embedded newlines (they split a logical row
 * across physical lines). We detect a NEW record by the leading `barcode⇥int⇥int⇥`
 * signature and APPEND any non-matching line to the current record's name — so
 * multi-line names are rejoined and no row is dropped. Lines that don't match and
 * have no current record are reported as malformed.
 *
 * DEDUP / idempotency: there is no natural unique key, so each file's rows are
 * tagged with a stable, file-specific `correction_reason`. Before inserting a
 * file, we COUNT existing rows with that reason:
 *   0            → insert all chunks.
 *   == expected  → skip ("already backfilled").
 *   partial      → skip + warn (delete rows for that reason and re-run to redo).
 * This makes a full re-run a safe no-op and never double-inserts a completed file.
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { readFileSync, statSync, existsSync } from "fs";
import { randomUUID } from "node:crypto";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";
import { gradeFromScore } from "../app/scan/lib/scoring";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const KEY = SVC || (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "");
const DRY = !process.argv.includes("--write");
const CHUNK = 500;
if (!URL || !KEY) { console.error("Missing Supabase env vars — aborting."); process.exit(1); }
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const REC_START = /^\d{5,}\t-?\d+\t-?\d+\t/; // barcode ⇥ old ⇥ new ⇥ …

type Src = { file: string; hasGrade: boolean; reason: string };
const SOURCES: Src[] = [
  { file: "recompute-full-write-log.txt", hasGrade: false, reason: "full recompute (backfilled from local log)" },
  { file: "recompute-oils-write-log.tsv", hasGrade: false, reason: "pure-oil additive+nutrition exemption (backfilled)" },
  { file: "drift-recompute-write-log.txt", hasGrade: true,  reason: "drift recompute (backfilled)" },
];

type Parsed = {
  batchId: string; mtime: string; reason: string;
  rows: Array<Record<string, unknown>>;
  bad: Array<{ line: number; text: string }>;
  multiline: number; // how many names were reassembled from >1 physical line
};

function parseFile(src: Src): Parsed {
  const raw = readFileSync(src.file, "utf8");
  const mtime = statSync(src.file).mtime.toISOString();
  const batchId = randomUUID();
  const physical = raw.split(/\r?\n/);
  const rows: Array<Record<string, unknown>> = [];
  const bad: Array<{ line: number; text: string }> = [];
  let multiline = 0;

  let cur: any = null;
  let curLines = 1;
  const finalize = () => {
    if (!cur) return;
    if (curLines > 1) multiline++;
    if (!cur.barcode || !Number.isFinite(cur.old_score) || !Number.isFinite(cur.new_score)) {
      bad.push({ line: cur._line, text: `barcode=${cur.barcode} old=${cur.old_score} new=${cur.new_score}` });
    } else {
      delete cur._line;
      rows.push(cur);
    }
    cur = null; curLines = 1;
  };

  for (let i = 0; i < physical.length; i++) {
    const line = physical[i];
    if (line === "" && i === physical.length - 1) continue; // trailing newline artifact
    if (REC_START.test(line)) {
      finalize();
      const p = line.split("\t");
      const old_score = parseInt(p[1], 10);
      const new_score = parseInt(p[2], 10);
      let grade_after: string | null;
      let product_name: string;
      if (src.hasGrade) { grade_after = p[3] ?? null; product_name = p.slice(4).join("\t"); }
      else { product_name = p.slice(3).join("\t"); grade_after = Number.isFinite(new_score) ? gradeFromScore(new_score) : null; }
      cur = {
        barcode: p[0], product_name, old_score, new_score,
        correction_reason: src.reason, grade_after,
        algorithm_version: ALGO_VERSION, batch_id: batchId, corrected_at: mtime,
        _line: i + 1,
      };
    } else if (cur) {
      cur.product_name += "\n" + line; // embedded-newline continuation of the name
      curLines++;
    } else if (line.trim() !== "") {
      bad.push({ line: i + 1, text: line }); // orphan with no preceding record
    }
  }
  finalize();
  return { batchId, mtime, reason: src.reason, rows, bad, multiline };
}

async function tableExists(): Promise<boolean> {
  const r = await fetch(`${URL}/rest/v1/gorilla_score_corrections?select=id&limit=0`, {
    headers: { ...headers, Prefer: "count=exact", Range: "0-0" },
  }).catch(() => null);
  return !!r && r.status !== 404;
}

async function countByReason(reason: string): Promise<number> {
  const r = await fetch(`${URL}/rest/v1/gorilla_score_corrections?correction_reason=eq.${encodeURIComponent(reason)}&select=id`, {
    headers: { ...headers, Prefer: "count=exact", Range: "0-0" },
  });
  const cr = r.headers.get("content-range"); // "0-0/1234" or "*/0"
  return cr ? parseInt(cr.split("/")[1] || "0", 10) : 0;
}

async function main() {
  console.log(`🗄️  Backfill score-corrections — ${DRY ? "DRY-RUN (no writes)" : "WRITE"} | algo ${ALGO_VERSION}\n`);

  // Table-existence guard — clean exit if the SQL hasn't been run yet.
  const exists = await tableExists();
  console.log(`table gorilla_score_corrections exists: ${exists ? "YES" : "NO (run supabase/gorilla_score_corrections.sql first)"}`);
  if (!exists && !DRY) {
    console.error("\n✗ Table absent — nothing written. Run supabase/gorilla_score_corrections.sql in the Supabase SQL Editor, then re-run with --write.");
    process.exit(0);
  }

  // Parse all sources.
  const parsed: Parsed[] = [];
  let grandTotal = 0;
  for (const src of SOURCES) {
    if (!existsSync(src.file)) { console.error(`  MISSING source file: ${src.file} — skipping`); continue; }
    const pr = parseFile(src);
    parsed.push(pr);
    grandTotal += pr.rows.length;
    console.log(`\n── ${src.file}`);
    console.log(`   parsed rows      : ${pr.rows.length}`);
    console.log(`   reassembled names: ${pr.multiline} (multi-line product names rejoined)`);
    console.log(`   malformed/skipped: ${pr.bad.length}`);
    for (const b of pr.bad.slice(0, 20)) console.log(`      line ${b.line}: ${JSON.stringify(b.text)}`);
    console.log(`   corrected_at     : ${pr.mtime}  (file mtime)`);
    console.log(`   batch_id         : ${pr.batchId}`);
    console.log(`   correction_reason: ${JSON.stringify(pr.reason)}`);
  }
  console.log(`\nGRAND TOTAL parsed: ${grandTotal} rows across ${parsed.length} files`);

  // 10-row sample across files (all fields).
  console.log(`\n──── SAMPLE (10 rows, all fields) ────`);
  const sample: Array<Record<string, unknown>> = [];
  for (const p of parsed) sample.push(...p.rows.slice(0, p === parsed[0] ? 4 : 3));
  for (const r of sample.slice(0, 10)) console.log("  " + JSON.stringify(r));

  if (DRY) {
    console.log(`\nMODE: DRY-RUN — nothing written. Re-run with --write (after the table exists) to insert.`);
    console.log(`DEDUP: on --write, each file is skipped if rows with its correction_reason already exist (safe re-run).`);
    return;
  }

  // WRITE path — per-file dedup guard, chunked inserts, progress.
  const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
  for (const p of parsed) {
    const existing = await countByReason(p.reason);
    if (existing >= p.rows.length && p.rows.length > 0) { console.log(`\nSKIP ${p.reason} — already backfilled (${existing} rows present).`); continue; }
    if (existing > 0) { console.error(`\n⚠ PARTIAL ${p.reason} — ${existing}/${p.rows.length} present. Delete rows for this reason and re-run to redo. Skipping.`); continue; }
    console.log(`\nInserting ${p.rows.length} rows for ${JSON.stringify(p.reason)} …`);
    let ok = 0, fail = 0;
    for (let i = 0; i < p.rows.length; i += CHUNK) {
      const chunk = p.rows.slice(i, i + CHUNK);
      const res = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, { method: "POST", headers: wH, body: JSON.stringify(chunk) });
      if (res.ok) ok += chunk.length; else { fail += chunk.length; console.error(`  CHUNK FAIL @${i}: ${res.status} ${await res.text().catch(() => "")}`); }
      console.log(`   ${Math.min(i + CHUNK, p.rows.length)}/${p.rows.length} (ok ${ok}, fail ${fail})`);
    }
    console.log(`   done: inserted ${ok}, failed ${fail}`);
  }
  console.log(`\nWRITE complete.`);
}

main();
