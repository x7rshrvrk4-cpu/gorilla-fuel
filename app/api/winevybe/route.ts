import { type NextRequest, NextResponse } from "next/server";

export type WineVybeProduct = {
  name?: string;
  brand?: string;
  abv?: number;
  style?: string;
  country?: string;
};

/**
 * Server-side proxy to the WineVybe beer-by-barcode API via RapidAPI.
 * Requires RAPIDAPI_KEY in environment variables. If the key is absent,
 * returns null immediately so the scan flow falls back gracefully.
 *
 * To enable: add RAPIDAPI_KEY to your Vercel project environment variables.
 * Sign up at https://rapidapi.com and subscribe to the WineVybe API (free tier).
 *
 * GET /api/winevybe?barcode=<barcode>
 * Returns the matched beer product, or null if not found / key not configured.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://winevybe.p.rapidapi.com/beer/barcode/${encodeURIComponent(barcode)}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "winevybe.p.rapidapi.com",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return NextResponse.json(null);

    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return NextResponse.json(null);

    const record = Array.isArray(data) ? data[0] : data;
    if (!record) return NextResponse.json(null);

    const product: WineVybeProduct = {
      name: record?.name ?? record?.beer_name ?? record?.title ?? undefined,
      brand: record?.brand ?? record?.brewery ?? record?.brewer ?? undefined,
      abv:
        typeof record?.abv === "number"
          ? record.abv
          : typeof record?.alcohol === "number"
            ? record.alcohol
            : undefined,
      style: record?.style ?? record?.beer_style ?? undefined,
      country: record?.country ?? undefined,
    };

    if (!product.name) return NextResponse.json(null);

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
