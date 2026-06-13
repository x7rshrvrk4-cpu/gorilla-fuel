/**
 * Gorilla Intel — the curated tier lists behind /approved, /cheat, and /avoid.
 *
 * Scores are NOT stored here: they are resolved through lookupCuratedScore()
 * (the same function the scanner uses), so the score on these pages is by
 * construction identical to what scanning the product returns.
 */

import { lookupCuratedScore } from "../../scan/lib/curatedScores";

export type IntelTier = "approved" | "cheat" | "avoid";

export type IntelProduct = {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  score: number;
  grade: string;
  highlights: string[];
  blurb: string;
  betterAlternative?: string;
  amazonQuery?: string;
  iherbQuery?: string;
  worstIngredient?: string;
  category: string;
  nutrition?: { cal: number; carbs: number; sugar: number; protein: number };
  ingredientCount?: number;
  canadian?: boolean;
};

export type IntelCategory = {
  key: string;
  label: string;
  note?: string;
};

export const AFFILIATE_TAG = "gorillafuel-20";

export function amazonUrl(query: string): string {
  return `https://www.amazon.ca/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

export function iherbUrl(query: string): string {
  return `https://www.iherb.com/search?kw=${encodeURIComponent(query)}`;
}

type Seed = Omit<IntelProduct, "score" | "grade" | "highlights"> & {
  highlights?: string[];
};

function resolve(seed: Seed): IntelProduct {
  const ov = lookupCuratedScore(seed.barcode, seed.name);
  if (!ov) {
    console.error(`[Gorilla Intel] no curated score for ${seed.name} (${seed.barcode})`);
  }
  return {
    ...seed,
    score: ov?.score ?? 0,
    grade: ov?.grade ?? "Unknown",
    highlights: seed.highlights ?? ov?.positives ?? [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GORILLA APPROVED (13)
// ─────────────────────────────────────────────────────────────────────────────

export const APPROVED_CATEGORIES: IntelCategory[] = [
  { key: "protein-snacks", label: "PROTEIN SNACKS" },
  { key: "nuts-seeds",     label: "NUTS AND SEEDS" },
  { key: "canadian-brands", label: "CANADIAN BRANDS" },
  { key: "bars",           label: "BARS" },
  { key: "crackers-popcorn", label: "CRACKERS AND POPCORN" },
  { key: "seaweed",        label: "SEAWEED" },
];

const APPROVED_SEEDS: Seed[] = [
  // ── PROTEIN SNACKS ──────────────────────────────────────────────────────────
  {
    id: "rxbar-chocolate-sea-salt",
    name: "RXBAR Chocolate Sea Salt",
    brand: "RXBAR",
    barcode: "0858547004149",
    category: "protein-snacks",
    nutrition: { cal: 210, carbs: 23, sugar: 13, protein: 12 },
    ingredientCount: 7,
    blurb: "The cleanest protein bar on the market. Just food. Dates egg whites almonds cashews natural flavour. Nothing else.",
    amazonQuery: "RXBAR Chocolate Sea Salt",
  },
  {
    id: "chomps-beef",
    name: "Chomps Original Beef Sticks",
    brand: "Chomps",
    barcode: "0856205006050",
    category: "protein-snacks",
    nutrition: { cal: 90, carbs: 0, sugar: 0, protein: 9 },
    ingredientCount: 5,
    blurb: "Grass fed beef zero sugar zero junk. The Gorilla standard for portable protein.",
    amazonQuery: "Chomps Original Beef Sticks",
  },
  {
    id: "chomps-turkey",
    name: "Chomps Turkey Sticks",
    brand: "Chomps",
    barcode: "0856205006067",
    category: "protein-snacks",
    nutrition: { cal: 70, carbs: 0, sugar: 0, protein: 9 },
    ingredientCount: 4,
    blurb: "Lighter than beef same clean standard. Free range turkey one gram of fat.",
    amazonQuery: "Chomps Turkey Sticks",
  },

  // ── NUTS AND SEEDS ───────────────────────────────────────────────────────────
  {
    id: "blue-diamond-almonds",
    name: "Blue Diamond Whole Natural Almonds",
    brand: "Blue Diamond",
    barcode: "0041570001035",
    category: "nuts-seeds",
    nutrition: { cal: 170, carbs: 6, sugar: 1, protein: 6 },
    ingredientCount: 1,
    blurb: "One ingredient. Almonds. The perfect snack does not need a label.",
    amazonQuery: "Blue Diamond Whole Natural Almonds",
  },
  {
    id: "wonderful-pistachios",
    name: "Wonderful Pistachios No Shell",
    brand: "Wonderful",
    barcode: "0026617014109",
    category: "nuts-seeds",
    nutrition: { cal: 160, carbs: 8, sugar: 2, protein: 6 },
    ingredientCount: 2,
    blurb: "Two ingredients. Pistachios and salt. Protein fibre and healthy fat in a handful.",
    amazonQuery: "Wonderful Pistachios No Shells",
  },
  {
    id: "pumpkin-seeds",
    name: "Pumpkin Seeds Unsalted",
    brand: "Generic / bulk",
    barcode: "",
    category: "nuts-seeds",
    nutrition: { cal: 170, carbs: 4, sugar: 0, protein: 9 },
    ingredientCount: 1,
    blurb: "One ingredient. Nine grams of protein. The highest magnesium content of any snack on this list.",
    amazonQuery: "pumpkin seeds unsalted",
  },

  // ── CANADIAN BRANDS ──────────────────────────────────────────────────────────
  {
    id: "liberte-greek-0",
    name: "Liberté Greek Yogurt Plain 0%",
    brand: "Liberté",
    barcode: "0058755000999",
    category: "canadian-brands",
    nutrition: { cal: 90, carbs: 8, sugar: 7, protein: 15 },
    ingredientCount: 2,
    canadian: true,
    blurb: "Two ingredients. Fifteen grams of protein. The best calorie to protein ratio of anything on this list. Canadian brand. The Gorilla number one pick for daily snacking.",
    amazonQuery: "Liberte Greek yogurt plain 0%",
  },
  {
    id: "nomz-energy-bites",
    name: "Nomz Energy Bites",
    brand: "Nomz",
    barcode: "0628451026059",
    category: "canadian-brands",
    nutrition: { cal: 80, carbs: 9, sugar: 7, protein: 2 },
    ingredientCount: 5,
    canadian: true,
    blurb: "Canadian made. Five whole food ingredients. Dates are the only sweetener. The only energy bite we trust. Available at Loblaws and health food stores across Canada.",
    iherbQuery: "Nomz Energy Bites",
  },

  // ── BARS ─────────────────────────────────────────────────────────────────────
  {
    id: "larabar-apple-pie",
    name: "Larabar Apple Pie",
    brand: "Larabar",
    barcode: "0021908516890",
    category: "bars",
    nutrition: { cal: 190, carbs: 23, sugar: 18, protein: 4 },
    ingredientCount: 3,
    blurb: "Three ingredients. Dates almonds apples. All sugar from whole fruit. If you need a bar on the go this is the one.",
    amazonQuery: "Larabar Apple Pie",
  },
  {
    id: "kind-dark-chocolate",
    name: "KIND Dark Chocolate Nuts & Sea Salt",
    brand: "KIND",
    barcode: "0602652173270",
    category: "bars",
    nutrition: { cal: 200, carbs: 17, sugar: 5, protein: 6 },
    blurb: "Real nuts as the first ingredient. Five grams of sugar. Satisfying without the guilt spiral.",
    amazonQuery: "KIND Dark Chocolate Nuts Sea Salt",
  },

  // ── CRACKERS AND POPCORN ─────────────────────────────────────────────────────
  {
    id: "wasa-crispbread",
    name: "Wasa Crispbread Whole Grain",
    brand: "Wasa",
    barcode: "0041420064203",
    category: "crackers-popcorn",
    nutrition: { cal: 40, carbs: 8, sugar: 0, protein: 1 },
    ingredientCount: 4,
    blurb: "Four ingredients. Zero sugar. The cleanest cracker available at any Canadian grocery store. Available at Loblaws Walmart Metro.",
    amazonQuery: "Wasa Crispbread Whole Grain",
  },
  {
    id: "skinnypop-original",
    name: "SkinnyPop Original Popcorn",
    brand: "SkinnyPop",
    barcode: "0041660300047",
    category: "crackers-popcorn",
    nutrition: { cal: 100, carbs: 10, sugar: 0, protein: 2 },
    ingredientCount: 3,
    blurb: "Three ingredients. Popcorn sunflower oil salt. The cleanest packaged popcorn in Canada. Available at Costco Walmart Loblaws.",
    amazonQuery: "SkinnyPop Original Popcorn",
  },

  // ── SEAWEED ──────────────────────────────────────────────────────────────────
  {
    id: "gimme-seaweed",
    name: "Gimme Organic Roasted Seaweed",
    brand: "Gimme",
    barcode: "0851093001029",
    category: "seaweed",
    nutrition: { cal: 30, carbs: 1, sugar: 0, protein: 1 },
    ingredientCount: 3,
    blurb: "Three ingredients. Thirty calories per pack. Iodine rich. The lowest calorie satisfying snack on this list and it actually tastes good.",
    amazonQuery: "Gimme Organic Roasted Seaweed",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GORILLA CHEAT LIST (14)
// ─────────────────────────────────────────────────────────────────────────────

export const CHEAT_CATEGORIES: IntelCategory[] = [
  { key: "chips", label: "CHIPS" },
  {
    key: "chocolate",
    label: "CHOCOLATE",
    note: "Dark chocolate above 70% cocoa is backed by research on flavanols and heart health. Portion is everything. Two squares is a snack. The whole bar is dessert.",
  },
  {
    key: "granola-bars",
    label: "GRANOLA AND BARS",
    note: "Most granola bars are candy bars in disguise. These are the ones that are at least honest about their ingredients.",
  },
  { key: "crackers", label: "CRACKERS" },
  {
    key: "popcorn",
    label: "POPCORN",
    note: "Flavoured popcorn is where clean snacks go to die. These are the two that held up.",
  },
  {
    key: "drinks",
    label: "DRINKS",
    note: "Most drinks marketed as healthy are not. These two earned their place.",
  },
];

const CHEAT_SEEDS: Seed[] = [
  // ── CHIPS ─────────────────────────────────────────────────────────────────
  {
    id: "tostitos-restaurant",
    name: "Tostitos Restaurant Style",
    brand: "Frito-Lay",
    barcode: "0028400590679",
    category: "chips",
    nutrition: { cal: 140, carbs: 18, sugar: 0, protein: 2 },
    ingredientCount: 3,
    blurb: "Three ingredient corn chip. The cleanest chip at a Canadian party. Just corn oil and salt. The problem is nobody eats one serving.",
    amazonQuery: "Tostitos Restaurant Style",
  },
  {
    id: "miss-vickies-malt-vinegar",
    name: "Miss Vickie's Sea Salt & Malt Vinegar",
    brand: "Miss Vickie's",
    barcode: "0060410016476",
    category: "chips",
    nutrition: { cal: 150, carbs: 17, sugar: 0, protein: 2 },
    blurb: "Kettle cooked no artificial colours. One of the better flavoured chip options. Short ingredient list for a flavoured product.",
    amazonQuery: "Miss Vickies Sea Salt Malt Vinegar",
  },
  {
    id: "lays-classic",
    name: "Lay's Classic Original",
    brand: "Frito-Lay",
    barcode: "0028400090155",
    category: "chips",
    nutrition: { cal: 160, carbs: 15, sugar: 0, protein: 2 },
    ingredientCount: 3,
    blurb: "Three ingredients. Always choose original over flavoured. The flavoured versions add artificial everything. Do not finish the bag.",
    amazonQuery: "Lays Classic Original",
  },
  {
    id: "hardbite-sea-salt",
    name: "Hardbite Chips Sea Salt",
    brand: "Hardbite",
    barcode: "0067040303010",
    category: "chips",
    nutrition: { cal: 150, carbs: 18, sugar: 0, protein: 2 },
    ingredientCount: 3,
    canadian: true,
    blurb: "Canadian kettle chip clean ingredients. Available at Loblaws and Sobeys. Supports a Canadian brand.",
    amazonQuery: "Hardbite chips sea salt",
  },

  // ── CHOCOLATE ─────────────────────────────────────────────────────────────
  {
    id: "lindt-85",
    name: "Lindt 85% Dark Chocolate",
    brand: "Lindt",
    barcode: "0062814133450",
    category: "chocolate",
    nutrition: { cal: 120, carbs: 5, sugar: 1, protein: 2 },
    ingredientCount: 5,
    blurb: "High cocoa. Low sugar. Actually backed by research unlike most things on grocery store shelves. Two squares. Not twenty.",
    amazonQuery: "Lindt 85% dark chocolate",
  },
  {
    id: "lindt-70",
    name: "Lindt 70% Dark Chocolate",
    brand: "Lindt",
    barcode: "0062814133443",
    category: "chocolate",
    nutrition: { cal: 130, carbs: 8, sugar: 4, protein: 2 },
    ingredientCount: 6,
    blurb: "More sugar than 85% but most people actually eat this one. A fair trade for something you will stick with.",
    amazonQuery: "Lindt 70% dark chocolate",
  },
  {
    id: "green-blacks-70",
    name: "Green & Black's Organic Dark 70%",
    brand: "Green & Black's",
    barcode: "0708656035003",
    category: "chocolate",
    nutrition: { cal: 120, carbs: 7, sugar: 5, protein: 2 },
    ingredientCount: 4,
    blurb: "Organic fair trade clean ingredient list. Available at Loblaws Canada. The premium choice in this category.",
    amazonQuery: "Green and Blacks organic dark 70",
  },

  // ── GRANOLA AND BARS ───────────────────────────────────────────────────────
  {
    id: "nature-valley-oats-honey",
    name: "Nature Valley Crunchy Oats & Honey",
    brand: "Nature Valley",
    barcode: "0016000275287",
    category: "granola-bars",
    nutrition: { cal: 190, carbs: 29, sugar: 11, protein: 4 },
    blurb: "Whole grain oats are the first ingredient. Short list. Filling. Not a health food despite the outdoor marketing but not the worst choice either.",
    amazonQuery: "Nature Valley Crunchy Oats and Honey",
  },
  {
    id: "triscuits-original",
    name: "Triscuits Original",
    brand: "Nabisco",
    barcode: "0044000051396",
    category: "granola-bars",
    nutrition: { cal: 120, carbs: 20, sugar: 0, protein: 3 },
    ingredientCount: 3,
    blurb: "Three ingredients. Whole grain wheat canola oil salt. One of the better mass market crackers at any Canadian grocery store.",
    amazonQuery: "Triscuit Original crackers",
  },

  // ── CRACKERS ──────────────────────────────────────────────────────────────
  {
    id: "breton-original",
    name: "Breton Original Crackers",
    brand: "Dare Foods",
    barcode: "0063600013113",
    category: "crackers",
    nutrition: { cal: 120, carbs: 16, sugar: 1, protein: 2 },
    canadian: true,
    blurb: "Canadian brand clean current formula. Available everywhere in Canada. Tastes better than Wasa if we are being honest.",
    amazonQuery: "Breton Original crackers",
  },

  // ── POPCORN ───────────────────────────────────────────────────────────────
  {
    id: "smartfood-white-cheddar",
    name: "Smartfood White Cheddar Popcorn",
    brand: "Frito-Lay",
    barcode: "0028400493451",
    category: "popcorn",
    nutrition: { cal: 160, carbs: 16, sugar: 2, protein: 3 },
    blurb: "Real cheddar cheese. No artificial colours. High sodium. The bag will be empty before you realise it happened. Portion into a bowl before you start.",
    amazonQuery: "Smartfood White Cheddar popcorn",
  },
  {
    id: "boom-chicka-pop",
    name: "Boom Chicka Pop White Cheddar",
    brand: "Angie's",
    barcode: "0607813037016",
    category: "popcorn",
    nutrition: { cal: 150, carbs: 14, sugar: 0, protein: 3 },
    blurb: "Cleaner than Smartfood. Real cheese. No artificial colours. Available at Costco Canada. The better choice between the two.",
    amazonQuery: "Boom Chicka Pop White Cheddar",
  },

  // ── DRINKS ────────────────────────────────────────────────────────────────
  {
    id: "bubly",
    name: "Bubly Sparkling Water",
    brand: "PepsiCo",
    barcode: "0012000174834",
    category: "drinks",
    nutrition: { cal: 0, carbs: 0, sugar: 0, protein: 0 },
    ingredientCount: 2,
    blurb: "Carbonated water and natural flavour. Technically belongs on the Approved list but people reach for it when they want something fun so it lives here. The best soda replacement available.",
    // No amazonQuery — available at every grocery store, no affiliate link needed
  },
  {
    id: "gatorade-original",
    name: "Gatorade Original",
    brand: "PepsiCo",
    barcode: "0052000004567",
    category: "drinks",
    nutrition: { cal: 140, carbs: 36, sugar: 34, protein: 0 },
    blurb: "Only appropriate during or after intense exercise lasting over one hour. At a desk it is sugar water with food dye. During a two hour workout it is actually useful. Know the difference.",
    amazonQuery: "Gatorade original",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STAY AWAY (17)
// ─────────────────────────────────────────────────────────────────────────────

const AVOID_SEEDS: Seed[] = [
  {
    id: "doritos",
    name: "Doritos Nacho Cheese",
    brand: "Frito-Lay",
    barcode: "0028400090308",
    category: "avoid",
    worstIngredient: "Red 40 artificial colour",
    blurb: "This is not a chip. It is a chemical delivery system shaped like a chip. NOVA Group 4. Artificial colours. MSG. Nothing redeemable in the ingredient list.",
    betterAlternative: "Tostitos Restaurant Style — score 62",
  },
  {
    id: "cheetos",
    name: "Cheetos",
    brand: "Frito-Lay",
    barcode: "0028400090209",
    category: "avoid",
    worstIngredient: "Yellow 6 artificial colour",
    blurb: "The orange dust is not cheese. It has never been cheese. Zero nutritional value. Every ingredient is synthetic.",
    betterAlternative: "Boom Chicka Pop White Cheddar — score 52",
  },
  {
    id: "oreo",
    name: "Oreo Cookies",
    brand: "Nabisco",
    barcode: "0044000030131",
    category: "avoid",
    worstIngredient: "Artificial filling",
    blurb: "The filling is not cream. It has never been cream. High sugar palm oil artificial vanilla NOVA Group 4.",
    betterAlternative: "Lindt 85% Dark Chocolate — score 65",
  },
  {
    id: "pop-tarts",
    name: "Pop-Tarts",
    brand: "Kellogg's",
    barcode: "0038000219351",
    category: "avoid",
    worstIngredient: "High fructose corn syrup",
    blurb: "Dessert marketed as breakfast since 1964. High fructose corn syrup artificial colours NOVA Group 4.",
    betterAlternative: "Larabar Apple Pie — score 76",
  },
  {
    id: "lunchables",
    name: "Lunchables",
    brand: "Kraft Heinz",
    barcode: "0044700038048",
    category: "avoid",
    worstIngredient: "Ultra processed meat",
    blurb: "Built for convenience not nutrition. The cheese is not really cheese. The meat is not really meat. The cracker is not really a cracker.",
    betterAlternative: "Chomps Turkey Sticks — score 87",
  },
  {
    id: "nutella",
    name: "Nutella",
    brand: "Ferrero",
    barcode: "0009800895023",
    category: "avoid",
    worstIngredient: "Palm oil",
    blurb: "Palm oil is the first ingredient after sugar. The jar says hazelnut spread. The label says palm oil and sugar with some hazelnuts in the background.",
    betterAlternative: "SunButter Sunflower Butter",
  },
  {
    id: "harvest-crunch",
    name: "Quaker Harvest Crunch Granola",
    brand: "Quaker",
    barcode: "0055577102202",
    category: "avoid",
    worstIngredient: "Palm oil plus 18g sugar",
    blurb: "Marketed as a healthy granola since the 1970s. Palm oil second ingredient. 18g sugar per serving. The oats are in there somewhere but they are not doing the heavy lifting.",
    betterAlternative: "Kind Dark Chocolate Nuts and Sea Salt — score 71",
  },
  {
    id: "clif-bar",
    name: "Clif Bar",
    brand: "Clif",
    barcode: "0722252102729",
    category: "avoid",
    worstIngredient: "21g sugar",
    blurb: "Twenty one grams of sugar. Appropriate if you are cycling 80km. Not appropriate if you are driving to work. Athletes food marketed to desk workers.",
    betterAlternative: "RXBAR Chocolate Sea Salt — score 82",
  },
  {
    id: "vitamin-water",
    name: "Vitamin Water",
    brand: "Coca-Cola",
    barcode: "0786162110013",
    category: "avoid",
    worstIngredient: "Crystalline fructose",
    blurb: "32g of sugar per bottle marketed as healthy hydration with added vitamins. The vitamins do not cancel out the sugar.",
    betterAlternative: "Bubly Sparkling Water — score 82",
  },
  {
    id: "activia-strawberry",
    name: "Activia Strawberry Yogurt",
    brand: "Danone",
    barcode: "0038000014833",
    category: "avoid",
    worstIngredient: "Modified corn starch plus 16g sugar",
    blurb: "16g sugar per serving. Artificial strawberry flavour. The probiotic marketing does not change what the ingredient list says.",
    betterAlternative: "Liberté Greek Yogurt Plain — score 91",
  },
  {
    id: "special-k-bar",
    name: "Special K Protein Bar",
    brand: "Kellogg's",
    barcode: "0038000012557",
    category: "avoid",
    worstIngredient: "17g sugar plus long additive list",
    blurb: "Sounds like a health food. The ingredient list has 30 items including multiple artificial sweeteners and colours. The protein is real. Everything around it is not.",
    betterAlternative: "RXBAR Chocolate Sea Salt — score 82",
  },
  {
    id: "old-dutch-party-mix",
    name: "Old Dutch Party Mix",
    brand: "Old Dutch",
    barcode: "0060383060019",
    category: "avoid",
    worstIngredient: "Artificial colours",
    blurb: "Every ingredient in here has a number after its name. High sodium artificial colours NOVA Group 4.",
    betterAlternative: "SkinnyPop Original — score 78",
  },
  {
    id: "humpty-dumpty-cheese",
    name: "Humpty Dumpty Cheese Sticks",
    brand: "Old Dutch",
    barcode: "0060383070025",
    category: "avoid",
    worstIngredient: "Artificial colours",
    blurb: "Not cheese. Not really a stick. Artificial colours artificial flavours high sodium NOVA Group 4.",
    betterAlternative: "Wonderful Pistachios — score 85",
  },
  {
    id: "arriba-nacho",
    name: "Arriba Nacho Chips",
    brand: "Old Dutch",
    barcode: "0060383089027",
    category: "avoid",
    worstIngredient: "Artificial colours",
    blurb: "Artificial colours artificial flavours NOVA Group 4.",
    betterAlternative: "Tostitos Restaurant Style — score 62",
  },
  {
    id: "coca-cola",
    name: "Coca-Cola Regular",
    brand: "Coca-Cola",
    barcode: "0069000019832",
    category: "avoid",
    worstIngredient: "39g sugar",
    blurb: "39 grams of sugar per can. Caramel colour. Phosphoric acid. A beverage designed to be consumed faster than your body can process the sugar load.",
    betterAlternative: "Bubly Sparkling Water — score 82",
  },
  {
    id: "pepsi",
    name: "Pepsi Regular",
    brand: "PepsiCo",
    barcode: "0069000008947",
    category: "avoid",
    worstIngredient: "41g sugar",
    blurb: "One gram more sugar than Coca Cola. The cola war nobody needed to win.",
    betterAlternative: "Bubly Sparkling Water — score 82",
  },
  {
    id: "gatorade-nonexercise",
    name: "Gatorade — when not exercising",
    brand: "PepsiCo",
    barcode: "0052000004567",
    category: "avoid",
    worstIngredient: "34g sugar plus artificial colours",
    blurb: "Fine during a workout. At any other time it is sugar water with food dye and an athletic brand on the label. Context matters.",
    betterAlternative: "Bubly Sparkling Water — score 82",
  },
];

export const INTEL_APPROVED: IntelProduct[] = APPROVED_SEEDS.map(resolve);
export const INTEL_CHEAT: IntelProduct[] = CHEAT_SEEDS.map(resolve);
export const INTEL_AVOID: IntelProduct[] = AVOID_SEEDS.map(resolve);

export const INTEL_TOTAL_COUNT =
  INTEL_APPROVED.length + INTEL_CHEAT.length + INTEL_AVOID.length;
