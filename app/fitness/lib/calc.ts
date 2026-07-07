// Shared fitness calculator — single source of truth for the Mifflin-St Jeor
// BMR → TDEE → goal → macro chain. Extracted verbatim from FitnessClient's inline
// `calc` useMemo so the calculator UI and the upcoming plan builder portion against
// identical numbers. Pure functions only; no React, no storage, no UI.
//
// PARITY CONTRACT: computeFitness reproduces the previous inline math byte-for-byte,
// including the ordering subtlety that macro percentages are computed on the
// UNROUNDED calorie values (proteinCal/fatCal/carbCal) and the unrounded target,
// then rounded — do not "simplify" by rounding earlier.

export type Sex = "male" | "female";
export type ActivityKey = "sedentary" | "light" | "moderate" | "very" | "athlete";
export type GoalKey = "cut" | "cut500" | "maintain" | "leanbulk";

export const ACTIVITY: { key: ActivityKey; label: string; mult: number; note: string }[] = [
  { key: "sedentary", label: "Sedentary", mult: 1.2, note: "Little/no exercise, desk job" },
  { key: "light", label: "Light", mult: 1.375, note: "Light exercise 1–3 days/wk" },
  { key: "moderate", label: "Moderate", mult: 1.55, note: "Moderate exercise 3–5 days/wk" },
  { key: "very", label: "Very Active", mult: 1.725, note: "Hard exercise 6–7 days/wk" },
  { key: "athlete", label: "Athlete", mult: 1.9, note: "Physical job or 2-a-day training" },
];

export const GOALS: { key: GoalKey; label: string; note: string }[] = [
  { key: "cut", label: "Cut (−20%)", note: "Fat loss — aggressive deficit" },
  { key: "cut500", label: "Cut (−500 kcal)", note: "Fat loss — ~0.5 kg/wk" },
  { key: "maintain", label: "Maintain", note: "Body recomposition / hold weight" },
  { key: "leanbulk", label: "Lean Bulk (+12%)", note: "Slow muscle gain, minimal fat" },
];

export const PROTEIN_PER_KG_DEFAULT = 1.8; // within the 1.6–2.2 g/kg range
export const FAT_PER_KG = 0.8;

const round = (n: number) => Math.round(n);

/** Canonical metric inputs for the calculator. */
export type FitnessInput = {
  kg: number;
  cm: number;
  age: number;
  sex: Sex;
  activity: ActivityKey;
  goal: GoalKey;
};

/** The full computed result — identical shape to the previous inline `calc` object. */
export type FitnessResult = {
  bmr: number;
  tdee: number;
  target: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  proteinCal: number;
  fatCal: number;
  carbCal: number;
  proteinPct: number;
  fatPct: number;
  carbPct: number;
  proteinRangeLo: number;
  proteinRangeHi: number;
  proteinPerKg: number;
  kg: number;
};

/**
 * Mifflin-St Jeor BMR → × activity multiplier → TDEE → goal adjustment → target
 * kcal, plus macros (protein 1.8 g/kg with a 1.6–2.2 range, fat 0.8 g/kg, carbs
 * fill the remainder). Byte-identical to the calculator's former inline math.
 */
export function computeFitness({ kg, cm, age, sex, activity, goal }: FitnessInput): FitnessResult {
  const bmr = 10 * kg + 6.25 * cm - 5 * age + (sex === "male" ? 5 : -161);
  const mult = ACTIVITY.find((x) => x.key === activity)!.mult;
  const tdee = bmr * mult;
  let target: number;
  if (goal === "cut") target = tdee * 0.8;
  else if (goal === "cut500") target = tdee - 500;
  else if (goal === "leanbulk") target = tdee * 1.12;
  else target = tdee;

  // Macros
  const proteinG = kg * PROTEIN_PER_KG_DEFAULT;
  const proteinRangeLo = round(kg * 1.6);
  const proteinRangeHi = round(kg * 2.2);
  const fatG = kg * FAT_PER_KG;
  const proteinCal = proteinG * 4;
  const fatCal = fatG * 9;
  const carbCal = Math.max(0, target - proteinCal - fatCal);
  const carbG = carbCal / 4;

  const pct = (cal: number) => (target > 0 ? round((cal / target) * 100) : 0);
  return {
    bmr: round(bmr), tdee: round(tdee), target: round(target),
    proteinG: round(proteinG), fatG: round(fatG), carbG: round(carbG),
    proteinCal: round(proteinCal), fatCal: round(fatCal), carbCal: round(carbCal),
    proteinPct: pct(proteinCal), fatPct: pct(fatCal), carbPct: pct(carbCal),
    proteinRangeLo, proteinRangeHi, proteinPerKg: PROTEIN_PER_KG_DEFAULT,
    kg: round(kg * 10) / 10,
  };
}
