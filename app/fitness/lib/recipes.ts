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
  | "quick"; // <= 15 min

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
    steps: ["Stir oats, yogurt, chia and milk in a jar.", "Fold in berries and a drizzle of honey.", "Cover and refrigerate overnight (or 4h+).", "Eat cold."],
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
    steps: ["Heat oil, soften peppers 2–3 min.", "Add spinach until wilted.", "Pour in beaten eggs, scramble to set.", "Season and serve."],
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
    steps: ["Blend banana, oats and eggs to a batter.", "Cook small pancakes 2 min/side on a non-stick pan.", "Top with berries and cinnamon."],
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
    steps: ["Simmer oats in milk/water 5 min.", "Stir through peanut butter and chia.", "Top with sliced banana."],
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
    steps: ["Spoon cottage cheese into a bowl.", "Top with berries, walnuts and chia.", "Done."],
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
    steps: ["Crumble tofu into hot oiled pan.", "Add peppers, cook 3 min.", "Stir in spinach and turmeric until wilted."],
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
    steps: ["Cook rice.", "Pan-sear seasoned chicken until 74°C, slice.", "Steam broccoli.", "Combine, drizzle oil and soy/garlic."],
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
    steps: ["Cook quinoa, cool slightly.", "Flake tuna over spinach and quinoa.", "Add avocado, dress with oil and lemon."],
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
    steps: ["Cook quinoa.", "Toss chickpeas, peppers and spinach.", "Whisk tahini with lemon, garlic and water.", "Combine and drizzle."],
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
    steps: ["Roast or pan-cook sweet potato cubes.", "Brown turkey with spices.", "Fold in spinach and sweet potato."],
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
    steps: ["Cook quinoa; steam broccoli.", "Bake salmon 12–15 min at 200°C with lemon.", "Plate together."],
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
    steps: ["Cook rice.", "Warm beans with cumin and peppers.", "Serve over rice with avocado and lime."],
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
    steps: ["Cook rice.", "Stir-fry veg 3 min in hot oil.", "Add shrimp and garlic, cook 3 min until pink.", "Finish with soy sauce over rice."],
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
    steps: ["Sauté onion, garlic, peppers.", "Add lentils and stock, simmer 25 min.", "Stir in spinach to wilt.", "Season and serve."],
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
    steps: ["Toast bread.", "Mash avocado with lemon over toast.", "Top with flaked tuna and chili flakes."],
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
    steps: ["Cube sweet potato and halve sprouts.", "Toss with oil and spices on a sheet pan.", "Add chicken, roast 25–30 min at 200°C."],
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
    steps: ["Roast sweet potato 25 min.", "Add salmon and broccoli for last 12–15 min.", "Finish with lemon."],
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
    steps: ["Cook rice.", "Brown beef, remove.", "Stir-fry veg, return beef with garlic + soy.", "Serve over rice."],
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
    steps: ["Cook rice.", "Sear cubed tofu.", "Simmer chickpeas + curry paste + coconut milk 10 min.", "Add tofu and spinach, serve over rice."],
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
    steps: ["Sauté onion and peppers.", "Brown turkey.", "Add beans, tomatoes and spices, simmer 20 min."],
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
    steps: ["Roast quartered potatoes and sprouts 20 min.", "Add fish for final 10–12 min with lemon and herbs."],
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
    steps: ["Cook quinoa.", "Pan-roast seasoned thighs until cooked through.", "Steam broccoli, plate together."],
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
    steps: ["Cook rice.", "Cube and sear tempeh.", "Stir-fry veg, add tempeh with soy + ginger.", "Serve over rice."],
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
    steps: ["Scramble eggs, set aside.", "Stir-fry peppers and spinach.", "Add cold rice and soy, toss.", "Fold eggs back in."],
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
    steps: ["Spread sweetened yogurt on a lined tray.", "Scatter berries and chopped almonds.", "Freeze 2h, break into shards."],
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
    steps: ["Slice apple.", "Dip or spread with peanut butter."],
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
    steps: ["Add everything to a blender.", "Blend until smooth."],
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
    steps: ["Top cottage cheese with diced apple and walnuts.", "Dust with cinnamon."],
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
    steps: ["Blend chickpeas, tahini, lemon, garlic and a splash of water.", "Serve with sliced peppers."],
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
    steps: ["Combine nuts, dried berries and a few chocolate chips.", "Portion into bags."],
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
    steps: ["Cook pasta; reserve a splash of water.", "Pan-cook sliced chicken.", "Toss pasta, chicken, pesto, halved tomatoes and pasta water.", "Finish with parmesan."],
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
    steps: ["Cook spaghetti.", "Brown turkey with onion and garlic.", "Add tomatoes/passata, simmer 15 min.", "Serve over spaghetti."],
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
    steps: ["Cook chickpea pasta.", "Sauté zucchini, peppers and garlic in oil.", "Add tomatoes to blister.", "Toss with pasta."],
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
    steps: ["Cook pasta.", "Sauté garlic in oil, add shrimp 3 min.", "Toss with pasta, lemon and chili flakes."],
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
    steps: ["Simmer tomatoes, garlic and oil until saucy.", "Cook pasta, add to the pan with a splash of water.", "Finish with torn basil."],
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
    steps: ["Cook pasta.", "Brown beef with onion, carrot and garlic.", "Add passata, simmer 20 min.", "Serve over pasta."],
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
    steps: ["Cook and cool pasta.", "Flake in tuna, add peas and tomatoes.", "Toss with vinaigrette."],
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
    steps: ["Chop cucumber, tomatoes and onion.", "Toss with greens and vinaigrette.", "Crumble feta over the top."],
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
    steps: ["Grill and slice chicken.", "Chop romaine, toss with a yogurt-based caesar.", "Top with chicken and parmesan."],
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
    steps: ["Drain chickpeas.", "Dice cucumber and tomatoes.", "Toss everything with vinaigrette and crumbled feta."],
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
    steps: ["Bake or pan-sear salmon.", "Toss spinach, avocado and tomatoes with vinaigrette.", "Flake salmon on top."],
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
    steps: ["Combine beans, corn and diced peppers.", "Dress with lime, cumin and a little oil.", "Serve over greens with avocado."],
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
    steps: ["Sear steak to your liking, rest, slice.", "Toss greens and tomatoes with vinaigrette.", "Fan steak over top, shave parmesan."],
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
    steps: ["Shred cabbage and carrots.", "Toss with shelled edamame and vinaigrette.", "Top with sunflower seeds."],
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
    steps: ["Roast asparagus 10 min at 200°C.", "Fry or poach eggs.", "Plate eggs over asparagus."],
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
    steps: ["Blanch or steam green beans 4 min.", "Sauté with garlic in oil.", "Toss in toasted almonds."],
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
    steps: ["Sauté onion, garlic and carrots.", "Add lentils, cumin and stock, simmer 25 min.", "Blend until smooth."],
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
    steps: ["Rice the cauliflower in a blender.", "Scramble eggs, set aside.", "Stir-fry cauliflower, carrots and peas.", "Fold eggs back in with soy sauce."],
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
    steps: ["Sauté mushrooms, peppers and spinach.", "Pour over beaten eggs, cook until set.", "Fold with a little feta."],
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
    steps: ["Spiralize zucchini into noodles.", "Cook sliced chicken with garlic.", "Add tomatoes to soften, toss zoodles 2 min."],
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
    steps: ["Hydrate couscous in hot stock.", "Sear cubed tofu; sauté zucchini and peppers.", "Fold everything together with lemon."],
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
    steps: ["Sauté onion, garlic and carrots.", "Add chickpeas and stock, simmer 15 min.", "Stir in kale until wilted."],
    macros: { calories: 360, protein: 18, carbs: 54, fat: 9 },
    gorillaNote: "Kale scores 95 — this is a fibre and antioxidant powerhouse.",
  },
];

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

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
      return { recipe, matched, missing, ratio };
    })
    .sort(
      (a, b) =>
        b.ratio - a.ratio ||
        a.missing.length - b.missing.length ||
        a.recipe.timeMin - b.recipe.timeMin ||
        a.recipe.title.localeCompare(b.recipe.title)
    );
}
