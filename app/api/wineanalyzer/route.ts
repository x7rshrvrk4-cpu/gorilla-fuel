import { type NextRequest, NextResponse } from "next/server";

export type WineAnalyzerProduct = {
  name?: string;
  brand?: string;
  abv?: number;
  type?: string;
  region?: string;
  vintage?: string;
};

/**
 * Server-side proxy to the Wine Analyzer API via RapidAPI.
 * Requires RAPIDAPI_KEY env var. Used as a wine-specific fallback after WineVybe.
 *
 * GET /api/wineanalyzer?barcode=<barcode>
 * Returns WineAnalyzerProduct, or null if not found / key not configured.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://wine-analyzer.p.rapidapi.com/wine?barcode=${encodeURIComponent(barcode)}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "wine-analyzer.p.rapidapi.com",
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

    const r = record as Record<string, unknown>;
    const product: WineAnalyzerProduct = {
      name: (r.name ?? r.wine_name ?? r.title) as string | undefined,
      brand: (r.brand ?? r.producer ?? r.winery) as string | undefined,
      abv: typeof r.abv === "number" ? r.abv : typeof r.alcohol === "number" ? r.alcohol : undefined,
      type: (r.type ?? r.wine_type ?? r.color) as string | undefined,
      region: (r.region ?? r.appellation) as string | undefined,
      vintage: (r.vintage ?? r.year) as string | undefined,
    };

    if (!product.name) return NextResponse.json(null);
    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
