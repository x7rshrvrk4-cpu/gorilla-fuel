"use client";

import { useState } from "react";
import type { ExamineIngredientInfo, ResearchEvidenceLevel } from "../lib/examineDatabase";

const EVIDENCE_LABEL: Record<ResearchEvidenceLevel, string> = {
  strong: "Strong Evidence",
  moderate: "Moderate Evidence",
  limited: "Limited Evidence",
  mixed: "Mixed Evidence",
};

const EVIDENCE_COLOR: Record<ResearchEvidenceLevel, string> = {
  strong: "border-emerald-400/50 text-emerald-300 bg-emerald-400/10",
  moderate: "border-yellow-400/50 text-yellow-300 bg-yellow-400/10",
  limited: "border-orange-400/50 text-orange-300 bg-orange-400/10",
  mixed: "border-zinc-400/50 text-zinc-300 bg-zinc-400/10",
};

export default function ResearchSummaryCard({ ingredient }: { ingredient: ExamineIngredientInfo }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-sm border border-line bg-surface text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 p-3 text-left"
      >
        <span className="flex items-center gap-2">
          <span className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
          <span className="font-display text-lg tracking-wide text-foreground">{ingredient.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-sm border px-2 py-0.5 text-[10px] font-display uppercase tracking-[0.18em] ${EVIDENCE_COLOR[ingredient.evidenceLevel]}`}>
            {EVIDENCE_LABEL[ingredient.evidenceLevel]}
          </span>
          <span className="font-display text-xs uppercase tracking-[0.2em] text-muted">
            Research Summary
          </span>
        </span>
      </button>

      {open && (
        <div className="space-y-2.5 border-t border-line p-3 pt-2.5 text-xs leading-relaxed text-muted">
          <p>
            <span className="font-display tracking-wide text-foreground/90">What it does: </span>
            {ingredient.whatItDoes}
          </p>
          <p>
            <span className="font-display tracking-wide text-foreground/90">Evidence level: </span>
            {ingredient.evidenceNote}
          </p>
          <p>
            <span className="font-display tracking-wide text-foreground/90">Effective dose range: </span>
            {ingredient.doseRange}
          </p>
          <p>
            <span className="font-display tracking-wide text-foreground/90">Safety considerations: </span>
            {ingredient.safetyNotes}
          </p>
          <p className="border-t border-line pt-2 text-[11px] text-muted/70">Source: {ingredient.source}</p>
        </div>
      )}
    </div>
  );
}
