import type { GoUpcProduct } from "../../api/goupc/route";
import type { DrugProduct } from "../../api/drugfacts/route";
import type { NihDsldProduct } from "../../api/nihdsl/route";
import type { OffProduct } from "./openFoodFacts";
import { scanLog, sinceMs, describeFetchError } from "./scanLog";

export type { GoUpcProduct, DrugProduct, NihDsldProduct };

/**
 * Looks up a barcode against the Go-UPC global product database (500M+ products).
 * Returns basic product info (name, brand, image, category) — no nutrition data.
 * Requires GOUPC_API_KEY env var on the server. Returns null when not configured.
 */
export async function lookupGoUpc(barcode: string): Promise<GoUpcProduct | null> {
  const url = `/api/goupc?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`Go-UPC → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`Go-UPC ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: GoUpcProduct | null = await res.json();
    const product = data?.name ? data : null;
    scanLog(`Go-UPC ${product ? "✓" : "✗"} HTTP ${res.status} in ${sinceMs(t0)}ms — ${product ? `usable product: ${product.name}` : "no usable product"}`);
    return product;
  } catch (err) {
    scanLog(`Go-UPC ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}

/**
 * Looks up a barcode against the Open Drug Facts database (OTC drugs and medications).
 * Free public API — same structure as Open Food Facts.
 * Returns basic drug product data, or null if not found.
 */
export async function lookupDrugFacts(barcode: string): Promise<DrugProduct | null> {
  const url = `/api/drugfacts?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`Open Drug Facts → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`Open Drug Facts ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: DrugProduct | null = await res.json();
    const product = data?.name ? data : null;
    scanLog(`Open Drug Facts ${product ? "✓" : "✗"} HTTP ${res.status} in ${sinceMs(t0)}ms — ${product ? `usable product: ${product.name}` : "no usable product"}`);
    return product;
  } catch (err) {
    scanLog(`Open Drug Facts ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}

/**
 * Looks up a barcode against the UPCitemdb free product database.
 * No API key required (100 req/day free tier).
 * Returns name, brand, and category — no nutrition scoring possible.
 */
export async function lookupUpcItemDb(barcode: string): Promise<OffProduct | null> {
  const url = `/api/upcitemdb?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`UPCitemdb → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`UPCitemdb ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: OffProduct | null = await res.json();
    const product = data?.product_name ? data : null;
    scanLog(`UPCitemdb ${product ? "✓" : "✗"} HTTP ${res.status} in ${sinceMs(t0)}ms — ${product ? `usable product: ${product.product_name}` : "no usable product"}`);
    return product;
  } catch (err) {
    scanLog(`UPCitemdb ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}

/**
 * Looks up a barcode via RapidAPI Barcode Lookup database.
 * Requires RAPIDAPI_KEY env var. Returns product with nutrition data when available.
 */
export async function lookupBarcodeLookup(barcode: string): Promise<OffProduct | null> {
  const url = `/api/barcodelookup?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`RapidAPI Barcode Lookup → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`RapidAPI Barcode Lookup ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: OffProduct | null = await res.json();
    const product = data?.product_name ? data : null;
    scanLog(`RapidAPI Barcode Lookup ${product ? "✓" : "✗"} HTTP ${res.status} in ${sinceMs(t0)}ms — ${product ? `usable product: ${product.product_name}` : "no usable product"}`);
    return product;
  } catch (err) {
    scanLog(`RapidAPI Barcode Lookup ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}

/**
 * Looks up a barcode against the NIH Dietary Supplement Label Database (DSLD).
 * Free government API — no key required.
 * Returns supplement label data (ingredients, serving size, certifications).
 */
export async function lookupNihDsld(barcode: string): Promise<NihDsldProduct | null> {
  const url = `/api/nihdsl?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`NIH DSLD → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`NIH DSLD ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: NihDsldProduct | null = await res.json();
    const product = data?.productName ? data : null;
    scanLog(`NIH DSLD ${product ? "✓" : "✗"} HTTP ${res.status} in ${sinceMs(t0)}ms — ${product ? `usable product: ${product.productName}` : "no usable product"}`);
    return product;
  } catch (err) {
    scanLog(`NIH DSLD ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}
