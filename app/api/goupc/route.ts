import { type NextRequest, NextResponse } from "next/server";

export type GoUpcProduct = {
  barcode: string;
  name: string;
  brand: string;
  image: string | null;
  category: string;
  description: string | null;
};

/**
 * Server-side proxy to the Go-UPC barcode database.
 * 500M+ products worldwide. Free tier: sign up at go-upc.com for an API key.
 * Set GOUPC_API_KEY in Vercel environment variables to enable.
 *
 * GET /api/goupc?barcode=<barcode>
 * Returns a basic product record (name, brand, image, category), or null if not found.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  const apiKey = process.env.GOUPC_API_KEY;
  if (!apiKey) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://go-upc.com/api/v1/code/${encodeURIComponent(barcode)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();
    const p = data?.product;
    if (!p) return NextResponse.json(null);

    const name = p.title ?? p.name;
    if (!name) return NextResponse.json(null);

    const product: GoUpcProduct = {
      barcode,
      name,
      brand: p.brand ?? p.manufacturer ?? "",
      image: p.imageUrl ?? p.image ?? null,
      category: p.category ?? (p.categories?.[0] ?? ""),
      description: p.description ?? null,
    };

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
