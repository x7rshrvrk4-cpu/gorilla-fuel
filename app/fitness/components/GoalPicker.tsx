import Link from "next/link";
import { PLANS } from "../lib/plans";

/**
 * The goal picker — the 5 plans as tappable cards. Each links to its own route
 * (/fitness/<slug>). Presentational only (no state); reuses gorilla-card styling.
 * Mobile-first: single column, stacks to two columns from sm up; whole card is
 * the tap target.
 */
export default function GoalPicker() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <Link
          key={plan.slug}
          href={`/fitness/${plan.slug}`}
          className="gorilla-card group flex flex-col rounded-sm p-5 transition-colors"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-2xl leading-none tracking-wide text-foreground transition-colors group-hover:text-gold">
              {plan.goalLabel}
            </h3>
            <span
              className="shrink-0 font-display text-xl text-gold transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{plan.oneLiner}</p>
        </Link>
      ))}
    </div>
  );
}
