import Link from "next/link";
import { RECIPES, mealScore } from "../lib/recipes";
import { gradeFromScore, GRADE_COLORS } from "../../scan/lib/scoring";

// A small taste of the Meal Finder for the fitness page: the top-scoring meals
// plus one honest "treat" so the range is visible, then a button to the full tool.
const ranked = [...RECIPES].map((r) => ({ r, s: mealScore(r) })).sort((a, b) => b.s - a.s);
const treat = ranked.find((x) => (x.r.diet as string[]).includes("treat"));
const PICKS = [...ranked.slice(0, 3), ...(treat ? [treat] : [])];

export default function MealPreview() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted">
        Tell us what&apos;s in your fridge and we rank {RECIPES.length} meals by what you can make right now — each with
        a <span className="text-gold">Gorilla Meal Score</span>. Even the cheat meals are in, scored honestly.
      </p>

      <div className="flex flex-col gap-2">
        {PICKS.map(({ r, s }) => {
          const color = GRADE_COLORS[gradeFromScore(s)];
          const isTreat = (r.diet as string[]).includes("treat");
          return (
            <div key={r.id} className="flex items-center gap-3 rounded-sm border border-line bg-surface/50 p-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 font-display text-base tabular-nums"
                style={{ borderColor: color, color }}
              >
                {s}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-foreground">{r.title}</span>
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted/70">
                  {r.mealType} · {r.macros.protein}g protein{isTreat ? " · treat" : ""}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <Link
        href="/fitness/recipes"
        className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold bg-gold/10 px-5 py-3 font-display text-sm tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
      >
        Open the Meal Finder →
      </Link>
    </div>
  );
}
