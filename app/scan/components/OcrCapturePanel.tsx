"use client";

import { useRef, useState } from "react";
import {
  runIngredientOcr,
  parseIngredientsFromOcr,
  submitOcrIngredients,
} from "../lib/ocrIngredients";

type Phase = "idle" | "ocr" | "review" | "submitting" | "done" | "error";

/**
 * PHASE 0 OCR capture — shown only on data-blind products (no ingredient list).
 * A SEPARATE native-camera capture (file input), entirely downstream of the
 * barcode scanner — zero ZXing involvement. Captured text is user-confirmed and
 * written ONLY to the staging tier; it never touches the authoritative cache or
 * any score in Phase 0.
 */
export default function OcrCapturePanel({ barcode }: { barcode: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [parsed, setParsed] = useState("");
  const [rawText, setRawText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-pick of the same file
    if (!file) return;
    setPhase("ocr");
    setNote(null);
    try {
      const { text, confidence } = await runIngredientOcr(file);
      setRawText(text);
      setConfidence(confidence);
      const p = parseIngredientsFromOcr(text);
      if (p.ok) {
        setParsed(p.parsed);
        setNote(null);
      } else {
        // Parse-fail: show the raw text so the user can correct it — never store garbage.
        setParsed(text.trim());
        setNote(`Couldn't auto-detect the list (${p.reason}). Please edit to just the ingredients before saving.`);
      }
      setPhase("review");
    } catch {
      setPhase("error");
    }
  }

  async function handleConfirm() {
    if (!parsed.trim()) return;
    setPhase("submitting");
    const res = await submitOcrIngredients({ barcode, rawText, parsed: parsed.trim(), confidence });
    setPhase(res.ok ? "done" : "error");
    if (!res.ok) setNote(typeof res.message === "string" ? res.message : "Couldn't save — try again.");
  }

  const shell = "mt-3 rounded-sm border border-gold/30 bg-gold/[0.05] p-4";

  if (phase === "done") {
    return (
      <div className={shell}>
        <p className="text-sm text-foreground">Saved to the review queue — thanks.</p>
        <p className="mt-1 text-xs text-muted">
          This helps fill the gap. It won&apos;t change the score until it&apos;s verified, so the
          &quot;limited data&quot; note stays for now.
        </p>
      </div>
    );
  }

  return (
    <div className={shell}>
      {/* hidden native-camera capture — a SEPARATE invocation, not the barcode scanner */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {phase === "idle" && (
        <>
          <p className="font-display text-sm text-foreground">No ingredient list on file — add one?</p>
          <p className="mt-1 text-xs text-muted">
            Photograph the ingredients panel and we&apos;ll read it. It goes to a review queue — it
            won&apos;t change the score yet.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 rounded-sm border border-gold bg-gold/10 px-4 py-2 font-display text-xs tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
          >
            📷 Photograph ingredients
          </button>
        </>
      )}

      {phase === "ocr" && (
        <p className="text-sm text-muted">Reading the label… (first run downloads the OCR engine, ~a few seconds)</p>
      )}

      {phase === "review" && (
        <>
          <p className="font-display text-sm text-foreground">Is this right? Edit, then confirm.</p>
          {note && <p className="mt-1 text-xs text-amber-300">{note}</p>}
          <textarea
            value={parsed}
            onChange={(e) => setParsed(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
          />
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">OCR confidence {Math.round(confidence)}%</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-sm bg-gold px-4 py-2 font-display text-xs tracking-widest text-background transition-opacity hover:opacity-90"
            >
              Confirm &amp; submit
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-sm border border-line px-4 py-2 font-display text-xs tracking-widest text-muted transition-colors hover:border-gold/60 hover:text-gold"
            >
              Retake
            </button>
          </div>
        </>
      )}

      {phase === "submitting" && <p className="text-sm text-muted">Saving to review queue…</p>}

      {phase === "error" && (
        <>
          <p className="text-sm text-foreground">{note ?? "Something went wrong."}</p>
          <button
            type="button"
            onClick={() => setPhase("idle")}
            className="mt-3 rounded-sm border border-line px-4 py-2 font-display text-xs tracking-widest text-muted transition-colors hover:border-gold/60 hover:text-gold"
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}
