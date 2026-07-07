// Exercise library — the movement vocabulary the fitness plans compose from.
// Plans reference these by `id` (see plans.ts `exercises`), so a movement is
// defined exactly once here. `imageSlot` is null for now — the UI renders a
// placeholder and real art is dropped in later without touching plan data.
//
// Data only. No UI, no React.

export type ExerciseDifficulty = "gentle" | "moderate";

export type Exercise = {
  id: string;
  name: string;
  /** Short "how to do it right" coaching cue. */
  formCue: string;
  /** Art slot — null until illustrations are added; UI shows a placeholder. */
  imageSlot: string | null;
  difficulty: ExerciseDifficulty;
};

export const EXERCISES: Exercise[] = [
  // ── Gentle / warm-up / low-impact ──────────────────────────────────────────
  {
    id: "cross-body-knee-touch",
    name: "Cross-Body Knee Touch",
    formCue: "Stand tall, lift one knee and bring the opposite elbow to meet it. Stay upright — twist from the waist, not the shoulders.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "march-in-place",
    name: "March in Place",
    formCue: "Drive knees to hip height, swing arms naturally, land softly through the whole foot. Keep the core braced.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "standing-side-crunch",
    name: "Standing Side Crunch",
    formCue: "Hands behind head, lift one knee out to the side while crunching the same-side elbow down toward it. Control the squeeze.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "arm-circles",
    name: "Arm Circles",
    formCue: "Arms straight out at shoulder height, make small controlled circles forward, then reverse. Keep shoulders down away from ears.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "wall-push-up",
    name: "Wall Push-Up",
    formCue: "Hands on the wall at chest height, body in a straight line, bend the elbows to bring your chest toward the wall, then press away.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "chair-assisted-squat",
    name: "Chair-Assisted Squat",
    formCue: "Stand in front of a chair, sit back and lightly tap the seat, then drive through your heels to stand. Chest up throughout.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "wall-sit",
    name: "Wall Sit",
    formCue: "Slide down a wall until thighs are parallel to the floor, knees over ankles. Hold, breathing steadily — don't rest hands on legs.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "calf-raise",
    name: "Calf Raise",
    formCue: "Rise onto the balls of your feet, pause at the top, lower slowly under control. Hold a wall for balance if needed.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    formCue: "Lie on your back, feet flat, drive hips up by squeezing your glutes until shoulders-hips-knees form a line. Don't arch the lower back.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "knee-push-up",
    name: "Knee Push-Up",
    formCue: "From knees, hands under shoulders, keep a straight line from knees to head. Lower the chest, then press up — no sagging hips.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "incline-push-up",
    name: "Incline Push-Up",
    formCue: "Hands on a bench or counter, body straight, lower chest to the edge and press back up. The higher the surface, the easier.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "bird-dog",
    name: "Bird-Dog",
    formCue: "On hands and knees, extend the opposite arm and leg to full length, keeping hips level. Pause, return, switch. Move slow.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    formCue: "On your back, arms up, knees bent at 90°. Lower one arm and the opposite leg while pressing your lower back into the floor.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "standing-oblique-twist",
    name: "Standing Oblique Twist",
    formCue: "Feet shoulder-width, hands at your chest or behind your head, rotate the torso side to side from the waist. Keep hips facing forward.",
    imageSlot: null,
    difficulty: "gentle",
  },

  // ── Moderate / strength / higher-intensity ─────────────────────────────────
  {
    id: "bodyweight-squat",
    name: "Bodyweight Squat",
    formCue: "Feet shoulder-width, sit hips back and down to at least parallel, knees tracking over toes, chest up. Drive through the heels.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "sumo-squat",
    name: "Sumo Squat",
    formCue: "Wide stance, toes turned out ~30°, squat straight down keeping knees pushed out over the toes. Squeeze glutes at the top.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "forward-lunge",
    name: "Forward Lunge",
    formCue: "Step forward and lower until both knees are ~90°, front knee over the ankle. Push back to standing. Torso stays upright.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "reverse-lunge",
    name: "Reverse Lunge",
    formCue: "Step backward and drop the back knee toward the floor, front shin vertical. Drive through the front heel to return. Easier on the knees than forward.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "step-up",
    name: "Step-Up",
    formCue: "Plant the whole foot on a sturdy step, drive through that heel to stand tall, control the way down. Don't push off the bottom foot.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "push-up",
    name: "Push-Up",
    formCue: "Hands just wider than shoulders, body in one rigid line, lower until elbows are ~90°, then press up. Brace the core the whole time.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "plank",
    name: "Plank",
    formCue: "Forearms under shoulders, body a straight line from head to heels. Squeeze glutes and brace the core — don't let hips sag or pike.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "side-plank",
    name: "Side Plank",
    formCue: "Stack shoulder over elbow, lift hips so your body is a straight diagonal line. Hold steady; keep the top shoulder pulled back.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "crunch",
    name: "Crunch",
    formCue: "On your back, knees bent, curl the shoulder blades off the floor by contracting the abs. Don't yank on the neck — chin off chest.",
    imageSlot: null,
    difficulty: "gentle",
  },
  {
    id: "sit-up",
    name: "Sit-Up",
    formCue: "Full range from lying to sitting, hands crossed on the chest, controlled on the way down. Anchor feet only if needed.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "bicycle-crunch",
    name: "Bicycle Crunch",
    formCue: "Bring the opposite elbow to the opposite knee while extending the other leg, alternating in a smooth pedaling rhythm. Slow beats fast.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    formCue: "From a high plank, drive one knee toward the chest, then switch quickly, keeping hips low and shoulders over the hands.",
    imageSlot: null,
    difficulty: "moderate",
  },
  {
    id: "high-knees",
    name: "High Knees",
    formCue: "Run in place driving knees to hip height at a quick tempo, landing on the balls of the feet, arms pumping. Stay tall.",
    imageSlot: null,
    difficulty: "moderate",
  },
];

/** Fast id → Exercise lookup for the plan-composition layer and UI. */
export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e])
);

/** All valid exercise ids — used to validate that plans reference real movements. */
export const EXERCISE_IDS: ReadonlySet<string> = new Set(EXERCISES.map((e) => e.id));
