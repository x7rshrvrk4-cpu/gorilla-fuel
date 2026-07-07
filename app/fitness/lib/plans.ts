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
      "cross-body-knee-touch", "march-in-place", "wall-push-up", "knee-push-up",
      "chair-assisted-squat", "bodyweight-squat", "glute-bridge", "standing-side-crunch",
      "calf-raise", "plank",
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
      "bodyweight-squat", "sumo-squat", "forward-lunge", "reverse-lunge", "knee-push-up",
      "push-up", "incline-push-up", "glute-bridge", "plank", "side-plank", "bird-dog",
      "calf-raise", "step-up", "wall-sit",
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
      "bodyweight-squat", "forward-lunge", "reverse-lunge", "push-up", "knee-push-up",
      "glute-bridge", "plank", "side-plank", "bicycle-crunch", "dead-bug",
      "standing-oblique-twist", "high-knees", "calf-raise",
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
      "bodyweight-squat", "push-up", "knee-push-up", "plank", "glute-bridge", "forward-lunge",
      "reverse-lunge", "bird-dog", "march-in-place", "high-knees", "calf-raise", "arm-circles",
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
      "march-in-place", "high-knees", "arm-circles", "bodyweight-squat", "glute-bridge",
      "cross-body-knee-touch", "standing-oblique-twist", "plank",
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
  }
  return problems;
}
