"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import ProductResultCard from "./components/ProductResultCard";
import ScanResultSheet from "./components/ScanResultSheet";
import ScanHistory, { type HistoryEntry } from "./components/ScanHistory";
import GenericResultCard from "./components/GenericResultCard";
import DrugResultCard from "./components/DrugResultCard";
import {
  fetchAlternativesMultiLevel,
  lookupBarcode,
  productImage,
  scoringContext,
  resolveProductName,
  resolveBrand,
  type OffProduct,
} from "./lib/openFoodFacts";
import { gorillaSuggestionsFor, type Alternative } from "./lib/gorillaGuidance";
import { lookupBeautyBarcode, beautyProductImage, type ObfProduct } from "./lib/openBeautyFacts";
import { computeScore, GRADE_COLORS, type ScoreResult } from "./lib/scoring";
import { computeBeautyScore, type BeautyScoreResult } from "./lib/beautyScoring";
import BeautyResultCard from "./components/BeautyResultCard";
import {
  ALCOHOL_GRADE_COLORS,
  computeAlcoholScore,
  detectAlcoholKind,
  isAlcoholProduct,
  type AlcoholScoreResult,
} from "./lib/alcoholScoring";
import AlcoholResultCard from "./components/AlcoholResultCard";
import AlcoholSubmitForm from "./components/AlcoholSubmitForm";
import {
  lookupCommunityProduct,
  productTypeToAlcoholKind,
  productTypeToCategories,
  communityProductToNutriments,
} from "./lib/communityProducts";
import { logMissedScan } from "./lib/missedScans";
import { lookupColaCloud, lookupWineVybe, lookupWineAnalyzer, type FallbackAlcoholProduct } from "./lib/externalAlcohol";
import { lookupNutritionix, lookupFatSecret } from "./lib/externalFood";
import {
  lookupGoUpc,
  lookupDrugFacts,
  lookupUpcItemDb,
  lookupNihDsld,
  type GoUpcProduct,
  type DrugProduct,
  type NihDsldProduct,
} from "./lib/externalGeneral";
import { lookupCuratedByBarcode, lookupCuratedByName, overrideWithCurated } from "../alcohol/lib/products";
import type { DataSource } from "./components/SourceBadge";
import {
  trackBarcodeScanned,
  trackProductFound,
  trackProductNotFound,
  trackScanModeAlcohol,
  trackScanModeFood,
} from "../lib/gtag";
import ScanConfirmationOverlay from "./components/ScanConfirmationOverlay";
import NotifyMeForm from "./components/NotifyMeForm";
import SupplementResultCard from "./components/SupplementResultCard";
import { lookupCuratedFood } from "./lib/curatedFoods";
import { applyScoringGate } from "./lib/curatedScores";
import { lookupBarcodeAlias } from "./lib/barcodeAliases";
import MultiPackPrompt from "./components/MultiPackPrompt";
import {
  lookupProductCache,
  upsertProductCache,
  incrementScanCount,
  tryParseCategories,
} from "./lib/productCache";
import type { Nutriments } from "./lib/scoring";

const HISTORY_KEY = "gorilla-fuel-scan-history";
const MAX_HISTORY = 10;

const NON_ALCOHOL_NAME_WORDS = new Set([
  "shampoo", "conditioner", "lotion", "cream", "moisturizer", "serum",
  "foundation", "mascara", "lipstick", "blush", "eyeshadow", "concealer",
  "toothpaste", "deodorant", "antiperspirant", "soap", "bodywash",
  "sunscreen", "sunblock", "perfume", "cologne", "hairspray",
  "supplement", "vitamin", "capsule", "tablet", "softgel",
  "protein", "powder", "preworkout", "pre-workout", "creatine",
]);

function productNameContradictsAlcohol(productName: string): boolean {
  const words = productName.toLowerCase().split(/[\s,/()-]+/);
  return words.some((w) => NON_ALCOHOL_NAME_WORDS.has(w));
}

function validateConfidence(
  product: OffProduct,
  scannedBarcode: string
): { pass: boolean; reason: string } {
  const norm = (b: string) => b.replace(/^0+/, "") || "0";
  if (product.code && norm(product.code) !== norm(scannedBarcode)) {
    return { pass: false, reason: "barcode-mismatch" };
  }
  if (!product.product_name?.trim()) {
    return { pass: false, reason: "no-name" };
  }
  const hasIngredients = !!(product.ingredients_text || product.ingredients_text_en);
  const hasNutriments = !!(product.nutriments && Object.keys(product.nutriments).length > 0);
  const hasCategories = !!(product.categories_tags && product.categories_tags.length > 0);
  if (!hasIngredients && !hasNutriments && !hasCategories) {
    return { pass: false, reason: "no-data" };
  }
  return { pass: true, reason: "ok" };
}

const ALCOHOL_TERMS_REGEX = /\b(beer|lager|ale|ipa|stout|porter|pilsner|wheat\s*beer|cider|wine|ros[eé]|champagne|prosecco|spirits|whisky|whiskey|bourbon|vodka|rum|gin|tequila|mead|seltzer|hard\s*soda|hard\s*lemonade|hard\s*iced\s*tea|alcopop|malt|brew|brewed|brewed\s*with|distilled|fermented|alcoholic|alcohol|abv|%\s*alc|proof)\b/i;

/** Returns true when a product name contains alcohol-related language. */
function productNameIndicatesAlcohol(name: string): boolean {
  return ALCOHOL_TERMS_REGEX.test(name);
}

/**
 * CURATED OVERRIDE — DO NOT REMOVE.
 * Every food ScoreResult passes through the scoring gate before display:
 * curated lookup (hard return) → brand caps → category caps → ingredient
 * sanity check. See applyScoringGate() in lib/curatedScores.ts.
 */
function gateResult(base: ScoreResult, barcode: string, product: OffProduct): ScoreResult {
  const outcome = applyScoringGate(base.finalScore, {
    barcode,
    productName: product.product_name ?? "",
    brand: product.brands,
    ingredientsText: product.ingredients_text || product.ingredients_text_en,
    categoriesTags: product.categories_tags,
    novaGroup: product.nova_group ?? base.novaGroup,
  });

  // When the gate reduces the final score (curated override, brand cap, category cap),
  // proportionally scale the sub-scores so they never show 100/100 while the final
  // score is 22. UPC DB products often return with no NOVA/ingredients, leaving the
  // algorithm sub-scores inflated. Curated score takes priority; sub-scores follow.
  let nutritionScore = base.nutritionScore;
  let additiveScore = base.additiveScore;
  if (outcome.score < base.finalScore && base.finalScore > 0) {
    const ratio = outcome.score / base.finalScore;
    nutritionScore = Math.max(5, Math.round(base.nutritionScore * ratio));
    additiveScore = Math.max(5, Math.min(100, Math.round(base.additiveScore * ratio)));
  }

  return {
    ...base,
    finalScore: outcome.score,
    nutritionScore,
    additiveScore,
    grade: outcome.grade as ScoreResult["grade"],
    scoreSource: outcome.scoreSource,
    capReason: outcome.capReason,
    ...(outcome.flags && outcome.flags.length > 0 ? { flags: outcome.flags } : {}),
    ...(outcome.positives && outcome.positives.length > 0 ? { positives: outcome.positives } : {}),
    ...(outcome.capReason ? { flags: [...base.flags, `Score capped: ${outcome.capReason}`] } : {}),
  };
}

const ALCOHOL_CATEGORY_TERMS = new Set([
  "beers", "beer", "ales", "lagers", "stouts", "porters", "pilsners", "IPA & Craft Ale",
  "Cider", "wines", "red-wines", "white-wines", "rose-wines", "sparkling-wines",
  "spirits", "whiskeys", "whisky", "bourbon", "vodka", "rum", "gin", "tequila",
  "meads", "hard-seltzers", "seltzers", "alcoholic-beverages", "alcoholic-drinks",
  "alcopops", "fermented-beverages",
]);

/** Returns true when categories contain alcohol-specific terms. */
function categoriesIndicateAlcohol(categoriesTags: string[]): boolean {
  return categoriesTags.some((t) => {
    const slug = t.replace(/^[a-z]{2}:/, "").toLowerCase();
    return ALCOHOL_CATEGORY_TERMS.has(slug) || slug.includes("alcoholic") || slug.includes("beer") || slug.includes("wine") || slug.includes("spirit") || slug.includes("cider") || slug.includes("seltzer");
  });
}

/** Returns the first 2 meaningful category slugs from an OFF tags array for same-category comparison. */
function topCategorySlugs(tags: string[]): string[] {
  return tags
    .map((t) => t.replace(/^[a-z]{2}:/, "").toLowerCase())
    .filter((t) => t.length > 2)
    .slice(0, 3);
}

/** Returns true if two products share at least one top-level category. */
function sharesMainCategory(a: OffProduct, b: OffProduct): boolean {
  const aTags = new Set(topCategorySlugs(a.categories_tags ?? []));
  return topCategorySlugs(b.categories_tags ?? []).some((t) => aTags.has(t));
}

// ── Parallel external race ────────────────────────────────────────────────────
// Fires all 10 external sources simultaneously. First non-null result wins.
// With 1500ms per-call timeout, worst-case is 1.5s instead of 10 × 1.5s = 15s.

type ExternalHit =
  | { kind: "food"; data: OffProduct; source: DataSource }
  | { kind: "supplement"; data: NihDsldProduct }
  | { kind: "beauty"; data: ObfProduct }
  | { kind: "alcohol-fallback"; data: FallbackAlcoholProduct }
  | { kind: "generic"; data: GoUpcProduct }
  | { kind: "drug"; data: DrugProduct };

function raceExternalSources(barcode: string): Promise<ExternalHit | null> {
  return new Promise((resolve) => {
    let settled = false;
    let pending = 10;
    const settle = (hit: ExternalHit | null) => {
      if (!settled && hit !== null) { settled = true; resolve(hit); return; }
      if (--pending === 0 && !settled) resolve(null);
    };
    const fail = () => { if (--pending === 0 && !settled) resolve(null); };

    lookupUpcItemDb(barcode)
      .then((d) => settle(d ? { kind: "food", data: d, source: "upcitemdb" } : null)).catch(fail);
    lookupFatSecret(barcode)
      .then((d) => settle(d ? { kind: "food", data: d, source: "fatsecret" } : null)).catch(fail);
    lookupNihDsld(barcode)
      .then((d) => settle(d ? { kind: "supplement", data: d } : null)).catch(fail);
    lookupNutritionix(barcode)
      .then((d) => settle(d ? { kind: "food", data: d, source: "nutritionix" } : null)).catch(fail);
    lookupBeautyBarcode(barcode)
      .then((r) => settle(r.status === "found" ? { kind: "beauty", data: r.product } : null)).catch(fail);
    lookupWineVybe(barcode)
      .then((d) => settle(d ? { kind: "alcohol-fallback", data: d } : null)).catch(fail);
    lookupWineAnalyzer(barcode)
      .then((d) => settle(d ? { kind: "alcohol-fallback", data: d } : null)).catch(fail);
    lookupColaCloud(barcode)
      .then((d) => settle(d ? { kind: "alcohol-fallback", data: d } : null)).catch(fail);
    lookupGoUpc(barcode)
      .then((d) => settle(d ? { kind: "generic", data: d } : null)).catch(fail);
    lookupDrugFacts(barcode)
      .then((d) => settle(d ? { kind: "drug", data: d } : null)).catch(fail);
  });
}

function isCanadianBarcode(barcode: string): boolean {
  const digits = barcode.replace(/\D/g, "");
  const prefix3 = parseInt(digits.slice(0, 3), 10);
  if (isNaN(prefix3)) return false;
  return (prefix3 >= 0 && prefix3 <= 9) || (prefix3 >= 754 && prefix3 <= 755);
}

function hasCanadianOrGlobalMarketData(product: OffProduct): boolean {
  const tags = product.countries_tags ?? [];
  return tags.some(
    (t) => t === "en:canada" || t === "en:united-states" || t === "en:world"
  );
}

type LookupState =
  | { phase: "idle" }
  | { phase: "loading"; barcode: string }
  | { phase: "not-found"; barcode: string; message?: string }
  | { phase: "error"; barcode: string; message: string }
  | { phase: "found"; product: OffProduct; result: ScoreResult; lowConfidence?: boolean; dataSource: DataSource }
  | { phase: "found-beauty"; product: ObfProduct; result: BeautyScoreResult }
  | { phase: "found-alcohol"; product: OffProduct; result: AlcoholScoreResult; fromCommunity?: boolean; dataSource: DataSource; lcboVerified?: boolean }
  | { phase: "found-generic"; product: GoUpcProduct }
  | { phase: "found-drug"; product: DrugProduct }
  | { phase: "found-supplement"; product: NihDsldProduct };

/** Governs the fullscreen scan-confirmation overlay lifecycle. */
type ScanOverlayState =
  | { phase: "idle" }
  | { phase: "scanning" | "not-found"; barcode: string };

const FOUND_PHASES = new Set(["found", "found-alcohol", "found-beauty", "found-generic", "found-drug", "found-supplement"]);

export default function ScanClient() {
  const [scannerActive, setScannerActive] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [lookup, setLookup] = useState<LookupState>({ phase: "idle" });
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [fallbackProduct, setFallbackProduct] = useState<FallbackAlcoholProduct | null>(null);
  const [packSizeBadge, setPackSizeBadge] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);
  const inFlightRef = useRef<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // ── Scan confirmation overlay state ──────────────────────────────────────
  const [scanOverlay, setScanOverlay] = useState<ScanOverlayState>({ phase: "idle" });
  const [overlayExiting, setOverlayExiting] = useState(false);
  // Applied to the result area on scanner-triggered lookups for a stronger entrance
  const [resultFromScan, setResultFromScan] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore corrupt history
    }
  }, []);

  useEffect(() => {
    fetch("https://world.openfoodfacts.org/api/v2/product/0.json?fields=code", {
      cache: "no-store",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    import("@zxing/library").catch(() => {});
  }, []);

  // ── URL param pre-load: /scan?b=<barcode> (from universal search links) ────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const b = params.get("b");
    if (b && b.trim().length > 0) {
      runLookup(b.trim());
    }
    // Only fire once on mount; runLookup is stable via useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = scannerActive ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [scannerActive]);

  const scrollToResult = useCallback(() => {
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, []);

  const persistHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    } catch {
      // storage unavailable — non-critical
    }
  }, []);

  // ── Slow-search fallback: never spin past 2 s without showing something ──
  // After 2 s of lookup, surface the not-yet-in-database message and email
  // capture while the waterfall keeps running; a late hit replaces the panel.
  const [slowSearch, setSlowSearch] = useState(false);
  useEffect(() => {
    if (lookup.phase !== "loading") {
      setSlowSearch(false);
      return;
    }
    const t = window.setTimeout(() => setSlowSearch(true), 1000);
    return () => window.clearTimeout(t);
  }, [lookup]);

  // ── Overlay: 5-second not-found timeout ─────────────────────────────────
  // If the API hasn't returned a result after 5 s, flip the overlay to NOT FOUND.
  useEffect(() => {
    if (scanOverlay.phase !== "scanning") return;
    const bc = scanOverlay.barcode;
    const t = window.setTimeout(() => {
      setScanOverlay((prev) =>
        prev.phase === "scanning" && prev.barcode === bc
          ? { phase: "not-found", barcode: bc }
          : prev
      );
    }, 3000);
    return () => clearTimeout(t);
  }, [scanOverlay]);

  // ── Overlay: dismiss when a real result arrives ───────────────────────────
  // Only FOUND phases trigger the overlay exit — the overlay itself handles NOT FOUND UX.
  useEffect(() => {
    if (scanOverlay.phase === "idle") return;
    if (!FOUND_PHASES.has(lookup.phase)) return;
    setOverlayExiting(true);
    const t = window.setTimeout(() => {
      setScanOverlay({ phase: "idle" });
      setOverlayExiting(false);
      setResultFromScan(true);
      setScannerActive(false);
      scrollToResult();
    }, 320);
    return () => clearTimeout(t);
  }, [lookup.phase, scanOverlay.phase, scrollToResult]);

  const runLookup = useCallback(
    async (barcode: string) => {
      const trimmed = barcode.trim();
      if (!trimmed || inFlightRef.current === trimmed) return;

      inFlightRef.current = trimmed;
      setAlternatives([]);
      setAlternativesLoading(false);
      setSheetVisible(false);
      setShowSubmitForm(false);
      setFallbackProduct(null);
      setPackSizeBadge(null);
      setLookup({ phase: "loading", barcode: trimmed });

      // Hard timeout — never spin past 3 s. Master deadline over the full waterfall.
      const timeoutId = window.setTimeout(() => {
        if (inFlightRef.current === trimmed) {
          inFlightRef.current = null;
          trackProductNotFound(trimmed);
          setAlternativesLoading(false);
          setLookup({ phase: "not-found", barcode: trimmed });
        }
      }, 3_000);

      try {

        // ─────────────────────────────────────────────────────────
        // STEP 0 — GORILLA PRODUCT CACHE
        // Instantly return previously-scanned products without hitting
        // any external API. On miss, fall through to the full waterfall.
        //
        // CACHE_BYPASS_BARCODES: barcodes with known-contaminated cache entries
        // (e.g. OFF returned data for the wrong product, merging ingredients from
        // a different SKU). These always fall through to curatedFoods (STEP 2b).
        // ─────────────────────────────────────────────────────────
        const CACHE_BYPASS_BARCODES = new Set([
          "58300854519",   // Old El Paso Thick n Chunky Salsa — OFF returned taco seasoning data
          "058300854519",
          "0058300854519",
        ]);
        console.log("[Gorilla] STEP 0 — cache lookup for:", trimmed);
        try {
          const cached = await lookupProductCache(trimmed);
          const bypassCache = CACHE_BYPASS_BARCODES.has(trimmed) || CACHE_BYPASS_BARCODES.has(trimmed.replace(/^0+/, ""));
          if (cached && !bypassCache) {
            console.log("[Gorilla] STEP 0 HIT:", cached.product_name, "×", cached.scan_count);
            // Fire-and-forget: atomically increment scan count
            incrementScanCount(trimmed);

            if (!cached.is_alcohol && !cached.is_beauty && !cached.is_supplement) {
              // ── Food / generic product ────────────────────────────
              const cachedProduct: import("./lib/openFoodFacts").OffProduct = {
                code: cached.barcode,
                product_name: cached.product_name ?? "",
                brands: cached.brand ?? undefined,
                categories_tags: tryParseCategories(cached.categories),
                ingredients_text: cached.ingredients_text ?? undefined,
                nutriments: (cached.nutrition_data as Nutriments) ?? {},
                nova_group: cached.nova_group ?? undefined,
                image_front_url: cached.image_url ?? undefined,
              };
              // computeScore is re-run (not using cached.gorilla_score) because the
              // UI needs the full breakdown object (additivesFound, penalties, etc).
              // The cached score is used for the history entry so history stays
              // consistent even if scoring weights change between runs.
              const cachedResultBase = computeScore(
                cachedProduct.nutriments ?? {},
                cachedProduct.ingredients_text,
                scoringContext(cachedProduct)
              );
              // CURATED OVERRIDE — DO NOT REMOVE: every score passes the gate.
              const cachedResult = gateResult(cachedResultBase, trimmed, cachedProduct);
              trackProductFound("gorilla-cache", trimmed, cachedProduct.product_name);
              trackScanModeFood(trimmed, cachedProduct.product_name);
              setLookup({ phase: "found", product: cachedProduct, result: cachedResult, dataSource: "gorilla-cache" });
              setSheetVisible(true);
              persistHistory([
                {
                  barcode: trimmed,
                  name: cachedProduct.product_name || "Unknown Product",
                  brand: cachedProduct.brands || "Unknown Brand",
                  image: productImage(cachedProduct),
                  score: cachedResult.finalScore,
                  color: GRADE_COLORS[cachedResult.grade],
                  scannedAt: Date.now(),
                },
                ...history.filter((h) => h.barcode !== trimmed),
              ].slice(0, MAX_HISTORY));
              try {
                setAlternativesLoading(true);
                const cAlt = await fetchAlternativesMultiLevel(cachedProduct);
                const cBetter: Alternative[] = cAlt
                  .map((c) => {
                    const cr = computeScore(c.nutriments ?? {}, c.ingredients_text || c.ingredients_text_en, scoringContext(c));
                    return { candidate: c, candidateResult: cr };
                  })
                  .filter(({ candidate, candidateResult }) =>
                    sharesMainCategory(candidate, cachedProduct) && candidateResult.finalScore >= cachedResult.finalScore + 5
                  )
                  .sort((a, b) => b.candidateResult.finalScore - a.candidateResult.finalScore)
                  .slice(0, 3)
                  .map(({ candidate, candidateResult }) => ({ type: "off-match" as const, product: candidate, score: candidateResult.finalScore }));
                setAlternatives(cBetter.length > 0 ? cBetter : gorillaSuggestionsFor(cachedProduct.categories_tags ?? []));
              } finally {
                setAlternativesLoading(false);
              }
              inFlightRef.current = null;
              return;
            }

            if (cached.is_alcohol) {
              // ── Alcohol product ───────────────────────────────────
              const cachedProduct: import("./lib/openFoodFacts").OffProduct = {
                code: cached.barcode,
                product_name: cached.product_name ?? "",
                brands: cached.brand ?? undefined,
                categories_tags: tryParseCategories(cached.categories),
                nutriments: (cached.nutrition_data as Nutriments) ?? {},
                image_front_url: cached.image_url ?? undefined,
              };
              const alcoholResult = computeAlcoholScore(
                cachedProduct.nutriments ?? {},
                undefined,
                detectAlcoholKind(cachedProduct.categories_tags)
              );
              trackProductFound("gorilla-cache", trimmed, cachedProduct.product_name);
              trackScanModeAlcohol(trimmed, cachedProduct.product_name);
              setLookup({ phase: "found-alcohol", product: cachedProduct, result: alcoholResult, dataSource: "gorilla-cache" });
              setScannerActive(false);
              scrollToResult();
              persistHistory([
                {
                  barcode: trimmed,
                  name: cachedProduct.product_name || "Unknown Product",
                  brand: cachedProduct.brands || "Unknown Brand",
                  image: null,
                  score: alcoholResult.score,
                  color: ALCOHOL_GRADE_COLORS[alcoholResult.grade],
                  scannedAt: Date.now(),
                },
                ...history.filter((h) => h.barcode !== trimmed),
              ].slice(0, MAX_HISTORY));
              inFlightRef.current = null;
              return;
            }
            // is_beauty / is_supplement — can't fully reconstruct these product types
            // from cache. Fall through to the regular waterfall below.
            console.log("[Gorilla] STEP 0 cache hit but specialized product type — falling through to waterfall");
          }
        } catch (cacheErr) {
          console.warn("[Gorilla] STEP 0 cache lookup failed (non-fatal):", cacheErr);
        }

        // ─────────────────────────────────────────────────────────
        // STEP 1 — GORILLA CURATED DATABASE
        // Our own verified alcohol products take absolute priority.
        // ─────────────────────────────────────────────────────────
        console.log("[Gorilla] STEP 1 — curated alcohol check for:", trimmed);
        const curatedHit = lookupCuratedByBarcode(trimmed);
        if (curatedHit) {
          console.log("[Gorilla] STEP 1 HIT:", curatedHit.name, "barcode:", trimmed);
          const servingMl = curatedHit.servingMl ?? 355;
          const kind = curatedHit.category === "IPA & Craft Ale" ? "beer"
            : curatedHit.category === "Hard Seltzer" ? "seltzer"
            : curatedHit.category === "Cider" ? "cider"
            : "beer";
          const nutriments = {
            "energy-kcal_100g": (curatedHit.caloriesPerCan / servingMl) * 100,
            carbohydrates_100g: (curatedHit.carbsPerCan / servingMl) * 100,
            sugars_100g: (curatedHit.sugarPerCan / servingMl) * 100,
            alcohol_100g: curatedHit.abv,
          };
          const syntheticProduct: OffProduct = {
            code: trimmed,
            product_name: curatedHit.name,
            brands: curatedHit.brand,
            categories_tags: ["en:alcoholic-beverages", `en:${curatedHit.category.toLowerCase().replace(/\s+/g, "-")}`],
            nutriments,
          };
          const alcoholResult = computeAlcoholScore(nutriments, undefined, kind, servingMl);
          trackProductFound("gorilla-curated", trimmed, curatedHit.name);
          trackScanModeAlcohol(trimmed, curatedHit.name);
          setLookup({ phase: "found-alcohol", product: syntheticProduct, result: alcoholResult, dataSource: "gorilla-curated", lcboVerified: curatedHit.lcboVerified ?? false });
          setScannerActive(false);
          scrollToResult();
          const entry: HistoryEntry = {
            barcode: trimmed,
            name: curatedHit.name,
            brand: curatedHit.brand,
            image: null,
            score: alcoholResult.score,
            color: ALCOHOL_GRADE_COLORS[alcoholResult.grade],
            scannedAt: Date.now(),
          };
          persistHistory([entry, ...history.filter((h) => h.barcode !== entry.barcode)].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 2 — COMMUNITY SUPABASE DB
        // Verified community alcohol submissions (user-submitted, admin-reviewed).
        // ─────────────────────────────────────────────────────────
        console.log("[Gorilla] STEP 2 — community DB check for:", trimmed);
        const communityHit = await lookupCommunityProduct(trimmed);
        if (communityHit) {
          const kind = productTypeToAlcoholKind(communityHit.product_type);
          const nutriments = communityProductToNutriments(communityHit, kind);
          const syntheticProduct: OffProduct = {
            code: communityHit.barcode,
            product_name: communityHit.product_name,
            brands: communityHit.brand,
            categories_tags: productTypeToCategories(communityHit.product_type),
            nutriments,
          };
          const alcoholResult = computeAlcoholScore(nutriments, undefined, kind);
          setLookup({ phase: "found-alcohol", product: syntheticProduct, result: alcoholResult, fromCommunity: true, dataSource: "community" });
          setScannerActive(false);
          scrollToResult();
          const communityEntry: HistoryEntry = {
            barcode: communityHit.barcode,
            name: communityHit.product_name,
            brand: communityHit.brand || "Unknown Brand",
            image: null,
            score: alcoholResult.score,
            color: ALCOHOL_GRADE_COLORS[alcoholResult.grade],
            scannedAt: Date.now(),
          };
          persistHistory([communityEntry, ...history.filter((h) => h.barcode !== communityEntry.barcode)].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 2b — CURATED FOOD DATABASE
        // Hardcoded Canadian products — always returns a result if the
        // barcode is present, regardless of external API availability.
        // ─────────────────────────────────────────────────────────
        console.log("[Gorilla] STEP 2b — curated food check for:", trimmed);
        const curatedFoodHit = lookupCuratedFood(trimmed);
        if (curatedFoodHit) {
          console.log("[Gorilla] STEP 2b HIT:", curatedFoodHit.product_name);
          const cfBase = computeScore(
            curatedFoodHit.nutriments ?? {},
            curatedFoodHit.ingredients_text,
            scoringContext(curatedFoodHit)
          );
          // CURATED OVERRIDE — DO NOT REMOVE: every score passes the gate.
          const cfResult = gateResult(cfBase, trimmed, curatedFoodHit);
          trackProductFound("gorilla-curated", trimmed, curatedFoodHit.product_name);
          trackScanModeFood(trimmed, curatedFoodHit.product_name);
          setLookup({ phase: "found", product: curatedFoodHit, result: cfResult, dataSource: "gorilla-curated" });
          setSheetVisible(true);
          persistHistory([
            {
              barcode: trimmed,
              name: curatedFoodHit.product_name || "Unnamed Product",
              brand: curatedFoodHit.brands || "Unknown Brand",
              image: null,
              score: cfResult.finalScore,
              color: GRADE_COLORS[cfResult.grade],
              scannedAt: Date.now(),
            },
            ...history.filter((h) => h.barcode !== trimmed),
          ].slice(0, MAX_HISTORY));
          setAlternativesLoading(true);
          const cfCandidates = await fetchAlternativesMultiLevel(curatedFoodHit);
          const cfBetter: Alternative[] = cfCandidates
            .map((c) => {
              const cr = computeScore(c.nutriments ?? {}, c.ingredients_text || c.ingredients_text_en, scoringContext(c));
              return { candidate: c, candidateResult: cr };
            })
            .filter(({ candidate, candidateResult }) =>
              sharesMainCategory(candidate, curatedFoodHit) && candidateResult.finalScore >= cfResult.finalScore + 5
            )
            .sort((a, b) => b.candidateResult.finalScore - a.candidateResult.finalScore)
            .slice(0, 3)
            .map(({ candidate, candidateResult }) => ({ type: "off-match" as const, product: candidate, score: candidateResult.finalScore }));
          setAlternatives(cfBetter.length > 0 ? cfBetter : gorillaSuggestionsFor(curatedFoodHit.categories_tags ?? []));
          setAlternativesLoading(false);
          inFlightRef.current = null;
          return;
        }
        console.log("[Gorilla] STEP 2b MISS");

        // ─────────────────────────────────────────────────────────
        // STEP 3 — OPEN FOOD FACTS
        // Primary source for food, drink, and supplements worldwide.
        // ─────────────────────────────────────────────────────────
        console.log("[Gorilla] STEP 3 — OFF lookup for:", trimmed);
        let offResult;
        try {
          offResult = await lookupBarcode(trimmed);
          console.log("[Gorilla] STEP 3 response: status=", offResult.status, offResult.status === "found" ? offResult.product.product_name : "");
        } catch (offErr) {
          console.error("[Gorilla] STEP 3 OFF fetch error:", offErr);
          offResult = { status: "error" as const, message: String(offErr) };
        }

        if (offResult.status === "found") {
          const product = offResult.product;

          const confidence = validateConfidence(product, trimmed);
          if (!confidence.pass) {
            console.log("[Gorilla] STEP 3 confidence fail:", confidence.reason);
            // Confidence failed — fall through to further sources
          } else if ((product.categories_tags?.length ?? 0) > 0 && isAlcoholProduct(product.categories_tags!)) {
            // Strict validation: name or categories must confirm this is actually alcohol
            const nameConfirms = productNameIndicatesAlcohol(product.product_name || "");
            const catConfirms = categoriesIndicateAlcohol(product.categories_tags!);
            if (!nameConfirms && !catConfirms) {
              // Neither name nor categories confirm alcohol — reject, fall through to next source
            } else if (productNameContradictsAlcohol(product.product_name || "")) {
              logMissedScan(trimmed, "alcohol");
              setShowSubmitForm(true);
              setLookup({
                phase: "not-found",
                barcode: trimmed,
                message: "This barcode returned a non-alcohol product. If you scanned an alcoholic beverage, submit it below.",
              });
              inFlightRef.current = null;
              return;
            } else {
              // Name-override: if OFF's product name matches a curated entry, use our verified nutrition
              const curatedNameHit = overrideWithCurated(product.product_name || "", product.brands);
              if (curatedNameHit) {
                const servingMl = curatedNameHit.servingMl ?? 355;
                const kind = curatedNameHit.category === "IPA & Craft Ale" ? "beer" as const : curatedNameHit.category === "Hard Seltzer" ? "seltzer" as const : curatedNameHit.category === "Cider" ? "cider" as const : "beer" as const;
                const curatedNutriments = {
                  "energy-kcal_100g": (curatedNameHit.caloriesPerCan / servingMl) * 100,
                  carbohydrates_100g: (curatedNameHit.carbsPerCan / servingMl) * 100,
                  sugars_100g: (curatedNameHit.sugarPerCan / servingMl) * 100,
                  alcohol_100g: curatedNameHit.abv,
                };
                const overriddenProduct: OffProduct = { ...product, nutriments: curatedNutriments, product_name: curatedNameHit.name, brands: curatedNameHit.brand };
                const overrideResult = computeAlcoholScore(curatedNutriments, undefined, kind, servingMl);
                setLookup({ phase: "found-alcohol", product: overriddenProduct, result: overrideResult, dataSource: "gorilla-curated" });
                setScannerActive(false);
                scrollToResult();
                persistHistory([{ barcode: trimmed, name: curatedNameHit.name, brand: curatedNameHit.brand, image: null, score: overrideResult.score, color: ALCOHOL_GRADE_COLORS[overrideResult.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
                inFlightRef.current = null;
                return;
              }
              const alcoholResult = computeAlcoholScore(
                product.nutriments ?? {},
                product.ingredients_text || product.ingredients_text_en,
                detectAlcoholKind(product.categories_tags)
              );
              trackProductFound("open-food-facts", trimmed, product.product_name);
              trackScanModeAlcohol(trimmed, product.product_name);
              setLookup({ phase: "found-alcohol", product, result: alcoholResult, dataSource: "open-food-facts" });
              upsertProductCache({ barcode: trimmed, product_name: product.product_name, brand: product.brands ?? null, categories: JSON.stringify(product.categories_tags ?? []), nutrition_data: product.nutriments ?? null, gorilla_score: alcoholResult.score, score_grade: alcoholResult.grade, data_source: "open-food-facts", image_url: productImage(product) ?? null, is_alcohol: true });
              setSheetVisible(false);
              setScannerActive(false);
              scrollToResult();
              persistHistory([
                {
                  barcode: product.code,
                  name: product.product_name || "Unnamed Product",
                  brand: product.brands || "Unknown Brand",
                  image: productImage(product),
                  score: alcoholResult.score,
                  color: ALCOHOL_GRADE_COLORS[alcoholResult.grade],
                  scannedAt: Date.now(),
                },
                ...history.filter((h) => h.barcode !== product.code),
              ].slice(0, MAX_HISTORY));
              inFlightRef.current = null;
              return;
            }
          } else {
            // Food / supplement path
            // Normalize name (prefer English) and brand before any display or cache write.
            const displayName = resolveProductName(product);
            const displayBrand = resolveBrand(product);
            const product_ = { ...product, product_name: displayName || product.product_name, brands: displayBrand || product.brands };
            const resultBase = computeScore(
              product_.nutriments ?? {},
              product_.ingredients_text || product_.ingredients_text_en,
              scoringContext(product_)
            );
            // CURATED OVERRIDE — DO NOT REMOVE: every score passes the gate.
            const result = gateResult(resultBase, trimmed, product_);
            const lowConfidence = isCanadianBarcode(trimmed) && !hasCanadianOrGlobalMarketData(product_);
            trackProductFound("open-food-facts", trimmed, displayName);
            trackScanModeFood(trimmed, displayName);
            setLookup({ phase: "found", product: product_, result, lowConfidence, dataSource: "open-food-facts" });
            upsertProductCache({ barcode: trimmed, product_name: displayName || product_.product_name, brand: displayBrand || product_.brands || null, categories: JSON.stringify(product_.categories_tags ?? []), ingredients_text: product_.ingredients_text, nutrition_data: product_.nutriments ?? null, gorilla_score: result.finalScore, score_grade: result.grade, nova_group: product_.nova_group ?? null, data_source: "open-food-facts", image_url: productImage(product_) ?? null });
            setSheetVisible(true);
            persistHistory([
              {
                barcode: product_.code,
                name: displayName || "Unnamed Product",
                brand: displayBrand || "Unknown Brand",
                image: productImage(product_),
                score: result.finalScore,
                color: GRADE_COLORS[result.grade],
                scannedAt: Date.now(),
              },
              ...history.filter((h) => h.barcode !== product_.code),
            ].slice(0, MAX_HISTORY));
            setAlternativesLoading(true);
            const candidates = await fetchAlternativesMultiLevel(product_);
            const better: Alternative[] = candidates
              .map((candidate) => {
                const candidateResult = computeScore(
                  candidate.nutriments ?? {},
                  candidate.ingredients_text || candidate.ingredients_text_en,
                  scoringContext(candidate)
                );
                return { candidate, candidateResult };
              })
              .filter(({ candidate, candidateResult }) => {
                if (!sharesMainCategory(candidate, product_)) return false;
                const scoreGain = candidateResult.finalScore >= result.finalScore + 5;
                const fewerAdditives = candidateResult.detectedAdditives.length < result.detectedAdditives.length;
                const betterNova =
                  candidateResult.novaGroup !== null &&
                  result.novaGroup !== null &&
                  candidateResult.novaGroup < result.novaGroup;
                return scoreGain || fewerAdditives || betterNova;
              })
              .sort((a, b) => b.candidateResult.finalScore - a.candidateResult.finalScore)
              .slice(0, 3)
              .map(({ candidate, candidateResult }) => ({
                type: "off-match" as const,
                product: candidate,
                score: candidateResult.finalScore,
              }));
            setAlternatives(better.length > 0 ? better : gorillaSuggestionsFor(product_.categories_tags ?? []));
            setAlternativesLoading(false);
            inFlightRef.current = null;
            return;
          }
        }

        if (offResult.status === "error") {
          // Non-fatal OFF error — continue waterfall; don't abort for one bad API response.
          console.warn("[Gorilla] OFF error:", offResult.message);
        }

        // Helper: score and return a food result
        const returnFoodHit = async (hit: OffProduct, source: DataSource) => {
          // Name-override: if external DB found an alcohol product, defer to curated data
          const curatedOverride = overrideWithCurated(hit.product_name || "", hit.brands);
          if (curatedOverride) {
            const servingMl = curatedOverride.servingMl ?? 355;
            const kind = curatedOverride.category === "IPA & Craft Ale" ? "beer" as const : curatedOverride.category === "Hard Seltzer" ? "seltzer" as const : curatedOverride.category === "Cider" ? "cider" as const : "beer" as const;
            const cn = { "energy-kcal_100g": (curatedOverride.caloriesPerCan / servingMl) * 100, carbohydrates_100g: (curatedOverride.carbsPerCan / servingMl) * 100, sugars_100g: (curatedOverride.sugarPerCan / servingMl) * 100, alcohol_100g: curatedOverride.abv };
            const overrideResult = computeAlcoholScore(cn, undefined, kind, servingMl);
            const overriddenProduct: OffProduct = { ...hit, nutriments: cn, product_name: curatedOverride.name, brands: curatedOverride.brand };
            setLookup({ phase: "found-alcohol", product: overriddenProduct, result: overrideResult, dataSource: "gorilla-curated" });
            setScannerActive(false); scrollToResult();
            persistHistory([{ barcode: trimmed, name: curatedOverride.name, brand: curatedOverride.brand, image: null, score: overrideResult.score, color: ALCOHOL_GRADE_COLORS[overrideResult.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
            return;
          }
          const hitBase = computeScore(hit.nutriments ?? {}, hit.ingredients_text, scoringContext(hit));
          // CURATED OVERRIDE — DO NOT REMOVE: every score passes the gate.
          const result = gateResult(hitBase, trimmed, hit);
          upsertProductCache({ barcode: trimmed, product_name: hit.product_name, brand: hit.brands ?? null, categories: JSON.stringify(hit.categories_tags ?? []), ingredients_text: hit.ingredients_text, nutrition_data: hit.nutriments ?? null, gorilla_score: result.finalScore, score_grade: result.grade, nova_group: null, data_source: source, image_url: productImage(hit) ?? null });
          trackProductFound(source, trimmed, hit.product_name);
          trackScanModeFood(trimmed, hit.product_name);
          setLookup({ phase: "found", product: hit, result, dataSource: source });
          setSheetVisible(true);
          persistHistory([{ barcode: trimmed, name: hit.product_name || "Unnamed Product", brand: hit.brands || "Unknown Brand", image: productImage(hit), score: result.finalScore, color: GRADE_COLORS[result.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
          setAlternativesLoading(true);
          const candidates = await fetchAlternativesMultiLevel(hit);
          const better: Alternative[] = candidates
            .map((c) => { const cr = computeScore(c.nutriments ?? {}, c.ingredients_text || c.ingredients_text_en, scoringContext(c)); return { candidate: c, candidateResult: cr }; })
            .filter(({ candidate, candidateResult }) => sharesMainCategory(candidate, hit) && candidateResult.finalScore >= result.finalScore + 5)
            .sort((a, b) => b.candidateResult.finalScore - a.candidateResult.finalScore)
            .slice(0, 3)
            .map(({ candidate, candidateResult }) => ({ type: "off-match" as const, product: candidate, score: candidateResult.finalScore }));
          setAlternatives(better.length > 0 ? better : gorillaSuggestionsFor(hit.categories_tags ?? []));
          setAlternativesLoading(false);
        };

        // ─────────────────────────────────────────────────────────
        // STEPS 4-13 — ALL EXTERNAL SOURCES IN PARALLEL
        // First non-null result wins; 1.5s per-call abort means worst-case
        // here is 1.5s, not 10 × 1.5s = 15s sequential.
        // ─────────────────────────────────────────────────────────
        console.log("[Gorilla] STEPS 4-13 — parallel external race for:", trimmed);
        const extHit = await raceExternalSources(trimmed);

        if (extHit) {
          console.log("[Gorilla] parallel hit kind:", extHit.kind);
          switch (extHit.kind) {
            case "food": {
              await returnFoodHit(extHit.data, extHit.source);
              break;
            }
            case "supplement": {
              const nih = extHit.data;
              trackProductFound("nih-dsld", trimmed, nih.productName);
              setLookup({ phase: "found-supplement", product: nih });
              upsertProductCache({ barcode: trimmed, product_name: nih.productName, brand: nih.brandName ?? null, data_source: "nih-dsld", is_supplement: true });
              setScannerActive(false); scrollToResult();
              persistHistory([{ barcode: trimmed, name: nih.productName, brand: nih.brandName || "Unknown Brand", image: null, score: 0, color: "#3b82f6", scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
              break;
            }
            case "beauty": {
              const bp = extHit.data;
              const bs = computeBeautyScore(bp.ingredients_text || bp.ingredients_text_en);
              setLookup({ phase: "found-beauty", product: bp, result: bs });
              upsertProductCache({ barcode: bp.code, product_name: bp.product_name, brand: bp.brands ?? null, data_source: "open-beauty-facts", image_url: beautyProductImage(bp) ?? null, is_beauty: true });
              setScannerActive(false); scrollToResult();
              persistHistory([{ barcode: bp.code, name: bp.product_name || "Unnamed Product", brand: bp.brands || "Unknown Brand", image: beautyProductImage(bp), score: bs.score, color: GRADE_COLORS[bs.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== bp.code)].slice(0, MAX_HISTORY));
              break;
            }
            case "alcohol-fallback": {
              const ah = extHit.data;
              logMissedScan(trimmed, "alcohol");
              const curatedMatch = lookupCuratedByName(ah.name);
              const servingMl = curatedMatch?.servingMl ?? 355;
              const abv = ah.abv ?? curatedMatch?.abv ?? null;
              const nutriments = curatedMatch
                ? { "energy-kcal_100g": (curatedMatch.caloriesPerCan / servingMl) * 100, carbohydrates_100g: (curatedMatch.carbsPerCan / servingMl) * 100, sugars_100g: (curatedMatch.sugarPerCan / servingMl) * 100, alcohol_100g: abv ?? curatedMatch.abv }
                : abv !== null ? { alcohol_100g: abv } : {};
              const alcKind = ah.source === "Wine Analyzer" ? "wine" as const : "beer" as const;
              const alcCats = ["en:alcoholic-beverages", alcKind === "wine" ? "en:wines" : "en:beers"];
              const syntheticProduct: OffProduct = { code: trimmed, product_name: ah.name, brands: ah.brand || undefined, categories_tags: alcCats, nutriments };
              const alcoholResult = computeAlcoholScore(nutriments, undefined, alcKind);
              const alcSrc: DataSource = ah.source === "COLA Cloud" ? "cola-verified" : ah.source === "WineVybe" ? "winevybe" : "wine-analyzer";
              setFallbackProduct(ah);
              setLookup({ phase: "found-alcohol", product: syntheticProduct, result: alcoholResult, dataSource: alcSrc });
              upsertProductCache({ barcode: trimmed, product_name: ah.name, brand: ah.brand ?? null, categories: JSON.stringify(alcCats), nutrition_data: nutriments, gorilla_score: alcoholResult.score, score_grade: alcoholResult.grade, data_source: alcSrc, is_alcohol: true });
              setScannerActive(false); scrollToResult();
              persistHistory([{ barcode: trimmed, name: ah.name, brand: ah.brand || "Unknown Brand", image: null, score: alcoholResult.score, color: ALCOHOL_GRADE_COLORS[alcoholResult.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
              break;
            }
            case "generic": {
              const gh = extHit.data;
              setLookup({ phase: "found-generic", product: gh });
              setScannerActive(false); scrollToResult();
              persistHistory([{ barcode: trimmed, name: gh.name, brand: gh.brand || "Unknown Brand", image: gh.image, score: 0, color: "#6b7280", scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
              break;
            }
            case "drug": {
              setLookup({ phase: "found-drug", product: extHit.data });
              setScannerActive(false); scrollToResult();
              break;
            }
          }
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 14 — BARCODE ALIAS CHECK
        // Check for known multi-pack or case barcodes. If found,
        // return the parent single-unit product with a pack size badge.
        // ─────────────────────────────────────────────────────────
        console.log("[Gorilla] STEP 14 — alias check for:", trimmed);
        try {
          const aliasHit = await lookupBarcodeAlias(trimmed);
          if (aliasHit) {
            console.log("[Gorilla] STEP 14 alias hit:", aliasHit.parent_product_name, aliasHit.pack_size);
            const parentCurated = aliasHit.parent_barcode
              ? lookupCuratedByBarcode(aliasHit.parent_barcode)
              : null;
            const parentByName = parentCurated ?? lookupCuratedByName(aliasHit.parent_product_name);
            if (parentByName) {
              const servingMl = parentByName.servingMl ?? 355;
              const kind =
                parentByName.category === "IPA & Craft Ale" ? "beer" as const
                : parentByName.category === "Hard Seltzer" ? "seltzer" as const
                : parentByName.category === "Cider" ? "cider" as const
                : "beer" as const;
              const nutriments = {
                "energy-kcal_100g": (parentByName.caloriesPerCan / servingMl) * 100,
                carbohydrates_100g: (parentByName.carbsPerCan / servingMl) * 100,
                sugars_100g: (parentByName.sugarPerCan / servingMl) * 100,
                alcohol_100g: parentByName.abv,
              };
              const syntheticProduct: OffProduct = {
                code: aliasHit.parent_barcode ?? trimmed,
                product_name: parentByName.name,
                brands: parentByName.brand,
                categories_tags: [
                  "en:alcoholic-beverages",
                  `en:${parentByName.category.toLowerCase().replace(/\s+/g, "-")}`,
                ],
                nutriments,
              };
              const alcoholResult = computeAlcoholScore(nutriments, undefined, kind, servingMl);
              setPackSizeBadge(aliasHit.pack_size);
              trackProductFound("gorilla-curated", trimmed, parentByName.name);
              trackScanModeAlcohol(trimmed, parentByName.name);
              setLookup({
                phase: "found-alcohol",
                product: syntheticProduct,
                result: alcoholResult,
                dataSource: "gorilla-curated",
                lcboVerified: parentByName.lcboVerified ?? false,
              });
              setScannerActive(false);
              scrollToResult();
              persistHistory([
                { barcode: trimmed, name: parentByName.name, brand: parentByName.brand, image: null, score: alcoholResult.score, color: ALCOHOL_GRADE_COLORS[alcoholResult.grade], scannedAt: Date.now() },
                ...history.filter((h) => h.barcode !== trimmed),
              ].slice(0, MAX_HISTORY));
              inFlightRef.current = null;
              return;
            }
          }
        } catch (aliasErr) {
          console.warn("[Gorilla] alias lookup failed (non-fatal):", aliasErr);
        }

        // ─────────────────────────────────────────────────────────
        // STEP 15 — NOT FOUND
        // All sources exhausted. Log to missed_scans and show clean card.
        // ─────────────────────────────────────────────────────────
        console.log("[Gorilla] STEP 15 — all sources exhausted for:", trimmed);
        logMissedScan(trimmed, "unknown");
        trackProductNotFound(trimmed);
        setLookup({ phase: "not-found", barcode: trimmed });

      } catch (err) {
        console.error("[Gorilla] runLookup crashed:", err);
        setLookup({ phase: "error", barcode: trimmed, message: "Something went wrong — please try again." });
        setAlternativesLoading(false);
      } finally {
        clearTimeout(timeoutId);
        inFlightRef.current = null;
      }
    },
    [history, persistHistory, scrollToResult]
  );

  const handleDetected = useCallback(
    (barcode: string) => {
      trackBarcodeScanned(barcode);
      setScanOverlay({ phase: "scanning", barcode });
      setResultFromScan(false);
      runLookup(barcode);
    },
    [runLookup]
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      runLookup(manualBarcode);
      setManualBarcode("");
    }
  };

  const handleViewFull = useCallback(() => {
    setSheetVisible(false);
    setScannerActive(false);
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, []);

  const handleTryAgain = useCallback(() => {
    setLookup({ phase: "idle" });
    setShowSubmitForm(false);
    setScannerActive(true);
  }, []);

  const handleOverlayTryAgain = useCallback(() => {
    setScanOverlay({ phase: "idle" });
    setOverlayExiting(false);
    setLookup({ phase: "idle" });
    setShowSubmitForm(false);
    // scanner stays active — user can immediately re-scan
  }, []);

  const handleOverlaySubmit = useCallback(() => {
    const bc = scanOverlay.phase !== "idle" ? (scanOverlay as { phase: string; barcode: string }).barcode : "";
    setScanOverlay({ phase: "idle" });
    setOverlayExiting(false);
    setScannerActive(false);
    setShowSubmitForm(true);
    if (bc) setLookup({ phase: "not-found", barcode: bc });
  }, [scanOverlay]);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        <p className="font-display text-sm tracking-[0.3em] text-gold">LIVE PRODUCT SCANNER</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          Point. Scan. <span className="text-gold">Know.</span>
        </h1>
        <p className="mt-4 text-muted">
          Activate your camera, hold a barcode steady in the frame, and Gorilla
          Fuel checks 12 data sources instantly — food, supplements, alcohol, beauty,
          and medication barcodes all supported.
        </p>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setScannerActive(true)}
          className="gorilla-card pulse-glow flex w-full items-center justify-between gap-4 rounded-sm p-6 text-left transition-transform hover:scale-[1.01] sm:p-8"
        >
          <div>
            <h2 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
              Open Camera Scanner
            </h2>
            <p className="mt-1 text-sm text-muted">
              Launches a fullscreen scanner — point at any barcode to score it instantly.
            </p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-background">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" />
            </svg>
          </span>
        </button>
      </div>

      {/* RESULTS */}
      <div ref={resultRef} className={`mt-10${resultFromScan ? " animate-scan-result-rise" : ""}`}>
        {lookup.phase === "loading" && !slowSearch && (
          // Skeleton result card — instant visual confirmation the barcode was
          // detected, shaped like the product card that will replace it.
          <div className="gorilla-card overflow-hidden rounded-sm">
            <div className="flex items-center gap-2 border-b border-line bg-surface px-6 py-3">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-gold" />
              <p className="font-mono text-xs text-gold/70">{lookup.barcode}</p>
              <p className="ml-auto text-[10px] uppercase tracking-[0.2em] text-muted">Barcode detected — scoring…</p>
            </div>
            <div className="flex items-start justify-between gap-6 p-6">
              <div className="flex-1 space-y-3">
                <div className="h-6 w-3/4 animate-pulse rounded-sm bg-surface-2" />
                <div className="h-4 w-1/2 animate-pulse rounded-sm bg-surface-2" />
                <div className="mt-4 flex gap-2">
                  <div className="h-6 w-20 animate-pulse rounded-sm bg-surface-2" />
                  <div className="h-6 w-24 animate-pulse rounded-sm bg-surface-2" />
                </div>
              </div>
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-surface-2">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-surface p-5">
                  <div className="h-3 w-2/3 animate-pulse rounded-sm bg-surface-2" />
                  <div className="mt-2 h-7 w-1/3 animate-pulse rounded-sm bg-surface-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {lookup.phase === "loading" && slowSearch && (
          <div className="gorilla-card overflow-hidden rounded-sm">
            {/* Gold progress bar — replaces gorilla animation after 1 s */}
            <div className="h-1 w-full bg-surface-2">
              <div className="h-1 animate-[progress_2s_ease-in-out_infinite] bg-gold" />
            </div>
            <div className="px-6 py-5">
              <p className="font-display text-sm tracking-[0.2em] text-gold">SEARCHING 15 SOURCES…</p>
              <p className="mt-1 font-mono text-xs text-muted/60">{lookup.barcode}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Checking every database. If this takes more than 3 seconds the product is not in our system yet.
              </p>
              <NotifyMeForm barcode={lookup.barcode} productName={fallbackProduct?.name} />
            </div>
          </div>
        )}

        {lookup.phase === "not-found" && (
          <>
            <div className="gorilla-card overflow-hidden rounded-sm">
              <div className="border-b border-line bg-surface px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400/60" />
                  <p className="font-display text-sm uppercase tracking-[0.3em] text-amber-300/80">
                    Product Not Found
                  </p>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="font-mono text-xs text-gold/60">{lookup.barcode}</p>
                {fallbackProduct?.name && (
                  <p className="mt-2 font-display text-xl text-foreground">{fallbackProduct.name}</p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {lookup.message ?? "This product is not in our database yet. We have logged your scan and will add it soon."}
                </p>
                <NotifyMeForm barcode={lookup.barcode} productName={fallbackProduct?.name} />
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="rounded-sm bg-gold px-5 py-2.5 font-display text-sm tracking-widest text-background transition-colors hover:bg-gold/90"
                  >
                    Try Again
                  </button>
                  {!showSubmitForm && (
                    <button
                      type="button"
                      onClick={() => setShowSubmitForm(true)}
                      className="rounded-sm border border-gold/60 px-5 py-2.5 font-display text-sm tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
                    >
                      Submit This Product
                    </button>
                  )}
                </div>
                {!showSubmitForm && (
                  <p className="mt-3 text-xs text-muted/60">
                    Know what this is? Submit the product details and our team will review it.
                  </p>
                )}
              </div>
            </div>
            {showSubmitForm && (
              <AlcoholSubmitForm
                barcode={lookup.barcode}
                initialName={fallbackProduct?.name}
                initialBrand={fallbackProduct?.brand}
                initialAbv={fallbackProduct?.abv ?? undefined}
                dataSource={fallbackProduct?.source}
              />
            )}
            <MultiPackPrompt barcode={lookup.barcode} />
          </>
        )}

        {lookup.phase === "error" && (
          <div className="gorilla-card rounded-sm p-6">
            <h3 className="font-display text-2xl text-foreground">Lookup failed</h3>
            <p className="mt-2 text-sm text-muted">{lookup.message}</p>
            <button
              type="button"
              onClick={handleTryAgain}
              className="mt-4 rounded-sm border border-gold/60 px-5 py-2.5 font-display text-sm tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
            >
              Try Again
            </button>
          </div>
        )}

        {lookup.phase === "found" && (
          <>
            {lookup.lowConfidence && (
              <div className="mb-4 flex items-start gap-3 rounded-sm border border-amber-400/30 bg-amber-400/8 px-4 py-3">
                <span className="mt-0.5 shrink-0 text-amber-400">⚠</span>
                <p className="text-xs leading-relaxed text-amber-200/80">
                  <span className="font-display tracking-wide">Product found but data may be incomplete for the Canadian market.</span>{" "}
                  Verify nutritional values against the product label before relying on this score.
                </p>
              </div>
            )}
            <ProductResultCard
              product={lookup.product}
              result={lookup.result}
              alternatives={alternatives}
              alternativesLoading={alternativesLoading}
              dataSource={lookup.dataSource}
            />
          </>
        )}

        {lookup.phase === "found-beauty" && (
          <BeautyResultCard product={lookup.product} result={lookup.result} />
        )}

        {lookup.phase === "found-alcohol" && (
          <>
            {packSizeBadge && (
              <div className="mb-3 flex items-center gap-3 rounded-sm border border-sky-500/40 bg-sky-900/20 px-4 py-3">
                <span className="font-display text-sm tracking-[0.2em] text-sky-300">
                  📦 {packSizeBadge}
                </span>
                <p className="text-xs text-muted">Score is per single unit</p>
              </div>
            )}
            <AlcoholResultCard
              product={lookup.product}
              result={lookup.result}
              fromCommunity={lookup.fromCommunity}
              dataSource={lookup.dataSource}
              lcboVerified={lookup.lcboVerified}
            />
            {/* Show submit form below COLA cards so user can add missing nutrition */}
            {lookup.dataSource === "cola-verified" && !showSubmitForm && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(true)}
                  className="rounded-sm border border-gold/60 px-5 py-2.5 font-display text-sm tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
                >
                  Submit Nutrition Data
                </button>
              </div>
            )}
            {lookup.dataSource === "cola-verified" && showSubmitForm && (
              <AlcoholSubmitForm
                barcode={lookup.product.code}
                initialName={lookup.product.product_name}
                initialBrand={lookup.product.brands}
                initialAbv={lookup.result.abv ?? undefined}
                dataSource="COLA Cloud"
              />
            )}
          </>
        )}

        {lookup.phase === "found-generic" && (
          <GenericResultCard
            product={lookup.product}
            onSubmit={() => setShowSubmitForm(true)}
          />
        )}

        {lookup.phase === "found-drug" && (
          <DrugResultCard product={lookup.product} />
        )}

        {lookup.phase === "found-supplement" && (
          <SupplementResultCard product={lookup.product} />
        )}
      </div>

      <ScanHistory entries={history} onSelect={runLookup} onClear={() => persistHistory([])} />

      {/* Manual entry */}
      <div className="mt-16 border-t border-line pt-6 text-center">
        {manualOpen ? (
          <form onSubmit={handleManualSubmit} className="mx-auto flex max-w-sm flex-col gap-2 sm:flex-row">
            <input
              id="manual-barcode"
              type="text"
              inputMode="numeric"
              autoFocus
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Type barcode, e.g. 5000159484695"
              className="flex-1 rounded-sm border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-sm border border-gold px-4 py-2.5 font-display text-sm tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
            >
              Look Up
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setManualOpen(true)}
            className="text-sm text-muted underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-gold"
          >
            No camera? Enter a barcode manually
          </button>
        )}
      </div>

      {scannerActive && (
        <>
          <BarcodeScanner active={scannerActive} onDetected={handleDetected} onClose={() => setScannerActive(false)} />
          {sheetVisible && lookup.phase === "found" && (
            <ScanResultSheet
              product={lookup.product}
              result={lookup.result}
              onDismiss={() => setSheetVisible(false)}
              onViewFull={handleViewFull}
            />
          )}
          {scanOverlay.phase !== "idle" && (
            <ScanConfirmationOverlay
              phase={scanOverlay.phase}
              barcode={scanOverlay.barcode}
              exiting={overlayExiting}
              onTryAgain={handleOverlayTryAgain}
              onSubmit={handleOverlaySubmit}
            />
          )}
        </>
      )}
    </div>
  );
}
