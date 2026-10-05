// ── Weekly Gorilla Picks — deterministic week-seeded rotation ────────────────
// Single source of truth for the homepage trio, the social share-card image
// (app/api/og/picks) and the automation feed (app/feed.xml). Each category
// rotates one pick per week through a quality-gated pool, so everything that
// renders the picks stays in sync. Pure function of the current date + static
// data — no randomness, no manual upkeep.

import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { INTEL_APPROVED } from "../intel/lib/products";
import { PRODUCTS, GRADE_RANK } from "../rankings/lib/products";

export type AlcoholPick = (typeof ALCOHOL_PRODUCTS)[number];
export type FoodPick = (typeof INTEL_APPROVED)[number];
export type SuppPick = (typeof PRODUCTS)[number];

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

/** pool[week] with wrap-around; undefined only when the pool is empty. */
function rotate<T>(pool: T[], week: number): T | undefined {
  if (pool.length === 0) return undefined;
  return pool[((week % pool.length) + pool.length) % pool.length];
}

/**
 * Alcohol pool: real drink, strong pour (>=4), with a written analysis AND
 * verified data (non-partial + real calories). The data gate means the homepage
 * never headlines an unscored / "Score pending" entry — and it structurally
 * retires the old `caloriesPerCan ?? 0` tiebreaker, which sorted missing-calorie
 * items as if they were 0-calorie (i.e. best). Selection is by week rotation.
 */
export function alcoholPool(): AlcoholPick[] {
  return [...ALCOHOL_PRODUCTS]
    .filter(
      (p) =>
        p.category !== "Non-Alcoholic" &&
        p.gorillaPour >= 4 &&
        !!p.gorillaAnalysis &&
        p.confidence !== "partial" &&
        p.caloriesPerCan != null
    )
    .sort((a, b) => b.gorillaPour - a.gorillaPour || a.name.localeCompare(b.name));
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
};

/** The three rotating picks for a specific week index. */
export function picksForWeek(week: number): WeeklyPicks {
  return {
    week,
    weekStart: weekStart(week),
    alcohol: rotate(alcoholPool(), week),
    food: rotate(foodPool(), week),
    supp: rotate(suppPool(), week),
  };
}

/** The three rotating picks for the current week. */
export function getWeeklyPicks(): WeeklyPicks {
  return picksForWeek(currentWeek());
}
