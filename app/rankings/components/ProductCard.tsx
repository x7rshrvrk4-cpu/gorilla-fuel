"use client";

import { useState } from "react";
import { GRADE_COLORS, type Product } from "../lib/products";
import EvidenceTierBadge from "../../components/EvidenceTierBadge";

type Props = {
  product: Product;
};

function formatVerifiedDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default function ProductCard({ product }: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = GRADE_COLORS[product.grade];

  return (
    <div className="gorilla-card overflow-hidden rounded-sm transition-colors">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-center sm:gap-6 sm:p-6"
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 font-display text-2xl"
          style={{ borderColor: color, color }}
        >
          {product.grade}
        </div>

        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">{product.brand}</p>
          <h3 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
            {product.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>${product.pricePerServing.toFixed(2)} / serving</span>
            <span className="flex items-center gap-1">
              <span className={product.thirdPartyTested ? "text-emerald-400" : "text-red-400"}>
                {product.thirdPartyTested ? "✓" : "✕"}
              </span>
              3rd-Party Tested
            </span>
            <span>Purity {product.purityScore}/100</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <EvidenceTierBadge tier={product.evidenceTier} />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Last verified {formatVerifiedDate(product.lastVerified)}
            </span>
          </div>
        </div>

        <span
          className={`shrink-0 font-display text-2xl text-gold transition-transform ${expanded ? "rotate-45" : ""}`}
          aria-hidden
        >
          +
        </span>
      </button>

      {expanded && (
        <div className="border-t border-line p-5 sm:p-6">
          <div className="mb-5">
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">Purity Score</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full"
                style={{ width: `${product.purityScore}%`, background: color }}
              />
            </div>
          </div>

          <h4 className="font-display text-xl tracking-wide text-gold">Gorilla Analysis</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted">{product.analysis}</p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <h4 className="font-display text-lg tracking-wide text-emerald-400">Pros</h4>
              <ul className="mt-2 space-y-1.5 text-sm text-muted">
                {product.pros.map((pro, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-400">+</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-lg tracking-wide text-red-400">Cons</h4>
              <ul className="mt-2 space-y-1.5 text-sm text-muted">
                {product.cons.map((con, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-red-400">−</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {product.certifications.length > 0 && (
            <div className="mt-5">
              <h4 className="text-xs uppercase tracking-[0.2em] text-muted">Certifications</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="rounded-sm border border-gold-dim px-3 py-1 text-xs tracking-wide text-gold"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
