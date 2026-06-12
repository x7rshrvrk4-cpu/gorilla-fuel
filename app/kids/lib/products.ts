/**
 * Kids section — manually curated snack guide for Canadian parents.
 * Three tiers: Kids Approved, Cheat List, and Stay Away.
 *
 * KIDS SCORING IS STRICTER THAN ADULT SCORING. Recalibration rules:
 *  - Agave nectar / brown rice syrup / honey as a primary binder caps at 65
 *    (still added sugar regardless of natural origin) — this is why MadeGood
 *    was recalibrated 72 → 65 and moved to the Cheat List.
 *  - Tapioca starch as primary ingredient caps at 45.
 *  - Sunflower/avocado/olive oil sourcing scores better than canola/vegetable oil.
 *  - Organic certification: +3.
 *  - Single whole-food-ingredient products (just apples, just almonds): 85 minimum.
 *
 * Badge accuracy notes:
 * - SCHOOL SAFE = nut free and free from priority Canadian allergens. Withheld
 *   from any product containing tree nuts or peanuts.
 * - TODDLER FRIENDLY = suitable under 3; never applied to choking-hazard
 *   textures (whole nuts/seeds, hard crunchy items).
 * - Allergen booleans are ingredient-based best effort; Canadian rules treat
 *   coconut as NOT a priority tree-nut allergen. Highly refined soybean oil is
 *   not flagged. Gluten-free is marked conservatively (certified or inherently
 *   GF only — e.g. Quaker plain rice cakes are NOT marked GF because Quaker
 *   warns of barley cross-contact).
 * - ARTIFICIAL COLOURS dyes are still PERMITTED in Canada — Health Canada has
 *   begun the process of banning Red 40. Never say "banned in Canada."
 */

export type KidsTier = "approved" | "cheat" | "stay-away";

export type KidsProduct = {
  id: string;
  name: string;
  calories?: number;
  carbs?: number;
  sugar?: number;
  protein?: number;
  score: number;
  grade?: string;
  schoolSafe?: boolean;
  canadian?: boolean;
  nutFree?: boolean;
  dairyFree?: boolean;
  glutenFree?: boolean;
  eggFree?: boolean;
  soyFree?: boolean;
  /** Suitable for children under 3 — soft textures only, no choking hazards. */
  toddlerFriendly?: boolean;
  artificialColours?: boolean;
  blurb: string;
  betterAlternative?: string;
  amazonQuery?: string;
};

export const AFFILIATE_TAG = "gorillafuel-20";

export function amazonUrl(query: string): string {
  return `https://www.amazon.ca/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

// Shorthand for fully allergen-friendly products
const ALL_FREE = { nutFree: true, dairyFree: true, glutenFree: true, eggFree: true, soyFree: true };

export const KIDS_APPROVED: KidsProduct[] = [
  {
    id: "fd-strawberries",
    name: "Freeze Dried Strawberries",
    calories: 35, carbs: 8, sugar: 5, protein: 1,
    score: 90, grade: "S",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Strawberries. One ingredient. All natural sugar from whole fruit. The crunch kids love with zero processing beyond drying.",
    amazonQuery: "freeze dried strawberries",
  },
  {
    id: "chomps-mini-beef",
    name: "Chomps Mini Beef Sticks",
    calories: 50, carbs: 0, sugar: 0, protein: 5,
    score: 88,
    schoolSafe: true, ...ALL_FREE,
    blurb: "Grass fed beef, zero sugar, zero artificial anything. The cleanest protein snack in a lunchbox.",
    amazonQuery: "Chomps Mini Beef Sticks",
  },
  {
    id: "fd-mango",
    name: "Freeze Dried Mango",
    calories: 35, carbs: 9, sugar: 7, protein: 0,
    score: 88, grade: "A+",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Mango. One ingredient.",
    amazonQuery: "freeze dried mango",
  },
  {
    id: "pumpkin-seeds-kids",
    name: "Pumpkin Seeds (Unsalted)",
    calories: 170, carbs: 4, sugar: 0, protein: 9,
    score: 88,
    schoolSafe: true, ...ALL_FREE,
    blurb: "One ingredient. Nine grams of protein. Nut free and allergy friendly.",
    amazonQuery: "pumpkin seeds unsalted",
  },
  {
    id: "seasnax-seaweed",
    name: "SeaSnax Organic Roasted Seaweed",
    calories: 30, carbs: 1, sugar: 0, protein: 1,
    score: 88, grade: "A+",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Organic seaweed, organic extra virgin olive oil, sea salt. Uses olive oil — not canola. Loaded with natural iodine and minerals. The premium seaweed pick for kids.",
    amazonQuery: "SeaSnax organic roasted seaweed",
  },
  {
    id: "gimme-seaweed-kids",
    name: "Gimme Organic Roasted Seaweed",
    calories: 30, carbs: 1, sugar: 0, protein: 1,
    score: 85,
    schoolSafe: true, ...ALL_FREE,
    blurb: "Three ingredients. Kids who try it are usually surprised how much they like the crunch.",
    amazonQuery: "Gimme Organic Roasted Seaweed",
  },
  {
    id: "bare-apple-chips",
    name: "Bare Baked Crunchy Apple Chips",
    calories: 110, carbs: 26, sugar: 19, protein: 0,
    score: 84, grade: "A",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Apples. One ingredient. The crunch of a chip, the nutrition of fruit. No added sugar, no oil, no additives.",
    amazonQuery: "Bare baked crunchy apple chips",
  },
  {
    id: "organic-valley-string-cheese",
    name: "Organic Valley String Cheese",
    calories: 80, carbs: 0, sugar: 0, protein: 7,
    score: 84,
    schoolSafe: true, nutFree: true, glutenFree: true, eggFree: true, soyFree: true,
    blurb: "Organic, simple ingredients, high protein, school safe.",
    amazonQuery: "Organic Valley String Cheese",
  },
  {
    id: "babybel-original",
    name: "Babybel Original",
    calories: 70, carbs: 0, sugar: 0, protein: 5,
    score: 82,
    schoolSafe: true, toddlerFriendly: true,
    nutFree: true, glutenFree: true, eggFree: true, soyFree: true,
    blurb: "Four ingredients. Individual portion. Available everywhere in Canada. The perfect lunchbox cheese.",
    amazonQuery: "Babybel Original cheese",
  },
  {
    id: "whisps-parmesan",
    name: "Whisps Parmesan Cheese Crisps",
    calories: 150, carbs: 0, sugar: 0, protein: 11,
    score: 82, grade: "A",
    schoolSafe: true, nutFree: true, glutenFree: true, eggFree: true, soyFree: true,
    blurb: "Parmesan cheese (milk, cultures, salt, enzymes). One ingredient. 11g protein per serving. High sodium, so pair with something lower sodium.",
    amazonQuery: "Whisps parmesan cheese crisps",
  },
  {
    id: "amara-smoothie-melts",
    name: "Amara Organic Smoothie Melts",
    calories: 25, carbs: 4, sugar: 2, protein: 1,
    score: 82, grade: "A",
    schoolSafe: true, toddlerFriendly: true, ...ALL_FREE,
    blurb: "Organic fruit purees, organic veggies, organic coconut milk. Freeze dried, no added sugars. Dissolves easily — great for younger kids and toddlers.",
    amazonQuery: "Amara organic smoothie melts",
  },
  {
    id: "biena-chickpea-sea-salt",
    name: "Biena Chickpea Snacks Sea Salt",
    calories: 120, carbs: 16, sugar: 1, protein: 6,
    score: 80, grade: "A",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Chickpeas, sunflower oil, sea salt. Three ingredients. Plant protein and fiber in a crunchy snack. Nut free.",
    amazonQuery: "Biena chickpea snacks sea salt",
  },
  {
    id: "wasa-crispbread-kids",
    name: "Wasa Crispbread Whole Grain",
    calories: 40, carbs: 8, sugar: 0, protein: 1,
    score: 80,
    schoolSafe: true, nutFree: true, dairyFree: true, eggFree: true, soyFree: true,
    blurb: "Four ingredients, zero sugar, whole grain. Pair with hummus or cheese for a complete snack.",
    amazonQuery: "Wasa Crispbread Whole Grain",
  },
  {
    id: "once-upon-a-farm-pouch",
    name: "Once Upon a Farm Apple Sweet Potato Spinach",
    calories: 60, carbs: 13, sugar: 8, protein: 1,
    score: 78, grade: "A",
    schoolSafe: true, toddlerFriendly: true, ...ALL_FREE,
    blurb: "Organic apples, organic sweet potato, organic spinach. Cold pressed, no concentrates. Whole food blend for younger kids.",
    amazonQuery: "Once Upon a Farm apple sweet potato spinach pouch",
  },
  {
    // NOTE: spec requested a CANADIAN badge, but GoGo squeeZ is a brand of
    // Materne (France) with North American production in the US — badge
    // withheld for accuracy.
    id: "gogo-squeez-apple",
    name: "GoGo squeeZ Organic Apple Apple",
    calories: 60, carbs: 15, sugar: 11, protein: 0,
    score: 76, grade: "A",
    schoolSafe: true, toddlerFriendly: true, ...ALL_FREE,
    blurb: "Organic apples. One ingredient. Convenient pouch format.",
    amazonQuery: "GoGo squeeZ organic applesauce pouches",
  },
  {
    id: "thats-it-fruit-bars",
    name: "That's It Fruit Bars",
    calories: 100, carbs: 25, sugar: 20, protein: 0,
    score: 71,
    schoolSafe: true, toddlerFriendly: true, ...ALL_FREE,
    blurb: "Two ingredients. All natural sugar from fruit. The cleanest fruit snack available for kids.",
    amazonQuery: "That's It fruit bars",
  },
  {
    id: "cedars-hummus-packs",
    name: "Cedar's Hummus Snack Packs",
    score: 75,
    schoolSafe: true, nutFree: true, dairyFree: true, glutenFree: true, eggFree: true, soyFree: true,
    blurb: "Real hummus, real protein. Convenient individual packs. Available at Loblaws and Metro across Canada. Contains sesame.",
    amazonQuery: "Cedar's hummus snack packs",
  },
  {
    // NOTE: spec requested SCHOOL SAFE, but Larabar Minis contain almonds
    // (tree nuts) — badge withheld; a nut-free badge on an almond product is
    // a real allergy hazard.
    id: "larabar-mini",
    name: "Larabar Mini",
    calories: 100, carbs: 12, sugar: 9, protein: 2,
    score: 74,
    dairyFree: true, glutenFree: true, eggFree: true, soyFree: true,
    blurb: "Three ingredients — dates, almonds, coconut. All sugar from whole fruit. No artificial anything. Contains tree nuts, so not for nut-free schools.",
    amazonQuery: "Larabar Minis",
  },
  {
    id: "skout-kids-bars",
    name: "Skout Organic Kids Bars",
    calories: 100, carbs: 14, sugar: 8, protein: 3,
    score: 74, grade: "A",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Organic dates, organic pumpkin seeds, organic sunflower seed butter, organic fruit. Date sweetened only. Allergy friendly.",
    amazonQuery: "Skout Organic kids bars",
  },
  {
    id: "siete-tortilla-chips-kids",
    name: "Siete Grain Free Tortilla Chips",
    calories: 130, carbs: 19, sugar: 0, protein: 1,
    score: 73, grade: "A",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Cassava flour, avocado oil, coconut flour, chia seed, sea salt. Avocado oil — not industrial seed oil. Grain free and gluten free. Better oil sourcing than almost every chip on the market.",
    amazonQuery: "Siete grain free tortilla chips",
  },
  {
    id: "bear-yoyos",
    name: "BEAR Real Fruit Yoyos Apple & Strawberry",
    calories: 50, carbs: 11, sugar: 9, protein: 0,
    score: 72, grade: "A",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Apples, strawberries. Two ingredients. 100% real fruit, no added sugar, no concentrates. Treat as a healthy dessert, not a meal component, due to concentrated fruit sugars.",
    amazonQuery: "BEAR real fruit yoyos",
  },
  {
    id: "sunbutter-packets",
    name: "SunButter Sunflower Butter Packets",
    calories: 200, carbs: 7, sugar: 3, protein: 7,
    score: 72,
    schoolSafe: true, ...ALL_FREE,
    blurb: "The nut free alternative to peanut butter that actually tastes good. Safe for every Canadian school.",
    amazonQuery: "SunButter sunflower butter packets",
  },
];

export const KIDS_CHEAT: KidsProduct[] = [
  {
    // Recalibrated 2026-06: 72 → 65 and moved from Approved. Agave nectar and
    // brown rice syrup are primary binders — still added sugar regardless of
    // natural origin, which caps the score at 65 under kids rules.
    id: "madegood-granola-minis",
    name: "MadeGood Granola Minis",
    calories: 100, carbs: 15, sugar: 6, protein: 2,
    score: 65, grade: "B",
    canadian: true, schoolSafe: true, ...ALL_FREE,
    blurb: "Recalibrated to 65: agave nectar and brown rice syrup are primary binders. Still a great school safe organic option, still better than most granola bars — but added sugar binders prevent Approved tier placement. Honest score is 65.",
    amazonQuery: "MadeGood Granola Minis",
  },
  {
    id: "quaker-rice-cakes-plain",
    name: "Quaker Rice Cakes Plain",
    calories: 35, carbs: 7, sugar: 0, protein: 1,
    score: 65,
    schoolSafe: true, nutFree: true, dairyFree: true, eggFree: true, soyFree: true,
    blurb: "Plain only. Minimal ingredients. Flavoured varieties have artificial flavours. Plain only. Not marked gluten free — Quaker warns of barley cross-contact.",
    amazonQuery: "Quaker rice cakes plain",
  },
  {
    id: "hippeas-chickpea-puffs",
    name: "Hippeas Organic Chickpea Puffs",
    calories: 130, carbs: 14, sugar: 1, protein: 4,
    score: 62, grade: "B",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Chickpea and pea flour base. Modest protein and fiber. Better than cheese puffs but still a processed puff snack. Tapioca starch in the mix keeps it off the approved list.",
    amazonQuery: "Hippeas organic chickpea puffs",
  },
  {
    id: "pc-blue-menu-pita-hummus",
    name: "PC Blue Menu Whole Grain Pita with Hummus",
    score: 62,
    schoolSafe: true, canadian: true, nutFree: true, dairyFree: true, eggFree: true, soyFree: true,
    blurb: "Canadian brand, whole grain pita, real hummus.",
    amazonQuery: "whole grain pita hummus snack",
  },
  {
    id: "harvest-snaps-lightly-salted",
    name: "Harvest Snaps Lightly Salted",
    calories: 130, carbs: 17, sugar: 1, protein: 4,
    score: 60, grade: "B",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Pea and lentil base, decent protein and fiber. Some seasoning additives keep it off the Approved list. Better than most veggie chip products.",
    amazonQuery: "Harvest Snaps lightly salted",
  },
  {
    id: "triscuits-kids",
    name: "Triscuits Original",
    calories: 120, carbs: 20, sugar: 0, protein: 3,
    score: 60,
    schoolSafe: true, nutFree: true, dairyFree: true, eggFree: true, soyFree: true,
    blurb: "Three ingredients, whole grain. Fine for kids who like crackers.",
    amazonQuery: "Triscuit Original crackers",
  },
  {
    id: "88-acres-seed-bars",
    name: "88 Acres Seed Bars",
    calories: 200, carbs: 21, sugar: 9, protein: 6,
    score: 58, grade: "B",
    schoolSafe: true, ...ALL_FREE,
    blurb: "Organic pumpkin, sunflower and flax seeds, organic oats. Maple syrup as binder keeps it off the Approved list. Excellent seed profile and nut free. Good for older kids.",
    amazonQuery: "88 Acres seed bars",
  },
  {
    // NOTE: spec requested a CANADIAN badge previously; Annie's Homegrown is a
    // US brand (General Mills) — badge withheld for accuracy.
    id: "annies-bunny-grahams",
    name: "Annie's Organic Bunny Grahams",
    calories: 130, carbs: 21, sugar: 7, protein: 2,
    score: 58,
    schoolSafe: true, nutFree: true, dairyFree: true, eggFree: true, soyFree: true,
    blurb: "Certified organic, no artificial colours or flavours.",
    amazonQuery: "Annie's Organic Bunny Grahams",
  },
  {
    id: "goldfish-original",
    name: "Goldfish Crackers Original",
    calories: 140, carbs: 20, sugar: 0, protein: 3,
    score: 55,
    schoolSafe: true, nutFree: true, eggFree: true, soyFree: true,
    blurb: "Original cheddar variety has no artificial colours. Coloured varieties do. Original only.",
    amazonQuery: "Goldfish Crackers Original cheddar",
  },
  {
    id: "annies-cheddar-bunnies",
    name: "Annie's Organic Cheddar Bunnies",
    calories: 130, carbs: 19, sugar: 1, protein: 3,
    score: 55, grade: "B",
    schoolSafe: true, nutFree: true, eggFree: true, soyFree: true,
    blurb: "Organic wheat flour, real cheddar, no artificial colours. Better than standard Goldfish. Still primarily processed white wheat flour with modest fiber.",
    amazonQuery: "Annie's organic cheddar bunnies",
  },
  {
    id: "stonyfield-kids-pouches",
    name: "Stonyfield Organic Kids Yogurt Pouches",
    calories: 70, carbs: 12, sugar: 9, protein: 3,
    score: 55, grade: "B",
    schoolSafe: true, toddlerFriendly: true,
    nutFree: true, glutenFree: true, eggFree: true, soyFree: true,
    blurb: "Check the label carefully — some flavours contain added cane sugar alongside natural dairy sugar. Choose no-sugar-added varieties only. Organic and a good calcium source.",
    amazonQuery: "Stonyfield organic kids yogurt pouches",
  },
];

export const KIDS_STAY_AWAY: KidsProduct[] = [
  {
    id: "fruit-by-the-foot",
    name: "Fruit by the Foot",
    score: 18,
    artificialColours: true, nutFree: true, dairyFree: true, eggFree: true, soyFree: true,
    blurb: "Contains synthetic dyes. Zero real fruit.",
    betterAlternative: "That's It Fruit Bars — score 71",
  },
  {
    id: "gushers",
    name: "Gushers",
    score: 15,
    artificialColours: true, nutFree: true, dairyFree: true, glutenFree: true, eggFree: true, soyFree: true,
    blurb: "Liquid sugar with synthetic dyes.",
    betterAlternative: "That's It Fruit Bars — score 71",
  },
  {
    id: "fruit-rollups",
    name: "Fruit Roll-Ups",
    score: 20,
    artificialColours: true, nutFree: true, dairyFree: true, eggFree: true, soyFree: true,
    blurb: "Sugar and synthetic dye delivery device shaped like fruit.",
    betterAlternative: "That's It Fruit Bars — score 71",
  },
  {
    id: "dunkaroos",
    name: "Dunkaroos",
    score: 22,
    artificialColours: true, nutFree: true, eggFree: true,
    blurb: "High fructose corn syrup plus synthetic dyes. Nostalgia product that should have stayed in the 90s.",
    betterAlternative: "Annie's Bunny Grahams — score 58",
  },
  {
    id: "lunchables-turkey-cheese",
    name: "Lunchables Turkey & Cheese",
    score: 25,
    nutFree: true, eggFree: true,
    blurb: "Ultra processed meat, high sodium. Everything in this box is a processed approximation of food.",
    betterAlternative: "Babybel plus Wasa Crispbread",
  },
  {
    id: "pop-tarts-strawberry",
    name: "Pop-Tarts Frosted Strawberry",
    score: 18,
    artificialColours: true, nutFree: true, eggFree: true,
    blurb: "High fructose corn syrup, synthetic dyes. Dessert marketed as breakfast.",
    betterAlternative: "Larabar Mini — score 74",
  },
  {
    id: "froot-loops",
    name: "Froot Loops",
    score: 20,
    nutFree: true, dairyFree: true, eggFree: true, soyFree: true,
    blurb: "Canadian Froot Loops uses fruit-based natural colours, while the US version uses synthetic dyes — the Canadian version scores higher than the US version for this reason. Still high sugar and ultra processed.",
    betterAlternative: "Plain oatmeal with fruit",
  },
  {
    id: "welchs-fruit-snacks",
    name: "Welch's Fruit Snacks",
    score: 22,
    artificialColours: true, nutFree: true, dairyFree: true, glutenFree: true, eggFree: true, soyFree: true,
    blurb: "Synthetic dyes marketed with real fruit imagery.",
    betterAlternative: "That's It Fruit Bars — score 71",
  },
  {
    id: "lucky-charms",
    name: "Lucky Charms",
    score: 18,
    artificialColours: true, nutFree: true, dairyFree: true, eggFree: true, soyFree: true,
    blurb: "Very high sugar, ultra processed.",
    betterAlternative: "Plain oats with fruit",
  },
  {
    id: "kool-aid-jammers",
    name: "Kool-Aid Jammers",
    score: 15,
    artificialColours: true, ...ALL_FREE,
    blurb: "Sugar water marketed as juice. Contains no juice.",
    betterAlternative: "Bubly sparkling water",
  },
];

/** Pairing guide — protein/fat pairings that prevent the sugar crash. */
export const PAIRINGS: { carb: string; pair: string; why: string }[] = [
  { carb: "Bare Apple Chips", pair: "Babybel String Cheese", why: "Fruit crunch + dairy protein" },
  { carb: "That's It Fruit Bar", pair: "Pumpkin Seeds", why: "Fruit sugar + 9g seed protein" },
  { carb: "Quaker Rice Cakes", pair: "SunButter", why: "Light carb + nut-free fat and protein" },
  { carb: "SeaSnax Seaweed", pair: "Cedar's Hummus", why: "Mineral crunch + plant protein" },
  { carb: "Freeze Dried Strawberries", pair: "Chomps Meat Stick", why: "Fruit crunch + 5g clean protein" },
  { carb: "GoGo squeeZ Pouch", pair: "Babybel", why: "Convenient carb + portable protein" },
];

export const KIDS_TOTAL_COUNT =
  KIDS_APPROVED.length + KIDS_CHEAT.length + KIDS_STAY_AWAY.length;
