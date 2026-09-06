import type { Metadata } from "next";
import {
  getBcLiquor,
  getBcLiquorCounts,
  getBcLiquorFilteredCount,
  getBcCountries,
  BC_KINDS,
  WINE_STYLES,
  SWEETNESS_BUCKETS,
  BEER_TIERS,
  type BcFilters,
} from "../lib/bcLiquor";
import BcLiquorClient from "./BcLiquorClient";
import { matchedCuratedBeer } from "./bcBeerMatches";
import type { AlcoholRankingProduct } from "../alcohol/lib/products";

export const metadata: Metadata = {
  title: "BC Liquor Catalogue — Gorilla Fuel",
  description:
    "Browse the British Columbia Liquor Distribution Branch (BCLDB) product list — 8,000+ wines, spirits, beers and coolers with ABV, price and origin. Filter by BC-made, wine style, craft-beer tier, sweetness and country. BC availability — separate from the Ontario rankings.",
  alternates: { canonical: "/bc-liquor" },
};

// ISR-cached fetches; page renders dynamically per filter (reads searchParams).
export const revalidate = 3600;

const LIMIT = 500;

type SP = {
  kind?: string;
  bc?: string;
  style?: string;
  sweet?: string;
  tier?: string;
  country?: string;
};

export default async function BcLiquorPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  // Validate every param against the known facet vocab (ignore anything unrecognized).
  const kind = sp.kind && (BC_KINDS as readonly string[]).includes(sp.kind) ? sp.kind : null;
  const bcWine = sp.bc === "1" && (kind === "wine" || kind === null);
  const style = sp.style && WINE_STYLES.some((s) => s.key === sp.style) ? sp.style : null;
  const sweet = sp.sweet && SWEETNESS_BUCKETS.some((s) => s.key === sp.sweet) ? sp.sweet : null;
  const tier = sp.tier && BEER_TIERS.some((t) => t.key === sp.tier) ? sp.tier : null;
  const country = sp.country ? sp.country : null;

  const filters: BcFilters = { kind, bcWine, style, sweet, tier, country };

  const [counts, countries, rows, filteredTotal] = await Promise.all([
    getBcLiquorCounts(),
    getBcCountries(),
    getBcLiquor(filters, LIMIT),
    getBcLiquorFilteredCount(filters),
  ]);

  // Resolve the confirmed static beer matches for the visible rows (server-side, so
  // the full ALCOHOL_PRODUCTS catalogue stays out of the client bundle). Only the
  // matched curated products — keyed by the bc_liquor product_name — are serialized.
  const matches: Record<string, AlcoholRankingProduct> = {};
  for (const r of rows) {
    if (!r.product_name || matches[r.product_name]) continue;
    const m = matchedCuratedBeer(r.product_name);
    if (m) matches[r.product_name] = m;
  }

  return (
    <BcLiquorClient
      counts={counts}
      countries={countries}
      rows={rows}
      filters={filters}
      filteredTotal={filteredTotal}
      limit={LIMIT}
      matches={matches}
    />
  );
}
