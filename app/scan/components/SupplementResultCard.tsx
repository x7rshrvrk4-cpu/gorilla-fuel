"use client";

import type { NihDsldProduct } from "../../api/nihdsl/route";
import SourceBadge from "./SourceBadge";

type Props = {
  product: NihDsldProduct;
};

const NSF_CERTS = new Set(["nsf certified for sport", "nsf international", "nsf"]);
const INFORMED_CERTS = new Set(["informed sport", "informed choice", "informed protein"]);

export default function SupplementResultCard({ product }: Props) {
  const certs = product.certifications ?? [];

  const hasNsf = certs.some((c) => NSF_CERTS.has(c.toLowerCase()));
  const hasInformed = certs.some((c) => INFORMED_CERTS.has(c.toLowerCase()));
  const otherCerts = certs.filter(
    (c) => !NSF_CERTS.has(c.toLowerCase()) && !INFORMED_CERTS.has(c.toLowerCase())
  );

  return (
    <div className="gorilla-card overflow-hidden rounded-sm">
      {/* SUPPLEMENT BANNER */}
      <div className="flex items-center gap-3 border-b border-blue-500/20 bg-blue-500/8 px-5 py-3">
        <svg className="h-4 w-4 shrink-0 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <p className="font-display text-xs uppercase tracking-[0.2em] text-blue-300">
          Dietary Supplement — NIH Verified Label
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            {product.brandName && (
              <p className="text-xs uppercase tracking-[0.25em] text-muted">{product.brandName}</p>
            )}
            <h2 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {product.productName}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SourceBadge source="nih-dsld" />
              {hasNsf && (
                <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-emerald-300">
                  ✓ NSF Certified
                </span>
              )}
              {hasInformed && (
                <span className="inline-flex items-center gap-1 rounded-sm border border-teal-400/40 bg-teal-400/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-teal-300">
                  ✓ Informed Sport
                </span>
              )}
              {otherCerts.map((cert) => (
                <span
                  key={cert}
                  className="rounded-sm border border-line px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-muted"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SERVING INFO */}
        {(product.servingSize || product.servingsPerContainer) && (
          <div className="mt-5 flex flex-wrap gap-4 rounded-sm border border-line bg-surface-2 px-4 py-3">
            {product.servingSize && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Serving Size</p>
                <p className="mt-0.5 font-display text-lg text-foreground">{product.servingSize}</p>
              </div>
            )}
            {product.servingsPerContainer && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Servings / Container</p>
                <p className="mt-0.5 font-display text-lg text-foreground">{product.servingsPerContainer}</p>
              </div>
            )}
          </div>
        )}

        {/* DIETARY INGREDIENTS */}
        {product.dietaryIngredients && product.dietaryIngredients.length > 0 && (
          <div className="mt-5">
            <h3 className="font-display text-base uppercase tracking-[0.2em] text-gold">
              Supplement Facts
            </h3>
            <div className="mt-2 divide-y divide-line overflow-hidden rounded-sm border border-line">
              {product.dietaryIngredients.slice(0, 16).map((ingredient, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <span className="text-sm text-foreground">{ingredient.ingredientName}</span>
                  {(ingredient.amount !== undefined || ingredient.unit) && (
                    <span className="shrink-0 font-display text-sm text-gold">
                      {ingredient.amount !== undefined ? ingredient.amount : "—"}
                      {ingredient.unit ? ` ${ingredient.unit}` : ""}
                    </span>
                  )}
                </div>
              ))}
              {product.dietaryIngredients.length > 16 && (
                <div className="px-4 py-2 text-xs text-muted">
                  +{product.dietaryIngredients.length - 16} more ingredients
                </div>
              )}
            </div>
          </div>
        )}

        {/* OTHER INGREDIENTS */}
        {product.otherIngredients && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Other Ingredients</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{product.otherIngredients}</p>
          </div>
        )}

        {/* LABEL STATEMENT */}
        {product.labelStatement && (
          <div className="mt-4 rounded-sm border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400">Label Statement</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{product.labelStatement}</p>
          </div>
        )}

        {/* DISCLAIMER */}
        <p className="mt-5 text-[10px] leading-relaxed text-muted/60">
          Data sourced from the NIH Dietary Supplement Label Database (DSLD), a public government registry.
          This is not medical advice. Consult a healthcare professional before use.
        </p>
      </div>
    </div>
  );
}
