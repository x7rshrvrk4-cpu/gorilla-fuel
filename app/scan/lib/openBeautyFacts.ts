import { scanLog, sinceMs, describeFetchError } from "./scanLog";

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
 *
 * GATING (see ScanClient raceTierA / raceTierB): this runs in Tier B, which fires
 * when Tier A (Open Food Facts + FatSecret + Nutritionix + UPCitemdb) yields no
 * confident food answer. Note a bare UPCitemdb *identity* hit (name only, empty
 * nutriments) does NOT count as a confident food answer — it is held as a fallback
 * so this beauty lookup still runs, then only used if Tier B also misses. That's
 * what stops a category-blind UPCitemdb match (e.g. a shampoo) from pre-empting
 * Open Beauty Facts and being mis-scored as food.
 */
export async function lookupBeautyBarcode(barcode: string): Promise<ObfLookupResult> {
  const url = `https://world.openbeautyfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const t0 = performance.now();
  scanLog(`Open Beauty Facts → querying ${url}`);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(1500) });

    if (!res.ok) {
      scanLog(`Open Beauty Facts ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return { status: "error", message: `Open Beauty Facts returned ${res.status}` };
    }

    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      scanLog(`Open Beauty Facts ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — not found`);
      return { status: "not-found" };
    }

    scanLog(`Open Beauty Facts ✓ HTTP ${res.status} in ${sinceMs(t0)}ms — usable product: ${(data.product as ObfProduct).product_name ?? "(unnamed)"}`);
    return { status: "found", product: data.product as ObfProduct };
  } catch (err) {
    scanLog(`Open Beauty Facts ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return { status: "error", message: "Couldn't reach Open Beauty Facts. Check your connection." };
  }
}

export function beautyProductImage(product: ObfProduct): string | null {
  return product.image_front_url || product.image_url || product.image_small_url || null;
}
