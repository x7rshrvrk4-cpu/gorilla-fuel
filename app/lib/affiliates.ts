/**
 * Single source of truth for affiliate link builders.
 *
 * NOTE: the existing per-section copies (app/intel/lib/products.ts,
 * app/glutenfree/lib/products.ts, app/kids/lib/products.ts, app/page.tsx) are
 * NOT migrated to this module yet — that consolidation is a separate cleanup
 * pass. New code (the fitness section) imports from here.
 */

export const AFFILIATE_TAG = "gorillafuel-20";

/** Amazon.ca tagged affiliate search link. */
export function amazonUrl(query: string): string {
  return `https://www.amazon.ca/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

/** iHerb search link. No iHerb affiliate ref configured yet — plain search. */
export function iherbUrl(query: string): string {
  return `https://www.iherb.com/search?kw=${encodeURIComponent(query)}`;
}

// ─── Supplement-brand affiliates — STUBS (ref param pending) ──────────────────
// We do NOT have real affiliate/ref params for these brands yet, so each returns
// null. Callers MUST treat null as "no link" (render nothing) — never emit a bare,
// untagged brand URL. Do not wire these into any live link until a real ref param
// is supplied and the function is implemented.
// TODO(affiliate): set Legion ref param, then return the tagged URL.
export function legionUrl(_query: string): string | null {
  return null;
}
// TODO(affiliate): set Transparent Labs ref param, then return the tagged URL.
export function transparentLabsUrl(_query: string): string | null {
  return null;
}
// TODO(affiliate): set Thorne ref param, then return the tagged URL.
export function thorneUrl(_query: string): string | null {
  return null;
}
// TODO(affiliate): set MyProtein ref param, then return the tagged URL.
export function myproteinUrl(_query: string): string | null {
  return null;
}
