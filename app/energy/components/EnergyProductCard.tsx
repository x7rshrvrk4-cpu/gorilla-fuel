import {
  caffeineBand,
  energyScore,
  type CaffeineBand,
  type EnergyDrinkProduct,
} from "../lib/products";
import { buildNuanceNotes } from "../../scan/lib/nuanceNotes";
import NuanceNotes from "../../components/NuanceNotes";
import AmazonBuyButton from "../../components/AmazonBuyButton";

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
  const isSports = product.category === "Sports & Hydration";
  const hasCaffeineNumber = product.caffeineMg !== undefined;
  const band = hasCaffeineNumber ? caffeineBand(product.caffeineMg as number) : null;
  // A product is caffeine-free when it has neither a verified mg figure nor a
  // caffeine note. We show a neutral "Caffeine-Free" chip — never a green 0.
  const isCaffeineFree = !hasCaffeineNumber && !product.caffeineNote;
  const servingLabel = `per ${product.servingMl}mL ${isSports ? "serving" : "can"}`;

  // Nuance notes (display-only). Energy cards run computeScore directly (never
  // gated), so the sub-scores are raw → numeric swing is truthful. RULE 3 fires
  // only when there's a caffeineNote and NO verified numeric caffeine.
  const nuanceNotes = buildNuanceNotes(result, {
    allowNumericSwing: true,
    caffeineNote: hasCaffeineNumber ? undefined : product.caffeineNote,
  });

  return (
    <div
      id={`product-${product.id}`}
      className="rounded-sm border border-cyan-400/15 bg-surface p-5 transition-colors hover:border-cyan-400/30"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">{product.brand}</p>
          <h3 className="font-display text-2xl leading-tight text-foreground">{product.name}</h3>
          <p className="mt-0.5 text-xs text-muted">{product.sweetener}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {product.nutritionEstimated && (
            <span className="inline-flex shrink-0 items-center rounded-sm border border-line/50 bg-surface-2 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-muted">
              Est.
            </span>
          )}
          {hasCaffeineNumber && band ? (
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] ${CAFFEINE_BAND_CLASS[band]}`}
            >
              ⚡ {product.caffeineMg} mg Caffeine
            </span>
          ) : product.caffeineNote ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-line/50 bg-surface-2 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.14em] text-muted">
              ⚡ {product.caffeineNote}
            </span>
          ) : isCaffeineFree ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-line/40 bg-surface-2 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.14em] text-muted">
              Caffeine-Free
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Calories · {servingLabel}</p>
          <p className="mt-0.5 font-display text-lg text-foreground">
            {product.caloriesEstimated ? "~" : ""}
            {product.calories} kcal
          </p>
        </div>
        {isSports ? (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Sugar · {servingLabel}</p>
              <p className="mt-0.5 font-display text-lg text-foreground">{product.sugar}g</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Sodium · {servingLabel}</p>
              <p className="mt-0.5 font-display text-lg text-foreground">
                {product.sodiumMg !== undefined ? `${product.sodiumMg} mg` : "—"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Carbs · {servingLabel}</p>
              <p className="mt-0.5 font-display text-lg text-foreground">
                {product.carbs !== undefined ? `${product.carbs}g` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Sugar · {servingLabel}</p>
              <p className="mt-0.5 font-display text-lg text-foreground">{product.sugar}g</p>
            </div>
          </>
        )}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">🦍 Gorilla Score</p>
          <p className={`mt-0.5 font-display text-2xl ${scoreColor(result.finalScore)}`}>
            {result.finalScore}
            <span className="ml-1.5 text-xs uppercase tracking-[0.15em] text-muted">{result.grade}</span>
          </p>
        </div>
      </div>

      {/* Audience tag — the for-whom context a bare score can't convey */}
      {product.audienceTag && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-cyan-400/40 bg-cyan-400/8 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.15em] text-cyan-300">
            👤 {product.audienceTag}
          </span>
        </div>
      )}

      {/* Nuance notes — the honest asterisk (contested/emerging additive, caffeine pending) */}
      {nuanceNotes.length > 0 && <NuanceNotes notes={nuanceNotes} className="mt-3" />}

      {/* PKU / phenylalanine warning — aspartame-containing products only */}
      {product.phenylalanineWarning && (
        <p className="mt-3 rounded-sm border border-red-500/40 bg-red-50 px-3 py-2 text-[11px] leading-relaxed text-red-300/90">
          <span className="font-display uppercase tracking-[0.15em] text-red-300">⚠ Phenylketonurics — </span>
          Contains aspartame, a source of phenylalanine. Not suitable for people with phenylketonuria (PKU).
        </p>
      )}

      {/* Allergen warning — same treatment as the PKU block (e.g. coconut/tree-nut) */}
      {product.allergenWarning && (
        <p className="mt-3 rounded-sm border border-amber-500/40 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-300/90">
          <span className="font-display uppercase tracking-[0.15em] text-amber-300">⚠ Allergen — </span>
          {product.allergenWarning}
        </p>
      )}

      {/* Detected additives — straight from the scoring engine, same as a live scan */}
      <div className="mt-3 border-t border-line pt-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Detected Additives</p>
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
                    : "border-line/40 bg-surface-2 text-muted"
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
        <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
          <span className="font-display uppercase tracking-[0.15em] text-gold/70">Gorilla Analysis — </span>
          {product.gorillaAnalysis}
        </p>
      )}

      <p className="mt-3 border-t border-line pt-3 text-xs text-muted">{product.availability}</p>

      {/* Buy on Amazon — only for the healthier picks (zero/low-sugar, clean). */}
      {result.finalScore >= 65 && (
        <div className="mt-3">
          <AmazonBuyButton query={`${product.brand} ${product.name}`} />
        </div>
      )}
    </div>
  );
}
