import type { GoUpcProduct } from "../../api/goupc/route";
import type { DrugProduct } from "../../api/drugfacts/route";

export type { GoUpcProduct, DrugProduct };

/**
 * Looks up a barcode against the Go-UPC global product database (500M+ products).
 * Returns basic product info (name, brand, image, category) — no nutrition data.
 * Requires GOUPC_API_KEY env var on the server. Returns null when not configured.
 */
export async function lookupGoUpc(barcode: string): Promise<GoUpcProduct | null> {
  try {
    const res = await fetch(`/api/goupc?barcode=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data: GoUpcProduct | null = await res.json();
    return data?.name ? data : null;
  } catch {
    return null;
  }
}

/**
 * Looks up a barcode against the Open Drug Facts database (OTC drugs and medications).
 * Free public API — same structure as Open Food Facts.
 * Returns basic drug product data, or null if not found.
 */
export async function lookupDrugFacts(barcode: string): Promise<DrugProduct | null> {
  try {
    const res = await fetch(`/api/drugfacts?barcode=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data: DrugProduct | null = await res.json();
    return data?.name ? data : null;
  } catch {
    return null;
  }
}
