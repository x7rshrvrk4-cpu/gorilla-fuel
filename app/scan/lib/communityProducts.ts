/*
 * SQL — run once in the Supabase SQL Editor to provision the community submissions table:
 *
 * create table public.community_alcohol_products (
 *   id                   uuid         primary key default gen_random_uuid(),
 *   barcode              text         not null,
 *   product_name         text         not null,
 *   brand                text         not null default '',
 *   abv                  numeric(5,2) not null,
 *   -- Nutrition fields are nullable: Canadian alcohol labels don't require full disclosure.
 *   -- null means "not disclosed by manufacturer", displayed as — in the UI.
 *   calories_per_serving numeric(6,1),
 *   carbs_per_serving    numeric(5,1),
 *   sugar_per_serving    numeric(5,1),
 *   product_type         text         not null,
 *   submitted_at         timestamptz  not null default now(),
 *   verified             boolean      not null default false
 * );
 *
 * -- Partial index — only verified rows are ever read by the scanner
 * create index community_alcohol_products_barcode_idx
 *   on public.community_alcohol_products (barcode)
 *   where verified = true;
 *
 * -- Row Level Security
 * alter table public.community_alcohol_products enable row level security;
 *
 * -- Anon users can read verified products (live scanner lookup)
 * create policy "Read verified community products"
 *   on public.community_alcohol_products for select
 *   to anon
 *   using (verified = true);
 *
 * -- Anon users can submit new products (always stored as unverified)
 * create policy "Submit community products"
 *   on public.community_alcohol_products for insert
 *   to anon
 *   with check (verified = false);
 */

import type { AlcoholKind } from "./alcoholScoring";
import { REFERENCE_SERVING_ML } from "./alcoholScoring";
import type { Nutriments } from "./scoring";
import { scanLog, sinceMs, describeFetchError } from "./scanLog";

const TABLE = "community_alcohol_products";

function sbUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}
function sbKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
}
function baseHeaders() {
  return {
    apikey: sbKey(),
    Authorization: `Bearer ${sbKey()}`,
    "Content-Type": "application/json",
  };
}

export type CommunityAlcoholProduct = {
  id?: string;
  barcode: string;
  product_name: string;
  brand: string;
  abv: number;
  /** null means the manufacturer did not disclose this value. Displayed as — in the UI. */
  calories_per_serving: number | null;
  /** null means not disclosed. */
  carbs_per_serving: number | null;
  /** null means not disclosed. */
  sugar_per_serving: number | null;
  product_type: string;
  submitted_at?: string;
  verified?: boolean;
};

export const PRODUCT_TYPES = [
  "Beer",
  "Lager",
  "Ale",
  "IPA",
  "Stout",
  "Cider",
  "Hard Seltzer",
  "Wine",
  "Spirits",
  "Other",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export function productTypeToAlcoholKind(productType: string): AlcoholKind {
  switch (productType) {
    case "Wine":
      return "wine";
    case "Spirits":
      return "spirits";
    case "Cider":
      return "cider";
    case "Hard Seltzer":
      return "seltzer";
    default:
      return "beer";
  }
}

export function productTypeToCategories(productType: string): string[] {
  switch (productType) {
    case "Beer":        return ["en:beers"];
    case "Lager":       return ["en:lagers"];
    case "Ale":         return ["en:ales"];
    case "IPA":         return ["en:ipas"];
    case "Stout":       return ["en:stouts"];
    case "Cider":       return ["en:ciders"];
    case "Hard Seltzer":return ["en:hard-seltzers"];
    case "Wine":        return ["en:wines"];
    case "Spirits":     return ["en:spirits"];
    default:            return ["en:alcoholic-beverages"];
  }
}

/** Convert community per-serving data into per-100mL Nutriments for the alcohol scorer. */
export function communityProductToNutriments(
  product: CommunityAlcoholProduct,
  kind: AlcoholKind
): Nutriments {
  const refMl = REFERENCE_SERVING_ML[kind];
  return {
    // null means the field wasn't disclosed — omit from Nutriments so the UI shows —
    ...(product.calories_per_serving !== null && {
      "energy-kcal_100g": Math.round((product.calories_per_serving / refMl) * 1000) / 10,
    }),
    ...(product.carbs_per_serving !== null && {
      carbohydrates_100g: Math.round((product.carbs_per_serving / refMl) * 1000) / 10,
    }),
    alcohol_100g: product.abv,
    // Pass sugar as sugars_serving so the scorer uses it directly without re-scaling
    ...(product.sugar_per_serving !== null && {
      sugars_serving: product.sugar_per_serving,
    }),
  };
}

/**
 * Look up a verified community submission for the given barcode.
 * Returns null if Supabase is not configured, no row exists, or the request fails.
 */
export async function lookupCommunityProduct(
  barcode: string
): Promise<CommunityAlcoholProduct | null> {
  const url = sbUrl();
  const t0 = performance.now();
  if (!url || !sbKey()) {
    scanLog(`Community Submissions → skipped for ${barcode} (Supabase not configured)`);
    return null;
  }
  try {
    const endpoint = new URL(`${url}/rest/v1/${TABLE}`);
    endpoint.searchParams.set("barcode", `eq.${barcode}`);
    endpoint.searchParams.set("verified", "eq.true");
    endpoint.searchParams.set("limit", "1");
    endpoint.searchParams.set("order", "submitted_at.desc");

    scanLog(`Community Submissions → querying ${endpoint.toString()}`);
    const res = await fetch(endpoint.toString(), { headers: baseHeaders() });
    if (!res.ok) {
      scanLog(`Community Submissions ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const rows: CommunityAlcoholProduct[] = await res.json();
    const hit = rows[0] ?? null;
    scanLog(`Community Submissions ${hit ? "✓" : "✗"} HTTP ${res.status} in ${sinceMs(t0)}ms — ${hit ? `verified product: ${hit.product_name}` : "no verified submission"}`);
    return hit;
  } catch (err) {
    scanLog(`Community Submissions ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}

/** Result of a community submission — carries the real HTTP status/message on
 *  failure so the UI can show the true cause (e.g. 401 RLS) instead of a generic
 *  "try again", mirroring the alias submit flow. */
export type SubmitResult = { ok: boolean; status: number | string; message?: string };

/**
 * Submit a new community product. Always stores as verified = false — admin
 * review is required before it appears in scanner results.
 */
export async function submitCommunityProduct(
  data: Omit<CommunityAlcoholProduct, "id" | "submitted_at" | "verified">
): Promise<SubmitResult> {
  const url = sbUrl();
  if (!url || !sbKey()) return { ok: false, status: "config", message: "Database not configured" };
  try {
    const res = await fetch(`${url}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: { ...baseHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ ...data, verified: false }),
    });
    if (res.ok || res.status === 201) return { ok: true, status: res.status };

    // Surface the real PostgREST error (status + message) for diagnosis.
    const text = await res.text().catch(() => "");
    let message = res.statusText || "Unknown error";
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string };
      message = parsed.message ?? parsed.error ?? message;
    } catch {
      if (text) message = text;
    }
    scanLog(`Community Submit ✗ HTTP ${res.status} — ${message}`);
    console.error("[submitCommunityProduct] failed:", res.status, text);
    return { ok: false, status: res.status, message };
  } catch (e) {
    console.error("[submitCommunityProduct] threw:", e);
    return { ok: false, status: "network", message: e instanceof Error ? e.message : "Network error" };
  }
}
