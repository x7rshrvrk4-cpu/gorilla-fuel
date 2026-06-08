export const LEGAL_DISCLAIMER =
  "Gorilla Fuel scores are generated algorithmically from publicly available data sources including Open Food Facts, PubMed, WHO, and Health Canada databases. Scores represent our independent analytical assessment and constitute opinion, not medical or nutritional advice. Individual health circumstances vary. Consult a qualified healthcare professional before making dietary or supplement decisions. Gorilla Fuel is not affiliated with, endorsed by, or sponsored by any brand or manufacturer. Product formulations change — always verify current ingredient information on the product label.";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-xs leading-relaxed text-muted">{LEGAL_DISCLAIMER}</p>
      </div>
    </footer>
  );
}
