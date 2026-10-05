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

// Gorilla Sports channels — cross-promo for the ecosystem (these are the Sports
// accounts, not Fuel-specific). Inline brand glyphs (Simple Icons paths) so there's
// no icon-library dependency. Fuel's own IG/X/FB links get added once those exist.
const SOCIALS = [
  {
    label: "Gorilla Sports on X",
    href: "https://x.com/GorillasportsON",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Gorilla Sports on YouTube",
    href: "https://youtube.com/@gorillasportsbets",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "Gorilla Sports on TikTok",
    href: "https://www.tiktok.com/@gorilla6770",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
];

// Gorilla Fuel's OWN channels. Instagram is live (@gorilla.fuel); X and Facebook
// get added here once the handles exist. These are what the weekly-picks feed
// automation posts to.
const FUEL_SOCIALS = [
  {
    label: "Gorilla Fuel on Instagram",
    href: "https://www.instagram.com/gorilla.fuel",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Gorilla Fuel on Facebook",
    href: "https://www.facebook.com/share/1DbwwCMk2T/",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
];

function SocialIconLink({ label, href, path }: { label: string; href: string; path: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="me noopener noreferrer"
      aria-label={label}
      className="text-muted transition-colors hover:text-gold"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    </a>
  );
}

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
              <div className="mt-3 flex items-center gap-4">
                {SOCIALS.map((s) => (
                  <SocialIconLink key={s.label} {...s} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider + Gorilla Fuel socials + copyright */}
        <div className="mt-10 border-t border-line pt-6">
          <div className="flex flex-col items-center gap-2">
            <p className="font-display text-[11px] uppercase tracking-[0.25em] text-gold">Follow Gorilla Fuel</p>
            <div className="flex items-center gap-4">
              {FUEL_SOCIALS.map((s) => (
                <SocialIconLink key={s.label} {...s} />
              ))}
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted">
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
