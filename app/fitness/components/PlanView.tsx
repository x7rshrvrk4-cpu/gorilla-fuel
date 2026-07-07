import Link from "next/link";
import { GUARDRAILS, type Plan } from "../lib/plans";

/**
 * Renders a single plan's TEXT skeleton — header, daily-shape copy, empty
 * "Your Meals" / "Your Movement" shells (the next two stages fill these), and the
 * full guardrails block. Presentational and server-rendered (no client state);
 * reuses gorilla-card / gold / Bebas styling from the rest of the app.
 */
export default function PlanView({ plan }: { plan: Plan }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      {/* Back link to the goal picker (which lives on /fitness). */}
      <Link
        href="/fitness"
        className="font-display text-xs tracking-[0.25em] text-muted transition-colors hover:text-gold"
      >
        ← ALL PLANS
      </Link>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mt-6">
        <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FITNESS PLAN</p>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
          {plan.goalLabel}
        </h1>
        <p className="mt-3 font-display text-lg tracking-wide text-gold">{plan.oneLiner}</p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{plan.whoItsFor}</p>
      </header>

      <div className="mt-8 flex flex-col gap-6">
        {/* ── Daily shape ──────────────────────────────────────────────────── */}
        <section className="gorilla-card rounded-sm p-5">
          <p className="font-display text-sm tracking-[0.2em] text-gold">DAILY SHAPE</p>
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Calories" body={plan.calorieFraming} />
            <Field label="The plate" body={plan.plateRule} />
            <Field label="Protein" body={plan.proteinCue} />
          </div>
        </section>

        {/* ── YOUR MEALS — empty shell (filled next stage) ─────────────────── */}
        <section className="gorilla-card rounded-sm p-5">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-sm tracking-[0.3em] text-muted">YOUR MEALS</h2>
            <div className="h-px flex-1 bg-line" />
          </div>
          <p className="mt-3 text-xs italic leading-relaxed text-muted/60">
            Meal picks land here next — the foods this plan is built around, each linked to its score.
          </p>
        </section>

        {/* ── YOUR MOVEMENT — empty shell (filled next stage) ──────────────── */}
        <section className="gorilla-card rounded-sm p-5">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-sm tracking-[0.3em] text-muted">YOUR MOVEMENT</h2>
            <div className="h-px flex-1 bg-line" />
          </div>
          <p className="mt-3 text-xs italic leading-relaxed text-muted/60">
            The movement routine lands here next — beginner-friendly exercises with form cues.
          </p>
        </section>

        {/* ── Guardrails — calm, shown on every plan ───────────────────────── */}
        <section className="rounded-sm border border-line bg-surface p-5 sm:p-6">
          <p className="text-sm leading-relaxed text-foreground/85">{GUARDRAILS.intro}</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {GUARDRAILS.points.map((point, i) => (
              <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-muted">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold/60" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-muted/80">
            {GUARDRAILS.closing}
          </p>
        </section>

        <Link
          href="/fitness"
          className="text-center font-display text-xs tracking-[0.25em] text-muted transition-colors hover:text-gold"
        >
          ← BACK TO ALL PLANS
        </Link>
      </div>
    </div>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground/90">{body}</p>
    </div>
  );
}
