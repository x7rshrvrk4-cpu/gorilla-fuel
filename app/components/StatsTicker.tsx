/**
 * StatsTicker — full-width scrolling stats bar.
 * Counts computed server-side from in-repo arrays + Supabase (ISR).
 * Scans Today is conditional: only shown when count > 100.
 */

import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { PRODUCTS } from "../rankings/lib/products";
import { CURATED_TOTAL } from "../lib/catalogCounts";

const BEER_ALCOHOL_COUNT = ALCOHOL_PRODUCTS.filter(
  (p) => p.category !== "Non-Alcoholic"
).length;

const WINE_COUNT = ALCOHOL_PRODUCTS.filter(
  (p) => p.category === "Wines"
).length;

const SUPPL_COUNT = PRODUCTS.length;

// Number of live external data sources the scanner queries
const DATA_SOURCE_COUNT = 15;

/**
 * Returns the REAL gorilla_product_cache row count, or null when it can't be
 * read (not configured / query fails / empty header / count is 0). We NEVER
 * fabricate an estimate — a null result means the "Products in Database" line is
 * omitted entirely rather than shown as a made-up number or "0+".
 */
async function fetchCacheCount(): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "";
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/gorilla_product_cache?limit=0`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const range = res.headers.get("Content-Range");
    if (!range) return null;
    const total = parseInt(range.split("/")[1] ?? "", 10);
    // Only a real, positive count is shown. 0 / unparseable / unreadable → null
    // → the line is omitted (no fabricated estimate, no "0+").
    return Number.isFinite(total) && total > 0 ? total : null;
  } catch {
    return null;
  }
}

async function fetchScansToday(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "";
  if (!url || !key) return 0;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endpoint = new URL(`${url}/rest/v1/gorilla_product_cache`);
    endpoint.searchParams.set("last_scanned_at", `gte.${today.toISOString()}`);
    endpoint.searchParams.set("limit", "0");
    const res = await fetch(endpoint.toString(), {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 0;
    const range = res.headers.get("Content-Range");
    if (!range) return 0;
    const total = parseInt(range.split("/")[1] ?? "0", 10);
    return Number.isFinite(total) ? total : 0;
  } catch {
    return 0;
  }
}

export default async function StatsTicker() {
  const [cacheCount, scansToday] = await Promise.all([
    fetchCacheCount(),
    fetchScansToday(),
  ]);

  const items: string[] = [
    // Only shown when the cache has a real, readable positive count — never a
    // fabricated estimate, never "0+". Omitted entirely until the DB has data.
    ...(cacheCount !== null ? [`📦 ${cacheCount.toLocaleString("en-CA")}+ Products in Database`] : []),
    `🦍 ${CURATED_TOTAL.toLocaleString("en-CA")}+ Products Curated`,
    `🍺 ${BEER_ALCOHOL_COUNT}+ Beer and Alcohol Products`,
    `🍷 ${WINE_COUNT}+ Wines`,
    `💊 ${SUPPL_COUNT}+ Supplements Ranked`,
    `🔍 ${DATA_SOURCE_COUNT} Live Data Sources`,
    // Only shown when traffic is meaningful — avoids displaying a number that looks low.
    ...(scansToday > 100 ? [`📊 ${scansToday.toLocaleString("en-CA")} Scans Today`] : []),
  ];

  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden border-b border-line bg-surface"
      aria-hidden="true"
    >
      <div className="stats-ticker-track py-2.5">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="mx-6 flex shrink-0 items-center gap-5 whitespace-nowrap text-[14px] leading-tight text-gold"
          >
            {item}
            <span className="text-gold/40 select-none">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
