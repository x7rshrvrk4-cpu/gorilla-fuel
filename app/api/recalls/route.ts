import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENFDA_BASE = "https://api.fda.gov/food/enforcement.json";

export type RecallNotice = {
  productDescription: string;
  reason: string;
  classification: string;
  status: string;
  recallInitiationDate: string;
  stateOrCountry: string;
  url: string;
};

function buildQuery(brand: string | null, productName: string | null): string | null {
  const terms: string[] = [];
  if (brand) terms.push(`product_description:"${brand.replace(/"/g, "")}"`);
  if (productName) {
    const firstWord = productName.trim().split(/\s+/)[0];
    if (firstWord && firstWord.length > 2) {
      terms.push(`product_description:"${firstWord.replace(/"/g, "")}"`);
    }
  }
  if (terms.length === 0) return null;
  return terms.join("+");
}

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand");
  const product = req.nextUrl.searchParams.get("product");

  const search = buildQuery(brand, product);
  if (!search) {
    return NextResponse.json({ recalls: [] satisfies RecallNotice[] });
  }

  try {
    const url = new URL(OPENFDA_BASE);
    url.searchParams.set("search", `(${search})+AND+status:"Ongoing"`);
    url.searchParams.set("limit", "5");

    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) {
      // OpenFDA returns 404 when a search matches nothing — that's "no recalls", not an error.
      return NextResponse.json({ recalls: [] satisfies RecallNotice[] });
    }

    const data = await res.json();
    const results: Record<string, string>[] = data?.results ?? [];

    const recalls: RecallNotice[] = results.map((r) => ({
      productDescription: r.product_description || "",
      reason: r.reason_for_recall || "",
      classification: r.classification || "",
      status: r.status || "",
      recallInitiationDate: r.recall_initiation_date || "",
      stateOrCountry: r.distribution_pattern || r.state || "",
      url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts",
    }));

    return NextResponse.json({ recalls });
  } catch {
    return NextResponse.json({ recalls: [] satisfies RecallNotice[] });
  }
}
