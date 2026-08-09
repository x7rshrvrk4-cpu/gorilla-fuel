import type { Metadata } from "next";
import EvidenceTierBadge, { tierDescription, tierLabel } from "../components/EvidenceTierBadge";
import CrossLinkBanner from "../components/CrossLinkBanner";
import { GRADE_LEGEND, GRADE_COLORS } from "../rankings/lib/products";
import type { EvidenceTier } from "../scan/lib/scoring";

export const metadata: Metadata = {
  title: "Methodology — Gorilla Fuel",
  description: "How Gorilla Fuel calculates every score: nutrition, additives, evidence tiers, data sources, and our audit trail.",
};

const TIERS: EvidenceTier[] = ["strong-consensus", "emerging-evidence", "contested", "precautionary"];

/** How each tier is applied in scoring — shown alongside the badge definitions. */
const TIER_APPLICATION: Record<EvidenceTier, string> = {
  "strong-consensus":
    "Multiple peer-reviewed meta-analyses agree. We apply this flag to ingredients with overwhelming scientific agreement on safety or harm.",
  "emerging-evidence":
    "Studies exist but research is ongoing. We note these ingredients and flag them without applying maximum penalties.",
  contested:
    "Genuine scientific disagreement exists. We present both sides and apply moderate consideration.",
  precautionary:
    "Limited human data, but mechanistic concerns exist. We apply conservative flagging while noting the uncertainty.",
};

const SOURCES: { name: string; description: string; badge?: string; href?: string }[] = [
  // ── Waterfall lookup order ─────────────────────────────────────────────────
  { name: "Gorilla Curated Database", badge: "Step 1 · GORILLA CURATED", description: "Our own hand-verified product database. Every entry is manually reviewed with confirmed nutrition and serving-size data. Checked first on every scan." },
  { name: "Community Submissions", badge: "Step 2 · COMMUNITY", description: "User-submitted products that have passed admin review. Enables Canadian and regional products not yet covered by major databases." },
  { name: "Open Food Facts", badge: "Step 3 · OPEN FOOD FACTS", href: "/attribution", description: "The world's largest open food database — 3M+ products with ingredients, nutrition, additives, and NOVA processing group. Backbone of every food, drink, and supplement scan. Used under the Open Database License (ODbL) — see Attribution." },
  { name: "USDA FoodData Central", badge: "Step 4 · USDA", description: "The US Department of Agriculture's branded-food nutrition database." },
  { name: "FatSecret Platform", badge: "Step 5 · FATSECRET", description: "A large global food and nutrition database covering millions of branded foods." },
  { name: "Barcode Lookup", badge: "Step 6 · BARCODE DB", description: "A consumer product database with nutrition data where available." },
  { name: "NIH Dietary Supplement Label Database", badge: "Step 7 · NIH VERIFIED", description: "The US National Institutes of Health's official registry of dietary supplement labels. Returns serving size, supplement facts, and certifications (NSF, Informed Sport) — displayed with a blue NIH VERIFIED government badge." },
  { name: "UPCitemdb", badge: "Step 8 · UPC DATABASE", description: "A UPC product database covering millions of consumer products. Returns name, brand, and category for identification when nutrition data is unavailable." },
  { name: "Nutritionix Branded Food Database", badge: "Step 9 · NUTRITIONIX", description: "A large North American branded-food database with strong coverage of US grocery products." },
  { name: "Open Beauty Facts", badge: "Step 10 · OPEN BEAUTY FACTS", description: "Open Food Facts' sister database for cosmetics and personal care — powers Beauty Mode with a purple BEAUTY PRODUCT banner when a barcode matches a non-food item." },
  { name: "WineVybe Beer Database", badge: "Step 11 · WINEVYBE", description: "A beer and beverage barcode database, used for alcohol products when food databases return no result." },
  { name: "Wine Analyzer", badge: "Step 12 · WINE ANALYZER", description: "A wine-specific barcode lookup used for wine products." },
  { name: "TTB COLA Cloud (US Government Alcohol Registry)", badge: "Step 13 · COLA VERIFIED", description: "The US Alcohol and Tobacco Tax and Trade Bureau's Certificate of Label Approval database. Every alcohol product sold in the US must be registered here — displayed with a navy COLA VERIFIED government badge." },
  { name: "Go-UPC Global Product Database", badge: "Step 14 · GO-UPC", description: "500M+ product records worldwide. Returns name, brand, image, and category when nutrition-focused databases return no result." },
  { name: "Open Drug Facts", badge: "Step 15 · OPEN DRUG FACTS", description: "OTC drug and medication database from the same open-data infrastructure as Open Food Facts. Displayed with a blue MEDICATION banner and a healthcare disclaimer." },
  // ── Scoring, safety, and research reference sources ────────────────────────
  { name: "Labdoor Testing Database", description: "Independent purity and label-accuracy benchmarks for supplements, referenced for context (Labdoor has no public API for live per-product lookups)." },
  { name: "Examine.com Research Database", description: "Curated, citation-backed summaries of what each common supplement ingredient does, its evidence strength, dose range, and safety considerations." },
  { name: "PubMed / National Library of Medicine", description: "Peer-reviewed research — the most recent indexed papers on each detected additive." },
  { name: "Health Canada Natural Health Products Database", description: "Licensing, NPN verification, and ingredient status for supplements." },
  { name: "Open FDA Enforcement Database", description: "Active recalls and enforcement actions checked on every scan." },
  { name: "IARC Monographs Programme", description: "The WHO's cancer research arm — carcinogenicity classifications." },
  { name: "WHO / FAO JECFA Food Additive Evaluations", description: "Joint expert committee evaluations behind global additive standards." },
  { name: "EFSA ANS Panel Opinions", description: "The European Food Safety Authority's additive re-evaluations." },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        <p className="font-display text-sm tracking-[0.3em] text-gold">TRANSPARENCY</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          The <span className="text-gold">Methodology</span>.
        </h1>
        <p className="mt-4 text-muted">
          No black boxes. No paid placements. Here is how every score, badge,
          and warning on this site gets generated — start to finish.
        </p>
      </div>

      {/* INDEPENDENCE STATEMENT */}
      <section className="mt-10">
        <div className="rounded-sm border border-gold bg-gradient-to-r from-gold/10 to-transparent p-6">
          <p className="font-display text-lg tracking-[0.2em] text-gold">
            GORILLA FUEL INDEPENDENCE STATEMENT
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/90">
            Gorilla Fuel is an independent analytical platform. No brand,
            manufacturer, or retailer pays for placement, influences scoring, or
            has any input into our rankings or results. Our scoring methodology
            is applied identically to every product regardless of brand size,
            marketing budget, or popularity. A product from a small Canadian
            craft brewery is scored using the exact same framework as a
            multinational corporation. The data determines the score. Nothing
            else.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/90">
            We do not accept sponsorships that influence product scores. We do
            not accept payment for featured placement. We do not adjust scores
            based on advertiser relationships, because we have none. Our
            affiliate links exist to fund platform development and are applied
            uniformly to top ranked products — they do not influence how
            products are scored or ranked.{" "}
            <span className="text-gold">A product earns its ranking and then
            receives an affiliate link. Not the other way around.</span>
          </p>
        </div>
      </section>

      {/* THE SCORE */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">How The Score Is Built</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Every product gets a single Final Score out of 100, which is a weighted blend of three
          dimensions. The two sub-scores start at a perfect 100 and lose points only when the data
          gives us a real reason to dock them — nothing is subjective or hand-tuned per brand —
          and a small organic bonus is added on top when it&apos;s genuinely earned.
        </p>

        <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3">
          <div className="bg-surface p-6">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-gold">Nutrition Score · 60%</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Calculated from sugar, saturated fat, salt, calorie density, fiber, protein, and NOVA
              processing group per 100g. Each nutrient is measured against graduated thresholds
              drawn from WHO and major cardiology-body guidelines — penalties scale up as a
              nutrient moves from &ldquo;elevated&rdquo; to &ldquo;high&rdquo; to
              &ldquo;very high,&rdquo; while meaningful fiber and protein content earns credit
              back. Higher NOVA processing groups carry additional penalties.
            </p>
            <p className="mt-3 text-xs text-muted">
              Every flagged nutrient also shows the per-serving figure alongside the per-100g one
              (e.g. &ldquo;High sugar: 26g per 100g (4g per 15g serving)&rdquo;) whenever
              serving-size data is available, so the number maps to what you&apos;ll actually eat.
            </p>
            <p className="mt-3 text-xs text-muted">
              <span className="text-foreground">Why 60%:</span> what you eat in bulk is the
              primary purpose of food — macros and processing dominate health outcomes.
            </p>
          </div>
          <div className="bg-surface p-6">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-gold">Additive Score · 30%</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Every detected additive is matched against our intel database — over 50 entries
              covering common names, aliases, and E-codes. Each match deducts a penalty sized to
              its real-world risk level (high / medium / low), and the running total is the
              Additive Score.
            </p>
            <p className="mt-3 text-xs text-muted">
              <span className="text-foreground">Why 30%:</span> a product can have good
              macros and a terrible additive list — exposure to flagged compounds deserves
              real weight of its own.
            </p>
          </div>
          <div className="bg-surface p-6">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-gold">Organic Bonus · 10%</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Up to <span className="text-foreground">+10 points</span> are added on top whenever
              Open Food Facts&apos; labels or categories carry a verified organic certification
              (e.g. &ldquo;organic,&rdquo; &ldquo;bio,&rdquo; &ldquo;biologique&rdquo;). No
              certification, no bonus — we don&apos;t guess from marketing copy.
            </p>
            <p className="mt-3 text-xs text-muted">
              <span className="text-foreground">Why 10%:</span> organic certification matters —
              but it is not the whole picture. Organic sugar is still sugar.
            </p>
            <p className="mt-3 text-xs text-muted">
              The three combine as <span className="text-foreground">60% nutrition + 30% additives
              + the organic bonus</span>. The final number maps to a letter grade:{" "}
              <span className="text-foreground">Excellent (75+) · Good (50–74) · Poor (25–49) ·
              Bad (below 25)</span>.
            </p>
          </div>
        </div>
      </section>

      {/* EVIDENCE TIERS */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">The Four Evidence Tiers</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          A risk rating tells you <em>how bad</em> something might be if the concern is real. An
          Evidence Tier tells you <em>how settled the science actually is</em> — two completely
          different questions we refuse to collapse into one number. You&apos;ll see a tier badge on
          every additive card and every ranked product.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <div key={tier} className="gorilla-card flex items-start gap-4 rounded-sm p-5">
              <EvidenceTierBadge tier={tier} className="mt-1" />
              <div>
                <p className="font-display text-lg tracking-wide text-foreground">{tierLabel(tier)}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{tierDescription(tier)}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  <span className="text-gold/70">How we apply it: </span>
                  {TIER_APPLICATION[tier]}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 text-sm leading-relaxed text-muted sm:grid-cols-2">
          <p>
            <span className="font-display text-foreground">Example — Strong Consensus: </span>
            Creatine monohydrate. Decades of large clinical trials and alignment across every major
            sports-nutrition body — there&apos;s effectively no live debate left to report.
          </p>
          <p>
            <span className="font-display text-foreground">Example — Precautionary: </span>
            A novel synthetic ingredient with a plausible mechanism of concern but only a handful
            of small or animal studies — not yet enough data for anyone to issue a real verdict.
          </p>
        </div>
      </section>

      {/* GRADE SCALE */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">Product Grade Scale</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Ranked supplements get a letter grade derived from purity score, label transparency,
          and independent testing — the same no-nonsense lens applied to every entry in the hub.
        </p>
        <div className="mt-5 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {GRADE_LEGEND.map((entry) => (
            <div key={entry.grade} className="flex gap-4 bg-surface p-5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border-2 font-display text-xl"
                style={{ borderColor: GRADE_COLORS[entry.grade], color: GRADE_COLORS[entry.grade] }}
              >
                {entry.grade}
              </span>
              <div>
                <p className="font-display text-lg tracking-wide text-foreground">{entry.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{entry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NOVA CLASSIFICATION */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">NOVA Processing Classification</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          NOVA is the internationally recognised system (developed at the University of São
          Paulo and used by the WHO and FAO) that classifies foods by how processed they
          are — not by their nutrients. We use it as one input to the Nutrition Score:
          more processing means more penalty.
        </p>
        <div className="mt-5 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            { group: "1", title: "Unprocessed / Minimally Processed", body: "Fresh fruit, whole grains, plain meat, milk, eggs, plain nuts and seeds — Ontario apples, steel-cut oats, a chicken breast." },
            { group: "2", title: "Processed Culinary Ingredients", body: "Substances used in cooking — oils, butter, salt, sugar, maple syrup. You season with these; you don't eat them alone." },
            { group: "3", title: "Processed Foods", body: "Group 1 + Group 2 combined — canned vegetables, smoked fish, cheese, fresh bakery bread, salted nuts." },
            { group: "4", title: "Ultra-Processed Foods", body: "Industrial formulations — chips, cookies, soft drinks, instant noodles. Colourants, emulsifiers, flavourings, HFCS. Most heavily penalised." },
          ].map((n) => (
            <div key={n.group} className="bg-surface p-5">
              <p className="font-display text-3xl text-gold-dim">{n.group}</p>
              <p className="mt-1 font-display text-base leading-tight text-foreground">{n.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{n.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ALCOHOL SCORING */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">How Alcohol Scoring Works</h2>
        <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Beer, seltzer, cider and RTD products are evaluated on three pillars:{" "}
            <span className="text-foreground">cleanliness</span> (number and risk level of
            known additives — clarity agents, artificial sweeteners, sulphites, colourants),{" "}
            <span className="text-foreground">calorie density</span> per serving, and{" "}
            <span className="text-foreground">carbohydrate and sugar content</span> per
            serving, with higher-ABV products weighed down accordingly. The result is the
            1–5 Gorilla Pour rating shown on every card. Spirits are not currently in the
            main scoring system.
          </p>
          <p>
            Wines use a published weighted score —{" "}
            <span className="text-foreground">sugar 40% · calorie density 30% · additives 30%</span>{" "}
            — measured per standard 148mL pour (60mL for icewine, which is served as a
            dessert wine). Dry wines naturally score highest. Ontario VQA wines are
            identified with a dedicated badge but are scored with the identical framework
            as every other wine.
          </p>
        </div>
      </section>

      {/* SUPPLEMENT RANKINGS */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">How Supplement Rankings Work</h2>
        <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Every ranked supplement is evaluated on four pillars:{" "}
            <span className="text-foreground">purity</span> (label accuracy, contaminant
            risk, and filler content), <span className="text-foreground">independent
            third-party testing</span>, <span className="text-foreground">certifications
            and transparency</span> (full-disclosure labels beat proprietary blends, every
            time), and <span className="text-foreground">value</span> (price per effective
            serving, not price per tub). Those pillars combine into the S-through-D letter
            grade shown above.
          </p>
          <p>
            <span className="text-foreground">The certification hierarchy:</span>{" "}
            NSF Certified for Sport ranks highest, then Informed Sport, then Informed
            Choice, then no certification. Manufacturer self-testing doesn&apos;t count as
            third-party verification at any level.
          </p>
          <p>
            Where claims are involved, each product also carries an Evidence Tier badge so
            you can see how settled the science is on its category — a perfectly pure
            product in a contested category will say so.
          </p>
        </div>
      </section>

      {/* DATA SOURCES */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">Data Sources</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Every scan checks 15 data sources in priority order. Every score, badge,
          and citation traces back to one of these public, independently checkable
          sources — never to brand-supplied marketing copy.
        </p>

        <h3 className="mt-8 font-display text-xl text-gold">Lookup Sources · Steps 1–15</h3>
        <p className="mt-1 text-xs text-muted">Checked in this priority order on every scan.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SOURCES.filter((s) => s.badge).map((s) => (
            <div key={s.name} className="rounded-sm border border-gold/20 bg-surface p-4">
              <p className="font-display text-[10px] uppercase tracking-[0.25em] text-gold/60">{s.badge}</p>
              <p className="mt-1 font-display text-base tracking-wide text-foreground">
                {s.href ? (
                  <a href={s.href} className="underline decoration-gold-dim underline-offset-4 hover:text-gold">{s.name}</a>
                ) : (
                  s.name
                )}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{s.description}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-8 font-display text-xl text-gold">Scoring &amp; Safety Reference Sources</h3>
        <p className="mt-1 text-xs text-muted">Used for additive scoring, supplement research, recall detection, and carcinogenicity classification.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SOURCES.filter((s) => !s.badge).map((s) => (
            <div key={s.name} className="rounded-sm border border-line bg-surface p-4">
              <p className="font-display text-base tracking-wide text-gold">{s.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIT SCHEDULE */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">Update &amp; Audit Schedule</h2>
        <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            An automated job runs <span className="text-foreground">every 24 hours</span> and:
          </p>
          <ul className="space-y-1.5 pl-1">
            <li>— Checks Open FDA for any new recalls or enforcement actions on products in our rankings database, and flags them.</li>
            <li>— Checks Health Canada for any new advisories or licensing-status changes on supplement ingredients we track.</li>
            <li>
              — Logs every detected change to a permanent <code className="rounded-sm bg-background px-1.5 py-0.5 text-xs text-gold">fuel_audit_log</code> table —
              date, product, change type, old value, new value, and the source URL — so there&apos;s
              always a queryable record of exactly what changed and why.
            </li>
          </ul>
          <p>
            On every individual scan, we also pull the two most recent peer-reviewed papers on
            each detected additive from PubMed in real time, check Open FDA for active recalls on
            that specific product or brand, and — for supplements — verify Health Canada NPN
            licensing on the spot.
          </p>
        </div>
      </section>

      {/* CONFLICT OF INTEREST */}
      <section className="mt-14 mb-4">
        <h2 className="font-display text-3xl text-foreground">Conflict of Interest Statement</h2>
        <div className="mt-3 max-w-3xl rounded-sm border border-gold-dim bg-surface p-6">
          <p className="text-sm leading-relaxed text-muted">
            <span className="font-display text-gold">Gorilla Fuel does not accept payment for product placement.</span>{" "}
            No brand can buy a better grade, a higher rank, a friendlier writeup, or a spot in
            &ldquo;Healthier Alternatives.&rdquo; Every score on this site is generated algorithmically from
            the public data sources listed above — the same inputs are available to anyone who
            wants to check our work. If we ever change that policy, this page will say so, in
            this same plain language, on the same day it happens.
          </p>
        </div>
      </section>

      {/* EDITORIAL OPINION DISCLOSURE */}
      <section className="mt-6 mb-4">
        <div className="max-w-3xl rounded-sm border border-line bg-surface p-6">
          <p className="text-sm leading-relaxed text-muted">
            All scores constitute editorial opinion based on publicly disclosed methodology.
            Gorilla Fuel is an independent analytical platform. No brand pays for placement or
            influences scoring.
          </p>
        </div>
      </section>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
    </div>
  );
}
