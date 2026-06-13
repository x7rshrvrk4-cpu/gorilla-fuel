import type { Nutriments, ScoringContext } from "./scoring";

export type OffProduct = {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  brand_owner?: string;
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

/** Pulls the serving-size, NOVA, label/category, and name context the scorer needs straight off an OFF record. */
export function scoringContext(product: OffProduct): ScoringContext {
  return {
    servingSize: product.serving_size,
    novaGroup: product.nova_group,
    labelsTags: product.labels_tags,
    categoriesTags: product.categories_tags,
    productName: resolveProductName(product),
  };
}

// Common French words that appear in bilingual Canadian product names.
// Used to detect when product_name is French-only and fall back to brand.
const FRENCH_NAME_RE = /\b(fromage|craquelins?|ketchup aux|tomates?|salsa avec|gros morceaux|dijon à|ancienne|beurre|lait|crème|poulet|boeuf|légumes?|pommes de terre|avoine|farine|sucre|sel de mer)\b/i;

/**
 * Returns the best English display name for a product.
 * Priority: product_name_en → product_name (English check) → brand + category fallback.
 * Strips bilingual separators (◇ / | →) and drops French-only names.
 */
export function resolveProductName(product: OffProduct): string {
  // 1. Explicit English name field from OFF
  const nameEn = product.product_name_en?.trim();
  if (nameEn) return nameEn;

  const raw = product.product_name?.trim() ?? "";
  if (!raw) return product.brands?.trim() ?? "";

  // 2. Bilingual separator — take the first segment (usually English in Canada)
  const bilingualMatch = raw.match(/^([^◇|/\\]+?)(?:\s*[◇|]|\s*\/\s*[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŸ])/);
  if (bilingualMatch) {
    const first = bilingualMatch[1].trim();
    if (first && !FRENCH_NAME_RE.test(first)) return first;
  }

  // 3. All-caps bilingual concatenation (e.g. "OLD CHEDDAR ◇ VIEUX CHEDDAR") — already handled above.
  // 4. French-only name → fall back to brand
  if (FRENCH_NAME_RE.test(raw)) {
    return product.brands?.trim() || raw;
  }

  return raw;
}

/**
 * Returns the best brand string for a product.
 * Falls back to brand_owner if brands is empty.
 */
export function resolveBrand(product: OffProduct): string {
  return product.brands?.trim() || product.brand_owner?.trim() || "";
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
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(3000) }
    );

    let data: { status?: number; product?: OffProduct } | null = null;
    try {
      data = await res.json();
    } catch {
      // Non-JSON body — fall through to the status-code-based error below.
    }

    // OFF answers with HTTP 404 (not 200) whenever a barcode exists under a
    // *different* product type — e.g. "product found with a different product
    // type: beauty" for cosmetics — but still includes a `status: 0` body. The
    // body is the authoritative "miss" signal here, not the HTTP status code,
    // and a clean miss is exactly when we want to fall back to Open Beauty Facts.
    if (data && data.status !== 1) {
      return { status: "not-found" };
    }

    if (!res.ok || !data?.product) {
      return { status: "error", message: `Open Food Facts returned ${res.status}` };
    }

    return { status: "found", product: data.product };
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
      "code,product_name,product_name_en,brands,brand_owner,image_front_url,image_small_url,ingredients_text,nutriments,categories_tags,labels_tags,countries_tags,serving_size,nova_group,lang"
    );
    url.searchParams.set("page_size", "20");
    url.searchParams.set("sort_by", "unique_scans_n");

    const res = await fetch(url.toString(), { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(1500) });
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

/** Search for alternatives across multiple category levels (most specific → broadest).
 *  Tries up to 4 en: tag levels, relaxing the overlap requirement for parent categories
 *  so narrowly-stocked product types still surface alternatives. */
export async function fetchAlternativesMultiLevel(
  product: OffProduct,
  targetCount = 3
): Promise<OffProduct[]> {
  const originalCategories = product.categories_tags ?? [];

  // OFF stores category tags general → specific; reverse to try most specific first.
  const enTags = originalCategories
    .filter((t) => t.startsWith("en:"))
    .reverse()
    .slice(0, 4);

  if (enTags.length === 0) return [];

  let lastResults: OffProduct[] = [];

  for (let i = 0; i < enTags.length; i++) {
    const tag = enTags[i]!;
    // Most specific level: require full overlap with original categories (strict).
    // Parent levels: only require the tag itself (relaxed — prevents over-filtering).
    const matchCategories = i === 0 ? originalCategories : [tag];
    lastResults = await fetchAlternativesInCategory(tag, matchCategories, product.code);
    if (lastResults.length >= targetCount) return lastResults;
  }

  // Return whatever the broadest search found (may be 0–2 results).
  return lastResults;
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
