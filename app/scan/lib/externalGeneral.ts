import type { GoUpcProduct } from "../../api/goupc/route";
import type { DrugProduct } from "../../api/drugfacts/route";
import type { NihDsldProduct } from "../../api/nihdsl/route";
import type { OffProduct } from "./openFoodFacts";

export type { GoUpcProduct, DrugProduct, NihDsldProduct };

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

/**
 * Looks up a barcode against the UPCitemdb free product database.
 * No API key required (100 req/day free tier).
 * Returns name, brand, and category — no nutrition scoring possible.
 */
export async function lookupUpcItemDb(barcode: string): Promise<OffProduct | null> {
  try {
    const res = await fetch(`/api/upcitemdb?barcode=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data: OffProduct | null = await res.json();
    return data?.product_name ? data : null;
  } catch {
    return null;
  }
}

/**
 * Looks up a barcode via RapidAPI Barcode Lookup database.
 * Requires RAPIDAPI_KEY env var. Returns product with nutrition data when available.
 */
export async function lookupBarcodeLookup(barcode: string): Promise<OffProduct | null> {
  try {
    const res = await fetch(`/api/barcodelookup?barcode=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data: OffProduct | null = await res.json();
    return data?.product_name ? data : null;
  } catch {
    return null;
  }
}

/**
 * Looks up a barcode against the NIH Dietary Supplement Label Database (DSLD).
 * Free government API — no key required.
 * Returns supplement label data (ingredients, serving size, certifications).
 */
export async function lookupNihDsld(barcode: string): Promise<NihDsldProduct | null> {
  try {
    const res = await fetch(`/api/nihdsl?barcode=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data: NihDsldProduct | null = await res.json();
    return data?.productName ? data : null;
  } catch {
    return null;
  }
}
