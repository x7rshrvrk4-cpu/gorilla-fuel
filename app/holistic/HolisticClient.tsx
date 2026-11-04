"use client";

import { useMemo, useState } from "react";
import {
  NUTRIENTS, FOODS, HERBS, PAIRINGS, CROSSREF, REFERENCE_WORKS, NOT_COVERED, UNVERIFIED,
  STRENGTH_LABEL, STRENGTH_HELP, N_SOURCES,
} from "./lib/holisticData";
import type { Strength } from "./lib/holisticData";
import { MYTHS, MYTH_RULE, MYTH_UNVERIFIED, MYTH_SOURCES, MYTH_VERDICT_LABEL, MYTH_VERDICT_HELP } from "./lib/mythsData";
import type { MythVerdict } from "./lib/mythsData";
import { REMEDIES, REMEDY_GROUPS, REMEDY_RULE, REMEDY_UNVERIFIED, REMEDY_SOURCES, REMEDY_SEEN_OF, REMEDY_SEEN_SITES, REMEDY_FORUM, REMEDY_VERDICT_LABEL, REMEDY_VERDICT_HELP } from "./lib/remediesData";
import type { RemedyVerdict } from "./lib/remediesData";
import { FREQ_INTRO, FREQ_VERDICT, FREQ_CLAIMS, FREQ_FEELING, FREQ_REAL, FREQ_JAPAN, FREQ_CAUTION, FREQ_UNVERIFIED, FREQ_SOURCES } from "./lib/frequencyData";
import { SOURCES } from "../smoothies/lib/drinkData";
import { PRODUCE } from "../smoothies/lib/produceData";
import { REFERENCES, RANKINGS, MATRIX_UNVERIFIED } from "./lib/matrixData";
import type { NutrientKey } from "./lib/matrixData";

const ALL_SOURCES: Record<string, { title: string; publisher: string; url: string }> = { ...SOURCES, ...N_SOURCES, ...MYTH_SOURCES, ...FREQ_SOURCES, ...REMEDY_SOURCES };
const TABS = [
  { key: "nutrients", label: "Nutrients" },
  { key: "foods", label: "Foods" },
  { key: "herbs", label: "Herbs" },
  { key: "myths", label: "Painkiller myths" },
  { key: "remedies", label: "Home remedies" },
  { key: "frequency", label: "Frequency & Rife" },
  { key: "pairings", label: "Pairings" },
  { key: "top", label: "Top sources" },
  { key: "evidence", label: "Evidence check" },
  { key: "about", label: "About & sources" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const REMEDY_CHIP: Record<RemedyVerdict, string> = {
  some_support: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  consensus: "border-teal-500/50 bg-teal-500/10 text-teal-300",
  mixed: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  not_supported: "border-red-500/50 bg-red-500/10 text-red-300",
  tradition: "border-sky-500/50 bg-sky-500/10 text-sky-300",
  harmful: "border-red-500/60 bg-red-500/15 text-red-300",
};

const CHIP: Record<Strength, string> = {
  strong: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  moderate: "border-lime-500/40 bg-lime-500/10 text-lime-300",
  mixed: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  preliminary: "border-line bg-surface text-foreground/80",
  not_supported: "border-zinc-500/50 bg-zinc-500/10 text-zinc-300",
  harm_signal: "border-red-500/50 bg-red-500/10 text-red-300",
};

const VERDICT_CHIP: Record<MythVerdict, string> = {
  supported_use: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  partly: "border-lime-500/40 bg-lime-500/10 text-lime-300",
  mixed: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  not_supported: "border-red-500/50 bg-red-500/10 text-red-300",
  none_found: "border-zinc-500/50 bg-zinc-500/10 text-zinc-300",
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

      {tab === "myths" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-foreground/90">
            A viral list says common foods and herbs &ldquo;work exactly like&rdquo; painkillers, from ibuprofen to morphine. We checked
            each claim against official herbal monographs and published trials. <strong>No trial shows any of these foods works
            exactly like the drug it is paired with.</strong> A few have real, narrower evidence; several have none.
          </p>
          <div className="rounded-sm border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <Warn>Nothing here replaces a prescribed medicine, and it is not medical advice. Some herbs interact with medicines: if you take blood thinners, steroids, immune-suppressing drugs, sedatives or anything else prescribed, ask your pharmacist or doctor before adding a herb or supplement.</Warn>
          </div>
          <p className="text-xs leading-relaxed text-foreground/75">{MYTH_RULE}</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MYTH_VERDICT_LABEL) as MythVerdict[]).map((v) => (
              <span key={v} title={MYTH_VERDICT_HELP[v]} className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-display uppercase tracking-[0.12em] ${VERDICT_CHIP[v]}`}>{MYTH_VERDICT_LABEL[v]}</span>
            ))}
          </div>
          {MYTHS.map((m) => (
            <details key={m.id} className="gorilla-card group rounded-sm p-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/60">The claim: &ldquo;{m.viral}&rdquo;</p>
                  <h2 className="mt-1 font-display text-lg leading-tight text-foreground">{m.name}</h2>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span title={MYTH_VERDICT_HELP[m.verdict]} className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-display uppercase tracking-[0.12em] ${VERDICT_CHIP[m.verdict]}`}>{MYTH_VERDICT_LABEL[m.verdict]}</span>
                  <span className="text-foreground/60 group-open:rotate-180">▾</span>
                </div>
              </summary>
              <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-foreground/85">
                <p className="text-foreground">{m.summary}</p>
                <Row k="Head-to-head test">{m.headToHead}</Row>
                {m.forPoints.length > 0 && (
                  <div>
                    <p className="font-display text-xs uppercase tracking-[0.15em] text-emerald-300">Evidence for</p>
                    <ul className="mt-1 flex flex-col gap-1.5">
                      {m.forPoints.map((t) => <li key={t} className="flex gap-2"><span className="text-emerald-300">+</span> {t}</li>)}
                    </ul>
                  </div>
                )}
                {m.againstPoints.length > 0 && (
                  <div>
                    <p className="font-display text-xs uppercase tracking-[0.15em] text-red-300">Evidence against, and limits</p>
                    <ul className="mt-1 flex flex-col gap-1.5">
                      {m.againstPoints.map((t) => <li key={t} className="flex gap-2"><span className="text-red-300">&minus;</span> {t}</li>)}
                    </ul>
                  </div>
                )}
                {m.official.length > 0 && (
                  <div>
                    <p className="font-display text-xs uppercase tracking-[0.15em] text-gold">What official bodies say</p>
                    <ul className="mt-1 flex flex-col gap-1.5">
                      {m.official.map((t) => <li key={t} className="flex gap-2"><span className="text-gold">·</span> {t}</li>)}
                    </ul>
                  </div>
                )}
                {m.caution && <Warn>{m.caution}</Warn>}
                {m.sources.length > 0 && <Sources ids={m.sources} />}
              </div>
            </details>
          ))}
          <details className="rounded-sm border border-line bg-surface/40 px-4 py-3">
            <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.2em] text-gold">What we could not verify ▾</summary>
            <ul className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-foreground/80">
              {MYTH_UNVERIFIED.map((u) => <li key={u} className="flex gap-2"><span className="text-gold">·</span> {u}</li>)}
            </ul>
          </details>
        </div>
      )}

      {tab === "remedies" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-foreground/90">
            Home remedies and old wives&rsquo; tales for colds, coughs, sore throats and first aid, checked against Cochrane reviews, NCCIH, Health
            Canada and food-safety guidance. Each card shows the evidence for and against, what official bodies say, and, where a safe method
            exists, how to make it and store it. <strong>Many are comforting but untested; a few can cause harm.</strong>
          </p>
          <div className="rounded-sm border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <Warn>Not medical advice. A remedy does not replace a doctor, especially for babies, pregnancy, long-lasting symptoms, fever or trouble breathing. Never give honey to a child under 1 year. Tell your pharmacist what you take before adding a herb or supplement.</Warn>
          </div>
          <p className="text-xs leading-relaxed text-foreground/75">{REMEDY_RULE}</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(REMEDY_VERDICT_LABEL) as RemedyVerdict[]).map((v) => (
              <span key={v} title={REMEDY_VERDICT_HELP[v]} className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-display uppercase tracking-[0.12em] ${REMEDY_CHIP[v]}`}>{REMEDY_VERDICT_LABEL[v]}</span>
            ))}
          </div>
          <div className="gorilla-card rounded-sm p-4 text-sm leading-relaxed text-foreground/85">
            <p className="font-display text-xs uppercase tracking-[0.15em] text-gold">Cross-check: which remedies show up most</p>
            <p className="mt-1 text-xs text-foreground/75">
              We compared the cold, cough and sore-throat advice of {REMEDY_SEEN_OF} major health sources ({REMEDY_SEEN_SITES.join(", ")}). Showing up often means a remedy is widely repeated, not that it is proven.
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {[...REMEDIES].filter((r) => (r.seenIn ?? 0) > 0).sort((a, b) => (b.seenIn ?? 0) - (a.seenIn ?? 0)).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3">
                  <span>{r.name}</span>
                  <span className="shrink-0 text-xs text-foreground/70">{r.seenIn} of {REMEDY_SEEN_OF} · {REMEDY_VERDICT_LABEL[r.verdict]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-foreground/65">Not in any of those lists: onion-honey syrup, onions in socks, hot toddy, apple cider vinegar, pelargonium and thyme-ivy products, clove oil, cranberry and burn myths.</p>
          </div>
          <div className="gorilla-card rounded-sm p-4 text-sm leading-relaxed text-foreground/85">
            <p className="font-display text-xs uppercase tracking-[0.15em] text-sky-300">What people report (anecdotal, not evidence)</p>
            <p className="mt-1 text-xs text-foreground/75">{REMEDY_FORUM.method}</p>
            <ul className="mt-2 flex flex-col gap-1">
              {REMEDY_FORUM.rows.map((r) => (
                <li key={r.name} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                  <span>{r.name}</span>
                  <span className="text-xs text-foreground/70">{r.count} · {r.note}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-foreground/65">Also named, not researched: {REMEDY_FORUM.notResearched.join(" ")}</p>
          </div>
          {REMEDY_GROUPS.map((g) => (
            <div key={g} className="flex flex-col gap-3">
              <h2 className="mt-2 font-display text-xs uppercase tracking-[0.2em] text-gold">{g}</h2>
              {REMEDIES.filter((r) => r.group === g).map((r) => (
                <details key={r.id} className="gorilla-card group rounded-sm p-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/60">The claim: &ldquo;{r.claim}&rdquo;</p>
                      <h3 className="mt-1 font-display text-lg leading-tight text-foreground">{r.name}</h3>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span title={REMEDY_VERDICT_HELP[r.verdict]} className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-display uppercase tracking-[0.12em] ${REMEDY_CHIP[r.verdict]}`}>{REMEDY_VERDICT_LABEL[r.verdict]}</span>
                      <span className="text-foreground/60 group-open:rotate-180">▾</span>
                    </div>
                  </summary>
                  <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-foreground/85">
                    <p className="text-foreground">{r.summary}</p>
                    <p className="text-xs text-foreground/65">{(r.seenIn ?? 0) > 0 ? `Mentioned by ${r.seenIn} of ${REMEDY_SEEN_OF} major health sites we checked.` : "Not in the cold, cough and sore-throat advice of the major health sites we compared."}</p>
                    {r.forPoints.length > 0 && (
                      <div>
                        <p className="font-display text-xs uppercase tracking-[0.15em] text-emerald-300">Evidence for</p>
                        <ul className="mt-1 flex flex-col gap-1.5">
                          {r.forPoints.map((t) => <li key={t} className="flex gap-2"><span className="text-emerald-300">+</span> {t}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.againstPoints.length > 0 && (
                      <div>
                        <p className="font-display text-xs uppercase tracking-[0.15em] text-red-300">Evidence against, and limits</p>
                        <ul className="mt-1 flex flex-col gap-1.5">
                          {r.againstPoints.map((t) => <li key={t} className="flex gap-2"><span className="text-red-300">&minus;</span> {t}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.official.length > 0 && (
                      <div>
                        <p className="font-display text-xs uppercase tracking-[0.15em] text-gold">What official bodies say</p>
                        <ul className="mt-1 flex flex-col gap-1.5">
                          {r.official.map((t) => <li key={t} className="flex gap-2"><span className="text-gold">·</span> {t}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.anecdotal && r.anecdotal.length > 0 && (
                      <div>
                        <p className="font-display text-xs uppercase tracking-[0.15em] text-sky-300">Anecdotal reports (not evidence)</p>
                        <ul className="mt-1 flex flex-col gap-1.5">
                          {r.anecdotal.map((t) => <li key={t} className="flex gap-2"><span className="text-sky-300">·</span> {t}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.howTo && (
                      <div className="rounded-sm border border-line bg-surface/40 p-3">
                        <p className="font-display text-xs uppercase tracking-[0.15em] text-gold">{r.howTo.title}</p>
                        {r.howTo.ingredients.length > 0 && (
                          <>
                            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-foreground/60">You need</p>
                            <ul className="mt-1 flex flex-col gap-1">
                              {r.howTo.ingredients.map((t) => <li key={t} className="flex gap-2"><span className="text-gold">·</span> {t}</li>)}
                            </ul>
                          </>
                        )}
                        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-foreground/60">Method</p>
                        <ol className="mt-1 flex flex-col gap-1">
                          {r.howTo.steps.map((t, i) => <li key={t} className="flex gap-2"><span className="text-gold">{i + 1}.</span> {t}</li>)}
                        </ol>
                        {r.howTo.store.length > 0 && (
                          <>
                            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-foreground/60">Storage</p>
                            <ul className="mt-1 flex flex-col gap-1">
                              {r.howTo.store.map((t) => <li key={t} className="flex gap-2"><span className="text-gold">·</span> {t}</li>)}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                    {r.caution && <Warn>{r.caution}</Warn>}
                    {r.sources.length > 0 && <Sources ids={r.sources} />}
                  </div>
                </details>
              ))}
            </div>
          ))}
          <details className="rounded-sm border border-line bg-surface/40 px-4 py-3">
            <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.2em] text-gold">What we could not verify ▾</summary>
            <ul className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-foreground/80">
              {REMEDY_UNVERIFIED.map((u) => <li key={u} className="flex gap-2"><span className="text-gold">·</span> {u}</li>)}
            </ul>
          </details>
        </div>
      )}

      {tab === "frequency" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-foreground/90">{FREQ_INTRO}</p>
          <div className="rounded-sm border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <Warn>{FREQ_CAUTION}</Warn>
          </div>
          <div className="gorilla-card rounded-sm p-4">
            <span className="rounded-sm border border-red-500/50 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-display uppercase tracking-[0.12em] text-red-300">{FREQ_VERDICT}</span>
            <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-foreground/85">
              {FREQ_CLAIMS.map((c) => (
                <Row key={c.claim} k={c.claim}>{c.finding}</Row>
              ))}
              <Sources ids={["F1", "F2", "F3"]} />
            </div>
          </div>
          <div className="gorilla-card rounded-sm p-4 text-sm leading-relaxed text-foreground/85">
            <p className="font-display text-xs uppercase tracking-[0.15em] text-gold">If it felt good</p>
            <p className="mt-1">{FREQ_FEELING}</p>
          </div>
          <div className="gorilla-card rounded-sm p-4 text-sm leading-relaxed text-foreground/85">
            <p className="font-display text-xs uppercase tracking-[0.15em] text-emerald-300">Frequency in real, regulated medicine</p>
            <ul className="mt-1 flex flex-col gap-1.5">
              {FREQ_REAL.map((t) => <li key={t} className="flex gap-2"><span className="text-emerald-300">+</span> {t}</li>)}
            </ul>
            <p className="mt-3 font-display text-xs uppercase tracking-[0.15em] text-gold">&ldquo;Japan uses frequency in hospitals&rdquo;</p>
            <p className="mt-1">{FREQ_JAPAN}</p>
            <div className="mt-3"><Sources ids={["F3", "F4", "F5"]} /></div>
          </div>
          <details className="rounded-sm border border-line bg-surface/40 px-4 py-3">
            <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.2em] text-gold">What we could not verify ▾</summary>
            <ul className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-foreground/80">
              {FREQ_UNVERIFIED.map((u) => <li key={u} className="flex gap-2"><span className="text-gold">·</span> {u}</li>)}
            </ul>
          </details>
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
