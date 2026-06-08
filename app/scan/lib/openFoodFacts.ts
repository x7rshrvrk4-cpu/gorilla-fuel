import type { Nutriments, ScoringContext } from "./scoring";

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
  labels_tags?: string[];
  countries_tags?: string[];
  serving_size?: string;
  nova_group?: number;
  lang?: string;
};

/** Pulls the serving-size, NOVA, and label/category context the scorer needs straight off an OFF record. */
export function scoringContext(product: OffProduct): ScoringContext {
  return {
    servingSize: product.serving_size,
    novaGroup: product.nova_group,
    labelsTags: product.labels_tags,
    categoriesTags: product.categories_tags,
  };
}

// English-speaking markets — used to keep "healthier alternatives" relevant to
// the shopper rather than surfacing products they can't actually buy or read.
const ENGLISH_SPEAKING_COUNTRIES = new Set([
  "en:united-states",
  "en:canada",
  "en:united-kingdom",
  "en:australia",
  "en:ireland",
  "en:new-zealand",
  "en:south-africa",
]);

function isEnglishOrLocalProduct(product: OffProduct): boolean {
  if (product.lang === "en") return true;
  return (product.countries_tags ?? []).some((tag) => ENGLISH_SPEAKING_COUNTRIES.has(tag));
}

// A product with no nutrition or ingredient data scores a hollow "perfect 100"
// by default — that's not a real comparison, just a blank record. Exclude
// those so "better" alternatives are backed by actual data.
function hasComparableData(product: OffProduct): boolean {
  return Boolean(
    (product.nutriments && Object.keys(product.nutriments).length > 0) ||
      product.ingredients_text ||
      product.ingredients_text_en
  );
}

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
  originalCategories: string[],
  excludeBarcode: string
): Promise<OffProduct[]> {
  try {
    const url = new URL("https://world.openfoodfacts.org/api/v2/search");
    url.searchParams.set("categories_tags", categoryTag);
    url.searchParams.set(
      "fields",
      "code,product_name,brands,image_front_url,image_small_url,ingredients_text,nutriments,categories_tags,labels_tags,countries_tags,serving_size,nova_group,lang"
    );
    url.searchParams.set("page_size", "20");
    url.searchParams.set("sort_by", "unique_scans_n");

    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return [];

    const data = await res.json();
    const products: OffProduct[] = data.products ?? [];

    // OFF's broadest category tags (e.g. "dietary-supplements") cover wildly
    // different product types — sharing just one such tag isn't "the same
    // category" (a magnesium pill isn't an alternative to a greens powder).
    // Require real overlap: at least two shared tags whenever the scanned
    // product has that many to share, so matches reflect genuine kinship.
    const originalSet = new Set(originalCategories);
    const overlapThreshold = Math.min(2, originalSet.size);

    return products.filter((p) => {
      if (!p.code || p.code === excludeBarcode || !p.product_name) return false;
      const candidateTags = p.categories_tags ?? [];
      const sharedCount = candidateTags.filter((tag) => originalSet.has(tag)).length;
      return (
        sharedCount >= overlapThreshold &&
        // Same country (or at least an English-speaking one) so the suggestion is
        // something the shopper can actually find and read the label of.
        isEnglishOrLocalProduct(p) &&
        hasComparableData(p)
      );
    });
  } catch {
    return [];
  }
}

export function primaryCategory(product: OffProduct): string | null {
  const tags = product.categories_tags;
  if (!tags || tags.length === 0) return null;
  // Prefer the most specific *English* tag — OFF stores each tag in whichever
  // taxonomy language it has a translation for, so the "most specific" tag can
  // be e.g. "es:bebida-vitaminada", which then pulls in a sea of Spanish
  // products with nothing in common with the scanned item. Walk back from the
  // most specific tag to the first one in the canonical "en:" namespace.
  for (let i = tags.length - 1; i >= 0; i--) {
    if (tags[i]?.startsWith("en:")) return tags[i];
  }
  return tags[tags.length - 1] ?? tags[0];
}

export function productImage(product: OffProduct): string | null {
  return product.image_front_url || product.image_url || product.image_small_url || null;
}
