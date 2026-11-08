import "server-only";
import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { lcboWineCount } from "../alcohol/lib/lcboWines.server";

/** Real gorilla_product_cache row count, or null when it can't be read. Never an estimate. */
async function fetchCacheCount(): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/gorilla_product_cache?limit=0`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const range = res.headers.get("Content-Range");
    if (!range) return null;
    const total = parseInt(range.split("/")[1] ?? "", 10);
    return Number.isFinite(total) && total > 0 ? total : null;
  } catch {
    return null;
  }
}

/** Round down so the "+" is always true: 46,085 -> 46,000; 14,616 -> 14,600. */
const floorTo = (n: number, step: number) => Math.floor(n / step) * step;

export const DATA_SOURCE_COUNT = 15;

export async function getHeroStats(): Promise<{ wines: number; products: number | null; sources: number }> {
  const cache = await fetchCacheCount();
  const wines = ALCOHOL_PRODUCTS.filter((p) => p.category === "Wines").length + lcboWineCount();
  return { wines: floorTo(wines, 100), products: cache === null ? null : floorTo(cache, 1000), sources: DATA_SOURCE_COUNT };
}
