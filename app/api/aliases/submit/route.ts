import { type NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? "";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { alias_barcode, parent_product_name, parent_barcode, pack_size } = body;

  if (!alias_barcode || !parent_product_name || !pack_size) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (
    typeof alias_barcode !== "string" ||
    typeof parent_product_name !== "string" ||
    typeof pack_size !== "string"
  ) {
    return NextResponse.json({ error: "Invalid field types" }, { status: 400 });
  }
  if (!/^\d{8,14}$/.test(alias_barcode.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "Invalid barcode — must be 8–14 digits" }, { status: 400 });
  }

  const providedKey = request.headers.get("x-admin-key");
  const isAdmin = Boolean(ADMIN_API_KEY && providedKey === ADMIN_API_KEY);
  const status = isAdmin ? "approved" : "pending";
  const key = isAdmin && SERVICE_KEY ? SERVICE_KEY : ANON_KEY;

  if (!key) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/barcode_aliases`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        alias_barcode: alias_barcode.trim(),
        parent_product_name: parent_product_name.trim(),
        parent_barcode: parent_barcode ? String(parent_barcode).trim() : null,
        pack_size: pack_size.trim(),
        status,
      }),
    });

    if (res.status === 409) {
      return NextResponse.json({ error: "Barcode already registered" }, { status: 409 });
    }
    if (!res.ok) {
      const text = await res.text();
      console.error("[aliases/submit] Supabase error:", res.status, text);
      return NextResponse.json({ error: "Database error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, status }, { status: 201 });
  } catch (e) {
    console.error("[aliases/submit] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
