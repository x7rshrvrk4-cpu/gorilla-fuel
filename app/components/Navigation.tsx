"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/rankings", label: "Rankings" },
  { href: "/alcohol", label: "Alcohol" },
  { href: "/kids", label: "Kids" },
  { href: "/beauty", label: "Beauty" },
  { href: "/glutenfree", label: "Gluten Free" },
  { href: "/methodology", label: "Methodology" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
          {links.map((link) => (
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
          <a
            href="https://gorillasports.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-gold px-4 py-2 font-display text-base tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
          >
            Gorilla Sports ↗
          </a>
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
            {links.map((link) => (
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
            <a
              href="https://gorillasports.ca"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-sm border border-gold px-3 py-3 text-center font-display text-xl tracking-widest text-gold"
            >
              Gorilla Sports ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
