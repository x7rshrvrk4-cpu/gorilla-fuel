/**
 * StatsTicker — full-width scrolling stats bar.
 * 5 clean items separated by gold diamond separators.
 * Cache count fetched from Supabase (24-hour ISR). Beer and supplement
 * counts computed live from in-repo arrays.
 */

import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { PRODUCTS } from "../rankings/lib/products";

const BEER_ALCOHOL_COUNT = ALCOHOL_PRODUCTS.filter(
  (p) => p.category !== "Non-Alcoholic"
).length;
const SUPPL_COUNT = PRODUCTS.length;

async function fetchCacheCount(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "";
  if (!url || !key) return 50_000;
  try {
    const res = await fetch(`${url}/rest/v1/gorilla_product_cache?limit=0`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return 50_000;
    const range = res.headers.get("Content-Range");
    if (!range) return 50_000;
    const total = parseInt(range.split("/")[1] ?? "50000", 10);
    return Number.isFinite(total) ? total : 50_000;
  } catch {
    return 50_000;
  }
}

export default async function StatsTicker() {
  const cacheCount = await fetchCacheCount();

  const items: string[] = [
    `📦 ${cacheCount.toLocaleString("en-CA")}+ Products Scored`,
    `🍺 ${BEER_ALCOHOL_COUNT}+ Beer and Alcohol Products`,
    `💊 ${SUPPL_COUNT}+ Supplements Ranked`,
    `🇨🇦 Canadian First`,
    `✓ No Brand Pays for Placement`,
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
