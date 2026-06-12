"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/alcohol", label: "Alcohol" },
  { href: "/kids", label: "Kids" },
  { href: "/beauty", label: "Beauty" },
  { href: "/glutenfree", label: "Gluten Free" },
  { href: "/methodology", label: "Methodology" },
];

const RANKINGS_ITEMS = [
  { href: "/rankings", label: "Supplement Rankings" },
  { href: "/rankings/alcohol", label: "Ontario Top 10 (Alcohol)" },
];

const INTEL_ITEMS = [
  { href: "/approved", label: "Gorilla Approved" },
  { href: "/cheat", label: "Cheat List" },
  { href: "/avoid", label: "Stay Away" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);

  const rankingsActive = pathname.startsWith("/rankings");
  const intelActive = INTEL_ITEMS.some((i) => pathname === i.href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setOpen(false)}
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

        <div className="hidden items-center gap-8 md:flex">
          {links.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display text-lg tracking-widest transition-colors hover:text-gold ${
                pathname === link.href ? "text-gold" : "text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Rankings dropdown */}
          <div className="group relative">
            <button
              type="button"
              className={`font-display text-lg tracking-widest transition-colors hover:text-gold ${
                rankingsActive ? "text-gold" : "text-foreground/80"
              }`}
            >
              Rankings ▾
            </button>
            <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="flex w-60 flex-col rounded-sm border border-line bg-background shadow-2xl">
                {RANKINGS_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 font-display text-base tracking-widest transition-colors hover:bg-surface hover:text-gold ${
                      pathname === item.href ? "text-gold" : "text-foreground/80"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Gorilla Intel dropdown */}
          <div className="group relative">
            <button
              type="button"
              className={`font-display text-lg tracking-widest transition-colors hover:text-gold ${
                intelActive ? "text-gold" : "text-foreground/80"
              }`}
            >
              Gorilla Intel ▾
            </button>
            <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="flex w-52 flex-col rounded-sm border border-line bg-background shadow-2xl">
                {INTEL_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 font-display text-base tracking-widest transition-colors hover:bg-surface hover:text-gold ${
                      pathname === item.href ? "text-gold" : "text-foreground/80"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {links.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display text-lg tracking-widest transition-colors hover:text-gold ${
                pathname === link.href ? "text-gold" : "text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-gold transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-gold transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-gold transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-background px-5 pb-6 md:hidden">
          <div className="flex flex-col gap-1 pt-4">
            {links.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-sm px-3 py-3 font-display text-xl tracking-widest transition-colors ${
                  pathname === link.href
                    ? "bg-surface text-gold"
                    : "text-foreground/80 hover:bg-surface hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Rankings expandable group */}
            <button
              type="button"
              onClick={() => setRankingsOpen((v) => !v)}
              className={`rounded-sm px-3 py-3 text-left font-display text-xl tracking-widest transition-colors ${
                rankingsActive ? "bg-surface text-gold" : "text-foreground/80 hover:bg-surface hover:text-gold"
              }`}
            >
              Rankings {rankingsOpen ? "▴" : "▾"}
            </button>
            {rankingsOpen &&
              RANKINGS_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-sm px-3 py-2.5 pl-8 font-display text-lg tracking-widest transition-colors ${
                    pathname === item.href
                      ? "bg-surface text-gold"
                      : "text-foreground/70 hover:bg-surface hover:text-gold"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

            {/* Gorilla Intel expandable group */}
            <button
              type="button"
              onClick={() => setIntelOpen((v) => !v)}
              className={`rounded-sm px-3 py-3 text-left font-display text-xl tracking-widest transition-colors ${
                intelActive ? "bg-surface text-gold" : "text-foreground/80 hover:bg-surface hover:text-gold"
              }`}
            >
              Gorilla Intel {intelOpen ? "▴" : "▾"}
            </button>
            {intelOpen &&
              INTEL_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-sm px-3 py-2.5 pl-8 font-display text-lg tracking-widest transition-colors ${
                    pathname === item.href
                      ? "bg-surface text-gold"
                      : "text-foreground/70 hover:bg-surface hover:text-gold"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

            {links.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-sm px-3 py-3 font-display text-xl tracking-widest transition-colors ${
                  pathname === link.href
                    ? "bg-surface text-gold"
                    : "text-foreground/80 hover:bg-surface hover:text-gold"
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
