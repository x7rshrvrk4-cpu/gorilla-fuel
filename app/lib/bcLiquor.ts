// Read-only access to the bc_liquor staging table (BC Liquor Distribution Branch
// product price list, ~8,224 rows). Powers the /bc-liquor browse page.
//
// AUTH: bc_liquor has RLS enabled with NO public policy (service-role-only by
// design — see supabase/bc_liquor.sql), so the anon/publishable key returns zero
// rows. These helpers run ONLY in server components and read with the service-role
// key, which stays on the server and is never shipped to the browser. If the key
// is absent (e.g. a preview env without it set) every helper degrades to empty,
// so the page renders a graceful empty state instead of crashing.

export const BC_REVALIDATE = 3600;

export const BC_KINDS = ["wine", "spirits", "beer", "cider", "refreshment", "other"] as const;
export type BcKind = (typeof BC_KINDS)[number];

export type BcLiquorRow = {
  barcode: string | null;
  product_name: string | null;
  category: string | null;
  kind: string | null;
  abv: number | null;
  price: number | null;
  litres_per_container: number | null;
  country_origin: string | null;
};

export type BcCounts = { total: number; withBarcode: number; byKind: Record<string, number> };

function creds(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // service-role: bypasses RLS, server-only
  return url && key ? { url, key } : null;
}

/** Exact row count for an optional filter, via PostgREST count=exact + Content-Range. */
async function countRows(c: { url: string; key: string }, filter?: [string, string]): Promise<number> {
  const ep = new URL(`${c.url}/rest/v1/bc_liquor`);
  ep.searchParams.set("select", "barcode");
  if (filter) ep.searchParams.set(filter[0], filter[1]);
  const res = await fetch(ep.toString(), {
    headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, Prefer: "count=exact", Range: "0-0" },
    next: { revalidate: BC_REVALIDATE },
  });
  const cr = res.headers.get("content-range"); // e.g. "0-0/8224"
  if (!cr || !cr.includes("/")) return 0;
  const n = parseInt(cr.split("/")[1], 10);
  return Number.isFinite(n) ? n : 0;
}

/** Total, barcode-present, and per-kind counts for the filter tabs. */
export async function getBcLiquorCounts(): Promise<BcCounts> {
  const c = creds();
  if (!c) return { total: 0, withBarcode: 0, byKind: {} };
  try {
    const [total, withBarcode, ...perKind] = await Promise.all([
      countRows(c),
      countRows(c, ["barcode", "not.is.null"]),
      ...BC_KINDS.map((k) => countRows(c, ["kind", `eq.${k}`])),
    ]);
    const byKind: Record<string, number> = {};
    BC_KINDS.forEach((k, i) => (byKind[k] = perKind[i]));
    return { total, withBarcode, byKind };
  } catch {
    return { total: 0, withBarcode: 0, byKind: {} };
  }
}

/**
 * A page of products, optionally filtered by kind, ordered by name. Capped at
 * `limit` (default 500) — the catalogue is ~8,224 rows, far too many to ship to
 * one page; the UI shows "first N of <count>" and offers kind filters to narrow.
 */
export async function getBcLiquor(kind: string | null, limit = 500): Promise<BcLiquorRow[]> {
  const c = creds();
  if (!c) return [];
  try {
    const ep = new URL(`${c.url}/rest/v1/bc_liquor`);
    ep.searchParams.set("select", "barcode,product_name,category,kind,abv,price,litres_per_container,country_origin");
    if (kind && (BC_KINDS as readonly string[]).includes(kind)) ep.searchParams.set("kind", `eq.${kind}`);
    ep.searchParams.set("order", "product_name.asc.nullslast");
    ep.searchParams.set("limit", String(limit));
    const res = await fetch(ep.toString(), {
      headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, Accept: "application/json" },
      next: { revalidate: BC_REVALIDATE },
    });
    if (!res.ok) return [];
    return (await res.json()) as BcLiquorRow[];
  } catch {
    return [];
  }
}
