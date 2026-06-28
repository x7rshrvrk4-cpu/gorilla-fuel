"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCTS, GRADE_RANK, type Category } from "../rankings/lib/products";
import ProductCard from "../rankings/components/ProductCard";

// ── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "gorilla-fitness";
const LB_PER_KG = 2.2046226218;
const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

type Sex = "male" | "female";
type Units = "metric" | "imperial";
type ActivityKey = "sedentary" | "light" | "moderate" | "very" | "athlete";
type GoalKey = "cut" | "cut500" | "maintain" | "leanbulk";

const ACTIVITY: { key: ActivityKey; label: string; mult: number; note: string }[] = [
  { key: "sedentary", label: "Sedentary", mult: 1.2, note: "Little/no exercise, desk job" },
  { key: "light", label: "Light", mult: 1.375, note: "Light exercise 1–3 days/wk" },
  { key: "moderate", label: "Moderate", mult: 1.55, note: "Moderate exercise 3–5 days/wk" },
  { key: "very", label: "Very Active", mult: 1.725, note: "Hard exercise 6–7 days/wk" },
  { key: "athlete", label: "Athlete", mult: 1.9, note: "Physical job or 2-a-day training" },
];

const GOALS: { key: GoalKey; label: string; note: string }[] = [
  { key: "cut", label: "Cut (−20%)", note: "Fat loss — aggressive deficit" },
  { key: "cut500", label: "Cut (−500 kcal)", note: "Fat loss — ~0.5 kg/wk" },
  { key: "maintain", label: "Maintain", note: "Body recomposition / hold weight" },
  { key: "leanbulk", label: "Lean Bulk (+12%)", note: "Slow muscle gain, minimal fat" },
];

// Protein-powder categories from the curated rankings catalogue.
const PROTEIN_CATEGORIES: Category[] = ["Whey Protein", "Casein Protein", "Plant Protein"];
const CATEGORY_SLUG: Record<string, string> = {
  "Whey Protein": "whey-protein",
  "Casein Protein": "casein-protein",
  "Plant Protein": "plant-protein",
};

const PROTEIN_PER_KG_DEFAULT = 1.8; // within the 1.6–2.2 g/kg range
const FAT_PER_KG = 0.8;

const num = (s: string): number | null => {
  const v = parseFloat(s);
  return Number.isFinite(v) && v > 0 ? v : null;
};
const round = (n: number) => Math.round(n);

type Persisted = {
  sex: Sex; age: string; units: Units;
  weight: string; heightCm: string; heightFt: string; heightIn: string;
  activity: ActivityKey; goal: GoalKey;
};

export default function FitnessClient() {
  const [sex, setSex] = useState<Sex>("male");
  const [units, setUnits] = useState<Units>("metric");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState(""); // in current units (kg or lb)
  const [heightCm, setHeightCm] = useState(""); // metric
  const [heightFt, setHeightFt] = useState(""); // imperial
  const [heightIn, setHeightIn] = useState(""); // imperial
  const [activity, setActivity] = useState<ActivityKey>("moderate");
  const [goal, setGoal] = useState<GoalKey>("maintain");
  const [loaded, setLoaded] = useState(false);

  // ── Restore from localStorage (matches ScanClient try/catch pattern) ────────
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Persisted>;
        if (p.sex) setSex(p.sex);
        if (p.units) setUnits(p.units);
        if (p.age) setAge(p.age);
        if (p.weight) setWeight(p.weight);
        if (p.heightCm) setHeightCm(p.heightCm);
        if (p.heightFt) setHeightFt(p.heightFt);
        if (p.heightIn) setHeightIn(p.heightIn);
        if (p.activity) setActivity(p.activity);
        if (p.goal) setGoal(p.goal);
      }
    } catch {
      // ignore corrupt state
    }
    setLoaded(true);
  }, []);

  // ── Canonical metric values ─────────────────────────────────────────────────
  const weightKg = useMemo(() => {
    const w = num(weight);
    if (w === null) return null;
    return units === "metric" ? w : w * KG_PER_LB;
  }, [weight, units]);

  const heightCmVal = useMemo(() => {
    if (units === "metric") return num(heightCm);
    const ft = num(heightFt) ?? 0;
    const inch = parseFloat(heightIn) || 0;
    const totalIn = ft * 12 + inch;
    return totalIn > 0 ? totalIn * CM_PER_IN : null;
  }, [units, heightCm, heightFt, heightIn]);

  const ageVal = useMemo(() => {
    const a = parseInt(age, 10);
    return Number.isFinite(a) && a > 0 && a < 120 ? a : null;
  }, [age]);

  const ready = weightKg !== null && heightCmVal !== null && ageVal !== null;

  // ── The chain ───────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    if (!ready) return null;
    const kg = weightKg!, cm = heightCmVal!, a = ageVal!;
    const bmr = 10 * kg + 6.25 * cm - 5 * a + (sex === "male" ? 5 : -161);
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
  }, [ready, weightKg, heightCmVal, ageVal, sex, activity, goal]);

  // ── Persist (only after initial load, so we don't clobber stored values) ────
  useEffect(() => {
    if (!loaded) return;
    try {
      const payload = {
        sex, age, units, weight, heightCm, heightFt, heightIn, activity, goal,
        bmr: calc?.bmr ?? null, tdee: calc?.tdee ?? null, target: calc?.target ?? null,
        macros: calc ? { protein: calc.proteinG, fat: calc.fatG, carb: calc.carbG } : null,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota/serialization errors
    }
  }, [loaded, sex, age, units, weight, heightCm, heightFt, heightIn, activity, goal, calc]);

  // ── Protein powders to hit the target (curated rankings catalogue) ──────────
  const proteinPicks = useMemo(
    () =>
      [...PRODUCTS]
        .filter((p) => PROTEIN_CATEGORIES.includes(p.category))
        .sort((a, b) => GRADE_RANK[b.grade] - GRADE_RANK[a.grade] || a.pricePerServing - b.pricePerServing)
        .slice(0, 6),
    []
  );

  function toggleUnits(next: Units) {
    if (next === units) return;
    // convert existing values so the user doesn't lose their entry
    const w = num(weight);
    if (w !== null) setWeight(String(round((next === "imperial" ? w * LB_PER_KG : w * KG_PER_LB) * 10) / 10));
    if (next === "imperial") {
      const cm = num(heightCm);
      if (cm !== null) { const totalIn = cm / CM_PER_IN; setHeightFt(String(Math.floor(totalIn / 12))); setHeightIn(String(round(totalIn % 12))); }
    } else {
      const ft = num(heightFt), inch = parseFloat(heightIn) || 0;
      if (ft !== null) setHeightCm(String(round((ft * 12 + inch) * CM_PER_IN)));
    }
    setUnits(next);
  }

  const pill = (active: boolean) =>
    `rounded-sm border px-4 py-2 font-display text-xs tracking-widest transition-colors ${
      active ? "border-gold bg-gold text-background" : "border-line text-muted hover:border-gold/60 hover:text-gold"
    }`;
  const inputCls =
    "w-full rounded-sm border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-gold focus:outline-none";
  const labelCls = "block text-[10px] uppercase tracking-[0.2em] text-muted mb-1";

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* ── STEP 1 — Inputs ─────────────────────────────────────────────────── */}
      <section className="gorilla-card rounded-sm p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-sm tracking-[0.2em] text-gold">1 · YOU</p>
          <div className="flex gap-2">
            <button type="button" className={pill(units === "metric")} onClick={() => toggleUnits("metric")}>Metric</button>
            <button type="button" className={pill(units === "imperial")} onClick={() => toggleUnits("imperial")}>Imperial</button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={pill(sex === "male")} onClick={() => setSex("male")}>Male</button>
          <button type="button" className={pill(sex === "female")} onClick={() => setSex("female")}>Female</button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Age</label>
            <input type="number" inputMode="numeric" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="years" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Weight ({units === "metric" ? "kg" : "lb"})</label>
            <input type="number" inputMode="decimal" min="1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={units === "metric" ? "kg" : "lb"} className={inputCls} />
          </div>
          {units === "metric" ? (
            <div>
              <label className={labelCls}>Height (cm)</label>
              <input type="number" inputMode="decimal" min="1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="cm" className={inputCls} />
            </div>
          ) : (
            <div>
              <label className={labelCls}>Height (ft / in)</label>
              <div className="flex gap-2">
                <input type="number" inputMode="numeric" min="0" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="ft" className={inputCls} />
                <input type="number" inputMode="numeric" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="in" className={inputCls} />
              </div>
            </div>
          )}
        </div>
        {!ready && <p className="mt-3 text-xs text-muted/70">Enter age, weight, and height to see your numbers.</p>}
      </section>

      {ready && calc && (
        <>
          {/* ── STEP 2 — BMR ─────────────────────────────────────────────────── */}
          <section className="gorilla-card rounded-sm p-5">
            <p className="font-display text-sm tracking-[0.2em] text-gold">2 · BMR</p>
            <p className="mt-1 text-xs text-muted">Basal metabolic rate (Mifflin-St Jeor) — calories at complete rest.</p>
            <p className="mt-3 font-display text-4xl text-foreground">{calc.bmr.toLocaleString()} <span className="text-base text-muted">kcal/day</span></p>
          </section>

          {/* ── STEP 3 — TDEE / activity ─────────────────────────────────────── */}
          <section className="gorilla-card rounded-sm p-5">
            <p className="font-display text-sm tracking-[0.2em] text-gold">3 · ACTIVITY → TDEE</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ACTIVITY.map((a) => (
                <button key={a.key} type="button" className={pill(activity === a.key)} onClick={() => setActivity(a.key)} title={a.note}>
                  {a.label} ×{a.mult}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted/70">{ACTIVITY.find((a) => a.key === activity)!.note}</p>
            <p className="mt-3 font-display text-4xl text-foreground">{calc.tdee.toLocaleString()} <span className="text-base text-muted">kcal/day maintenance</span></p>
          </section>

          {/* ── STEP 4 — Goal → target ───────────────────────────────────────── */}
          <section className="gorilla-card rounded-sm p-5">
            <p className="font-display text-sm tracking-[0.2em] text-gold">4 · GOAL → DAILY TARGET</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button key={g.key} type="button" className={pill(goal === g.key)} onClick={() => setGoal(g.key)} title={g.note}>
                  {g.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted/70">{GOALS.find((g) => g.key === goal)!.note}</p>
            <p className="mt-3 font-display text-5xl text-gold">{calc.target.toLocaleString()} <span className="text-base text-muted">kcal/day</span></p>
          </section>

          {/* ── STEP 5 — Macros ──────────────────────────────────────────────── */}
          <section className="gorilla-card rounded-sm p-5">
            <p className="font-display text-sm tracking-[0.2em] text-gold">5 · MACROS</p>
            <p className="mt-1 text-xs text-muted">
              Protein at {calc.proteinPerKg} g/kg (range {calc.proteinRangeLo}–{calc.proteinRangeHi} g for your {calc.kg} kg),
              fat at {FAT_PER_KG} g/kg, carbs fill the rest.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Protein", g: calc.proteinG, pct: calc.proteinPct, cal: calc.proteinCal, accent: "text-gold border-gold" },
                { label: "Fat", g: calc.fatG, pct: calc.fatPct, cal: calc.fatCal, accent: "text-amber-400 border-amber-500" },
                { label: "Carbs", g: calc.carbG, pct: calc.carbPct, cal: calc.carbCal, accent: "text-emerald-400 border-emerald-500" },
              ].map((m) => (
                <div key={m.label} className={`rounded-sm border-2 p-4 text-center ${m.accent}`}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{m.label}</p>
                  <p className="mt-1 font-display text-3xl">{m.g}g</p>
                  <p className="mt-0.5 text-xs text-muted">{m.pct}% · {m.cal.toLocaleString()} kcal</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── STEP 6 — Scanner hand-off ────────────────────────────────────── */}
          <section className="gorilla-card rounded-sm border-gold/40 bg-gold/[0.05] p-6 text-center">
            <p className="font-display text-2xl text-foreground">Now scan products to hit your target.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              {calc.target.toLocaleString()} kcal · {calc.proteinG}g protein/day. Scan any barcode to check it against your numbers.
            </p>
            <Link href="/scan" className="mt-5 inline-block rounded-sm bg-gold px-8 py-4 font-display text-lg tracking-widest text-background transition-opacity hover:opacity-90">
              Open Scanner →
            </Link>
          </section>

          {/* ── Protein-target tool — scored powders ─────────────────────────── */}
          <section className="mt-2">
            <div className="flex items-center gap-4">
              <h2 className="font-display text-sm tracking-[0.3em] text-muted">HIT {calc.proteinG}G PROTEIN — SCORED POWDERS</h2>
              <div className="h-px flex-1 bg-line" />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted/80">
              The cleanest protein powders by Gorilla grade — a scoop (~25–30g) covers a chunk of your daily target.
              Tap a category for the full ranked list.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PROTEIN_CATEGORIES.map((c) => (
                <Link key={c} href={`/rankings/${CATEGORY_SLUG[c]}`} className="rounded-sm border border-line px-4 py-2 font-display text-xs tracking-widest text-muted transition-colors hover:border-gold/60 hover:text-gold">
                  {c} →
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {proteinPicks.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        </>
      )}

      <p className="mt-2 text-center text-[10px] leading-relaxed text-muted/50">
        Estimates only (Mifflin-St Jeor + standard activity multipliers). Individual needs vary —
        consult a qualified professional. Not medical advice.
      </p>
    </div>
  );
}
