import {
  caffeineBand,
  energyScore,
  type CaffeineBand,
  type EnergyDrinkProduct,
} from "../lib/products";

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-green-400";
  if (score >= 25) return "text-amber-400";
  return "text-red-400";
}

const CAFFEINE_BAND_CLASS: Record<CaffeineBand, string> = {
  green: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  yellow: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
  red: "border-red-500/50 bg-red-500/10 text-red-300",
};

export default function EnergyProductCard({ product }: { product: EnergyDrinkProduct }) {
  const result = energyScore(product);
  const band = caffeineBand(product.caffeineMg);
  const servingLabel = `per ${product.servingMl}mL can`;

  return (
    <div
      id={`product-${product.id}`}
      className="rounded-sm border border-cyan-400/15 bg-slate-900/60 p-5 transition-colors hover:border-cyan-400/30"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{product.brand}</p>
          <h3 className="font-display text-2xl leading-tight text-white">{product.name}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{product.sweetener}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {product.nutritionEstimated && (
            <span className="inline-flex shrink-0 items-center rounded-sm border border-slate-600/50 bg-slate-700/20 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-slate-400">
              Est.
            </span>
          )}
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] ${CAFFEINE_BAND_CLASS[band]}`}
          >
            ⚡ {product.caffeineMg} mg Caffeine
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Calories · {servingLabel}</p>
          <p className="mt-0.5 font-display text-lg text-white">
            {product.caloriesEstimated ? "~" : ""}
            {product.calories} kcal
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Carbs · {servingLabel}</p>
          <p className="mt-0.5 font-display text-lg text-white">
            {product.carbs !== undefined ? `${product.carbs}g` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Sugar · {servingLabel}</p>
          <p className="mt-0.5 font-display text-lg text-white">{product.sugar}g</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">🦍 Gorilla Score</p>
          <p className={`mt-0.5 font-display text-2xl ${scoreColor(result.finalScore)}`}>
            {result.finalScore}
            <span className="ml-1.5 text-xs uppercase tracking-[0.15em] text-slate-500">{result.grade}</span>
          </p>
        </div>
      </div>

      {/* PKU / phenylalanine warning — aspartame-containing products only */}
      {product.phenylalanineWarning && (
        <p className="mt-3 rounded-sm border border-red-500/40 bg-red-900/20 px-3 py-2 text-[11px] leading-relaxed text-red-300/90">
          <span className="font-display uppercase tracking-[0.15em] text-red-300">⚠ Phenylketonurics — </span>
          Contains aspartame, a source of phenylalanine. Not suitable for people with phenylketonuria (PKU).
        </p>
      )}

      {/* Detected additives — straight from the scoring engine, same as a live scan */}
      <div className="mt-3 border-t border-slate-800 pt-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Detected Additives</p>
        {result.detectedAdditives.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {result.detectedAdditives.map((a) => (
              <span
                key={a.id}
                className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${
                  a.risk === "high"
                    ? "border-red-500/40 bg-red-500/8 text-red-300"
                    : a.risk === "medium"
                    ? "border-amber-400/40 bg-amber-400/8 text-amber-300"
                    : "border-slate-500/40 bg-slate-500/8 text-slate-300"
                }`}
                title={`${a.risk} risk · ${a.tier}`}
              >
                {a.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-0.5 text-[11px] text-emerald-400">None flagged in the ingredient list</p>
        )}
      </div>

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
