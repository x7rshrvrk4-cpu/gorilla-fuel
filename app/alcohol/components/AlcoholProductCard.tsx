import { isGorillaSweetSpot, wineGorillaScore, type AlcoholRankingProduct } from "../lib/products";

// Feature flag: only render "Buy at..." links when explicitly enabled. NEXT_PUBLIC_
// vars are inlined at build time; absent/anything-but-"true" keeps buttons hidden.
const SHOW_ALCOHOL_BUY_LINKS = process.env.NEXT_PUBLIC_SHOW_ALCOHOL_BUY_LINKS === "true";

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

// Wine Gorilla Score now lives in lib/products.ts (wineGorillaScore) so the
// rankings page and Sweet Spot calculations share the exact same formula.

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

/** Style from LCBO sweetness code — used when raw sugar isn't known (partial wines). */
function styleFromSweetnessCode(code: AlcoholRankingProduct["sweetnessCode"]): WineStyle | null {
  switch (code) {
    case "XD":
    case "D":
      return "DRY";
    case "M":
      return "SEMI-DRY";
    case "MS":
    case "S":
      return "SWEET";
    default:
      return null;
  }
}

const WINE_STYLE_CLASS: Record<WineStyle, string> = {
  DRY: "border-emerald-600/50 bg-emerald-600/10 text-emerald-300",
  "SEMI-DRY": "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
  SWEET: "border-amber-500/50 bg-amber-500/10 text-amber-300",
};

const CITY_BADGE_CLASS: Record<string, string> = {
  Toronto: "border-blue-500/60 bg-blue-800/25 text-blue-300",
  Hamilton: "border-red-500/60 bg-red-900/25 text-red-300",
  Niagara: "border-purple-500/60 bg-purple-900/25 text-purple-300",
  Ottawa: "border-emerald-700/70 bg-emerald-950/40 text-emerald-400",
  Guelph: "border-teal-500/60 bg-teal-900/25 text-teal-300",
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

  const score = isWine ? wineGorillaScore(product) : null;
  // A wine with no computable score is PENDING (partial data) — show an honest
  // "Score pending" state, never the Gorilla Pour stars or a fabricated number.
  const winePending = isWine && score === null;
  const style = isWine
    ? product.sugarPerCan !== undefined
      ? wineStyle(product.sugarPerCan)
      : styleFromSweetnessCode(product.sweetnessCode)
    : null;
  const sweetSpot = isWine && isGorillaSweetSpot(product);

  return (
    <div id={`product-${product.id}`} className={`rounded-sm border bg-slate-900/60 p-5 transition-colors ${borderClass}`}>
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
          {product.maltBasedBeerStore && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-amber-500/70 bg-amber-500/15 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-amber-300">
              ⚠ Malt Based — Beer Store Version
            </span>
          )}
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
          {product.cityRegion && (
            <span className={`inline-flex shrink-0 items-center rounded-sm border px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] ${CITY_BADGE_CLASS[product.cityRegion] ?? "border-slate-500/60 bg-slate-700/25 text-slate-300"}`}>
              {product.cityRegion}
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
          {product.abv !== undefined && (
            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] ${abvBadgeClass}`}>
              {product.abv}% ABV
            </span>
          )}
        </div>
      </div>

      {winePending ? (
        // PARTIAL wine — ABV/sugar pending. Honest "Score pending" state; never a
        // fabricated number, 0, or Gorilla Pour rating we don't actually have.
        <div className="mt-4 rounded-sm border border-slate-700/50 bg-slate-800/40 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">🦍 Gorilla Score</p>
          <p className="mt-0.5 font-display text-lg text-slate-300">Score pending</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            ABV &amp; sugar not yet verified for this wine — we don&apos;t show a score until they are.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Calories · {servingLabel}</p>
            <p className="mt-0.5 font-display text-lg text-white">{product.caloriesPerCan ?? "—"} kcal</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Carbs · {servingLabel}</p>
            <p className="mt-0.5 font-display text-lg text-white">{product.carbsPerCan ?? "—"}g</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Sugar · {servingLabel}</p>
            <p className="mt-0.5 font-display text-lg text-white">{product.sugarPerCan ?? "—"}g</p>
          </div>
          <div>
            {isWine && score !== null ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">🦍 Gorilla Score</p>
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
      )}

      {/* CRITIC SCORE — shown ONLY when a real, attributable rating exists (no fake
          numbers). Hybrid proof rule: a STABLE LCBO Vintages catalogue URL
          (lcbofoodanddrink.cld.bz) renders a clickable proof link; a rotating
          product-page URL or no URL renders TEXT attribution only — never a link
          that could rot or drift to a different vintage. Blanked wines show no
          critic score (the wine still shows its own Gorilla Score in the grid above). */}
      {isWine && product.wineQuality !== undefined && (() => {
        const isAward = product.wineScoreIsAward === true;
        const stable =
          product.wineQualityUrlStable ??
          (!!product.wineQualityUrl && product.wineQualityUrl.includes("lcbofoodanddrink.cld.bz"));
        const attribution = `${isAward ? "" : "per "}${product.wineQualitySource ?? "critic"}${
          product.wineVintage ? ` · ${product.wineVintage}` : ""
        }`;
        return (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                {isAward ? "🏅 Award" : "⭐ Wine Quality"}
              </p>
              <p className="mt-0.5 font-display text-2xl text-amber-300">{product.wineQuality}</p>
              {stable && product.wineQualityUrl ? (
                <a
                  href={product.wineQualityUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-gold underline decoration-gold-dim underline-offset-2 hover:text-gold/80"
                >
                  {attribution} ↗
                </a>
              ) : (
                <p className="text-[10px] text-slate-500">{attribution}</p>
              )}
            </div>
            {sweetSpot && (
              <span
                title="This wine scored well on both nutrition and critic ratings. The best of both worlds."
                className="ml-auto inline-flex cursor-help items-center gap-1.5 rounded-sm border border-gold bg-gold/15 px-3 py-1.5 font-display text-[11px] uppercase tracking-[0.18em] text-gold"
              >
                🦍 Gorilla Sweet Spot
              </span>
            )}
          </div>
        );
      })()}

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

      {product.maltBasedBeerStore && (
        <p className="mt-3 rounded-sm border border-amber-500/30 bg-amber-900/15 px-3 py-2 text-[11px] leading-relaxed text-amber-300/90">
          This is the Beer Store malt based version of this product. The LCBO may
          carry a spirit based version with different ingredients and gluten
          status. If you have celiac disease or gluten sensitivity, buy seltzers
          at the LCBO — not at Beer Store.
        </p>
      )}

      {product.gorillaAnalysis && (
        <p className="mt-3 border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-300">
          <span className="font-display uppercase tracking-[0.15em] text-gold/70">Gorilla Analysis — </span>
          {product.gorillaAnalysis}
        </p>
      )}

      <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400">{product.availability}</p>

      {/* Buy link — gated on the NEXT_PUBLIC_SHOW_ALCOHOL_BUY_LINKS flag AND a real
          verified Beer Store URL on file; hidden otherwise (default). */}
      {SHOW_ALCOHOL_BUY_LINKS && product.buyUrl && (
        <a
          href={product.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-gold/50 bg-gold/10 px-3 py-2 font-display text-xs uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-background"
        >
          Buy at The Beer Store →
        </a>
      )}
    </div>
  );
}
