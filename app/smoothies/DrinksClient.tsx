"use client";

import { useMemo, useState } from "react";
import { DRINKS, SOURCES } from "./lib/drinkData";
import type { Drink } from "./lib/produceData";

const GOALS = ["energy", "recovery", "immunity", "digestion", "high protein", "low sugar"] as const;
const FLAG_STYLE: Record<Drink["sugarFlag"], string> = {
  high: "border-red-500/50 bg-red-500/10 text-red-300",
  moderate: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  low: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
};
const FLAG_LABEL: Record<Drink["sugarFlag"], string> = { high: "HIGH sugar", moderate: "Moderate sugar", low: "Low sugar" };
type Sort = "default" | "sugar" | "protein" | "fibre";

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
        active ? "border-gold bg-gold/15 text-gold" : "border-line text-foreground/85 hover:border-gold/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-14 shrink-0 text-[10px] uppercase tracking-[0.2em] text-foreground/75">{label}</span>
      {children}
    </div>
  );
}

export default function DrinksClient() {
  const [type, setType] = useState<"smoothie" | "juice" | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [vegan, setVegan] = useState(false);
  const [dairyFree, setDairyFree] = useState(false);
  const [flag, setFlag] = useState<Drink["sugarFlag"] | null>(null);
  const [sort, setSort] = useState<Sort>("default");
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = DRINKS.filter((d) => {
      if (type && d.type !== type) return false;
      if (goal && !d.tags.includes(goal)) return false;
      if (vegan && !d.vegan) return false;
      if (dairyFree && !d.dairyFree) return false;
      if (flag && d.sugarFlag !== flag) return false;
      if (term && !(d.name.toLowerCase().includes(term) || d.ingredients.some((i) => i.name.toLowerCase().includes(term)))) return false;
      return true;
    });
    if (sort === "sugar") list = [...list].sort((a, b) => a.perServing.sugar - b.perServing.sugar);
    if (sort === "protein") list = [...list].sort((a, b) => b.perServing.protein - a.perServing.protein);
    if (sort === "fibre")
      list = [...list].sort(
        (a, b) => (b.perServing.fibre ?? b.perServing.wholeProduceFibre ?? 0) - (a.perServing.fibre ?? a.perServing.wholeProduceFibre ?? 0)
      );
    return list;
  }, [type, goal, vegan, dairyFree, flag, sort, q]);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-sm border border-line bg-surface/50 p-4">
        <input
          id="drink-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a drink or an ingredient (e.g. kale, ginger, kefir)…"
          className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 focus:border-gold focus:outline-none"
        />
        <Row label="Type">
          <Pill active={type === null} onClick={() => setType(null)} label="All" />
          <Pill active={type === "smoothie"} onClick={() => setType(type === "smoothie" ? null : "smoothie")} label="Smoothies" />
          <Pill active={type === "juice"} onClick={() => setType(type === "juice" ? null : "juice")} label="Juices" />
        </Row>
        <Row label="Goal">
          <Pill active={goal === null} onClick={() => setGoal(null)} label="Any" />
          {GOALS.map((g) => (
            <Pill key={g} active={goal === g} onClick={() => setGoal(goal === g ? null : g)} label={g} />
          ))}
        </Row>
        <Row label="Sugar">
          <Pill active={flag === null} onClick={() => setFlag(null)} label="Any" />
          <Pill active={flag === "low"} onClick={() => setFlag(flag === "low" ? null : "low")} label="Low" />
          <Pill active={flag === "moderate"} onClick={() => setFlag(flag === "moderate" ? null : "moderate")} label="Moderate" />
          <Pill active={flag === "high"} onClick={() => setFlag(flag === "high" ? null : "high")} label="High" />
        </Row>
        <Row label="Diet">
          <Pill active={vegan} onClick={() => setVegan(!vegan)} label="Vegan" />
          <Pill active={dairyFree} onClick={() => setDairyFree(!dairyFree)} label="Dairy-free" />
        </Row>
        <Row label="Sort">
          {(["default", "sugar", "protein", "fibre"] as Sort[]).map((s) => (
            <Pill key={s} active={sort === s} onClick={() => setSort(s)} label={s === "default" ? "Featured" : s === "sugar" ? "Lowest sugar" : s === "protein" ? "Most protein" : "Most fibre"} />
          ))}
        </Row>
      </section>

      <p className="text-xs text-foreground/80">
        {results.length} drink{results.length === 1 ? "" : "s"}
      </p>

      <div className="flex flex-col gap-4">
        {results.map((d) => (
          <DrinkCard key={d.id} d={d} />
        ))}
        {results.length === 0 && (
          <p className="rounded-sm border border-line bg-surface px-4 py-8 text-center text-sm text-foreground/75">
            No drinks match those filters. Try widening them.
          </p>
        )}
      </div>
    </div>
  );
}

function DrinkCard({ d }: { d: Drink }) {
  const p = d.perServing;
  return (
    <div className="gorilla-card flex flex-col rounded-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl leading-tight text-foreground">{d.name}</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-foreground/75">
            {d.type} · about {p.grams} g · 1 serving
          </p>
        </div>
        <span className={`shrink-0 rounded-sm border px-2 py-1 text-[10px] font-display uppercase tracking-[0.15em] ${FLAG_STYLE[d.sugarFlag]}`}>
          {FLAG_LABEL[d.sugarFlag]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-foreground/80">
        <span><span className="text-foreground">{p.kcal}</span> kcal</span>
        <span><span className="text-foreground">{p.protein}g</span> protein</span>
        <span><span className="text-foreground">{p.sugar}g</span> sugar</span>
        <span>
          <span className="text-foreground">{p.fibre != null ? `${p.fibre}g` : "mostly removed"}</span> fibre
        </span>
      </div>

      {d.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {d.tags.map((t) => (
            <span key={t} className="rounded-sm border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-foreground/75">{t}</span>
          ))}
          {d.vegan && <span className="rounded-sm border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-foreground/75">vegan</span>}
          {d.dairyFree && !d.vegan && <span className="rounded-sm border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-foreground/75">dairy-free</span>}
        </div>
      )}

      <ul className="mt-4 grid gap-1 text-sm text-foreground/90 sm:grid-cols-2">
        {d.ingredients.map((i) => (
          <li key={i.id + i.grams} className="flex gap-2">
            <span className="text-gold">·</span>
            <span>
              {i.name} <span className="text-foreground/60">· {i.grams} g ({i.household})</span>
            </span>
          </li>
        ))}
      </ul>

      <details className="group mt-4">
        <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.2em] text-gold">
          Method, why it works &amp; cautions <span className="text-foreground/60 group-open:hidden">▸</span>
          <span className="hidden text-foreground/60 group-open:inline">▾</span>
        </summary>
        <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-foreground/85">
          <p><span className="text-foreground">Method.</span> {d.method}</p>
          <p><span className="text-foreground">Flavour.</span> {d.flavour}</p>
          <p><span className="text-foreground">Nutrition.</span> {d.nutrition}</p>
          {d.type === "juice" && (
            <p className="rounded-sm border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
              Juicing removes fibre and concentrates free sugars (WHO counts juice sugars as free sugars). Whole produce here has about{" "}
              {p.wholeProduceFibre} g fibre; most of it is lost in the glass. Canada&apos;s Food Guide recommends whole fruit and vegetables over juice.
            </p>
          )}
          {[...d.contains, ...d.cautions].map((c, i) => (
            <p key={i} className="text-xs text-amber-200/90">⚠ {c}</p>
          ))}
          <p className="text-xs text-foreground/65">
            Sources:{" "}
            {d.sources.map((s, i) => (
              <span key={s}>
                {i > 0 && ", "}
                <a href={SOURCES[s]?.url} target="_blank" rel="noopener noreferrer" title={SOURCES[s]?.title} className="underline hover:text-gold">
                  {SOURCES[s]?.publisher}
                </a>
              </span>
            ))}
          </p>
        </div>
      </details>
    </div>
  );
}
