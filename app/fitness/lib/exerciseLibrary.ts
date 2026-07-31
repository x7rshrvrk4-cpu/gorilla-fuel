// Exercise library — the movement vocabulary the fitness plans compose from.
// Plans reference these by `id` (see plans.ts `exercises`), so a movement is
// defined exactly once here. Every `imageSlot` holds a gold/dark duotone illustration
// (RepDB free-tier art, deterministically recolored — see scripts/_recolor_exercises.mjs);
// all 27 movements are illustrated (zero placeholders). Eleven movements were swapped to
// the closest bodyweight-equivalent RepDB movement because their own name/family had no
// free-tier art (name/formCue updated, `id` kept stable for plans.ts) — those entries are
// marked with a `substitute:` comment. No source image is used by more than one entry.
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
  // NOTE: `id` is kept stable (plans.ts references it) even where the movement was
  // swapped to a RepDB substitute — see the substitution table in the pipeline notes.
  {
    // substitute: RepDB "cross-body-crunch" art (floor version of the same cross-body oblique move)
    id: "cross-body-knee-touch",
    name: "Cross-Body Crunch",
    formCue: "Lie on your back, hands behind your head. Crunch up and bring one elbow toward the opposite bent knee while extending the other leg. Alternate sides slowly, twisting from the waist.",
    imageSlot: "/exercises/cross-body-knee-touch.png",
    difficulty: "gentle",
  },
  {
    // substitute: RepDB "jumping-jacks" art (standing warm-up cardio)
    id: "march-in-place",
    name: "Jumping Jacks",
    formCue: "Start with feet together and arms at your sides. Jump the feet out wide while raising your arms overhead, then jump back in. Keep it light and springy — step it out instead of jumping to lower the impact.",
    imageSlot: "/exercises/march-in-place.png",
    difficulty: "gentle",
  },
  {
    // substitute: RepDB "russian-twist" art (seated oblique rotation)
    id: "standing-side-crunch",
    name: "Russian Twist",
    formCue: "Sit with knees bent and heels down, lean back slightly to switch on the core. Rotate your torso side to side, bringing your hands past each hip. Move from the waist, not the arms.",
    imageSlot: "/exercises/standing-side-crunch.png",
    difficulty: "gentle",
  },
  {
    // substitute: RepDB "bodyweight-lateral-raise" art (shoulder raise)
    id: "arm-circles",
    name: "Lateral Raise",
    formCue: "Stand tall, arms at your sides. Raise both arms out to the sides to about shoulder height, leading with the elbows, then lower slowly. Keep shoulders down and don't swing.",
    imageSlot: "/exercises/arm-circles.png",
    difficulty: "gentle",
  },
  {
    id: "wall-push-up",
    name: "Wall Push-Up",
    formCue: "Hands on the wall at chest height, body in a straight line, bend the elbows to bring your chest toward the wall, then press away.",
    imageSlot: "/exercises/wall-push-up.png",
    difficulty: "gentle",
  },
  {
    // substitute: RepDB "split-squat" art (beginner squat regression)
    id: "chair-assisted-squat",
    name: "Split Squat",
    formCue: "Stand in a split stance, one foot forward. Lower straight down until the back knee nearly touches the floor, front shin vertical, then drive up through the front heel. Hold a wall for balance if needed.",
    imageSlot: "/exercises/chair-assisted-squat.png",
    difficulty: "gentle",
  },
  {
    // substitute: RepDB "side-lunge" art (lateral lower-body strength; no isometric wall-sit art exists)
    id: "wall-sit",
    name: "Side Lunge",
    formCue: "Stand tall, step wide to one side and sit the hips back into that leg while the other stays straight, both feet flat. Push back to center. Chest up, knee tracking over the toes.",
    imageSlot: "/exercises/wall-sit.png",
    difficulty: "gentle",
  },
  {
    id: "calf-raise",
    name: "Calf Raise",
    formCue: "Rise onto the balls of your feet, pause at the top, lower slowly under control. Hold a wall for balance if needed.",
    imageSlot: "/exercises/calf-raise.png",
    difficulty: "gentle",
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    formCue: "Lie on your back, feet flat, drive hips up by squeezing your glutes until shoulders-hips-knees form a line. Don't arch the lower back.",
    imageSlot: "/exercises/glute-bridge.png",
    difficulty: "gentle",
  },
  {
    id: "knee-push-up",
    name: "Knee Push-Up",
    formCue: "From knees, hands under shoulders, keep a straight line from knees to head. Lower the chest, then press up — no sagging hips.",
    imageSlot: "/exercises/knee-push-up.png",
    difficulty: "gentle",
  },
  {
    id: "incline-push-up",
    name: "Incline Push-Up",
    formCue: "Hands on a bench or counter, body straight, lower chest to the edge and press back up. The higher the surface, the easier.",
    imageSlot: "/exercises/incline-push-up.png",
    difficulty: "gentle",
  },
  {
    // substitute: RepDB "superman" art (prone posterior-chain hold, same spirit as bird-dog)
    id: "bird-dog",
    name: "Superman",
    formCue: "Lie face down, arms extended overhead. Lift your arms, chest, and legs off the floor together by squeezing your glutes and lower back. Hold briefly, then lower with control.",
    imageSlot: "/exercises/bird-dog.png",
    difficulty: "gentle",
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    formCue: "On your back, arms up, knees bent at 90°. Lower one arm and the opposite leg while pressing your lower back into the floor.",
    imageSlot: "/exercises/dead-bug.png",
    difficulty: "gentle",
  },
  {
    // substitute: RepDB "flutter-kicks" art (core; the free tier has no unused rotational/oblique art left)
    id: "standing-oblique-twist",
    name: "Flutter Kicks",
    formCue: "Lie on your back, hands tucked under your hips, legs straight and lifted a few inches off the floor. Alternate small, quick up-and-down kicks while pressing your lower back into the floor.",
    imageSlot: "/exercises/standing-oblique-twist.png",
    difficulty: "gentle",
  },

  // ── Moderate / strength / higher-intensity ─────────────────────────────────
  {
    id: "bodyweight-squat",
    name: "Bodyweight Squat",
    formCue: "Feet shoulder-width, sit hips back and down to at least parallel, knees tracking over toes, chest up. Drive through the heels.",
    imageSlot: "/exercises/bodyweight-squat.png",
    difficulty: "moderate",
  },
  {
    id: "sumo-squat",
    name: "Sumo Squat",
    formCue: "Wide stance, toes turned out ~30°, squat straight down keeping knees pushed out over the toes. Squeeze glutes at the top.",
    imageSlot: "/exercises/sumo-squat.png",
    difficulty: "moderate",
  },
  {
    id: "forward-lunge",
    name: "Forward Lunge",
    formCue: "Step forward and lower until both knees are ~90°, front knee over the ankle. Push back to standing. Torso stays upright.",
    imageSlot: "/exercises/forward-lunge.png",
    difficulty: "moderate",
  },
  {
    id: "reverse-lunge",
    name: "Reverse Lunge",
    formCue: "Step backward and drop the back knee toward the floor, front shin vertical. Drive through the front heel to return. Easier on the knees than forward.",
    imageSlot: "/exercises/reverse-lunge.png",
    difficulty: "moderate",
  },
  {
    id: "step-up",
    name: "Step-Up",
    formCue: "Plant the whole foot on a sturdy step, drive through that heel to stand tall, control the way down. Don't push off the bottom foot.",
    imageSlot: "/exercises/step-up.png",
    difficulty: "moderate",
  },
  {
    id: "push-up",
    name: "Push-Up",
    formCue: "Hands just wider than shoulders, body in one rigid line, lower until elbows are ~90°, then press up. Brace the core the whole time.",
    imageSlot: "/exercises/push-up.png",
    difficulty: "moderate",
  },
  {
    // substitute: RepDB "v-ups" art (core; no plank-family art exists anywhere in the free tier)
    id: "plank",
    name: "V-Ups",
    formCue: "Lie flat with arms extended overhead. In one motion lift your legs and torso to meet over your hips, reaching your hands toward your feet, then lower under control. Smooth, not jerky.",
    imageSlot: "/exercises/plank.png",
    difficulty: "moderate",
  },
  {
    // substitute: RepDB "side-lying-hip-abduction" art (lateral core/hip; closest side-oriented move with art)
    id: "side-plank",
    name: "Side-Lying Hip Abduction",
    formCue: "Lie on your side, body in a straight line, propped on your forearm. Lift the top leg straight up as high as you can control, then lower slowly. Keep hips stacked — don't roll back.",
    imageSlot: "/exercises/side-plank.png",
    difficulty: "moderate",
  },
  {
    id: "crunch",
    name: "Crunch",
    formCue: "On your back, knees bent, curl the shoulder blades off the floor by contracting the abs. Don't yank on the neck — chin off chest.",
    imageSlot: "/exercises/crunch.png",
    difficulty: "gentle",
  },
  {
    id: "sit-up",
    name: "Sit-Up",
    formCue: "Full range from lying to sitting, hands crossed on the chest, controlled on the way down. Anchor feet only if needed.",
    imageSlot: "/exercises/sit-up.png",
    difficulty: "moderate",
  },
  {
    id: "bicycle-crunch",
    name: "Bicycle Crunch",
    formCue: "Bring the opposite elbow to the opposite knee while extending the other leg, alternating in a smooth pedaling rhythm. Slow beats fast.",
    imageSlot: "/exercises/bicycle-crunch.png",
    difficulty: "moderate",
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    formCue: "From a high plank, drive one knee toward the chest, then switch quickly, keeping hips low and shoulders over the hands.",
    imageSlot: "/exercises/mountain-climber.png",
    difficulty: "moderate",
  },
  {
    // substitute: RepDB "jump-squat" art (explosive lower-body cardio, same moderate intensity as high knees)
    id: "high-knees",
    name: "Jump Squat",
    formCue: "Drop into a squat, then explode straight up into a jump, swinging your arms for momentum. Land soft through the whole foot and absorb straight into the next squat. Skip the jump to regress.",
    imageSlot: "/exercises/high-knees.png",
    difficulty: "moderate",
  },
];

/** Fast id → Exercise lookup for the plan-composition layer and UI. */
export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e])
);

/** All valid exercise ids — used to validate that plans reference real movements. */
export const EXERCISE_IDS: ReadonlySet<string> = new Set(EXERCISES.map((e) => e.id));
