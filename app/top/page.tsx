import type { Metadata } from "next";
import Link from "next/link";
import { getTopOverall } from "../lib/topProducts";
import TopProductCard from "../components/TopProductCard";

export const metadata: Metadata = {
  title: "Top Scored — Gorilla Fuel",
  description:
    "The highest-scoring products in the Gorilla Fuel database — the same honest scores the scanner returns, ranked best first.",
  alternates: { canonical: "/top" },
};

// ISR: revalidate hourly. The page is a server component that reads the cache
// once and renders the top 250 — no client fetch, no loading flash.
export const revalidate = 3600;

export default async function TopOverallPage() {
  const products = await getTopOverall(250);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA INTEL</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        Top <span className="text-gold">Scored</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        The {products.length} highest-scoring products in the database, ranked by Gorilla Score then
        protein + fiber density. Same honest scores the scanner returns — nothing editorially hidden.
        Macros shown per 100g. Tap any product for the full breakdown.
      </p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-sm border border-line bg-surface px-6 py-8 text-center">
          <p className="font-display text-xl text-foreground">List unavailable right now</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            We couldn&rsquo;t load the rankings. Try again shortly, or scan a product directly.
          </p>
          <Link
            href="/scan"
            className="mt-5 inline-block rounded-sm bg-gold px-6 py-3 font-display text-sm tracking-widest text-background transition-opacity hover:opacity-90"
          >
            Open Scanner →
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-2">
          {products.map((row, i) => (
            <TopProductCard key={row.barcode} row={row} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
