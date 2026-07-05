import type { ObfProduct } from "./openBeautyFacts";

/*
 * ── BEAUTY RECALL / SAFETY BANNER (display-only) ──────────────────────────────
 * A curated list of confirmed FDA-posted benzene contamination recalls for
 * AEROSOL / SPRAY sunscreens. This is a DISPLAY-ONLY honesty signal: it NEVER
 * changes a beauty score (computeBeautyScore is untouched). It sits beside the
 * score and adds sourced recall CONTEXT.
 *
 * FRAMING INVARIANT: we never claim the exact scanned unit is recalled — recalls
 * are lot/format-specific. The banner says "similar products in this line have
 * been subject to recalls." So the match keys on brand + product LINE + the
 * spray/aerosol/SPF format token, and the copy is line-level.
 *
 * OVER-MATCH DISCIPLINE (modelled on curatedScores.ts NAME_OVERRIDES): every
 * pattern requires BRAND *and* a sunscreen spray/aerosol/SPF token, so a
 * non-sprayed same-brand product (face wash, lotion, moisturizer) does NOT
 * match. The 2021–2022 benzene recalls were aerosol/spray formats only — the
 * lotion forms of the same lines were NOT recalled and must not flag.
 */

export type RecallNotice = {
  line: string;
  reason: string;
  year: string;
  sourceUrl: string;
  sourceLabel: string;
};

type RecallEntry = { patterns: RegExp[]; recall: RecallNotice };

// J&J recalled Neutrogena + Aveeno aerosol sunscreens on 2021-07-14.
const JNJ_2021_URL =
  "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/johnson-johnson-consumer-inc-issues-voluntary-recall-specific-neutrogena-and-aveeno-aerosol-sunscreen";
// Coppertone recalled specific aerosol spray sunscreens on 2021-09-30.
const COPPERTONE_2021_URL =
  "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/coppertone-issues-voluntary-nationwide-recall-specific-lots-aerosol-sunscreen-spray-products-due";
// Edgewell recalled Banana Boat Hair & Scalp Spray SPF 30 on 2022-07-29.
const BANANA_BOAT_2022_URL =
  "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/edgewell-personal-care-issues-nationwide-voluntary-recall-three-batches-banana-boat-hair-scalp";

const RECALLS: RecallEntry[] = [
  // Neutrogena aerosol spray sunscreens — J&J voluntary recall, 2021-07-14.
  {
    // Format discriminator is spray|aerosol|mist — NOT bare "spf". SPF appears on
    // both the recalled aerosols AND the non-recalled lotion forms of the same
    // line (e.g. Ultra Sheer Face Lotion SPF 60), so an spf token would over-match
    // the lotions. "Body Mist" (the recalled Ultra Sheer format) matches via mist.
    patterns: [
      /neutrogena.*(beach\s*defense|cool\s*dry\s*sport|invisible\s*daily|ultra\s*sheer).*(spray|aerosol|mist)/i,
      /neutrogena.*(spray|aerosol).*sunscreen/i,
    ],
    recall: {
      line: "Neutrogena aerosol spray sunscreens",
      reason: "benzene contamination",
      year: "2021",
      sourceUrl: JNJ_2021_URL,
      sourceLabel: "FDA / Johnson & Johnson voluntary recall (2021)",
    },
  },
  // Aveeno Protect + Refresh aerosol sunscreen — J&J voluntary recall, 2021-07-14.
  {
    // spray|aerosol|mist, not bare spf — same lotion over-match guard as Neutrogena.
    patterns: [
      /aveeno.*(protect|refresh).*(spray|aerosol|mist)/i,
      /aveeno.*(spray|aerosol).*sunscreen/i,
    ],
    recall: {
      line: "Aveeno Protect + Refresh aerosol sunscreen",
      reason: "benzene contamination",
      year: "2021",
      sourceUrl: JNJ_2021_URL,
      sourceLabel: "FDA / Johnson & Johnson voluntary recall (2021)",
    },
  },
  // Coppertone Pure & Simple / Sport aerosol spray sunscreens — Coppertone
  // voluntary recall, 2021-09-30.
  {
    // spray|aerosol|mist, not bare spf — the 2021 Coppertone recall was aerosol
    // sprays only; Sport/Pure & Simple LOTION forms were not recalled, so an spf
    // token would over-match them.
    patterns: [
      /coppertone.*(pure\s*&?\s*simple|sport).*(spray|aerosol|mist)/i,
      /coppertone.*(spray|aerosol).*sunscreen/i,
    ],
    recall: {
      line: "Coppertone Pure & Simple / Sport spray sunscreens",
      reason: "benzene contamination",
      year: "2021",
      sourceUrl: COPPERTONE_2021_URL,
      sourceLabel: "FDA / Coppertone voluntary recall (2021)",
    },
  },
  // Banana Boat Hair & Scalp Spray SPF 30 — Edgewell voluntary recall, 2022-07-29.
  {
    patterns: [/banana\s*boat.*(hair\s*&?\s*scalp|spray).*(spf|sunscreen)/i],
    recall: {
      line: "Banana Boat Hair & Scalp Spray SPF 30",
      reason: "benzene contamination",
      year: "2022",
      sourceUrl: BANANA_BOAT_2022_URL,
      sourceLabel: "FDA / Edgewell voluntary recall (2022)",
    },
  },
];

/**
 * Return the recall notice whose curated brand+format pattern matches this
 * product's brand + name, or null. Matches on `brands` + `product_name`
 * combined and lowercased — mirrors lookupCuratedScore's NAME_OVERRIDES scan
 * (first entry whose patterns.some() hits wins). Display-only; never scores.
 */
export function findBeautyRecall(product: ObfProduct): RecallNotice | null {
  const haystack = `${product.brands ?? ""} ${product.product_name ?? ""}`.trim();
  if (haystack.length < 2) return null;
  for (const entry of RECALLS) {
    if (entry.patterns.some((p) => p.test(haystack))) return entry.recall;
  }
  return null;
}
