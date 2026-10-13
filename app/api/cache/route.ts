import { type NextRequest, NextResponse } from "next/server";
import {
  lookupProductCache,
  upsertProductCache,
  incrementScanCount,
  type UpsertPayload,
} from "../../scan/lib/productCache";
import { rateLimit, clientIp } from "../../lib/rateLimit";

/**
 * Server-side proxy for the product cache. The browser talks to THIS route (same
 * origin, rate-limited) instead of hitting Supabase directly with the public key.
 * Server-side, the imported productCache functions use the service-role key, so
 * once anon access to gorilla_product_cache is revoked (see productCache.ts SQL),
 * the cache can no longer be bulk-dumped or rewritten with the public key.
 */

// GET /api/cache?b=<barcode> — single-barcode lookup (one row).
export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(ip, "cache-read", 80, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const barcode = req.nextUrl.searchParams.get("b");
  if (!barcode || !/^[0-9A-Za-z._-]{4,32}$/.test(barcode)) {
    return NextResponse.json({ product: null });
  }
  const product = await lookupProductCache(barcode);
  return NextResponse.json({ product });
}

// POST /api/cache — { op: "upsert", payload } | { op: "increment", barcode }
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(ip, "cache-write", 50, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body: { op?: string; payload?: UpsertPayload; barcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body.op === "upsert" && body.payload && typeof body.payload.barcode === "string") {
    await upsertProductCache(body.payload);
  } else if (body.op === "increment" && typeof body.barcode === "string") {
    await incrementScanCount(body.barcode);
  } else {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
