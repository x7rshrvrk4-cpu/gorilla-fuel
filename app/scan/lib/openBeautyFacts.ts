export type ObfProduct = {
  code: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  image_small_url?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  categories_tags?: string[];
};

export type ObfLookupResult =
  | { status: "found"; product: ObfProduct }
  | { status: "not-found" }
  | { status: "error"; message: string };

/**
 * Open Beauty Facts is the Open Food Facts foundation's sister database for
 * cosmetics — same maintainers, same `/api/v2/product/{barcode}.json` shape.
 * We only reach for it once OFF has confirmed a barcode isn't food/drink, so a
 * scanned shampoo or toothpaste doesn't dead-end at "not in the database."
 */
export async function lookupBeautyBarcode(barcode: string): Promise<ObfLookupResult> {
  try {
    const res = await fetch(
      `https://world.openbeautyfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) {
      return { status: "error", message: `Open Beauty Facts returned ${res.status}` };
    }

    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return { status: "not-found" };
    }

    return { status: "found", product: data.product as ObfProduct };
  } catch {
    return { status: "error", message: "Couldn't reach Open Beauty Facts. Check your connection." };
  }
}

export function beautyProductImage(product: ObfProduct): string | null {
  return product.image_front_url || product.image_url || product.image_small_url || null;
}
