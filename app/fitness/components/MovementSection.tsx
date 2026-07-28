import Image from "next/image";
import { EXERCISE_BY_ID, type Exercise } from "../lib/exerciseLibrary";
import type { Plan } from "../lib/plans";

/**
 * The movement side of a plan page: the routine structure, the plan's exercises
 * as cards (name + form cue + difficulty tag + an image slot ready for art), and
 * the progression note. Server-rendered — presentational cards, no interactivity,
 * matching MealSection.
 *
 * IMAGE SLOT: `imageSlot` is null for now, so each card renders a clean gorilla-
 * branded placeholder in a first-class image area (fixed aspect box at the top of
 * the card). When imageSlot later holds a path, the same box shows the art with no
 * layout change — the drop-in is trivial.
 */

const DIFFICULTY_STYLE: Record<Exercise["difficulty"], string> = {
  gentle: "border-emerald-500/40 text-emerald-300/90",
  moderate: "border-gold-dim text-gold",
};

export default function MovementSection({ plan }: { plan: Plan }) {
  // Resolve exercise ids → Exercise (skip any unknown id defensively).
  const exercises = plan.exercises
    .map((id) => EXERCISE_BY_ID[id])
    .filter((e): e is Exercise => Boolean(e));

  return (
    <div className="mt-4 flex flex-col gap-6">
      {/* ── Structure ──────────────────────────────────────────────────────── */}
      <div className="gorilla-card rounded-sm p-5">
        <p className="font-display text-sm tracking-[0.2em] text-gold">THE ROUTINE</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{plan.structure}</p>
      </div>

      {/* ── Exercise cards ─────────────────────────────────────────────────── */}
      <div>
        <p className="font-display text-sm tracking-[0.2em] text-gold">THE MOVES</p>
        <p className="mt-1 text-xs leading-relaxed text-muted/70">
          Beginner-friendly, no equipment. Start with the gentle version and only progress when it feels good.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      </div>

      {/* ── Progression ────────────────────────────────────────────────────── */}
      <div className="rounded-sm border border-line bg-surface p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold">How to level up</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{plan.progression}</p>
      </div>

      {/* ── Attribution ────────────────────────────────────────────────────────
          RepDB free-tier license requires a visible credit link wherever its
          illustrations appear. Ours are algorithmically recolored (duotone) for the
          dark theme — the source art is RepDB's. */}
      <p className="text-[10px] leading-relaxed text-muted/50">
        Exercise illustrations by{" "}
        <a
          href="https://repdb.co/free-exercise-dataset"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gold"
        >
          RepDB (repdb.co)
        </a>
        , recolored to match the theme.
      </p>
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <div className="gorilla-card flex flex-col overflow-hidden rounded-sm">
      {/* IMAGE SLOT — first-class part of the layout. Art drops in here later. */}
      <div className="relative flex aspect-[16/9] w-full items-center justify-center border-b border-line bg-background">
        {exercise.imageSlot ? (
          <Image
            src={exercise.imageSlot}
            alt={exercise.name}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <ExercisePlaceholder />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-tight tracking-wide text-foreground">
            {exercise.name}
          </h3>
          <span
            className={`shrink-0 rounded-sm border px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] ${DIFFICULTY_STYLE[exercise.difficulty]}`}
          >
            {exercise.difficulty}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted">{exercise.formCue}</p>
      </div>
    </div>
  );
}

/** Clean gorilla-branded placeholder shown while imageSlot is null — never a broken image. */
function ExercisePlaceholder() {
  return (
    <div className="flex flex-col items-center gap-1 text-gold/30">
      <span className="font-display text-4xl leading-none" aria-hidden>
        G
      </span>
      <span className="font-display text-[9px] uppercase tracking-[0.25em] text-muted/40">
        Form guide
      </span>
    </div>
  );
}
