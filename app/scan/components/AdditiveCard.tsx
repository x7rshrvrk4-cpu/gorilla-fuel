"use client";

import { useEffect, useState } from "react";
import EvidenceTierBadge from "../../components/EvidenceTierBadge";
import type { AdditiveInfo } from "../lib/scoring";
import type { ResearchPaper } from "../../api/research/route";

const RISK_LABEL: Record<string, string> = {
  high: "High Risk",
  medium: "Medium Risk",
  low: "Low Risk",
};

const RISK_COLOR: Record<string, string> = {
  high: "border-red-500/50 text-red-400 bg-red-500/10",
  medium: "border-amber-400/50 text-amber-300 bg-amber-400/10",
  low: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
};

type ResearchState =
  | { phase: "idle" }
  | { phase: "loaded"; papers: ResearchPaper[] }
  | { phase: "error" };

export default function AdditiveCard({ additive }: { additive: AdditiveInfo }) {
  const [researchOpen, setResearchOpen] = useState(false);
  const [research, setResearch] = useState<ResearchState>({ phase: "idle" });
  const loading = researchOpen && research.phase === "idle";

  useEffect(() => {
    if (!researchOpen || research.phase !== "idle") return;
    let cancelled = false;
    fetch(`/api/research?term=${encodeURIComponent(additive.name)}`)
      .then((res) => res.json())
      .then((data: { papers?: ResearchPaper[] }) => {
        if (cancelled) return;
        setResearch({ phase: "loaded", papers: data.papers ?? [] });
      })
      .catch(() => {
        if (!cancelled) setResearch({ phase: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [researchOpen, research.phase, additive.name]);

  return (
    <div className={`rounded-sm border p-3 text-sm ${RISK_COLOR[additive.risk]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-lg tracking-wide">{additive.name}</span>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <span className="rounded-sm border border-current px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
            {RISK_LABEL[additive.risk]}
          </span>
          <EvidenceTierBadge tier={additive.tier} />
        </div>
      </div>

      <p className="mt-1.5 text-xs text-foreground/70">{additive.note}</p>

      <div className="mt-2 space-y-1.5 border-t border-current/20 pt-2 text-xs text-foreground/70">
        <p>
          <span className="font-display tracking-wide text-foreground/90">Health bodies: </span>
          {additive.healthBodyPosition}
        </p>
        <p>
          <span className="font-display tracking-wide text-foreground/90">Gorilla position: </span>
          {additive.gorillaPosition}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setResearchOpen((v) => !v)}
        aria-expanded={researchOpen}
        className="mt-2.5 flex items-center gap-1.5 font-display text-xs uppercase tracking-[0.2em] text-current/80 underline decoration-current/30 underline-offset-4 transition-colors hover:text-current"
      >
        <span className={`inline-block transition-transform ${researchOpen ? "rotate-90" : ""}`}>▸</span>
        Latest Research
      </button>

      {researchOpen && (
        <div className="mt-2 space-y-2 border-t border-current/20 pt-2">
          {loading && <p className="text-xs text-foreground/60">Pulling recent papers from PubMed…</p>}
          {research.phase === "error" && <p className="text-xs text-foreground/60">Couldn&apos;t reach PubMed right now.</p>}
          {research.phase === "loaded" && research.papers.length === 0 && (
            <p className="text-xs text-foreground/60">No recent indexed papers found for this search term.</p>
          )}
          {research.phase === "loaded" &&
            research.papers.map((paper) => (
              <a
                key={paper.pmid}
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-sm border border-current/20 bg-background/30 p-2.5 transition-colors hover:border-current/50"
              >
                <p className="text-xs font-medium text-foreground/90">{paper.title}</p>
                <p className="mt-0.5 text-[11px] text-foreground/50">
                  {[paper.journal, paper.year].filter(Boolean).join(" · ")} · PMID {paper.pmid}
                </p>
                {paper.conclusion && <p className="mt-1 text-[11px] leading-relaxed text-foreground/60">{paper.conclusion}</p>}
              </a>
            ))}
        </div>
      )}

      <p className="mt-2 border-t border-current/20 pt-2 text-[11px] leading-relaxed text-foreground/50">
        Sources: {additive.sources.join(" · ")}
      </p>
    </div>
  );
}
