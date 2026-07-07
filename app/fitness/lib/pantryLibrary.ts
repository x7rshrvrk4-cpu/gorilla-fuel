// Pantry library — the verified "A-list" whole foods the fitness plans compose
// from. Plans reference these by `id` (see plans.ts `mealAnchors`), so each food
// is defined exactly once here.
//
// - barcode: a real EAN for a /scan?b=<barcode> deep-link to the live score, or
//   null for a generic staple (e.g. "chicken breast" isn't one SKU). Generic
//   items fall back to `scoreHint` for display.
// - scoreHint: the approximate Gorilla score from the cross-reference, shown as a
//   display fallback when there's no scannable barcode. NOT authoritative.
// - affiliate: "grocery" = fresh/perishable, no buy link; "amazon" = shippable
//   shelf-stable item that gets a tagged Amazon link (via app/lib/affiliates).
//
// Data only. No UI, no React.

export type PantryCategory = "protein" | "carb" | "fat" | "produce" | "supplement";
export type PantryAffiliate = "amazon" | "grocery";

export type PantryItem = {
  id: string;
  name: string;
  /** Real EAN for a /scan?b= deep-link, or null for a generic staple. */
  barcode: string | null;
  /** Approximate Gorilla score for display fallback (not authoritative). */
  scoreHint: number | null;
  affiliate: PantryAffiliate;
  category: PantryCategory;
};

export const PANTRY: PantryItem[] = [
  // ── Proteins ────────────────────────────────────────────────────────────────
  { id: "chicken-breast",   name: "Chicken Breast",        barcode: null, scoreHint: 88, affiliate: "grocery", category: "protein" },
  { id: "chicken-thigh",    name: "Chicken Thigh",         barcode: null, scoreHint: 82, affiliate: "grocery", category: "protein" },
  { id: "ground-turkey",    name: "Lean Ground Turkey",    barcode: null, scoreHint: 84, affiliate: "grocery", category: "protein" },
  { id: "lean-ground-beef", name: "Lean Ground Beef",      barcode: null, scoreHint: 78, affiliate: "grocery", category: "protein" },
  { id: "salmon",           name: "Salmon",                barcode: null, scoreHint: 90, affiliate: "grocery", category: "protein" },
  { id: "white-fish",       name: "White Fish (Cod/Tilapia)", barcode: null, scoreHint: 88, affiliate: "grocery", category: "protein" },
  { id: "shrimp",           name: "Shrimp",                barcode: null, scoreHint: 86, affiliate: "grocery", category: "protein" },
  { id: "eggs",             name: "Eggs",                  barcode: null, scoreHint: 85, affiliate: "grocery", category: "protein" },
  { id: "canned-tuna",      name: "Canned Tuna (in water)", barcode: null, scoreHint: 84, affiliate: "amazon",  category: "protein" },
  { id: "greek-yogurt",     name: "Plain Greek Yogurt",    barcode: null, scoreHint: 88, affiliate: "grocery", category: "protein" },
  { id: "cottage-cheese",   name: "Cottage Cheese",        barcode: null, scoreHint: 82, affiliate: "grocery", category: "protein" },
  { id: "tofu",             name: "Tofu",                  barcode: null, scoreHint: 85, affiliate: "grocery", category: "protein" },
  { id: "tempeh",           name: "Tempeh",                barcode: null, scoreHint: 86, affiliate: "grocery", category: "protein" },
  { id: "black-beans",      name: "Black Beans",           barcode: null, scoreHint: 88, affiliate: "amazon",  category: "protein" },
  { id: "chickpeas",        name: "Chickpeas",             barcode: null, scoreHint: 88, affiliate: "amazon",  category: "protein" },
  { id: "lentils",          name: "Lentils",               barcode: null, scoreHint: 90, affiliate: "amazon",  category: "protein" },

  // ── Carbs ──────────────────────────────────────────────────────────────────
  { id: "rolled-oats",       name: "Rolled Oats",          barcode: null, scoreHint: 88, affiliate: "amazon",  category: "carb" },
  { id: "brown-rice",        name: "Brown Rice",           barcode: null, scoreHint: 82, affiliate: "amazon",  category: "carb" },
  { id: "quinoa",            name: "Quinoa",               barcode: null, scoreHint: 88, affiliate: "amazon",  category: "carb" },
  { id: "sweet-potato",      name: "Sweet Potato",         barcode: null, scoreHint: 90, affiliate: "grocery", category: "carb" },
  { id: "potato",            name: "Potato",               barcode: null, scoreHint: 84, affiliate: "grocery", category: "carb" },
  { id: "whole-grain-bread", name: "Whole-Grain Bread",    barcode: null, scoreHint: 72, affiliate: "grocery", category: "carb" },

  // ── Fats ───────────────────────────────────────────────────────────────────
  { id: "olive-oil",             name: "Extra-Virgin Olive Oil", barcode: null, scoreHint: 85, affiliate: "amazon",  category: "fat" },
  { id: "avocado",               name: "Avocado",                barcode: null, scoreHint: 90, affiliate: "grocery", category: "fat" },
  { id: "almonds",               name: "Almonds",                barcode: null, scoreHint: 90, affiliate: "amazon",  category: "fat" },
  { id: "walnuts",               name: "Walnuts",                barcode: null, scoreHint: 90, affiliate: "amazon",  category: "fat" },
  { id: "natural-peanut-butter", name: "Natural Peanut Butter",  barcode: null, scoreHint: 82, affiliate: "amazon",  category: "fat" },
  { id: "chia-seeds",            name: "Chia Seeds",             barcode: null, scoreHint: 90, affiliate: "amazon",  category: "fat" },
  { id: "tahini",                name: "Tahini",                 barcode: null, scoreHint: 84, affiliate: "amazon",  category: "fat" },

  // ── Produce ────────────────────────────────────────────────────────────────
  { id: "spinach",          name: "Spinach",              barcode: null, scoreHint: 95, affiliate: "grocery", category: "produce" },
  { id: "broccoli",         name: "Broccoli",             barcode: null, scoreHint: 95, affiliate: "grocery", category: "produce" },
  { id: "berries",          name: "Mixed Berries",        barcode: null, scoreHint: 92, affiliate: "grocery", category: "produce" },
  { id: "banana",           name: "Banana",               barcode: null, scoreHint: 88, affiliate: "grocery", category: "produce" },
  { id: "apple",            name: "Apple",                barcode: null, scoreHint: 90, affiliate: "grocery", category: "produce" },
  { id: "bell-peppers",     name: "Bell Peppers",         barcode: null, scoreHint: 92, affiliate: "grocery", category: "produce" },
  { id: "brussels-sprouts", name: "Brussels Sprouts",     barcode: null, scoreHint: 92, affiliate: "grocery", category: "produce" },

  // ── Supplement anchor ──────────────────────────────────────────────────────
  { id: "whey-isolate",     name: "Whey Protein Isolate", barcode: null, scoreHint: 82, affiliate: "amazon",  category: "supplement" },
];

/** Fast id → PantryItem lookup for the plan-composition layer and UI. */
export const PANTRY_BY_ID: Record<string, PantryItem> = Object.fromEntries(
  PANTRY.map((p) => [p.id, p])
);

/** All valid pantry ids — used to validate that plans reference real foods. */
export const PANTRY_IDS: ReadonlySet<string> = new Set(PANTRY.map((p) => p.id));
