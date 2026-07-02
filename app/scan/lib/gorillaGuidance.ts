import type { OffProduct } from "./openFoodFacts";

export type Alternative =
  | { type: "off-match"; product: OffProduct; score: number }
  | { type: "gorilla-suggestion"; headline: string; brands?: string };

type Suggestion = { headline: string; brands?: string };

const CATEGORY_MAP: Record<string, Suggestion> = {
  // ── Sauces & condiments ──
  "barbecue-sauces": {
    headline:
      "Look for BBQ sauces with under 8g sugar per serving and no sodium benzoate. Most commercial BBQ sauces are built on high-fructose corn syrup.",
    brands:
      "Primal Kitchen and Tessamae's are significantly cleaner options worth checking.",
  },
  "ketchup": {
    headline:
      "Look for ketchup with no HFCS and under 4g sugar per serving. Most standard ketchups are high-fructose corn syrup with tomato paste.",
    brands:
      "Sir Kensington's, Primal Kitchen, and Muir Glen Organic are cleaner alternatives.",
  },
  "mayonnaises": {
    headline:
      "Look for mayo made with avocado oil or olive oil. Most commercial mayo uses refined soybean oil — high in omega-6 with no nutritional benefit.",
    brands:
      "Primal Kitchen Avocado Oil Mayo and Sir Kensington's Avocado Oil Mayo are the cleanest options.",
  },
  "hot-sauces": {
    headline:
      "Hot sauce is one of the cleaner condiment categories. Look for options with 3 ingredients or fewer — pepper, vinegar, salt.",
    brands:
      "Cholula, Crystal, and Tabasco are among the simplest ingredient lists in the category.",
  },
  "sauces": {
    headline:
      "Look for sauces with no artificial colours, no sodium benzoate, and a recognisable ingredient list under 10 items.",
    brands:
      "Rao's Homemade, Primal Kitchen, and Muir Glen are consistently cleaner across the sauce category.",
  },
  "condiments": {
    headline:
      "Look for condiments with no artificial colours, no sodium benzoate, and under 4g sugar per serving.",
    brands:
      "Primal Kitchen, Sir Kensington's, and Tessamae's offer cleaner ingredient lists across most condiment types.",
  },
  "salad-dressings": {
    headline:
      "Most bottled dressings use industrial seed oils, sodium benzoate, and added sugar. Look for dressings made with avocado or olive oil as the first fat ingredient.",
    brands:
      "Primal Kitchen, Tessamae's, and Chosen Foods use avocado or olive oil bases without preservatives.",
  },

  // ── Cereals ──
  "breakfast-cereals": {
    headline:
      "Look for cereals with at least 5g fibre per serving, under 8g sugar, and whole grain as the first ingredient. Avoid artificial colours — Red 40, Yellow 5, and Blue 1 are common in sweetened cereals.",
    brands:
      "Bob's Red Mill, Nature's Path Organic, and Kashi offer higher-fibre, lower-additive options.",
  },
  "cereals": {
    headline:
      "Look for cereals with at least 5g fibre per serving, under 8g sugar, and whole grain as the first ingredient.",
    brands: "Bob's Red Mill, Nature's Path Organic, and Kashi are consistently cleaner choices.",
  },
  "oatmeals": {
    headline:
      "Plain rolled oats are the benchmark — single ingredient, high fibre, no additives. Instant oat packets are loaded with sugar and artificial flavours.",
    brands:
      "Bob's Red Mill, Quaker Old Fashioned, or any plain rolled oat with one ingredient is the correct answer.",
  },

  // ── Chips & snacks ──
  "chips-and-crisps": {
    headline:
      "Look for baked versions or brands with 3 ingredients or fewer — potato, oil, salt. Avoid MSG, artificial flavours, and synthetic colour additives.",
    brands:
      "Kettle Brand, Boulder Canyon, and Terra Chips offer shorter ingredient lists. For a true upgrade, air-popped popcorn or rice cakes.",
  },
  "crisps": {
    headline:
      "Look for crisps with 3 ingredients or fewer — potato, oil, salt. Avoid synthetic flavour powders and artificial colours.",
    brands: "Kettle Brand and Boulder Canyon are consistently cleaner across the snack aisle.",
  },
  "snacks": {
    headline:
      "Look for snacks with 5 ingredients or fewer, no artificial colours or flavours, and under 200 calories per serving.",
    brands:
      "For packaged snacks, KIND bars, Larabar, and RXBar have the shortest, most recognisable ingredient lists.",
  },
  "popcorn": {
    headline:
      "Air-popped popcorn with olive oil and salt is the cleanest snack in this category. Pre-packaged microwave popcorn often contains PFAS-lined bags and artificial butter flavour.",
    brands: "SkinnyPop and Angie's Boomchickapop are relatively clean packaged options.",
  },
  "crackers": {
    headline:
      "Look for crackers with whole grain as the first ingredient, under 200mg sodium per serving, and no partially hydrogenated oils.",
    brands: "Simple Mills, Mary's Gone Crackers, and Wasa Crispbread are cleaner options.",
  },
  "granola-bars": {
    headline:
      "Most granola bars are cookies in disguise. Look for bars with real nuts or seeds as the first ingredient, under 8g sugar, and no high-fructose corn syrup.",
    brands: "RXBar, KIND, and Larabar have the most transparent and shortest ingredient lists.",
  },
  "protein-bars": {
    headline:
      "Look for protein bars with real food as the protein source — nuts, seeds, egg white — rather than soy protein isolate. Under 10g sugar and no sugar alcohols that cause GI distress.",
    brands: "RXBar, KIND Protein, and Aloha bars are among the cleaner options in the category.",
  },

  // ── Soft drinks ──
  "sodas": {
    headline:
      "Replace with sparkling water, unsweetened sparkling water with real fruit, or water kefir. Even diet versions use aspartame or acesulfame-K which carry their own concerns.",
    brands: "Spindrift, Sanpellegrino (plain), and Waterloo sparkling water are the recommended swaps.",
  },
  "colas": {
    headline:
      "Colas are the highest-risk soft drink — caramel colour IV, phosphoric acid, and often HFCS. Water, sparkling water, or kombucha are the only real upgrades.",
    brands: "Spindrift or plain sparkling water are the recommended swaps.",
  },
  "energy-drinks": {
    headline:
      "Most energy drinks carry artificial colours, taurine at unverified doses, and high caffeine. Coffee or matcha gives you the caffeine with none of the synthetic additives.",
    brands: "If you need a canned option, Celsius (original) and Guru Organic are cleaner choices.",
  },
  "soft-drinks": {
    headline:
      "Replace sweetened soft drinks with sparkling water or unsweetened options. Sugar-sweetened beverages are the most direct dietary driver of metabolic disease.",
    brands:
      "Spindrift, Waterloo, and plain sparkling water with a squeeze of citrus are the recommended alternatives.",
  },
  "fruit-juices": {
    headline:
      "Whole fruit is the upgrade from juice. Juice removes fibre and concentrates sugar — a glass of OJ has the same sugar as a can of cola.",
    brands:
      "Eat the fruit. If you need a liquid option, cold-pressed juice without added sugar is the next best thing.",
  },

  // ── Sweets & desserts ──
  "chocolates": {
    headline:
      "Look for dark chocolate with 70%+ cocoa and no artificial flavours. Ideal ingredient list: cocoa mass, cocoa butter, and sugar only.",
    brands: "Lindt 70%+, Alter Eco, and Green & Black's Organic are reliably clean.",
  },
  "cookies": {
    headline:
      "Look for cookies without hydrogenated oils, HFCS, or artificial colours. Under 10g sugar per serving and a recognisable ingredient list.",
    brands: "Simple Mills, Enjoy Life, and Back to Nature offer cleaner baked snack options.",
  },
  "ice-creams": {
    headline:
      "Look for ice cream with recognisable ingredients — cream, milk, sugar, eggs, natural flavour. Avoid carrageenan, mono and diglycerides, and artificial colours.",
    brands: "Jeni's, Salt & Straw, and Häagen-Dazs original flavours have the shortest, cleanest lists.",
  },
  "candies": {
    headline:
      "Most candy is a delivery vehicle for artificial colours, HFCS, and synthetic flavours. Look for options coloured with real fruit or vegetable extracts.",
    brands: "Surf Sweets, YumEarth, and Unreal use natural colours and simpler ingredient lists.",
  },

  // ── Dairy ──
  "yogurts": {
    headline:
      "Plain full-fat Greek yogurt with no additives is the gold standard. Most flavoured yogurts carry artificial colours and 15–25g of added sugar.",
    brands: "Siggi's, Chobani Plain, and Organic Valley plain yogurt are the cleanest options.",
  },

  // ── Bread & baked goods ──
  "breads": {
    headline:
      "Look for bread with whole grain as the first ingredient, under 3g sugar per slice, and no calcium propionate (E282) or azodicarbonamide.",
    brands:
      "Ezekiel 4:9, Dave's Killer Bread (original recipe), and local bakery sourdough are the recommended alternatives.",
  },

  // ── Spreads ──
  "nut-butters": {
    headline:
      "Look for nut butters with one ingredient — just the nut. Most commercial nut butters add hydrogenated palm oil, sugar, and salt unnecessarily.",
    brands: "Kirkland Organic (Costco), Crazy Richard's, and Once Again are single-ingredient options.",
  },
  "peanut-butters": {
    headline:
      "Look for peanut butter with one ingredient — peanuts. Stirring is normal and a sign the product hasn't been stabilised with hydrogenated oil.",
    brands:
      "Natural peanut butter from any brand with just peanuts on the label. Kirkland Organic at Costco is the best value.",
  },

  // ── Frozen ──
  "frozen-meals": {
    headline:
      "Look for frozen meals with under 700mg sodium, recognisable ingredients, and no artificial colours or flavours. Shorter ingredient lists are a reliable quality signal.",
    brands:
      "Amy's, Luvo, and Trader Joe's organic frozen options are generally cleaner than major commercial brands.",
  },
  "frozen-pizzas": {
    headline:
      "Look for frozen pizza with a short crust ingredient list — flour, water, yeast, salt — and real cheese rather than a processed cheese food product.",
    brands: "Rao's Frozen Pizza and Amy's are cleaner options with recognisable ingredient lists.",
  },

  // ── Supplements ──
  "dietary-supplements": {
    headline:
      "Look for supplements certified by NSF Certified for Sport or Informed Sport. These are the only third-party programs that verify what's on the label is actually in the product.",
    brands:
      "Thorne, Pure Encapsulations, and Momentous consistently pass independent testing across multiple supplement categories.",
  },

  // ── Generic fallback ──
  "generic": {
    headline:
      "Look for a version of this product with fewer ingredients, no artificial colours or preservatives, and a shorter processing chain. Shorter ingredient lists are almost always a quality signal.",
  },
};

// ── Name-keyword → category inference ────────────────────────────────────────
// The universal fallback for the ~84.5% of products that arrive with NO category
// tags: infer a category from the product NAME so a tag-less "granola bar" still
// gets its specific advice instead of the generic catch-all.
//
// CONSERVATIVE BY DESIGN (this is the same name-matching mechanism that caused the
// Kashi candy-cap bug): rules use SPECIFIC multi-word tokens, never loose ones.
//   • never bare "bar" or bare "chocolate" (a chocolate granola bar is a BAR) —
//     require "granola/cereal/… bar" or "chocolate bar";
//   • never bare "chips" (chocolate chips) — require "potato/tortilla/… chip";
//   • ordered so composites resolve correctly ("granola bar" before "chocolate
//     bar"; "cookie" before "oatmeal", so "oatmeal cookies" → cookies).
// Anything without a CLEAR category token returns null → generic. A wrong guess is
// worse than a generic suggestion: conservative-or-generic, never confident-wrong.
const NAME_CATEGORY_RULES: { re: RegExp; slug: string }[] = [
  // — bars (specific bar types only; "granola bar" wins over "chocolate bar") —
  { re: /\b(granola|cereal|m[üu]esli|oat|whole[\s-]?grain|chewy|snack|fruit|nut|seed)\s+bars?\b/i, slug: "granola-bars" },
  { re: /\bprotein\s+bars?\b/i, slug: "protein-bars" },
  { re: /\bcandy\s+bars?\b/i, slug: "candies" },
  { re: /\bchocolate\s+bars?\b/i, slug: "chocolates" },
  // — baked (before oatmeal/cereal: "oatmeal cookies" / "cereal biscuits" → cookies) —
  { re: /\b(cookies?|biscuits?|wafers?|shortbread)\b/i, slug: "cookies" },
  // — chips / salty (never bare "chips") —
  { re: /\b(potato|tortilla|corn|kettle|veggie|vegetable|pita|bagel)\s+chips?\b/i, slug: "chips-and-crisps" },
  { re: /\bcrisps?\b/i, slug: "crisps" },
  { re: /\bpopcorn\b/i, slug: "popcorn" },
  { re: /\b(crackers?|crispbreads?)\b/i, slug: "crackers" },
  // — drinks —
  { re: /\bcolas?\b/i, slug: "colas" },
  { re: /\benergy\s+drinks?\b/i, slug: "energy-drinks" },
  { re: /\b(sodas?|soft\s+drinks?|soda\s+pop)\b/i, slug: "soft-drinks" },
  { re: /\bjuices?\b/i, slug: "fruit-juices" },
  // — frozen sweets / candy —
  { re: /\b(ice\s*cream|gelato|sorbets?|frozen\s+yog(?:urt|hurt|ourt|hourt))\b/i, slug: "ice-creams" },
  { re: /\b(candy|candies|gummies?|gummy|licorice|liquorice|lollipops?|jelly\s+beans?|marshmallows?)\b/i, slug: "candies" },
  // — dairy —
  { re: /\byog(?:urt|hurt|ourt|hourt)s?\b/i, slug: "yogurts" },
  // — spreads (peanut before generic nut) —
  { re: /\bpeanut\s+butters?\b/i, slug: "peanut-butters" },
  { re: /\b(almond|cashew|sunflower|nut)\s+butters?\b/i, slug: "nut-butters" },
  // — cereal / oats (after cookies & bars) —
  { re: /\b(oatmeal|porridge|rolled\s+oats)\b/i, slug: "oatmeals" },
  { re: /\b(breakfast\s+cereals?|cereals?)\b/i, slug: "cereals" },
  // — bakery (tortilla/pita CHIPS already handled above) —
  { re: /\b(breads?|bagels?|baguettes?|sourdough|tortillas?|pitas?)\b/i, slug: "breads" },
  // — condiments —
  { re: /\bketchup\b/i, slug: "ketchup" },
  { re: /\b(mayo|mayonnaise)\b/i, slug: "mayonnaises" },
  { re: /\b(bbq|barbecue|barbeque)\s+sauce\b/i, slug: "barbecue-sauces" },
  { re: /\bhot\s+sauce\b/i, slug: "hot-sauces" },
  { re: /\b(salad\s+dressings?|vinaigrettes?)\b/i, slug: "salad-dressings" },
  { re: /\b(pasta\s+sauce|marinara|tomato\s+sauce|pizza\s+sauce)\b/i, slug: "sauces" },
  // — frozen meals —
  { re: /\bfrozen\s+pizzas?\b/i, slug: "frozen-pizzas" },
  { re: /\bfrozen\s+(meals?|dinners?|entr[ée]es?)\b/i, slug: "frozen-meals" },
];

/** Infer a CATEGORY_MAP slug from a product NAME, conservatively. Returns null
 *  when the name doesn't clearly indicate a category (→ caller uses generic). */
export function inferCategorySlugFromName(productName: string | null | undefined): string | null {
  const name = (productName ?? "").toLowerCase();
  if (!name.trim()) return null;
  for (const rule of NAME_CATEGORY_RULES) {
    if (rule.re.test(name)) return rule.slug;
  }
  return null;
}

/** Returns a Gorilla Suggestion card for a product's category tags, falling back
 *  to NAME-based inference (for the tag-less majority) before the generic card.
 *  Always returns at least the generic fallback. */
export function gorillaSuggestionsFor(categoriesTags: string[], productName?: string | null): Alternative[] {
  // Most specific category first (OFF stores tags general → specific)
  const slugs = (categoriesTags ?? [])
    .map((t) => t.replace(/^[a-z]{2}:/, "").toLowerCase())
    .reverse();

  // Exact match — most specific wins
  for (const slug of slugs) {
    const s = CATEGORY_MAP[slug];
    if (s) return [{ type: "gorilla-suggestion", headline: s.headline, brands: s.brands }];
  }

  // Partial match — e.g. "organic-barbecue-sauces" matches "barbecue-sauces"
  for (const slug of slugs) {
    for (const [key, s] of Object.entries(CATEGORY_MAP)) {
      if (key === "generic") continue;
      if (slug.includes(key) || key.includes(slug)) {
        return [{ type: "gorilla-suggestion", headline: s.headline, brands: s.brands }];
      }
    }
  }

  // NAME-based inference — the universal fallback for tag-less products.
  const nameSlug = inferCategorySlugFromName(productName);
  if (nameSlug) {
    const s = CATEGORY_MAP[nameSlug];
    if (s) return [{ type: "gorilla-suggestion", headline: s.headline, brands: s.brands }];
  }

  const generic = CATEGORY_MAP["generic"]!;
  return [{ type: "gorilla-suggestion", headline: generic.headline, brands: generic.brands }];
}
