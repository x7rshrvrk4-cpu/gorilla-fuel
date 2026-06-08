import Image from "next/image";
import type { OffProduct } from "../lib/openFoodFacts";
import { productImage } from "../lib/openFoodFacts";
import {
  ALCOHOL_GRADE_COLORS,
  detectAlcoholKind,
  isCertifiedGlutenFree,
  isCertifiedOrganic,
  kindEmoji,
  kindLabel,
  type AlcoholScoreResult,
} from "../lib/alcoholScoring";
import EvidenceTierBadge from "../../components/EvidenceTierBadge";
import AlcoholDisclaimer from "./AlcoholDisclaimer";
import SourcesFooter from "./SourcesFooter";

type Props = {
  product: OffProduct;
  result: AlcoholScoreResult;
};

const RISK_COLOR: Record<string, string> = {
  high: "border-red-500/50 text-red-400 bg-red-500/10",
  medium: "border-amber-400/50 text-amber-300 bg-amber-400/10",
  low: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
};

function GorillaPour({ rating }: { rating: number }) {
  return (
    <span aria-label={`Gorilla Pour rating: ${rating} out of 5`} className="inline-flex gap-0.5 text-xl leading-none">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-20 grayscale"}>
          🦍
        </span>
      ))}
    </span>
  );
}

function ScoreDial({ score, color }: { score: number; color: string }) {
  const size = 128;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl leading-none text-white">{score}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

export default function AlcoholResultCard({ product, result }: Props) {
  const image = productImage(product);
  const kind = detectAlcoholKind(product.categories_tags);
  const emoji = kindEmoji(kind);
  const gradeColor = ALCOHOL_GRADE_COLORS[result.grade];
  const glutenFree = isCertifiedGlutenFree(product.labels_tags);
  const organic = isCertifiedOrganic(product.labels_tags);

  return (
    <div className="animate-rise overflow-hidden rounded-sm border border-amber-400/20 bg-slate-950 shadow-[0_0_40px_-12px_rgba(251,191,36,0.15)]">
      {/* ALCOHOL BANNER — dark navy and gold, distinct from food/beauty branding */}
      <div className="flex items-center gap-2 border-b border-amber-400/25 bg-slate-900 px-6 py-3">
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-400" />
        <p className="font-display text-sm uppercase tracking-[0.3em] text-amber-300">
          {emoji} {kindLabel(kind)} · Alcohol Mode
        </p>
      </div>

      {/* HEADER */}
      <div className="flex flex-col gap-6 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-800 bg-slate-900">
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
            <span className="text-5xl">{emoji}</span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            {product.brands || "Unknown Brand"} · {product.code}
          </p>
          <h2 className="mt-1 font-display text-3xl leading-tight text-white sm:text-4xl">
            {product.product_name || "Unnamed Product"}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-block rounded-sm border px-3 py-1 font-display text-sm tracking-[0.2em]"
              style={{ borderColor: gradeColor, color: gradeColor }}
            >
              {result.grade.toUpperCase()}
            </span>
            {result.abv !== null && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-amber-400/50 bg-amber-400/10 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-amber-300">
                {result.abv}% ABV
              </span>
            )}
            {glutenFree && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-sky-400/50 bg-sky-400/10 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-sky-300">
                Gluten Free
              </span>
            )}
            {organic && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-emerald-400/50 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-emerald-300">
                Organic
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Gorilla Pour</span>
            <GorillaPour rating={result.gorillaPour} />
          </div>
        </div>

        <ScoreDial score={result.score} color={gradeColor} />
      </div>

      {/* SCORE EXPLAINER */}
      <div className="border-b border-slate-800 bg-slate-900/60 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cleanliness Score · 0–100</p>
        <p className="mt-1 font-display text-3xl text-white">
          {result.score}
          <span className="text-base text-slate-400">/100</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Weighted as ingredient cleanliness (50%, scored {result.cleanlinessScore}/100), calorie density (30%, scored{" "}
          {result.calorieDensityScore}/100), and carb content (20%, scored {result.carbScore}/100).
        </p>
      </div>

      <AlcoholDisclaimer />

      {/* SERVING MATH */}
      <div className="grid gap-px bg-slate-800 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-slate-950 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Calories · per serving ({result.referenceServingMl}mL)</p>
          <p className="mt-1 font-display text-2xl text-white">{result.kcalPerServing ?? "—"}{result.kcalPerServing !== null && <span className="text-sm text-slate-400"> kcal</span>}</p>
        </div>
        <div className="bg-slate-950 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Calories · per 100mL</p>
          <p className="mt-1 font-display text-2xl text-white">{result.kcalPer100ml ?? "—"}{result.kcalPer100ml !== null && <span className="text-sm text-slate-400"> kcal</span>}</p>
        </div>
        <div className="bg-slate-950 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Carbs · per serving</p>
          <p className="mt-1 font-display text-2xl text-white">{result.carbsPerServing ?? "—"}{result.carbsPerServing !== null && <span className="text-sm text-slate-400">g</span>}</p>
        </div>
        <div className="bg-slate-950 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Carbs · per 100mL</p>
          <p className="mt-1 font-display text-2xl text-white">{result.carbsPer100ml ?? "—"}{result.carbsPer100ml !== null && <span className="text-sm text-slate-400">g</span>}</p>
        </div>
      </div>
      {result.sugarPerServing !== null && (
        <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
          <p className="text-xs text-slate-400">
            Sugar per serving: <span className="font-display text-amber-300">{result.sugarPerServing}g</span>
          </p>
        </div>
      )}

      {/* FLAGS / POSITIVES */}
      <div className="grid gap-px bg-slate-800 sm:grid-cols-2">
        <div className="bg-slate-950 p-6">
          <h3 className="font-display text-xl tracking-wide text-white">
            <span className="text-red-400">⚠</span> Flags
          </h3>
          {result.flags.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {result.flags.map((flag, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-400">—</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Nothing flagged. Clean pour.</p>
          )}
        </div>
        <div className="bg-slate-950 p-6">
          <h3 className="font-display text-xl tracking-wide text-white">
            <span className="text-emerald-400">✓</span> Positives
          </h3>
          {result.positives.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {result.positives.map((pos, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-400">—</span>
                  <span>{pos}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No standout positives detected.</p>
          )}
        </div>
      </div>

      {/* DETECTED ADDITIVES */}
      <div className="border-t border-slate-800 p-6">
        <h3 className="font-display text-xl tracking-wide text-white">Flagged Beer &amp; Alcohol Additives</h3>
        <p className="mt-1 text-xs text-slate-400">
          Screened for caramel colours, sulfite preservatives, foam/clarity stabilizers, cold-sterilization agents,
          carrageenan, high fructose corn syrup, and artificial colours.
        </p>
        {result.detectedAdditives.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {result.detectedAdditives.map((additive) => (
              <div key={additive.id} className={`rounded-sm border p-3 text-sm ${RISK_COLOR[additive.risk]}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-lg tracking-wide">{additive.name}</span>
                  <EvidenceTierBadge tier={additive.tier} />
                </div>
                <p className="mt-1.5 text-xs text-foreground/70">{additive.note}</p>
                <div className="mt-2 space-y-1.5 border-t border-current/20 pt-2 text-xs text-foreground/70">
                  <p>
                    <span className="font-display tracking-wide text-foreground/90">Health bodies: </span>
                    {additive.healthBodyPosition}
                  </p>
                </div>
                <p className="mt-2 border-t border-current/20 pt-2 text-[11px] leading-relaxed text-foreground/50">
                  Sources: {additive.sources.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">None of our flagged beer and alcohol additives were found in the ingredients list.</p>
        )}
      </div>

      <SourcesFooter />
    </div>
  );
}
