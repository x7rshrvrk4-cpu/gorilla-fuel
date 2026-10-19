"use client";

import { useMemo, useState } from "react";
import { PRODUCE } from "../lib/produceData";
import type { Produce } from "../lib/produceData";
import { SOURCES } from "../lib/drinkData";

const CATEGORIES = Array.from(new Set(PRODUCE.map((p) => p.category)));

function sugarTone(s: number | null) {
  if (s == null) return "text-foreground/70";
  return s >= 12 ? "text-red-300" : s >= 8 ? "text-amber-300" : "text-emerald-300";
}

export default function ProduceClient() {
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [lowSugar, setLowSugar] = useState(false);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PRODUCE.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (lowSugar && (p.per100.sugar ?? 0) >= 5) return false;
      if (term && !(p.name.toLowerCase().includes(term) || p.nutrients.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [cat, q, lowSugar]);

  return (
    <div className="mt-8 flex flex-col gap-5">
      <section className="flex flex-col gap-3 rounded-sm border border-line bg-surface/50 p-4">
        <input
          id="produce-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a food or a nutrient (e.g. vitamin C, folate, kale)…"
          className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 focus:border-gold focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCat(null)}
            className={`rounded-full border px-3 py-1 text-xs ${cat === null ? "border-gold bg-gold/15 text-gold" : "border-line text-foreground/85 hover:border-gold/40"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(cat === c ? null : c)}
              className={`rounded-full border px-3 py-1 text-xs ${cat === c ? "border-gold bg-gold/15 text-gold" : "border-line text-foreground/85 hover:border-gold/40"}`}
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => setLowSugar(!lowSugar)}
            aria-pressed={lowSugar}
            className={`rounded-full border px-3 py-1 text-xs ${lowSugar ? "border-gold bg-gold/15 text-gold" : "border-line text-foreground/85 hover:border-gold/40"}`}
          >
            Under 5 g sugar / 100 g
          </button>
        </div>
      </section>

      <p className="text-xs text-foreground/80">{list.length} of {PRODUCE.length}</p>

      <div className="flex flex-col gap-3">
        {list.map((p) => (
          <ProduceCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}

function ProduceCard({ p }: { p: Produce }) {
  return (
    <details className="gorilla-card group rounded-sm p-4">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg leading-tight text-foreground">{p.name}</h2>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-foreground/70">{p.category}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-foreground/80">
          <span><span className="text-foreground">{p.per100.kcal}</span> kcal</span>
          <span className={sugarTone(p.per100.sugar)}>{p.per100.sugar == null ? "sugar n/a" : `${p.per100.sugar} g sugar`}</span>
          <span><span className="text-foreground">{p.per100.fibre}</span> g fibre</span>
        </div>
      </summary>
      <p className="mt-1 text-[10px] text-foreground/55">per 100 g</p>
      <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-foreground/85">
        <p><span className="text-foreground">Key nutrients.</span> {p.nutrients}</p>
        <p>
          <span className="text-foreground">What the research supports.</span> {p.research}{" "}
          <span className="rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground/75">
            evidence: {p.evidence}
          </span>
        </p>
        <p><span className="text-foreground">Good to know.</span> {p.notes}</p>
        <p><span className="text-foreground">Best forms.</span> {p.forms}</p>
        {p.cautions.map((c, i) => (
          <p key={i} className="text-xs text-amber-200/90">⚠ {c}</p>
        ))}
        <p className="text-xs text-foreground/65">
          Sources:{" "}
          {p.sources.map((s, i) => (
            <span key={s}>
              {i > 0 && ", "}
              <a href={SOURCES[s]?.url} target="_blank" rel="noopener noreferrer" title={SOURCES[s]?.title} className="underline hover:text-gold">
                {SOURCES[s]?.publisher}
              </a>
            </span>
          ))}
          {" · "}nutrient data: {p.dataSource}
        </p>
      </div>
    </details>
  );
}
