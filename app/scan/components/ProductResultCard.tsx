import Image from "next/image";
import { GRADE_COLORS, novaGroupDescription, novaGroupLabel, type NovaGroup, type ScoreResult } from "../lib/scoring";
import { buildGorillaTake } from "../lib/gorillaAnalysis";
import type { OffProduct } from "../lib/openFoodFacts";
import { productImage } from "../lib/openFoodFacts";
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

const NOVA_COLOR: Record<NovaGroup, string> = {
  1: "#3ddc84",
  2: "#9fd6ff",
  3: "#ff9d2e",
  4: "#ff4d4d",
};

type Props = {
  product: OffProduct;
  result: ScoreResult;
  alternatives: OffProduct[];
  alternativesLoading: boolean;
};

export default function ProductResultCard({ product, result, alternatives, alternativesLoading }: Props) {
  const image = productImage(product);
  const gradeColor = GRADE_COLORS[result.grade];
  const gorillaTake = buildGorillaTake(result.detectedAdditives, result.grade);
  const researchIngredients = detectExamineIngredients(product.ingredients_text || product.ingredients_text_en);

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

      <SourcesFooter />
    </div>
  );
}
