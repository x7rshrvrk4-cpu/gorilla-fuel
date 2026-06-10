/*
 * SQL — run once in the Supabase SQL Editor to provision the product cache tables.
 *
 * ── 1. Main product cache ────────────────────────────────────────────────────
 *
 * create table if not exists public.gorilla_product_cache (
 *   id               uuid        primary key default gen_random_uuid(),
 *   barcode          text        not null unique,
 *   product_name     text,
 *   brand            text,
 *   categories       text,          -- JSON-encoded string[] of category tags
 *   ingredients_text text,
 *   nutrition_data   jsonb,         -- Nutriments object (OFF field names)
 *   gorilla_score    integer,
 *   score_grade      text,
 *   nova_group       integer,
 *   data_source      text,
 *   image_url        text,
 *   is_alcohol       boolean not null default false,
 *   is_supplement    boolean not null default false,
 *   is_beauty        boolean not null default false,
 *   created_at       timestamptz not null default now(),
 *   last_scanned_at  timestamptz not null default now(),
 *   scan_count       integer     not null default 1
 * );
 *
 * create index if not exists gorilla_product_cache_barcode_idx
 *   on public.gorilla_product_cache (barcode);
 * create index if not exists gorilla_product_cache_scan_count_idx
 *   on public.gorilla_product_cache (scan_count desc);
 * create index if not exists gorilla_product_cache_last_scanned_idx
 *   on public.gorilla_product_cache (last_scanned_at desc);
 *
 * alter table public.gorilla_product_cache enable row level security;
 * create policy "Public read cache"
 *   on public.gorilla_product_cache for select to anon using (true);
 * create policy "Public insert cache"
 *   on public.gorilla_product_cache for insert to anon with check (true);
 * create policy "Public update cache"
 *   on public.gorilla_product_cache for update to anon using (true);
 *
 * -- Atomic scan-count increment via RPC (avoids read-modify-write races).
 * create or replace function public.increment_product_scan_count(p_barcode text)
 * returns void language plpgsql security definer as $$
 * begin
 *   update public.gorilla_product_cache
 *   set    scan_count      = scan_count + 1,
 *          last_scanned_at = now()
 *   where  barcode = p_barcode;
 * end;
 * $$;
 *
 * ── 2. Import log ────────────────────────────────────────────────────────────
 *
 * create table if not exists public.gorilla_import_log (
 *   id                uuid        primary key default gen_random_uuid(),
 *   imported_at       timestamptz not null default now(),
 *   total_processed   integer     not null default 0,
 *   food_count        integer     not null default 0,
 *   alcohol_count     integer     not null default 0,
 *   supplement_count  integer     not null default 0,
 *   with_nutrition    integer     not null default 0,
 *   without_nutrition integer     not null default 0,
 *   duration_seconds  integer,
 *   notes             text
 * );
 *
 * alter table public.gorilla_import_log enable row level security;
 * create policy "Anon insert import log"
 *   on public.gorilla_import_log for insert to anon with check (true);
 * create policy "Anon read import log"
 *   on public.gorilla_import_log for select to anon using (true);
 */

import type { Nutriments } from "./scoring";

export type CachedProduct = {
  id: string;
  barcode: string;
  product_name: string | null;
  brand: string | null;
  /** JSON-encoded string[] — parse with tryParseCategories() */
  categories: string | null;
  ingredients_text: string | null;
  nutrition_data: Nutriments | null;
  gorilla_score: number | null;
  score_grade: string | null;
  nova_group: number | null;
  data_source: string | null;
  image_url: string | null;
  is_alcohol: boolean;
  is_supplement: boolean;
  is_beauty: boolean;
  created_at: string;
  last_scanned_at: string;
  scan_count: number;
};

export type ImportLogEntry = {
  total_processed: number;
  food_count: number;
  alcohol_count: number;
  supplement_count: number;
  with_nutrition: number;
  without_nutrition: number;
  duration_seconds?: number;
  notes?: string;
};

const CACHE_TABLE = "gorilla_product_cache";
const LOG_TABLE   = "gorilla_import_log";

function sbUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}
function sbKey(): string {
  // Import scripts may set SUPABASE_SERVICE_ROLE_KEY for higher write throughput.
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  );
}
function baseHeaders() {
  return {
    apikey: sbKey(),
    Authorization: `Bearer ${sbKey()}`,
    "Content-Type": "application/json",
  };
}

/** Parse the stored JSON categories string back to string[]. Never throws. */
export function tryParseCategories(categories: string | null): string[] {
  if (!categories) return [];
  try {
    return JSON.parse(categories) as string[];
  } catch {
    return [];
  }
}

// ── Read ─────────────────────────────────────────────────────────────────────

/** Look up a barcode in the product cache. Returns null if unconfigured/missing/error. */
export async function lookupProductCache(barcode: string): Promise<CachedProduct | null> {
  const url = sbUrl();
  if (!url || !sbKey()) return null;
  try {
    const endpoint = new URL(`${url}/rest/v1/${CACHE_TABLE}`);
    endpoint.searchParams.set("barcode", `eq.${barcode}`);
    endpoint.searchParams.set("limit", "1");
    const res = await fetch(endpoint.toString(), {
      headers: baseHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows: CachedProduct[] = await res.json();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** Fields actually returned by getTopScanned (partial select — not the full CachedProduct). */
export type TopScannedProduct = Pick<
  CachedProduct,
  | "barcode"
  | "product_name"
  | "brand"
  | "categories"
  | "gorilla_score"
  | "score_grade"
  | "data_source"
  | "image_url"
  | "is_alcohol"
  | "is_supplement"
  | "scan_count"
  | "last_scanned_at"
>;

/** Fetch top N most-scanned products, optionally filtered to those scanned since a given date. */
export async function getTopScanned(
  limit = 50,
  sinceDate?: Date
): Promise<TopScannedProduct[]> {
  const url = sbUrl();
  if (!url || !sbKey()) return [];
  try {
    const endpoint = new URL(`${url}/rest/v1/${CACHE_TABLE}`);
    endpoint.searchParams.set("order", "scan_count.desc");
    endpoint.searchParams.set("limit", String(limit));
    endpoint.searchParams.set("select", "barcode,product_name,brand,categories,gorilla_score,score_grade,data_source,image_url,is_alcohol,is_supplement,scan_count,last_scanned_at");
    if (sinceDate) {
      endpoint.searchParams.set("last_scanned_at", `gte.${sinceDate.toISOString()}`);
    }
    const res = await fetch(endpoint.toString(), {
      headers: baseHeaders(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── Write ────────────────────────────────────────────────────────────────────

export type UpsertPayload = {
  barcode: string;
  product_name?: string | null;
  brand?: string | null;
  categories?: string | null;
  ingredients_text?: string | null;
  nutrition_data?: Nutriments | null;
  gorilla_score?: number | null;
  score_grade?: string | null;
  nova_group?: number | null;
  data_source?: string | null;
  image_url?: string | null;
  is_alcohol?: boolean;
  is_supplement?: boolean;
  is_beauty?: boolean;
};

/**
 * Upsert a product into the cache (insert on new barcode, merge on conflict).
 * Fire-and-forget safe — swallows all errors, never throws.
 */
export async function upsertProductCache(payload: UpsertPayload): Promise<void> {
  const url = sbUrl();
  if (!url || !sbKey()) return;
  try {
    await fetch(`${url}/rest/v1/${CACHE_TABLE}`, {
      method: "POST",
      headers: {
        ...baseHeaders(),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        ...payload,
        last_scanned_at: new Date().toISOString(),
      }),
    });
  } catch {
    // Non-critical — never propagate
  }
}

/**
 * Upsert many rows in one request. Used by the bulk import script.
 * Returns number of rows successfully processed.
 */
export async function batchUpsertProductCache(rows: UpsertPayload[]): Promise<number> {
  if (rows.length === 0) return 0;
  const url = sbUrl();
  if (!url || !sbKey()) return 0;
  try {
    const res = await fetch(`${url}/rest/v1/${CACHE_TABLE}`, {
      method: "POST",
      headers: {
        ...baseHeaders(),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    });
    return res.ok ? rows.length : 0;
  } catch {
    return 0;
  }
}

/** Atomically increment scan_count and update last_scanned_at via Postgres RPC. */
export async function incrementScanCount(barcode: string): Promise<void> {
  const url = sbUrl();
  if (!url || !sbKey()) return;
  try {
    await fetch(`${url}/rest/v1/rpc/increment_product_scan_count`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ p_barcode: barcode }),
    });
  } catch {
    // Non-critical
  }
}

/** Append a row to the import log after a bulk import run. */
export async function logImportRun(entry: ImportLogEntry): Promise<void> {
  const url = sbUrl();
  if (!url || !sbKey()) return;
  try {
    await fetch(`${url}/rest/v1/${LOG_TABLE}`, {
      method: "POST",
      headers: { ...baseHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(entry),
    });
  } catch {
    // Non-critical
  }
}
