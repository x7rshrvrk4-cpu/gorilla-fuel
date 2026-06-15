import { type NextRequest, NextResponse } from "next/server";
import { ALCOHOL_PRODUCTS, type AlcoholCategory } from "../../../alcohol/lib/products";

/**
 * POST /api/admin/seed-alcohol
 *
 * Seeds all curated alcohol products that have verified barcodes into
 * gorilla_product_cache with is_curated=true, is_alcohol=true, and a
 * gorilla_score derived from the curated gorillaPour rating.
 *
 * This ensures STEP 0 of the scanner waterfall returns the exact same
 * rating shown on the alcohol ranking pages — no recomputation needed.
 *
 * Auth: x-admin-key header or ?key= must match ADMIN_API_KEY env var.
 *
 * Body (JSON, all optional):
 *   { dry_run?: boolean }
 *
 * Response:
 *   { success, dry_run, seeded, skipped_duplicates, rows }
 */

function checkAuth(request: NextRequest): Response | null {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "ADMIN_API_KEY is not configured." }, { status: 403 });
  }
  const provided =
    request.headers.get("x-admin-key") ??
    new URL(request.url).searchParams.get("key");
  if (provided !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function gorillaPourToScore(pour: number): number {
  if (pour >= 5) return 87;
  if (pour >= 4) return 77;
  if (pour >= 3) return 60;
  if (pour >= 2) return 39;
  return 20;
}

function gorillaPourToGrade(pour: number): string {
  if (pour >= 4) return "Clean Pour";
  if (pour >= 3) return "Moderate";
  if (pour >= 2) return "Heavy";
  return "Avoid";
}

function categoryToTags(category: AlcoholCategory): string[] {
  switch (category) {
    case "Light Beer":      return ["en:alcoholic-beverages", "en:beers", "en:light-beers"];
    case "IPA & Craft Ale": return ["en:alcoholic-beverages", "en:beers", "en:ales"];
    case "Lager":           return ["en:alcoholic-beverages", "en:beers", "en:lagers"];
    case "Hard Seltzer":    return ["en:alcoholic-beverages", "en:hard-seltzers"];
    case "Cider":           return ["en:alcoholic-beverages", "en:ciders"];
    case "Wines":           return ["en:alcoholic-beverages", "en:wines"];
    case "Non-Alcoholic":   return ["en:non-alcoholic-beverages", "en:beers"];
    default:                return ["en:alcoholic-beverages"];
  }
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  let dryRun = false;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.dry_run === "boolean") dryRun = body.dry_run;
  } catch { /* use defaults */ }

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
    Prefer: "resolution=merge-duplicates,return=minimal",
  };

  type RowSummary = { barcode: string; product_name: string; gorilla_score: number; grade: string };
  const rows: RowSummary[] = [];
  const seen = new Map<string, string>();
  let skippedDuplicates = 0;

  const scoredAt = new Date().toISOString();

  for (const product of ALCOHOL_PRODUCTS) {
    if (!product.barcodes || product.barcodes.length === 0) continue;

    const servingMl = product.servingMl ?? 355;
    const nutrition_data = {
      "energy-kcal_100g": ((product.caloriesPerCan ?? 0) / servingMl) * 100,
      carbohydrates_100g: ((product.carbsPerCan ?? 0) / servingMl) * 100,
      sugars_100g: ((product.sugarPerCan ?? 0) / servingMl) * 100,
      alcohol_100g: product.abv,
    };

    const categories = JSON.stringify(categoryToTags(product.category));
    const gorilla_score = gorillaPourToScore(product.gorillaPour);
    const score_grade = gorillaPourToGrade(product.gorillaPour);
    const ingredients_text = product.knownAdditives.length > 0
      ? product.knownAdditives.join(", ")
      : null;

    for (const barcode of product.barcodes) {
      if (seen.has(barcode)) {
        skippedDuplicates++;
        continue;
      }
      seen.set(barcode, product.name);

      if (!dryRun) {
        const payload = {
          barcode,
          product_name: product.name,
          brand: product.brand,
          categories,
          ingredients_text,
          nutrition_data,
          gorilla_score,
          score_grade,
          nova_group: null,
          data_source: "gorilla-curated",
          image_url: null,
          is_alcohol: true,
          is_supplement: false,
          is_beauty: false,
          is_curated: true,
          scored_at: scoredAt,
          algorithm_version: "curated",
        };

        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/gorilla_product_cache`, {
            method: "POST",
            headers: baseHeaders,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10_000),
          });
          if (!res.ok && res.status !== 204) {
            const text = await res.text();
            console.error(`[seed-alcohol] Failed barcode ${barcode}: HTTP ${res.status} — ${text.slice(0, 200)}`);
          }
        } catch (e) {
          console.error(`[seed-alcohol] Fetch error for ${barcode}:`, e);
        }
      }

      rows.push({ barcode, product_name: product.name, gorilla_score, grade: score_grade });
    }
  }

  return NextResponse.json({
    success: true,
    dry_run: dryRun,
    seeded: rows.length,
    skipped_duplicates: skippedDuplicates,
    rows,
  });
}
