"use client";

import Image from "next/image";

type Props = {
  /** "scanning" shows the gorilla + SCANNING; "not-found" switches text to red NOT FOUND + action buttons */
  phase: "scanning" | "not-found";
  /** Barcode that was scanned — shown in the not-found state for reference */
  barcode: string;
  /** When true the overlay starts its 300ms opacity-out exit — parent removes it after the timer */
  exiting: boolean;
  onTryAgain: () => void;
  onSubmit: () => void;
};

export default function ScanConfirmationOverlay({ phase, barcode, exiting, onTryAgain, onSubmit }: Props) {
  return (
    <div
      className={`fixed inset-0 z-[65] flex flex-col items-center justify-center bg-black/95 transition-opacity duration-300 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* ── Gorilla face with layered pulsing glow ───────────────────────── */}
      <div className="relative flex items-center justify-center">
        {/* Outer ambient ring — slow pulse */}
        <span
          className={`absolute h-56 w-56 rounded-full transition-colors duration-500 sm:h-72 sm:w-72 ${
            phase === "not-found" ? "bg-red-500/8 blur-3xl" : "gorilla-glow-outer blur-3xl"
          }`}
        />
        {/* Inner tight ring — faster pulse */}
        <span
          className={`absolute h-44 w-44 rounded-full transition-colors duration-500 sm:h-56 sm:w-56 ${
            phase === "not-found" ? "bg-red-500/12 blur-2xl" : "gorilla-glow-inner blur-2xl"
          }`}
        />
        <Image
          src="/gorilla-fuel-icon.png"
          alt="Gorilla Fuel"
          width={160}
          height={160}
          priority
          className="relative z-10 h-36 w-36 rounded-full sm:h-44 sm:w-44"
        />
      </div>

      {/* ── Status text ───────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-col items-center">
        {phase === "scanning" ? (
          <>
            <p className="font-display text-4xl tracking-[0.6em] text-gold [text-shadow:0_0_24px_rgba(255,215,0,0.55)] sm:text-5xl">
              SCANNING
            </p>
            {/* Loading dots */}
            <div className="mt-4 flex gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-gold/70"
                  style={{ animation: `scan-dot 1.4s ease-in-out ${i * 0.22}s infinite` }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-4xl tracking-[0.45em] text-red-400 [text-shadow:0_0_20px_rgba(239,68,68,0.4)] sm:text-5xl">
              NOT FOUND
            </p>
            <p className="mt-2 font-mono text-xs tracking-widest text-white/35">{barcode}</p>
            <p className="mt-3 max-w-[260px] text-center text-sm leading-relaxed text-white/55">
              This product is not in our database yet.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={onTryAgain}
                className="rounded-sm bg-gold px-6 py-3 font-display text-sm tracking-widest text-background transition-opacity hover:opacity-90 active:opacity-75"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="rounded-sm border border-white/20 px-6 py-3 font-display text-sm tracking-widest text-white/65 transition-colors hover:border-gold/50 hover:text-gold"
              >
                Submit This Product
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
