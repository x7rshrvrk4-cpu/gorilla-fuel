"use client";

import { useMemo, useState } from "react";
import {
  NUTRIENTS, FOODS, HERBS, PAIRINGS, CROSSREF, REFERENCE_WORKS, NOT_COVERED, UNVERIFIED,
  STRENGTH_LABEL, STRENGTH_HELP, N_SOURCES,
} from "./lib/holisticData";
import type { Strength } from "./lib/holisticData";
import { SOURCES } from "../smoothies/lib/drinkData";
import { PRODUCE } from "../smoothies/lib/produceData";
import { REFERENCES, RANKINGS, MATRIX_UNVERIFIED } from "./lib/matrixData";
import type { NutrientKey } from "./lib/matrixData";

const ALL_SOURCES: Record<string, { title: string; publisher: string; url: string }> = { ...SOURCES, ...N_SOURCES };
const TABS = [
  { key: "nutrients", label: "Nutrients" },
  { key: "foods", label: "Foods" },
  { key: "herbs", label: "Herbs" },
  { key: "pairings", label: "Pairings" },
  { key: "top", label: "Top sources" },
  { key: "evidence", label: "Evidence check" },
  { key: "about", label: "About & sources" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const CHIP: Record<Strength, string> = {
  strong: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  moderate: "border-lime-500/40 bg-lime-500/10 text-lime-300",
  mixed: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  preliminary: "border-line bg-surface text-foreground/80",
  not_supported: "border-zinc-500/50 bg-zinc-500/10 text-zinc-300",
  harm_signal: "border-red-500/50 bg-red-500/10 text-red-300",
};

function Chip({ s }: { s: Strength }) {
  return (
    <span title={STRENGTH_HELP[s]} className={`inline-block shrink-0 rounded-sm border px-1.5 py-0.5 text-[10px] font-display uppercase tracking-[0.12em] ${CHIP[s]}`}>
      {STRENGTH_LABEL[s]}
    </span>
  );
}

function Sources({ ids }: { ids: string[] }) {
  return (
    <p className="text-xs text-foreground/65">
      Sources:{" "}
      {ids.map((s, i) => (
        <span key={s}>
          {i > 0 && ", "}
          <a href={ALL_SOURCES[s]?.url} target="_blank" rel="noopener noreferrer" title={ALL_SOURCES[s]?.title} className="underline hover:text-gold">
            {ALL_SOURCES[s]?.publisher ?? s}
          </a>
        </span>
      ))}
    </p>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-amber-200/90">⚠ {children}</p>;
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="text-foreground">{k}.</span> {children}
    </p>
  );
}

export default function HolisticClient() {
  const [tab, setTab] = useState<Tab>("nutrients");
  const [q, setQ] = useState("");
  const [topKey, setTopKey] = useState<NutrientKey>("vitamin_c");
  const [withHerbs, setWithHerbs] = useState(false);
  const term = q.trim().toLowerCase();

  const nutrients = useMemo(
    () => NUTRIENTS.filter((n) => !term || n.name.toLowerCase().includes(term) || n.foods.some((f) => f[0].toLowerCase().includes(term)) || n.functions.toLowerCase().includes(term)),
    [term]
  );
  const foods = useMemo(
    () => FOODS.filter((f) => !term || f.name.toLowerCase().includes(term) || f.nutrients.some((n) => n[0].toLowerCase().includes(term))),
    [term]
  );

  return (
    <div className="mt-8 flex flex-col gap-5">
      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-display uppercase tracking-[0.12em] transition-colors ${
              tab === t.key ? "border-gold bg-gold/15 text-gold" : "border-line text-foreground/85 hover:border-gold/40 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tab === "nutrients" || tab === "foods") && (
        <input
          id="holistic-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tab === "nutrients" ? "Search a nutrient or a food (e.g. iron, spinach, B12)…" : "Search a food or a nutrient it provides…"}
          className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 focus:border-gold focus:outline-none"
        />
      )}

      <details className="rounded-sm border border-line bg-surface/40 px-4 py-3">
        <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.2em] text-gold">How to read the evidence labels ▾</summary>
        <ul className="mt-3 flex flex-col gap-2 text-xs text-foreground/80">
          {(Object.keys(STRENGTH_LABEL) as Strength[]).map((s) => (
            <li key={s} className="flex items-start gap-2">
              <Chip s={s} /> <span>{STRENGTH_HELP[s]}</span>
            </li>
          ))}
        </ul>
      </details>

      {tab === "nutrients" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-foreground/80">{nutrients.length} of {NUTRIENTS.length}</p>
          {nutrients.map((n) => (
            <details key={n.id} className="gorilla-card group rounded-sm p-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-lg leading-tight text-foreground">{n.name}</h2>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-foreground/70">{n.kind}</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {Array.from(new Set(n.research.map((r) => r.strength))).slice(0, 3).map((s) => (
                    <Chip key={s} s={s} />
                  ))}
                  <span className="text-foreground/60 group-open:rotate-180">▾</span>
                </div>
              </summary>
              <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-foreground/85">
                <Row k="What it does">{n.functions}</Row>
                <Row k="Adult intake">{n.intake}</Row>
                <Row k="Upper limit">{n.upperLimit}</Row>

                <details className="rounded-sm border border-line/70 bg-background/40 px-3 py-2">
                  <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.15em] text-gold">Where it comes from (food sources) ▾</summary>
                  <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                    {n.foods.map((f) => (
                      <li key={f[0]} className="flex gap-2">
                        <span className="text-gold">·</span>
                        <span>{f[0]} <span className="text-foreground/60">· {f[1]} per {f[2]}</span></span>
                      </li>
                    ))}
                  </ul>
                </details>

                <details className="rounded-sm border border-line/70 bg-background/40 px-3 py-2" open>
                  <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.15em] text-gold">What the research supports ▾</summary>
                  <ul className="mt-2 flex flex-col gap-3">
                    {n.research.map((r) => (
                      <li key={r.topic} className="flex flex-col gap-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-foreground">{r.topic}</span> <Chip s={r.strength} />
                        </span>
                        <span className="text-sm">{r.finding}</span>
                      </li>
                    ))}
                  </ul>
                </details>

                <details className="rounded-sm border border-line/70 bg-background/40 px-3 py-2">
                  <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.15em] text-gold">Who is at risk of low intake ▾</summary>
                  <p className="mt-2 text-sm">{n.atRisk}</p>
                </details>

                <details className="rounded-sm border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                  <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.15em] text-amber-300">Medications &amp; cautions ▾</summary>
                  <div className="mt-2 flex flex-col gap-2">
                    <Row k="Medication interactions">{n.meds}</Row>
                    {n.cautions.map((c, i) => (
                      <Warn key={i}>{c}</Warn>
                    ))}
                  </div>
                </details>
                <Sources ids={n.sources} />
              </div>
            </details>
          ))}
          {nutrients.length === 0 && <p className="rounded-sm border border-line bg-surface px-4 py-8 text-center text-sm text-foreground/75">Nothing matches that search.</p>}
        </div>
      )}

      {tab === "foods" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-foreground/80">{foods.length} of {FOODS.length}. Amounts are from the NIH tables, with the serving shown.</p>
          {foods.map((f) => (
            <details key={f.id} className="gorilla-card group rounded-sm p-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-lg leading-tight text-foreground">{f.name}</h2>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-foreground/70">{f.category}</p>
                </div>
                <span className="text-foreground/60 group-open:rotate-180">▾</span>
              </summary>
              <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-foreground/85">
                <ul className="grid gap-1 sm:grid-cols-2">
                  {f.nutrients.map((n) => (
                    <li key={n[0]} className="flex gap-2">
                      <span className="text-gold">·</span>
                      <span>{n[0]}: <span className="text-foreground">{n[1]}</span> <span className="text-foreground/60">per {n[2]}</span></span>
                    </li>
                  ))}
                </ul>
                {f.notes && <p>{f.notes}</p>}
                {f.cautions && <Warn>{f.cautions}</Warn>}
                <Sources ids={f.sources} />
              </div>
            </details>
          ))}
        </div>
      )}

      {tab === "herbs" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-relaxed text-foreground/80">
            Classified by the European Medicines Agency as <strong>well-established use</strong> (backed by clinical evidence) or{" "}
            <strong>traditional use</strong> (long-standing use, not clinical proof). Traditional use is not evidence that a herb works.
          </p>
          {HERBS.map((h) => (
            <details key={h.id} className="gorilla-card group rounded-sm p-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <h2 className="font-display text-lg leading-tight text-foreground">{h.name}</h2>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-display uppercase tracking-[0.12em] ${h.wellEstablished ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-line text-foreground/80"}`}>
                    {h.wellEstablished ? "Well-established use" : "Traditional use only"}
                  </span>
                  <span className="text-foreground/60 group-open:rotate-180">▾</span>
                </div>
              </summary>
              <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-foreground/85">
                {h.wellEstablished && <Row k="Well-established use">{h.wellEstablished}</Row>}
                <div>
                  <span className="text-foreground">Traditional use.</span>
                  <ul className="mt-1 flex flex-col gap-1">
                    {h.traditional.map((t) => (
                      <li key={t} className="flex gap-2"><span className="text-gold">·</span> {t}</li>
                    ))}
                  </ul>
                </div>
                <Row k="Interactions">{h.interactions}</Row>
                <Row k="Pregnancy">{h.pregnancy}</Row>
                {h.cautions.map((c, i) => <Warn key={i}>{c}</Warn>)}
                <Sources ids={h.sources} />
              </div>
            </details>
          ))}
        </div>
      )}

      {tab === "pairings" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-foreground/80">Food combinations that change how much your body absorbs, and what to space apart from medicines.</p>
          {PAIRINGS.map((p) => (
            <details key={p.pairing} className="gorilla-card group rounded-sm p-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <h2 className="font-display text-lg leading-tight text-foreground">{p.pairing}</h2>
                <div className="flex shrink-0 items-center gap-2">
                  <Chip s={p.strength} />
                  <span className="text-foreground/60 group-open:rotate-180">▾</span>
                </div>
              </summary>
              <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-foreground/85">
                <p>{p.detail}</p>
                <Sources ids={p.sources} />
              </div>
            </details>
          ))}
        </div>
      )}

      {tab === "top" && (
        <div className="flex flex-col gap-4">
          <p className="text-xs leading-relaxed text-foreground/80">
            Which fruits and vegetables carry the most of each nutrient, <strong>per 100 g</strong> (not per serving). The bar shows
            the share of the higher adult RDA or AI. <strong>Good source</strong> is 10–19.9% and <strong>excellent source</strong> is
            20% or more — a common food-label convention, our choice here and not an NIH rule.
          </p>
          <div className="flex flex-wrap gap-2">
            {REFERENCES.map((r) => (
              <button
                key={r.key}
                onClick={() => setTopKey(r.key)}
                aria-pressed={topKey === r.key}
                className={`rounded-full border px-3 py-1 text-xs ${topKey === r.key ? "border-gold bg-gold/15 text-gold" : "border-line text-foreground/85 hover:border-gold/40"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-foreground/80">
            <input type="checkbox" checked={withHerbs} onChange={(e) => setWithHerbs(e.target.checked)} id="top-herbs" />
            Include herbs and ginger (eaten in tiny amounts, so per-100 g overstates a real serving)
          </label>
          {(() => {
            const ref = REFERENCES.find((r) => r.key === topKey)!;
            const list = withHerbs ? RANKINGS[topKey].all : RANKINGS[topKey].noHerbs;
            const maxPct = Math.max(...list.map((x) => (x.value / ref.reference) * 100));
            const nameOf = (id: string) => PRODUCE.find((p) => p.id === id)?.name ?? id;
            return (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-foreground/70">
                  Reference: {ref.reference} {ref.unit}/day ·{" "}
                  <a className="underline hover:text-gold" target="_blank" rel="noopener noreferrer" href={ALL_SOURCES[ref.source]?.url}>
                    {ALL_SOURCES[ref.source]?.publisher}
                  </a>
                </p>
                <ol className="flex flex-col gap-2">
                  {list.map((x, i) => {
                    const p = (x.value / ref.reference) * 100;
                    const tone = p >= 20 ? "bg-emerald-500/70" : p >= 10 ? "bg-lime-500/60" : "bg-foreground/30";
                    const oxalate = topKey === "calcium" && ["spinach", "collards", "rhubarb", "sweet_potato"].includes(x.id);
                    return (
                      <li key={x.id} className="rounded-sm border border-line bg-surface/40 px-3 py-2">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="text-foreground">{i + 1}. {nameOf(x.id)}</span>
                          <span className="shrink-0 text-xs text-foreground/80">
                            {x.value} {ref.unit} · <span className="text-foreground">{Math.round(p)}%</span> of reference
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-line">
                          <div className={`h-1.5 rounded-full ${tone}`} style={{ width: `${Math.min(100, (p / maxPct) * 100)}%` }} />
                        </div>
                        {oxalate && <p className="mt-1 text-xs text-amber-200/90">⚠ Calcium is poorly absorbed because of oxalate; do not count it as a full calcium source.</p>}
                        {topKey === "vitamin_k" && p >= 100 && <p className="mt-1 text-xs text-amber-200/90">⚠ Very high vitamin K: keep intake consistent if you take warfarin.</p>}
                        {topKey === "potassium" && x.value >= 400 && <p className="mt-1 text-xs text-amber-200/90">⚠ Potassium-rich: check with a clinician if you have kidney disease or take ACE inhibitors, ARBs or potassium-sparing diuretics.</p>}
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })()}
          <details className="rounded-sm border border-line bg-surface/40 px-4 py-3">
            <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.2em] text-gold">Method &amp; what we could not verify ▾</summary>
            <ul className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-foreground/80">
              {MATRIX_UNVERIFIED.map((u) => (
                <li key={u} className="flex gap-2"><span className="text-gold">·</span> {u}</li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {tab === "evidence" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-relaxed text-foreground/80">
            Common claims checked against more than one source. &ldquo;Consistent&rdquo; means sources agree; note that several
            NIH pages are one organisation, so their agreement is not independent confirmation.
          </p>
          {CROSSREF.map((c) => (
            <details key={c.claim} className="gorilla-card group rounded-sm p-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <h2 className="text-base font-semibold leading-snug text-foreground">{c.claim}</h2>
                <span className="text-foreground/60 group-open:rotate-180">▾</span>
              </summary>
              <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-foreground/85">
                <Row k="Agreement">{c.agreement}</Row>
                <Row k="Evidence">{c.evidence}</Row>
                {c.note && <p className="text-foreground/75">{c.note}</p>}
                <Sources ids={c.sources} />
              </div>
            </details>
          ))}
        </div>
      )}

      {tab === "about" && (
        <div className="flex flex-col gap-3">
          <details className="gorilla-card group rounded-sm p-4" open>
            <summary className="cursor-pointer list-none font-display text-lg text-foreground">Books &amp; reference works ▾</summary>
            <ul className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-foreground/85">
              {REFERENCE_WORKS.map((r) => (
                <li key={r.reference}><span className="text-foreground">{r.reference}.</span> {r.howUsed}</li>
              ))}
            </ul>
          </details>
          <details className="gorilla-card group rounded-sm p-4">
            <summary className="cursor-pointer list-none font-display text-lg text-foreground">Not covered ▾</summary>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-foreground/85">
              {NOT_COVERED.map((x) => <li key={x} className="flex gap-2"><span className="text-gold">·</span> {x}</li>)}
            </ul>
          </details>
          <details className="gorilla-card group rounded-sm p-4">
            <summary className="cursor-pointer list-none font-display text-lg text-foreground">What we could not verify ▾</summary>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-foreground/85">
              {UNVERIFIED.map((x) => <li key={x} className="flex gap-2"><span className="text-gold">·</span> {x}</li>)}
            </ul>
          </details>
          <details className="gorilla-card group rounded-sm p-4">
            <summary className="cursor-pointer list-none font-display text-lg text-foreground">All sources ▾</summary>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-foreground/85">
              {Object.entries(ALL_SOURCES).map(([id, s]) => (
                <li key={id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold">{s.title}</a>{" "}
                  <span className="text-foreground/60">· {s.publisher}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
