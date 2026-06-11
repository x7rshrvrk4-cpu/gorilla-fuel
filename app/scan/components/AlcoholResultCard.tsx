"use client";

import Image from "next/image";
import { useState } from "react";
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
import SourceBadge, { type DataSource } from "./SourceBadge";

type Props = {
  product: OffProduct;
  result: AlcoholScoreResult;
  fromCommunity?: boolean;
  dataSource?: DataSource;
  lcboVerified?: boolean;
};

const RISK_COLOR: Record<string, string> = {
  high: "border-red-500/50 text-red-400 bg-red-500/10",
  medium: "border-amber-400/50 text-amber-300 bg-amber-400/10",
  low: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
};

type NutritionMetric = "calories" | "carbs" | "sugar" | "abv";

function nutritionTextColor(value: number | null, metric: NutritionMetric): string {
  if (value === null) return "text-slate-500";
  switch (metric) {
    case "calories":
      return value < 100 ? "text-emerald-400" : value <= 150 ? "text-amber-400" : "text-red-400";
    case "carbs":
      return value < 3 ? "text-emerald-400" : value <= 7 ? "text-amber-400" : "text-red-400";
    case "sugar":
      return value < 2 ? "text-emerald-400" : value <= 5 ? "text-amber-400" : "text-red-400";
    case "abv":
      return value < 4 ? "text-emerald-400" : value <= 6 ? "text-amber-400" : "text-red-400";
  }
}

function ScoreDial({ score, color }: { score: number; color: string }) {
  const size = 88;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl leading-none text-white">{score}</span>
        <span className="text-[9px] uppercase tracking-[0.15em] text-slate-400">/100</span>
      </div>
    </div>
  );
}

function GorillaPour({ rating }: { rating: number }) {
  return (
    <span aria-label={`Gorilla Pour rating: ${rating} out of 5`} className="inline-flex gap-1 text-2xl leading-none">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-20 grayscale"}>🦍</span>
      ))}
    </span>
  );
}

export default function AlcoholResultCard({ product, result, fromCommunity, dataSource, lcboVerified }: Props) {
  const [additivesOpen, setAdditivesOpen] = useState(false);

  const image = productImage(product);
  const kind = detectAlcoholKind(product.categories_tags);
  const emoji = kindEmoji(kind);
  const gradeColor = ALCOHOL_GRADE_COLORS[result.grade];
  const glutenFree = isCertifiedGlutenFree(product.labels_tags);
  const organic = isCertifiedOrganic(product.labels_tags);

  const isWine = kind === "wine";

  return (
    <div className={`animate-rise overflow-hidden rounded-sm border bg-slate-950 ${
      isWine
        ? "border-rose-800/30 shadow-[0_0_40px_-12px_rgba(136,19,55,0.25)]"
        : "border-amber-400/20 shadow-[0_0_40px_-12px_rgba(251,191,36,0.15)]"
    }`}>

      {/* ALCOHOL / WINE BANNER */}
      <div className={`flex flex-wrap items-center gap-2 border-b px-6 py-3 ${
        isWine ? "border-rose-800/30 bg-rose-950/60" : "border-amber-400/25 bg-slate-900"
      }`}>
        <span className={`h-2 w-2 shrink-0 animate-pulse rounded-full ${isWine ? "bg-rose-500" : "bg-amber-400"}`} />
        <p className={`font-display text-sm uppercase tracking-[0.3em] ${isWine ? "text-rose-300" : "text-amber-300"}`}>
          {emoji} {kindLabel(kind)} · {isWine ? "Wine Mode" : "Alcohol Mode"}
        </p>
        <div className="ml-auto flex flex-wrap gap-2">
          {lcboVerified && (
            <span className="rounded-sm border border-sky-500/60 bg-sky-500/15 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-sky-300">
              LCBO Verified
            </span>
          )}
          {fromCommunity && (
            <SourceBadge source="community" />
          )}
          {!fromCommunity && dataSource && (
            <SourceBadge source={dataSource} />
          )}
        </div>
      </div>

      {/* COLA VERIFIED — government-record notice */}
      {dataSource === "cola-verified" && (
        <div className="border-b border-indigo-500/20 bg-indigo-500/5 px-6 py-3">
          <p className="text-[10px] leading-relaxed text-indigo-300/80">
            <span className="font-display tracking-wide text-indigo-200">ABV confirmed via U.S. TTB Certificate of Label Approval (COLA).</span>{" "}
            This is a government-issued alcohol label registration — the ABV figure comes directly from a federally filed label submission.
          </p>
        </div>
      )}

      {/* ALCOHOL NUTRITION GAP — shown when nutrition data is missing (common for Canadian alcohol) */}
      {(result.kcalPerServing === null || result.carbsPerServing === null) && (
        <div className={`border-b px-6 py-3 ${isWine ? "border-rose-800/20 bg-rose-950/30" : "border-amber-400/20 bg-amber-400/5"}`}>
          <p className={`text-[10px] leading-relaxed ${isWine ? "text-rose-300/70" : "text-amber-300/70"}`}>
            <span className={`font-display tracking-wide ${isWine ? "text-rose-300/90" : "text-amber-300/90"}`}>
              {isWine ? "Full wine nutrition may not be available in our database yet." : "Canadian alcohol labelling laws do not require breweries to disclose full nutrition information."}
            </span>{" "}
            ABV is verified. Calorie and sugar data where shown is sourced from winery disclosures and community submissions.
            If you know the nutrition data for this product,{" "}
            <span className={`underline decoration-1 underline-offset-2 ${isWine ? "text-rose-300" : "text-amber-300"}`}>tap Submit below</span>{" "}
            to help build the database.
          </p>
        </div>
      )}

      {/* COMPACT PRODUCT IDENTITY */}
      <div className="flex items-center gap-4 border-b border-slate-800 px-5 py-4 sm:px-6">
        {image && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-800 bg-slate-900">
            <Image
              src={image}
              alt={product.product_name ?? "Product"}
              width={48}
              height={48}
              unoptimized
              className="h-full w-full object-contain"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{product.brands || "Unknown Brand"} · {product.code}</p>
          <h2 className="font-display text-xl leading-tight text-white sm:text-2xl">{product.product_name || "Unnamed Product"}</h2>
        </div>
      </div>

      {/* ── NUTRITION GRID — the first substantive data the eye lands on ── */}
      <div className="grid grid-cols-2 gap-px bg-slate-800">

        {/* Calories */}
        <div className="flex flex-col justify-between bg-slate-950 p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Calories · per {result.referenceServingMl}mL
          </p>
          <div className="mt-3">
            <span className={`font-display text-5xl leading-none sm:text-6xl ${nutritionTextColor(result.kcalPerServing, "calories")}`}>
              {result.kcalPerServing ?? "—"}
            </span>
            {result.kcalPerServing !== null && (
              <span className="ml-1.5 text-xs text-slate-500">kcal</span>
            )}
          </div>
        </div>

        {/* Carbs */}
        <div className="flex flex-col justify-between bg-slate-950 p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Carbs · per {result.referenceServingMl}mL
          </p>
          <div className="mt-3">
            <span className={`font-display text-5xl leading-none sm:text-6xl ${nutritionTextColor(result.carbsPerServing, "carbs")}`}>
              {result.carbsPerServing ?? "—"}
            </span>
            {result.carbsPerServing !== null && (
              <span className="ml-1.5 text-xs text-slate-500">g</span>
            )}
          </div>
        </div>

        {/* Sugar */}
        <div className="flex flex-col justify-between bg-slate-950 p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Sugar · per {result.referenceServingMl}mL
          </p>
          <div className="mt-3">
            <span className={`font-display text-5xl leading-none sm:text-6xl ${nutritionTextColor(result.sugarPerServing, "sugar")}`}>
              {result.sugarPerServing ?? "—"}
            </span>
            {result.sugarPerServing !== null ? (
              <span className="ml-1.5 text-xs text-slate-500">g</span>
            ) : (
              <p className="mt-1.5 text-[10px] leading-tight text-slate-600">
                Sugar data not disclosed by manufacturer
              </p>
            )}
          </div>
        </div>

        {/* ABV */}
        <div className="flex flex-col justify-between bg-slate-950 p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Alcohol by Volume
          </p>
          <div className="mt-3">
            <span className={`font-display text-5xl leading-none sm:text-6xl ${nutritionTextColor(result.abv, "abv")}`}>
              {result.abv ?? "—"}
            </span>
            {result.abv !== null && (
              <span className="ml-1.5 text-xs text-slate-500">% ABV</span>
            )}
          </div>
        </div>
      </div>

      {/* GORILLA POUR */}
      <div className="flex flex-col gap-1 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Gorilla Pour · Fitness Friendliness</p>
          <div className="mt-2">
            <GorillaPour rating={result.gorillaPour} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 sm:mt-0">
          <ScoreDial score={result.score} color={gradeColor} />
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Cleanliness Score</p>
            <p className="mt-0.5 font-display text-xl" style={{ color: gradeColor }}>
              {result.grade}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {glutenFree && (
                <span className="rounded-sm border border-sky-400/50 bg-sky-400/10 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.18em] text-sky-300">
                  Gluten Free
                </span>
              )}
              {organic && (
                <span className="rounded-sm border border-emerald-400/50 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.18em] text-emerald-300">
                  Organic
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlcoholDisclaimer />

      {/* FLAGS / POSITIVES */}
      {(result.flags.length > 0 || result.positives.length > 0) && (
        <div className="grid gap-px bg-slate-800 sm:grid-cols-2">
          {result.flags.length > 0 && (
            <div className="bg-slate-950 p-5">
              <h3 className="font-display text-lg tracking-wide text-white">
                <span className="text-red-400">⚠</span> Flags
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-400">
                {result.flags.map((flag, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 text-red-400">—</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.positives.length > 0 && (
            <div className="bg-slate-950 p-5">
              <h3 className="font-display text-lg tracking-wide text-white">
                <span className="text-emerald-400">✓</span> Positives
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-400">
                {result.positives.map((pos, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 text-emerald-400">—</span>
                    <span>{pos}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* COLLAPSIBLE ADDITIVES SECTION */}
      <div className="border-t border-slate-800">
        <button
          type="button"
          onClick={() => setAdditivesOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-900/50 sm:px-6"
          aria-expanded={additivesOpen}
        >
          <span className="font-display text-lg tracking-wide text-white">Additional Ingredients Info</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`shrink-0 text-slate-400 transition-transform duration-200 ${additivesOpen ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {additivesOpen && (
          <div className="border-t border-slate-800 px-5 pb-6 pt-4 sm:px-6">
            <p className="mb-4 text-xs leading-relaxed text-slate-400">
              Screened for caramel colours, sulfite preservatives, foam/clarity stabilizers, DMDC, isinglass,
              carrageenan, high fructose corn syrup, artificial sweeteners (aspartame, acesulfame K, sucralose,
              saccharin), preservatives (sodium benzoate, potassium benzoate), artificial colours, citric acid,
              and flavour additives.
            </p>

            {!result.hasIngredients ? (
              <div className="rounded-sm border border-amber-400/30 bg-amber-400/5 p-4">
                <p className="text-sm leading-relaxed text-amber-200">
                  <span className="font-display tracking-wide">Ingredient list not available from Open Food Facts.</span>{" "}
                  Canadian alcohol labelling laws do not require full ingredient disclosure. We cannot confirm this
                  product is additive-free — the absence of a list should not be read as a clean bill of health.
                </p>
              </div>
            ) : result.detectedAdditives.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
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
              <p className="text-sm text-slate-400">
                None of our flagged beer and alcohol additives were found in the ingredients list.
              </p>
            )}
          </div>
        )}
      </div>

      <SourcesFooter />
    </div>
  );
}
