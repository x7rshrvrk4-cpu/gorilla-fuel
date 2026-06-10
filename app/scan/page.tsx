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
import { lookupUsda, lookupNutritionix, lookupFatSecret } from "./lib/externalFood";
import {
  lookupGoUpc,
  lookupDrugFacts,
  lookupUpcItemDb,
  lookupBarcodeLookup,
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
import SupplementResultCard from "./components/SupplementResultCard";

const HISTORY_KEY = "gorilla-fuel-scan-history";
const MAX_HISTORY = 6;

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

const ALCOHOL_CATEGORY_TERMS = new Set([
  "beers", "beer", "ales", "lagers", "stouts", "porters", "pilsners", "ipas",
  "ciders", "wines", "red-wines", "white-wines", "rose-wines", "sparkling-wines",
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
  | { phase: "found-alcohol"; product: OffProduct; result: AlcoholScoreResult; fromCommunity?: boolean; dataSource: DataSource }
  | { phase: "found-generic"; product: GoUpcProduct }
  | { phase: "found-drug"; product: DrugProduct }
  | { phase: "found-supplement"; product: NihDsldProduct };

/** Governs the fullscreen scan-confirmation overlay lifecycle. */
type ScanOverlayState =
  | { phase: "idle" }
  | { phase: "scanning" | "not-found"; barcode: string };

const FOUND_PHASES = new Set(["found", "found-alcohol", "found-beauty", "found-generic", "found-drug", "found-supplement"]);

export default function ScanPage() {
  const [scannerActive, setScannerActive] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [lookup, setLookup] = useState<LookupState>({ phase: "idle" });
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [fallbackProduct, setFallbackProduct] = useState<FallbackAlcoholProduct | null>(null);
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
    }, 5000);
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
      setLookup({ phase: "loading", barcode: trimmed });

      // Hard timeout — if all API calls take longer than 12 s, show not-found
      // rather than spinning indefinitely.
      const timeoutId = window.setTimeout(() => {
        if (inFlightRef.current === trimmed) {
          inFlightRef.current = null;
          trackProductNotFound(trimmed);
          setAlternativesLoading(false);
          setLookup({ phase: "not-found", barcode: trimmed });
        }
      }, 12_000);

      try {

        // ─────────────────────────────────────────────────────────
        // STEP 1 — GORILLA CURATED DATABASE
        // Our own verified alcohol products take absolute priority.
        // ─────────────────────────────────────────────────────────
        const curatedHit = lookupCuratedByBarcode(trimmed);
        if (curatedHit) {
          const servingMl = curatedHit.servingMl ?? 355;
          const kind = curatedHit.category === "IPAs" ? "beer"
            : curatedHit.category === "Hard Seltzers" ? "seltzer"
            : curatedHit.category === "Ciders" ? "cider"
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
          setLookup({ phase: "found-alcohol", product: syntheticProduct, result: alcoholResult, dataSource: "gorilla-curated" });
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
        // STEP 3 — OPEN FOOD FACTS
        // Primary source for food, drink, and supplements worldwide.
        // ─────────────────────────────────────────────────────────
        const offResult = await lookupBarcode(trimmed);

        if (offResult.status === "found") {
          const product = offResult.product;

          const confidence = validateConfidence(product, trimmed);
          if (!confidence.pass) {
            // Confidence failed — fall through to further sources
          } else if (!product.categories_tags || product.categories_tags.length === 0) {
            // No categories — fall through
          } else if (isAlcoholProduct(product.categories_tags)) {
            // Strict validation: name or categories must confirm this is actually alcohol
            const nameConfirms = productNameIndicatesAlcohol(product.product_name || "");
            const catConfirms = categoriesIndicateAlcohol(product.categories_tags);
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
                const kind = curatedNameHit.category === "IPAs" ? "beer" as const : curatedNameHit.category === "Hard Seltzers" ? "seltzer" as const : curatedNameHit.category === "Ciders" ? "cider" as const : "beer" as const;
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
            const result = computeScore(
              product.nutriments ?? {},
              product.ingredients_text || product.ingredients_text_en,
              scoringContext(product)
            );
            const lowConfidence = isCanadianBarcode(trimmed) && !hasCanadianOrGlobalMarketData(product);
            trackProductFound("open-food-facts", trimmed, product.product_name);
            trackScanModeFood(trimmed, product.product_name);
            setLookup({ phase: "found", product, result, lowConfidence, dataSource: "open-food-facts" });
            setSheetVisible(true);
            persistHistory([
              {
                barcode: product.code,
                name: product.product_name || "Unnamed Product",
                brand: product.brands || "Unknown Brand",
                image: productImage(product),
                score: result.finalScore,
                color: GRADE_COLORS[result.grade],
                scannedAt: Date.now(),
              },
              ...history.filter((h) => h.barcode !== product.code),
            ].slice(0, MAX_HISTORY));
            setAlternativesLoading(true);
            const candidates = await fetchAlternativesMultiLevel(product);
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
                if (!sharesMainCategory(candidate, product)) return false;
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
            setAlternatives(better.length > 0 ? better : gorillaSuggestionsFor(product.categories_tags ?? []));
            setAlternativesLoading(false);
            inFlightRef.current = null;
            return;
          }
        }

        if (offResult.status === "error") {
          // Non-fatal OFF error — continue waterfall; don't abort for one bad API response.
          console.warn("[Gorilla] OFF error:", offResult.message);
        }

        // ─────────────────────────────────────────────────────────
        // STEPS 4–8 — PARALLEL NUTRITION BATCH
        // Fire UPCitemdb, USDA, FatSecret, NIH DSLD, and Barcode Lookup
        // simultaneously. Process results in priority order.
        // Each individual call has a 3-second server-side timeout.
        // ─────────────────────────────────────────────────────────
        const [upcRes, usdaRes, fsRes, nihRes, bclRes] = await Promise.allSettled([
          lookupUpcItemDb(trimmed),
          lookupUsda(trimmed),
          lookupFatSecret(trimmed),
          lookupNihDsld(trimmed),
          lookupBarcodeLookup(trimmed),
        ]);

        const upcHit   = upcRes.status  === "fulfilled" ? upcRes.value  : null;
        const usdaHit  = usdaRes.status === "fulfilled" ? usdaRes.value : null;
        const fsHit    = fsRes.status   === "fulfilled" ? fsRes.value   : null;
        const nihHit   = nihRes.status  === "fulfilled" ? nihRes.value  : null;
        const bclHit   = bclRes.status  === "fulfilled" ? bclRes.value  : null;

        // Helper: score and return a food result
        const returnFoodHit = async (hit: OffProduct, source: DataSource) => {
          // Name-override: if external DB found an alcohol product, defer to curated data
          const curatedOverride = overrideWithCurated(hit.product_name || "", hit.brands);
          if (curatedOverride) {
            const servingMl = curatedOverride.servingMl ?? 355;
            const kind = curatedOverride.category === "IPAs" ? "beer" as const : curatedOverride.category === "Hard Seltzers" ? "seltzer" as const : curatedOverride.category === "Ciders" ? "cider" as const : "beer" as const;
            const cn = { "energy-kcal_100g": (curatedOverride.caloriesPerCan / servingMl) * 100, carbohydrates_100g: (curatedOverride.carbsPerCan / servingMl) * 100, sugars_100g: (curatedOverride.sugarPerCan / servingMl) * 100, alcohol_100g: curatedOverride.abv };
            const overrideResult = computeAlcoholScore(cn, undefined, kind, servingMl);
            const overriddenProduct: OffProduct = { ...hit, nutriments: cn, product_name: curatedOverride.name, brands: curatedOverride.brand };
            setLookup({ phase: "found-alcohol", product: overriddenProduct, result: overrideResult, dataSource: "gorilla-curated" });
            setScannerActive(false); scrollToResult();
            persistHistory([{ barcode: trimmed, name: curatedOverride.name, brand: curatedOverride.brand, image: null, score: overrideResult.score, color: ALCOHOL_GRADE_COLORS[overrideResult.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
            return;
          }
          const result = computeScore(hit.nutriments ?? {}, hit.ingredients_text, scoringContext(hit));
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

        // STEP 4 — USDA (best nutrition data — checked first in nutrition priority)
        if (usdaHit) { await returnFoodHit(usdaHit, "usda"); inFlightRef.current = null; return; }

        // STEP 5 — FATSECRET
        if (fsHit) { await returnFoodHit(fsHit, "fatsecret"); inFlightRef.current = null; return; }

        // STEP 6 — BARCODE LOOKUP (may have nutrition data)
        if (bclHit && Object.keys(bclHit.nutriments ?? {}).length > 0) {
          await returnFoodHit(bclHit, "barcode-lookup");
          inFlightRef.current = null;
          return;
        }

        // STEP 7 — NIH DSLD (supplement labels — takes priority over identification-only)
        if (nihHit) {
          trackProductFound("nih-dsld", trimmed, nihHit.productName);
          setLookup({ phase: "found-supplement", product: nihHit });
          setScannerActive(false);
          scrollToResult();
          persistHistory([{ barcode: trimmed, name: nihHit.productName, brand: nihHit.brandName || "Unknown Brand", image: null, score: 0, color: "#3b82f6", scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // STEP 8 — UPCITEMDB (identification only — name/brand/category, no nutrition score)
        if (upcHit) { await returnFoodHit(upcHit, "upcitemdb"); inFlightRef.current = null; return; }

        // STEP 8b — BARCODE LOOKUP (identification-only fallback, no nutrition)
        if (bclHit) { await returnFoodHit(bclHit, "barcode-lookup"); inFlightRef.current = null; return; }

        // ─────────────────────────────────────────────────────────
        // STEP 9 — NUTRITIONIX (legacy; kept for backwards compat)
        // ─────────────────────────────────────────────────────────
        const nxHit = await lookupNutritionix(trimmed);
        if (nxHit) {
          await returnFoodHit(nxHit, "nutritionix");
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 10 — OPEN BEAUTY FACTS
        // Cosmetics database — purple BEAUTY PRODUCT banner.
        // ─────────────────────────────────────────────────────────
        const beautyResult = await lookupBeautyBarcode(trimmed);
        if (beautyResult.status === "found") {
          const beautyProduct = beautyResult.product;
          const beautyScore = computeBeautyScore(
            beautyProduct.ingredients_text || beautyProduct.ingredients_text_en
          );
          setLookup({ phase: "found-beauty", product: beautyProduct, result: beautyScore });
          setScannerActive(false);
          scrollToResult();
          persistHistory([
            {
              barcode: beautyProduct.code,
              name: beautyProduct.product_name || "Unnamed Product",
              brand: beautyProduct.brands || "Unknown Brand",
              image: beautyProductImage(beautyProduct),
              score: beautyScore.score,
              color: GRADE_COLORS[beautyScore.grade],
              scannedAt: Date.now(),
            },
            ...history.filter((h) => h.barcode !== beautyProduct.code),
          ].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 11 — WINEVYBE (RapidAPI beer/wine DB)
        // Requires RAPIDAPI_KEY env var. For alcohol products.
        // ─────────────────────────────────────────────────────────
        const wineVybeHit = await lookupWineVybe(trimmed);
        if (wineVybeHit) {
          logMissedScan(trimmed, "alcohol");
          const abv = wineVybeHit.abv;
          const nutriments = abv !== null ? { alcohol_100g: abv } : {};
          const syntheticProduct: OffProduct = {
            code: trimmed,
            product_name: wineVybeHit.name,
            brands: wineVybeHit.brand || undefined,
            categories_tags: ["en:alcoholic-beverages", "en:beers"],
            nutriments,
          };
          const alcoholResult = computeAlcoholScore(nutriments, undefined, "beer");
          setFallbackProduct(wineVybeHit);
          setLookup({ phase: "found-alcohol", product: syntheticProduct, result: alcoholResult, dataSource: "winevybe" });
          setScannerActive(false);
          scrollToResult();
          persistHistory([{ barcode: trimmed, name: wineVybeHit.name, brand: wineVybeHit.brand || "Unknown Brand", image: null, score: alcoholResult.score, color: ALCOHOL_GRADE_COLORS[alcoholResult.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 12 — WINE ANALYZER (wine-specific fallback after WineVybe)
        // ─────────────────────────────────────────────────────────
        const wineAnalyzerHit = await lookupWineAnalyzer(trimmed);
        if (wineAnalyzerHit) {
          logMissedScan(trimmed, "alcohol");
          const abv = wineAnalyzerHit.abv;
          const nutriments = abv !== null ? { alcohol_100g: abv } : {};
          const syntheticProduct: OffProduct = {
            code: trimmed,
            product_name: wineAnalyzerHit.name,
            brands: wineAnalyzerHit.brand || undefined,
            categories_tags: ["en:alcoholic-beverages", "en:wines"],
            nutriments,
          };
          const alcoholResult = computeAlcoholScore(nutriments, undefined, "wine");
          setFallbackProduct(wineAnalyzerHit);
          setLookup({ phase: "found-alcohol", product: syntheticProduct, result: alcoholResult, dataSource: "wine-analyzer" });
          setScannerActive(false);
          scrollToResult();
          persistHistory([{ barcode: trimmed, name: wineAnalyzerHit.name, brand: wineAnalyzerHit.brand || "Unknown Brand", image: null, score: alcoholResult.score, color: ALCOHOL_GRADE_COLORS[alcoholResult.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 13 — COLA CLOUD (TTB Government Alcohol Registry)
        // Free US government API. Certificate of Label Approval records.
        // ─────────────────────────────────────────────────────────
        const colaHit = await lookupColaCloud(trimmed);
        if (colaHit) {
          logMissedScan(trimmed, "alcohol");
          const curatedMatch = lookupCuratedByName(colaHit.name);
          const servingMl = curatedMatch?.servingMl ?? 355;
          const abv = colaHit.abv ?? curatedMatch?.abv ?? null;
          const nutriments = curatedMatch
            ? {
                "energy-kcal_100g": (curatedMatch.caloriesPerCan / servingMl) * 100,
                carbohydrates_100g: (curatedMatch.carbsPerCan / servingMl) * 100,
                sugars_100g: (curatedMatch.sugarPerCan / servingMl) * 100,
                alcohol_100g: abv ?? curatedMatch.abv,
              }
            : abv !== null
            ? { alcohol_100g: abv }
            : {};
          const syntheticProduct: OffProduct = {
            code: trimmed,
            product_name: colaHit.name,
            brands: colaHit.brand || undefined,
            categories_tags: ["en:alcoholic-beverages", "en:beers"],
            nutriments,
          };
          const alcoholResult = computeAlcoholScore(nutriments, undefined, "beer");
          setFallbackProduct(colaHit);
          setLookup({ phase: "found-alcohol", product: syntheticProduct, result: alcoholResult, dataSource: "cola-verified" });
          setScannerActive(false);
          scrollToResult();
          persistHistory([{ barcode: trimmed, name: colaHit.name, brand: colaHit.brand || "Unknown Brand", image: null, score: alcoholResult.score, color: ALCOHOL_GRADE_COLORS[alcoholResult.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 14 — GO-UPC
        // 500M+ products worldwide. Returns name, brand, image, category.
        // Requires GOUPC_API_KEY env var. No nutrition scoring available.
        // ─────────────────────────────────────────────────────────
        const goupcHit = await lookupGoUpc(trimmed);
        if (goupcHit) {
          setLookup({ phase: "found-generic", product: goupcHit });
          setScannerActive(false);
          scrollToResult();
          persistHistory([{ barcode: trimmed, name: goupcHit.name, brand: goupcHit.brand || "Unknown Brand", image: goupcHit.image, score: 0, color: "#6b7280", scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 15 — OPEN DRUG FACTS
        // OTC drugs and medications. Blue MEDICATION banner + disclaimer.
        // ─────────────────────────────────────────────────────────
        const drugHit = await lookupDrugFacts(trimmed);
        if (drugHit) {
          setLookup({ phase: "found-drug", product: drugHit });
          setScannerActive(false);
          scrollToResult();
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 16 — NOT FOUND
        // All sources exhausted. Log to missed_scans and show clean card.
        // ─────────────────────────────────────────────────────────
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
        {lookup.phase === "loading" && (
          <div className="gorilla-card flex items-center gap-4 rounded-sm p-6">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="text-muted">Looking up barcode {lookup.barcode}…</p>
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
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {lookup.message ?? "We checked 8 databases and this product is not in any of them yet."}
                </p>
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
            <AlcoholResultCard
              product={lookup.product}
              result={lookup.result}
              fromCommunity={lookup.fromCommunity}
              dataSource={lookup.dataSource}
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

      <ScanHistory entries={history} onSelect={runLookup} />

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
