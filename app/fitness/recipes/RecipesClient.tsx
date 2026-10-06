"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PANTRY, PANTRY_BY_ID, type PantryCategory } from "../lib/pantryLibrary";
import {
  matchRecipes,
  type RecipeMealType,
  type RecipeGoal,
  type RecipeDiet,
  type RecipeMatch,
} from "../lib/recipes";
import { gradeFromScore, GRADE_COLORS } from "../../scan/lib/scoring";

const CATEGORY_ORDER: PantryCategory[] = ["protein", "carb", "fat", "produce", "supplement"];
const CATEGORY_LABEL: Record<PantryCategory, string> = {
  protein: "Protein",
  carb: "Carbs",
  fat: "Fats",
  produce: "Produce",
  supplement: "Supplement",
};

const MEAL_TYPES: { key: RecipeMealType; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snack", label: "Snack" },
];
const GOALS: { key: RecipeGoal; label: string }[] = [
  { key: "lean", label: "Lean" },
  { key: "build", label: "Build" },
  { key: "maintain", label: "Maintain" },
];
const DIETS: { key: RecipeDiet; label: string }[] = [
  { key: "high-protein", label: "High-Protein" },
  { key: "gluten-free", label: "Gluten-Free" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "dairy-free", label: "Dairy-Free" },
  { key: "quick", label: "Quick (≤15m)" },
  { key: "treat", label: "Treats" },
];

const STORAGE_KEY = "gf-recipe-pantry";

export default function RecipesClient() {
  const [have, setHave] = useState<Set<string>>(new Set());
  const [mealType, setMealType] = useState<RecipeMealType | null>(null);
  const [goal, setGoal] = useState<RecipeGoal | null>(null);
  const [diet, setDiet] = useState<RecipeDiet | null>(null);

  // Remember the user's "fridge" between visits (per-device convenience only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        setHave(new Set(ids.filter((id) => PANTRY_BY_ID[id])));
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...have]));
    } catch {
      /* ignore */
    }
  }, [have]);

  const toggle = (id: string) =>
    setHave((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const grouped = useMemo(
    () => CATEGORY_ORDER.map((cat) => ({ cat, items: PANTRY.filter((p) => p.category === cat) })),
    []
  );

  const results = useMemo(
    () => matchRecipes(have, { mealType, goal, diet }),
    [have, mealType, goal, diet]
  );

  const hasSelection = have.size > 0;

  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* ── Pantry picker ───────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <p className="font-display text-sm tracking-[0.2em] text-gold">WHAT&apos;S IN YOUR KITCHEN?</p>
          {hasSelection && (
            <button
              onClick={() => setHave(new Set())}
              className="text-xs text-muted underline transition-colors hover:text-foreground"
            >
              Clear ({have.size})
            </button>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted/70">
          Tap what you have. We&apos;ll rank meals by how much you can make right now — no account, nothing leaves your device.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {grouped.map(({ cat, items }) => (
            <div key={cat}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted/70">{CATEGORY_LABEL[cat]}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {items.map((item) => {
                  const on = have.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      aria-pressed={on}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        on
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-line text-muted hover:border-gold/40 hover:text-foreground"
                      }`}
                    >
                      {on ? "✓ " : ""}
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-sm border border-line bg-surface/50 p-4">
        <FilterRow label="Meal">
          <FilterPill active={mealType === null} onClick={() => setMealType(null)} label="Any" />
          {MEAL_TYPES.map((m) => (
            <FilterPill key={m.key} active={mealType === m.key} onClick={() => setMealType(mealType === m.key ? null : m.key)} label={m.label} />
          ))}
        </FilterRow>
        <FilterRow label="Goal">
          <FilterPill active={goal === null} onClick={() => setGoal(null)} label="Any" />
          {GOALS.map((g) => (
            <FilterPill key={g.key} active={goal === g.key} onClick={() => setGoal(goal === g.key ? null : g.key)} label={g.label} />
          ))}
        </FilterRow>
        <FilterRow label="Diet">
          <FilterPill active={diet === null} onClick={() => setDiet(null)} label="Any" />
          {DIETS.map((d) => (
            <FilterPill key={d.key} active={diet === d.key} onClick={() => setDiet(diet === d.key ? null : d.key)} label={d.label} />
          ))}
        </FilterRow>
      </section>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <section>
        <p className="text-xs text-muted">
          {hasSelection ? (
            <>
              {results.filter((r) => r.ratio === 1).length} meal
              {results.filter((r) => r.ratio === 1).length === 1 ? "" : "s"} you can make now
              {" · "}
              {results.length} total matches
            </>
          ) : (
            <>Showing all {results.length} meals — tap a few ingredients above to rank them.</>
          )}
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {results.map((m) => (
            <RecipeCard key={m.recipe.id} match={m} hasSelection={hasSelection} />
          ))}
          {results.length === 0 && (
            <p className="rounded-sm border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
              No meals match those filters. Try widening them.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-12 shrink-0 text-[10px] uppercase tracking-[0.2em] text-muted/70">{label}</span>
      {children}
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active ? "border-gold bg-gold/15 text-gold" : "border-line text-muted hover:border-gold/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function RecipeCard({ match, hasSelection }: { match: RecipeMatch; hasSelection: boolean }) {
  const { recipe, matched, missing, ratio, score } = match;
  const canMake = ratio === 1 && matched.length > 0;
  const scoreColor = GRADE_COLORS[gradeFromScore(score)];

  return (
    <div className="gorilla-card flex flex-col rounded-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight text-foreground">{recipe.title}</h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-muted/70">
            {recipe.mealType} · {recipe.timeMin} min · {recipe.servings} serving{recipe.servings === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex flex-col items-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-sm border-2 font-display text-xl tabular-nums"
              style={{ borderColor: scoreColor, color: scoreColor }}
              title="Gorilla Meal Score (0–100)"
            >
              {score}
            </div>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-muted/60">Meal Score</span>
          </div>
          {hasSelection && (
            <span
              className={`rounded-sm border px-2 py-0.5 text-[10px] font-display uppercase tracking-[0.15em] ${
                canMake
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              {canMake ? "✓ You can make this" : `${matched.length}/${matched.length + missing.length} ingredients`}
            </span>
          )}
        </div>
      </div>

      {/* Macros */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <span><span className="text-foreground">{recipe.macros.calories}</span> kcal</span>
        <span><span className="text-foreground">{recipe.macros.protein}g</span> protein</span>
        <span><span className="text-foreground">{recipe.macros.carbs}g</span> carbs</span>
        <span><span className="text-foreground">{recipe.macros.fat}g</span> fat</span>
        <span className="text-muted/50">per serving · est.</span>
      </div>

      {/* Diet tags */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {recipe.diet.map((d) => (
          <span key={d} className="rounded-sm border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted/70">
            {d}
          </span>
        ))}
      </div>

      {/* Ingredients */}
      <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
        {recipe.ingredients.map((ing, i) => {
          const pantry = ing.pantryId ? PANTRY_BY_ID[ing.pantryId] : undefined;
          const score = pantry?.scoreHint ?? null;
          const scoreColor = score != null ? GRADE_COLORS[gradeFromScore(score)] : undefined;
          const isCore = Boolean(ing.core && ing.pantryId);
          const youHave = isCore && hasSelection && matched.some((mm) => mm.pantryId === ing.pantryId);
          const youNeed = isCore && hasSelection && missing.some((mm) => mm.pantryId === ing.pantryId);
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              {score != null ? (
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border text-[10px] font-display"
                  style={{ borderColor: scoreColor, color: scoreColor }}
                  title={`Gorilla score ≈ ${score}`}
                >
                  {score}
                </span>
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-line text-[10px] text-muted/50">
                  ·
                </span>
              )}
              <span className={`min-w-0 flex-1 truncate ${youNeed ? "text-muted/60" : "text-foreground/90"}`}>
                {ing.name} <span className="text-muted/50">· {ing.qty}</span>
              </span>
              {youHave && <span className="shrink-0 text-[10px] text-emerald-400">have</span>}
              {youNeed && <span className="shrink-0 text-[10px] text-amber-400">need</span>}
            </div>
          );
        })}
      </div>

      {/* Steps */}
      <details className="mt-4 group">
        <summary className="cursor-pointer list-none text-xs font-display uppercase tracking-[0.2em] text-gold">
          Method <span className="text-muted/50 group-open:hidden">▸</span><span className="hidden text-muted/50 group-open:inline">▾</span>
        </summary>
        <ol className="mt-2 flex flex-col gap-1.5 pl-4 text-sm text-foreground/85">
          {recipe.steps.map((s, i) => (
            <li key={i} className="list-decimal">{s}</li>
          ))}
        </ol>
      </details>

      <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        🦍 {recipe.gorillaNote}
      </p>

      <p className="mt-2 text-[10px] text-muted/50">
        Scores shown are the approximate Gorilla score for each whole-food staple —{" "}
        <Link href="/scan" className="underline hover:text-gold">scan the exact product</Link> in-store for its live score.
      </p>
    </div>
  );
}
