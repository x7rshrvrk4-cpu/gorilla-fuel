declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID as string | undefined;

export function gtagEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

// ── Named events — keeps call sites tidy ────────────────────────────────────

export function trackBarcodeScanned(barcode: string): void {
  gtagEvent("barcode_scanned", { barcode });
}

// NOTE: the event param is `data_source_tier`, NOT `source` — `source` (like
// medium/campaign/term/content) is a GA4-reserved traffic-source parameter, and
// sending it overwrote session source/medium with the internal data_source value
// (open-food-facts / gorilla-cache / …). The renamed key carries the same value
// without colliding with GA4's referrer/UTM attribution.
export function trackProductFound(dataSourceTier: string, barcode: string, productName?: string): void {
  gtagEvent("product_found", { data_source_tier: dataSourceTier, barcode, product_name: productName });
}

export function trackProductNotFound(barcode: string): void {
  gtagEvent("product_not_found", { barcode });
}

export function trackSupplementRankingViewed(productName: string, brand: string, grade: string): void {
  gtagEvent("supplement_ranking_viewed", { product_name: productName, brand, grade });
}

export function trackAlcoholRankingViewed(): void {
  gtagEvent("alcohol_ranking_viewed");
}

export function trackScanModeAlcohol(barcode: string, productName?: string): void {
  gtagEvent("scan_mode_alcohol", { barcode, product_name: productName });
}

export function trackScanModeFood(barcode: string, productName?: string): void {
  gtagEvent("scan_mode_food", { barcode, product_name: productName });
}
