import Image from "next/image";
import { GRADE_COLORS, novaGroupDescription, novaGroupLabel, type NovaGroup, type ScoreResult } from "../lib/scoring";
import { buildGorillaTake } from "../lib/gorillaAnalysis";
import { buildNuanceNotes, INCOMPLETE_DATA_FLAG_PREFIX } from "../lib/nuanceNotes";
import NuanceNotes from "../../components/NuanceNotes";
import type { OffProduct } from "../lib/openFoodFacts";
import { productImage } from "../lib/openFoodFacts";
import type { Alternative } from "../lib/gorillaGuidance";
import AdditiveCard from "./AdditiveCard";
import EvidenceTierBadge from "../../components/EvidenceTierBadge";
import { detectExamineIngredients } from "../lib/examineDatabase";
import LabdoorCrossCheck from "./LabdoorCrossCheck";
import NhpBadge from "./NhpBadge";
import RecallBanner from "./RecallBanner";
import ResearchSummaryCard from "./ResearchSummaryCard";
import ScoreDisclaimer from "./ScoreDisclaimer";
import ScoreRing from "./ScoreRing";
import SourcesFooter from "./SourcesFooter";
import SourceBadge, { type DataSource } from "./SourceBadge";

const NOVA_COLOR: Record<NovaGroup, string> = {
  1: "#3ddc84",
  2: "#9fd6ff",
  3: "#ff9d2e",
  4: "#ff4d4d",
};

type Props = {
  product: OffProduct;
  result: ScoreResult;
  alternatives: Alternative[];
  alternativesLoading: boolean;
  dataSource?: DataSource;
};

export default function ProductResultCard({ product, result, alternatives, alternativesLoading, dataSource }: Props) {
  const image = productImage(product);
  const gradeColor = GRADE_COLORS[result.grade];
  const gorillaTake = buildGorillaTake(result.detectedAdditives, result.grade, result.flags);
  const researchIngredients = detectExamineIngredients(product.ingredients_text || product.ingredients_text_en);

  // Nuance notes (display-only): RULE 1 contested/emerging additive, RULE 2
  // incomplete data. The numeric swing is truthful only on the raw algorithm
  // path — gated/curated products rescale sub-scores, so suppress the number.
  const nuanceNotes = buildNuanceNotes(result, {
    allowNumericSwing: result.scoreSource === "algorithm",
  });
  // RULE 2 is condensed into the nuance note, so drop the raw incomplete-data
  // flag from the FLAGS list to avoid showing the same caveat twice.
  const displayFlags = result.flags.filter((f) => !f.includes(INCOMPLETE_DATA_FLAG_PREFIX));

  return (
    <div className="gorilla-card animate-rise overflow-hidden rounded-sm">
      <RecallBanner brand={product.brands} productName={product.product_name} />

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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-block rounded-sm border px-3 py-1 font-display text-sm tracking-[0.2em]"
              style={{ borderColor: gradeColor, color: gradeColor }}
            >
              {result.grade.toUpperCase()}
            </span>
            <NhpBadge productName={product.product_name} categoryTags={product.categories_tags} />
            {dataSource && <SourceBadge source={dataSource} />}
            {/* Score-source transparency badge — how this score was determined */}
            {/* GORILLA VERIFIED: only when data came from our own systems (not 3rd-party APIs).
                When UPC DB/OFF returns the product but the score is curated, the data source
                badge (UPC DATABASE / OPEN FOOD FACTS) already shows — adding Gorilla Verified
                on top is misleading since we didn't verify the product data, only the score. */}
            {result.scoreSource === "gorilla-verified" && (!dataSource || dataSource === "gorilla-cache" || dataSource === "gorilla-curated") && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/70 bg-gold/15 px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-gold" title="Score comes from the hand-verified Gorilla curated database">
                🦍 Gorilla Verified
              </span>
            )}
            {result.scoreSource === "brand-capped" && (
              <span className="inline-flex items-center rounded-sm border border-amber-500/60 bg-amber-500/12 px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-amber-300" title={result.capReason}>
                Brand Capped
              </span>
            )}
            {result.scoreSource === "ingredient-flagged" && (
              <span className="inline-flex items-center rounded-sm border border-red-500/60 bg-red-900/25 px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-red-300" title={result.capReason}>
                Ingredient Flagged
              </span>
            )}
            {result.scoreSource === "category-scored" && (
              <span className="inline-flex items-center rounded-sm border border-slate-500/60 bg-slate-700/25 px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-slate-300" title={result.capReason}>
                Category Scored
              </span>
            )}
          </div>
          <div className="mt-3 max-w-md">
            <LabdoorCrossCheck productName={product.product_name} brand={product.brands} categoryTags={product.categories_tags} />
          </div>
        </div>

        <ScoreRing score={result.finalScore} grade={result.grade} />
      </div>

      {/* SCORE BREAKDOWN */}
      <div className="grid grid-cols-1 gap-px border-b border-line bg-line sm:grid-cols-3">
        <div className="bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Nutrition Score</p>
          <p className="mt-1 font-display text-3xl text-foreground">{result.nutritionScore}<span className="text-base text-muted">/100</span></p>
          <p className="mt-1 text-xs text-muted">Weighted 60% of final score</p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Additive Score</p>
          <p className="mt-1 font-display text-3xl text-foreground">{result.additiveScore}<span className="text-base text-muted">/100</span></p>
          <p className="mt-1 text-xs text-muted">Weighted 30% of final score</p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Organic Bonus</p>
          <p className="mt-1 font-display text-3xl text-foreground">+{result.organicBonus}<span className="text-base text-muted">/10</span></p>
          <p className="mt-1 text-xs text-muted">
            {result.organicCertified ? "Organic certification detected — full bonus applied" : "No organic certification detected in labels/categories"}
          </p>
        </div>
      </div>

      <ScoreDisclaimer />

      {/* NUANCE NOTES — the honest asterisk, shown only on the rare subset where
          the bare score is misleading (contested/emerging additive, incomplete data). */}
      {nuanceNotes.length > 0 && (
        <div className="border-b border-line bg-surface px-6 py-4 sm:px-8">
          <NuanceNotes notes={nuanceNotes} />
        </div>
      )}

      {/* NOVA PROCESSING LEVEL */}
      {result.novaGroup !== null && (
        <div className="border-b border-line bg-surface p-6">
          <div className="flex flex-wrap items-start gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 font-display text-2xl"
              style={{
                borderColor: NOVA_COLOR[result.novaGroup],
                color: NOVA_COLOR[result.novaGroup],
              }}
            >
              {result.novaGroup}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                NOVA Group {result.novaGroup} · Processing Level
              </p>
              <p className="mt-1 font-display text-xl tracking-wide" style={{ color: NOVA_COLOR[result.novaGroup] }}>
                {novaGroupLabel(result.novaGroup)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{novaGroupDescription(result.novaGroup)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-px bg-line sm:grid-cols-2">
        {/* FLAGS */}
        <div className="bg-surface p-6">
          <h3 className="font-display text-xl tracking-wide text-foreground">
            <span className="text-red-400">⚠</span> Flags
          </h3>
          {displayFlags.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {displayFlags.map((flag, i) => (
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
              <AdditiveCard key={additive.id} additive={additive} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No flagged additives found in the ingredients list.</p>
        )}
      </div>

      {/* RESEARCH SUMMARIES — hardcoded Examine.com findings for detected supplement ingredients */}
      {researchIngredients.length > 0 && (
        <div className="border-t border-line p-6">
          <h3 className="font-display text-xl tracking-wide text-foreground">Research Summaries</h3>
          <p className="mt-1 text-xs text-muted">
            Curated findings on the supplement ingredients we detected — what each one does,
            how strong the evidence is, effective dose ranges, and safety considerations.
          </p>
          <div className="mt-3 space-y-2.5">
            {researchIngredients.map((ingredient) => (
              <ResearchSummaryCard key={ingredient.id} ingredient={ingredient} />
            ))}
          </div>
        </div>
      )}

      {/* GORILLA ANALYSIS */}
      <div className="border-t border-line bg-surface p-6">
        <h3 className="font-display text-xl tracking-wide text-foreground">
          <span className="text-gold">▲</span> Gorilla Analysis
        </h3>

        {gorillaTake.tierBreakdown.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Evidence on the concerns found:</span>
            {gorillaTake.tierBreakdown.map((b) => (
              <span key={b.tier} className="flex items-center gap-1.5">
                <EvidenceTierBadge tier={b.tier} />
                <span className="text-xs text-muted">×{b.count}</span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <p>
            <span className="font-display tracking-wide text-foreground">What the science says: </span>
            {gorillaTake.scienceSummary}
          </p>
          <p>
            <span className="font-display tracking-wide text-gold">Gorilla position: </span>
            {gorillaTake.positionStatement}
          </p>
        </div>
      </div>

      {/* ALTERNATIVES */}
      <div className="border-t border-line p-6">
        <h3 className="font-display text-xl tracking-wide text-foreground">Healthier Alternatives</h3>
        {alternativesLoading && (
          <p className="mt-3 text-sm text-muted">Searching for better options…</p>
        )}
        {!alternativesLoading && alternatives.length > 0 && (
          <div className="mt-4">
            {alternatives[0]?.type === "off-match" ? (
              /* OFF database matches — shown in a grid with score badge */
              <div className="grid gap-3 sm:grid-cols-3">
                {alternatives.map((alt) => {
                  if (alt.type !== "off-match") return null;
                  const altImage = productImage(alt.product);
                  return (
                    <div key={alt.product.code} className="gorilla-card overflow-hidden rounded-sm">
                      <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-1.5">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0 text-sky-400"
                        >
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M3 5v14a9 3 0 0 0 18 0V5" />
                          <path d="M3 12a9 3 0 0 0 18 0" />
                        </svg>
                        <span className="text-[9px] uppercase tracking-[0.18em] text-sky-400">
                          Open Food Facts Match
                        </span>
                        <span className="ml-auto font-display text-[10px] text-sky-400/70">
                          {alt.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-background">
                          {altImage ? (
                            <Image
                              src={altImage}
                              alt={alt.product.product_name ?? ""}
                              width={48}
                              height={48}
                              unoptimized
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="font-display text-base text-gold/40">G</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {alt.product.product_name}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {alt.product.brands || "Unknown brand"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Gorilla Suggestion cards — curated guidance when no OFF match found */
              <div className="space-y-3">
                {alternatives.map((alt, i) => {
                  if (alt.type !== "gorilla-suggestion") return null;
                  return (
                    <div
                      key={i}
                      className="rounded-sm border border-gold/25 bg-gold/5 p-5"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xl leading-none">🦍</span>
                        <span className="font-display tracking-wide text-gold">
                          Gorilla Suggestion
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted">{alt.headline}</p>
                      {alt.brands && (
                        <p className="mt-3 border-t border-gold/15 pt-3 text-xs leading-relaxed text-muted/70">
                          {alt.brands}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <SourcesFooter />
    </div>
  );
}
