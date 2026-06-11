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

export default function AlcoholProductCard({ product }: { product: AlcoholRankingProduct }) {
  const isWine = product.category === "Wines";
  const servingLabel = isWine ? "per 148mL pour" : "per can";
  const borderClass = isWine
    ? "border-rose-700/20 hover:border-rose-700/40"
    : "border-amber-400/15 hover:border-amber-400/30";
  const abvBadgeClass = isWine
    ? "border-rose-600/50 bg-rose-600/10 text-rose-300"
    : "border-amber-400/50 bg-amber-400/10 text-amber-300";
  const additiveBadgeClass = isWine
    ? "border-rose-500/40 bg-rose-500/8 text-rose-300"
    : "border-amber-400/40 bg-amber-400/8 text-amber-300";

  return (
    <div className={`rounded-sm border bg-slate-900/60 p-5 transition-colors ${borderClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{product.brand}</p>
          <h3 className="font-display text-2xl leading-tight text-white">{product.name}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {product.lcboVerified && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-sky-500/50 bg-sky-500/10 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-sky-300">
              LCBO Verified
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Gorilla Pour</p>
          <div className="mt-1">
            <GorillaPour rating={product.gorillaPour} />
          </div>
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

      <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400">{product.availability}</p>
    </div>
  );
}
