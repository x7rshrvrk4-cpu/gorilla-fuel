"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { scrollToProduct } from "../lib/scrollHighlight";
import CrossLinkBanner from "../components/CrossLinkBanner";
import BackToTop from "../components/BackToTop";
import UniversalSearch from "../components/UniversalSearch";
import EnergyDisclaimer from "./components/EnergyDisclaimer";
import EnergyProductCard from "./components/EnergyProductCard";
import { ENERGY_PRODUCTS } from "./lib/products";

type EnergyFilter = "all" | "energy" | "sports" | "zero-sugar" | "no-aspartame";

const ENERGY_FILTERS: { key: EnergyFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "energy", label: "Energy" },
  { key: "sports", label: "Sports & Hydration" },
  { key: "zero-sugar", label: "Zero Sugar" },
  { key: "no-aspartame", label: "No Aspartame" },
];

export default function EnergyClient() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<EnergyFilter>("all");

  // Deep link: /energy?p=<id> → scroll to product. Keyed on the ?p= value so it
  // re-fires on a same-page query-only navigation (the iOS "dead tap" fix).
  const deepLinkId = searchParams.get("p");
  useEffect(() => {
    if (!deepLinkId) return;
    const product = ENERGY_PRODUCTS.find((x) => x.id === deepLinkId);
    if (!product) return;
    return scrollToProduct(deepLinkId);
  }, [deepLinkId]);

  const products = useMemo(() => {
    return ENERGY_PRODUCTS.filter((p) => {
      switch (filter) {
        case "energy":
          return p.category === "Energy Drinks";
        case "sports":
          return p.category === "Sports & Hydration";
        case "zero-sugar":
          return p.sugar === 0;
        case "no-aspartame":
          return !p.phenylalanineWarning;
        default:
          return true;
      }
    }).sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
  }, [filter]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {/* PAGE HEADER */}
      <div className="max-w-2xl">
        <p className="font-display text-sm tracking-[0.3em] text-cyan-400">BEVERAGE INTELLIGENCE</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          The <span className="text-cyan-400">Energy &amp; Sports Drink</span> Rankings.
        </h1>
        <p className="mt-4 text-muted">
          {ENERGY_PRODUCTS.length} energy, sports and hydration drinks scored by the same engine that powers a
          live scan — sugar, sodium and additive load per serving, with caffeine at a glance. Canadian-market
          formulas only.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-sm border border-cyan-400/30 bg-cyan-400/8 px-3 py-1.5 text-xs text-cyan-300/80">
          <span className="text-cyan-400">✓</span>
          Canadian formulas verified June 2026 — sourced from manufacturer disclosures and Canadian retailer labels
        </p>
      </div>

      <div className="mt-6">
        <UniversalSearch placeholder="Search foods, drinks, supplements…" />
      </div>

      <div className="mt-4 overflow-hidden rounded-sm border border-cyan-400/20">
        <EnergyDisclaimer />
      </div>

      {/* FILTER CHIPS */}
      <div className="mt-8 flex flex-wrap gap-2">
        {ENERGY_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
              filter === f.key
                ? "border-cyan-400 text-cyan-400"
                : "border-slate-700 text-slate-400 hover:border-cyan-400/50 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-sm border border-slate-800 bg-slate-900/40 px-5 py-4">
        <p className="text-xs leading-relaxed text-slate-400">
          <span className="font-display tracking-wide text-slate-300">Caffeine band:</span>{" "}
          <span className="text-emerald-300">green &lt;100 mg</span> ·{" "}
          <span className="text-yellow-300">yellow 100–200 mg</span> ·{" "}
          <span className="text-red-300">red &gt;200 mg</span> (caffeine-free drinks show no band). Scores use
          the standard Gorilla engine (60% nutrition · 30% additives · 10% organic). Sports &amp; hydration drinks
          surface sugar and sodium instead of caffeine; their sodium is scored honestly, so high-electrolyte
          mixes flag for casual use — the audience tag on each card gives the for-whom context.
        </p>
      </div>

      {/* PRODUCT LIST */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {products.length > 0 ? (
          products.map((product) => <EnergyProductCard key={product.id} product={product} />)
        ) : (
          <div className="col-span-full rounded-sm border border-slate-800 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-400">No drinks match this filter. Try another combination.</p>
          </div>
        )}
      </div>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
      <BackToTop />
    </div>
  );
}
