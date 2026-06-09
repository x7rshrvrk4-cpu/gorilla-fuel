import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "../../../rankings/lib/products";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Daily audit job — checks Open FDA for new recalls on every ranked product
 * and Health Canada for advisories on supplement-relevant ingredients, then
 * writes any changes to the `fuel_audit_log` Supabase table so there's always
 * a permanent, queryable trail of what changed, when, and from which source.
 *
 * Supabase is reached over its REST (PostgREST) endpoint with the anon key —
 * no client library required. The `fuel_audit_log` table has row-level security
 * policies that grant the `anon` role insert + select access (see the setup SQL),
 * matching how the gorillasports.ca project is already configured. If
 * SUPABASE_URL / SUPABASE_ANON_KEY aren't set yet, the job still runs its checks
 * and reports findings in the response/log; it just can't persist them until
 * those env vars are set in the Vercel project (Project Settings → Environment
 * Variables).
 */

type AuditLogEntry = {
  date: string;
  product_name: string;
  change_type: string;
  old_value: string;
  new_value: string;
  source_url: string;
};

// Accept both the server-only names and the NEXT_PUBLIC_ names that Vercel
// injects into this project (they are the same credentials, different keys).
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const AUDIT_TABLE = "fuel_audit_log";

function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

async function fetchLatestLogEntry(productName: string, changeType: string): Promise<AuditLogEntry | null> {
  if (!supabaseConfigured()) return null;
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${AUDIT_TABLE}`);
    url.searchParams.set("product_name", `eq.${productName}`);
    url.searchParams.set("change_type", `eq.${changeType}`);
    url.searchParams.set("order", "date.desc");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return null;
    const rows: AuditLogEntry[] = await res.json();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

async function insertLogEntry(entry: AuditLogEntry): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${AUDIT_TABLE}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(entry),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function checkFdaRecalls(productName: string, brand: string): Promise<AuditLogEntry[]> {
  const entries: AuditLogEntry[] = [];
  try {
    const url = new URL("https://api.fda.gov/food/enforcement.json");
    url.searchParams.set("search", `(product_description:"${brand}")+AND+status:"Ongoing"`);
    url.searchParams.set("limit", "3");

    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return entries;

    const data = await res.json();
    const results: Record<string, string>[] = data?.results ?? [];
    if (results.length === 0) return entries;

    const latest = await fetchLatestLogEntry(productName, "fda_recall");
    const fingerprint = results.map((r) => r.recall_number).join(",");
    if (latest?.new_value === fingerprint) return entries;

    entries.push({
      date: new Date().toISOString(),
      product_name: productName,
      change_type: "fda_recall",
      old_value: latest?.new_value ?? "none",
      new_value: fingerprint,
      source_url: "https://api.fda.gov/food/enforcement.json",
    });
  } catch {
    // Network hiccups shouldn't fail the whole job — next run picks it back up.
  }
  return entries;
}

async function checkHealthCanadaAdvisory(ingredientName: string): Promise<AuditLogEntry[]> {
  const entries: AuditLogEntry[] = [];
  try {
    const url = new URL("https://health-products.canada.ca/api/natural-health-product/product/");
    url.searchParams.set("product_name", ingredientName);
    url.searchParams.set("type", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return entries;

    const data = await res.json();
    const entriesFound: Record<string, unknown>[] = Array.isArray(data) ? data : [];
    if (entriesFound.length === 0) return entries;

    const status = String(entriesFound[0]?.status ?? "");
    const latest = await fetchLatestLogEntry(ingredientName, "health_canada_status");
    if (latest?.new_value === status) return entries;

    entries.push({
      date: new Date().toISOString(),
      product_name: ingredientName,
      change_type: "health_canada_status",
      old_value: latest?.new_value ?? "unknown",
      new_value: status,
      source_url: "https://health-products.canada.ca/api/natural-health-product/",
    });
  } catch {
    // Same — degrade quietly, retry next run.
  }
  return entries;
}

export async function GET(req: NextRequest) {
  // Vercel signs cron requests with this header when CRON_SECRET is set —
  // verify it so the endpoint can't be triggered by anyone who finds the URL.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const findings: AuditLogEntry[] = [];

  // 1. Open FDA — check every ranked product's brand for active enforcement actions.
  const seenBrands = new Set<string>();
  for (const product of PRODUCTS) {
    if (seenBrands.has(product.brand)) continue;
    seenBrands.add(product.brand);
    findings.push(...(await checkFdaRecalls(product.name, product.brand)));
  }

  // 2. Health Canada — check supplement-relevant ingredient/product names for status changes.
  const supplementProducts = PRODUCTS.filter((p) => p.category === "Whey Protein" || p.category === "Creatine" || p.category === "BCAAs/EAAs");
  for (const product of supplementProducts) {
    findings.push(...(await checkHealthCanadaAdvisory(product.name)));
  }

  let written = 0;
  for (const entry of findings) {
    if (await insertLogEntry(entry)) written++;
  }

  const summary = {
    ranAt: new Date().toISOString(),
    productsChecked: PRODUCTS.length,
    changesDetected: findings.length,
    changesWritten: written,
    supabaseConfigured: supabaseConfigured(),
    findings,
  };

  if (!supabaseConfigured()) {
    console.warn(
      "[fuel_audit_log] Supabase env vars (SUPABASE_URL, SUPABASE_ANON_KEY) are not set — " +
        "audit findings were computed but not persisted. Findings:",
      JSON.stringify(findings)
    );
  }

  return NextResponse.json(summary);
}
