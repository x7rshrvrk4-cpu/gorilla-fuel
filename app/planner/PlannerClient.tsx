"use client";

import { useEffect, useMemo, useState } from "react";
import { RECIPES } from "../fitness/lib/recipes";
import type { RecipeDiet, RecipeGoal, RecipeMealType } from "../fitness/lib/recipes";
import { PANTRY_BY_ID } from "../fitness/lib/pantryLibrary";
import { AVOID_GROUPS, COMMON_STAPLES, MEAL_ORDER, CATEGORY_LABEL, buildPlan, getRecipe, recipeCostPerServing, recipeScore } from "./lib/planner";
import type { PlanInputs, PlanResult, Slot } from "./lib/planner";
import { GRADE_COLORS, gradeFromScore } from "../scan/lib/scoring";

const STORAGE_KEY = "gf-planner-v1";
const DIETS: { key: RecipeDiet; label: string }[] = [
  { key: "high-protein", label: "High-protein" }, { key: "vegetarian", label: "Vegetarian" }, { key: "vegan", label: "Vegan" },
  { key: "gluten-free", label: "Gluten-free" }, { key: "dairy-free", label: "Dairy-free" },
];
const GOALS: { key: RecipeGoal; label: string }[] = [{ key: "lean", label: "Lean" }, { key: "build", label: "Build" }, { key: "maintain", label: "Maintain" }];
const DEFAULTS: PlanInputs = { budget: 150, days: 7, people: 2, types: ["breakfast", "lunch", "dinner"], diet: null, goal: null, avoid: [], have: [], mode: "score" };

const money = (n: number) => `$${n.toFixed(2)}`;
function fmtAmount(g: number) { return g >= 1000 ? `${(g / 1000).toFixed(1)} kg` : `${g} g`; }

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${active ? "border-gold bg-gold/15 text-gold" : "border-line text-foreground/85 hover:border-gold/40 hover:text-foreground"}`}>
      {label}
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/75">{label}</span>
      {children}
    </div>
  );
}

export default function PlannerClient() {
  const [inp, setInp] = useState<PlanInputs>(DEFAULTS);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setInp({ ...DEFAULTS, ...JSON.parse(raw) }); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inp)); } catch { /* ignore */ }
  }, [inp]);

  const set = <K extends keyof PlanInputs>(k: K, v: PlanInputs[K]) => setInp((p) => ({ ...p, [k]: v }));
  const toggleIn = (k: "types" | "avoid" | "have", v: string) =>
    setInp((p) => {
      const arr = new Set(p[k] as string[]);
      if (arr.has(v)) arr.delete(v); else arr.add(v);
      return { ...p, [k]: [...arr] } as PlanInputs;
    });

  const run = () => {
    setBusy(true);
    setTimeout(() => {
      const r = buildPlan(inp);
      setResult(r); setSlots(r.slots); setBusy(false);
    }, 20);
  };
  const swap = (idx: number, recipeId: string) => {
    if (!slots) return;
    const next = slots.map((s, i) => (i === idx ? { ...s, recipeId } : s));
    setSlots(next);
    setResult(buildPlan(inp, next));
  };

  const pools = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const t of MEAL_ORDER) out[t] = RECIPES.filter((r) => r.mealType === t).map((r) => r.id);
    return out;
  }, []);

  const byDay = useMemo(() => {
    const m: Record<number, { s: Slot; idx: number }[]> = {};
    (result?.slots ?? []).forEach((s, idx) => { (m[s.day] ??= []).push({ s, idx }); });
    return m;
  }, [result]);

  const grocery = result?.grocery ?? [];
  const groups = useMemo(() => {
    const g: Record<string, typeof grocery> = {};
    for (const l of grocery) (g[l.category] ??= []).push(l);
    return g;
  }, [grocery]);

  const copyList = async () => {
    if (!result) return;
    const lines = [`Gorilla Fuel grocery list — ${inp.days} days, ${inp.people} ${inp.people === 1 ? "person" : "people"}, estimated ${money(result.shoppingTotal)}`, ""];
    for (const [cat, items] of Object.entries(groups)) {
      lines.push(CATEGORY_LABEL[cat] ?? cat);
      for (const l of items.filter((x) => !x.have)) lines.push(`- ${l.name}: ${fmtAmount(l.grams)}${l.packages ? ` (${l.packages} × ${l.label})` : ""} ~${money(l.cost)}`);
      lines.push("");
    }
    try { await navigator.clipboard.writeText(lines.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  const over = result && !result.withinBudget;
  const leftover = result ? inp.budget - result.shoppingTotal : 0;

  return (
    <div className="mt-8 flex flex-col gap-6">
      <section className="flex flex-col gap-5 rounded-sm border border-line bg-surface/50 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Weekly budget (CAD)">
            <input id="plan-budget" type="number" min={20} max={1000} step={5} value={inp.budget} onChange={(e) => set("budget", Math.max(0, Number(e.target.value)))} className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none" />
          </Field>
          <Field label="Days cooking">
            <select id="plan-days" value={inp.days} onChange={(e) => set("days", Number(e.target.value))} className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="People eating">
            <select id="plan-people" value={inp.people} onChange={(e) => set("people", Number(e.target.value))} className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none">
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Meals each day">
          <div className="flex flex-wrap gap-2">
            {MEAL_ORDER.map((t) => <Pill key={t} active={inp.types.includes(t)} onClick={() => toggleIn("types", t)} label={t} />)}
          </div>
        </Field>
        <Field label="Goal">
          <div className="flex flex-wrap gap-2">
            <Pill active={inp.goal === null} onClick={() => set("goal", null)} label="Any" />
            {GOALS.map((g) => <Pill key={g.key} active={inp.goal === g.key} onClick={() => set("goal", inp.goal === g.key ? null : g.key)} label={g.label} />)}
          </div>
        </Field>
        <Field label="Diet">
          <div className="flex flex-wrap gap-2">
            <Pill active={inp.diet === null} onClick={() => set("diet", null)} label="Any" />
            {DIETS.map((d) => <Pill key={d.key} active={inp.diet === d.key} onClick={() => set("diet", inp.diet === d.key ? null : d.key)} label={d.label} />)}
          </div>
        </Field>
        <Field label="Avoid">
          <div className="flex flex-wrap gap-2">
            {Object.entries(AVOID_GROUPS).map(([k, v]) => <Pill key={k} active={inp.avoid.includes(k)} onClick={() => toggleIn("avoid", k)} label={v.label} />)}
          </div>
        </Field>
        <details className="rounded-sm border border-line/70 bg-background/40 px-3 py-2">
          <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.15em] text-gold">Already in my kitchen (not counted in the cost) ▾</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_STAPLES.map((id) => <Pill key={id} active={inp.have.includes(id)} onClick={() => toggleIn("have", id)} label={PANTRY_BY_ID[id]?.name ?? id} />)}
          </div>
        </details>
        <Field label="Planning style">
          <div className="flex flex-wrap gap-2">
            <Pill active={inp.mode === "score"} onClick={() => set("mode", "score")} label="Best score within budget" />
            <Pill active={inp.mode === "cheap"} onClick={() => set("mode", "cheap")} label="Cheapest first" />
          </div>
        </Field>
        <button onClick={run} disabled={busy} className="rounded-sm bg-gold px-6 py-3 font-display text-lg tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-60">
          {busy ? "PLANNING…" : result ? "REBUILD MY PLAN" : "BUILD MY PLAN"}
        </button>
      </section>

      {result && (
        <>
          {result.message && result.mealCount === 0 && <p className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{result.message}</p>}
          {result.mealCount > 0 && (
            <section className={`rounded-sm border p-5 ${over ? "border-red-500/50 bg-red-500/5" : "border-emerald-500/40 bg-emerald-500/5"}`}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/75">Estimated grocery total</p>
                  <p className="font-display text-4xl text-foreground">{money(result.shoppingTotal)} <span className="text-base text-foreground/70">of {money(inp.budget)}</span></p>
                  <p className={`mt-1 text-sm ${over ? "text-red-300" : "text-emerald-300"}`}>
                    {over ? `${money(result.shoppingTotal - inp.budget)} over budget` : `${money(Math.max(0, leftover))} left in your budget`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-5 text-sm text-foreground/85">
                  <span><span className="block font-display text-2xl text-gold">{result.avgScore}</span><span className="text-[10px] uppercase tracking-[0.15em] text-foreground/70">avg Meal Score</span></span>
                  <span><span className="block font-display text-2xl text-foreground">{result.mealCount}</span><span className="text-[10px] uppercase tracking-[0.15em] text-foreground/70">meals planned</span></span>
                  <span><span className="block font-display text-2xl text-foreground">{money(result.perPersonPerDay)}</span><span className="text-[10px] uppercase tracking-[0.15em] text-foreground/70">per person / day</span></span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-foreground/75">
                The total counts whole packages you would actually buy. What you eat from them costs about {money(result.usedTotal)}; the rest is leftover pantry stock.
                {result.message && <span className="block pt-1 text-red-300">{result.message}</span>}
              </p>
            </section>
          )}

          {result.mealCount > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-xl tracking-wide text-gold">YOUR PLAN</h2>
              {Object.entries(byDay).map(([day, list]) => (
                <details key={day} open={Number(day) === 1} className="gorilla-card group rounded-sm p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <span className="font-display text-lg text-foreground">Day {day}</span>
                    <span className="text-foreground/60 group-open:rotate-180">▾</span>
                  </summary>
                  <div className="mt-3 flex flex-col gap-4">
                    {list.map(({ s, idx }) => {
                      const r = getRecipe(s.recipeId);
                      const sc = recipeScore(s.recipeId);
                      return (
                        <div key={idx} className="flex flex-col gap-2 border-t border-line pt-3 first:border-t-0 first:pt-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/70">{s.type}</p>
                              <p className="font-display text-lg leading-tight text-foreground">{r.title}</p>
                              <p className="mt-0.5 text-xs text-foreground/75">{r.macros.calories} kcal · {r.macros.protein} g protein · about {money(recipeCostPerServing(r.id))} / serving</p>
                            </div>
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border-2 font-display text-lg" style={{ borderColor: GRADE_COLORS[gradeFromScore(sc)], color: GRADE_COLORS[gradeFromScore(sc)] }} title="Gorilla Meal Score">{sc}</div>
                          </div>
                          <label className="flex items-center gap-2 text-xs text-foreground/75">
                            Swap
                            <select value={s.recipeId} onChange={(e) => swap(idx, e.target.value)} className="min-w-0 flex-1 rounded-sm border border-line bg-background px-2 py-1 text-xs text-foreground focus:border-gold focus:outline-none">
                              {pools[s.type].map((id) => {
                                const rr = getRecipe(id);
                                return <option key={id} value={id}>{rr.title} · {recipeScore(id)} · {money(recipeCostPerServing(id))}</option>;
                              })}
                            </select>
                          </label>
                          <details className="group/m">
                            <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.15em] text-gold">Method ▾</summary>
                            <ol className="mt-2 flex flex-col gap-1 pl-4 text-sm text-foreground/85">
                              {r.steps.map((st, i) => <li key={i} className="list-decimal">{st}</li>)}
                            </ol>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </details>
              ))}
              <p className="text-xs text-foreground/65">Cooking a recipe once feeds several meals — repeated recipes are batch-cooked, which is where most of the savings come from. Swapping a meal re-prices the whole list.</p>
            </section>
          )}

          {result.mealCount > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl tracking-wide text-gold">GROCERY LIST</h2>
                <button onClick={copyList} className="rounded-sm border border-gold px-4 py-2 text-xs font-display uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-background">
                  {copied ? "Copied ✓" : "Copy list"}
                </button>
              </div>
              {Object.entries(groups).map(([cat, items]) => (
                <details key={cat} open className="gorilla-card group rounded-sm p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <span className="font-display text-lg text-foreground">{CATEGORY_LABEL[cat] ?? cat} <span className="text-sm text-foreground/60">({items.length})</span></span>
                    <span className="text-sm text-foreground/80">{money(items.filter((i) => !i.have).reduce((a, b) => a + b.cost, 0))}</span>
                  </summary>
                  <ul className="mt-3 flex flex-col gap-2">
                    {items.map((l) => (
                      <li key={l.id} className={`flex items-start justify-between gap-3 text-sm ${l.have ? "text-foreground/50" : "text-foreground/90"}`}>
                        <span className="min-w-0">
                          {l.name} <span className="text-foreground/60">· {fmtAmount(l.grams)}{l.packages ? ` (${l.packages} × ${l.label})` : ""}</span>
                          {l.source === "estimate" && <span className="ml-1 rounded-sm border border-line px-1 text-[9px] uppercase text-foreground/60">est.</span>}
                          {l.have && <span className="ml-1 text-[10px] text-emerald-400">have</span>}
                        </span>
                        <span className="shrink-0">{l.have ? "—" : money(l.cost)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
              <p className="text-xs leading-relaxed text-foreground/65">
                &ldquo;est.&rdquo; marks a price we estimated because Statistics Canada does not publish one for that item. Unmarked prices are Ontario averages.
                Meat and some produce are priced by weight; everything else by the package you would buy.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
