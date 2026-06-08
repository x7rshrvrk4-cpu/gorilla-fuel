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
  return (
    <div className="rounded-sm border border-amber-400/15 bg-slate-900/60 p-5 transition-colors hover:border-amber-400/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{product.brand}</p>
          <h3 className="font-display text-2xl leading-tight text-white">{product.name}</h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-amber-400/50 bg-amber-400/10 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-amber-300">
          {product.abv}% ABV
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Calories / can</p>
          <p className="mt-0.5 font-display text-lg text-white">{product.caloriesPerCan} kcal</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Carbs / can</p>
          <p className="mt-0.5 font-display text-lg text-white">{product.carbsPerCan}g</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Flagged Additives</p>
          <p className="mt-0.5 font-display text-lg text-white">{product.additiveCount}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Gorilla Pour</p>
          <div className="mt-1">
            <GorillaPour rating={product.gorillaPour} />
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400">{product.availability}</p>
    </div>
  );
}
