import type { RecallNotice } from "../lib/beautyRecalls";

/**
 * DISPLAY-ONLY safety-context strip for beauty products whose LINE has a
 * confirmed recall (see beautyRecalls.ts). Amber (caution), NOT red — the claim
 * is line-level ("similar products in this line"), never a claim that the exact
 * scanned unit is recalled. Presentational only: no fetch, no score effect.
 * Visual mirrors the honesty-signal strips in BeautyResultCard.
 */
export default function BeautyRecallBanner({ recall }: { recall: RecallNotice }) {
  return (
    <div className="flex items-start gap-2 border-b border-amber-500/40 bg-amber-500/[0.09] px-6 py-3">
      <span className="mt-0.5 text-base leading-none text-amber-400" aria-hidden>
        ⚠
      </span>
      <div>
        <p className="font-display text-[10px] uppercase tracking-[0.18em] text-amber-300">
          Safety Notice
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          This score reflects the ingredients on the label. However, similar products in this line
          have been subject to recalls for {recall.reason} ({recall.line}, {recall.year}).
        </p>
        <a
          href={recall.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-block text-[11px] text-amber-300 underline decoration-amber-500/40 underline-offset-4 hover:text-amber-200"
        >
          {recall.sourceLabel} →
        </a>
      </div>
    </div>
  );
}
