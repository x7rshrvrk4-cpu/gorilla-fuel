"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import ProductResultCard from "./components/ProductResultCard";
import ScanResultSheet from "./components/ScanResultSheet";
import ScanHistory, { type HistoryEntry } from "./components/ScanHistory";
import {
  fetchAlternativesMultiLevel,
  lookupBarcode,
  productImage,
  scoringContext,
  type OffProduct,
} from "./lib/openFoodFacts";
import { gorillaSuggestionsFor, type Alternative } from "./lib/gorillaGuidance";
import { beautyProductImage, lookupBeautyBarcode, type ObfProduct } from "./lib/openBeautyFacts";
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

const HISTORY_KEY = "gorilla-fuel-scan-history";
const MAX_HISTORY = 6;

// Product name words that are incompatible with alcohol scoring — used to catch
// barcode collisions where an OFF record for a cosmetic or supplement shares a
// barcode with an alcohol product the user was trying to scan.
const NON_ALCOHOL_NAME_WORDS = new Set([
  "shampoo", "conditioner", "lotion", "cream", "moisturizer", "serum",
  "foundation", "mascara", "lipstick", "blush", "eyeshadow", "concealer",
  "toothpaste", "deodorant", "antiperspirant", "soap", "bodywash",
  "sunscreen", "sunblock", "perfume", "cologne", "hairspray",
  "supplement", "vitamin", "capsule", "tablet", "softgel",
  "protein", "powder", "preworkout", "pre-workout", "creatine",
]);

/** Returns true if the product name contains a word that makes it incompatible
 *  with alcohol scoring — catches cosmetic/supplement barcodes mis-routed to alcohol mode. */
function productNameContradictsAlcohol(productName: string): boolean {
  const words = productName.toLowerCase().split(/[\s,/()-]+/);
  return words.some((w) => NON_ALCOHOL_NAME_WORDS.has(w));
}

/** Confidence gate: validate that a returned OFF product actually corresponds to
 *  the scanned barcode and carries enough data to be worth showing. */
function validateConfidence(
  product: OffProduct,
  scannedBarcode: string
): { pass: boolean; reason: string } {
  // Barcode must match — normalize both sides by stripping leading zeros.
  const norm = (b: string) => b.replace(/^0+/, "") || "0";
  if (product.code && norm(product.code) !== norm(scannedBarcode)) {
    return { pass: false, reason: "barcode-mismatch" };
  }
  // Must have a product name — nameless records are stubs.
  if (!product.product_name?.trim()) {
    return { pass: false, reason: "no-name" };
  }
  // Must carry at least one substantive data field.
  const hasIngredients = !!(product.ingredients_text || product.ingredients_text_en);
  const hasNutriments = !!(
    product.nutriments && Object.keys(product.nutriments).length > 0
  );
  const hasCategories = !!(
    product.categories_tags && product.categories_tags.length > 0
  );
  if (!hasIngredients && !hasNutriments && !hasCategories) {
    return { pass: false, reason: "no-data" };
  }
  return { pass: true, reason: "ok" };
}

/** Returns true when the barcode GS1 prefix indicates a Canadian-market product
 *  (prefixes 00–09 shared with USA, and 754–755 which are Canada-exclusive). */
function isCanadianBarcode(barcode: string): boolean {
  const digits = barcode.replace(/\D/g, "");
  const prefix3 = parseInt(digits.slice(0, 3), 10);
  if (isNaN(prefix3)) return false;
  return (prefix3 >= 0 && prefix3 <= 9) || (prefix3 >= 754 && prefix3 <= 755);
}

/** Returns true when the product carries any Canadian or global market tag. */
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
  | { phase: "found"; product: OffProduct; result: ScoreResult; lowConfidence?: boolean }
  | { phase: "found-beauty"; product: ObfProduct; result: BeautyScoreResult }
  | { phase: "found-alcohol"; product: OffProduct; result: AlcoholScoreResult; fromCommunity?: boolean };

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
      // One-time sync from localStorage on mount — history doesn't exist server-side.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore corrupt history
    }
  }, []);

  // Pre-warm the OFF API connection so DNS is already resolved before first scan.
  useEffect(() => {
    fetch("https://world.openfoodfacts.org/api/v2/product/0.json?fields=code", {
      cache: "no-store",
    }).catch(() => {});
  }, []);

  // Preload ZXing on mount so the dynamic import is already cached when the
  // user opens the scanner — avoids a WASM download delay on first scan.
  useEffect(() => {
    import("@zxing/library").catch(() => {});
  }, []);

  // Lock page scroll while the fullscreen scanner overlay is open.
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

      // ── 1. Community DB — verified alcohol submissions take priority over OFF ──
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
        setLookup({ phase: "found-alcohol", product: syntheticProduct, result: alcoholResult, fromCommunity: true });
        setSheetVisible(false);
        setScannerActive(false);
        window.setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
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

      // ── 2. Open Food Facts lookup ──
      const lookupResult = await lookupBarcode(trimmed);

      if (lookupResult.status === "not-found") {
        // OFF doesn't have this barcode — try Open Beauty Facts before giving up.
        const beautyResult = await lookupBeautyBarcode(trimmed);

        if (beautyResult.status === "found") {
          const beautyProduct = beautyResult.product;
          const beautyScore = computeBeautyScore(beautyProduct.ingredients_text || beautyProduct.ingredients_text_en);
          setLookup({ phase: "found-beauty", product: beautyProduct, result: beautyScore });
          setSheetVisible(false);
          setScannerActive(false);
          window.setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
          const entry: HistoryEntry = {
            barcode: beautyProduct.code,
            name: beautyProduct.product_name || "Unnamed Product",
            brand: beautyProduct.brands || "Unknown Brand",
            image: beautyProductImage(beautyProduct),
            score: beautyScore.score,
            color: GRADE_COLORS[beautyScore.grade],
            scannedAt: Date.now(),
          };
          persistHistory([entry, ...history.filter((h) => h.barcode !== entry.barcode)].slice(0, MAX_HISTORY));
          inFlightRef.current = null;
          return;
        }

        // Neither OFF nor OBF has this barcode.
        // Try COLA Cloud (TTB barcode registry — good for US alcohol products).
        const colaHit = await lookupColaCloud(trimmed);
        if (colaHit) {
          logMissedScan(trimmed, "alcohol");
          setFallbackProduct(colaHit);
          setShowSubmitForm(true);
          setLookup({
            phase: "not-found",
            barcode: trimmed,
            message: `Found "${colaHit.name}" on the TTB COLA Cloud database${colaHit.abv ? ` (${colaHit.abv}% ABV)` : ""}. Submit the nutritional details below to complete the record.`,
          });
          inFlightRef.current = null;
          return;
        }

        // Try WineVybe (RapidAPI beer database — requires RAPIDAPI_KEY env var).
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

        logMissedScan(trimmed, "unknown");
        setLookup({ phase: "not-found", barcode: trimmed });
        inFlightRef.current = null;
        return;
      }

      if (lookupResult.status === "error") {
        setLookup({ phase: "error", barcode: trimmed, message: lookupResult.message });
        inFlightRef.current = null;
        return;
      }

      const product = lookupResult.product;

      // ── 3. CONFIDENCE VALIDATION — reject unreliable OFF records ──
      const confidence = validateConfidence(product, trimmed);
      if (!confidence.pass) {
        logMissedScan(trimmed, "food");
        setLookup({ phase: "not-found", barcode: trimmed });
        inFlightRef.current = null;
        return;
      }

      // ── 4. Empty categories — reliable stub/collision signal in OFF ──
      if (!product.categories_tags || product.categories_tags.length === 0) {
        logMissedScan(trimmed, "food");
        setLookup({ phase: "not-found", barcode: trimmed });
        inFlightRef.current = null;
        return;
      }

      // ── 5. ALCOHOL ROUTING ──
      if (isAlcoholProduct(product.categories_tags)) {
        // Safety check: reject if the product name contradicts alcohol context.
        // Catches barcode collisions where a cosmetic/supplement record shares a
        // barcode with an alcohol product that isn't yet in OFF.
        if (productNameContradictsAlcohol(product.product_name || "")) {
          logMissedScan(trimmed, "alcohol");
          setShowSubmitForm(true);
          setLookup({
            phase: "not-found",
            barcode: trimmed,
            message:
              "This barcode returned a non-alcohol product. If you scanned an alcoholic beverage, submit it below and we'll add it to the database.",
          });
          inFlightRef.current = null;
          return;
        }

        const alcoholResult = computeAlcoholScore(
          product.nutriments ?? {},
          product.ingredients_text || product.ingredients_text_en,
          detectAlcoholKind(product.categories_tags)
        );

        setLookup({ phase: "found-alcohol", product, result: alcoholResult });
        setSheetVisible(false);
        setScannerActive(false);
        window.setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);

        const alcoholEntry: HistoryEntry = {
          barcode: product.code,
          name: product.product_name || "Unnamed Product",
          brand: product.brands || "Unknown Brand",
          image: productImage(product),
          score: alcoholResult.score,
          color: ALCOHOL_GRADE_COLORS[alcoholResult.grade],
          scannedAt: Date.now(),
        };
        persistHistory([alcoholEntry, ...history.filter((h) => h.barcode !== alcoholEntry.barcode)].slice(0, MAX_HISTORY));
        inFlightRef.current = null;
        return;
      }

      // ── 6. FOOD ROUTING ──
      const result = computeScore(
        product.nutriments ?? {},
        product.ingredients_text || product.ingredients_text_en,
        scoringContext(product)
      );

      // Canadian barcode with no Canadian/US market data — flag as low confidence.
      const lowConfidence =
        isCanadianBarcode(trimmed) && !hasCanadianOrGlobalMarketData(product);

      setLookup({ phase: "found", product, result, lowConfidence });
      setSheetVisible(true);

      const entry: HistoryEntry = {
        barcode: product.code,
        name: product.product_name || "Unnamed Product",
        brand: product.brands || "Unknown Brand",
        image: productImage(product),
        score: result.finalScore,
        color: GRADE_COLORS[result.grade],
        scannedAt: Date.now(),
      };
      persistHistory([entry, ...history.filter((h) => h.barcode !== entry.barcode)].slice(0, MAX_HISTORY));

      // Fetch healthier alternatives — try multiple category levels, fall back to curated Gorilla Suggestion.
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
          const fewerAdditives =
            candidateResult.detectedAdditives.length < result.detectedAdditives.length;
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

      setAlternatives(
        better.length > 0 ? better : gorillaSuggestionsFor(product.categories_tags ?? [])
      );
      setAlternativesLoading(false);
      } catch (err) {
        // An unhandled exception inside the lookup pipeline would otherwise leave
        // the UI stuck at "loading" and block the same barcode from re-scanning.
        console.error("[Gorilla] runLookup crashed:", err);
        setLookup({ phase: "error", barcode: trimmed, message: "Something went wrong — please try again." });
        setAlternativesLoading(false);
      } finally {
        inFlightRef.current = null;
      }
    },
    [history, persistHistory]
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
          Fuel pulls live data from Open Food Facts to score it instantly — sugar,
          fat, salt, additives, the whole picture.
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
              {/* Header strip */}
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
            />
          </>
        )}

        {lookup.phase === "found-beauty" && (
          <BeautyResultCard product={lookup.product} result={lookup.result} />
        )}

        {lookup.phase === "found-alcohol" && (
          <AlcoholResultCard product={lookup.product} result={lookup.result} fromCommunity={lookup.fromCommunity} />
        )}
      </div>

      <ScanHistory entries={history} onSelect={runLookup} />

      {/* Manual entry — understated, bottom of screen */}
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
