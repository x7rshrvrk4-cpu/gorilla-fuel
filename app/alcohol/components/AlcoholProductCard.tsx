import type { AlcoholRankingProduct } from "../lib/products";

function GorillaPour({ rating }: { rating: number }) {
  return (
    <span aria-label={`Gorilla Pour rating: ${rating} out of 5`} className="inline-flex gap-0.5 text-base leading-none">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-20 grayscale"}>
          🦍
        </span>
      ))}
    </span>
  );
}

function wineScore(calories: number, sugar: number, additives: number): number {
  const sugarScore =
    sugar <= 1 ? 95 :
    sugar <= 2 ? 85 :
    sugar <= 4 ? 70 :
    sugar <= 8 ? 45 :
    sugar <= 15 ? 20 : 5;

  const calScore =
    calories < 115 ? 90 :
    calories < 125 ? 80 :
    calories < 135 ? 70 :
    calories < 145 ? 60 :
    calories < 155 ? 50 :
    calories < 165 ? 35 : 20;

  const addScore = additives === 0 ? 100 : additives === 1 ? 80 : additives === 2 ? 60 : 35;

  return Math.round(sugarScore * 0.40 + calScore * 0.30 + addScore * 0.30);
}

function wineScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-green-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 35) return "text-orange-400";
  return "text-red-400";
}

type WineStyle = "DRY" | "SEMI-DRY" | "SWEET";

function wineStyle(sugar: number): WineStyle {
  if (sugar < 4) return "DRY";
  if (sugar < 8) return "SEMI-DRY";
  return "SWEET";
}

const WINE_STYLE_CLASS: Record<WineStyle, string> = {
  DRY: "border-emerald-600/50 bg-emerald-600/10 text-emerald-300",
  "SEMI-DRY": "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
  SWEET: "border-amber-500/50 bg-amber-500/10 text-amber-300",
};

export default function AlcoholProductCard({ product }: { product: AlcoholRankingProduct }) {
  const isWine = product.category === "Wines";
  const isIcewine = product.wineSubcategory === "Icewine";
  const servingLabel = isWine ? (isIcewine ? "per 60mL pour" : "per 148mL pour") : "per can";
  const borderClass = isWine
    ? "border-rose-700/20 hover:border-rose-700/40"
    : "border-amber-400/15 hover:border-amber-400/30";
  const abvBadgeClass = isWine
    ? "border-rose-600/50 bg-rose-600/10 text-rose-300"
    : "border-amber-400/50 bg-amber-400/10 text-amber-300";
  const additiveBadgeClass = isWine
    ? "border-rose-500/40 bg-rose-500/8 text-rose-300"
    : "border-amber-400/40 bg-amber-400/8 text-amber-300";

  const score = isWine ? wineScore(product.caloriesPerCan, product.sugarPerCan, product.additiveCount) : null;
  const style = isWine ? wineStyle(product.sugarPerCan) : null;

  return (
    <div className={`rounded-sm border bg-slate-900/60 p-5 transition-colors ${borderClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{product.brand}</p>
          <h3 className="font-display text-2xl leading-tight text-white">{product.name}</h3>
          {isWine && (product.varietal || product.region) && (
            <p className="mt-0.5 text-xs text-slate-400">
              {[product.varietal, product.region].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {product.glutenStatus === "certified-gf" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-green-500/70 bg-green-500/15 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-green-300">
              {product.canadianCertifiedGf ? "🍁 Canadian Certified GF" : "✓ Certified GF"}
            </span>
          )}
          {product.glutenStatus === "gluten-removed" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-amber-500/60 bg-amber-500/12 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-amber-300">
              ⚠ Gluten Removed
            </span>
          )}
          {product.glutenStatus === "contains-gluten" && (
            <span className="inline-flex shrink-0 items-center rounded-sm border border-slate-600/50 bg-slate-700/25 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-slate-400">
              Contains Gluten
            </span>
          )}
          {product.ontarioVQA && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-emerald-600/70 bg-gradient-to-r from-emerald-800/30 to-yellow-700/20 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-emerald-300">
              🍁 <span className="text-yellow-300/90">Ontario</span> VQA
            </span>
          )}
          {product.organicCertified && (
            <span className="inline-flex shrink-0 items-center rounded-sm border border-lime-600/60 bg-lime-800/20 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-lime-300">
              Organic
            </span>
          )}
          {product.londonOntario && (
            <span className="inline-flex shrink-0 items-center rounded-sm border border-emerald-700/60 bg-emerald-800/20 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-emerald-400">
              London ON
            </span>
          )}
          {isWine && style && (
            <span className={`inline-flex shrink-0 items-center rounded-sm border px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] ${WINE_STYLE_CLASS[style]}`}>
              {style}
            </span>
          )}
          {product.nutritionEstimated && (
            <span className="inline-flex shrink-0 items-center rounded-sm border border-slate-600/50 bg-slate-700/20 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-slate-400">
              Est.
            </span>
          )}
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] ${abvBadgeClass}`}>
            {product.abv}% ABV
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Calories · {servingLabel}</p>
          <p className="mt-0.5 font-display text-lg text-white">{product.caloriesPerCan} kcal</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Carbs · {servingLabel}</p>
          <p className="mt-0.5 font-display text-lg text-white">{product.carbsPerCan}g</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Sugar · {servingLabel}</p>
          <p className="mt-0.5 font-display text-lg text-white">{product.sugarPerCan}g</p>
        </div>
        <div>
          {isWine && score !== null ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Wine Score</p>
              <p className={`mt-0.5 font-display text-2xl ${wineScoreColor(score)}`}>{score}</p>
            </>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Gorilla Pour</p>
              <div className="mt-1">
                <GorillaPour rating={product.gorillaPour} />
              </div>
            </>
          )}
        </div>
      </div>

      {product.knownAdditives.length > 0 ? (
        <div className="mt-3 border-t border-slate-800 pt-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Known Additives</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {product.knownAdditives.map((additive) => (
              <span key={additive} className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${additiveBadgeClass}`}>
                {additive}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 border-t border-slate-800 pt-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Known Additives</p>
          <p className="mt-0.5 text-[11px] text-emerald-400">None found in public ingredient disclosures</p>
        </div>
      )}

      {product.gorillaAnalysis && (
        <p className="mt-3 border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-300">
          <span className="font-display uppercase tracking-[0.15em] text-gold/70">Gorilla Analysis — </span>
          {product.gorillaAnalysis}
        </p>
      )}

      <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400">{product.availability}</p>
    </div>
  );
}
