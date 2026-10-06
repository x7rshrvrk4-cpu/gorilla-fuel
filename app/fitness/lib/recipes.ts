// Recipe library — curated, static "what can I make?" meals grounded in the
// Gorilla Fuel PANTRY A-list (app/fitness/lib/pantryLibrary.ts). Each recipe's
// matchable ingredients reference a real pantry `id`, so the matcher can rank
// recipes by how many of the ingredients the user actually has — with ZERO
// runtime cost (pure data + filtering, no AI call). Grow it by adding entries.
//
// Honesty: macros are per-serving ESTIMATES for whole-food quantities, not lab
// values. `core` ingredients are the defining ones used for matching; non-core
// pantry items (oil, seasonings) are shown but don't penalize a match.
//
// Data only. No UI, no React.

import { PANTRY_BY_ID } from "./pantryLibrary";

export type RecipeMealType = "breakfast" | "lunch" | "dinner" | "snack";
export type RecipeGoal = "lean" | "build" | "maintain";
export type RecipeDiet =
  | "high-protein"
  | "gluten-free"
  | "vegetarian"
  | "vegan"
  | "dairy-free"
  | "quick" // <= 15 min
  | "treat"; // a realistic cheat meal/snack — scores honestly lower

export type RecipeIngredient = {
  /** Pantry id when it maps to the A-list (score + /scan link); null for a common extra. */
  pantryId: string | null;
  name: string;
  qty: string;
  /** Defining ingredient used for matching (vs. a staple/seasoning). */
  core?: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  mealType: RecipeMealType;
  goals: RecipeGoal[];
  diet: RecipeDiet[];
  timeMin: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  /** Per serving, estimated. */
  macros: { calories: number; protein: number; carbs: number; fat: number };
  gorillaNote: string;
};

// Shorthand builders keep the big list readable.
const core = (pantryId: string, qty: string): RecipeIngredient => ({ pantryId, name: PANTRY_BY_ID[pantryId]?.name ?? pantryId, qty, core: true });
const have = (pantryId: string, qty: string): RecipeIngredient => ({ pantryId, name: PANTRY_BY_ID[pantryId]?.name ?? pantryId, qty });
const extra = (name: string, qty: string): RecipeIngredient => ({ pantryId: null, name, qty });

export const RECIPES: Recipe[] = [
  // ───────────────────────── BREAKFAST ─────────────────────────
  {
    id: "overnight-oats-berries",
    title: "Berry Protein Overnight Oats",
    mealType: "breakfast",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "vegetarian", "quick"],
    timeMin: 5,
    servings: 1,
    ingredients: [core("rolled-oats", "60 g"), core("greek-yogurt", "150 g"), core("berries", "80 g"), have("chia-seeds", "1 tbsp"), extra("Milk of choice", "120 ml"), extra("Honey", "1 tsp")],
    steps: [
      "In a jar or bowl, stir together 60 g rolled oats, 150 g Greek yogurt, 1 tbsp chia seeds and 120 ml milk until no dry oats remain.",
      "Mix in about 1 tsp honey to taste.",
      "Seal and refrigerate at least 4 hours, ideally overnight — the oats and chia soften and thicken.",
      "Top with 80 g berries before eating; loosen with a splash more milk if too thick. Eat cold — keeps 3 days.",
    ],
    macros: { calories: 390, protein: 28, carbs: 52, fat: 8 },
    gorillaNote: "Greek yogurt + oats + chia is a high-fibre, high-protein start that scores across the board.",
  },
  {
    id: "veggie-egg-scramble",
    title: "Spinach & Pepper Egg Scramble",
    mealType: "breakfast",
    goals: ["lean", "maintain", "build"],
    diet: ["high-protein", "gluten-free", "vegetarian", "dairy-free", "quick"],
    timeMin: 10,
    servings: 1,
    ingredients: [core("eggs", "3 whole"), core("spinach", "1 handful"), core("bell-peppers", "1/2, diced"), have("olive-oil", "1 tsp"), extra("Salt & pepper", "to taste")],
    steps: [
      "Beat 3 eggs with a pinch of salt and pepper; dice ½ a bell pepper.",
      "Heat 1 tsp olive oil in a non-stick pan over medium. Add the pepper and cook 2–3 min until softening.",
      "Add a handful of spinach and stir until just wilted, about 30 seconds.",
      "Pour in the eggs, let them set a few seconds, then fold gently with a spatula until just cooked but still soft, 1–2 min. Serve right away.",
    ],
    macros: { calories: 310, protein: 21, carbs: 7, fat: 22 },
    gorillaNote: "Whole eggs plus two produce picks — fast, clean, and naturally gluten-free.",
  },
  {
    id: "banana-oat-pancakes",
    title: "3-Ingredient Banana Oat Pancakes",
    mealType: "breakfast",
    goals: ["maintain", "build"],
    diet: ["high-protein", "vegetarian"],
    timeMin: 15,
    servings: 1,
    ingredients: [core("banana", "1 ripe"), core("rolled-oats", "40 g"), core("eggs", "2 whole"), have("berries", "topping"), extra("Cinnamon", "pinch")],
    steps: [
      "Blend 1 ripe banana, 40 g rolled oats and 2 eggs with a pinch of cinnamon until smooth. Rest the batter 5 min to thicken.",
      "Heat a non-stick pan over medium and lightly grease. Spoon in small pancakes (~3 tbsp each).",
      "Cook 2 min until bubbles form and the edges set, then flip and cook 1–2 min more until golden.",
      "Stack and top with berries and a dusting of cinnamon.",
    ],
    macros: { calories: 420, protein: 22, carbs: 55, fat: 12 },
    gorillaNote: "No flour, no added sugar — the banana does the sweetening.",
  },
  {
    id: "pb-banana-oatmeal",
    title: "Peanut Butter Banana Oatmeal",
    mealType: "breakfast",
    goals: ["build", "maintain"],
    diet: ["vegetarian", "quick"],
    timeMin: 8,
    servings: 1,
    ingredients: [core("rolled-oats", "70 g"), core("banana", "1 sliced"), core("natural-peanut-butter", "1 tbsp"), have("chia-seeds", "1 tsp"), extra("Milk or water", "250 ml")],
    steps: [
      "Combine 70 g rolled oats with 250 ml milk or water in a small pot and bring to a gentle simmer over medium.",
      "Cook, stirring, 4–5 min until thick and creamy.",
      "Off the heat, stir through 1 tbsp peanut butter and 1 tsp chia seeds until glossy.",
      "Top with 1 sliced banana and serve warm.",
    ],
    macros: { calories: 480, protein: 17, carbs: 68, fat: 16 },
    gorillaNote: "A calorie-dense, whole-food breakfast built for a surplus.",
  },
  {
    id: "cottage-cheese-bowl",
    title: "Cottage Cheese & Berry Bowl",
    mealType: "breakfast",
    goals: ["lean"],
    diet: ["high-protein", "gluten-free", "vegetarian", "quick"],
    timeMin: 5,
    servings: 1,
    ingredients: [core("cottage-cheese", "200 g"), core("berries", "80 g"), have("walnuts", "small handful"), have("chia-seeds", "1 tsp")],
    steps: [
      "Spoon 200 g cottage cheese into a bowl.",
      "Top with 80 g berries, a small handful of chopped walnuts and 1 tsp chia seeds.",
      "Eat as is, or let it sit 5 min so the chia softens.",
    ],
    macros: { calories: 330, protein: 32, carbs: 18, fat: 14 },
    gorillaNote: "One of the highest protein-per-calorie breakfasts you can make in 2 minutes.",
  },
  {
    id: "tofu-scramble",
    title: "Savoury Tofu Scramble",
    mealType: "breakfast",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 12,
    servings: 1,
    ingredients: [core("tofu", "200 g firm"), core("spinach", "1 handful"), core("bell-peppers", "1/2"), have("olive-oil", "1 tsp"), extra("Turmeric + salt", "to taste")],
    steps: [
      "Press 200 g firm tofu a few minutes to remove water, then crumble into rough chunks with your hands.",
      "Heat 1 tsp olive oil in a pan over medium-high; add ½ diced bell pepper and cook 2 min.",
      "Add the tofu and cook 3–4 min, stirring, until lightly golden.",
      "Stir in ½ tsp turmeric, a pinch of salt and a handful of spinach; cook until the spinach wilts, about 1 min. Serve hot.",
    ],
    macros: { calories: 300, protein: 24, carbs: 9, fat: 18 },
    gorillaNote: "A plant-based, vegan high-protein scramble — no eggs needed.",
  },

  // ───────────────────────── LUNCH ─────────────────────────
  {
    id: "chicken-rice-bowl",
    title: "Chicken & Broccoli Rice Bowl",
    mealType: "lunch",
    goals: ["lean", "build", "maintain"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 25,
    servings: 1,
    ingredients: [core("chicken-breast", "150 g"), core("brown-rice", "70 g dry"), core("broccoli", "1 cup"), have("olive-oil", "1 tsp"), extra("Soy sauce / garlic", "to taste")],
    steps: [
      "Cook 70 g brown rice per the package (~25 min); drain.",
      "Meanwhile season 150 g chicken breast with salt, pepper and garlic. Heat 1 tsp oil over medium-high and sear 5–6 min per side until the centre reaches 74°C. Rest 2 min, then slice.",
      "Steam 1 cup broccoli 4–5 min until bright green and tender-crisp.",
      "Build the bowl with rice, chicken and broccoli; finish with a drizzle of oil and soy sauce or grated garlic.",
    ],
    macros: { calories: 520, protein: 45, carbs: 55, fat: 12 },
    gorillaNote: "The classic lean-mass bowl — all three ingredients score high and macro-balance easily.",
  },
  {
    id: "tuna-quinoa-salad",
    title: "Tuna Quinoa Power Salad",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "dairy-free", "quick"],
    timeMin: 15,
    servings: 1,
    ingredients: [core("canned-tuna", "1 can"), core("quinoa", "60 g dry"), core("spinach", "2 handfuls"), have("avocado", "1/2"), have("olive-oil", "1 tbsp"), extra("Lemon", "1/2")],
    steps: [
      "Rinse 60 g quinoa, then simmer in 120 ml water ~12 min until absorbed and the grains uncurl. Fluff and cool slightly.",
      "Lay 2 handfuls of spinach in a bowl and top with the quinoa.",
      "Drain and flake 1 can of tuna over the top; add ½ sliced avocado.",
      "Dress with 1 tbsp olive oil and the juice of ½ lemon; season and toss.",
    ],
    macros: { calories: 470, protein: 34, carbs: 40, fat: 18 },
    gorillaNote: "Lean protein + complete-protein quinoa + healthy fats in one bowl.",
  },
  {
    id: "chickpea-mediterranean",
    title: "Mediterranean Chickpea Bowl",
    mealType: "lunch",
    goals: ["maintain", "lean"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 15,
    servings: 1,
    ingredients: [core("chickpeas", "1 cup"), core("quinoa", "60 g dry"), core("bell-peppers", "1"), have("spinach", "1 handful"), have("tahini", "1 tbsp"), extra("Lemon + garlic", "to taste")],
    steps: [
      "Rinse and simmer 60 g quinoa in 120 ml water ~12 min; fluff and cool slightly.",
      "In a bowl, combine 1 cup drained chickpeas, 1 diced bell pepper and a handful of spinach with the quinoa.",
      "Whisk 1 tbsp tahini with the juice of ½ lemon, a grated garlic clove and 1–2 tbsp water until pourable.",
      "Pour the dressing over, season and toss to coat.",
    ],
    macros: { calories: 540, protein: 22, carbs: 72, fat: 18 },
    gorillaNote: "Plant-powered and fibre-dense — chickpeas + quinoa cover the amino acids.",
  },
  {
    id: "turkey-sweet-potato-skillet",
    title: "Turkey & Sweet Potato Skillet",
    mealType: "lunch",
    goals: ["lean", "build"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 25,
    servings: 2,
    ingredients: [core("ground-turkey", "300 g"), core("sweet-potato", "1 large, cubed"), core("spinach", "2 handfuls"), have("olive-oil", "1 tbsp"), extra("Paprika + garlic", "to taste")],
    steps: [
      "Cube 1 large sweet potato (~2 cm). Roast at 200°C for 20–25 min, or pan-cook in 1 tbsp oil over medium, covered, ~12 min until tender.",
      "Push the potato aside (or remove); add 300 g ground turkey with paprika, garlic, salt and pepper. Cook 6–8 min, breaking it up, until no pink remains.",
      "Return the sweet potato, add 2 handfuls spinach and fold through until wilted, ~1 min. Serves 2.",
    ],
    macros: { calories: 430, protein: 38, carbs: 34, fat: 14 },
    gorillaNote: "Meal-preps perfectly — makes two servings of clean, scored protein + carb.",
  },
  {
    id: "salmon-quinoa",
    title: "Lemon Salmon & Quinoa",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 25,
    servings: 1,
    ingredients: [core("salmon", "150 g fillet"), core("quinoa", "60 g dry"), core("broccoli", "1 cup"), have("olive-oil", "1 tsp"), extra("Lemon + dill", "to taste")],
    steps: [
      "Heat oven to 200°C. Rinse and simmer 60 g quinoa in 120 ml water ~12 min; steam 1 cup broccoli 4–5 min.",
      "Put a 150 g salmon fillet on a lined tray; top with lemon slices, dill, salt, pepper and a drizzle of oil.",
      "Bake 12–15 min until it flakes easily with a fork.",
      "Plate the salmon over the quinoa with the broccoli alongside.",
    ],
    macros: { calories: 560, protein: 42, carbs: 42, fat: 22 },
    gorillaNote: "Omega-3 salmon (score 90) with complete-protein quinoa — premium nutrition.",
  },
  {
    id: "black-bean-bowl",
    title: "Smoky Black Bean Rice Bowl",
    mealType: "lunch",
    goals: ["maintain", "build"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 20,
    servings: 1,
    ingredients: [core("black-beans", "1 cup"), core("brown-rice", "70 g dry"), core("bell-peppers", "1"), have("avocado", "1/2"), extra("Cumin + lime", "to taste")],
    steps: [
      "Cook 70 g brown rice (~25 min); drain.",
      "In a pan over medium, warm 1 cup drained black beans with 1 diced bell pepper, ½ tsp cumin and a pinch of salt, 5–6 min.",
      "Spoon over the rice and top with ½ sliced avocado and a good squeeze of lime.",
    ],
    macros: { calories: 560, protein: 20, carbs: 90, fat: 14 },
    gorillaNote: "Beans + rice is the original complete-protein combo, and both score well.",
  },
  {
    id: "shrimp-stirfry",
    title: "Garlic Shrimp Veggie Stir-Fry",
    mealType: "lunch",
    goals: ["lean"],
    diet: ["high-protein", "gluten-free", "dairy-free", "quick"],
    timeMin: 15,
    servings: 1,
    ingredients: [core("shrimp", "150 g"), core("broccoli", "1 cup"), core("bell-peppers", "1"), have("brown-rice", "60 g dry"), have("olive-oil", "1 tsp"), extra("Garlic + soy sauce", "to taste")],
    steps: [
      "Cook 60 g brown rice (~25 min); drain.",
      "Heat 1 tsp oil in a wok or large pan over high. Add 1 cup broccoli and 1 sliced bell pepper and stir-fry 3 min.",
      "Add 150 g shrimp and 2 grated garlic cloves; stir-fry 2–3 min until the shrimp are pink and opaque.",
      "Splash in soy sauce, toss once, and serve over the rice.",
    ],
    macros: { calories: 430, protein: 34, carbs: 48, fat: 9 },
    gorillaNote: "Very lean, very fast — high protein for under 450 calories.",
  },
  {
    id: "lentil-soup",
    title: "Hearty Lentil & Veg Soup",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 35,
    servings: 3,
    ingredients: [core("lentils", "1.5 cups dry"), core("spinach", "2 handfuls"), have("bell-peppers", "1"), have("olive-oil", "1 tbsp"), extra("Onion, garlic, stock", "as needed")],
    steps: [
      "In a pot, sauté a diced onion, 2 garlic cloves and 1 chopped bell pepper in 1 tbsp oil over medium, 4–5 min.",
      "Add 1.5 cups rinsed dry lentils and enough stock to cover by ~3 cm. Bring to a boil, then simmer 25 min until tender.",
      "Stir in 2 handfuls spinach until wilted, about 1 min.",
      "Season with salt, pepper and a squeeze of lemon. Makes 3 servings.",
    ],
    macros: { calories: 360, protein: 22, carbs: 54, fat: 6 },
    gorillaNote: "Lentils score 90 — fibre, protein and iron in a batch-cook soup.",
  },
  {
    id: "tuna-avocado-toast",
    title: "Tuna Avocado Toast",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "dairy-free", "quick"],
    timeMin: 8,
    servings: 1,
    ingredients: [core("canned-tuna", "1 can"), core("avocado", "1/2"), core("whole-grain-bread", "2 slices"), extra("Lemon + chili flakes", "to taste")],
    steps: [
      "Toast 2 slices of whole-grain bread.",
      "Mash ½ avocado with a squeeze of lemon and a pinch of salt; spread over the toast.",
      "Drain and flake 1 can of tuna on top; finish with chili flakes.",
    ],
    macros: { calories: 410, protein: 30, carbs: 32, fat: 17 },
    gorillaNote: "A 5-minute high-protein lunch when the fridge is nearly empty.",
  },

  // ───────────────────────── DINNER ─────────────────────────
  {
    id: "baked-chicken-veg",
    title: "Sheet-Pan Chicken & Veg",
    mealType: "dinner",
    goals: ["lean", "build", "maintain"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 35,
    servings: 2,
    ingredients: [core("chicken-breast", "300 g"), core("brussels-sprouts", "2 cups"), core("sweet-potato", "1 large"), have("olive-oil", "1 tbsp"), extra("Garlic + paprika", "to taste")],
    steps: [
      "Heat oven to 200°C. Cube 1 large sweet potato (~2 cm) and halve 2 cups Brussels sprouts.",
      "Spread on a sheet pan and toss with 1 tbsp oil, garlic, paprika, salt and pepper.",
      "Nestle in 300 g chicken breast and roast 25–30 min, flipping the veg halfway, until the chicken hits 74°C and the veg caramelise. Serves 2.",
    ],
    macros: { calories: 470, protein: 44, carbs: 38, fat: 14 },
    gorillaNote: "One pan, two servings, all whole foods that score 85+.",
  },
  {
    id: "salmon-sweet-potato",
    title: "Roast Salmon & Sweet Potato",
    mealType: "dinner",
    goals: ["lean", "maintain", "build"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 30,
    servings: 1,
    ingredients: [core("salmon", "150 g"), core("sweet-potato", "1 medium"), core("broccoli", "1 cup"), have("olive-oil", "1 tsp"), extra("Lemon + pepper", "to taste")],
    steps: [
      "Heat oven to 200°C. Cube 1 medium sweet potato and roast on a lined tray ~25 min until starting to soften.",
      "Add a 150 g salmon fillet and 1 cup broccoli to the tray; drizzle with 1 tsp oil, salt and pepper.",
      "Roast another 12–15 min until the salmon flakes and the broccoli is tender.",
      "Finish with a squeeze of lemon.",
    ],
    macros: { calories: 560, protein: 40, carbs: 44, fat: 22 },
    gorillaNote: "Omega-3s plus a 90-scoring complex carb — a textbook recovery dinner.",
  },
  {
    id: "beef-veg-stirfry",
    title: "Lean Beef & Broccoli Stir-Fry",
    mealType: "dinner",
    goals: ["build", "maintain"],
    diet: ["high-protein", "dairy-free"],
    timeMin: 20,
    servings: 2,
    ingredients: [core("lean-ground-beef", "300 g"), core("broccoli", "2 cups"), core("brown-rice", "140 g dry"), have("bell-peppers", "1"), extra("Garlic + soy sauce", "to taste")],
    steps: [
      "Cook 140 g brown rice (~25 min); drain.",
      "Brown 300 g lean ground beef in a hot dry wok over high heat 5–6 min, breaking it up. Remove, leaving a little fat behind.",
      "Add 2 cups broccoli and 1 sliced bell pepper; stir-fry 3–4 min until tender-crisp.",
      "Return the beef with 2 grated garlic cloves and a splash of soy sauce; toss 1 min. Serve over rice. Serves 2.",
    ],
    macros: { calories: 560, protein: 38, carbs: 58, fat: 18 },
    gorillaNote: "Iron-rich beef and volume veg — scales up easily for a surplus.",
  },
  {
    id: "tofu-veg-curry",
    title: "Tofu & Chickpea Curry",
    mealType: "dinner",
    goals: ["maintain", "build"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 30,
    servings: 2,
    ingredients: [core("tofu", "250 g"), core("chickpeas", "1 cup"), core("spinach", "2 handfuls"), have("brown-rice", "140 g dry"), extra("Curry paste + coconut milk", "as needed")],
    steps: [
      "Cook 140 g brown rice (~25 min); drain.",
      "Press and cube 250 g tofu; sear in a little oil over medium-high 5–6 min until golden on most sides. Set aside.",
      "In the same pan, cook 1–2 tbsp curry paste 30 sec, then add 1 cup chickpeas and a tin of coconut milk. Simmer 10 min to thicken.",
      "Stir in the tofu and 2 handfuls spinach until wilted. Serve over rice. Serves 2.",
    ],
    macros: { calories: 610, protein: 28, carbs: 72, fat: 22 },
    gorillaNote: "A hearty vegan dinner with two plant proteins — filling and macro-friendly.",
  },
  {
    id: "turkey-chili",
    title: "Turkey & Black Bean Chili",
    mealType: "dinner",
    goals: ["lean", "build", "maintain"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 35,
    servings: 4,
    ingredients: [core("ground-turkey", "500 g"), core("black-beans", "2 cups"), core("bell-peppers", "2"), have("olive-oil", "1 tbsp"), extra("Onion, tomatoes, chili spices", "as needed")],
    steps: [
      "In a large pot, sauté a diced onion and 2 chopped bell peppers in 1 tbsp oil over medium, 4–5 min.",
      "Add 500 g ground turkey and brown 6–8 min, breaking it up.",
      "Stir in 2 cups black beans, a tin of chopped tomatoes and chili spices (chili powder, cumin, paprika). Simmer, partly covered, 20 min, stirring now and then. Season and serve. Makes 4.",
    ],
    macros: { calories: 380, protein: 34, carbs: 32, fat: 12 },
    gorillaNote: "Batch-cooks four servings of high-protein, high-fibre dinner.",
  },
  {
    id: "white-fish-potato",
    title: "Baked White Fish & Potatoes",
    mealType: "dinner",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 30,
    servings: 1,
    ingredients: [core("white-fish", "180 g"), core("potato", "2 small"), core("brussels-sprouts", "1 cup"), have("olive-oil", "1 tsp"), extra("Lemon + herbs", "to taste")],
    steps: [
      "Heat oven to 200°C. Quarter 2 small potatoes and halve 1 cup Brussels sprouts; toss with 1 tsp oil, salt and pepper and roast 20 min.",
      "Push the veg aside and add a 180 g white-fish fillet; top with lemon slices and herbs.",
      "Roast another 10–12 min until the fish is opaque and flakes easily.",
    ],
    macros: { calories: 440, protein: 38, carbs: 40, fat: 12 },
    gorillaNote: "Very lean protein with a comforting roast — low fat, high satiety.",
  },
  {
    id: "chicken-thigh-quinoa",
    title: "Herb Chicken Thighs & Quinoa",
    mealType: "dinner",
    goals: ["build", "maintain"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 30,
    servings: 2,
    ingredients: [core("chicken-thigh", "350 g"), core("quinoa", "120 g dry"), core("broccoli", "2 cups"), have("olive-oil", "1 tbsp"), extra("Garlic + herbs", "to taste")],
    steps: [
      "Rinse and simmer 120 g quinoa in 240 ml water ~12–15 min; fluff.",
      "Season 350 g chicken thighs with garlic, herbs, salt and pepper. Sear in a hot oven-proof pan 4–5 min, flip, then finish in a 200°C oven ~12 min until they reach 74°C.",
      "Steam 2 cups broccoli 4–5 min. Plate the thighs over quinoa with the broccoli. Serves 2.",
    ],
    macros: { calories: 560, protein: 40, carbs: 44, fat: 22 },
    gorillaNote: "Thighs bring a little more fat and flavour — great for a lean bulk.",
  },
  {
    id: "tempeh-stirfry",
    title: "Tempeh & Veg Stir-Fry",
    mealType: "dinner",
    goals: ["maintain", "build"],
    diet: ["high-protein", "vegetarian", "vegan", "dairy-free"],
    timeMin: 20,
    servings: 1,
    ingredients: [core("tempeh", "150 g"), core("bell-peppers", "1"), core("broccoli", "1 cup"), have("brown-rice", "60 g dry"), extra("Soy sauce + ginger", "to taste")],
    steps: [
      "Cook 60 g brown rice (~25 min); drain.",
      "Cube 150 g tempeh and sear in a little oil over medium-high 4–5 min until browned. Set aside.",
      "Stir-fry 1 sliced bell pepper and 1 cup broccoli over high heat 3–4 min.",
      "Return the tempeh with a splash of soy sauce and grated ginger; toss 1 min. Serve over rice.",
    ],
    macros: { calories: 520, protein: 30, carbs: 56, fat: 18 },
    gorillaNote: "Tempeh is a fermented, whole-soy protein that scores 86 — great meat swap.",
  },
  {
    id: "egg-fried-rice",
    title: "Veggie Egg Fried Rice",
    mealType: "dinner",
    goals: ["maintain"],
    diet: ["high-protein", "vegetarian", "dairy-free", "quick"],
    timeMin: 15,
    servings: 1,
    ingredients: [core("eggs", "3 whole"), core("brown-rice", "70 g dry (cooked, cooled)"), core("bell-peppers", "1"), have("spinach", "1 handful"), extra("Soy sauce + garlic", "to taste")],
    steps: [
      "Beat 3 eggs. Heat a little oil in a wok over high, scramble the eggs softly, then set aside.",
      "Add 1 diced bell pepper and a handful of spinach; stir-fry 2 min.",
      "Add 70 g cooked, cooled brown rice and a splash of soy sauce; toss 2–3 min until hot and slightly crisp (day-old rice works best).",
      "Fold the eggs back through and serve.",
    ],
    macros: { calories: 470, protein: 22, carbs: 52, fat: 18 },
    gorillaNote: "Best way to use leftover rice — day-old rice fries up better.",
  },

  // ───────────────────────── SNACK ─────────────────────────
  {
    id: "greek-yogurt-bark",
    title: "Frozen Greek Yogurt Berry Bark",
    mealType: "snack",
    goals: ["lean"],
    diet: ["high-protein", "gluten-free", "vegetarian"],
    timeMin: 5,
    servings: 2,
    ingredients: [core("greek-yogurt", "250 g"), core("berries", "80 g"), have("almonds", "small handful"), extra("Honey", "1 tsp")],
    steps: [
      "Stir 250 g Greek yogurt with 1 tsp honey, then spread ~1 cm thick on a parchment-lined tray.",
      "Scatter over 80 g berries and a small handful of chopped almonds, pressing them in lightly.",
      "Freeze at least 2 hours until solid, then break into shards. Keep frozen. Makes 2 servings.",
    ],
    macros: { calories: 150, protein: 14, carbs: 14, fat: 5 },
    gorillaNote: "A high-protein frozen treat with no added junk.",
  },
  {
    id: "apple-pb",
    title: "Apple & Peanut Butter",
    mealType: "snack",
    goals: ["maintain", "build"],
    diet: ["vegetarian", "vegan", "gluten-free", "dairy-free", "quick"],
    timeMin: 2,
    servings: 1,
    ingredients: [core("apple", "1"), core("natural-peanut-butter", "1 tbsp")],
    steps: [
      "Core and slice 1 apple into wedges.",
      "Serve with 1 tbsp natural peanut butter for dipping, or spread it on the slices.",
    ],
    macros: { calories: 200, protein: 5, carbs: 28, fat: 9 },
    gorillaNote: "The 2-minute classic — fibre + fat to hold you over.",
  },
  {
    id: "protein-smoothie",
    title: "Berry Banana Protein Smoothie",
    mealType: "snack",
    goals: ["build", "maintain"],
    diet: ["high-protein", "gluten-free", "quick"],
    timeMin: 5,
    servings: 1,
    ingredients: [core("whey-isolate", "1 scoop"), core("banana", "1"), core("berries", "80 g"), have("natural-peanut-butter", "1 tbsp"), extra("Milk of choice", "300 ml")],
    steps: [
      "Add 1 scoop whey isolate, 1 banana, 80 g berries, 1 tbsp peanut butter and 300 ml milk to a blender.",
      "Blend 30–45 sec until smooth; add a splash more milk or a few ice cubes to reach the thickness you like.",
    ],
    macros: { calories: 390, protein: 35, carbs: 42, fat: 10 },
    gorillaNote: "A fast 35 g protein hit — ideal post-workout or on a surplus.",
  },
  {
    id: "cottage-cheese-apple",
    title: "Cottage Cheese & Apple",
    mealType: "snack",
    goals: ["lean"],
    diet: ["high-protein", "gluten-free", "vegetarian", "quick"],
    timeMin: 3,
    servings: 1,
    ingredients: [core("cottage-cheese", "150 g"), core("apple", "1 diced"), have("walnuts", "small handful"), extra("Cinnamon", "pinch")],
    steps: [
      "Spoon 150 g cottage cheese into a bowl and top with 1 diced apple and a small handful of chopped walnuts.",
      "Dust with cinnamon and eat.",
    ],
    macros: { calories: 260, protein: 22, carbs: 22, fat: 9 },
    gorillaNote: "Slow-digesting casein from cottage cheese keeps you full for hours.",
  },
  {
    id: "hummus-veg",
    title: "Quick Chickpea Hummus & Veg",
    mealType: "snack",
    goals: ["lean", "maintain"],
    diet: ["gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 10,
    servings: 2,
    ingredients: [core("chickpeas", "1 cup"), core("tahini", "1 tbsp"), core("bell-peppers", "1, sliced"), extra("Lemon, garlic, olive oil", "to taste")],
    steps: [
      "Blend 1 cup drained chickpeas with 1 tbsp tahini, the juice of ½ lemon, 1 garlic clove, 1 tbsp olive oil and 2–3 tbsp water until smooth (add more water for a looser dip).",
      "Season with salt and serve with 1 sliced bell pepper for dipping. Makes 2 servings.",
    ],
    macros: { calories: 220, protein: 9, carbs: 24, fat: 11 },
    gorillaNote: "Homemade hummus skips the preservatives of most tubs.",
  },
  {
    id: "trail-mix",
    title: "DIY Gorilla Trail Mix",
    mealType: "snack",
    goals: ["build", "maintain"],
    diet: ["gluten-free", "vegetarian", "vegan", "dairy-free", "quick"],
    timeMin: 2,
    servings: 2,
    ingredients: [core("almonds", "30 g"), core("walnuts", "30 g"), have("berries", "dried, 20 g"), extra("Dark chocolate chips", "1 tbsp")],
    steps: [
      "Combine 30 g almonds, 30 g walnuts, 20 g dried berries and about 1 tbsp dark chocolate chips.",
      "Portion into two bags or jars for grab-and-go. Makes 2 servings.",
    ],
    macros: { calories: 310, protein: 9, carbs: 16, fat: 25 },
    gorillaNote: "Both nuts score 90 — energy-dense fuel for training days.",
  },

  // ───────────────────────── PASTA ─────────────────────────
  {
    id: "chicken-pesto-pasta",
    title: "Chicken Pesto Pasta",
    mealType: "dinner",
    goals: ["build", "maintain"],
    diet: ["high-protein"],
    timeMin: 25,
    servings: 2,
    ingredients: [core("chicken-breast", "250 g"), core("whole-wheat-pasta", "160 g dry"), core("cherry-tomatoes", "1 cup"), have("parmesan", "2 tbsp"), extra("Pesto", "3 tbsp")],
    steps: [
      "Cook 160 g whole-wheat pasta in salted water per the package; reserve a mug of pasta water before draining.",
      "Meanwhile slice 250 g chicken breast and pan-cook in a little oil over medium-high 5–6 min until cooked through.",
      "Off the heat, return the pasta to the pot with the chicken, 3 tbsp pesto, 1 cup halved cherry tomatoes and a splash of pasta water; toss to coat.",
      "Finish with 2 tbsp grated parmesan. Serves 2.",
    ],
    macros: { calories: 560, protein: 42, carbs: 58, fat: 16 },
    gorillaNote: "Whole-wheat pasta keeps the fibre up; chicken carries the protein.",
  },
  {
    id: "turkey-spaghetti",
    title: "Turkey Bolognese Spaghetti",
    mealType: "dinner",
    goals: ["lean", "build", "maintain"],
    diet: ["high-protein"],
    timeMin: 30,
    servings: 3,
    ingredients: [core("ground-turkey", "400 g"), core("whole-wheat-pasta", "240 g dry"), core("cherry-tomatoes", "2 cups"), have("garlic", "2 cloves"), have("red-onion", "1/2"), extra("Tomato passata + herbs", "as needed")],
    steps: [
      "Cook 240 g whole-wheat spaghetti in salted water per the package; drain.",
      "Meanwhile brown 400 g ground turkey with ½ diced red onion and 2 garlic cloves over medium-high, 6–8 min.",
      "Add 2 cups cherry tomatoes (or passata) and herbs; simmer 15 min until saucy, seasoning to taste.",
      "Serve over the spaghetti. Makes 3 servings.",
    ],
    macros: { calories: 520, protein: 38, carbs: 62, fat: 10 },
    gorillaNote: "Lean turkey bolognese — all the comfort, far less saturated fat than beef.",
  },
  {
    id: "chickpea-pasta-primavera",
    title: "Chickpea Pasta Primavera",
    mealType: "dinner",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 20,
    servings: 2,
    ingredients: [core("chickpea-pasta", "160 g dry"), core("zucchini", "1"), core("cherry-tomatoes", "1 cup"), core("bell-peppers", "1"), have("olive-oil", "1 tbsp"), have("garlic", "2 cloves")],
    steps: [
      "Cook 160 g chickpea pasta per the package (it cooks fast — don't overdo it); drain, reserving a splash of water.",
      "Heat 1 tbsp oil over medium; sauté 1 diced zucchini, 1 sliced bell pepper and 2 garlic cloves 4–5 min.",
      "Add 1 cup cherry tomatoes and cook 2–3 min until they blister and burst.",
      "Toss with the pasta and a splash of the cooking water; season. Serves 2.",
    ],
    macros: { calories: 470, protein: 25, carbs: 64, fat: 12 },
    gorillaNote: "Chickpea pasta is naturally gluten-free and nearly doubles the protein of wheat.",
  },
  {
    id: "shrimp-garlic-pasta",
    title: "Garlic Shrimp Pasta",
    mealType: "dinner",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "quick"],
    timeMin: 18,
    servings: 2,
    ingredients: [core("shrimp", "300 g"), core("whole-wheat-pasta", "160 g dry"), core("garlic", "3 cloves"), have("olive-oil", "1 tbsp"), extra("Lemon + chili flakes", "to taste")],
    steps: [
      "Cook 160 g whole-wheat pasta in salted water; reserve a splash of water before draining.",
      "Heat 1 tbsp oil over medium, cook 3 grated garlic cloves 30 sec, then add 300 g shrimp and cook 2–3 min until pink.",
      "Toss with the pasta, a squeeze of lemon, chili flakes and a splash of pasta water. Serves 2.",
    ],
    macros: { calories: 480, protein: 40, carbs: 54, fat: 10 },
    gorillaNote: "High-protein, low-fat — shrimp cooks in minutes.",
  },
  {
    id: "tomato-basil-pasta",
    title: "One-Pan Tomato Basil Pasta",
    mealType: "dinner",
    goals: ["maintain"],
    diet: ["vegetarian", "vegan", "dairy-free", "quick"],
    timeMin: 20,
    servings: 2,
    ingredients: [core("whole-wheat-pasta", "160 g dry"), core("cherry-tomatoes", "2 cups"), core("garlic", "2 cloves"), have("olive-oil", "1 tbsp"), extra("Basil", "handful")],
    steps: [
      "In a pan over medium, cook 2 cups cherry tomatoes with 2 garlic cloves and 1 tbsp oil 8–10 min, pressing until they break down into a sauce.",
      "Meanwhile cook 160 g whole-wheat pasta; reserve a splash of water, then add the pasta to the sauce with a little of the water and toss.",
      "Finish with torn basil, salt and pepper. Serves 2.",
    ],
    macros: { calories: 420, protein: 13, carbs: 72, fat: 9 },
    gorillaNote: "A pantry dinner from almost nothing — real tomatoes beat any jarred sauce.",
  },
  {
    id: "beef-bolognese",
    title: "Classic Beef Bolognese",
    mealType: "dinner",
    goals: ["build"],
    diet: ["high-protein"],
    timeMin: 35,
    servings: 3,
    ingredients: [core("lean-ground-beef", "400 g"), core("whole-wheat-pasta", "240 g dry"), core("carrots", "1, diced"), have("red-onion", "1"), have("garlic", "2 cloves"), extra("Tomato passata", "as needed")],
    steps: [
      "Cook 240 g whole-wheat pasta in salted water; drain.",
      "Brown 400 g lean ground beef with 1 diced onion, 1 grated carrot and 2 garlic cloves over medium-high, ~8 min.",
      "Add tomato passata to cover, season, and simmer 20 min, stirring occasionally, until thick.",
      "Serve over the pasta. Makes 3 servings.",
    ],
    macros: { calories: 580, protein: 38, carbs: 62, fat: 18 },
    gorillaNote: "Grating carrot into the sauce adds fibre and natural sweetness.",
  },
  {
    id: "tuna-pasta-salad",
    title: "Tuna Pasta Salad",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "quick"],
    timeMin: 15,
    servings: 2,
    ingredients: [core("canned-tuna", "1 can"), core("whole-wheat-pasta", "140 g dry"), core("peas", "1/2 cup"), have("cherry-tomatoes", "1 cup"), have("vinaigrette", "2 tbsp")],
    steps: [
      "Cook 140 g whole-wheat pasta, then rinse under cold water to cool.",
      "In a bowl, flake in 1 can of drained tuna and add ½ cup peas (thawed) and 1 cup halved cherry tomatoes.",
      "Toss with 2 tbsp vinaigrette; season. Keeps 3 days. Serves 2.",
    ],
    macros: { calories: 440, protein: 30, carbs: 56, fat: 10 },
    gorillaNote: "Great cold — batch it for grab-and-go lunches.",
  },

  // ───────────────────────── SALADS ─────────────────────────
  {
    id: "greek-salad",
    title: "Big Greek Salad",
    mealType: "lunch",
    goals: ["lean"],
    diet: ["gluten-free", "vegetarian", "quick"],
    timeMin: 10,
    servings: 2,
    ingredients: [core("cucumber", "1"), core("cherry-tomatoes", "2 cups"), core("feta", "80 g"), core("mixed-greens", "3 handfuls"), have("red-onion", "1/4"), have("vinaigrette", "2 tbsp")],
    steps: [
      "Chop 1 cucumber and halve 2 cups cherry tomatoes; thinly slice ¼ red onion.",
      "In a bowl, toss them with 3 handfuls mixed greens and 2 tbsp vinaigrette.",
      "Crumble 80 g feta over the top and season with pepper. Serves 2.",
    ],
    macros: { calories: 260, protein: 10, carbs: 16, fat: 18 },
    gorillaNote: "Loaded with produce that scores 88+ — light but satisfying.",
  },
  {
    id: "chicken-caesar-light",
    title: "Lighter Chicken Caesar",
    mealType: "lunch",
    goals: ["lean", "build"],
    diet: ["high-protein"],
    timeMin: 15,
    servings: 1,
    ingredients: [core("chicken-breast", "150 g"), core("romaine", "1 head"), have("parmesan", "2 tbsp"), have("vinaigrette", "1 tbsp"), extra("Greek-yogurt caesar dressing", "2 tbsp")],
    steps: [
      "Season 150 g chicken breast and grill or pan-cook over medium-high 5–6 min per side until cooked through; rest, then slice.",
      "Chop 1 head of romaine and toss with 2 tbsp Greek-yogurt caesar dressing (or 1 tbsp vinaigrette).",
      "Top with the sliced chicken and 2 tbsp grated parmesan.",
    ],
    macros: { calories: 360, protein: 42, carbs: 10, fat: 16 },
    gorillaNote: "Swap the creamy dressing for a Greek-yogurt caesar to keep it lean.",
  },
  {
    id: "chickpea-feta-salad",
    title: "Chickpea & Feta Salad",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "quick"],
    timeMin: 10,
    servings: 2,
    ingredients: [core("chickpeas", "1 can"), core("feta", "80 g"), core("cucumber", "1"), core("cherry-tomatoes", "1 cup"), have("vinaigrette", "2 tbsp")],
    steps: [
      "Drain and rinse 1 can of chickpeas.",
      "Dice 1 cucumber and halve 1 cup cherry tomatoes.",
      "Toss the chickpeas, cucumber and tomatoes with 2 tbsp vinaigrette and 80 g crumbled feta; season. Serves 2.",
    ],
    macros: { calories: 380, protein: 18, carbs: 36, fat: 18 },
    gorillaNote: "No-cook, high-fibre and filling — a 10-minute meal-prep staple.",
  },
  {
    id: "salmon-spinach-salad",
    title: "Salmon & Spinach Salad",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 20,
    servings: 1,
    ingredients: [core("salmon", "150 g"), core("spinach", "3 handfuls"), core("avocado", "1/2"), have("cherry-tomatoes", "1/2 cup"), have("vinaigrette", "1 tbsp")],
    steps: [
      "Season a 150 g salmon fillet and bake at 200°C 12–15 min, or pan-sear 3–4 min per side, until it flakes.",
      "Toss 3 handfuls spinach, ½ sliced avocado and ½ cup cherry tomatoes with 1 tbsp vinaigrette.",
      "Flake the salmon over the top.",
    ],
    macros: { calories: 480, protein: 36, carbs: 12, fat: 32 },
    gorillaNote: "Omega-3s plus avocado and spinach — a serious nutrient-density win.",
  },
  {
    id: "southwest-bean-salad",
    title: "Southwest Black Bean Salad",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 12,
    servings: 2,
    ingredients: [core("black-beans", "1 can"), core("corn", "1 cup"), core("bell-peppers", "1"), core("mixed-greens", "2 handfuls"), have("avocado", "1/2"), extra("Lime + cumin", "to taste")],
    steps: [
      "In a bowl, combine 1 can drained black beans, 1 cup corn and 1 diced bell pepper.",
      "Dress with the juice of 1 lime, ½ tsp cumin, a little oil and salt.",
      "Serve over 2 handfuls mixed greens with ½ sliced avocado. Serves 2.",
    ],
    macros: { calories: 420, protein: 16, carbs: 58, fat: 14 },
    gorillaNote: "A plant-powered, fibre-dense bowl that holds up for days.",
  },
  {
    id: "steak-arugula-salad",
    title: "Steak & Greens Salad",
    mealType: "dinner",
    goals: ["build", "lean"],
    diet: ["high-protein", "gluten-free"],
    timeMin: 20,
    servings: 1,
    ingredients: [core("sirloin-steak", "150 g"), core("mixed-greens", "3 handfuls"), core("cherry-tomatoes", "1 cup"), have("parmesan", "1 tbsp"), have("vinaigrette", "1 tbsp")],
    steps: [
      "Season a 150 g sirloin steak. Sear in a hot pan 2–3 min per side for medium-rare; rest 5 min, then slice thinly against the grain.",
      "Toss 3 handfuls mixed greens and 1 cup cherry tomatoes with 1 tbsp vinaigrette.",
      "Fan the steak over the top and shave over 1 tbsp parmesan.",
    ],
    macros: { calories: 420, protein: 38, carbs: 10, fat: 26 },
    gorillaNote: "Iron-rich steak over greens — high protein, low carb.",
  },
  {
    id: "edamame-crunch-salad",
    title: "Edamame Crunch Salad",
    mealType: "lunch",
    goals: ["lean"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free", "quick"],
    timeMin: 10,
    servings: 2,
    ingredients: [core("edamame", "1.5 cups"), core("cabbage", "2 cups shredded"), core("carrots", "1, grated"), have("sunflower-seeds", "2 tbsp"), have("vinaigrette", "2 tbsp")],
    steps: [
      "Shred 2 cups cabbage and grate 1 carrot.",
      "Toss with 1.5 cups shelled edamame (thawed if frozen) and 2 tbsp vinaigrette.",
      "Top with 2 tbsp sunflower seeds. Keeps well — serves 2.",
    ],
    macros: { calories: 300, protein: 18, carbs: 26, fat: 14 },
    gorillaNote: "Edamame brings complete plant protein; the slaw keeps for days.",
  },

  // ───────────────────── MORE VEGGIE / GLUTEN-FREE ─────────────────────
  {
    id: "roasted-asparagus-eggs",
    title: "Roasted Asparagus & Eggs",
    mealType: "breakfast",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "dairy-free", "quick"],
    timeMin: 15,
    servings: 1,
    ingredients: [core("asparagus", "1 bunch"), core("eggs", "3"), have("olive-oil", "1 tsp"), extra("Salt & pepper", "to taste")],
    steps: [
      "Heat oven to 200°C. Trim 1 bunch asparagus, toss with 1 tsp oil, salt and pepper, and roast 10 min until tender.",
      "Meanwhile fry or poach 3 eggs to your liking.",
      "Plate the eggs over the asparagus and season.",
    ],
    macros: { calories: 300, protein: 22, carbs: 8, fat: 20 },
    gorillaNote: "Asparagus scores 92 — a light, high-protein brunch plate.",
  },
  {
    id: "green-bean-almond-saute",
    title: "Green Bean & Almond Sauté",
    mealType: "snack",
    goals: ["lean", "maintain"],
    diet: ["gluten-free", "vegetarian", "vegan", "dairy-free", "quick"],
    timeMin: 12,
    servings: 2,
    ingredients: [core("green-beans", "400 g"), core("almonds", "30 g, slivered"), have("garlic", "2 cloves"), have("olive-oil", "1 tbsp")],
    steps: [
      "Blanch or steam 400 g green beans 4 min until bright and just tender; drain.",
      "Heat 1 tbsp oil over medium, add 2 sliced garlic cloves and the beans, and sauté 2–3 min.",
      "Toss in 30 g slivered almonds (toast them first for more flavour). Serves 2.",
    ],
    macros: { calories: 180, protein: 7, carbs: 14, fat: 12 },
    gorillaNote: "A side that actually earns its calories — fibre plus good fats.",
  },
  {
    id: "carrot-lentil-soup",
    title: "Carrot & Lentil Soup",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 35,
    servings: 3,
    ingredients: [core("carrots", "4"), core("lentils", "1.5 cups dry"), have("red-onion", "1"), have("garlic", "2 cloves"), have("olive-oil", "1 tbsp"), extra("Cumin + stock", "as needed")],
    steps: [
      "In a pot, sauté 1 diced onion, 2 garlic cloves and 4 chopped carrots in 1 tbsp oil over medium, 5 min.",
      "Add 1.5 cups rinsed dry lentils, 1 tsp cumin and enough stock to cover by ~3 cm. Simmer 25 min until the lentils are soft.",
      "Blend until smooth (an immersion blender is easiest); season. Makes 3 servings.",
    ],
    macros: { calories: 340, protein: 20, carbs: 54, fat: 5 },
    gorillaNote: "Lentils (90) and carrots (90) — a batch-cook bowl of pure nutrition.",
  },
  {
    id: "cauliflower-fried-rice",
    title: "Cauliflower Fried Rice",
    mealType: "dinner",
    goals: ["lean"],
    diet: ["high-protein", "gluten-free", "vegetarian", "quick"],
    timeMin: 15,
    servings: 2,
    ingredients: [core("cauliflower", "1/2 head, riced"), core("eggs", "3"), core("peas", "1/2 cup"), have("carrots", "1, diced"), extra("Soy sauce + garlic", "to taste")],
    steps: [
      "Pulse ½ head cauliflower in a blender or food processor into rice-sized pieces.",
      "Beat 3 eggs; scramble softly in a hot oiled wok and set aside.",
      "Add the cauliflower, 1 diced carrot and ½ cup peas; stir-fry over high 5–6 min until tender.",
      "Fold the eggs back in with a splash of soy sauce and grated garlic. Serves 2.",
    ],
    macros: { calories: 240, protein: 16, carbs: 18, fat: 11 },
    gorillaNote: "All the fried-rice feel at a fraction of the carbs.",
  },
  {
    id: "veggie-omelette",
    title: "Loaded Veggie Omelette",
    mealType: "breakfast",
    goals: ["lean", "maintain", "build"],
    diet: ["high-protein", "gluten-free", "vegetarian", "quick"],
    timeMin: 12,
    servings: 1,
    ingredients: [core("eggs", "3"), core("mushrooms", "1 cup"), core("bell-peppers", "1/2"), core("spinach", "1 handful"), have("feta", "1 tbsp"), have("olive-oil", "1 tsp")],
    steps: [
      "Heat 1 tsp oil in a non-stick pan over medium; sauté 1 cup sliced mushrooms and ½ diced bell pepper 3–4 min, then wilt in a handful of spinach.",
      "Pour over 3 beaten eggs, tilting to spread. Cook 2–3 min until almost set.",
      "Scatter 1 tbsp feta over one half, fold the omelette, and slide onto a plate.",
    ],
    macros: { calories: 320, protein: 24, carbs: 9, fat: 21 },
    gorillaNote: "Three veg and 24 g protein — the ultimate clear-out-the-fridge breakfast.",
  },
  {
    id: "zoodle-chicken",
    title: "Chicken Zucchini Noodles",
    mealType: "dinner",
    goals: ["lean"],
    diet: ["high-protein", "gluten-free", "dairy-free"],
    timeMin: 20,
    servings: 1,
    ingredients: [core("zucchini", "2, spiralized"), core("chicken-breast", "150 g"), core("cherry-tomatoes", "1 cup"), have("garlic", "2 cloves"), have("olive-oil", "1 tbsp")],
    steps: [
      "Spiralize 2 zucchini into noodles (or use a julienne peeler).",
      "Slice 150 g chicken breast and cook in 1 tbsp oil with 2 garlic cloves over medium-high 5–6 min until done.",
      "Add 1 cup cherry tomatoes and cook 2 min to soften, then add the zoodles and toss just 1–2 min so they stay firm. Season.",
    ],
    macros: { calories: 340, protein: 40, carbs: 14, fat: 14 },
    gorillaNote: "Zoodles keep it low-carb while chicken carries 40 g protein.",
  },
  {
    id: "tofu-couscous",
    title: "Tofu & Veg Couscous",
    mealType: "dinner",
    goals: ["maintain", "build"],
    diet: ["high-protein", "vegetarian", "vegan", "dairy-free"],
    timeMin: 20,
    servings: 2,
    ingredients: [core("tofu", "250 g"), core("couscous", "120 g dry"), core("zucchini", "1"), core("bell-peppers", "1"), have("olive-oil", "1 tbsp"), extra("Lemon + herbs", "to taste")],
    steps: [
      "Pour 180 ml hot stock over 120 g couscous, cover, and leave 5 min; fluff with a fork.",
      "Press and cube 250 g tofu; sear in 1 tbsp oil over medium-high 5–6 min until golden, then add 1 diced zucchini and 1 diced bell pepper and cook 4 min.",
      "Fold the couscous through with a squeeze of lemon and herbs; season. Serves 2.",
    ],
    macros: { calories: 480, protein: 24, carbs: 58, fat: 16 },
    gorillaNote: "A quick, filling veggie dinner with a plant-protein base.",
  },
  {
    id: "kale-chickpea-soup",
    title: "Kale & Chickpea Soup",
    mealType: "lunch",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 30,
    servings: 3,
    ingredients: [core("kale", "4 cups"), core("chickpeas", "2 cans"), core("carrots", "2"), have("garlic", "3 cloves"), have("olive-oil", "1 tbsp"), extra("Onion + stock", "as needed")],
    steps: [
      "In a pot, sauté 1 diced onion, 3 garlic cloves and 2 chopped carrots in 1 tbsp oil over medium, 5 min.",
      "Add 2 cans drained chickpeas and enough stock to cover; simmer 15 min.",
      "Stir in 4 cups chopped kale and cook until wilted, 2–3 min; season. Makes 3 servings.",
    ],
    macros: { calories: 360, protein: 18, carbs: 54, fat: 9 },
    gorillaNote: "Kale scores 95 — this is a fibre and antioxidant powerhouse.",
  },

  // ───────────────────── MORE BREAKFAST ─────────────────────
  {
    id: "avocado-egg-toast",
    title: "Avocado & Egg Toast",
    mealType: "breakfast",
    goals: ["maintain", "build"],
    diet: ["high-protein", "vegetarian", "quick"],
    timeMin: 10,
    servings: 1,
    ingredients: [core("avocado", "1/2"), core("eggs", "2"), core("whole-grain-bread", "2 slices"), extra("Chili flakes + lemon", "to taste")],
    steps: [
      "Toast 2 slices of whole-grain bread.",
      "Mash ½ avocado with a squeeze of lemon and a pinch of salt; spread over the toast.",
      "Fry or poach 2 eggs, set on top, and finish with chili flakes.",
    ],
    macros: { calories: 420, protein: 20, carbs: 32, fat: 24 },
    gorillaNote: "Avocado (90) plus eggs — healthy fats and protein to start the day.",
  },
  {
    id: "breakfast-burrito",
    title: "Black Bean Breakfast Burrito",
    mealType: "breakfast",
    goals: ["build", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian"],
    timeMin: 15,
    servings: 1,
    ingredients: [core("eggs", "3"), core("black-beans", "1/2 cup"), core("corn-tortillas", "2"), core("bell-peppers", "1/2"), have("avocado", "1/4"), extra("Salsa", "to taste")],
    steps: [
      "Scramble 3 eggs with ½ diced bell pepper in a little oil over medium, 2–3 min.",
      "Warm ½ cup black beans in a pan and heat 2 corn tortillas (~30 sec a side).",
      "Fill the tortillas with the eggs, beans, ¼ sliced avocado and salsa; roll up.",
    ],
    macros: { calories: 480, protein: 28, carbs: 46, fat: 20 },
    gorillaNote: "Corn tortillas keep it gluten-free; beans + eggs stack the protein.",
  },
  {
    id: "chia-pudding",
    title: "Berry Chia Pudding",
    mealType: "breakfast",
    goals: ["lean", "maintain"],
    diet: ["gluten-free", "vegetarian", "vegan", "quick"],
    timeMin: 5,
    servings: 1,
    ingredients: [core("chia-seeds", "3 tbsp"), core("berries", "80 g"), have("almonds", "small handful"), extra("Milk of choice", "200 ml")],
    steps: [
      "Stir 3 tbsp chia seeds into 200 ml milk; wait 10 min, then stir again to break up any clumps.",
      "Cover and refrigerate at least 2 hours (or overnight) until thick and set.",
      "Top with 80 g berries and a small handful of almonds.",
    ],
    macros: { calories: 300, protein: 10, carbs: 28, fat: 18 },
    gorillaNote: "Chia (90) gels into a fibre- and omega-3-rich make-ahead breakfast.",
  },
  {
    id: "shakshuka",
    title: "Simple Shakshuka",
    mealType: "breakfast",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "dairy-free"],
    timeMin: 25,
    servings: 2,
    ingredients: [core("eggs", "4"), core("cherry-tomatoes", "3 cups"), core("bell-peppers", "1"), have("garlic", "2 cloves"), have("red-onion", "1/2"), have("olive-oil", "1 tbsp"), extra("Paprika + cumin", "to taste")],
    steps: [
      "Heat 1 tbsp oil in a pan over medium; sauté ½ diced red onion, 1 chopped bell pepper and 2 garlic cloves 4–5 min.",
      "Add 3 cups cherry tomatoes with paprika and cumin; simmer 10 min, pressing the tomatoes until they break into a sauce.",
      "Make 4 wells and crack an egg into each. Cover and cook 5–7 min until the whites set but the yolks stay soft. Serves 2.",
    ],
    macros: { calories: 290, protein: 18, carbs: 18, fat: 16 },
    gorillaNote: "A one-pan, veg-forward brunch — poach the eggs right in the sauce.",
  },

  // ───────────────────── MORE SNACKS ─────────────────────
  {
    id: "eggs-and-fruit",
    title: "Hard-Boiled Eggs & Fruit",
    mealType: "snack",
    goals: ["lean", "build", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "dairy-free", "quick"],
    timeMin: 2,
    servings: 1,
    ingredients: [core("eggs", "2 boiled"), core("apple", "1")],
    steps: [
      "Peel 2 pre-boiled eggs (boil 9 min for firm yolks if you need to cook them).",
      "Slice 1 apple and serve alongside; season the eggs with a little salt.",
    ],
    macros: { calories: 220, protein: 13, carbs: 22, fat: 10 },
    gorillaNote: "The ultimate no-prep snack — protein, fibre, zero packaging.",
  },
  {
    id: "roasted-chickpeas",
    title: "Crispy Roasted Chickpeas",
    mealType: "snack",
    goals: ["lean", "maintain"],
    diet: ["high-protein", "gluten-free", "vegetarian", "vegan", "dairy-free"],
    timeMin: 30,
    servings: 2,
    ingredients: [core("chickpeas", "1 can"), have("olive-oil", "1 tbsp"), extra("Paprika + salt", "to taste")],
    steps: [
      "Heat oven to 200°C. Drain, rinse and pat 1 can of chickpeas very dry — the drier they are, the crispier they get.",
      "Toss with 1 tbsp oil, paprika and salt.",
      "Spread on a tray and roast 25–30 min, shaking halfway, until deep golden and crunchy. Serves 2.",
    ],
    macros: { calories: 190, protein: 9, carbs: 24, fat: 7 },
    gorillaNote: "A crunchy, fibre-packed swap for chips (88 vs a bag of nothing).",
  },
  {
    id: "tuna-cucumber-bites",
    title: "Tuna Cucumber Bites",
    mealType: "snack",
    goals: ["lean"],
    diet: ["high-protein", "gluten-free", "dairy-free", "quick"],
    timeMin: 8,
    servings: 1,
    ingredients: [core("canned-tuna", "1 can"), core("cucumber", "1"), have("avocado", "1/4"), extra("Lemon + pepper", "to taste")],
    steps: [
      "Slice 1 cucumber into thick rounds.",
      "Drain 1 can of tuna and mash with ¼ avocado, a squeeze of lemon and a little pepper.",
      "Spoon the tuna onto the cucumber rounds.",
    ],
    macros: { calories: 240, protein: 28, carbs: 8, fat: 10 },
    gorillaNote: "28 g protein, barely any carbs — a cracker-free high-protein snack.",
  },
  {
    id: "yogurt-seed-bowl",
    title: "Greek Yogurt & Seed Bowl",
    mealType: "snack",
    goals: ["lean", "build"],
    diet: ["high-protein", "gluten-free", "vegetarian", "quick"],
    timeMin: 3,
    servings: 1,
    ingredients: [core("greek-yogurt", "200 g"), core("berries", "60 g"), core("pumpkin-seeds", "2 tbsp"), have("chia-seeds", "1 tsp")],
    steps: [
      "Spoon 200 g Greek yogurt into a bowl.",
      "Top with 60 g berries, 2 tbsp pumpkin seeds and 1 tsp chia seeds.",
    ],
    macros: { calories: 280, protein: 26, carbs: 20, fat: 11 },
    gorillaNote: "26 g protein from yogurt and seeds — keeps you full between meals.",
  },

  // ───────────────── TREATS / CHEAT MEALS (honestly scored) ─────────────────
  {
    id: "homemade-cheeseburger",
    title: "Homemade Cheeseburger",
    mealType: "dinner",
    goals: ["build", "maintain"],
    diet: ["high-protein", "treat"],
    timeMin: 20,
    servings: 1,
    ingredients: [core("lean-ground-beef", "150 g"), core("burger-bun", "1"), core("cheddar", "1 slice"), have("romaine", "2 leaves"), have("cherry-tomatoes", "2, sliced")],
    steps: [
      "Form 150 g lean ground beef into a patty, season both sides, and sear in a hot pan 3–4 min per side.",
      "Lay a slice of cheddar on top for the last minute to melt (cover the pan to speed it up).",
      "Toast the bun and build with 2 lettuce leaves and sliced tomato.",
    ],
    macros: { calories: 620, protein: 38, carbs: 34, fat: 36 },
    gorillaNote: "A real burger — not health food, but homemade beats the drive-thru. Scores honestly: it's a treat, not a daily driver.",
  },
  {
    id: "chicken-burger",
    title: "Grilled Chicken Burger",
    mealType: "dinner",
    goals: ["lean", "build", "maintain"],
    diet: ["high-protein", "treat"],
    timeMin: 20,
    servings: 1,
    ingredients: [core("ground-chicken", "150 g"), core("burger-bun", "1"), have("romaine", "2 leaves"), have("cherry-tomatoes", "2, sliced"), have("avocado", "1/4")],
    steps: [
      "Form 150 g ground chicken into a patty, season, and cook in a little oil over medium 5–6 min per side until cooked through (no pink).",
      "Toast the bun.",
      "Build with 2 lettuce leaves, sliced tomato and ¼ sliced avocado.",
    ],
    macros: { calories: 480, protein: 40, carbs: 34, fat: 18 },
    gorillaNote: "The leaner burger — swap beef for chicken and it scores noticeably higher. Same craving, better numbers.",
  },
  {
    id: "beef-tacos",
    title: "Beef Tacos",
    mealType: "dinner",
    goals: ["build", "maintain"],
    diet: ["high-protein", "gluten-free", "treat"],
    timeMin: 20,
    servings: 2,
    ingredients: [core("lean-ground-beef", "300 g"), core("corn-tortillas", "6"), core("cheddar", "1/2 cup"), have("mixed-greens", "shredded"), extra("Salsa + spices", "to taste")],
    steps: [
      "Brown 300 g lean ground beef over medium-high 6–8 min, breaking it up, with taco spices (chili powder, cumin, paprika, salt).",
      "Warm 6 corn tortillas (~30 sec a side in a dry pan).",
      "Fill with the beef, ½ cup cheddar, shredded greens and salsa. Makes 2 servings.",
    ],
    macros: { calories: 540, protein: 34, carbs: 38, fat: 26 },
    gorillaNote: "Corn tortillas keep it gluten-free; load the greens to balance the cheese.",
  },
  {
    id: "chicken-quesadilla",
    title: "Chicken Quesadilla",
    mealType: "dinner",
    goals: ["maintain", "build"],
    diet: ["high-protein", "gluten-free", "treat"],
    timeMin: 15,
    servings: 1,
    ingredients: [core("chicken-breast", "120 g"), core("corn-tortillas", "2"), core("cheddar", "1/3 cup"), have("bell-peppers", "1/2"), extra("Salsa", "to serve")],
    steps: [
      "Cook 120 g chicken breast with ½ diced bell pepper, then shred or chop.",
      "Lay the chicken and ⅓ cup cheddar between 2 corn tortillas.",
      "Toast in a dry pan over medium 2–3 min per side until crisp and the cheese melts; cut into wedges and serve with salsa.",
    ],
    macros: { calories: 460, protein: 34, carbs: 30, fat: 22 },
    gorillaNote: "Cheesy and quick — the chicken keeps the protein respectable.",
  },
  {
    id: "loaded-nachos",
    title: "Loaded Bean Nachos",
    mealType: "snack",
    goals: ["maintain"],
    diet: ["vegetarian", "gluten-free", "treat"],
    timeMin: 15,
    servings: 2,
    ingredients: [core("tortilla-chips", "1 big handful each"), core("black-beans", "1 cup"), core("cheddar", "1/2 cup"), have("bell-peppers", "1"), have("avocado", "1/2"), extra("Salsa + jalapeño", "to taste")],
    steps: [
      "Heat oven to 200°C. Spread a big handful of tortilla chips per person on a tray.",
      "Scatter over 1 cup black beans, 1 diced bell pepper and ½ cup cheddar.",
      "Bake 8 min until the cheese melts, then finish with ½ sliced avocado, salsa and jalapeño. Serves 2.",
    ],
    macros: { calories: 520, protein: 18, carbs: 52, fat: 26 },
    gorillaNote: "A sharing snack for the game — beans add fibre and protein the chips don't.",
  },
  {
    id: "protein-mac-cheese",
    title: "Protein Mac & Cheese",
    mealType: "dinner",
    goals: ["build", "maintain"],
    diet: ["high-protein", "vegetarian", "treat"],
    timeMin: 20,
    servings: 2,
    ingredients: [core("whole-wheat-pasta", "160 g dry"), core("cheddar", "1 cup"), core("greek-yogurt", "1/2 cup"), extra("Milk + mustard", "as needed")],
    steps: [
      "Cook 160 g whole-wheat pasta in salted water; drain, reserving a splash of water.",
      "In the pot over low heat, melt 1 cup cheddar with a splash of milk, ½ cup Greek yogurt and a little mustard, stirring until smooth (loosen with pasta water).",
      "Fold the pasta through the sauce and serve. Serves 2.",
    ],
    macros: { calories: 560, protein: 30, carbs: 62, fat: 22 },
    gorillaNote: "Greek yogurt sneaks protein into the sauce — comfort food with a little backbone.",
  },
  {
    id: "blt",
    title: "BLT Sandwich",
    mealType: "lunch",
    goals: ["maintain"],
    diet: ["high-protein", "treat"],
    timeMin: 12,
    servings: 1,
    ingredients: [core("bacon", "3 strips"), core("whole-grain-bread", "2 slices"), core("romaine", "2 leaves"), core("cherry-tomatoes", "3, sliced")],
    steps: [
      "Cook 3 strips of bacon in a pan over medium until crisp, 5–6 min; drain on paper towel.",
      "Toast 2 slices of whole-grain bread.",
      "Stack the bacon, 2 lettuce leaves and 3 sliced cherry tomatoes between the toast (a little mustard or light mayo optional).",
    ],
    macros: { calories: 420, protein: 20, carbs: 30, fat: 24 },
    gorillaNote: "Whole-grain bread and real veg lift a classic — still a treat, but not a write-off.",
  },
  {
    id: "dark-chocolate-almonds",
    title: "Dark Chocolate & Almonds",
    mealType: "snack",
    goals: ["lean", "maintain"],
    diet: ["gluten-free", "vegetarian", "treat", "quick"],
    timeMin: 1,
    servings: 1,
    ingredients: [core("dark-chocolate", "2 squares"), core("almonds", "small handful")],
    steps: [
      "Pair 2 squares of 70%+ dark chocolate with a small handful of almonds — the smarter way to settle a chocolate craving.",
    ],
    macros: { calories: 220, protein: 6, carbs: 16, fat: 16 },
    gorillaNote: "The smart cheat snack — real cocoa and almonds beat a candy bar, and it scores better than you'd think.",
  },
];

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Gorilla Meal Score (0-100) — a transparent estimate of how healthy the whole
 * meal is, in the same 0-100 language as a product's Gorilla score. It is NOT the
 * scanner's scoring (that's product-level and lives in scan/lib/scoring.ts); this
 * is a meal-level blend:
 *
 *   75% ingredient quality — the weighted average of each ingredient's Gorilla
 *       score (from the pantry A-list), with the recipe's defining `core`
 *       ingredients counting double. Whole, high-scoring foods pull it up; refined
 *       or fried components (lower scores) pull it down.
 *   25% protein balance — grams of protein per 100 kcal, mapped 2g→0 … 10g→100,
 *       so lean, protein-dense meals rate higher than empty-calorie ones.
 *
 * This is why a turkey burger with potatoes and broccoli (lean + whole foods)
 * scores far above a burger, fries and a side salad (refined bun + fried potato),
 * even though both are "a burger and sides".
 */
export function mealScore(r: Recipe): number {
  let weighted = 0;
  let weight = 0;
  for (const ing of r.ingredients) {
    if (!ing.pantryId) continue; // skip seasonings / sauces with no scored staple
    const s = PANTRY_BY_ID[ing.pantryId]?.scoreHint;
    if (s == null) continue;
    const w = ing.core ? 2 : 1;
    weighted += s * w;
    weight += w;
  }
  const quality = weight ? weighted / weight : 60;

  const proteinPer100kcal = r.macros.calories > 0 ? (r.macros.protein / r.macros.calories) * 100 : 0;
  const proteinBalance = clamp(((proteinPer100kcal - 2) / (10 - 2)) * 100, 0, 100);

  return Math.round(clamp(0.75 * quality + 0.25 * proteinBalance, 0, 100));
}

export type RecipeFilters = {
  mealType?: RecipeMealType | null;
  goal?: RecipeGoal | null;
  diet?: RecipeDiet | null;
};

export type RecipeMatch = {
  recipe: Recipe;
  /** Core ingredients the user has. */
  matched: RecipeIngredient[];
  /** Core ingredients the user is missing. */
  missing: RecipeIngredient[];
  /** matched / total core ingredients, 0–1. */
  ratio: number;
  /** Gorilla Meal Score (0-100). */
  score: number;
};

/**
 * Rank recipes by how many of their CORE ingredients the user has. Pure, no I/O,
 * no AI — runs client-side at zero cost. `haveIds` is the set of selected pantry
 * ids. With an empty selection, returns all recipes (ratio 0) so the page can
 * still browse. Optional filters narrow by meal type / goal / diet first.
 */
export function matchRecipes(haveIds: Set<string>, filters: RecipeFilters = {}): RecipeMatch[] {
  const pool = RECIPES.filter((r) => {
    if (filters.mealType && r.mealType !== filters.mealType) return false;
    if (filters.goal && !r.goals.includes(filters.goal)) return false;
    if (filters.diet && !r.diet.includes(filters.diet)) return false;
    return true;
  });

  return pool
    .map((recipe) => {
      const coreIngredients = recipe.ingredients.filter((i) => i.core && i.pantryId);
      const matched = coreIngredients.filter((i) => haveIds.has(i.pantryId!));
      const missing = coreIngredients.filter((i) => !haveIds.has(i.pantryId!));
      const ratio = coreIngredients.length ? matched.length / coreIngredients.length : 0;
      return { recipe, matched, missing, ratio, score: mealScore(recipe) };
    })
    .sort(
      (a, b) =>
        b.ratio - a.ratio ||
        b.score - a.score ||
        a.missing.length - b.missing.length ||
        a.recipe.timeMin - b.recipe.timeMin ||
        a.recipe.title.localeCompare(b.recipe.title)
    );
}
