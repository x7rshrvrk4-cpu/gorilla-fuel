const SOURCES = [
  "Open Food Facts (product and ingredient data)",
  "Open Beauty Facts (cosmetics product and ingredient data)",
  "Labdoor Testing Database (purity benchmarks)",
  "Examine.com Research Database (supplement ingredient summaries)",
  "PubMed National Library of Medicine (peer-reviewed research)",
  "Health Canada Natural Health Products Database",
  "Open FDA Enforcement Database",
  "IARC Monographs",
  "WHO Food Additives Database",
];

export default function SourcesFooter() {
  return (
    <div className="border-t border-line bg-background/40 p-6">
      <h3 className="font-display text-sm uppercase tracking-[0.25em] text-gold">Sources &amp; Methodology</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        This score was generated using:{" "}
        {/* OFF (SOURCES[0]) links to the ODbL attribution notice; the rest render as plain text. */}
        <a href="/attribution" className="text-gold underline decoration-gold-dim underline-offset-4 hover:text-gold/80">
          {SOURCES[0]}
        </a>
        {SOURCES.length > 1 ? ` · ${SOURCES.slice(1).join(" · ")}` : ""}.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Open Food Facts data is used under the Open Database License (ODbL).{" "}
        <a href="/attribution" className="text-gold underline decoration-gold-dim underline-offset-4 hover:text-gold/80">
          Attribution &amp; licenses →
        </a>
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Gorilla Fuel does not accept payment for product placement. All scores are generated
        algorithmically from public data sources.{" "}
        <a href="/methodology" className="text-gold underline decoration-gold-dim underline-offset-4 hover:text-gold/80">
          Read the full methodology →
        </a>
      </p>
    </div>
  );
}
