"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCTS, GRADE_RANK, type Category } from "../rankings/lib/products";
import ProductCard from "../rankings/components/ProductCard";
import GoalPicker from "./components/GoalPicker";
import StepBox from "./components/StepBox";
import MealPreview from "./components/MealPreview";
import {
  ACTIVITY,
  GOALS,
  FAT_PER_KG,
  computeFitness,
  type Sex,
  type ActivityKey,
  type GoalKey,
} from "./lib/calc";

// ── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "gorilla-fitness";
const LB_PER_KG = 2.2046226218;
const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

type Units = "metric" | "imperial";

// Protein-powder categories from the curated rankings catalogue.
const PROTEIN_CATEGORIES: Category[] = ["Whey Protein", "Casein Protein", "Plant Protein"];
const CATEGORY_SLUG: Record<string, string> = {
  "Whey Protein": "whey-protein",
  "Casein Protein": "casein-protein",
  "Plant Protein": "plant-protein",
};

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
  const [showProtein, setShowProtein] = useState(false);

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
    return computeFitness({ kg: weightKg!, cm: heightCmVal!, age: ageVal!, sex, activity, goal });
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
  const prompt = <p className="text-sm text-muted/80">Fill in <span className="text-gold">Step 3 · Your Stats</span> above and your numbers appear here instantly.</p>;

  return (
    <div className="mt-8 flex flex-col gap-4">
      {/* 1 · FIND A MEAL ───────────────────────────────────────────────────── */}
      <StepBox
        n={1}
        title="Find a Meal"
        subtitle="What's in your fridge? Get healthy meals you can make right now."
        blurb="Healthy meals built from what you already have — each with a Gorilla Meal Score. Cheat meals are in too, scored honestly."
        accent
      >
        <MealPreview />
      </StepBox>

      {/* 2 · PICK YOUR PLAN ─────────────────────────────────────────────────── */}
      <StepBox
        n={2}
        title="Pick Your Plan"
        subtitle="A simple, sustainable shape for how to eat and move."
        blurb={
          <>
            Pick a goal and get a plan — how to eat, how to move, what to reach for. Once your stats are in, each plan
            shows <span className="text-foreground">your</span> personal calorie and protein target.
          </>
        }
      >
        <GoalPicker />
      </StepBox>

      {/* 3 · YOUR STATS ─────────────────────────────────────────────────────── */}
      <StepBox
        n={3}
        title="Your Stats"
        subtitle="Your body's inputs — everything below is built from these."
        blurb={
          <>
            Sex, height, weight and age set your baseline burn.{" "}
            <span className="text-foreground">Change any value and every number updates instantly</span> — that&apos;s
            how the plan adapts to you.
          </>
        }
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Units</p>
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
      </StepBox>

      {/* 4 · YOUR ENGINE — BMR & TDEE ───────────────────────────────────────── */}
      <StepBox
        n={4}
        title="Your Engine — BMR & TDEE"
        subtitle="The calories you burn at rest, plus your daily movement."
        blurb={
          <>
            Your <span className="text-foreground">BMR</span> (basal metabolic rate) is what your body burns just to keep
            you alive — breathing, pumping blood, staying warm — even if you stayed in bed all day. Your activity level
            adds the calories you burn moving around. Together, that&apos;s your{" "}
            <span className="text-foreground">TDEE</span>: the calories you&apos;d eat to maintain your weight.
          </>
        }
      >
        {!ready || !calc ? prompt : (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">BMR · at complete rest (Mifflin-St Jeor)</p>
              <p className="mt-1 font-display text-4xl text-foreground">{calc.bmr.toLocaleString()} <span className="text-base text-muted">kcal/day</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">How active are you?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACTIVITY.map((a) => (
                  <button key={a.key} type="button" className={pill(activity === a.key)} onClick={() => setActivity(a.key)} title={a.note}>
                    {a.label} ×{a.mult}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted/70">{ACTIVITY.find((a) => a.key === activity)!.note}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">TDEE · maintenance</p>
              <p className="mt-1 font-display text-4xl text-foreground">{calc.tdee.toLocaleString()} <span className="text-base text-muted">kcal/day</span></p>
            </div>
          </div>
        )}
      </StepBox>

      {/* 5 · YOUR DAILY TARGET ──────────────────────────────────────────────── */}
      <StepBox
        n={5}
        title="Your Daily Target"
        subtitle="Your goal sets your calories and your protein / fat / carbs."
        blurb="Pick a goal and we nudge your maintenance calories up or down, then split them into protein, fat and carbs. This is the engine behind the plan you picked in Step 2."
      >
        {!ready || !calc ? prompt : (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Your goal</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button key={g.key} type="button" className={pill(goal === g.key)} onClick={() => setGoal(g.key)} title={g.note}>
                    {g.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted/70">{GOALS.find((g) => g.key === goal)!.note}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Daily target</p>
              <p className="mt-1 font-display text-5xl text-gold">{calc.target.toLocaleString()} <span className="text-base text-muted">kcal/day</span></p>
            </div>
            <div>
              <p className="text-xs leading-relaxed text-muted">
                Protein at {calc.proteinPerKg} g/kg (range {calc.proteinRangeLo}–{calc.proteinRangeHi} g for your {calc.kg} kg),
                fat at {FAT_PER_KG} g/kg, carbs fill the rest.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
            </div>
          </div>
        )}
      </StepBox>

      {/* 6 · FUEL & TRACK ───────────────────────────────────────────────────── */}
      <StepBox
        n={6}
        title="Fuel & Track"
        subtitle="Hit your protein, then scan as you shop."
        blurb="Protein is the hardest macro to hit — a scoop of clean powder helps close the gap. Then scan products as you shop to check them against your target."
      >
        <div className="rounded-sm border border-gold/40 bg-gold/[0.05] p-5 text-center">
          <p className="font-display text-xl text-foreground">Scan products to hit your target.</p>
          {ready && calc && (
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              {calc.target.toLocaleString()} kcal · {calc.proteinG}g protein/day. Scan any barcode to check it against your numbers.
            </p>
          )}
          <Link href="/scan" className="mt-4 inline-block rounded-sm bg-gold px-8 py-4 font-display text-lg tracking-widest text-background transition-opacity hover:opacity-90">
            Open Scanner →
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setShowProtein((s) => !s)}
          aria-expanded={showProtein}
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-sm border border-line px-4 py-3 text-left transition-colors hover:border-gold/50"
        >
          <span className="font-display text-xs tracking-[0.2em] text-muted">
            {showProtein ? "HIDE" : "SHOW"} SCORED PROTEIN POWDERS{ready && calc ? ` — HIT ${calc.proteinG}G` : ""}
          </span>
          <span className={`font-display text-gold transition-transform ${showProtein ? "rotate-90" : ""}`} aria-hidden>›</span>
        </button>
        {showProtein && (
          <div className="mt-4 flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-muted/80">
              The cleanest protein powders by Gorilla grade — a scoop (~25–30g) covers a chunk of your daily target.
            </p>
            <div className="flex flex-wrap gap-2">
              {PROTEIN_CATEGORIES.map((c) => (
                <Link key={c} href={`/rankings/${CATEGORY_SLUG[c]}`} className="rounded-sm border border-line px-4 py-2 font-display text-xs tracking-widest text-muted transition-colors hover:border-gold/60 hover:text-gold">
                  {c} →
                </Link>
              ))}
            </div>
            {proteinPicks.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </StepBox>

      <p className="mt-2 text-center text-[10px] leading-relaxed text-muted/50">
        Estimates only (Mifflin-St Jeor + standard activity multipliers). Individual needs vary —
        consult a qualified professional. Not medical advice.
      </p>
    </div>
  );
}
