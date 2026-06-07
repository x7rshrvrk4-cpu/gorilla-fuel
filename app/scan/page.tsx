"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import ProductResultCard from "./components/ProductResultCard";
import ScanHistory, { type HistoryEntry } from "./components/ScanHistory";
import {
  fetchAlternativesInCategory,
  lookupBarcode,
  primaryCategory,
  productImage,
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
  const [lookup, setLookup] = useState<LookupState>({ phase: "idle" });
  const [manualBarcode, setManualBarcode] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [alternatives, setAlternatives] = useState<OffProduct[]>([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);
  const inFlightRef = useRef<string | null>(null);

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
      const result = computeScore(product.nutriments ?? {}, product.ingredients_text || product.ingredients_text_en);

      setLookup({ phase: "found", product, result });

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
        const candidates = await fetchAlternativesInCategory(category, product.code);
        const better = candidates
          .map((candidate) => ({
            candidate,
            score: computeScore(candidate.nutriments ?? {}, candidate.ingredients_text || candidate.ingredients_text_en).finalScore,
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
    }
  };

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

      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wide text-foreground">Camera Scanner</h2>
            <button
              type="button"
              onClick={() => setScannerActive((v) => !v)}
              className={`rounded-sm px-5 py-2 font-display text-base tracking-widest transition-colors ${
                scannerActive
                  ? "border border-gold text-gold hover:bg-gold hover:text-background"
                  : "bg-gold text-background hover:scale-105"
              }`}
            >
              {scannerActive ? "Stop Scanner" : "Start Scanner"}
            </button>
          </div>
          <BarcodeScanner active={scannerActive} onDetected={handleDetected} />
        </div>

        <div className="lg:w-80">
          <h2 className="mb-3 font-display text-xl tracking-wide text-foreground">Manual Entry</h2>
          <form onSubmit={handleManualSubmit} className="gorilla-card flex flex-col gap-3 rounded-sm p-5">
            <label htmlFor="manual-barcode" className="text-sm text-muted">
              No camera? Type the barcode printed under it.
            </label>
            <input
              id="manual-barcode"
              type="text"
              inputMode="numeric"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="e.g. 5000159484695"
              className="rounded-sm border border-line bg-background px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-sm bg-gold px-5 py-3 font-display text-lg tracking-widest text-background transition-transform hover:scale-105"
            >
              Look Up Product
            </button>
          </form>
        </div>
      </div>

      {/* RESULTS */}
      <div className="mt-10">
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
    </div>
  );
}
