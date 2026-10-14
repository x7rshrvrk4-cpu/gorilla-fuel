import { type NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "../../../lib/rateLimit";

// Server-side alias lookup (service-role) so anon SELECT on barcode_aliases can be revoked.
export async function GET(req: NextRequest) {
  if (!rateLimit(clientIp(req), "alias-read", 80, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const barcode = req.nextUrl.searchParams.get("b");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!barcode || !/^[0-9A-Za-z._-]{4,32}$/.test(barcode) || !url || !key) {
    return NextResponse.json({ alias: null });
  }
  try {
    const ep = new URL(`${url}/rest/v1/barcode_aliases`);
    ep.searchParams.set("alias_barcode", `eq.${barcode}`);
    ep.searchParams.set("status", "eq.approved");
    ep.searchParams.set("limit", "1");
    const res = await fetch(ep.toString(), {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return NextResponse.json({ alias: null });
    const rows = await res.json();
    return NextResponse.json({ alias: rows[0] ?? null });
  } catch {
    return NextResponse.json({ alias: null });
  }
}
