import Image from "next/image";
import { GRADE_COLORS } from "../lib/scoring";
import type { BeautyScoreResult } from "../lib/beautyScoring";
import type { ObfProduct } from "../lib/openBeautyFacts";
import { beautyProductImage } from "../lib/openBeautyFacts";
import BeautyIngredientCard from "./BeautyIngredientCard";
import ScoreDisclaimer from "./ScoreDisclaimer";
import ScoreRing from "./ScoreRing";
import SourcesFooter from "./SourcesFooter";
import SourceBadge from "./SourceBadge";
import { beautyHasNoIngredients, inferUnderCoveredCategory } from "../lib/beautyConfidence";

type Props = {
  product: ObfProduct;
  result: BeautyScoreResult;
};

export default function BeautyResultCard({ product, result }: Props) {
  const image = beautyProductImage(product);
  const gradeColor = GRADE_COLORS[result.grade];

  // Display-only honesty signals — never change the score.
  const noIngredients = beautyHasNoIngredients(product);
  const underCovered = inferUnderCoveredCategory(product.product_name);

  return (
    <div className="gorilla-card animate-rise overflow-hidden rounded-sm">
      {/* BEAUTY PRODUCT BANNER — purple, distinct from the gold food/supplement branding */}
      <div className="flex items-center gap-2 border-b border-purple-400/30 bg-purple-500/15 px-6 py-3">
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-purple-400" />
        <p className="font-display text-sm uppercase tracking-[0.3em] text-purple-300">
          Beauty Product · Cosmetics Mode
        </p>
        <SourceBadge source="open-beauty-facts" className="ml-auto" />
      </div>

      {/* HEADER */}
      <div className="flex flex-col gap-6 border-b border-line p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-background">
          {image ? (
            <Image
              src={image}
              alt={product.product_name ?? "Product image"}
              width={112}
              height={112}
              unoptimized
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="font-display text-3xl text-purple-400/40">G</span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            {product.brands || "Unknown Brand"} · {product.code}
          </p>
          <h2 className="mt-1 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {product.product_name || "Unnamed Product"}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-block rounded-sm border px-3 py-1 font-display text-sm tracking-[0.2em]"
              style={{ borderColor: gradeColor, color: gradeColor }}
            >
              {result.grade.toUpperCase()}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-purple-400/50 bg-purple-400/10 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-purple-300">
              Sourced from Open Beauty Facts
            </span>
          </div>
        </div>

        <ScoreRing score={result.score} grade={result.grade} />
      </div>

      {/* SIGNAL 1 — data-blind: OBF had no ingredient list, so nothing could be
          flagged. Mirrors the food "Limited data" badge. Informational, amber. */}
      {noIngredients && (
        <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/[0.06] px-6 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
          </svg>
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.18em] text-amber-300">Limited data</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Scored on available data — no ingredient list on file, so nothing could be flagged. A clean
              score here reflects missing data, not a verified formula.
            </p>
          </div>
        </div>
      )}

      {/* SIGNAL 2 — limited coverage: this looks like a category the cosmetic
          dictionary is thin on (sunscreen/deodorant/makeup). Informational, slate. */}
      {underCovered && (
        <div className="flex items-start gap-2 border-b border-slate-400/30 bg-slate-500/[0.07] px-6 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
          </svg>
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.18em] text-slate-300">Newer coverage</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              This looks like a {underCovered.label} product. Our cosmetic checks here are newer — they cover
              the main flagged ingredients ({underCovered.covers}) but may not catch every concern in this
              category yet, so treat a high score as a partial check.
            </p>
          </div>
        </div>
      )}

      {/* SCORE EXPLAINER */}
      <div className="border-b border-line bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Beauty Score · 0–100</p>
        <p className="mt-1 font-display text-3xl text-foreground">{result.score}<span className="text-base text-muted">/100</span></p>
        <p className="mt-1 text-xs text-muted">
          Cosmetics aren&apos;t scored on nutrition — this score reflects only the ingredients we
          flag for irritancy, allergy/sensitization potential, possible endocrine disruption, and
          paraben preservatives, weighed by real risk level.
        </p>
      </div>

      <ScoreDisclaimer />

      <div className="grid gap-px bg-line sm:grid-cols-2">
        {/* FLAGS */}
        <div className="bg-surface p-6">
          <h3 className="font-display text-xl tracking-wide text-foreground">
            <span className="text-red-400">⚠</span> Flags
          </h3>
          {result.flags.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {result.flags.map((flag, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-400">—</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Nothing flagged. Clean sheet.</p>
          )}
        </div>

        {/* POSITIVES */}
        <div className="bg-surface p-6">
          <h3 className="font-display text-xl tracking-wide text-foreground">
            <span className="text-emerald-400">✓</span> Positives
          </h3>
          {result.positives.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {result.positives.map((pos, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-400">—</span>
                  <span>{pos}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No standout positives detected.</p>
          )}
        </div>
      </div>

      {/* DETECTED INGREDIENTS */}
      <div className="border-t border-line p-6">
        <h3 className="font-display text-xl tracking-wide text-foreground">Flagged Cosmetic Ingredients</h3>
        <p className="mt-1 text-xs text-muted">
          Screened for parabens, phthalates, formaldehyde (and releasers), sulfates, BHA/BHT,
          triclosan, oxybenzone, retinyl palmitate, PEG compounds, and undisclosed fragrance.
        </p>
        {result.detected.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {result.detected.map((ingredient) => (
              <BeautyIngredientCard key={ingredient.id} ingredient={ingredient} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">None of our flagged irritants, allergens, endocrine disruptors, or parabens were found in the ingredients list.</p>
        )}
      </div>

      <SourcesFooter />
    </div>
  );
}
