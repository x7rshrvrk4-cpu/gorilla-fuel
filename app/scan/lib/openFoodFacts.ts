import type { Nutriments } from "./scoring";

export type OffProduct = {
  code: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  image_small_url?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  nutriments?: Nutriments;
  categories_tags?: string[];
};

export type LookupResult =
  | { status: "found"; product: OffProduct }
  | { status: "not-found" }
  | { status: "error"; message: string };

export async function lookupBarcode(barcode: string): Promise<LookupResult> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) {
      return { status: "error", message: `Open Food Facts returned ${res.status}` };
    }

    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return { status: "not-found" };
    }

    return { status: "found", product: data.product as OffProduct };
  } catch {
    return { status: "error", message: "Couldn't reach Open Food Facts. Check your connection." };
  }
}

export async function fetchAlternativesInCategory(
  categoryTag: string,
  excludeBarcode: string
): Promise<OffProduct[]> {
  try {
    const url = new URL("https://world.openfoodfacts.org/api/v2/search");
    url.searchParams.set("categories_tags", categoryTag);
    url.searchParams.set("fields", "code,product_name,brands,image_front_url,image_small_url,ingredients_text,nutriments,categories_tags");
    url.searchParams.set("page_size", "16");
    url.searchParams.set("sort_by", "unique_scans_n");

    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return [];

    const data = await res.json();
    const products: OffProduct[] = data.products ?? [];

    return products.filter((p) => p.code && p.code !== excludeBarcode && p.product_name);
  } catch {
    return [];
  }
}

export function primaryCategory(product: OffProduct): string | null {
  if (!product.categories_tags || product.categories_tags.length === 0) return null;
  // Prefer the most specific (last) tag, fall back to the first
  return product.categories_tags[product.categories_tags.length - 1] ?? product.categories_tags[0];
}

export function productImage(product: OffProduct): string | null {
  return product.image_front_url || product.image_url || product.image_small_url || null;
}
