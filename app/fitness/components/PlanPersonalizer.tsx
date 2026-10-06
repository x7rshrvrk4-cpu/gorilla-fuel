"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { computeFitness, type GoalKey, type Sex, type ActivityKey } from "../lib/calc";

// Maps each plan to the calculator goal it embodies, so a plan can show the
// viewer's OWN target (not generic copy) using their saved calculator stats.
const GOAL_FOR: Record<string, GoalKey> = {
  "lean-down": "cut500",
  build: "leanbulk",
  "tone-up": "maintain",
  "stay-healthy": "maintain",
  energize: "maintain",
};

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export default function PlanPersonalizer({ slug }: { slug: string }) {
  const [res, setRes] = useState<{ target: number; protein: number } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("gorilla-fitness");
      if (raw) {
        const p = JSON.parse(raw);
        const w = parseFloat(p.weight);
        const kg = p.units === "imperial" ? w * KG_PER_LB : w;
        let cm = NaN;
        if (p.units === "imperial") {
          const ft = parseFloat(p.heightFt) || 0;
          const inch = parseFloat(p.heightIn) || 0;
          cm = (ft * 12 + inch) * CM_PER_IN;
        } else {
          cm = parseFloat(p.heightCm);
        }
        const age = parseInt(p.age, 10);
        if (kg > 0 && cm > 0 && age > 0 && (p.sex === "male" || p.sex === "female") && p.activity) {
          const r = computeFitness({
            kg,
            cm,
            age,
            sex: p.sex as Sex,
            activity: p.activity as ActivityKey,
            goal: GOAL_FOR[slug] ?? "maintain",
          });
          setRes({ target: r.target, protein: r.proteinG });
        }
      }
    } catch {
      /* ignore */
    }
    setChecked(true);
  }, [slug]);

  if (!checked) return null;

  if (!res) {
    return (
      <div className="rounded-sm border border-gold/30 bg-gold/[0.05] p-4 text-sm leading-relaxed text-muted">
        Enter your age, height and weight on the{" "}
        <Link href="/fitness" className="text-gold underline hover:text-foreground">fitness calculator</Link>{" "}
        and this plan will show <span className="text-foreground">your</span> personal daily target.
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-gold/40 bg-gold/[0.06] p-4">
      <p className="font-display text-xs tracking-[0.2em] text-gold">YOUR TARGET FOR THIS PLAN</p>
      <p className="mt-1.5 text-foreground">
        <span className="font-display text-3xl text-gold">{res.target.toLocaleString()}</span>
        <span className="text-sm text-muted"> kcal/day</span>
        <span className="mx-2 text-muted/50">·</span>
        <span className="font-display text-3xl text-gold">{res.protein}g</span>
        <span className="text-sm text-muted"> protein</span>
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">
        Built from your saved stats for this plan&apos;s goal. Change them on the{" "}
        <Link href="/fitness" className="text-gold underline hover:text-foreground">calculator</Link>.
      </p>
    </div>
  );
}
