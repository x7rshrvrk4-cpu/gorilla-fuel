"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import ProductResultCard from "./components/ProductResultCard";
import ScanResultSheet from "./components/ScanResultSheet";
import ScanHistory, { type HistoryEntry } from "./components/ScanHistory";
import {
  fetchAlternativesInCategory,
  lookupBarcode,
  primaryCategory,
  productImage,
  scoringContext,
  type OffProduct,
} from "./lib/openFoodFacts";
import { computeScore, type ScoreResult } from "./lib/scoring";

const HISTORY_KEY = "gorilla-fuel-scan-history";
const MAX_HISTORY = 6;

type LookupState =
  | { phase: "idle" }
  | { phase: "loading"; barcode: string }
  | { phase: "not-found"; barcode: string }
  | { phase: "error"; barcode: string; message: string }
  | { phase: "found"; product: OffProduct; result: ScoreResult };

export default function ScanPage() {
  const [scannerActive, setScannerActive] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [lookup, setLookup] = useState<LookupState>({ phase: "idle" });
  const [manualOpen, setManualOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [alternatives, setAlternatives] = useState<OffProduct[]>([]);
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
      setLookup({ phase: "loading", barcode: trimmed });

      const lookupResult = await lookupBarcode(trimmed);

      if (lookupResult.status === "not-found") {
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
      const result = computeScore(
        product.nutriments ?? {},
        product.ingredients_text || product.ingredients_text_en,
        scoringContext(product)
      );

      setLookup({ phase: "found", product, result });
      setSheetVisible(true);

      const entry: HistoryEntry = {
        barcode: product.code,
        name: product.product_name || "Unnamed Product",
        brand: product.brands || "Unknown Brand",
        image: productImage(product),
        score: result.finalScore,
        grade: result.grade,
        scannedAt: Date.now(),
      };
      persistHistory([entry, ...history.filter((h) => h.barcode !== entry.barcode)].slice(0, MAX_HISTORY));

      // Fetch healthier alternatives from the same category
      const category = primaryCategory(product);
      if (category) {
        setAlternativesLoading(true);
        const candidates = await fetchAlternativesInCategory(category, product.categories_tags ?? [], product.code);
        const better = candidates
          .map((candidate) => ({
            candidate,
            score: computeScore(
              candidate.nutriments ?? {},
              candidate.ingredients_text || candidate.ingredients_text_en,
              scoringContext(candidate)
            ).finalScore,
          }))
          .filter((c) => c.score > result.finalScore)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((c) => c.candidate);

        setAlternatives(better);
        setAlternativesLoading(false);
      }

      inFlightRef.current = null;
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
    // Give the overlay a beat to slide away before scrolling to the full card.
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
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
          <div className="gorilla-card rounded-sm p-6">
            <h3 className="font-display text-2xl text-foreground">Not in the database</h3>
            <p className="mt-2 text-sm text-muted">
              Open Food Facts doesn&apos;t have data for barcode{" "}
              <span className="text-gold">{lookup.barcode}</span> yet. Try
              another product, or contribute the data at openfoodfacts.org.
            </p>
          </div>
        )}

        {lookup.phase === "error" && (
          <div className="gorilla-card rounded-sm p-6">
            <h3 className="font-display text-2xl text-foreground">Lookup failed</h3>
            <p className="mt-2 text-sm text-muted">{lookup.message}</p>
          </div>
        )}

        {lookup.phase === "found" && (
          <ProductResultCard
            product={lookup.product}
            result={lookup.result}
            alternatives={alternatives}
            alternativesLoading={alternativesLoading}
          />
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
