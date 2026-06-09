import { type NextRequest, NextResponse } from "next/server";

export type ColaProduct = {
  colaId?: string;
  productName?: string;
  brandName?: string;
  fancifulName?: string;
  beverageType?: string;
  alcoholContent?: number;
  serialNumber?: string;
  status?: string;
};

/**
 * Server-side proxy to the TTB COLA Cloud barcode search API.
 * The TTB (US Alcohol and Tobacco Tax and Trade Bureau) maintains a public
 * database of Certificate of Label Approvals — US alcohol product registrations.
 * Free to use, no key required.
 *
 * GET /api/cola?barcode=<barcode>
 * Returns the first matching COLA record, or null if not found.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://api.ttb.gov/colasearch/v1/cola/barcode/${encodeURIComponent(barcode)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 }, // cache 24h
      }
    );

    if (!res.ok) return NextResponse.json(null);

    const data: unknown = await res.json();

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json(null);
    }

    // TTB returns an array of COLA records for a barcode.
    const record = Array.isArray(data) ? data[0] : data;

    const product: ColaProduct = {
      colaId: record?.colaId ?? record?.cola_id ?? undefined,
      productName: record?.productName ?? record?.product_name ?? record?.fancifulName ?? undefined,
      brandName: record?.brandName ?? record?.brand_name ?? undefined,
      fancifulName: record?.fancifulName ?? record?.fanciful_name ?? undefined,
      beverageType: record?.beverageType ?? record?.beverage_type ?? undefined,
      alcoholContent:
        typeof record?.alcoholContent === "number"
          ? record.alcoholContent
          : typeof record?.alcohol_content === "number"
            ? record.alcohol_content
            : undefined,
      serialNumber: record?.serialNumber ?? record?.serial_number ?? undefined,
      status: record?.status ?? undefined,
    };

    if (!product.productName && !product.brandName) return NextResponse.json(null);

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
