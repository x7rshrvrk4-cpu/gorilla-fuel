import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attribution & Licenses — Gorilla Fuel",
  description:
    "Data attribution and license notices for Gorilla Fuel. Product and ingredient data from Open Food Facts is used under the Open Database License (ODbL).",
  alternates: { canonical: "/attribution" },
};

// External-link styling matches the site's existing link treatment (SourcesFooter).
const linkCls =
  "text-gold underline decoration-gold-dim underline-offset-4 hover:text-gold/80";

/**
 * Sources cited in our methodology whose individual license terms we have NOT
 * independently verified against the source's own documentation. We deliberately
 * make NO license claim for these here — a wrong license statement on a public
 * page is worse than an omission. Each specific notice will be added only after
 * its terms are verified from the source itself.
 */
const UNVERIFIED_SOURCES: { name: string; note: string }[] = [
  { name: "Open Beauty Facts", note: "Open Food Facts sister database (cosmetics). Same project as Open Food Facts and likely ODbL, but not separately verified here." },
  { name: "Open Drug Facts", note: "Open Food Facts sister database (OTC medications). Same project as Open Food Facts and likely ODbL, but not separately verified here." },
  { name: "PubMed / National Library of Medicine", note: "Peer-reviewed research citations." },
  { name: "Health Canada — Natural Health Products Database", note: "Government of Canada data." },
  { name: "Open FDA — Enforcement / recalls", note: "U.S. Food & Drug Administration data." },
  { name: "IARC Monographs", note: "International Agency for Research on Cancer references." },
  { name: "WHO Food Additives Database", note: "World Health Organization references." },
  { name: "Labdoor Testing Database", note: "Third-party purity benchmarks." },
  { name: "Examine.com Research Database", note: "Supplement ingredient research summaries." },
];

export default function AttributionPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="font-display text-sm tracking-[0.3em] text-gold">DATA ATTRIBUTION</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          Attribution &amp; <span className="text-gold">Licenses</span>
        </h1>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-muted">
          <p>
            Gorilla Fuel is built on public and open data. This page gives the
            license notices required by the sources we rely on.
          </p>
        </div>

        {/* ── Open Food Facts — ODbL (the required notice, verbatim) ─────────── */}
        <section className="mt-10 rounded-sm border border-gold/30 bg-surface p-6">
          <h2 className="font-display text-sm uppercase tracking-[0.25em] text-gold">
            Open Food Facts
          </h2>
          <p className="mt-3 text-base leading-relaxed text-foreground">
            Contains information from{" "}
            <a
              href="https://world.openfoodfacts.org"
              target="_blank"
              rel="noopener noreferrer"
              className={linkCls}
            >
              Open Food Facts
            </a>
            , which is made available under the{" "}
            <a
              href="https://opendatacommons.org/licenses/odbl/1-0/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkCls}
            >
              Open Database License (ODbL)
            </a>
            .
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Open Food Facts is the backbone of our product cache — the source of
            ingredient lists, nutrition facts, additive tags, and processing
            (NOVA) group data used to compute Gorilla scores for food, drink, and
            supplement barcodes.
          </p>
        </section>

        {/* ── Other cited sources — no license claim without verification ────── */}
        <section className="mt-10">
          <h2 className="font-display text-sm uppercase tracking-[0.25em] text-gold">
            Other data sources
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The sources below are cited in our{" "}
            <a href="/methodology" className={linkCls}>methodology</a>. We have{" "}
            <span className="text-foreground">not independently verified</span> their
            individual license terms, so we make no license claim for them here.
            Where a source publishes open-data terms, we will add its specific
            notice after verifying it against the source&apos;s own documentation.
          </p>
          <ul className="mt-5 space-y-3">
            {UNVERIFIED_SOURCES.map((s) => (
              <li key={s.name} className="rounded-sm border border-line bg-surface p-4">
                <p className="font-display text-base tracking-wide text-foreground">{s.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{s.note}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted/60">
                  License: not independently verified
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-xs leading-relaxed text-muted/60">
          Scores and analysis are Gorilla Fuel&apos;s own independent, algorithmically
          generated assessment and are not part of, or endorsed by, any source
          listed above. See our{" "}
          <a href="/methodology" className={linkCls}>methodology</a> for how scores
          are computed.
        </p>
      </div>
    </>
  );
}
