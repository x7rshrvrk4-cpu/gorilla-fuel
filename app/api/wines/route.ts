import { type NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "../../lib/rateLimit";
import { getLcboWine, lcboWineCount, searchLcboWines } from "../../alcohol/lib/lcboWines.server";

/**
 * GET /api/wines?q=<query>[&limit=N]  → { hits, total }   (LCBO wines not in the curated catalogue)
 * GET /api/wines?id=<wine-lcbo-NNN>   → { wine }           (one full wine, for deep links)
 * GET /api/wines?count=1              → { count }
 * The catalogue lives server-side so it never ships in client JavaScript.
 */
export async function GET(request: NextRequest) {
  if (!rateLimit(clientIp(request), "wines", 90, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const sp = request.nextUrl.searchParams;
  const cacheHeaders = { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" };

  if (sp.get("count")) return NextResponse.json({ count: lcboWineCount() }, { headers: cacheHeaders });

  const id = sp.get("id");
  if (id) {
    if (!/^wine-(lcbo|wr)-\d{1,10}$/.test(id)) return NextResponse.json({ wine: null }, { status: 400 });
    return NextResponse.json({ wine: getLcboWine(id) }, { headers: cacheHeaders });
  }

  const q = sp.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 80) return NextResponse.json({ hits: [], total: 0 });
  const limitParam = parseInt(sp.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 300) : 6;
  return NextResponse.json(searchLcboWines(q, limit), { headers: cacheHeaders });
}
