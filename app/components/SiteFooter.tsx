import Link from "next/link";

export const LEGAL_DISCLAIMER =
  "Gorilla Fuel scores are generated algorithmically from publicly available data sources including Open Food Facts, PubMed, WHO, and Health Canada databases. Scores represent our independent analytical assessment and constitute opinion, not medical or nutritional advice. Individual health circumstances vary. Consult a qualified healthcare professional before making dietary or supplement decisions. Gorilla Fuel is not affiliated with, endorsed by, or sponsored by any brand or manufacturer. Product formulations change — always verify current ingredient information on the product label.";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/methodology" className="font-display text-sm tracking-[0.2em] text-gold transition-colors hover:text-foreground">
            Methodology
          </Link>
          <Link href="/about" className="font-display text-sm tracking-[0.2em] text-gold transition-colors hover:text-foreground">
            About
          </Link>
          <span className="ml-auto text-xs text-muted">
            © {new Date().getFullYear()} Gorilla Fuel · gorillafuel.ca
          </span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">{LEGAL_DISCLAIMER}</p>
      </div>
    </footer>
  );
}
