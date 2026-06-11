import type { OffProduct } from "./openFoodFacts";

/**
 * Looks up a barcode against the USDA FoodData Central branded-food database.
 * Calls the server-side /api/usda proxy (which holds the API key).
 * Returns an OffProduct-shaped object already normalized to per-100g values, or null.
 */
export async function lookupUsda(barcode: string): Promise<OffProduct | null> {
  try {
    const res = await fetch(`/api/usda?barcode=${encodeURIComponent(barcode)}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data: OffProduct | null = await res.json();
    return data?.product_name ? data : null;
  } catch {
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
  try {
    const res = await fetch(`/api/nutritionix?barcode=${encodeURIComponent(barcode)}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data: OffProduct | null = await res.json();
    return data?.product_name ? data : null;
  } catch {
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
  try {
    const res = await fetch(`/api/fatsecret?barcode=${encodeURIComponent(barcode)}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data: OffProduct | null = await res.json();
    return data?.product_name ? data : null;
  } catch {
    return null;
  }
}
