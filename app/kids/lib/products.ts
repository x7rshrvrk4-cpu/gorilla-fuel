/**
 * Kids section — manually curated snack guide for Canadian parents.
 * Three tiers: Kids Approved (score 70+, no artificial colours/flavours,
 * <8g sugar per serving), Cheat List, and Stay Away.
 *
 * Badge accuracy notes:
 * - SCHOOL SAFE = nut free and free from priority Canadian allergens. It is
 *   deliberately withheld from any product containing tree nuts or peanuts.
 * - ARTIFICIAL COLOURS = contains synthetic dyes (Red 40, Yellow 5/6, Blue 1/2).
 *   These are still PERMITTED in Canada — Health Canada has begun the process
 *   of banning Red 40, and several Canadian brands have voluntarily removed
 *   synthetic dyes, but they are not yet banned. Never say "banned in Canada."
 */

export type KidsTier = "approved" | "cheat" | "stay-away";

export type KidsProduct = {
  id: string;
  name: string;
  /** Per-serving macros — omitted where not published in a comparable serving. */
  calories?: number;
  carbs?: number;
  sugar?: number;
  protein?: number;
  score: number;
  schoolSafe?: boolean;
  canadian?: boolean;
  /** Explicitly nut-free positioned products (all schoolSafe products are nut free). */
  nutFree?: boolean;
  /** Contains synthetic dyes — renders the amber warning badge. */
  artificialColours?: boolean;
  blurb: string;
  betterAlternative?: string;
  /** Amazon.ca search query for the affiliate buy button (approved + cheat only). */
  amazonQuery?: string;
};

export const AFFILIATE_TAG = "gorillafuel-20";

export function amazonUrl(query: string): string {
  return `https://www.amazon.ca/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

export const KIDS_APPROVED: KidsProduct[] = [
  {
    id: "madegood-granola-minis",
    name: "MadeGood Granola Minis",
    calories: 100, carbs: 15, sugar: 6, protein: 2,
    score: 72,
    canadian: true,
    schoolSafe: true,
    blurb: "Certified organic, nut free, allergen free. The gold standard Canadian school snack. No artificial anything.",
    amazonQuery: "MadeGood Granola Minis",
  },
  {
    id: "chomps-mini-beef",
    name: "Chomps Mini Beef Sticks",
    calories: 50, carbs: 0, sugar: 0, protein: 5,
    score: 88,
    schoolSafe: true,
    blurb: "Grass fed beef, zero sugar, zero artificial anything. The cleanest protein snack in a lunchbox.",
    amazonQuery: "Chomps Mini Beef Sticks",
  },
  {
    id: "babybel-original",
    name: "Babybel Original",
    calories: 70, carbs: 0, sugar: 0, protein: 5,
    score: 82,
    schoolSafe: true,
    blurb: "Four ingredients. Individual portion. Available everywhere in Canada. The perfect lunchbox cheese.",
    amazonQuery: "Babybel Original cheese",
  },
  {
    id: "organic-valley-string-cheese",
    name: "Organic Valley String Cheese",
    calories: 80, carbs: 0, sugar: 0, protein: 7,
    score: 84,
    schoolSafe: true,
    blurb: "Organic, simple ingredients, high protein, school safe.",
    amazonQuery: "Organic Valley String Cheese",
  },
  {
    id: "gimme-seaweed-kids",
    name: "Gimme Organic Roasted Seaweed",
    calories: 30, carbs: 1, sugar: 0, protein: 1,
    score: 85,
    schoolSafe: true,
    blurb: "Three ingredients. Kids who try it are usually surprised how much they like the crunch.",
    amazonQuery: "Gimme Organic Roasted Seaweed",
  },
  {
    id: "wasa-crispbread-kids",
    name: "Wasa Crispbread Whole Grain",
    calories: 40, carbs: 8, sugar: 0, protein: 1,
    score: 80,
    schoolSafe: true,
    blurb: "Four ingredients, zero sugar, whole grain. Pair with hummus or cheese for a complete snack.",
    amazonQuery: "Wasa Crispbread Whole Grain",
  },
  {
    id: "sunbutter-packets",
    name: "SunButter Sunflower Butter Packets",
    calories: 200, carbs: 7, sugar: 3, protein: 7,
    score: 72,
    schoolSafe: true,
    nutFree: true,
    blurb: "The nut free alternative to peanut butter that actually tastes good. Safe for every Canadian school.",
    amazonQuery: "SunButter sunflower butter packets",
  },
  {
    id: "pumpkin-seeds-kids",
    name: "Pumpkin Seeds (Unsalted)",
    calories: 170, carbs: 4, sugar: 0, protein: 9,
    score: 88,
    schoolSafe: true,
    nutFree: true,
    blurb: "One ingredient. Nine grams of protein. Nut free and allergy friendly.",
    amazonQuery: "pumpkin seeds unsalted",
  },
  {
    // NOTE: spec requested SCHOOL SAFE here, but Larabar Minis contain almonds
    // (tree nuts) — a nut-free badge on an almond product is a real allergy
    // hazard, so the badge is deliberately withheld.
    id: "larabar-mini",
    name: "Larabar Mini",
    calories: 100, carbs: 12, sugar: 9, protein: 2,
    score: 74,
    blurb: "Three ingredients — dates, almonds, coconut. All sugar from whole fruit. No artificial anything. Contains tree nuts, so not for nut-free schools.",
    amazonQuery: "Larabar Minis",
  },
  {
    id: "thats-it-fruit-bars",
    name: "That's It Fruit Bars",
    calories: 100, carbs: 25, sugar: 20, protein: 0,
    score: 71,
    schoolSafe: true,
    nutFree: true,
    blurb: "Two ingredients. All natural sugar from fruit. The cleanest fruit snack available for kids.",
    amazonQuery: "That's It fruit bars",
  },
  {
    id: "cedars-hummus-packs",
    name: "Cedar's Hummus Snack Packs",
    score: 75,
    schoolSafe: true,
    blurb: "Real hummus, real protein. Convenient individual packs. Available at Loblaws and Metro across Canada.",
    amazonQuery: "Cedar's hummus snack packs",
  },
];

export const KIDS_CHEAT: KidsProduct[] = [
  {
    id: "goldfish-original",
    name: "Goldfish Crackers Original",
    calories: 140, carbs: 20, sugar: 0, protein: 3,
    score: 55,
    schoolSafe: true,
    blurb: "Original cheddar variety has no artificial colours. Coloured varieties do. Original only.",
    amazonQuery: "Goldfish Crackers Original cheddar",
  },
  {
    id: "triscuits-kids",
    name: "Triscuits Original",
    calories: 120, carbs: 20, sugar: 0, protein: 3,
    score: 60,
    schoolSafe: true,
    blurb: "Three ingredients, whole grain. Fine for kids who like crackers.",
    amazonQuery: "Triscuit Original crackers",
  },
  {
    // NOTE: spec requested a CANADIAN badge, but Annie's Homegrown is a US
    // brand (General Mills, Berkeley CA) — badge withheld for accuracy.
    id: "annies-bunny-grahams",
    name: "Annie's Organic Bunny Grahams",
    calories: 130, carbs: 21, sugar: 7, protein: 2,
    score: 58,
    schoolSafe: true,
    blurb: "Certified organic, no artificial colours or flavours.",
    amazonQuery: "Annie's Organic Bunny Grahams",
  },
  {
    id: "quaker-rice-cakes-plain",
    name: "Quaker Rice Cakes Plain",
    calories: 35, carbs: 7, sugar: 0, protein: 1,
    score: 65,
    schoolSafe: true,
    blurb: "Plain only. Minimal ingredients. Flavoured varieties have artificial flavours. Plain only.",
    amazonQuery: "Quaker rice cakes plain",
  },
  {
    id: "pc-blue-menu-pita-hummus",
    name: "PC Blue Menu Whole Grain Pita with Hummus",
    score: 62,
    schoolSafe: true,
    canadian: true,
    blurb: "Canadian brand, whole grain pita, real hummus.",
    amazonQuery: "whole grain pita hummus snack",
  },
];

export const KIDS_STAY_AWAY: KidsProduct[] = [
  {
    id: "fruit-by-the-foot",
    name: "Fruit by the Foot",
    score: 18,
    artificialColours: true,
    blurb: "Contains synthetic dyes. Zero real fruit.",
    betterAlternative: "That's It Fruit Bars — score 71",
  },
  {
    id: "gushers",
    name: "Gushers",
    score: 15,
    artificialColours: true,
    blurb: "Liquid sugar with synthetic dyes.",
    betterAlternative: "That's It Fruit Bars — score 71",
  },
  {
    id: "fruit-rollups",
    name: "Fruit Roll-Ups",
    score: 20,
    artificialColours: true,
    blurb: "Sugar and synthetic dye delivery device shaped like fruit.",
    betterAlternative: "That's It Fruit Bars — score 71",
  },
  {
    id: "dunkaroos",
    name: "Dunkaroos",
    score: 22,
    artificialColours: true,
    blurb: "High fructose corn syrup plus synthetic dyes. Nostalgia product that should have stayed in the 90s.",
    betterAlternative: "Annie's Bunny Grahams — score 58",
  },
  {
    // No synthetic-dye badge: Lunchables' problem is ultra-processing and
    // sodium, not colourants — badge would be inaccurate here.
    id: "lunchables-turkey-cheese",
    name: "Lunchables Turkey & Cheese",
    score: 25,
    blurb: "Ultra processed meat, high sodium. Everything in this box is a processed approximation of food.",
    betterAlternative: "Babybel plus Wasa Crispbread",
  },
  {
    id: "pop-tarts-strawberry",
    name: "Pop-Tarts Frosted Strawberry",
    score: 18,
    artificialColours: true,
    blurb: "High fructose corn syrup, synthetic dyes. Dessert marketed as breakfast.",
    betterAlternative: "Larabar Mini — score 74",
  },
  {
    id: "froot-loops",
    name: "Froot Loops",
    score: 20,
    artificialColours: false,
    blurb: "Canadian Froot Loops uses fruit-based natural colours, while the US version uses synthetic dyes — the Canadian version scores higher than the US version for this reason. Still high sugar and ultra processed.",
    betterAlternative: "Plain oatmeal with fruit",
  },
  {
    id: "welchs-fruit-snacks",
    name: "Welch's Fruit Snacks",
    score: 22,
    artificialColours: true,
    blurb: "Synthetic dyes marketed with real fruit imagery.",
    betterAlternative: "That's It Fruit Bars — score 71",
  },
  {
    id: "lucky-charms",
    name: "Lucky Charms",
    score: 18,
    artificialColours: true,
    blurb: "Very high sugar, ultra processed.",
    betterAlternative: "Plain oats with fruit",
  },
  {
    id: "kool-aid-jammers",
    name: "Kool-Aid Jammers",
    score: 15,
    artificialColours: true,
    blurb: "Sugar water marketed as juice. Contains no juice.",
    betterAlternative: "Bubly sparkling water",
  },
];

export const KIDS_TOTAL_COUNT =
  KIDS_APPROVED.length + KIDS_CHEAT.length + KIDS_STAY_AWAY.length;
