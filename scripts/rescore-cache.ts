/**
 * TASK 5 — Retroactive cache rescore.
 *
 * Pages through gorilla_product_cache in batches, runs every cached food score
 * through the scoring gate (curated lookup → brand caps → category caps →
 * ingredient sanity check), and PATCHes any row whose cached score exceeds its
 * correct value. Each correction is logged to gorilla_score_corrections and to
 * a local file as backup.
 *
 * Run: npx tsx scripts/rescore-cache.ts
 *
 * Requires gorilla_score_corrections (run once in Supabase SQL Editor):
 *   create table if not exists public.gorilla_score_corrections (
 *     id                uuid primary key default gen_random_uuid(),
 *     product_name      text,
 *     barcode           text not null,
 *     old_score         integer,
 *     new_score         integer,
 *     correction_reason text,
 *     corrected_at      timestamptz not null default now()
 *   );
 *   alter table public.gorilla_score_corrections enable row level security;
 *   create policy "Anon insert corrections" on public.gorilla_score_corrections
 *     for insert to anon with check (true);
 */

import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { writeFileSync } from "fs";
import { randomUUID } from "node:crypto";
import { applyScoringGate } from "../app/scan/lib/curatedScores";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const BATCH = 500;
// One id per run — groups every correction row this pass writes (audit "batch").
const BATCH_ID = randomUUID();

if (!URL || !KEY) {
  console.error("Missing Supabase env vars — aborting.");
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

type Row = {
  barcode: string;
  product_name: string | null;
  brand: string | null;
  categories: string | null;
  ingredients_text: string | null;
  gorilla_score: number | null;
  nova_group: number | null;
  is_alcohol: boolean;
  is_beauty: boolean;
};

async function main() {
  let offset = 0;
  let scanned = 0;
  let corrected = 0;
  let logFailures = 0;
  const log: string[] = [];

  for (;;) {
    const res = await fetch(
      `${URL}/rest/v1/gorilla_product_cache?select=barcode,product_name,brand,categories,ingredients_text,gorilla_score,nova_group,is_alcohol,is_beauty&order=barcode.asc&offset=${offset}&limit=${BATCH}`,
      { headers }
    );
    if (!res.ok) {
      console.error(`Fetch failed at offset ${offset}: ${res.status}`);
      break;
    }
    const rows: Row[] = await res.json();
    if (rows.length === 0) break;

    for (const row of rows) {
      scanned++;
      if (row.is_alcohol || row.is_beauty || row.gorilla_score === null) continue;

      let cats: string[] = [];
      try { cats = JSON.parse(row.categories ?? "[]"); } catch { /* ignore */ }

      const outcome = applyScoringGate(row.gorilla_score, {
        barcode: row.barcode,
        productName: row.product_name ?? "",
        brand: row.brand,
        ingredientsText: row.ingredients_text,
        categoriesTags: cats,
        novaGroup: row.nova_group,
      });

      // Correct when the cap/curated score is BELOW the cached score, or when a
      // curated entry disagrees in either direction.
      const needsFix =
        outcome.scoreSource === "gorilla-verified"
          ? outcome.score !== row.gorilla_score
          : outcome.score < row.gorilla_score;
      if (!needsFix) continue;

      const reason =
        outcome.scoreSource === "gorilla-verified"
          ? "curated database score"
          : outcome.capReason ?? outcome.scoreSource;

      // PATCH the cache row
      const patch = await fetch(
        `${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(row.barcode)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ gorilla_score: outcome.score, score_grade: outcome.grade }),
        }
      );
      if (!patch.ok) {
        console.error(`PATCH failed for ${row.barcode}: ${patch.status}`);
        continue;
      }

      // Log to gorilla_score_corrections (fire-and-forget; table may not exist yet)
      const logRes = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_name: row.product_name,
          barcode: row.barcode,
          old_score: row.gorilla_score,
          new_score: outcome.score,
          correction_reason: reason,
          grade_after: outcome.grade,
          algorithm_version: ALGO_VERSION,
          batch_id: BATCH_ID,
        }),
      }).catch(() => null);
      if (!logRes || !logRes.ok) logFailures++;

      corrected++;
      const line = `${row.product_name ?? "?"} [${row.barcode}]: ${row.gorilla_score} -> ${outcome.score} (${reason})`;
      log.push(line);
      console.log("CORRECTED " + line);
    }

    offset += BATCH;
    if (rows.length < BATCH) break;
  }

  writeFileSync("score-corrections-log.txt", log.join("\n"), "utf8");
  console.log(`\nDone. Scanned ${scanned} cached products, corrected ${corrected}.`);
  if (logFailures > 0) {
    console.log(`NOTE: ${logFailures} corrections could not be written to gorilla_score_corrections — create the table with the SQL in this file's header.`);
  }
}

main();
