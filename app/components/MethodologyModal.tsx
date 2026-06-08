"use client";

import { useEffect } from "react";
import EvidenceTierBadge, { tierDescription, tierLabel } from "./EvidenceTierBadge";
import type { EvidenceTier } from "../scan/lib/scoring";

const TIERS: EvidenceTier[] = ["strong-consensus", "emerging-evidence", "contested", "precautionary"];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MethodologyModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="gorilla-card animate-rise max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-sm sm:rounded-sm">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/95 p-5 backdrop-blur">
          <h2 className="font-display text-2xl tracking-wide text-foreground">How We Score</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:border-gold hover:text-gold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8 p-5 sm:p-6">
          <section>
            <h3 className="font-display text-lg tracking-[0.2em] text-gold">THE SCORE</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Every Gorilla Fuel score blends three numbers. A{" "}
              <span className="text-foreground">Nutrition Score</span> (60% weight) is built from
              sugar, fat, salt, and energy density against established public-health thresholds —
              and now also factors in <span className="text-foreground">NOVA processing group</span>,
              docking ultra-processed (NOVA 4) products 10 points and processed (NOVA 3) products 5.
              An <span className="text-foreground">Additive Score</span> (30% weight) starts at
              100 and loses points for every detected ingredient with a known concern, weighted by
              how serious that concern is. An{" "}
              <span className="text-foreground">Organic Bonus</span> (10% weight, up to +10 points)
              is added whenever Open Food Facts&apos; labels or categories carry a verified organic
              certification. The three combine into the final grade you see — Excellent, Good, Poor, or Bad.
            </p>
          </section>

          <section>
            <h3 className="font-display text-lg tracking-[0.2em] text-gold">EVIDENCE TIERS</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              A risk rating tells you <em>how bad</em> something might be. A tier tells you{" "}
              <em>how sure we are</em>. We separate the two on purpose — a &ldquo;high risk&rdquo; additive can
              be hotly contested, and a &ldquo;low risk&rdquo; one can be backed by rock-solid consensus.
              Every additive and every product category carries one of four tiers:
            </p>
            <div className="mt-4 space-y-3">
              {TIERS.map((tier) => (
                <div key={tier} className="flex items-start gap-3 rounded-sm border border-line bg-background/40 p-3">
                  <EvidenceTierBadge tier={tier} className="mt-0.5" />
                  <div>
                    <p className="font-display text-sm tracking-wide text-foreground">{tierLabel(tier)}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{tierDescription(tier)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-display text-lg tracking-[0.2em] text-gold">DATA SOURCES</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Every score draws on the same stack of public, checkable sources — never on
              brand-supplied marketing claims:
            </p>
            <ul className="mt-3 grid gap-1.5 text-sm text-muted sm:grid-cols-2">
              {[
                "Open Food Facts (product & ingredient data)",
                "Labdoor Testing Database (purity benchmarks)",
                "PubMed / National Library of Medicine (peer-reviewed research)",
                "Health Canada Natural Health Products Database",
                "Open FDA Enforcement Database",
                "IARC Monographs Programme",
                "WHO / FAO JECFA Food Additive Evaluations",
                "EFSA ANS Panel Opinions",
              ].map((src) => (
                <li key={src} className="flex gap-2">
                  <span className="text-gold">—</span>
                  <span>{src}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-display text-lg tracking-[0.2em] text-gold">UPDATE & AUDIT SCHEDULE</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              An automated job runs every 24 hours, checking Open FDA for new recalls and Health
              Canada for new advisories on every product and ingredient we track. Every change —
              what changed, when, and from which source — is written to a permanent audit log so
              the trail is always visible. See the full breakdown on the{" "}
              <a href="/methodology" className="text-gold underline decoration-gold-dim underline-offset-4 hover:text-gold/80">
                Methodology page
              </a>.
            </p>
          </section>

          <section>
            <h3 className="font-display text-lg tracking-[0.2em] text-gold">CONFLICT OF INTEREST</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Gorilla Fuel does not accept payment for product placement. No brand can buy a
              better grade, a higher rank, or a friendlier writeup. Every score here is generated
              algorithmically from public data — we&apos;d rather lose a sponsor than fudge a number.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
