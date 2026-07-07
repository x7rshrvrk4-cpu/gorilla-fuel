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
    oneLiner: "Lose fat without losing your mind — or your muscle.",
    whoItsFor:
      "You want the scale to move down. High-protein, high-volume eating keeps you full in a deficit so fat comes off while muscle stays.",
    calorieFraming:
      "Eat in a modest deficit — your calculator target already applies the cut. Aim to lose ~0.5–1% of bodyweight per week; if the scale stalls for two weeks, trim about 150 kcal.",
    plateRule:
      "Half the plate non-starchy veg, a palm or two of lean protein, one cupped handful of smart carbs, a thumb of fat. Volume from vegetables is your appetite's best friend.",
    proteinCue:
      "Protein is non-negotiable on a cut — hit the high end of your range (aim ~2.2 g/kg) to protect muscle. Anchor every meal around a protein.",
    mealAnchors: [
      "chicken-breast", "white-fish", "shrimp", "eggs", "greek-yogurt", "cottage-cheese",
      "tofu", "lentils", "spinach", "broccoli", "bell-peppers", "brussels-sprouts",
      "berries", "sweet-potato", "olive-oil", "whey-isolate",
    ],
    sampleDay: {
      breakfast: "Plain Greek yogurt with berries and a spoon of chia.",
      lunch: "Big spinach salad with grilled chicken breast, peppers, and an olive-oil drizzle.",
      dinner: "Baked white fish with roasted broccoli and half a sweet potato.",
      snack: "Cottage cheese, or a whey isolate shake.",
    },
    cheatAllowance:
      "One planned treat meal a week — eat it, enjoy it, no guilt. A single meal never undoes a week of deficit; the shame-spiral that follows is what does.",
    exercises: [
      "march-in-place", "bodyweight-squat", "reverse-lunge", "push-up", "glute-bridge",
      "mountain-climber", "high-knees", "plank", "bicycle-crunch",
    ],
    structure:
      "3–4 short full-body sessions a week plus daily walking. Circuit the movements with minimal rest to keep the heart rate up and burn more in less time.",
    progression:
      "Add one rep per set or one round each week. When a movement feels easy for all sets, swap in its harder cousin (knee push-up → push-up, chair squat → bodyweight squat).",
  },
  {
    id: "build",
    slug: "build",
    goalLabel: "Build",
    oneLiner: "Add muscle on purpose — eat, lift, recover, repeat.",
    whoItsFor:
      "You want to gain size and strength. A slight surplus plus progressive overload and enough protein turns training into new muscle.",
    calorieFraming:
      "Eat in a slight surplus — your lean-bulk target adds about 12%. Aim to gain ~0.25–0.5% of bodyweight per week; faster than that is mostly fat. Add ~150 kcal if you stall.",
    plateRule:
      "A palm or two of protein, one to two cupped handfuls of carbs to fuel training, a fist of veg, a thumb or two of fat. Carbs are your friend here — they power the work.",
    proteinCue:
      "Spread protein across 4+ meals, roughly 0.4 g/kg each, landing around 1.8–2.2 g/kg total. A whey isolate shake makes hitting it easy on busy days.",
    mealAnchors: [
      "chicken-thigh", "lean-ground-beef", "salmon", "eggs", "greek-yogurt", "black-beans",
      "rolled-oats", "brown-rice", "quinoa", "sweet-potato", "potato", "olive-oil",
      "almonds", "natural-peanut-butter", "banana", "whey-isolate",
    ],
    sampleDay: {
      breakfast: "Oats cooked with milk, banana, peanut butter, and a scoop of whey.",
      lunch: "Ground beef with brown rice, black beans, and peppers.",
      dinner: "Salmon with quinoa and roasted potatoes.",
      snack: "Greek yogurt with almonds, or a shake before bed.",
    },
    cheatAllowance:
      "You have the most room here — a surplus tolerates the occasional indulgence. Keep it built on whole foods most of the time so you gain muscle, not just weight.",
    exercises: [
      "bodyweight-squat", "sumo-squat", "forward-lunge", "reverse-lunge", "step-up",
      "push-up", "plank", "side-plank", "sit-up",
    ],
    structure:
      "3–5 strength sessions a week, training each movement pattern (squat, push, hinge, core) twice. Rest 60–120s between hard sets so you can push each one.",
    progression:
      "Progressive overload is the whole game: add reps, then a harder variation, then a slow tempo or a pause. Log it — if the numbers aren't climbing, neither is the muscle.",
  },
  {
    id: "tone-up",
    slug: "tone-up",
    goalLabel: "Tone Up",
    oneLiner: "Firm up and define — recomposition, not extremes.",
    whoItsFor:
      "You're not chasing the scale up or down — you want to look tighter and more defined. Eat around maintenance, train consistently, and let body composition shift.",
    calorieFraming:
      "Eat at or just below maintenance — your maintain target is the anchor. 'Toning' is really building a little muscle while losing a little fat; it happens slowly, so judge by the mirror and the fit of your clothes, not the scale.",
    plateRule:
      "A palm of protein, half a plate of veg, a cupped handful of carbs around workouts, a thumb of fat. Consistent and balanced beats extreme and short-lived.",
    proteinCue:
      "Keep protein high (~1.8–2.0 g/kg) — it's what turns training into definition. Anchor each meal with a protein and you'll rarely fall short.",
    mealAnchors: [
      "chicken-breast", "ground-turkey", "white-fish", "eggs", "greek-yogurt", "cottage-cheese",
      "tofu", "chickpeas", "quinoa", "sweet-potato", "spinach", "broccoli",
      "bell-peppers", "avocado", "almonds", "whey-isolate",
    ],
    sampleDay: {
      breakfast: "Veggie omelette with spinach and peppers, side of berries.",
      lunch: "Chickpea and quinoa bowl with turkey and avocado.",
      dinner: "Grilled chicken with roasted broccoli and sweet potato.",
      snack: "Greek yogurt or cottage cheese with a few almonds.",
    },
    cheatAllowance:
      "A treat or two a week fits fine at maintenance — just keep it intentional, not a daily drift. Consistency is what reveals definition.",
    exercises: [
      "bodyweight-squat", "sumo-squat", "forward-lunge", "glute-bridge", "push-up",
      "knee-push-up", "plank", "side-plank", "crunch", "bicycle-crunch", "standing-oblique-twist",
    ],
    structure:
      "3–4 full-body sessions mixing strength and core, plus regular walking. Superset a lower-body move with a core move to keep sessions short and dense.",
    progression:
      "Chase quality reps and a little more each week — an extra rep, a longer plank, a slower lower. Add the harder variation once the current one feels controlled and easy.",
  },
  {
    id: "stay-healthy",
    slug: "stay-healthy",
    goalLabel: "Stay Healthy",
    oneLiner: "Maintain, feel good, and keep the habits that last.",
    whoItsFor:
      "You're happy where you are and want to stay there — steady weight, good energy, real food. No deficit, no surplus, just sustainable balance.",
    calorieFraming:
      "Eat at maintenance — your maintain target holds your weight steady. Don't overthink the numbers; build meals from whole foods, eat to comfortable fullness, and let your weight sit in a stable range.",
    plateRule:
      "The classic balanced plate: half veg and fruit, a quarter protein, a quarter whole-food carbs, a little healthy fat. Simple, repeatable, forgiving.",
    proteinCue:
      "A palm of protein at each meal (~1.6 g/kg total) is plenty for general health and keeps you satisfied. Variety across the week covers your bases.",
    mealAnchors: [
      "chicken-breast", "salmon", "eggs", "greek-yogurt", "tofu", "black-beans",
      "lentils", "rolled-oats", "brown-rice", "whole-grain-bread", "sweet-potato", "spinach",
      "broccoli", "berries", "banana", "olive-oil", "walnuts", "avocado",
    ],
    sampleDay: {
      breakfast: "Oatmeal with berries and walnuts.",
      lunch: "Whole-grain wrap with salmon or beans, greens, and avocado.",
      dinner: "Chicken or tofu stir-fry with brown rice and mixed veg.",
      snack: "A banana with peanut butter, or yogurt.",
    },
    cheatAllowance:
      "There's no 'cheat' at maintenance — there's just food. Follow the 80/20 rhythm: whole foods most of the time, whatever you love the rest, no rules to break.",
    exercises: [
      "march-in-place", "arm-circles", "bodyweight-squat", "reverse-lunge", "glute-bridge",
      "incline-push-up", "calf-raise", "plank", "bird-dog", "dead-bug",
    ],
    structure:
      "Move most days: 2–3 light strength sessions a week plus walking and whatever activity you enjoy. The goal is a routine you'll still be doing in a year.",
    progression:
      "Progress is optional here — maintain the habit first. If you want a little more, add a set or a slightly harder variation now and then. Consistency over intensity.",
  },
  {
    id: "energize",
    slug: "energize",
    goalLabel: "Energize",
    oneLiner: "Eat for steady energy — no crashes, no fog.",
    whoItsFor:
      "You want to feel switched-on all day. Balanced meals built on slow carbs, protein, and produce keep blood sugar steady so energy stays level.",
    calorieFraming:
      "Eat around maintenance — enough fuel to feel good, spread evenly across the day. Under-eating is the most common energy killer; crashing on sugar is the second. Regular, balanced meals are the fix.",
    plateRule:
      "Pair a slow carb with a protein and some produce at every meal — that combo digests steadily and avoids the spike-and-crash. Add a little fat for staying power.",
    proteinCue:
      "Include protein at every meal and snack (~1.6–1.8 g/kg total) — it blunts blood-sugar swings and keeps you full between meals, which is half of feeling energized.",
    mealAnchors: [
      "eggs", "greek-yogurt", "chicken-breast", "canned-tuna", "chickpeas", "lentils",
      "rolled-oats", "quinoa", "sweet-potato", "banana", "berries", "spinach",
      "bell-peppers", "almonds", "chia-seeds", "natural-peanut-butter", "whey-isolate",
    ],
    sampleDay: {
      breakfast: "Overnight oats with chia, berries, and yogurt.",
      lunch: "Quinoa bowl with chickpeas, spinach, peppers, and tuna.",
      dinner: "Chicken with sweet potato and mixed vegetables.",
      snack: "Banana with peanut butter, or a handful of almonds.",
    },
    cheatAllowance:
      "Treats are fine — just pair sugar with protein or fat and eat it after a meal, not on an empty stomach, so it doesn't spike then crash you. Timing matters more than restriction here.",
    exercises: [
      "march-in-place", "cross-body-knee-touch", "arm-circles", "high-knees", "bodyweight-squat",
      "step-up", "mountain-climber", "standing-oblique-twist", "glute-bridge",
    ],
    structure:
      "Short, frequent movement beats one long grind — a brisk 10–20 minute circuit or walk most days lifts energy more than an occasional hard session. Move in the morning or the mid-afternoon slump.",
    progression:
      "Build the daily-movement habit first, then nudge intensity: a few more minutes, a quicker pace, an extra round. The win is consistent energy, not exhaustion.",
  },
];

/** Fast slug → Plan lookup for the [plan] route and UI. */
export const PLAN_BY_SLUG: Record<string, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.slug, p])
);

/**
 * Shared safety copy rendered on every plan. One source of truth so the message
 * stays consistent across the plan UI.
 */
export const GUARDRAILS = {
  title: "Before you start",
  points: [
    "These plans are general education, not medical or nutrition advice. Individual needs vary — if you have a health condition, are pregnant or nursing, or take medication, talk to a qualified professional first.",
    "Calorie and macro targets are estimates from the Mifflin-St Jeor equation and standard activity multipliers. Treat them as a starting point and adjust based on real results over 2–3 weeks.",
    "Never train through sharp or joint pain. Start with the gentle variation of any movement, warm up first, and stop if something hurts — soreness is normal, pain is a signal.",
    "Food scores reflect ingredient and nutrition quality, not your personal tolerances. Honor allergies, intolerances, and your own body over any list.",
    "Fast weight change is rarely fat — aim for gradual, sustainable progress. Extreme deficits or surpluses backfire. Consistency beats intensity every time.",
  ],
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
