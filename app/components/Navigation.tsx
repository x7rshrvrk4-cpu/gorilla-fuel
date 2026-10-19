"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// One flat list, grouped; BC Liquor last. Used by desktop bar and the single mobile menu.
const PRIMARY_LINKS = [
  { href: "/scan",              label: "SCAN",         gold: true  },
  { href: "/alcohol",           label: "ALCOHOL",      gold: false },
  { href: "/fitness/recipes",   label: "MEAL FINDER",  gold: false },
  { href: "/smoothies",          label: "SMOOTHIES & JUICES", gold: false },
  { href: "/approved",          label: "FOOD & SNACKS", gold: false },
  { href: "/top",               label: "TOP RATED",    gold: false },
  { href: "/glutenfree",        label: "GLUTEN FREE",  gold: false },
  { href: "/fitness",           label: "FITNESS",      gold: false },
  { href: "/rankings",          label: "SUPPLEMENTS",  gold: false },
  { href: "/energy",            label: "BEVERAGES",    gold: false },
  { href: "/caffeine",          label: "CAFFEINE",     gold: false },
  { href: "/beauty",            label: "BEAUTY",       gold: false },
  { href: "/kids",              label: "KIDS",         gold: false },
  { href: "/kids-snacks",       label: "KIDS' SNACKS", gold: false },
  { href: "/cheat",             label: "CHEAT LIST",   gold: false },
  { href: "/avoid",             label: "STAY AWAY",    gold: false },
  { href: "/methodology",       label: "METHODOLOGY",  gold: false },
  { href: "/about",             label: "ABOUT",        gold: false },
  { href: "/bc-liquor",         label: "BC LIQUOR",    gold: false },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
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

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-2"
        >
          <span className={`h-0.5 w-6 bg-gold transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-gold transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-gold transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-background px-5 pb-6 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-1 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRIMARY_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/fitness" && link.href !== "/" && pathname.startsWith(link.href + "/"));
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
          </div>
        </div>
      )}
    </header>
  );
}
