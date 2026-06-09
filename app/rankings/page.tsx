"use client";

import { useMemo, useState } from "react";
import CrossLinkBanner from "../components/CrossLinkBanner";
import MethodologyModal from "../components/MethodologyModal";
import ProductCard from "./components/ProductCard";
import {
  CATEGORIES,
  GRADE_COLORS,
  GRADE_LEGEND,
  GRADE_RANK,
  PRODUCTS,
  type Category,
} from "./lib/products";

type FilterKey = "all" | "top" | "tested" | "value";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "top", label: "S & A+ Only" },
  { key: "tested", label: "3rd Party Tested" },
  { key: "value", label: "Under $1 / Serving" },
];

export default function RankingsPage() {
  const [category, setCategory] = useState<Category>("Creatine");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const products = useMemo(() => {
    return PRODUCTS.filter((p) => p.category === category)
      .filter((p) => {
        switch (filter) {
          case "top":
            return p.grade === "S" || p.grade === "A+";
          case "tested":
            return p.thirdPartyTested;
          case "value":
            return p.pricePerServing < 1;
          default:
            return true;
        }
      })
      .sort((a, b) => GRADE_RANK[b.grade] - GRADE_RANK[a.grade] || a.pricePerServing - b.pricePerServing);
  }, [category, filter]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        <p className="font-display text-sm tracking-[0.3em] text-gold">SUPPLEMENT INTELLIGENCE HUB</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          The Rankings.
        </h1>
        <p className="mt-4 text-muted">
          80+ products, 10 categories, zero sponsorships. Every entry gets the
          full Gorilla Analysis treatment — purity, pricing, pros, cons, and
          the certifications that actually matter.
        </p>
        <button
          type="button"
          onClick={() => setMethodologyOpen(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-sm border border-gold-dim px-4 py-2 font-display text-sm tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-background"
        >
          How We Score
        </button>
      </div>

      {/* CATEGORY TABS */}
      <div className="mt-10 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-sm px-5 py-2.5 font-display text-lg tracking-widest transition-colors ${
              category === cat
                ? "bg-gold text-background"
                : "border border-line text-muted hover:border-gold-dim hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
              filter === f.key
                ? "border-gold text-gold"
                : "border-line text-muted hover:border-gold-dim hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* PRODUCT LIST */}
      <div className="mt-8 flex flex-col gap-4">
        {products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="gorilla-card rounded-sm p-8 text-center">
            <p className="text-muted">No products in {category} match this filter. Try another combination.</p>
          </div>
        )}
      </div>

      {/* GRADE SCALE LEGEND */}
      <div className="mt-16">
        <h2 className="font-display text-3xl text-foreground">Grade Scale</h2>
        <p className="mt-1 text-sm text-muted">How we translate purity, transparency, and testing into a single letter.</p>
        <div className="mt-5 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {GRADE_LEGEND.map((entry) => (
            <div key={entry.grade} className="flex gap-4 bg-surface p-5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border-2 font-display text-xl"
                style={{ borderColor: GRADE_COLORS[entry.grade], color: GRADE_COLORS[entry.grade] }}
              >
                {entry.grade}
              </span>
              <div>
                <p className="font-display text-lg tracking-wide text-foreground">{entry.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{entry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-sm border border-line bg-surface p-5">
        <p className="text-xs leading-relaxed text-muted">
          Supplement rankings reflect our assessment of publicly available laboratory testing
          data, certification status, and ingredient research at time of publication. Rankings
          are updated periodically but may not reflect the most current product formulations.
          Third-party certification status should be independently verified directly with the
          certifying body.
        </p>
      </div>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>

      <MethodologyModal open={methodologyOpen} onClose={() => setMethodologyOpen(false)} />
    </div>
  );
}
