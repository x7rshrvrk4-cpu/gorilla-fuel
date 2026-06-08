import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const NHPID_BASE = "https://health-products.canada.ca/api/natural-health-product";

export type NhpVerification = {
  verified: boolean;
  npn?: string;
  brandName?: string;
  licenceStatus?: string;
};

export async function GET(req: NextRequest) {
  const productName = req.nextUrl.searchParams.get("product")?.trim();
  if (!productName) {
    return NextResponse.json({ verified: false } satisfies NhpVerification);
  }

  try {
    const url = new URL(`${NHPID_BASE}/product/`);
    url.searchParams.set("product_name", productName);
    url.searchParams.set("type", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) {
      return NextResponse.json({ verified: false } satisfies NhpVerification);
    }

    const data = await res.json();
    const entries: Record<string, unknown>[] = Array.isArray(data) ? data : [];
    const match = entries[0];

    if (!match || !match.licence_number) {
      return NextResponse.json({ verified: false } satisfies NhpVerification);
    }

    const verification: NhpVerification = {
      verified: true,
      npn: String(match.licence_number),
      brandName: typeof match.product_name === "string" ? match.product_name : undefined,
      licenceStatus: typeof match.status === "string" ? match.status : undefined,
    };

    return NextResponse.json(verification);
  } catch {
    return NextResponse.json({ verified: false } satisfies NhpVerification);
  }
}
