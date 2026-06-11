"use client";

import { useState } from "react";
import Link from "next/link";
import UniversalSearch from "./UniversalSearch";

export default function HeroSearchBlock() {
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <>
      <div
        className="animate-rise w-full max-w-lg"
        style={{ animationDelay: "0.25s" }}
      >
        <UniversalSearch
          placeholder="Search any product by name…"
          onActiveChange={setIsSearchActive}
        />
      </div>

      <div
        className={`animate-rise flex flex-col items-center gap-3 transition-all duration-300 ease-in-out ${
          isSearchActive
            ? "pointer-events-none translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
        style={{ animationDelay: "0.3s" }}
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
    </>
  );
}
