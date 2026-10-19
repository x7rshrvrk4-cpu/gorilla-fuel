import { RECIPES, mealScore } from "../../fitness/lib/recipes";
import type { Recipe, RecipeDiet, RecipeGoal, RecipeMealType } from "../../fitness/lib/recipes";
import { PANTRY_BY_ID } from "../../fitness/lib/pantryLibrary";
import { PRICES, RECIPE_ITEMS } from "./plannerData";

export const AVOID_GROUPS: Record<string, { label: string; ids: string[] }> = {
  fish: { label: "Fish & shellfish", ids: ["salmon", "shrimp", "white-fish", "canned-tuna", "canned-salmon", "sardines"] },
  dairy: { label: "Dairy", ids: ["greek-yogurt", "cottage-cheese", "cheddar", "feta", "parmesan", "milk", "butter", "whey-isolate", "casein-protein"] },
  eggs: { label: "Eggs", ids: ["eggs"] },
  nuts: { label: "Nuts & peanuts", ids: ["almonds", "walnuts", "natural-peanut-butter", "almond-butter", "almond-milk"] },
  meat: { label: "Meat & poultry", ids: ["chicken-breast", "chicken-thigh", "ground-chicken", "ground-turkey", "lean-ground-beef", "sirloin-steak", "pork-tenderloin", "bacon"] },
  soy: { label: "Soy", ids: ["tofu", "tempeh", "edamame"] },
};
export const COMMON_STAPLES = ["olive-oil", "garlic", "honey", "pure-maple-syrup", "cocoa-powder", "tahini", "vinaigrette", "chia-seeds", "rolled-oats", "brown-rice", "eggs", "butter"];

export type PlanInputs = {
  budget: number; days: number; people: number; types: RecipeMealType[];
  diet: RecipeDiet | null; goal: RecipeGoal | null; avoid: string[]; have: string[]; mode: "score" | "cheap";
};
export type Slot = { day: number; type: RecipeMealType; recipeId: string };
export type GroceryLine = { id: string; name: string; category: string; grams: number; packages: number | null; cost: number; usedCost: number; source: "statcan" | "estimate"; label: string; have: boolean };
export type PlanResult = {
  slots: Slot[]; grocery: GroceryLine[]; shoppingTotal: number; usedTotal: number; avgScore: number; mealCount: number;
  withinBudget: boolean; perPersonPerDay: number; estimatedShare: number; message: string;
};

const BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
const SCORE: Record<string, number> = Object.fromEntries(RECIPES.map((r) => [r.id, mealScore(r)]));

export function recipeScore(id: string) { return SCORE[id]; }
export function getRecipe(id: string) { return BY_ID[id]; }

function pricePerG(id: string) { return (PRICES[id]?.perKg ?? 0) / 1000; }

export function recipeCostPerServing(id: string): number {
  const r = BY_ID[id];
  let c = 0;
  for (const [pid, g] of RECIPE_ITEMS[id] ?? []) c += pricePerG(pid) * g;
  return c / r.servings;
}

function eligible(inp: PlanInputs, r: Recipe): boolean {
  if (!inp.types.includes(r.mealType)) return false;
  if (inp.diet && !r.diet.includes(inp.diet)) return false;
  if (inp.goal && !r.goals.includes(inp.goal)) return false;
  const bad = new Set(inp.avoid.flatMap((a) => AVOID_GROUPS[a]?.ids ?? []));
  for (const [pid] of RECIPE_ITEMS[r.id] ?? []) if (bad.has(pid)) return false;
  return true;
}

type Counts = Record<string, number>;

function shoppingFor(counts: Counts, people: number, have: Set<string>) {
  const grams: Record<string, number> = {};
  for (const [rid, n] of Object.entries(counts)) {
    if (!n) continue;
    const r = BY_ID[rid];
    const scale = (n * people) / r.servings;
    for (const [pid, g] of RECIPE_ITEMS[rid]) grams[pid] = (grams[pid] ?? 0) + g * scale;
  }
  let total = 0, used = 0;
  const lines: GroceryLine[] = [];
  for (const [pid, g] of Object.entries(grams)) {
    const p = PRICES[pid];
    const isHave = have.has(pid);
    let cost = 0, packages: number | null = null;
    if (p) {
      if (p.pkgG) { packages = Math.max(1, Math.ceil(g / p.pkgG - 1e-9)); cost = packages * ((p.perKg * p.pkgG) / 1000); }
      else cost = (p.perKg * g) / 1000;
    }
    const usedCost = p ? (p.perKg * g) / 1000 : 0;
    if (!isHave) { total += cost; used += usedCost; }
    lines.push({ id: pid, name: PANTRY_BY_ID[pid]?.name ?? pid, category: PANTRY_BY_ID[pid]?.category ?? "other", grams: Math.round(g), packages, cost, usedCost, source: p?.source ?? "estimate", label: p?.label ?? "", have: isHave });
  }
  return { total, used, lines };
}

export function buildPlan(inp: PlanInputs, overrideSlots?: Slot[]): PlanResult {
  const have = new Set(inp.have);
  const slotDefs: { day: number; type: RecipeMealType }[] = [];
  for (let d = 1; d <= inp.days; d++) for (const t of inp.types) slotDefs.push({ day: d, type: t });
  const pools: Record<string, string[]> = {};
  for (const t of inp.types) pools[t] = RECIPES.filter((r) => r.mealType === t && eligible(inp, r)).map((r) => r.id);
  const empty = inp.types.filter((t) => pools[t].length === 0);
  // keep the search fast on phones: only the best-scoring and the cheapest candidates per meal type
  const fullPools: Record<string, string[]> = {};
  for (const t of inp.types) {
    fullPools[t] = pools[t];
    if (pools[t].length > 28) {
      const top = pools[t].slice().sort((a, b) => SCORE[b] - SCORE[a]).slice(0, 16);
      const cheap = pools[t].slice().sort((a, b) => recipeCostPerServing(a) - recipeCostPerServing(b)).slice(0, 16);
      pools[t] = [...new Set([...top, ...cheap])];
    }
  }
  if (empty.length || !slotDefs.length) {
    return { slots: [], grocery: [], shoppingTotal: 0, usedTotal: 0, avgScore: 0, mealCount: 0, withinBudget: true, perPersonPerDay: 0, estimatedShare: 0, message: empty.length ? `No ${empty.join(" / ")} recipes match those filters. Try loosening diet, goal or avoid options.` : "Pick at least one meal type." };
  }
  const cost = (assign: string[]) => {
    const c: Counts = {};
    for (const id of assign) c[id] = (c[id] ?? 0) + 1;
    return shoppingFor(c, inp.people, have).total;
  };
  const scoreSum = (assign: string[]) => assign.reduce((a, id) => a + SCORE[id], 0);

  const solve = (cap: number): string[] => {
    const assign: string[] = [];
    const used: Counts = {};
    for (const s of slotDefs) {
      const pool = pools[s.type].filter((id) => (used[id] ?? 0) < cap);
      const list = (pool.length ? pool : pools[s.type]).slice().sort((a, b) => (inp.mode === "cheap" ? recipeCostPerServing(a) - recipeCostPerServing(b) : SCORE[b] - SCORE[a]));
      const pick = list[0];
      used[pick] = (used[pick] ?? 0) + 1;
      assign.push(pick);
    }
    const tally = (a: string[]) => { const c: Counts = {}; for (const id of a) c[id] = (c[id] ?? 0) + 1; return c; };
    for (let it = 0; it < 90 && cost(assign) > inp.budget; it++) {
      const base = cost(assign), baseScore = scoreSum(assign), c = tally(assign);
      let best: { i: number; id: string; ratio: number } | null = null;
      for (let i = 0; i < assign.length; i++) {
        for (const id of pools[slotDefs[i].type]) {
          if (id === assign[i] || (c[id] ?? 0) >= cap) continue;
          const next = assign.slice(); next[i] = id;
          const saved = base - cost(next);
          if (saved <= 0.01) continue;
          const lost = Math.max(0, baseScore - scoreSum(next));
          const ratio = saved / (lost + 1);
          if (!best || ratio > best.ratio) best = { i, id, ratio };
        }
      }
      if (!best) break;
      assign[best.i] = best.id;
    }
    if (inp.mode === "score") {
      for (let it = 0; it < 50; it++) {
        const base = cost(assign), baseScore = scoreSum(assign), c = tally(assign);
        let best: { i: number; id: string; gain: number } | null = null;
        for (let i = 0; i < assign.length; i++) {
          for (const id of pools[slotDefs[i].type]) {
            if (id === assign[i] || (c[id] ?? 0) >= cap) continue;
            const next = assign.slice(); next[i] = id;
            if (cost(next) > inp.budget) continue;
            const gain = scoreSum(next) - baseScore;
            if (gain > 0 && (!best || gain > best.gain)) best = { i, id, gain };
          }
        }
        if (!best || base > inp.budget) break;
        assign[best.i] = best.id;
      }
    }
    return assign;
  };

  let assign: string[];
  if (overrideSlots && overrideSlots.length === slotDefs.length) {
    assign = overrideSlots.map((s) => s.recipeId);
  } else {
    // prefer variety (each recipe at most 2x); relax the repeat cap only if the budget needs it
    let bestAssign: string[] | null = null;
    for (const cap of [2, 3, 4]) {
      const a = solve(cap);
      if (cost(a) <= inp.budget) { bestAssign = a; break; }
      if (!bestAssign || cost(a) < cost(bestAssign)) bestAssign = a;
    }
    assign = bestAssign as string[];
  }

  const counts: Counts = {};
  for (const id of assign) counts[id] = (counts[id] ?? 0) + 1;
  const sh = shoppingFor(counts, inp.people, have);
  const slots: Slot[] = slotDefs.map((s, i) => ({ day: s.day, type: s.type, recipeId: assign[i] }));
  const within = sh.total <= inp.budget + 0.005;
  const meals = slotDefs.length;
  return {
    slots, grocery: sh.lines.sort((a, b) => a.category.localeCompare(b.category) || b.cost - a.cost),
    shoppingTotal: sh.total, usedTotal: sh.used, avgScore: Math.round(scoreSum(assign) / meals), mealCount: meals, withinBudget: within,
    perPersonPerDay: sh.total / (inp.people * inp.days), estimatedShare: 0,
    message: within ? "" : "Even the cheapest plan we could build is over your budget. Try fewer days or meals, more 'already have' staples, or the cheapest mode.",
  };
}

export const MEAL_ORDER: RecipeMealType[] = ["breakfast", "lunch", "dinner", "snack", "dessert"];
export const CATEGORY_LABEL: Record<string, string> = { produce: "Produce", protein: "Protein", dairy: "Dairy & milk", carb: "Grains & pantry", fat: "Fats, nuts & seeds", supplement: "Supplements", other: "Other" };
