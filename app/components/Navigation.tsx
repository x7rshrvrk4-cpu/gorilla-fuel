"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";

// Primary nav — GORILLA INTEL replaced FOOD
const PRIMARY_LINKS = [
  { href: "/scan",     label: "SCAN",        gold: true,  dropdown: false },
  { href: "/alcohol",  label: "ALCOHOL",     gold: false, dropdown: false },
  { href: "/energy",   label: "BEVERAGES",   gold: false, dropdown: false },
  { href: "/rankings", label: "SUPPLEMENTS", gold: false, dropdown: false },
  { href: "/fitness",  label: "FITNESS",     gold: false, dropdown: false },
];

const INTEL_LINKS = [
  { href: "/top",      label: "Top Scored", color: "text-emerald-400", activeColor: "bg-emerald-900/20 text-emerald-400", indicator: "bg-emerald-500" },
  { href: "/approved", label: "Approved",  color: "text-gold",      activeColor: "bg-gold/10 text-gold",     indicator: "bg-gold" },
  { href: "/cheat",    label: "Cheat List", color: "text-amber-400", activeColor: "bg-amber-900/20 text-amber-400", indicator: "bg-amber-500" },
  { href: "/avoid",    label: "Stay Away",  color: "text-red-400",   activeColor: "bg-red-900/20 text-red-400",    indicator: "bg-red-600" },
];

// Secondary links shown indented in mobile menu
const SECONDARY_LINKS = [
  { href: "/kids",       label: "Kids" },
  { href: "/kids-snacks", label: "Kids' Snacks" },
  { href: "/glutenfree", label: "Gluten Free" },
  { href: "/beauty",     label: "Beauty Scanner" },
  { href: "/methodology",label: "Methodology" },
  { href: "/about",      label: "About" },
];

const INTEL_PATHS = ["/top", "/approved", "/cheat", "/avoid"];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [intelOpen, setIntelOpen]     = useState(false);
  const [mobileIntelOpen, setMobileIntelOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen]     = useState(false);

  const intelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isIntelActive = INTEL_PATHS.some((p) => pathname.startsWith(p));

  function handleIntelMouseEnter() {
    if (intelTimeout.current) clearTimeout(intelTimeout.current);
    setIntelOpen(true);
  }
  function handleIntelMouseLeave() {
    intelTimeout.current = setTimeout(() => setIntelOpen(false), 150);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/gorilla-fuel-icon.png"
            alt="Gorilla Fuel"
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-sm object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-display text-2xl tracking-wider text-foreground">
            GORILLA <span className="text-gold">FUEL</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {PRIMARY_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return link.gold ? (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-sm px-4 py-2 font-display text-lg tracking-widest transition-colors ${
                  isActive
                    ? "bg-gold text-background"
                    : "border border-gold text-gold hover:bg-gold hover:text-background"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`font-display text-lg tracking-widest transition-colors hover:text-gold ${
                  isActive ? "text-gold" : "text-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Gorilla Intel dropdown */}
          <div
            className="relative"
            onMouseEnter={handleIntelMouseEnter}
            onMouseLeave={handleIntelMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIntelOpen((v) => !v)}
              className={`flex items-center gap-1.5 font-display text-lg tracking-widest transition-colors hover:text-gold ${
                isIntelActive ? "text-gold" : "text-foreground/80"
              }`}
            >
              GORILLA INTEL
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="currentColor"
                className={`transition-transform duration-150 ${intelOpen ? "rotate-180" : ""}`}
              >
                <path d="M0 0l5 6 5-6z" />
              </svg>
            </button>

            {intelOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[180px] rounded-sm border border-line bg-background shadow-lg">
                {INTEL_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setIntelOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 font-display text-base tracking-widest transition-colors first:rounded-t-sm last:rounded-b-sm hover:bg-surface ${
                      pathname.startsWith(l.href) ? l.activeColor : l.color
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${l.indicator}`} />
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
        >
          <span className={`h-0.5 w-6 bg-gold transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-gold transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-gold transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-line bg-background px-5 pb-6 md:hidden">
          <div className="flex flex-col gap-1 pt-4">
            {PRIMARY_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-sm px-3 py-3 font-display text-xl tracking-widest transition-colors ${
                    link.gold
                      ? isActive
                        ? "bg-gold text-background"
                        : "border border-gold text-gold"
                      : isActive
                      ? "bg-surface text-gold"
                      : "text-foreground/80 hover:bg-surface hover:text-gold"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Gorilla Intel mobile submenu */}
            <button
              type="button"
              onClick={() => setMobileIntelOpen((v) => !v)}
              className={`flex items-center justify-between rounded-sm px-3 py-3 font-display text-xl tracking-widest transition-colors ${
                isIntelActive
                  ? "bg-surface text-gold"
                  : "text-foreground/80 hover:bg-surface hover:text-gold"
              }`}
            >
              GORILLA INTEL
              <span className="text-base">{mobileIntelOpen ? "▴" : "▾"}</span>
            </button>

            {mobileIntelOpen && (
              <div className="ml-4 flex flex-col gap-1 border-l border-line pl-4">
                {INTEL_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-sm px-3 py-2.5 font-display text-base tracking-widest transition-colors ${
                      pathname.startsWith(l.href)
                        ? `bg-surface ${l.color}`
                        : `${l.color} opacity-80 hover:bg-surface hover:opacity-100`
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}

            {/* More links */}
            <button
              type="button"
              onClick={() => setSecondaryOpen((v) => !v)}
              className="mt-2 rounded-sm px-3 py-3 text-left font-display text-lg tracking-widest text-foreground/50 transition-colors hover:text-foreground/80"
            >
              More {secondaryOpen ? "▴" : "▾"}
            </button>

            {secondaryOpen &&
              SECONDARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-sm px-3 py-2.5 pl-8 font-display text-base tracking-widest transition-colors ${
                    pathname === link.href
                      ? "bg-surface text-gold"
                      : "text-foreground/60 hover:bg-surface hover:text-gold"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
