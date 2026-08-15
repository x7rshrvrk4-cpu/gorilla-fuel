// Fitness plans — the content spine. Each plan COMPOSES from the pantry and
// exercise libraries by id (mealAnchors → PantryItem ids, exercises → Exercise
// ids), so no food or movement is duplicated here. Add a food/movement once in
// its library and reference it from any number of plans.
//
// Also exports GUARDRAILS — the shared safety copy the plan UI renders on every
// plan — and validatePlanReferences(), a pure check the UI/tests can run to catch
// a plan pointing at a library id that doesn't exist.
//
// Data + types only. No UI, no React.

import { PANTRY_IDS } from "./pantryLibrary";
import { EXERCISE_IDS } from "./exerciseLibrary";

export type PlanSlug = "lean-down" | "build" | "tone-up" | "stay-healthy" | "energize";

/** One day of the weekly split. `exerciseIds` is empty on rest / walk days. */
export type WeeklySplitDay = { day: string; focus: string; exerciseIds: string[] };

export type Plan = {
  id: string;
  slug: PlanSlug;
  goalLabel: string;
  oneLiner: string;
  whoItsFor: string;
  calorieFraming: string;
  plateRule: string;
  proteinCue: string;
  /** PantryItem ids (see pantryLibrary) — the foods this plan is built around. */
  mealAnchors: string[];
  sampleDay: { breakfast: string; lunch: string; dinner: string; snack: string };
  cheatAllowance: string;
  /** Exercise ids (see exerciseLibrary) — the movements this plan programs. */
  exercises: string[];
  /**
   * The day-by-day weekly split — the full Mon–Sun week, rest/walk days included
   * explicitly (empty `exerciseIds`). Every id must exist in exerciseLibrary; the
   * flat `exercises` array above is kept as the plan's full movement pool.
   */
  weeklySplit: WeeklySplitDay[];
  structure: string;
  progression: string;
};

export const PLANS: Plan[] = [
  {
    id: "lean-down",
    slug: "lean-down",
    goalLabel: "Lean Down",
    oneLiner: "Drop fat steadily without starving — eat enough protein, move most days.",
    whoItsFor:
      "You want the scale to move and you're carrying extra weight. This is the honest, sustainable version — about 0.5–1 lb a week, not a crash.",
    calorieFraming:
      "A gentle deficit — for most bigger beginners that's roughly a 400–600 cal/day pullback from maintenance. Start here and adjust to how your energy and the scale respond over 2–3 weeks. It's a starting point, not a hard number to chase.",
    plateRule:
      "Half the plate veg, a palm or two of protein, a fist of smart carb, a thumb of healthy fat.",
    proteinCue:
      "Anchor every meal with a protein — it keeps you full and protects muscle while you lose.",
    mealAnchors: [
      "chicken-breast", "eggs", "canned-tuna", "greek-yogurt", "black-beans", "lentils",
      "cottage-cheese", "rolled-oats", "sweet-potato", "brown-rice", "quinoa", "spinach",
      "broccoli", "berries", "bell-peppers", "almonds", "natural-peanut-butter", "olive-oil",
      "avocado",
    ],
    sampleDay: {
      breakfast: "Greek yogurt with berries and a few almonds.",
      lunch: "Big spinach salad with chicken breast and olive oil.",
      dinner: "Salmon or chicken with broccoli and half a sweet potato.",
      snack: "Cottage cheese, or an apple.",
    },
    cheatAllowance:
      "One sensible treat — a square or two of 70%+ dark chocolate, or air-popped popcorn. A plan you can keep beats a perfect plan you quit.",
    exercises: [
      "Cross-Body_Crunch", "Star_Jump", "Pushups_Close_and_Wide_Hand_Positions", "Incline_Push-Up_Medium",
      "Rear_Leg_Raises", "Bodyweight_Squat", "Butt_Lift_Bridge", "Russian_Twist",
      "Knee_Circles", "Plank",
    ],
    // Beginner-oriented, carrying extra weight: gentle full-body 3×/week (Mon/Wed/Fri)
    // with a daily walk on the between days — matches "move most days", no back-to-back
    // strength sessions so recovery is easy.
    weeklySplit: [
      { day: "Monday", focus: "Full body", exerciseIds: ["Incline_Push-Up_Medium", "Bodyweight_Squat", "Plank"] },
      { day: "Tuesday", focus: "Walk / active recovery", exerciseIds: [] },
      { day: "Wednesday", focus: "Full body", exerciseIds: ["Pushups_Close_and_Wide_Hand_Positions", "Butt_Lift_Bridge", "Cross-Body_Crunch"] },
      { day: "Thursday", focus: "Walk / active recovery", exerciseIds: [] },
      { day: "Friday", focus: "Full body", exerciseIds: ["Rear_Leg_Raises", "Star_Jump", "Russian_Twist"] },
      { day: "Saturday", focus: "Walk / active recovery", exerciseIds: [] },
      { day: "Sunday", focus: "Rest", exerciseIds: [] },
    ],
    structure:
      "2 rounds of about 10–12 reps each (planks 15–20 seconds), 3× a week — plus aim for a daily walk.",
    progression:
      "Add a 3rd round, then increase reps, then move wall → knee → full push-ups and hold planks longer. When it feels easy, add a little.",
  },
  {
    id: "build",
    slug: "build",
    goalLabel: "Build",
    oneLiner: "Add strength and size — train the whole body, eat enough, prioritize protein.",
    whoItsFor:
      "You want to get stronger and build muscle. That means eating at or slightly above maintenance — a lean-ish surplus — and training every major muscle group twice a week.",
    calorieFraming:
      "Eat at maintenance or a small surplus (about +200–300 cal). You can't build much on a big deficit. Prioritize protein and let the training drive the growth — adjust to how you're recovering.",
    plateRule:
      "A protein at every meal (bigger portions than Lean Down), smart carbs around training, and plenty of veg.",
    proteinCue:
      "Protein is the build material — include a protein source at every meal and snack.",
    mealAnchors: [
      "chicken-breast", "chicken-thigh", "lean-ground-beef", "ground-turkey", "eggs",
      "greek-yogurt", "cottage-cheese", "salmon", "canned-tuna", "whey-isolate", "rolled-oats",
      "brown-rice", "quinoa", "potato", "whole-grain-bread", "natural-peanut-butter",
      "almonds", "walnuts", "olive-oil", "avocado", "banana",
    ],
    sampleDay: {
      breakfast: "Eggs with oats and a banana.",
      lunch: "Chicken with rice and veg.",
      dinner: "Beef or salmon with potato and broccoli.",
      snack: "Post-workout whey and a banana; later, Greek yogurt with peanut butter.",
    },
    cheatAllowance:
      "A bigger post-workout treat fits here — the surplus has room for it.",
    exercises: [
      "Bodyweight_Squat", "Freehand_Jump_Squat", "Bodyweight_Walking_Lunge", "Scissors_Jump", "Incline_Push-Up_Medium",
      "Pushups", "Incline_Push-Up", "Butt_Lift_Bridge", "Plank", "Side_Bridge", "Superman",
      "Knee_Circles", "Step-up_with_Knee_Raise", "Double_Leg_Butt_Kick",
    ],
    // Wants size/strength and to hit every major group twice a week → a 6-day
    // Push / Pull / Legs rotation (each pattern trained twice), one rest day. The
    // most advanced split of the five. Push = chest/triceps/shoulders, Pull =
    // lats/biceps/lower-back, Legs = quads/glutes/hamstrings.
    weeklySplit: [
      { day: "Monday", focus: "Push (chest · triceps · shoulders)", exerciseIds: ["Pushups", "Bench_Dips", "Handstand_Push-Ups"] },
      { day: "Tuesday", focus: "Pull (back · biceps)", exerciseIds: ["Pullups", "Chin-Up", "Superman"] },
      { day: "Wednesday", focus: "Legs (quads · glutes · hamstrings)", exerciseIds: ["Bodyweight_Squat", "Bodyweight_Walking_Lunge", "Natural_Glute_Ham_Raise"] },
      { day: "Thursday", focus: "Push (chest · triceps · shoulders)", exerciseIds: ["Incline_Push-Up", "Push-Ups_-_Close_Triceps_Position", "Kneeling_Arm_Drill"] },
      { day: "Friday", focus: "Pull (back · lower back)", exerciseIds: ["Wide-Grip_Rear_Pull-Up", "V-Bar_Pullup", "Hyperextensions_With_No_Hyperextension_Bench"] },
      { day: "Saturday", focus: "Legs (quads · glutes)", exerciseIds: ["Freehand_Jump_Squat", "Step-up_with_Knee_Raise", "Single_Leg_Glute_Bridge"] },
      { day: "Sunday", focus: "Rest", exerciseIds: [] },
    ],
    structure:
      "Full-body, 2–3 sets of 8–12 reps, 3× a week (e.g. Mon/Wed/Fri) — hitting every major muscle group at least twice.",
    progression:
      "Move to harder variations (knee → full push-ups; add a step for step-ups) and add sets or reps over time. Making it harder is the whole game.",
  },
  {
    id: "tone-up",
    slug: "tone-up",
    goalLabel: "Tone Up",
    oneLiner: "Firm up and lean out — a blend of light deficit and full-body resistance.",
    whoItsFor:
      "You don't want to be 'big,' you want to look defined — a bit leaner, a bit firmer. This is the popular middle: a slight deficit plus resistance training to keep the muscle you have.",
    calorieFraming:
      "A light deficit — roughly 300–400 cal below maintenance — enough to lean out slowly while resistance training keeps you firm. 'Toned' just means a little less fat over the muscle you already have. Start here and adjust.",
    plateRule:
      "Protein-forward, moderate carbs (more on training days), and lots of veg.",
    proteinCue:
      "Keep protein high even in a light deficit — it's what keeps you looking firm, not soft.",
    mealAnchors: [
      "chicken-breast", "white-fish", "shrimp", "eggs", "greek-yogurt", "tofu", "tempeh",
      "cottage-cheese", "lentils", "quinoa", "sweet-potato", "brown-rice", "rolled-oats",
      "avocado", "almonds", "olive-oil", "chia-seeds", "spinach", "broccoli",
      "brussels-sprouts", "berries", "bell-peppers",
    ],
    sampleDay: {
      breakfast: "Eggs with spinach and berries.",
      lunch: "Chicken or tofu quinoa bowl loaded with veg.",
      dinner: "White fish with brussels sprouts and a small sweet potato.",
      snack: "Greek yogurt.",
    },
    cheatAllowance:
      "Dark chocolate, or a rice cake with peanut butter — small, regular, sustainable.",
    exercises: [
      "Bodyweight_Squat", "Bodyweight_Walking_Lunge", "Scissors_Jump", "Pushups", "Incline_Push-Up_Medium",
      "Butt_Lift_Bridge", "Plank", "Side_Bridge", "Air_Bike", "Dead_Bug",
      "Oblique_Crunches", "Mountain_Climbers", "Knee_Circles",
    ],
    // The "middle" plan — defined, not big. An Upper / Lower rotation 4×/week plus a
    // dedicated core + conditioning day (the "light conditioning between strength
    // moves" the structure copy describes), two rest days. More structured than the
    // beginner full-body plans, lighter than the 6-day build split.
    weeklySplit: [
      { day: "Monday", focus: "Upper body", exerciseIds: ["Pushups", "Pullups", "Bench_Dips"] },
      { day: "Tuesday", focus: "Lower body", exerciseIds: ["Bodyweight_Squat", "Bodyweight_Walking_Lunge", "Butt_Lift_Bridge"] },
      { day: "Wednesday", focus: "Rest", exerciseIds: [] },
      { day: "Thursday", focus: "Upper body", exerciseIds: ["Incline_Push-Up_Medium", "Chin-Up", "Handstand_Push-Ups"] },
      { day: "Friday", focus: "Lower body", exerciseIds: ["Scissors_Jump", "Step-up_with_Knee_Raise", "90_90_Hamstring"] },
      { day: "Saturday", focus: "Core & conditioning", exerciseIds: ["Plank", "Oblique_Crunches", "Mountain_Climbers"] },
      { day: "Sunday", focus: "Rest", exerciseIds: [] },
    ],
    structure:
      "A full-body circuit, 2–3 rounds of about 12–15 reps, 3–4× a week — with high-knees and oblique work as light conditioning between the strength moves.",
    progression:
      "Shorten the rest between moves (make it a circuit), then add rounds, then harder variations. Firming comes from consistency, not punishment.",
  },
  {
    id: "stay-healthy",
    slug: "stay-healthy",
    goalLabel: "Stay Healthy",
    oneLiner: "Feel good and stay well — balanced eating, move your body regularly, no extremes.",
    whoItsFor:
      "You're not chasing a big transformation — you want to eat well, stay active, and keep your body healthy. Maintenance calories and sustainable movement.",
    calorieFraming:
      "Eat around maintenance — no deficit, no surplus. The goal is balance and consistency, not a change on the scale.",
    plateRule:
      "The balanced plate — a protein, plenty of veg and fruit, whole-grain carbs, and healthy fats. Variety over restriction.",
    proteinCue:
      "A protein source at most meals — but this plan is about the whole balanced plate, not maxing any one thing.",
    mealAnchors: [
      "eggs", "chicken-breast", "salmon", "greek-yogurt", "black-beans", "lentils", "tofu",
      "canned-tuna", "rolled-oats", "brown-rice", "quinoa", "sweet-potato", "whole-grain-bread",
      "potato", "olive-oil", "avocado", "almonds", "walnuts", "natural-peanut-butter",
      "chia-seeds", "spinach", "broccoli", "berries", "banana", "bell-peppers",
      "brussels-sprouts",
    ],
    sampleDay: {
      breakfast: "Oats with berries and walnuts.",
      lunch: "A mixed bowl — any protein with a grain and veg.",
      dinner: "A whole-food protein with veg and a carb.",
      snack: "Fruit and nuts, or yogurt.",
    },
    cheatAllowance:
      "The most relaxed of the plans — a healthy relationship with food, treats in moderation.",
    exercises: [
      "Bodyweight_Squat", "Pushups", "Incline_Push-Up_Medium", "Plank", "Butt_Lift_Bridge", "Bodyweight_Walking_Lunge",
      "Scissors_Jump", "Superman", "Star_Jump", "Mountain_Climbers", "Knee_Circles", "Kneeling_Arm_Drill",
    ],
    // Not chasing a transformation — 3× light full-body work with daily movement on the
    // between days ("move daily: walk, take the stairs"). No extremes, easy recovery.
    weeklySplit: [
      { day: "Monday", focus: "Full body", exerciseIds: ["Bodyweight_Squat", "Incline_Push-Up_Medium", "Plank"] },
      { day: "Tuesday", focus: "Move daily (walk / stairs)", exerciseIds: [] },
      { day: "Wednesday", focus: "Full body", exerciseIds: ["Bodyweight_Walking_Lunge", "Pushups", "Superman"] },
      { day: "Thursday", focus: "Move daily (walk / stairs)", exerciseIds: [] },
      { day: "Friday", focus: "Full body", exerciseIds: ["Butt_Lift_Bridge", "Star_Jump", "Mountain_Climbers"] },
      { day: "Saturday", focus: "Move daily (walk / stairs)", exerciseIds: [] },
      { day: "Sunday", focus: "Rest", exerciseIds: [] },
    ],
    structure:
      "About 2–3× a week of light full-body work — plus move daily: walk, take the stairs, stay active. Regular, not intense.",
    progression:
      "Optional — do more if you enjoy it. This plan is about keeping the habit, not pushing limits.",
  },
  {
    id: "energize",
    slug: "energize",
    goalLabel: "Energize",
    oneLiner: "Steady all-day energy — stable-blood-sugar meals, smart caffeine, regular movement.",
    whoItsFor:
      "You feel sluggish and want more consistent energy — fewer crashes, better focus. This is about food timing and quality and gentle regular movement more than weight change.",
    calorieFraming:
      "Roughly maintenance — this plan is about what and when you eat, not how much. Steady energy comes from balanced meals that don't spike and crash.",
    plateRule:
      "Protein + fiber + a smart carb at every meal — that combo blunts blood-sugar spikes. Avoid all-carb meals that crash you.",
    proteinCue:
      "Pair carbs with protein and fiber every time — that's the anti-crash formula. And don't skip meals.",
    mealAnchors: [
      "eggs", "greek-yogurt", "chicken-breast", "canned-tuna", "black-beans", "lentils",
      "cottage-cheese", "rolled-oats", "quinoa", "sweet-potato", "brown-rice", "berries",
      "spinach", "avocado", "chia-seeds", "almonds", "walnuts", "natural-peanut-butter",
      "banana",
    ],
    sampleDay: {
      breakfast: "Oats with chia, berries, and Greek yogurt.",
      lunch: "Quinoa with chicken and veg.",
      dinner: "Salmon with sweet potato and greens.",
      snack: "Apple with peanut butter to beat the 3pm dip.",
    },
    cheatAllowance:
      "Fine — just framed around energy. Sugary treats spike then crash; enjoy them, but notice how you feel after.",
    exercises: [
      "Star_Jump", "Mountain_Climbers", "Kneeling_Arm_Drill", "Bodyweight_Squat", "Butt_Lift_Bridge",
      "Cross-Body_Crunch", "Oblique_Crunches", "Plank",
    ],
    // About energy, not training load: short (10–15 min) near-daily full-body mini-sessions,
    // deliberately light, with a brisk-walk day and one full rest. Consistency over intensity.
    weeklySplit: [
      { day: "Monday", focus: "Energizer (short full body)", exerciseIds: ["Bodyweight_Squat", "Star_Jump", "Plank"] },
      { day: "Tuesday", focus: "Energizer (short full body)", exerciseIds: ["Mountain_Climbers", "Butt_Lift_Bridge", "Cross-Body_Crunch"] },
      { day: "Wednesday", focus: "Energizer (short full body)", exerciseIds: ["Kneeling_Arm_Drill", "Bodyweight_Squat", "Oblique_Crunches"] },
      { day: "Thursday", focus: "Energizer (short full body)", exerciseIds: ["Star_Jump", "Butt_Lift_Bridge", "Plank"] },
      { day: "Friday", focus: "Energizer (short full body)", exerciseIds: ["Mountain_Climbers", "Cross-Body_Crunch", "Oblique_Crunches"] },
      { day: "Saturday", focus: "Brisk walk", exerciseIds: [] },
      { day: "Sunday", focus: "Rest", exerciseIds: [] },
    ],
    structure:
      "Short, near-daily sessions of 10–15 minutes, most days — plus a brisk walk, which does more for energy than you'd think. Time your coffee with the /caffeine tool — respect the half-life so it lifts you without a crash. Gentle by design.",
    progression:
      "Consistency over intensity — the energy comes from the regularity, not from crushing yourself.",
  },
];

/** Fast slug → Plan lookup for the [plan] route and UI. */
export const PLAN_BY_SLUG: Record<string, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.slug, p])
);

/**
 * Shared safety copy rendered on every plan — exact researched-spec block. One
 * source of truth so the message (including the disordered-eating guard) stays
 * consistent across the plan UI. Structure: intro paragraph, four points, closing.
 */
export const GUARDRAILS = {
  intro:
    "This is guidance, not a prescription. These plans are sensible starting points built for a general beginner — they are not medical or dietitian advice. Everyone's body and needs are different.",
  points: [
    "Talk to a professional before starting a new nutrition or exercise plan, especially if you have any health conditions, injuries, or take medication.",
    "The numbers are starting points, not targets to chase. Adjust to how you feel. Never push into very low intakes — under-eating backfires.",
    "If food or your body feels like a source of stress or control rather than health, please reach out to a professional. Health is the whole point here — not a number.",
    "Ease in. Start with the gentle version of every exercise and only progress when it feels good. Stop if something hurts.",
  ],
  closing:
    "Gorilla Fuel scores products so you can choose well — it doesn't replace a doctor, dietitian, or trainer.",
} as const;

/**
 * Pure integrity check: returns every (plan, kind, id) where a plan references a
 * pantry or exercise id that doesn't exist in its library. Empty array = all
 * plans compose from valid ids. Callable from the UI or a test; no side effects.
 */
export function validatePlanReferences(): { plan: string; kind: "pantry" | "exercise"; id: string }[] {
  const problems: { plan: string; kind: "pantry" | "exercise"; id: string }[] = [];
  for (const plan of PLANS) {
    for (const id of plan.mealAnchors) {
      if (!PANTRY_IDS.has(id)) problems.push({ plan: plan.slug, kind: "pantry", id });
    }
    for (const id of plan.exercises) {
      if (!EXERCISE_IDS.has(id)) problems.push({ plan: plan.slug, kind: "exercise", id });
    }
    for (const day of plan.weeklySplit) {
      for (const id of day.exerciseIds) {
        if (!EXERCISE_IDS.has(id)) problems.push({ plan: plan.slug, kind: "exercise", id });
      }
    }
  }
  return problems;
}
