import { type NextRequest, NextResponse } from "next/server";
import { batchUpsertProductCache, logImportRun } from "../../../scan/lib/productCache";
import { buildOffRow, ALGO_VERSION } from "../../../scan/lib/productClassify";
import { CURATED_BARCODE_SET } from "../../../scan/lib/curatedScores";

function normBarcode(b: string): string {
  return b.replace(/\D/g, "").replace(/^0+/, "") || "0";
}

/**
 * POST /api/admin/import-off
 *
 * Triggers a paginated bulk import from Open Food Facts Canada.
 * Body (JSON): { pages?: number }  — defaults to 8 (~8 000 products, safe within 300s).
 *   Max allowed: 200. To import the full dataset use scripts/import-canada.ts locally.
 *
 * Auth: header x-admin-key or ?key= must match ADMIN_API_KEY env var.
 * ADMIN_API_KEY must always be set — the endpoint is never open without it.
 */

const OFF_SEARCH_URL =
  "https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=canada&json=1&page_size=1000&page=";

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

  let maxPages = 8;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.pages === "number") maxPages = Math.min(body.pages, 200);
  } catch {
    // Use default
  }

  const startedAt = Date.now();
  let total = 0, food = 0, alcoholCount = 0, suppl = 0, withNutr = 0, withoutNutr = 0;
  let curatedSkipped = 0;
  let pagesCompleted = 0;
  let abortReason: string | null = null;

  for (let page = 1; page <= maxPages; page++) {
    let products: Record<string, unknown>[];
    try {
      const res = await fetch(`${OFF_SEARCH_URL}${page}`, {
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        abortReason = `OFF returned HTTP ${res.status} on page ${page}`;
        console.warn(`[import-off] ${abortReason} — skipping page`);
        continue;
      }
      const data = await res.json() as { products?: Record<string, unknown>[] };
      products = data.products ?? [];
    } catch (fetchErr) {
      abortReason = `Fetch error on page ${page}: ${fetchErr}`;
      console.error(`[import-off] ${abortReason} — stopping`);
      break;
    }
    if (products.length === 0) break;

    const rows: NonNullable<ReturnType<typeof buildOffRow>>[] = [];
    for (const p of products) {
      const code = (p.code as string) ?? "";
      if (code && CURATED_BARCODE_SET.has(normBarcode(code))) {
        curatedSkipped++;
        continue;
      }
      const row = buildOffRow(p);
      if (!row) continue;
      rows.push(row);
      total++;
      if (row.is_alcohol) alcoholCount++;
      else if (row.is_supplement) suppl++;
      else food++;
      if (row.nutrition_data) withNutr++; else withoutNutr++;
    }

    if (rows.length > 0) {
      await batchUpsertProductCache(rows);
    }
    pagesCompleted++;
  }

  const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

  await logImportRun({
    total_processed: total,
    food_count: food,
    alcohol_count: alcoholCount,
    supplement_count: suppl,
    with_nutrition: withNutr,
    without_nutrition: withoutNutr,
    duration_seconds: durationSeconds,
    notes: `API import — ${pagesCompleted}/${maxPages} pages | algo ${ALGO_VERSION} | ${curatedSkipped} curated protected${abortReason ? ` | abort: ${abortReason}` : ""}`,
  });

  return NextResponse.json({
    success: true,
    duration_seconds: durationSeconds,
    pages_completed: pagesCompleted,
    pages_requested: maxPages,
    abort_reason: abortReason,
    algorithm_version: ALGO_VERSION,
    stats: {
      total_processed: total,
      food_count: food,
      alcohol_count: alcoholCount,
      supplement_count: suppl,
      with_nutrition: withNutr,
      without_nutrition: withoutNutr,
      curated_skipped: curatedSkipped,
    },
  });
}
