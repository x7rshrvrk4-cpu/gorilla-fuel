// ── Weekly Gorilla Picks — deterministic week-seeded rotation ────────────────
// Single source of truth for the homepage trio, the social share-card image
// (app/api/og/picks) and the automation feed (app/feed.xml). Each category
// rotates one pick per week through a quality-gated pool, so everything that
// renders the picks stays in sync. Pure function of the current date + static
// data — no randomness, no manual upkeep.

import { ALCOHOL_PRODUCTS, isGorillaSweetSpot, wineGorillaScore } from "../alcohol/lib/products";
import { RECIPES, mealScore } from "../fitness/lib/recipes";
import { DRINKS } from "../smoothies/lib/drinkData";
import { INTEL_APPROVED } from "../intel/lib/products";
import { PRODUCTS, GRADE_RANK } from "../rankings/lib/products";

export type AlcoholPick = (typeof ALCOHOL_PRODUCTS)[number];
export type FoodPick = (typeof INTEL_APPROVED)[number];
export type SuppPick = (typeof PRODUCTS)[number];
export type MealPick = (typeof RECIPES)[number];
export type SmoothiePick = (typeof DRINKS)[number];
export type WinePick = AlcoholPick;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEK_EPOCH = Date.UTC(2026, 0, 5); // Monday 2026-01-05, 00:00 UTC

/** Whole weeks since the epoch. */
export function currentWeek(): number {
  return Math.floor((Date.now() - WEEK_EPOCH) / WEEK_MS);
}

/** Monday 00:00 UTC that begins the given week index. */
export function weekStart(week: number): Date {
  return new Date(WEEK_EPOCH + week * WEEK_MS);
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * pool[week * stride + salt] with wrap-around. The stride is coprime to the pool
 * length, so every pool item still gets a turn before any repeats, but consecutive
 * weeks jump across the pool instead of walking it in sorted order (which put
 * same-brand items in back-to-back weeks). `salt` offsets each category so the
 * rows do not move in lockstep. Pure function of (pool, week, salt).
 */
function rotate<T>(pool: T[], week: number, salt = 0): T | undefined {
  const n = pool.length;
  if (n === 0) return undefined;
  let stride = Math.max(1, Math.round(n * 0.618));
  while (gcd(stride, n) !== 1) stride++;
  return pool[(((week * stride + salt) % n) + n) % n];
}

/**
 * Alcohol pool: real drink, strong pour (>=4), with a written analysis AND
 * verified data (non-partial + real calories). The data gate means the homepage
 * never headlines an unscored / "Score pending" entry — and it structurally
 * retires the old `caloriesPerCan ?? 0` tiebreaker, which sorted missing-calorie
 * items as if they were 0-calorie (i.e. best). Selection is by week rotation.
 */
const NOT_IN_CANADA = /united states only|not (sold|available) in canada/i;

export function alcoholPool(): AlcoholPick[] {
  return [...ALCOHOL_PRODUCTS]
    .filter(
      (p) =>
        p.category !== "Non-Alcoholic" &&
        p.category !== "Wines" &&
        !NOT_IN_CANADA.test(p.availability) &&
        p.gorillaPour >= 4 &&
        !!p.gorillaAnalysis &&
        p.confidence !== "partial" &&
        p.caloriesPerCan != null
    )
    .sort((a, b) => b.gorillaPour - a.gorillaPour || a.name.localeCompare(b.name));
}

/** Wine pool: scored (real ABV + sugar) AND critic-rated: the site's "Gorilla Sweet Spot" wines. */
export function winePool(): WinePick[] {
  return [...ALCOHOL_PRODUCTS]
    .filter((p) => p.category === "Wines" && p.confidence !== "partial" && !NOT_IN_CANADA.test(p.availability) && isGorillaSweetSpot(p))
    .sort(
      (a, b) =>
        (wineGorillaScore(b) ?? 0) - (wineGorillaScore(a) ?? 0) ||
        (b.wineQuality ?? 0) - (a.wineQuality ?? 0) ||
        a.name.localeCompare(b.name)
    );
}

/** Meal pool: breakfast, lunch and dinner recipes with a meal score of 80 or more. */
export function mealPool(): MealPick[] {
  return RECIPES.filter((r) => (r.mealType === "breakfast" || r.mealType === "lunch" || r.mealType === "dinner") && mealScore(r) >= 80).sort(
    (a, b) => mealScore(b) - mealScore(a) || a.title.localeCompare(b.title)
  );
}

/** Smoothie pool: smoothies (not juices) that are not flagged high sugar. */
export function smoothiePool(): SmoothiePick[] {
  return DRINKS.filter((d) => d.type === "smoothie" && d.sugarFlag !== "high").sort((a, b) => a.name.localeCompare(b.name));
}

/** Food pool: Gorilla Approved (score >= 70) with a written blurb. */
export function foodPool(): FoodPick[] {
  return [...INTEL_APPROVED]
    .filter((p) => p.score >= 70 && !!p.blurb)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

/** Supplement pool: top-grade (A and above) with a written analysis. */
export function suppPool(): SuppPick[] {
  return [...PRODUCTS]
    .filter((p) => GRADE_RANK[p.grade] >= GRADE_RANK["A"] && !!p.analysis)
    .sort(
      (a, b) =>
        GRADE_RANK[b.grade] - GRADE_RANK[a.grade] ||
        b.purityScore - a.purityScore ||
        a.name.localeCompare(b.name)
    );
}

export type WeeklyPicks = {
  week: number;
  weekStart: Date;
  alcohol?: AlcoholPick;
  food?: FoodPick;
  supp?: SuppPick;
  meal?: MealPick;
  smoothie?: SmoothiePick;
  wine?: WinePick;
};

/** The six rotating picks for a specific week index. */
export function picksForWeek(week: number): WeeklyPicks {
  return {
    week,
    weekStart: weekStart(week),
    alcohol: rotate(alcoholPool(), week, 1),
    food: rotate(foodPool(), week, 4),
    supp: rotate(suppPool(), week, 3),
    meal: rotate(mealPool(), week, 7),
    smoothie: rotate(smoothiePool(), week, 5),
    wine: rotate(winePool(), week, 2),
  };
}

/** The six rotating picks for the current week. */
export function getWeeklyPicks(): WeeklyPicks {
  return picksForWeek(currentWeek());
}
