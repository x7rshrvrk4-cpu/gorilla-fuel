"use client";

import Image from "next/image";

type Props = {
  /** "scanning" shows the gorilla + SCANNING; "not-found" shows the friendly NEW PRODUCT! invite + action buttons */
  phase: "scanning" | "not-found";
  /** Barcode that was scanned — shown in the not-found state for reference */
  barcode: string;
  /** When true the overlay starts its 300ms opacity-out exit — parent removes it after the timer */
  exiting: boolean;
  onTryAgain: () => void;
  onSubmit: () => void;
  /** Exit the scanner entirely (returns to the homepage, releases the camera). */
  onClose: () => void;
};

export default function ScanConfirmationOverlay({ phase, barcode, exiting, onTryAgain, onSubmit, onClose }: Props) {
  return (
    <div
      className={`fixed inset-0 z-[65] flex flex-col items-center justify-center bg-black/95 transition-opacity duration-300 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Close (exit to homepage) — the overlay sits above the scanner's own
          close button, so it needs its own always-reachable exit. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close scanner and return home"
        className="absolute left-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur transition-colors hover:border-gold hover:text-gold"
        style={{ top: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      {/* ── Gorilla face with layered glow (gold while scanning, calm gold tint when not found) ── */}
      <div className="relative flex items-center justify-center">
        {/* Outer ambient ring — slow pulse while scanning, calm static gold tint when not found */}
        <span
          className={`absolute h-56 w-56 rounded-full transition-colors duration-500 sm:h-72 sm:w-72 ${
            phase === "not-found" ? "bg-gold/10 blur-3xl" : "gorilla-glow-outer blur-3xl"
          }`}
        />
        {/* Inner tight ring */}
        <span
          className={`absolute h-44 w-44 rounded-full transition-colors duration-500 sm:h-56 sm:w-56 ${
            phase === "not-found" ? "bg-gold/15 blur-2xl" : "gorilla-glow-inner blur-2xl"
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
            <p className="font-display text-4xl tracking-[0.3em] text-gold [text-shadow:0_0_24px_rgba(255,215,0,0.5)] sm:text-5xl">
              NEW PRODUCT!
            </p>
            <p className="mt-3 max-w-[290px] text-center text-sm leading-relaxed text-white/70">
              We don&rsquo;t have this one yet — help us add it to the Gorilla database?
            </p>
            <p className="mt-3 font-mono text-xs tracking-widest text-white/35">{barcode}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={onSubmit}
                className="rounded-sm bg-gold px-6 py-3 font-display text-sm tracking-widest text-background transition-opacity hover:opacity-90 active:opacity-75"
              >
                Add This Product
              </button>
              <button
                type="button"
                onClick={onTryAgain}
                className="rounded-sm border border-white/20 px-6 py-3 font-display text-sm tracking-widest text-white/65 transition-colors hover:border-gold/50 hover:text-gold"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
