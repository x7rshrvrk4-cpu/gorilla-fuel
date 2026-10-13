import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — Gorilla Fuel",
  description:
    "Terms of use for gorillafuel.ca — acceptable use, no-scraping policy, intellectual property, affiliate disclosure, and no-warranty terms.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "October 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FUEL</p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">Terms of Use</h1>
      <p className="mt-3 text-sm text-muted">Last updated: {UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-xl text-foreground">1. What this is</h2>
          <p className="mt-2">
            Gorilla Fuel (gorillafuel.ca) is a free product-intelligence tool for Canadian shoppers. The scores and
            information are for general educational purposes only and are <span className="text-foreground">not medical,
            dietary, or professional advice</span>. Always read the product label and consult a qualified professional
            for health decisions. By using the site you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">2. The scores and data</h2>
          <p className="mt-2">
            Gorilla Scores are independent and are <span className="text-foreground">never for sale</span> — no brand,
            sponsor, or partner can pay to change a score. Scores are derived from public and licensed data sources and
            Gorilla Fuel&apos;s own scoring methodology. Data may be incomplete or out of date; we make no guarantee of
            accuracy and products can change formulation at any time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">3. Acceptable use — no scraping</h2>
          <p className="mt-2">You agree <span className="text-foreground">not</span> to:</p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex gap-2"><span className="text-gold">—</span><span>scrape, crawl, harvest, or use automated means to extract the site&apos;s content, database, or scores in bulk;</span></li>
            <li className="flex gap-2"><span className="text-gold">—</span><span>access our APIs or data stores other than through the normal website in a normal browser, or at a volume that burdens the service;</span></li>
            <li className="flex gap-2"><span className="text-gold">—</span><span>copy, reproduce, republish, or redistribute the curated database or the scoring methodology, in whole or in part;</span></li>
            <li className="flex gap-2"><span className="text-gold">—</span><span>use any part of Gorilla Fuel to build, train, or operate a competing product or service;</span></li>
            <li className="flex gap-2"><span className="text-gold">—</span><span>attempt to access non-public areas, interfere with the site, or circumvent rate limits or security controls.</span></li>
          </ul>
          <p className="mt-3">
            We may rate-limit, block, or pursue legal remedies against anyone who violates this section.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">4. Intellectual property</h2>
          <p className="mt-2">
            The Gorilla Fuel name, brand, design, the curated product database, and the scoring methodology are the
            property of Gorilla Fuel and are protected by copyright and other rights. You get a limited, personal,
            non-commercial licence to use the site for your own shopping decisions. All other rights are reserved. No
            scraping, bulk copying, or commercial reuse is permitted without prior written permission.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">5. Affiliate &amp; sponsorship disclosure</h2>
          <p className="mt-2">
            Some links are affiliate links (including the Amazon Associates program) — if you buy through one, Gorilla
            Fuel may earn a small commission at no extra cost to you. Sponsored or partner placements are always clearly
            labelled. As stated above, <span className="text-foreground">a score can never be bought</span>; we only ever
            feature or link products that already score well.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">6. No warranty &amp; limitation of liability</h2>
          <p className="mt-2">
            The site is provided &ldquo;as is,&rdquo; without warranties of any kind. To the fullest extent permitted by
            law, Gorilla Fuel is not liable for any decision made, or loss or harm suffered, in reliance on the site or
            its scores.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">7. Changes &amp; contact</h2>
          <p className="mt-2">
            We may update these terms from time to time; continued use means you accept the current version. Questions:
            reach out via the channels on the site.{" "}
            <Link href="/" className="text-gold underline hover:text-foreground">Back to home →</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
