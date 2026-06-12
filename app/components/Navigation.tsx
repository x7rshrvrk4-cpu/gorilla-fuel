"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Primary nav — 4 items only
const PRIMARY_LINKS = [
  { href: "/scan",        label: "SCAN",        gold: true },
  { href: "/alcohol",     label: "ALCOHOL",     gold: false },
  { href: "/approved",    label: "FOOD",        gold: false },
  { href: "/rankings",    label: "SUPPLEMENTS", gold: false },
];

// Secondary links shown indented in mobile menu
const SECONDARY_LINKS = [
  { href: "/approved",   label: "Gorilla Approved" },
  { href: "/cheat",      label: "Cheat List" },
  { href: "/avoid",      label: "Stay Away" },
  { href: "/kids",       label: "Kids" },
  { href: "/glutenfree", label: "Gluten Free" },
  { href: "/beauty",     label: "Beauty Scanner" },
  { href: "/methodology",label: "Methodology" },
  { href: "/about",      label: "About" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2"
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

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {PRIMARY_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
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
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
        >
          <span className={`h-0.5 w-6 bg-gold transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-gold transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-gold transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-background px-5 pb-6 md:hidden">
          <div className="flex flex-col gap-1 pt-4">
            {PRIMARY_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
