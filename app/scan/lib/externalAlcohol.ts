import type { ColaProduct } from "../../api/cola/route";
import type { WineVybeProduct } from "../../api/winevybe/route";

export type FallbackAlcoholProduct = {
  name: string;
  brand: string;
  abv: number | null;
  source: "COLA Cloud" | "WineVybe";
};

/**
 * Looks up a barcode against the TTB COLA Cloud database (US alcohol label registry).
 * Returns a minimal product record if found, or null if the barcode isn't in TTB's system.
 * The TTB database is US-centric — Canadian-only products may not be listed.
 */
export async function lookupColaCloud(barcode: string): Promise<FallbackAlcoholProduct | null> {
  try {
    const res = await fetch(`/api/cola?barcode=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data: ColaProduct | null = await res.json();
    if (!data) return null;

    const name = data.productName ?? data.fancifulName ?? data.brandName;
    if (!name) return null;

    return {
      name,
      brand: data.brandName ?? "",
      abv: data.alcoholContent ?? null,
      source: "COLA Cloud",
    };
  } catch {
    return null;
  }
}

/**
 * Looks up a barcode against WineVybe via RapidAPI.
 * Returns null if the RAPIDAPI_KEY is not configured server-side or the product isn't found.
 */
export async function lookupWineVybe(barcode: string): Promise<FallbackAlcoholProduct | null> {
  try {
    const res = await fetch(`/api/winevybe?barcode=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    const data: WineVybeProduct | null = await res.json();
    if (!data || !data.name) return null;

    return {
      name: data.name,
      brand: data.brand ?? "",
      abv: data.abv ?? null,
      source: "WineVybe",
    };
  } catch {
    return null;
  }
}
