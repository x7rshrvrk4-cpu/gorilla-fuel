import type { OffProduct } from "./openFoodFacts";
import { scanLog, sinceMs, describeFetchError } from "./scanLog";

/**
 * Looks up a barcode against the USDA FoodData Central branded-food database.
 * Calls the server-side /api/usda proxy (which holds the API key).
 * Returns an OffProduct-shaped object already normalized to per-100g values, or null.
 */
export async function lookupUsda(barcode: string): Promise<OffProduct | null> {
  const url = `/api/usda?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`USDA → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`USDA ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: OffProduct | null = await res.json();
    const product = data?.product_name ? data : null;
    scanLog(`USDA ${product ? "✓" : "✗"} HTTP ${res.status} in ${sinceMs(t0)}ms — ${product ? `usable product: ${product.product_name}` : "no usable product"}`);
    return product;
  } catch (err) {
    scanLog(`USDA ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}

/**
 * Looks up a barcode against the Nutritionix branded-food database.
 * Calls the server-side /api/nutritionix proxy (which holds the API keys).
 * Returns an OffProduct-shaped object normalized to per-100g values, or null.
 * Returns null immediately when NUTRITIONIX_APP_ID/KEY env vars are not configured.
 */
export async function lookupNutritionix(barcode: string): Promise<OffProduct | null> {
  const url = `/api/nutritionix?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`Nutritionix → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`Nutritionix ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: OffProduct | null = await res.json();
    const product = data?.product_name ? data : null;
    scanLog(`Nutritionix ${product ? "✓" : "✗"} HTTP ${res.status} in ${sinceMs(t0)}ms — ${product ? `usable product: ${product.product_name}` : "no usable product"}`);
    return product;
  } catch (err) {
    scanLog(`Nutritionix ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}

/**
 * Looks up a barcode against the FatSecret Platform API via OAuth 2.0.
 * Requires FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET env vars.
 * Returns an OffProduct-shaped object with per-serving nutrition data, or null.
 * Never throws — any OAuth or API failure is silently skipped.
 */
export async function lookupFatSecret(barcode: string): Promise<OffProduct | null> {
  const url = `/api/fatsecret?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`FatSecret → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`FatSecret ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: OffProduct | null = await res.json();
    const product = data?.product_name ? data : null;
    scanLog(`FatSecret ${product ? "✓" : "✗"} HTTP ${res.status} in ${sinceMs(t0)}ms — ${product ? `usable product: ${product.product_name}` : "no usable product"}`);
    return product;
  } catch (err) {
    scanLog(`FatSecret ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}
