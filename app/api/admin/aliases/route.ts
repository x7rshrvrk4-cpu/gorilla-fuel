import { type NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? "";

function serviceHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
}

function requireAdmin(request: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const provided =
    request.headers.get("x-admin-key") ?? request.nextUrl.searchParams.get("key");
  return provided === ADMIN_API_KEY;
}

/** GET /api/admin/aliases?status=pending — list aliases by status */
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });
  }

  const status = request.nextUrl.searchParams.get("status") ?? "pending";

  try {
    const endpoint = new URL(`${SUPABASE_URL}/rest/v1/barcode_aliases`);
    endpoint.searchParams.set("status", `eq.${status}`);
    endpoint.searchParams.set("order", "created_at.desc");
    endpoint.searchParams.set("limit", "200");

    const res = await fetch(endpoint.toString(), { headers: serviceHeaders() });
    if (!res.ok) {
      return NextResponse.json({ error: "Database error" }, { status: 502 });
    }
    const rows = await res.json();
    return NextResponse.json({ aliases: rows, count: rows.length });
  } catch (e) {
    console.error("[admin/aliases] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** PATCH /api/admin/aliases — approve or reject a pending alias */
export async function PATCH(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { alias_barcode, action } = body;
  if (!alias_barcode || !action) {
    return NextResponse.json({ error: "Missing alias_barcode or action" }, { status: 400 });
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  try {
    const endpoint = new URL(`${SUPABASE_URL}/rest/v1/barcode_aliases`);
    endpoint.searchParams.set("alias_barcode", `eq.${String(alias_barcode)}`);

    const res = await fetch(endpoint.toString(), {
      method: "PATCH",
      headers: { ...serviceHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Database error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, alias_barcode, status: newStatus });
  } catch (e) {
    console.error("[admin/aliases] PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** DELETE /api/admin/aliases — delete an alias (hard delete) */
export async function DELETE(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });
  }

  const alias_barcode = request.nextUrl.searchParams.get("alias_barcode");
  if (!alias_barcode) {
    return NextResponse.json({ error: "Missing alias_barcode" }, { status: 400 });
  }

  try {
    const endpoint = new URL(`${SUPABASE_URL}/rest/v1/barcode_aliases`);
    endpoint.searchParams.set("alias_barcode", `eq.${alias_barcode}`);

    const res = await fetch(endpoint.toString(), {
      method: "DELETE",
      headers: { ...serviceHeaders(), Prefer: "return=minimal" },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Database error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/aliases] DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
