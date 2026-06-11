"use client";

import { useState } from "react";
import Link from "next/link";
import UniversalSearch from "./UniversalSearch";

export default function HeroSearchBlock() {
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <>
      {/* z-30: animate-rise's transform creates a stacking context, so the
          dropdown's own z-index can't escape it — the wrapper must outrank
          the button block below or the button paints over the results. */}
      <div
        className="animate-rise relative z-30 w-full max-w-lg"
        style={{ animationDelay: "0.25s" }}
      >
        <UniversalSearch
          placeholder="Search any product by name…"
          onActiveChange={setIsSearchActive}
        />
      </div>

      {/* The entrance animation lives on the outer div: animate-rise's
          fill-mode pins opacity/transform on its own element forever, which
          would override the hide-transition classes on the same node. */}
      <div className="animate-rise" style={{ animationDelay: "0.3s" }}>
      <div
        className={`flex flex-col items-center gap-3 transition-[transform,opacity] duration-200 ease-in-out ${
          isSearchActive
            ? "pointer-events-none translate-y-[100px] opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <Link
          href="/scan"
          className="pulse-glow rounded-sm bg-gold px-14 py-5 text-center font-display text-2xl tracking-widest text-background transition-transform hover:scale-105 sm:px-20 sm:py-6 sm:text-3xl"
        >
          Scan a Product →
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="/rankings"
            className="font-display text-sm tracking-[0.3em] text-muted transition-colors hover:text-gold"
          >
            SUPPLEMENTS →
          </Link>
          <span className="text-muted/30">|</span>
          <Link
            href="/alcohol"
            className="font-display text-sm tracking-[0.3em] text-muted transition-colors hover:text-gold"
          >
            ALCOHOL →
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
