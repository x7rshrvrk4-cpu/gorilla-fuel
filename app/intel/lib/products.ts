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
};

export const AFFILIATE_TAG = "gorillafuel-20";

export function amazonUrl(query: string): string {
  return `https://www.amazon.ca/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

type Seed = Omit<IntelProduct, "score" | "grade" | "highlights"> & {
  highlights?: string[];
};

function resolve(seed: Seed): IntelProduct {
  const ov = lookupCuratedScore(seed.barcode, seed.name);
  if (!ov) {
    // A missing override is a build-time data bug — surface it loudly in dev.
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
const APPROVED_SEEDS: Seed[] = [
  { id: "rxbar-chocolate-sea-salt", name: "RXBAR Chocolate Sea Salt", brand: "RXBAR", barcode: "0858547004149",
    blurb: "Dates, egg whites, nuts, cocoa, sea salt — the whole ingredient list fits on the front of the wrapper.", amazonQuery: "RXBAR Chocolate Sea Salt" },
  { id: "chomps-beef", name: "Chomps Original Beef Sticks", brand: "Chomps", barcode: "0856205006050",
    blurb: "Grass fed beef, zero sugar, zero additives. The cleanest shelf-stable protein you can buy.", amazonQuery: "Chomps Original Beef Sticks" },
  { id: "chomps-turkey", name: "Chomps Turkey Sticks", brand: "Chomps", barcode: "0856205006067",
    blurb: "Free range turkey, zero sugar, zero additives.", amazonQuery: "Chomps Turkey Sticks" },
  { id: "wonderful-pistachios", name: "Wonderful Pistachios No Shell", brand: "Wonderful", barcode: "0026617014109",
    blurb: "Two ingredients — pistachios and sea salt. Healthy fat and real protein.", amazonQuery: "Wonderful Pistachios No Shells" },
  { id: "blue-diamond-almonds", name: "Blue Diamond Whole Natural Almonds", brand: "Blue Diamond", barcode: "0041570001035",
    blurb: "One ingredient. Perfect macros. The benchmark whole-food snack.", amazonQuery: "Blue Diamond Whole Natural Almonds" },
  { id: "pumpkin-seeds", name: "Pumpkin Seeds Unsalted", brand: "Generic / bulk", barcode: "",
    blurb: "One ingredient and the highest magnesium of any snack on this list.", amazonQuery: "pumpkin seeds unsalted" },
  { id: "nomz-energy-bites", name: "Nomz Energy Bites", brand: "Nomz", barcode: "0628451026059",
    blurb: "Canadian brand. Five whole food ingredients, sweetened with dates only.", amazonQuery: "Nomz energy bites organic" },
  { id: "liberte-greek-0", name: "Liberté Greek Yogurt Plain 0%", brand: "Liberté", barcode: "0058755000999",
    blurb: "Canadian brand. Two ingredients and 15g of protein per serving.", amazonQuery: "Liberte Greek yogurt plain 0%" },
  { id: "larabar-apple-pie", name: "Larabar Apple Pie", brand: "Larabar", barcode: "0021908516890",
    blurb: "Three ingredients, sweetened by fruit only. Contains tree nuts.", amazonQuery: "Larabar Apple Pie" },
  { id: "kind-dark-chocolate", name: "KIND Dark Chocolate Nuts & Sea Salt", brand: "KIND", barcode: "0602652173270",
    blurb: "Real nuts first on the ingredient list, and low sugar for a bar.", amazonQuery: "KIND Dark Chocolate Nuts Sea Salt" },
  { id: "wasa-crispbread", name: "Wasa Crispbread Whole Grain", brand: "Wasa", barcode: "0041420064203",
    blurb: "Four ingredients, zero sugar, whole grain.", amazonQuery: "Wasa Crispbread Whole Grain" },
  { id: "skinnypop-original", name: "SkinnyPop Original Popcorn", brand: "SkinnyPop", barcode: "0041660300047",
    blurb: "Popcorn, sunflower oil, salt. Zero sugar.", amazonQuery: "SkinnyPop Original Popcorn" },
  { id: "gimme-seaweed", name: "Gimme Organic Roasted Seaweed", brand: "Gimme", barcode: "0851093001029",
    blurb: "Three ingredients, iodine rich, and the lowest-calorie satisfying snack we score.", amazonQuery: "Gimme Organic Roasted Seaweed" },
];

// ─────────────────────────────────────────────────────────────────────────────
// GORILLA CHEAT LIST (14)
// ─────────────────────────────────────────────────────────────────────────────
const CHEAT_SEEDS: Seed[] = [
  { id: "tostitos-restaurant", name: "Tostitos Restaurant Style", brand: "Frito-Lay", barcode: "0028400590679",
    highlights: ["Corn, oil, salt — that's the list", "No artificial colours"],
    blurb: "Three ingredients. As clean as a mainstream tortilla chip gets.", amazonQuery: "Tostitos Restaurant Style" },
  { id: "miss-vickies-malt-vinegar", name: "Miss Vickie's Sea Salt & Malt Vinegar", brand: "Miss Vickie's", barcode: "0060410016476",
    highlights: ["Kettle cooked", "No artificial colours"],
    blurb: "Kettle chips with a short seasoning list by chip standards.", amazonQuery: "Miss Vickies Sea Salt Malt Vinegar" },
  { id: "lays-classic", name: "Lay's Classic Original", brand: "Frito-Lay", barcode: "0028400090155",
    highlights: ["Potatoes, oil, salt", "No artificial colours"],
    blurb: "Three ingredients. The problem is portion control, not the label.", amazonQuery: "Lays Classic Original" },
  { id: "hardbite-sea-salt", name: "Hardbite Chips Sea Salt", brand: "Hardbite", barcode: "0067040303010",
    highlights: ["Canadian brand", "Three ingredients"],
    blurb: "BC-made kettle chips — potatoes, sunflower oil, sea salt.", amazonQuery: "Hardbite chips sea salt" },
  { id: "lindt-85", name: "Lindt 85% Dark Chocolate", brand: "Lindt", barcode: "0062814133450",
    highlights: ["Low sugar for chocolate", "Real cocoa first"],
    blurb: "At 85% cocoa, sugar drops to a level most chocolate never sees.", amazonQuery: "Lindt 85% dark chocolate" },
  { id: "lindt-70", name: "Lindt 70% Dark Chocolate", brand: "Lindt", barcode: "0062814133443",
    highlights: ["Moderate sugar", "Real cocoa first"],
    blurb: "The entry point to dark chocolate that still counts as dark.", amazonQuery: "Lindt 70% dark chocolate" },
  { id: "green-blacks-70", name: "Green & Black's Organic Dark 70%", brand: "Green & Black's", barcode: "0708656035003",
    highlights: ["Certified organic", "Real cocoa first"],
    blurb: "Organic 70% dark with a clean ingredient list.", amazonQuery: "Green and Blacks organic dark 70" },
  { id: "nature-valley-oats-honey", name: "Nature Valley Crunchy Oats & Honey", brand: "Nature Valley", barcode: "0016000275287",
    highlights: ["Whole grain oats first", "No artificial colours"],
    blurb: "Whole grain oats first, but 11g of sugar keeps it on the cheat list.", amazonQuery: "Nature Valley Crunchy Oats and Honey" },
  { id: "triscuits-original", name: "Triscuits Original", brand: "Nabisco", barcode: "0044000051396",
    highlights: ["Three ingredients", "Whole grain"],
    blurb: "Wheat, oil, salt. One of the cleanest mainstream crackers.", amazonQuery: "Triscuit Original crackers" },
  { id: "breton-original", name: "Breton Original Crackers", brand: "Dare Foods", barcode: "0063600013113",
    highlights: ["Canadian brand"],
    blurb: "Canadian-made. More refined flour than Triscuits, hence the lower score.", amazonQuery: "Breton Original crackers" },
  { id: "smartfood-white-cheddar", name: "Smartfood White Cheddar Popcorn", brand: "Frito-Lay", barcode: "0028400493451",
    highlights: ["Real cheese seasoning"],
    blurb: "Popcorn base is fine — the cheese coating adds fat and sodium.", amazonQuery: "Smartfood White Cheddar popcorn" },
  { id: "boom-chicka-pop", name: "Boom Chicka Pop White Cheddar", brand: "Angie's", barcode: "0607813037016",
    highlights: ["Short ingredient list"],
    blurb: "Slightly cleaner seasoning than Smartfood, same idea.", amazonQuery: "Boom Chicka Pop White Cheddar" },
  { id: "bubly", name: "Bubly Sparkling Water", brand: "PepsiCo", barcode: "0012000174834",
    highlights: ["Zero sugar", "Zero sweeteners", "Zero calories"],
    blurb: "Carbonated water and natural flavour. The default better choice for any soda craving.", amazonQuery: "Bubly sparkling water" },
  { id: "gatorade-original", name: "Gatorade Original", brand: "PepsiCo", barcode: "0052000004567",
    highlights: ["Has a real use case: long, sweaty training"],
    blurb: "Sugar water with electrolytes. Earns its place only during extended training — as a couch drink it scores 30.", amazonQuery: "Gatorade original" },
];

// ─────────────────────────────────────────────────────────────────────────────
// STAY AWAY (18)
// ─────────────────────────────────────────────────────────────────────────────
const AVOID_SEEDS: Seed[] = [
  { id: "doritos", name: "Doritos Nacho Cheese", brand: "Frito-Lay", barcode: "0028400090308",
    blurb: "Synthetic dyes, MSG seasoning, NOVA 4 ultra-processed.", betterAlternative: "Tostitos Restaurant Style — 62" },
  { id: "cheetos", name: "Cheetos", brand: "Frito-Lay", barcode: "0028400090209",
    blurb: "Artificial colours and a seasoning list longer than the food list.", betterAlternative: "SkinnyPop Original — 78" },
  { id: "oreo", name: "Oreo Cookies", brand: "Nabisco", barcode: "0044000030131",
    blurb: "41g sugar per 100g, palm oil, HFCS.", betterAlternative: "Lindt 85% Dark — 65" },
  { id: "pop-tarts", name: "Pop-Tarts", brand: "Kellogg's", barcode: "0038000219351",
    blurb: "HFCS and synthetic dyes, marketed as breakfast.", betterAlternative: "RXBAR Chocolate Sea Salt — 82" },
  { id: "lunchables", name: "Lunchables", brand: "Kraft Heinz", barcode: "0044700038048",
    blurb: "Ultra-processed meat and very high sodium.", betterAlternative: "Chomps Original Beef Sticks — 88" },
  { id: "nutella", name: "Nutella", brand: "Ferrero", barcode: "0009800895023",
    blurb: "First two ingredients: sugar and palm oil. Hazelnuts come third.", betterAlternative: "Lindt 85% Dark — 65" },
  { id: "harvest-crunch", name: "Quaker Harvest Crunch Granola", brand: "Quaker", barcode: "0055577102202",
    blurb: "A dessert-level sugar load wearing a granola costume.", betterAlternative: "Nature Valley Oats & Honey — 52" },
  { id: "clif-bar", name: "Clif Bar", brand: "Clif", barcode: "0722252102729",
    blurb: "Brown rice syrup first ingredient — built for mid-ride fuel, sold as a health bar.", betterAlternative: "RXBAR Chocolate Sea Salt — 82" },
  { id: "vitamin-water", name: "Vitamin Water", brand: "Coca-Cola", barcode: "0786162110013",
    blurb: "Sugar water with a vitamin spray-tan.", betterAlternative: "Bubly Sparkling Water — 82" },
  { id: "activia-strawberry", name: "Activia Strawberry Yogurt", brand: "Danone", barcode: "0038000014833",
    blurb: "The probiotic halo hides a high added-sugar load.", betterAlternative: "Liberté Greek Plain 0% — 91" },
  { id: "special-k-bar", name: "Special K Protein Bar", brand: "Kellogg's", barcode: "0038000012557",
    blurb: "Protein marketing on a candy-bar formulation.", betterAlternative: "RXBAR Chocolate Sea Salt — 82" },
  { id: "old-dutch-party-mix", name: "Old Dutch Party Mix", brand: "Old Dutch", barcode: "0060383060019",
    blurb: "TBHQ, artificial colour, and refined-carb everything.", betterAlternative: "SkinnyPop Original — 78" },
  { id: "humpty-dumpty-cheese", name: "Humpty Dumpty Cheese Sticks", brand: "Old Dutch", barcode: "0060383070025",
    blurb: "Yellow 5 and Yellow 6 in the cheese coating.", betterAlternative: "Hardbite Sea Salt — 60" },
  { id: "arriba-nacho", name: "Arriba Nacho Chips", brand: "Old Dutch", barcode: "0060383089027",
    blurb: "MSG and artificial colour in the seasoning.", betterAlternative: "Tostitos Restaurant Style — 62" },
  { id: "canada-dry-zero", name: "Canada Dry Zero Sugar", brand: "Canada Dry", barcode: "0062100012284",
    blurb: "Zero sugar, but aspartame, ace-K and sodium benzoate keep the score down.", betterAlternative: "Bubly Sparkling Water — 82" },
  { id: "coca-cola", name: "Coca-Cola Regular", brand: "Coca-Cola", barcode: "0069000019832",
    blurb: "39g of sugar per can and caramel colour IV.", betterAlternative: "Bubly Sparkling Water — 82" },
  { id: "pepsi", name: "Pepsi Regular", brand: "PepsiCo", barcode: "0069000008947",
    blurb: "41g of sugar per can.", betterAlternative: "Bubly Sparkling Water — 82" },
  { id: "sprite", name: "Sprite Regular", brand: "Coca-Cola", barcode: "0069000019849",
    blurb: "38g of sugar per can — clear doesn't mean clean.", betterAlternative: "Bubly Sparkling Water — 82" },
];

export const INTEL_APPROVED: IntelProduct[] = APPROVED_SEEDS.map(resolve);
export const INTEL_CHEAT: IntelProduct[] = CHEAT_SEEDS.map(resolve);
export const INTEL_AVOID: IntelProduct[] = AVOID_SEEDS.map(resolve);

export const INTEL_TOTAL_COUNT =
  INTEL_APPROVED.length + INTEL_CHEAT.length + INTEL_AVOID.length;
