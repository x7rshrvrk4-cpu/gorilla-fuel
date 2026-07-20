import type { Metadata } from "next";
import { getBcLiquor, getBcLiquorCounts, BC_KINDS } from "../lib/bcLiquor";
import BcLiquorClient from "./BcLiquorClient";

export const metadata: Metadata = {
  title: "BC Liquor Catalogue — Gorilla Fuel",
  description:
    "Browse the British Columbia Liquor Distribution Branch (BCLDB) product list — 8,000+ wines, spirits, beers and coolers with ABV, price and origin. British Columbia availability — separate from the Ontario rankings.",
  alternates: { canonical: "/bc-liquor" },
};

// ISR-cached fetches, but the page reads searchParams (kind filter) so it renders
// dynamically per filter. Underlying bc_liquor fetches are revalidated hourly.
export const revalidate = 3600;

const LIMIT = 500;

export default async function BcLiquorPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const activeKind = kind && (BC_KINDS as readonly string[]).includes(kind) ? kind : null;
  const [counts, rows] = await Promise.all([getBcLiquorCounts(), getBcLiquor(activeKind, LIMIT)]);
  return <BcLiquorClient counts={counts} rows={rows} activeKind={activeKind} limit={LIMIT} />;
}
