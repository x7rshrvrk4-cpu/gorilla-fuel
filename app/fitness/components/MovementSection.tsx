import Image from "next/image";
import { EXERCISE_BY_ID, type Exercise, type ExerciseLevel } from "../lib/exerciseLibrary";
import type { Plan } from "../lib/plans";

/**
 * The movement side of a plan page: the routine structure, the plan's exercises
 * as photo cards (name + coaching text + level tag + exercise photo), and the
 * progression note. Server-rendered — presentational cards, no interactivity,
 * matching MealSection.
 *
 * PHOTOS: self-hosted public-domain images from free-exercise-db (Unlicense) under
 * /public/exercises/<id>/. No attribution required. Cards render `images[0]` on a
 * neutral (white) panel so the opaque photos sit cleanly against the dark theme;
 * coaching text falls back to the first steps of `instructions` until per-exercise
 * `formCue` copy is authored.
 */

const LEVEL_STYLE: Record<ExerciseLevel, string> = {
  beginner: "border-emerald-500/40 text-emerald-300/90",
  intermediate: "border-gold-dim text-gold",
  expert: "border-orange-500/50 text-orange-300/90",
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
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <div className="gorilla-card flex flex-col overflow-hidden rounded-sm">
      {/* IMAGE SLOT — first-class part of the layout. Art drops in here later. */}
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-b border-line bg-white">
        {exercise.images.length > 0 ? (
          <Image
            src={exercise.images[0]}
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
            className={`shrink-0 rounded-sm border px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] ${LEVEL_STYLE[exercise.level]}`}
          >
            {exercise.level}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted">
          {exercise.formCue ?? exercise.instructions.slice(0, 2).join(" ")}
        </p>
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
