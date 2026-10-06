// Reel catalog + seasonal rotation. The engine renders ONE reel per ~3-day slot,
// rotating through every site topic and biased by the month (holidays → food &
// alcohol, January → fitness / New Year / Dry Jan, summer → seltzer & hydration…).
//
// Selection is a pure function of the date, so `pickReel()` is deterministic and
// needs no stored state. Add a reel = add a ReelSpec below. Keep numbers honest:
// prefer a real count, an approximate whole-food score (as the site already shows),
// or no number at all over an invented product score.
//
// No runtime imports here (ReelProps is type-only) so the selector can also run
// standalone via tsx (see reels/which.ts).

import type { ReelProps } from "./schema";

const GOLD = "#e8b23a";
const URL = {
  recipes: "gorillafuel.ca/fitness/recipes",
  alcohol: "gorillafuel.ca/alcohol",
  fitness: "gorillafuel.ca/fitness",
  rankings: "gorillafuel.ca/rankings",
  glutenfree: "gorillafuel.ca/glutenfree",
  scan: "gorillafuel.ca/scan",
  cheat: "gorillafuel.ca/cheat",
  beauty: "gorillafuel.ca/beauty",
  home: "gorillafuel.ca",
};

export type ReelTopic =
  | "recipes" | "beer" | "wine" | "rtd" | "fitness" | "workout"
  | "supplements" | "gluten-free" | "weekly-picks" | "scanner"
  | "non-alc" | "holidays" | "new-year" | "summer" | "cheat" | "beauty";

export type ReelSpec = {
  id: string;
  topic: ReelTopic;
  /** Months (1-12) this reel is especially for. Omit = evergreen (any month). */
  months?: number[];
  /** Ready-to-paste IG caption (+ hashtags). */
  caption: string;
  props: ReelProps;
};

const base = { accent: GOLD };

export const CATALOG: ReelSpec[] = [
  // ───────── EVERGREEN ─────────
  {
    id: "meal-finder",
    topic: "recipes",
    caption:
      "Staring into the fridge isn't a meal plan. 🦍\n\nNew on Gorilla Fuel: the Meal Finder. Tap what you've actually got — we rank the healthy, high-protein meals you can make right now. Every ingredient scored.\n\nNo app. No sign-up. Just real food you already own.\nTry it → gorillafuel.ca/fitness/recipes 🇨🇦\n\n#gorillafuel #mealprep #highprotein #canadianfood #eatclean #fitnessfood #healthyeating #nobs",
    props: {
      ...base,
      topicTag: "New tool · free",
      headline: ["YOU ALREADY", "HAVE DINNER."],
      goldLines: [1],
      sub: "You just don't know it yet. Tap what's in your kitchen — we rank the healthy meals you can make right now.",
      ctaLabel: "Find your meal",
      ctaUrl: URL.recipes,
      pills: [
        { score: 88, name: "Chicken Breast" },
        { score: 95, name: "Broccoli" },
        { score: 82, name: "Brown Rice" },
      ],
      reco: { name: "Chicken & Broccoli Rice Bowl", kcal: 520, protein: 45, tag: "✓ Make it now" },
    },
  },
  {
    id: "scanner-core",
    topic: "scanner",
    caption:
      "Can't pronounce it? Doesn't mean it's bad. 🦍\n\nGorilla Fuel judges the nutrition — not scary-sounding ingredient names. Scan any product, get an honest score out of 100 in seconds.\n\nScan it → gorillafuel.ca/scan 🇨🇦\n\n#gorillafuel #foodscore #nutrition #canadian #healthyeating #ingredients #nobs",
    props: {
      ...base,
      topicTag: "The whole point",
      headline: ["SCAN IT.", "SCORE IT.", "KNOW IT."],
      goldLines: [2],
      sub: "Point your camera at any food, drink or supplement. Get an honest score out of 100 — we judge nutrition, not scary names.",
      ctaLabel: "Scan anything",
      ctaUrl: URL.scan,
    },
  },
  {
    id: "no-sponsors",
    topic: "cheat",
    caption:
      "You can't buy a better score. 🦍\n\nA brand can pay to put a product in front of you — but it can never pay to change its Gorilla Score. Ads get labelled; the score is always just the data.\n\nSee for yourself → gorillafuel.ca 🇨🇦\n\n#gorillafuel #honestreview #nutrition #canadian #nobs #foodtransparency",
    props: {
      ...base,
      topicTag: "Why you can trust it",
      headline: ["SCORES CAN'T", "BE BOUGHT."],
      goldLines: [1],
      sub: "A brand can pay to get a product in front of you — but it can never pay to change its Gorilla Score.",
      ctaLabel: "See the scores",
      ctaUrl: URL.home,
    },
  },
  {
    id: "marketing-vs-food",
    topic: "cheat",
    caption:
      "The marketing is better than the food. 🦍\n\n\"All natural.\" \"Good source of protein.\" \"Made with real fruit.\" The front of the box is an ad. The Gorilla score is the truth.\n\nCheck your snacks → gorillafuel.ca/cheat 🇨🇦\n\n#gorillafuel #marketingvsreality #foodlabels #nutrition #canadian #nobs #healthyeating",
    props: {
      ...base,
      topicTag: "Read the back, not the front",
      headline: ["THE MARKETING", "IS BETTER THAN", "THE FOOD."],
      goldLines: [2],
      sub: "\"All natural.\" \"Good source of protein.\" The front of the box is an ad. We score what's actually inside.",
      ctaLabel: "Check your snacks",
      ctaUrl: URL.cheat,
    },
  },
  {
    id: "protein-powder-hiding",
    topic: "supplements",
    caption:
      "Your protein powder might be hiding something. 🦍\n\nProprietary blends, fillers, under-dosed actives, heavy-metal flags. We rank supplements on purity and third-party testing — not the label hype.\n\nSee the rankings → gorillafuel.ca/rankings 🇨🇦\n\n#gorillafuel #protein #supplements #purity #thirdpartytested #fitness #canadian",
    props: {
      ...base,
      topicTag: "Supplements · ranked",
      headline: ["YOUR PROTEIN", "IS HIDING", "SOMETHING."],
      goldLines: [2],
      sub: "Proprietary blends, fillers, under-dosed actives. We rank supplements on purity and third-party testing — not hype.",
      ctaLabel: "See the rankings",
      ctaUrl: URL.rankings,
    },
  },
  {
    id: "build-a-plate",
    topic: "workout",
    caption:
      "Build the plate, hit the protein. 🦍\n\nNo fancy supplements needed — whole foods that actually score. Here's a high-protein base the Gorilla way.\n\nBuild yours → gorillafuel.ca/fitness/recipes 🇨🇦\n\n#gorillafuel #highprotein #mealprep #fitness #wholefoods #gains #canadian",
    props: {
      ...base,
      topicTag: "Fuel the lift",
      headline: ["BUILD A", "HIGH-PROTEIN", "PLATE."],
      goldLines: [1],
      sub: "No powders required. Whole foods that actually score — stack a protein, a smart carb, and greens.",
      ctaLabel: "Build yours",
      ctaUrl: URL.recipes,
      pills: [
        { score: 90, name: "Salmon" },
        { score: 85, name: "Eggs" },
        { score: 95, name: "Spinach" },
      ],
    },
  },
  {
    id: "gluten-free-truth",
    topic: "gluten-free",
    caption:
      "\"Gluten-free\" is not the same as celiac-safe. 🦍\n\nGluten-REMOVED beer is barley brewed then enzyme-treated — not safe for celiac disease, no matter what the label implies. We call out the difference.\n\nKnow the difference → gorillafuel.ca/glutenfree 🇨🇦\n\n#gorillafuel #glutenfree #celiac #celiacsafe #glutenfreebeer #canadian #nobs",
    props: {
      ...base,
      topicTag: "Celiac truth",
      headline: ["GLUTEN-FREE", "≠ CELIAC-SAFE."],
      goldLines: [1],
      sub: "\"Gluten-removed\" beer is barley, enzyme-treated — not safe for celiac disease. We flag which is which.",
      ctaLabel: "Know the difference",
      ctaUrl: URL.glutenfree,
    },
  },
  {
    id: "clean-beauty-marketing",
    topic: "beauty",
    caption:
      "\"Clean beauty\" is a marketing term, not a standard. 🦍\n\nNobody regulates the word \"clean.\" We score what's actually in your skincare and cosmetics.\n\nScore your shelf → gorillafuel.ca/beauty 🇨🇦\n\n#gorillafuel #cleanbeauty #skincare #beautytruth #ingredients #canadian #nobs",
    props: {
      ...base,
      topicTag: "Beauty · scored",
      headline: ["\"CLEAN BEAUTY\"", "IS MARKETING."],
      goldLines: [1],
      sub: "Nobody regulates the word \"clean.\" We score what's actually in your skincare — not the buzzwords on the front.",
      ctaLabel: "Score your shelf",
      ctaUrl: URL.beauty,
    },
  },
  {
    id: "weekly-picks",
    topic: "weekly-picks",
    caption:
      "This week's Gorilla Picks are up. 🦍\n\nOne pick each in alcohol, food and supplements — independently scored, rotated fresh every week.\n\nSee this week's → gorillafuel.ca 🇨🇦\n\n#gorillafuel #gorillapicks #weeklypicks #canadian #nutrition #honestreview #nobs",
    props: {
      ...base,
      topicTag: "Fresh every week",
      headline: ["THIS WEEK'S", "GORILLA PICKS."],
      goldLines: [1],
      sub: "One pick each in alcohol, food and supplements. Independently scored, rotated fresh every week.",
      ctaLabel: "See this week's",
      ctaUrl: URL.home,
    },
  },

  // ───────── SEASONAL ─────────
  {
    id: "new-year-real-food",
    topic: "new-year",
    months: [1],
    caption:
      "New year. Real food. No crash diet. 🦍\n\nForget the detox teas. Scan what you already eat, swap the worst offenders, keep what scores. Sustainable beats extreme.\n\nStart scanning → gorillafuel.ca/scan 🇨🇦\n\n#gorillafuel #newyear #resolution #healthyeating #2027goals #canadian #nobs",
    props: {
      ...base,
      topicTag: "New year · real food",
      headline: ["NEW YEAR.", "REAL FOOD."],
      goldLines: [1],
      sub: "Forget detox teas. Scan what you already eat, swap the worst offenders, keep what scores. Sustainable wins.",
      ctaLabel: "Start scanning",
      ctaUrl: URL.scan,
    },
  },
  {
    id: "fitness-resolution",
    topic: "fitness",
    months: [1, 2],
    caption:
      "Stop guessing your calories. 🦍\n\nFree macro calculator — BMR → TDEE → your goal → exact daily targets. Then scan products to actually hit them.\n\nRun your numbers → gorillafuel.ca/fitness 🇨🇦\n\n#gorillafuel #macros #calorietracking #fitness #newyear #cutting #bulking #canadian",
    props: {
      ...base,
      topicTag: "Fitness · free tool",
      headline: ["STOP GUESSING", "YOUR CALORIES."],
      goldLines: [1],
      sub: "Free macro calculator: BMR → TDEE → goal → exact daily targets. Then scan to hit them. Nothing leaves your device.",
      ctaLabel: "Run your numbers",
      ctaUrl: URL.fitness,
    },
  },
  {
    id: "dry-january",
    topic: "non-alc",
    months: [1],
    caption:
      "Dry January, done right. 🦍\n\nNon-alcoholic doesn't mean sugar water. We score the NA beers, wines and mocktail bases so you pick the ones actually worth it.\n\nFind the good ones → gorillafuel.ca/alcohol 🇨🇦\n\n#gorillafuel #dryjanuary #nonalcoholic #sobercurious #nabeer #canadian #nobs",
    props: {
      ...base,
      topicTag: "Dry January",
      headline: ["DRY JANUARY,", "DONE RIGHT."],
      goldLines: [1],
      sub: "Non-alcoholic doesn't mean sugar water. We score the NA beers and wines so you pick the ones worth it.",
      ctaLabel: "Find the good ones",
      ctaUrl: URL.alcohol,
    },
  },
  {
    id: "holiday-spread",
    topic: "holidays",
    months: [11, 12],
    caption:
      "The holiday spread, scored. 🦍\n\nBefore you stock the table, check what's actually worth the calories. No guilt — just the data so you spend them where it counts.\n\nScore the table → gorillafuel.ca 🇨🇦\n\n#gorillafuel #holidays #christmasfood #entertaining #canadian #nutrition #nobs",
    props: {
      ...base,
      topicTag: "Holidays",
      headline: ["THE HOLIDAY", "SPREAD, SCORED."],
      goldLines: [1],
      sub: "Before you stock the table, see what's actually worth the calories. No guilt — just spend them where it counts.",
      ctaLabel: "Score the table",
      ctaUrl: URL.home,
    },
  },
  {
    id: "holiday-wine",
    topic: "wine",
    months: [11, 12, 2],
    caption:
      "95 points ≠ good for you. 🦍\n\nCritics score wine on taste. We score it on sugar, calories and additives. A gold-medal bottle can still be a sugar bomb — here's the other scorecard.\n\nCheck the bottle → gorillafuel.ca/alcohol 🇨🇦\n\n#gorillafuel #wine #winelover #sugar #holidays #canadian #nobs #vino",
    props: {
      ...base,
      topicTag: "Wine · the other score",
      headline: ["95 POINTS ≠", "GOOD FOR YOU."],
      goldLines: [1],
      sub: "Critics score wine on taste. We score sugar, calories and additives. A medal winner can still be a sugar bomb.",
      ctaLabel: "Check the bottle",
      ctaUrl: URL.alcohol,
    },
  },
  {
    id: "summer-seltzer",
    topic: "summer",
    months: [5, 6, 7, 8],
    caption:
      "The \"skinny\" seltzer isn't always clean. 🦍\n\nPatio season: not all hard seltzers are created equal. We score the sugar, cals and additives so your fridge actually earns its spot.\n\nStock smart → gorillafuel.ca/alcohol 🇨🇦\n\n#gorillafuel #hardseltzer #patioseason #summer #lowcal #canadian #nobs",
    props: {
      ...base,
      topicTag: "Patio season",
      headline: ["\"SKINNY\" ISN'T", "ALWAYS CLEAN."],
      goldLines: [1],
      sub: "Not every hard seltzer is created equal. We score the sugar, cals and additives so your fridge earns its spot.",
      ctaLabel: "Stock smart",
      ctaUrl: URL.alcohol,
    },
  },
  {
    id: "summer-beer",
    topic: "beer",
    months: [6, 7, 8],
    caption:
      "Same beer. Different story. 🦍\n\nThat \"light\" lager vs the full-fat one — the carb and calorie gap is bigger than the label makes it look. We put the real numbers side by side.\n\nCompare beers → gorillafuel.ca/alcohol 🇨🇦\n\n#gorillafuel #beer #craftbeer #lightbeer #summer #patio #canadian #nobs",
    props: {
      ...base,
      topicTag: "Beer · face-off",
      headline: ["SAME BEER.", "DIFFERENT STORY."],
      goldLines: [1],
      sub: "\"Light\" vs full-fat — the carb and calorie gap is bigger than the label lets on. We line up the real numbers.",
      ctaLabel: "Compare beers",
      ctaUrl: URL.alcohol,
    },
  },
];

export const CATALOG_BY_ID: Record<string, ReelSpec> = Object.fromEntries(CATALOG.map((s) => [s.id, s]));

const EPOCH = Date.UTC(2026, 0, 5); // Monday 2026-01-05
const SLOT_MS = 3 * 24 * 60 * 60 * 1000; // a new reel every ~3 days

/** Whole 3-day slots since the epoch. */
export function currentSlot(d: Date = new Date()): number {
  return Math.floor((d.getTime() - EPOCH) / SLOT_MS);
}

/** Evergreen reels + the ones in season for this month. */
export function seasonalPool(month: number): ReelSpec[] {
  const pool = CATALOG.filter((s) => !s.months || s.months.includes(month));
  return pool.length ? pool : [...CATALOG];
}

/** Deterministic pick for a date: rotate through the month's pool by 3-day slot. */
export function pickReel(d: Date = new Date()): ReelSpec {
  const pool = seasonalPool(d.getUTCMonth() + 1).slice().sort((a, b) => a.id.localeCompare(b.id));
  const slot = currentSlot(d);
  return pool[((slot % pool.length) + pool.length) % pool.length];
}
