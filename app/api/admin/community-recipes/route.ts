import { type NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? "";

const TABLE = "community_recipes";

function serviceHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
}

function requireAdmin(request: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const provided = request.headers.get("x-admin-key") ?? request.nextUrl.searchParams.get("key");
  return provided === ADMIN_API_KEY;
}

/** GET /api/admin/community-recipes?status=pending — list submissions by status. */
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!SERVICE_KEY) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });

  const status = request.nextUrl.searchParams.get("status") ?? "pending";
  const verified = status === "approved" ? "true" : "false";

  try {
    const endpoint = new URL(`${SUPABASE_URL}/rest/v1/${TABLE}`);
    endpoint.searchParams.set("verified", `eq.${verified}`);
    endpoint.searchParams.set("order", "submitted_at.desc");
    endpoint.searchParams.set("limit", "200");

    const res = await fetch(endpoint.toString(), { headers: serviceHeaders() });
    if (!res.ok) return NextResponse.json({ error: "Database error", detail: await res.text().catch(() => "") }, { status: 502 });
    const rows = await res.json();
    return NextResponse.json({ recipes: rows, count: rows.length });
  } catch (e) {
    console.error("[admin/community-recipes] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** PATCH /api/admin/community-recipes — { id, action: "approve" | "reject" }.
 *  approve → verified=true (kept, ready to promote into the curated library).
 *  reject  → hard-delete the row. */
export async function PATCH(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!SERVICE_KEY) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = body.id;
  const action = body.action;
  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Need id and action ('approve' | 'reject')" }, { status: 400 });
  }

  try {
    const endpoint = new URL(`${SUPABASE_URL}/rest/v1/${TABLE}`);
    endpoint.searchParams.set("id", `eq.${String(id)}`);

    const res = await fetch(endpoint.toString(), {
      method: action === "approve" ? "PATCH" : "DELETE",
      headers: { ...serviceHeaders(), Prefer: "return=minimal" },
      ...(action === "approve" ? { body: JSON.stringify({ verified: true }) } : {}),
    });
    if (!res.ok) return NextResponse.json({ error: "Database error", detail: await res.text().catch(() => "") }, { status: 502 });
    return NextResponse.json({ ok: true, id, action });
  } catch (e) {
    console.error("[admin/community-recipes] PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
