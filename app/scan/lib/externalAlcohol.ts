import type { ColaProduct } from "../../api/cola/route";
import type { WineVybeProduct } from "../../api/winevybe/route";
import type { WineAnalyzerProduct } from "../../api/wineanalyzer/route";
import { scanLog, sinceMs, describeFetchError } from "./scanLog";

export type FallbackAlcoholProduct = {
  name: string;
  brand: string;
  abv: number | null;
  source: "COLA Cloud" | "WineVybe" | "Wine Analyzer";
};

/**
 * Looks up a barcode against the TTB COLA Cloud database (US alcohol label registry).
 * Returns a minimal product record if found, or null if the barcode isn't in TTB's system.
 * The TTB database is US-centric — Canadian-only products may not be listed.
 */
export async function lookupColaCloud(barcode: string): Promise<FallbackAlcoholProduct | null> {
  const url = `/api/cola?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`COLA Cloud → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`COLA Cloud ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: ColaProduct | null = await res.json();
    if (!data) {
      scanLog(`COLA Cloud ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }

    const name = data.productName ?? data.fancifulName ?? data.brandName;
    if (!name) {
      scanLog(`COLA Cloud ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product (record had no name)`);
      return null;
    }

    scanLog(`COLA Cloud ✓ HTTP ${res.status} in ${sinceMs(t0)}ms — usable product: ${name}`);
    return {
      name,
      brand: data.brandName ?? "",
      abv: data.alcoholContent ?? null,
      source: "COLA Cloud",
    };
  } catch (err) {
    scanLog(`COLA Cloud ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}

/**
 * Looks up a barcode against WineVybe via RapidAPI.
 * Returns null if the RAPIDAPI_KEY is not configured server-side or the product isn't found.
 */
export async function lookupWineVybe(barcode: string): Promise<FallbackAlcoholProduct | null> {
  const url = `/api/winevybe?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`WineVybe → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`WineVybe ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: WineVybeProduct | null = await res.json();
    if (!data || !data.name) {
      scanLog(`WineVybe ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }

    scanLog(`WineVybe ✓ HTTP ${res.status} in ${sinceMs(t0)}ms — usable product: ${data.name}`);
    return {
      name: data.name,
      brand: data.brand ?? "",
      abv: data.abv ?? null,
      source: "WineVybe",
    };
  } catch (err) {
    scanLog(`WineVybe ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}

/**
 * Looks up a barcode against the Wine Analyzer API via RapidAPI.
 * Used as a wine-specific fallback after WineVybe returns no result.
 * Requires RAPIDAPI_KEY env var.
 */
export async function lookupWineAnalyzer(barcode: string): Promise<FallbackAlcoholProduct | null> {
  const url = `/api/wineanalyzer?barcode=${encodeURIComponent(barcode)}`;
  const t0 = performance.now();
  scanLog(`Wine Analyzer → querying ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) {
      scanLog(`Wine Analyzer ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }
    const data: WineAnalyzerProduct | null = await res.json();
    if (!data || !data.name) {
      scanLog(`Wine Analyzer ✗ HTTP ${res.status} in ${sinceMs(t0)}ms — no usable product`);
      return null;
    }

    scanLog(`Wine Analyzer ✓ HTTP ${res.status} in ${sinceMs(t0)}ms — usable product: ${data.name}`);
    return {
      name: data.name,
      brand: data.brand ?? "",
      abv: data.abv ?? null,
      source: "Wine Analyzer",
    };
  } catch (err) {
    scanLog(`Wine Analyzer ✗ ${describeFetchError(err)} in ${sinceMs(t0)}ms`);
    return null;
  }
}
