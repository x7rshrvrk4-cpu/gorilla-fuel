"use client";

import Image from "next/image";
import { GRADE_COLORS, type ScoreResult } from "../lib/scoring";
import type { OffProduct } from "../lib/openFoodFacts";
import { productImage } from "../lib/openFoodFacts";
import ScoreRing from "./ScoreRing";

type Props = {
  product: OffProduct;
  result: ScoreResult;
  onDismiss: () => void;
  onViewFull: () => void;
};

export default function ScanResultSheet({ product, result, onDismiss, onViewFull }: Props) {
  const image = productImage(product);
  const gradeColor = GRADE_COLORS[result.grade];
  const keyFlags = result.flags.slice(0, 2);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-3 sm:px-0 sm:pb-0">
      <div className="animate-sheet-rise w-full max-w-xl overflow-hidden rounded-t-3xl border border-line border-b-0 bg-surface shadow-[0_-24px_70px_rgba(0,0,0,0.65)]">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss result"
          className="flex w-full justify-center pb-2 pt-3"
        >
          <span className="h-1.5 w-12 rounded-full bg-line transition-colors hover:bg-gold-dim" />
        </button>

        <div className="px-6 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-background">
              {image ? (
                <Image
                  src={image}
                  alt={product.product_name ?? "Product image"}
                  width={80}
                  height={80}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-display text-2xl text-gold/40">G</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs uppercase tracking-[0.2em] text-muted">
                {product.brands || "Unknown Brand"}
              </p>
              <h3 className="truncate font-display text-2xl leading-tight text-foreground">
                {product.product_name || "Unnamed Product"}
              </h3>
              <span
                className="mt-1.5 inline-block rounded-sm border px-2.5 py-0.5 font-display text-xs tracking-[0.2em]"
                style={{ borderColor: gradeColor, color: gradeColor }}
              >
                {result.grade.toUpperCase()}
              </span>
            </div>

            <ScoreRing score={result.finalScore} grade={result.grade} size={68} />
          </div>

          {keyFlags.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              {keyFlags.map((flag, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-red-400">—</span>
                  <span className="truncate">{flag}</span>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={onViewFull}
            className="mt-5 w-full rounded-sm bg-gold px-5 py-3 font-display text-lg tracking-widest text-background transition-transform hover:scale-[1.02]"
          >
            View Full Results
          </button>
        </div>
      </div>
    </div>
  );
}
