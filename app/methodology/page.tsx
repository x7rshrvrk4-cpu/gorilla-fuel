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

const SOURCES: { name: string; description: string }[] = [
  { name: "Open Food Facts", description: "Product, ingredient, and nutrition data — the backbone of every scan." },
  { name: "Labdoor Testing Database", description: "Independent purity and label-accuracy benchmarks for supplements." },
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
          No black boxes. No paid placements. Here is exactly how every score, badge,
          and warning on this site gets generated — start to finish.
        </p>
      </div>

      {/* THE SCORE */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">How The Score Is Built</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Every product gets a single Final Score out of 100, which is a weighted blend of two
          independent sub-scores. Both start at a perfect 100 and lose points only when the data
          gives us a real reason to dock them — nothing is subjective or hand-tuned per brand.
        </p>

        <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
          <div className="bg-surface p-6">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-gold">Nutrition Score · 60%</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Calculated from sugar, saturated fat, salt, calorie density, fiber, and protein per
              100g, measured against thresholds drawn from WHO and major cardiology-body
              guidelines:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted">
              <li>— Sugar: −12 over 12g/100g, −30 over 20g/100g</li>
              <li>— Saturated fat: −10 over 5g/100g, −20 over 10g/100g</li>
              <li>— Salt: −8 over 0.6g/100g, −25 over 1.5g/100g</li>
              <li>— Calories: −8 over 350 kcal/100g, −15 over 500 kcal/100g</li>
              <li>— Fiber over 3g/100g: +8 · Protein over 10g/100g: +10</li>
            </ul>
          </div>
          <div className="bg-surface p-6">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-gold">Additive Score · 40%</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Every detected additive is matched against our intel database — over 50 entries
              covering common names, aliases, and E-codes. Each match deducts a penalty sized to
              its real-world risk level (high / medium / low), and the running total is the
              Additive Score.
            </p>
            <p className="mt-3 text-xs text-muted">
              The two scores are blended <span className="text-foreground">60/40 toward nutrition</span> —
              what you eat in bulk matters more than trace additive exposure, but both move the needle.
              The final number maps to a letter grade: <span className="text-foreground">Excellent (75+)
              · Good (50–74) · Poor (25–49) · Bad (below 25)</span>.
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

      {/* DATA SOURCES */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">Data Sources</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Every score, badge, and citation on this site traces back to one of these public,
          independently checkable sources — never to brand-supplied marketing copy.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {SOURCES.map((s) => (
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

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
    </div>
  );
}
