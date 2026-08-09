import Link from "next/link";

export const LEGAL_DISCLAIMER =
  "Gorilla Fuel scores are generated algorithmically from publicly available data sources including Open Food Facts, PubMed, WHO, and Health Canada databases. Scores represent our independent analytical assessment and constitute opinion, not medical or nutritional advice. Individual health circumstances vary. Consult a qualified healthcare professional before making dietary or supplement decisions. Gorilla Fuel is not affiliated with, endorsed by, or sponsored by any brand or manufacturer. Product formulations change — always verify current ingredient information on the product label.";

// Split the disclaimer around the single "Open Food Facts" mention so the footer
// can render that phrase as a link to /attribution (ODbL notice) without altering
// the canonical LEGAL_DISCLAIMER string used elsewhere.
const [DISCLAIMER_BEFORE_OFF, DISCLAIMER_AFTER_OFF] = LEGAL_DISCLAIMER.split("Open Food Facts");

const EXPLORE = [
  { href: "/alcohol",   label: "Alcohol" },
  { href: "/approved",  label: "Food and Snacks" },
  { href: "/rankings",  label: "Supplements" },
  { href: "/scan",      label: "Scanner" },
  { href: "/rankings/alcohol", label: "Ontario Top 10" },
];

const GORILLA_INTEL = [
  { href: "/approved",   label: "Gorilla Approved" },
  { href: "/cheat",      label: "Cheat List" },
  { href: "/avoid",      label: "Stay Away" },
  { href: "/kids",       label: "Kids" },
  { href: "/glutenfree", label: "Gluten Free" },
  { href: "/beauty",     label: "Beauty" },
];

const INFO = [
  { href: "/methodology", label: "Methodology" },
  { href: "/about",        label: "About" },
  { href: "/attribution",  label: "Attribution" },
  { href: "/about#privacy", label: "Privacy Policy" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Four columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* EXPLORE */}
          <div>
            <p className="font-display text-sm tracking-[0.25em] text-gold">EXPLORE</p>
            <ul className="mt-4 flex flex-col gap-2">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* GORILLA INTEL */}
          <div>
            <p className="font-display text-sm tracking-[0.25em] text-gold">GORILLA INTEL</p>
            <ul className="mt-4 flex flex-col gap-2">
              {GORILLA_INTEL.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* INFO */}
          <div>
            <p className="font-display text-sm tracking-[0.25em] text-gold">INFO</p>
            <ul className="mt-4 flex flex-col gap-2">
              {INFO.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* GORILLA ECOSYSTEM */}
          <div>
            <p className="font-display text-sm tracking-[0.25em] text-gold">GORILLA ECOSYSTEM</p>
            <div className="mt-4">
              <a
                href="https://gorillasports.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-base tracking-widest text-foreground transition-colors hover:text-gold"
              >
                Gorilla Sports
              </a>
              <p className="mt-1 text-sm text-muted">gorillasports.ca</p>
              <p className="mt-1 text-xs text-muted/60">Train hard. Fuel harder. Bet sharper.</p>
            </div>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="mt-10 border-t border-line pt-6">
          <p className="text-center text-xs text-muted">
            Gorilla Fuel &mdash; Canadian Product Intelligence &mdash; No brand pays for placement.
            &nbsp;·&nbsp; © {new Date().getFullYear()} gorillafuel.ca
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted/60">
            {/* Link "Open Food Facts" through to the ODbL attribution page. The
                disclaimer text itself is unchanged (LEGAL_DISCLAIMER stays the
                canonical string); only the OFF mention becomes a link. */}
            {DISCLAIMER_BEFORE_OFF}
            <Link href="/attribution" className="underline decoration-muted/40 underline-offset-2 transition-colors hover:text-gold">
              Open Food Facts
            </Link>
            {DISCLAIMER_AFTER_OFF}
          </p>
        </div>
      </div>
    </footer>
  );
}
