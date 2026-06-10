import { type NextRequest, NextResponse } from "next/server";

export type NihDsldIngredient = {
  ingredientName: string;
  amount?: number;
  unit?: string;
};

export type NihDsldProduct = {
  productId?: number;
  productName: string;
  brandName?: string;
  servingSize?: string;
  servingsPerContainer?: string | number;
  labelStatement?: string;
  dietaryIngredients?: NihDsldIngredient[];
  otherIngredients?: string;
  certifications?: string[];
};

type DsldApiResponse = {
  data?: {
    dsldId?: number;
    productName?: string;
    brandName?: string;
    servingSize?: string;
    servingsPerContainer?: string | number;
    labelStatement?: string;
    dietaryIngredients?: { ingredientName?: string; amount?: number; unit?: string }[];
    otherIngredients?: string;
    certifications?: { name?: string }[];
  };
};

/**
 * Server-side proxy to the NIH Dietary Supplement Label Database (DSLD).
 * No API key required — public government database.
 * Returns supplement label data: product name, brand, serving size, ingredients, certifications.
 *
 * GET /api/nihdsl?barcode=<barcode>
 * Returns NihDsldProduct, or null if not found.
 */
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://api.ods.od.nih.gov/dsld/v8/label?upc=${encodeURIComponent(barcode)}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return NextResponse.json(null);

    const raw: DsldApiResponse = await res.json();
    const d = raw?.data;
    if (!d?.productName) return NextResponse.json(null);

    const product: NihDsldProduct = {
      productId: d.dsldId,
      productName: d.productName,
      brandName: d.brandName ?? undefined,
      servingSize: d.servingSize ?? undefined,
      servingsPerContainer: d.servingsPerContainer ?? undefined,
      labelStatement: d.labelStatement ?? undefined,
      dietaryIngredients: (d.dietaryIngredients ?? [])
        .filter((i) => i.ingredientName)
        .map((i) => ({
          ingredientName: i.ingredientName!,
          amount: i.amount,
          unit: i.unit,
        })),
      otherIngredients: d.otherIngredients ?? undefined,
      certifications: (d.certifications ?? []).map((c) => c.name ?? "").filter(Boolean),
    };

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(null);
  }
}
