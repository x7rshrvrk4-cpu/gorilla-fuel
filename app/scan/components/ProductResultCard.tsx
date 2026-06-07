import Image from "next/image";
import { GRADE_COLORS, type ScoreResult } from "../lib/scoring";
import type { OffProduct } from "../lib/openFoodFacts";
import { productImage } from "../lib/openFoodFacts";
import ScoreRing from "./ScoreRing";

type Props = {
  product: OffProduct;
  result: ScoreResult;
  alternatives: OffProduct[];
  alternativesLoading: boolean;
};

const RISK_LABEL: Record<string, string> = {
  high: "High Risk",
  medium: "Medium Risk",
  low: "Low Risk",
};

const RISK_COLOR: Record<string, string> = {
  high: "border-red-500/50 text-red-400 bg-red-500/10",
  medium: "border-amber-400/50 text-amber-300 bg-amber-400/10",
  low: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
};

export default function ProductResultCard({ product, result, alternatives, alternativesLoading }: Props) {
  const image = productImage(product);
  const gradeColor = GRADE_COLORS[result.grade];

  return (
    <div className="gorilla-card animate-rise overflow-hidden rounded-sm">
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
            <span className="font-display text-3xl text-gold/40">G</span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            {product.brands || "Unknown Brand"} · {product.code}
          </p>
          <h2 className="mt-1 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {product.product_name || "Unnamed Product"}
          </h2>
          <span
            className="mt-3 inline-block rounded-sm border px-3 py-1 font-display text-sm tracking-[0.2em]"
            style={{ borderColor: gradeColor, color: gradeColor }}
          >
            {result.grade.toUpperCase()}
          </span>
        </div>

        <ScoreRing score={result.finalScore} grade={result.grade} />
      </div>

      {/* SCORE BREAKDOWN */}
      <div className="grid grid-cols-2 gap-px border-b border-line bg-line">
        <div className="bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Nutrition Score</p>
          <p className="mt-1 font-display text-3xl text-foreground">{result.nutritionScore}<span className="text-base text-muted">/100</span></p>
          <p className="mt-1 text-xs text-muted">Weighted 60% of final score</p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Additive Score</p>
          <p className="mt-1 font-display text-3xl text-foreground">{result.additiveScore}<span className="text-base text-muted">/100</span></p>
          <p className="mt-1 text-xs text-muted">Weighted 40% of final score</p>
        </div>
      </div>

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

      {/* ADDITIVES */}
      <div className="border-t border-line p-6">
        <h3 className="font-display text-xl tracking-wide text-foreground">Detected Additives</h3>
        {result.detectedAdditives.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {result.detectedAdditives.map((additive) => (
              <div
                key={additive.id}
                className={`rounded-sm border p-3 text-sm ${RISK_COLOR[additive.risk]}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg tracking-wide">{additive.name}</span>
                  <span className="shrink-0 rounded-sm border border-current px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                    {RISK_LABEL[additive.risk]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground/70">{additive.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No flagged additives found in the ingredients list.</p>
        )}
      </div>

      {/* ALTERNATIVES */}
      <div className="border-t border-line p-6">
        <h3 className="font-display text-xl tracking-wide text-foreground">Healthier Alternatives</h3>
        {alternativesLoading && (
          <p className="mt-3 text-sm text-muted">Searching the same category for better options…</p>
        )}
        {!alternativesLoading && alternatives.length === 0 && (
          <p className="mt-3 text-sm text-muted">
            No clearly better alternatives found in this category right now.
          </p>
        )}
        {!alternativesLoading && alternatives.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {alternatives.map((alt) => {
              const altImage = productImage(alt);
              return (
                <div key={alt.code} className="gorilla-card flex items-center gap-3 rounded-sm p-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-background">
                    {altImage ? (
                      <Image src={altImage} alt={alt.product_name ?? ""} width={56} height={56} unoptimized className="h-full w-full object-contain" />
                    ) : (
                      <span className="font-display text-lg text-gold/40">G</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{alt.product_name}</p>
                    <p className="truncate text-xs text-muted">{alt.brands || "Unknown brand"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
