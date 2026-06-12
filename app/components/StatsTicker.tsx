/**
 * StatsTicker — full-width scrolling stats bar rendered below the nav.
 * Async Server Component: cache count is fetched from Supabase with a
 * 24-hour ISR revalidation. All other counts come from static arrays.
 */

import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { PRODUCTS } from "../rankings/lib/products";
import { KIDS_TOTAL_COUNT } from "../kids/lib/products";
import { GF_FOOD_TOTAL_COUNT } from "../glutenfree/lib/products";

// ── Static counts from in-repo data ──────────────────────────────────────────
const BEER_COUNT   = ALCOHOL_PRODUCTS.filter((p) => p.category !== "Wines").length;
const WINE_COUNT   = ALCOHOL_PRODUCTS.filter((p) => p.category === "Wines").length;
const VQA_COUNT    = ALCOHOL_PRODUCTS.filter((p) => p.ontarioVQA).length;
const GF_COUNT     = ALCOHOL_PRODUCTS.filter((p) => p.glutenStatus === "certified-gf").length;
const SUPPL_COUNT  = PRODUCTS.length;

// ── Hardcoded counts ──────────────────────────────────────────────────────────
const APPROVED_COUNT  = 13;
const STAY_AWAY_COUNT = 18;

// ── Live Supabase cache count (24-hour ISR cache) ────────────────────────────
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
    // PostgREST returns total in Content-Range: "0-0/1234"
    const range = res.headers.get("Content-Range");
    if (!range) return 50_000;
    const total = parseInt(range.split("/")[1] ?? "50000", 10);
    return Number.isFinite(total) ? total : 50_000;
  } catch {
    return 50_000;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default async function StatsTicker() {
  const cacheCount = await fetchCacheCount();

  const items: string[] = [
    `🍺 ${BEER_COUNT} Beer & Alcohol Products`,
    `🍷 ${WINE_COUNT} Wines Ranked`,
    `🍁 ${VQA_COUNT} Ontario VQA Wines`,
    `💊 ${SUPPL_COUNT} Supplements Ranked`,
    `✅ ${APPROVED_COUNT} Gorilla Approved Snacks`,
    `⚠️ ${STAY_AWAY_COUNT} Stay Away Products`,
    `📦 ${cacheCount.toLocaleString("en-CA")} Products Scanned`,
    `🧒 ${KIDS_TOTAL_COUNT} Kids Snacks Reviewed`,
    `✓ ${GF_COUNT} Certified Gluten-Free Drinks`,
    `🌾 ${GF_FOOD_TOTAL_COUNT} Gluten-Free Products Reviewed`,
    `📊 Ontario Top 10 Beer, Wine & RTD Ranked — LCBO Official Data`,
    `🔬 15 Data Sources`,
    `🇨🇦 Canadian First`,
    `✓ No Brand Pays for Placement`,
    `⚡ Scores Update in Real Time`,
    `🦍 Free Forever`,
    `💪 Built for Canadian Athletes`,
    `🔍 Scan Any Barcode Instantly`,
  ];

  // Duplicate so the CSS translateX(-50%) loop is seamless
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
            className="mx-5 flex shrink-0 items-center gap-4 whitespace-nowrap text-[14px] leading-tight text-gold"
          >
            {item}
            <span className="text-gold/35 select-none">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
