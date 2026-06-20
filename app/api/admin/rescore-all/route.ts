import { type NextRequest, NextResponse } from "next/server";
import { computeScore } from "../../../scan/lib/scoring";
import { applyScoringGate } from "../../../scan/lib/curatedScores";
import { tryParseCategories } from "../../../scan/lib/productCache";
import { ALGO_VERSION } from "../../../scan/lib/productClassify";
import type { Nutriments } from "../../../scan/lib/scoring";

/**
 * POST /api/admin/rescore-all
 *
 * Re-runs the full scoring pipeline (computeScore + applyScoringGate) across
 * all cached food products and writes the corrected scores back.
 *
 * This is a paginated endpoint — call it repeatedly with increasing offsets
 * until the response indicates `done: true`.
 *
 * Auth: x-admin-key header or ?key= must match ADMIN_API_KEY env var.
 *
 * Body (JSON):
 *   { offset?: number, limit?: number, dry_run?: boolean }
 *   - offset   : row offset (default 0)
 *   - limit    : rows per call, max 2000 (default 500)
 *   - dry_run  : compute but don't write (default false)
 *
 * Response:
 *   { offset, limit, dry_run, algorithm_version, stats: { processed, rescored,
 *     unchanged, skipped, errors, next_offset, done } }
 *
 * Requires schema migration (run once in Supabase SQL Editor):
 *   alter table public.gorilla_product_cache
 *     add column if not exists is_curated        boolean     not null default false,
 *     add column if not exists scored_at          timestamptz,
 *     add column if not exists algorithm_version  text;
 *   create index if not exists gorilla_cache_algo_idx
 *     on public.gorilla_product_cache (algorithm_version);
 */

type CacheRow = {
  barcode: string;
  product_name: string | null;
  brand: string | null;
  categories: string | null;
  ingredients_text: string | null;
  nutrition_data: Nutriments | null;
  nova_group: number | null;
  gorilla_score: number | null;
  score_grade: string | null;
  algorithm_version: string | null;
  is_alcohol: boolean;
  is_supplement: boolean;
  is_beauty: boolean;
};

function checkAuth(request: NextRequest): Response | null {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { error: "ADMIN_API_KEY is not configured on this server." },
      { status: 403 }
    );
  }
  const provided =
    request.headers.get("x-admin-key") ??
    new URL(request.url).searchParams.get("key");
  if (provided !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  let offset = 0;
  let limit = 500;
  let dryRun = false;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.offset === "number") offset = Math.max(0, body.offset);
    if (typeof body.limit === "number") limit = Math.min(Math.max(1, body.limit), 2000);
    if (typeof body.dry_run === "boolean") dryRun = body.dry_run;
  } catch {
    // Use defaults
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const baseHeaders = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  // Fetch a batch of non-curated food rows
  const fetchUrl = new URL(`${supabaseUrl}/rest/v1/gorilla_product_cache`);
  fetchUrl.searchParams.set(
    "select",
    "barcode,product_name,brand,categories,ingredients_text,nutrition_data,nova_group,gorilla_score,score_grade,algorithm_version,is_alcohol,is_supplement,is_beauty"
  );
  fetchUrl.searchParams.set("is_alcohol", "eq.false");
  fetchUrl.searchParams.set("is_beauty", "eq.false");
  fetchUrl.searchParams.set("order", "barcode.asc");
  fetchUrl.searchParams.set("offset", String(offset));
  fetchUrl.searchParams.set("limit", String(limit));

  let rows: CacheRow[];
  try {
    const res = await fetch(fetchUrl.toString(), {
      headers: baseHeaders,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Supabase fetch failed: ${res.status} ${await res.text()}` },
        { status: 502 }
      );
    }
    rows = await res.json();
  } catch (e) {
    return NextResponse.json({ error: `Fetch error: ${e}` }, { status: 502 });
  }

  let rescored = 0;
  let unchanged = 0;
  let skipped = 0;
  let errors = 0;
  const scoredAt = new Date().toISOString();

  for (const row of rows) {
    if (
      !row.nutrition_data ||
      Object.keys(row.nutrition_data).length === 0
    ) {
      skipped++;
      continue;
    }

    try {
      const cats = tryParseCategories(row.categories);
      const result = computeScore(row.nutrition_data, row.ingredients_text ?? "", {
        categoriesTags: cats,
        novaGroup: row.nova_group ?? undefined,
      });
      const gated = applyScoringGate(result.finalScore, {
        barcode: row.barcode,
        productName: row.product_name ?? "",
        brand: row.brand,
        ingredientsText: row.ingredients_text,
        categoriesTags: cats,
        novaGroup: row.nova_group,
        nutriments: row.nutrition_data,
      });

      // Only write if score changed or algorithm_version is stale
      const scoreChanged = gated.score !== row.gorilla_score || gated.grade !== row.score_grade;
      const versionStale = row.algorithm_version !== ALGO_VERSION;

      if (!scoreChanged && !versionStale) {
        unchanged++;
        continue;
      }

      if (!dryRun) {
        const patchUrl = new URL(`${supabaseUrl}/rest/v1/gorilla_product_cache`);
        patchUrl.searchParams.set("barcode", `eq.${row.barcode}`);
        const patchRes = await fetch(patchUrl.toString(), {
          method: "PATCH",
          headers: baseHeaders,
          body: JSON.stringify({
            gorilla_score: gated.score,
            score_grade: gated.grade,
            algorithm_version: ALGO_VERSION,
            scored_at: scoredAt,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!patchRes.ok && patchRes.status !== 204) {
          errors++;
          continue;
        }
      }
      rescored++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    success: true,
    offset,
    limit,
    dry_run: dryRun,
    algorithm_version: ALGO_VERSION,
    stats: {
      processed: rows.length,
      rescored,
      unchanged,
      skipped,
      errors,
      next_offset: rows.length < limit ? null : offset + limit,
      done: rows.length < limit,
    },
  });
}
