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
import { lookupColaCloud, lookupWineVybe, type FallbackAlcoholProduct } from "./lib/externalAlcohol";
import { lookupUsda, lookupNutritionix } from "./lib/externalFood";
import { lookupGoUpc, lookupDrugFacts, type GoUpcProduct, type DrugProduct } from "./lib/externalGeneral";
import { lookupCuratedByBarcode, lookupCuratedByName, overrideWithCurated } from "../alcohol/lib/products";
import type { DataSource } from "./components/SourceBadge";

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
  | { phase: "found-drug"; product: DrugProduct };

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

  const persistHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    } catch {
      // storage unavailable — non-critical
    }
  }, []);

  const scrollToResult = useCallback(() => {
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, []);

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
          const alcoholResult = computeAlcoholScore(nutriments, undefined, kind);
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
            if (productNameContradictsAlcohol(product.product_name || "")) {
              logMissedScan(trimmed, "alcohol");
              setShowSubmitForm(true);
              setLookup({
                phase: "not-found",
                barcode: trimmed,
                message: "This barcode returned a non-alcohol product. If you scanned an alcoholic beverage, submit it below.",
              });
              inFlightRef.current = null;
              return;
            }
            // Name-override: if OFF's product name matches a curated entry, use our verified nutrition
            const curatedNameHit = overrideWithCurated(product.product_name || "", product.brands);
            if (curatedNameHit) {
              const servingMl = curatedNameHit.servingMl ?? 355;
              const kind = curatedNameHit.category === "IPAs" ? "beer" : curatedNameHit.category === "Hard Seltzers" ? "seltzer" : curatedNameHit.category === "Ciders" ? "cider" : "beer";
              const curatedNutriments = {
                "energy-kcal_100g": (curatedNameHit.caloriesPerCan / servingMl) * 100,
                carbohydrates_100g: (curatedNameHit.carbsPerCan / servingMl) * 100,
                sugars_100g: (curatedNameHit.sugarPerCan / servingMl) * 100,
                alcohol_100g: curatedNameHit.abv,
              };
              const overriddenProduct: OffProduct = { ...product, nutriments: curatedNutriments, product_name: curatedNameHit.name, brands: curatedNameHit.brand };
              const overrideResult = computeAlcoholScore(curatedNutriments, undefined, kind);
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
          } else {
            // Food / supplement path
            const result = computeScore(
              product.nutriments ?? {},
              product.ingredients_text || product.ingredients_text_en,
              scoringContext(product)
            );
            const lowConfidence = isCanadianBarcode(trimmed) && !hasCanadianOrGlobalMarketData(product);
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
              .filter(({ candidateResult }) => {
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
        // STEP 4 — USDA FOODDATA CENTRAL
        // US government branded-food nutrition database.
        // ─────────────────────────────────────────────────────────
        const usdaHit = await lookupUsda(trimmed);
        if (usdaHit) {
          // Name-override: USDA sometimes lists alcohol brands — defer to our verified data
          const usdaCuratedHit = overrideWithCurated(usdaHit.product_name || "", usdaHit.brands);
          if (usdaCuratedHit) {
            const servingMl = usdaCuratedHit.servingMl ?? 355;
            const kind = usdaCuratedHit.category === "IPAs" ? "beer" : usdaCuratedHit.category === "Hard Seltzers" ? "seltzer" : usdaCuratedHit.category === "Ciders" ? "cider" : "beer";
            const cn = { "energy-kcal_100g": (usdaCuratedHit.caloriesPerCan / servingMl) * 100, carbohydrates_100g: (usdaCuratedHit.carbsPerCan / servingMl) * 100, sugars_100g: (usdaCuratedHit.sugarPerCan / servingMl) * 100, alcohol_100g: usdaCuratedHit.abv };
            const overrideResult = computeAlcoholScore(cn, undefined, kind);
            const overriddenProduct: OffProduct = { ...usdaHit, nutriments: cn, product_name: usdaCuratedHit.name, brands: usdaCuratedHit.brand };
            setLookup({ phase: "found-alcohol", product: overriddenProduct, result: overrideResult, dataSource: "gorilla-curated" });
            setScannerActive(false); scrollToResult();
            persistHistory([{ barcode: trimmed, name: usdaCuratedHit.name, brand: usdaCuratedHit.brand, image: null, score: overrideResult.score, color: ALCOHOL_GRADE_COLORS[overrideResult.grade], scannedAt: Date.now() }, ...history.filter((h) => h.barcode !== trimmed)].slice(0, MAX_HISTORY));
            inFlightRef.current = null; return;
          }
          const result = computeScore(
            usdaHit.nutriments ?? {},
            usdaHit.ingredients_text,
            scoringContext(usdaHit)
          );
          setLookup({ phase: "found", product: usdaHit, result, dataSource: "usda" });
          setSheetVisible(true);
          persistHistory([
            {
              barcode: trimmed,
              name: usdaHit.product_name || "Unnamed Product",
              brand: usdaHit.brands || "Unknown Brand",
              image: productImage(usdaHit),
              score: result.finalScore,
              color: GRADE_COLORS[result.grade],
              scannedAt: Date.now(),
            },
            ...history.filter((h) => h.barcode !== trimmed),
          ].slice(0, MAX_HISTORY));
          setAlternativesLoading(true);
          const candidates = await fetchAlternativesMultiLevel(usdaHit);
          const better: Alternative[] = candidates
            .map((c) => {
              const cr = computeScore(c.nutriments ?? {}, c.ingredients_text || c.ingredients_text_en, scoringContext(c));
              return { candidate: c, candidateResult: cr };
            })
            .filter(({ candidateResult }) => candidateResult.finalScore >= result.finalScore + 5)
            .sort((a, b) => b.candidateResult.finalScore - a.candidateResult.finalScore)
            .slice(0, 3)
            .map(({ candidate, candidateResult }) => ({ type: "off-match" as const, product: candidate, score: candidateResult.finalScore }));
          setAlternatives(better.length > 0 ? better : gorillaSuggestionsFor(usdaHit.categories_tags ?? []));
          setAlternativesLoading(false);
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 5 — NUTRITIONIX
        // 500-call/day free tier. Requires NUTRITIONIX_APP_ID + NUTRITIONIX_APP_KEY.
        // ─────────────────────────────────────────────────────────
        const nxHit = await lookupNutritionix(trimmed);
        if (nxHit) {
          const result = computeScore(
            nxHit.nutriments ?? {},
            nxHit.ingredients_text,
            scoringContext(nxHit)
          );
          setLookup({ phase: "found", product: nxHit, result, dataSource: "nutritionix" });
          setSheetVisible(true);
          persistHistory([
            {
              barcode: trimmed,
              name: nxHit.product_name || "Unnamed Product",
              brand: nxHit.brands || "Unknown Brand",
              image: productImage(nxHit),
              score: result.finalScore,
              color: GRADE_COLORS[result.grade],
              scannedAt: Date.now(),
            },
            ...history.filter((h) => h.barcode !== trimmed),
          ].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 6 — OPEN BEAUTY FACTS
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
        // STEP 7 — COLA CLOUD (TTB Government Alcohol Registry)
        // Free US government API. Certificate of Label Approval records.
        // ─────────────────────────────────────────────────────────
        const colaHit = await lookupColaCloud(trimmed);
        if (colaHit) {
          logMissedScan(trimmed, "alcohol");
          // Try to match curated nutrition by product name
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
          const alcoholResult = computeAlcoholScore(
            nutriments,
            undefined,
            "beer"
          );
          setFallbackProduct(colaHit);
          setLookup({
            phase: "found-alcohol",
            product: syntheticProduct,
            result: alcoholResult,
            dataSource: "cola-verified",
          });
          setScannerActive(false);
          scrollToResult();
          persistHistory([
            {
              barcode: trimmed,
              name: colaHit.name,
              brand: colaHit.brand || "Unknown Brand",
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

        // ─────────────────────────────────────────────────────────
        // STEP 7b — WINEVYBE (RapidAPI beer/wine DB, secondary alcohol fallback)
        // Requires RAPIDAPI_KEY env var. Shows submit form when found.
        // ─────────────────────────────────────────────────────────
        const wineVybeHit = await lookupWineVybe(trimmed);
        if (wineVybeHit) {
          logMissedScan(trimmed, "alcohol");
          setFallbackProduct(wineVybeHit);
          setShowSubmitForm(true);
          setLookup({
            phase: "not-found",
            barcode: trimmed,
            message: `Found "${wineVybeHit.name}" on WineVybe${wineVybeHit.abv ? ` (${wineVybeHit.abv}% ABV)` : ""}. Submit the nutritional details below to complete the record.`,
          });
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 8 — GO-UPC
        // 500M+ products worldwide. Returns name, brand, image, category.
        // Requires GOUPC_API_KEY env var. No nutrition scoring available.
        // ─────────────────────────────────────────────────────────
        const goupcHit = await lookupGoUpc(trimmed);
        if (goupcHit) {
          setLookup({ phase: "found-generic", product: goupcHit });
          setScannerActive(false);
          scrollToResult();
          persistHistory([
            {
              barcode: trimmed,
              name: goupcHit.name,
              brand: goupcHit.brand || "Unknown Brand",
              image: goupcHit.image,
              score: 0,
              color: "#6b7280",
              scannedAt: Date.now(),
            },
            ...history.filter((h) => h.barcode !== trimmed),
          ].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 9 — OPEN DRUG FACTS
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
        // STEP 10 — NOT FOUND
        // All sources exhausted. Log to missed_scans and show clean card.
        // Always resolves within ~3s from first call.
        // ─────────────────────────────────────────────────────────
        logMissedScan(trimmed, "unknown");
        setLookup({ phase: "not-found", barcode: trimmed });

      } catch (err) {
        console.error("[Gorilla] runLookup crashed:", err);
        setLookup({ phase: "error", barcode: trimmed, message: "Something went wrong — please try again." });
        setAlternativesLoading(false);
      } finally {
        inFlightRef.current = null;
      }
    },
    [history, persistHistory, scrollToResult]
  );

  const handleDetected = useCallback(
    (barcode: string) => {
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

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        <p className="font-display text-sm tracking-[0.3em] text-gold">LIVE PRODUCT SCANNER</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          Point. Scan. <span className="text-gold">Know.</span>
        </h1>
        <p className="mt-4 text-muted">
          Activate your camera, hold a barcode steady in the frame, and Gorilla
          Fuel checks 9 data sources instantly — food, alcohol, beauty, and medication
          barcodes all supported.
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
      <div ref={resultRef} className="mt-10">
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
                  {lookup.message ?? "This product is not in our database yet."}
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
        </>
      )}
    </div>
  );
}
