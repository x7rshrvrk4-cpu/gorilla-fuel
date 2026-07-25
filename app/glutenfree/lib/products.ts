/**
 * Gluten-free FOOD rankings — breads, pasta, flours, snacks, cereals.
 *
 * Core editorial stance: gluten free does not mean healthy. The Gorilla Score
 * reflects what is actually in the product, not what the label claims.
 */

export type GfFoodTab = "breads" | "pasta" | "flours" | "snacks" | "cereals";

export type GfFoodProduct = {
  id: string;
  name: string;
  /** Tier heading the product is grouped under on its tab. */
  tier: string;
  score: number;
  /** Display override for entries scored as a range (e.g. generic categories). */
  scoreDisplay?: string;
  grade: string;
  blurb: string;
  certifiedGf?: boolean;
  /** Naturally gluten free (single GF ingredient) vs formulated-to-be-GF. */
  naturallyGf?: boolean;
  canadian?: boolean;
  amazonQuery?: string;
};

export const AFFILIATE_TAG = "gorillafuel-20";
export function amazonUrl(query: string): string {
  return `https://www.amazon.ca/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// BREADS
// ─────────────────────────────────────────────────────────────────────────────
export const GF_BREADS: GfFoodProduct[] = [
  { id: "canyon-bakehouse-7-grain", name: "Canyon Bakehouse 7 Grain Bread", tier: "Better Options", score: 55, grade: "B", certifiedGf: true,
    blurb: "Brown rice flour, sunflower seeds, whole grain base. One of the cleaner commercial GF breads. Lower fiber than regular whole grain but better than most GF options. Available at Loblaws Canada.",
    amazonQuery: "Canyon Bakehouse 7 Grain bread gluten free" },
  { id: "little-northern-millet-chia", name: "Little Northern Bakehouse Millet & Chia", tier: "Better Options", score: 58, grade: "B", certifiedGf: true, canadian: true,
    blurb: "Canadian brand. Millet and chia seed base adds protein and fiber. Cleaner than most commercial GF bread. Available at Whole Foods and health food stores across Canada.",
    amazonQuery: "Little Northern Bakehouse Millet Chia bread" },
  { id: "schar-artisan-white", name: "Schär Artisan Baker White", tier: "Better Options", score: 45, grade: "C", certifiedGf: true,
    blurb: "Rice flour and potato starch base. Low fiber but no artificial additives. The most widely available GF bread in Canada. Fine if you need it, but not nutritious." },
  // ── DRAFT additions 2026-07-25 (cache/OFF nutrition-only scoring; NO verified ingredient
  //    list for Queen Street / Little Stream) — certifiedGf/naturallyGf/canadian left UNSET:
  //    verify GF certification + origin against packaging before flagging. ──
  { id: "carbonaut-seeded-bread", name: "Carbonaut Seeded Bread", tier: "Better Options", score: 60, grade: "B",
    blurb: "Scores 60 (Moderate). Standout macros for a gluten free bread — 23.5g fibre and 19g protein per 100g with zero sugar, well above the starch-based GF breads it sits beside. About 235 kcal per 100g, low saturated fat, moderate sodium (1.0g salt/100g). Score reflects the nutrition profile.",
    amazonQuery: "Carbonaut Seeded Bread gluten free" },
  { id: "queen-street-superfood-english-muffin", name: "Queen Street Bakery Superfood English Muffin", tier: "Better Options", score: 60, grade: "B",
    blurb: "Scores 60 (Moderate). 10g fibre per 100g is well above typical GF baked goods, with modest protein (6.3g/100g), low sugar (3.8g/100g) and low saturated fat; about 250 kcal per 100g. No ingredient list on file — scored on the nutrition panel only.",
    amazonQuery: "Queen Street Bakery Superfood English Muffin gluten free" },
  { id: "udis-white-sandwich", name: "Udi's Gluten Free White Sandwich Bread", tier: "Honest Assessments", score: 38, grade: "D", certifiedGf: true,
    blurb: "Tapioca starch and rice flour base. Low fiber, high glycemic, added sugar. Very common in Canada but nutritionally poor. Certified GF — but the GF label doesn't fix the nutrition." },
  { id: "pc-gf-white-bread", name: "PC Gluten Free White Bread", tier: "Honest Assessments", score: 36, grade: "D", certifiedGf: true, canadian: true,
    blurb: "Corn starch, tapioca starch, rice flour — three refined starches as primary ingredients. Zero fiber. Available at Loblaws." },
  { id: "kinnikinnick-white-sandwich", name: "Kinnikinnick White Sandwich Bread", tier: "Honest Assessments", score: 35, grade: "D", certifiedGf: true, canadian: true,
    blurb: "Tapioca and rice starch dominant. Very low fiber, very high glycemic. Certified GF but nutritionally one of the weakest options on this list." },
  // ── DRAFT addition 2026-07-25 (cache nutrition-only scoring; NO verified ingredient list) —
  //    certifiedGf/naturallyGf/canadian left UNSET: verify against packaging before flagging. ──
  { id: "little-stream-buckwheat-loaf", name: "Little Stream Bakery Buckwheat Loaf", tier: "Honest Assessments", score: 42, grade: "C",
    blurb: "Scores 42. Decent fibre (6.9g/100g) and protein (7.9g/100g) for a gluten free loaf and low in saturated fat, but the overall profile lands mid-pack rather than standout. About 219 kcal per 100g. No ingredient list on file — scored on the nutrition panel only.",
    amazonQuery: "Little Stream Bakery Buckwheat Loaf gluten free" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PASTA
// ─────────────────────────────────────────────────────────────────────────────
export const GF_PASTA: GfFoodProduct[] = [
  { id: "banza-chickpea", name: "Banza Chickpea Pasta", tier: "S Tier — Genuinely Nutritious", score: 82, grade: "A", certifiedGf: true, naturallyGf: true,
    blurb: "25g protein, 13g fiber per serving. Made from chickpeas. Available at Costco Canada, Loblaws, Walmart. The best pasta nutritionally — regardless of whether you eat gluten or not.",
    amazonQuery: "Banza chickpea pasta" },
  { id: "tolerant-lentil", name: "Tolerant Lentil Pasta", tier: "S Tier — Genuinely Nutritious", score: 80, grade: "A", certifiedGf: true, naturallyGf: true,
    blurb: "21g protein, high fiber, one ingredient: red lentil flour. Available at health food stores across Canada.",
    amazonQuery: "Tolerant red lentil pasta" },
  { id: "explore-cuisine-chickpea-lentil", name: "Explore Cuisine Chickpea & Red Lentil Pasta", tier: "S Tier — Genuinely Nutritious", score: 79, grade: "A", certifiedGf: true, naturallyGf: true,
    blurb: "Similar profile to Banza — high protein, high fiber.",
    amazonQuery: "Explore Cuisine chickpea red lentil pasta" },
  { id: "ancient-harvest-quinoa", name: "Ancient Harvest Quinoa Pasta", tier: "A Tier — Reasonable Options", score: 68, grade: "B", certifiedGf: true,
    blurb: "Quinoa and corn blend. Better protein and fiber than rice pasta.",
    amazonQuery: "Ancient Harvest quinoa pasta" },
  { id: "tinkyada-brown-rice", name: "Tinkyada Brown Rice Pasta", tier: "A Tier — Reasonable Options", score: 58, grade: "B", certifiedGf: true,
    blurb: "Brown rice base retains some fiber. One of the cleaner rice pastas. Widely available in Canada.",
    amazonQuery: "Tinkyada brown rice pasta" },
  { id: "barilla-gf", name: "Barilla Gluten Free Pasta", tier: "C & D Tier — Common But Nutritionally Poor", score: 45, grade: "C", certifiedGf: true,
    blurb: "Corn and rice blend. Low protein, low fiber. Fine for celiac safety but not nutritious." },
  { id: "catelli-gf", name: "Catelli Gluten Free Pasta", tier: "C & D Tier — Common But Nutritionally Poor", score: 44, grade: "C", certifiedGf: true, canadian: true,
    blurb: "Canadian brand, corn and rice blend. Certified GF but nutritionally poor." },
  { id: "pc-gf-pasta", name: "PC Gluten Free Pasta", tier: "C & D Tier — Common But Nutritionally Poor", score: 43, grade: "C", certifiedGf: true, canadian: true,
    blurb: "Same corn-rice issue. Available at Loblaws. Certified GF but nutritionally weak." },
];

// ─────────────────────────────────────────────────────────────────────────────
// FLOURS
// ─────────────────────────────────────────────────────────────────────────────
export const GF_FLOURS: GfFoodProduct[] = [
  { id: "brm-almond-flour", name: "Bob's Red Mill Super Fine Almond Flour", tier: "S Tier — Genuinely Nutritious", score: 88, grade: "A+", certifiedGf: true, naturallyGf: true,
    blurb: "One ingredient: blanched almonds. High healthy fat, high protein, low carb, low glycemic. The best GF flour nutritionally. Available at Costco, Loblaws, Walmart Canada.",
    amazonQuery: "Bob's Red Mill super fine almond flour" },
  { id: "brm-chickpea-flour", name: "Bob's Red Mill Chickpea Flour", tier: "S Tier — Genuinely Nutritious", score: 85, grade: "A+", certifiedGf: true, naturallyGf: true,
    blurb: "One ingredient: chickpeas. High protein, high fiber. Available at Loblaws Canada.",
    amazonQuery: "Bob's Red Mill chickpea flour" },
  { id: "brm-buckwheat-flour", name: "Bob's Red Mill Buckwheat Flour", tier: "S Tier — Genuinely Nutritious", score: 80, grade: "A", certifiedGf: true, naturallyGf: true,
    blurb: "One ingredient: buckwheat. Complete protein, high fiber. Despite the name, contains zero wheat or gluten.",
    amazonQuery: "Bob's Red Mill buckwheat flour" },
  { id: "brm-quinoa-flour", name: "Bob's Red Mill Quinoa Flour", tier: "A Tier", score: 78, grade: "A", certifiedGf: true, naturallyGf: true,
    blurb: "Complete protein — all essential amino acids.",
    amazonQuery: "Bob's Red Mill quinoa flour" },
  { id: "brm-oat-flour-gf", name: "Bob's Red Mill Oat Flour (Gluten Free)", tier: "A Tier", score: 74, grade: "A", certifiedGf: true,
    blurb: "Certified pure GF oats. Beta glucan for cholesterol. Must be certified GF — not regular oat flour.",
    amazonQuery: "Bob's Red Mill gluten free oat flour" },
  { id: "brm-brown-rice-flour", name: "Bob's Red Mill Brown Rice Flour", tier: "B Tier — Functional But Less Nutritious", score: 58, grade: "B", certifiedGf: true,
    blurb: "Better than white rice flour — retains some fiber and nutrients. Available everywhere in Canada.",
    amazonQuery: "Bob's Red Mill brown rice flour" },
  { id: "brm-1to1-baking", name: "Bob's Red Mill 1-to-1 Gluten Free Baking Flour", tier: "B Tier — Functional But Less Nutritious", score: 52, grade: "B", certifiedGf: true,
    blurb: "Blend of rice flour, tapioca and potato starch. Better than pure tapioca but still refined-dominant. The most convenient GF flour substitute.",
    amazonQuery: "Bob's Red Mill 1 to 1 gluten free baking flour" },
  { id: "king-arthur-measure", name: "King Arthur Measure for Measure GF Flour", tier: "B Tier — Functional But Less Nutritious", score: 50, grade: "B", certifiedGf: true,
    blurb: "Similar blend to Bob's 1-to-1. Widely available in Canada.",
    amazonQuery: "King Arthur Measure for Measure gluten free flour" },
  { id: "pure-tapioca-starch", name: "Pure Tapioca Starch", tier: "D Tier — Nutritionally Poor", score: 28, grade: "D", certifiedGf: true, naturallyGf: true,
    blurb: "Pure refined carbohydrate. No fiber, no protein, no vitamins, no minerals. Spikes blood sugar faster than sugar. Used in almost every commercial GF product — the single worst GF ingredient. If this is the first ingredient in a GF product, it will score poorly." },
  { id: "pure-potato-starch", name: "Pure Potato Starch", tier: "D Tier — Nutritionally Poor", score: 30, grade: "D", certifiedGf: true, naturallyGf: true,
    blurb: "Same problem as tapioca — empty refined carbohydrate." },
  { id: "white-rice-flour", name: "White Rice Flour", tier: "D Tier — Nutritionally Poor", score: 35, grade: "D", certifiedGf: true, naturallyGf: true,
    blurb: "Low nutrients, high glycemic. Better than tapioca but still nutritionally poor." },
];

// ─────────────────────────────────────────────────────────────────────────────
// SNACKS
// ─────────────────────────────────────────────────────────────────────────────
export const GF_SNACKS: GfFoodProduct[] = [
  { id: "marys-organic-crackers", name: "Mary's Organic Crackers", tier: "Approved — Genuinely Clean", score: 80, grade: "A", certifiedGf: true,
    blurb: "Brown rice, quinoa, flax, sesame. The best GF cracker — whole food ingredients front to back.",
    amazonQuery: "Mary's Organic Crackers" },
  { id: "simple-mills-almond-crackers", name: "Simple Mills Almond Flour Crackers", tier: "Approved — Genuinely Clean", score: 74, grade: "A", certifiedGf: true, naturallyGf: true,
    blurb: "Almond flour base, clean short ingredient list. Available at Costco Canada and Whole Foods.",
    amazonQuery: "Simple Mills almond flour crackers" },
  { id: "siete-tortilla-chips", name: "Siete Grain Free Tortilla Chips", tier: "Approved — Genuinely Clean", score: 72, grade: "A", certifiedGf: true, naturallyGf: true,
    blurb: "Cassava and coconut flour. Grain free AND gluten free. Clean, short ingredient list.",
    amazonQuery: "Siete grain free tortilla chips" },
  { id: "glutino-crackers", name: "Glutino Crackers", tier: "Middle Ground", score: 40, grade: "C", certifiedGf: true,
    blurb: "Corn starch based. Refined. Common in Canada but not nutritious. Safe for celiac disease but a poor nutrition score." },
  { id: "kinnikinnick-graham", name: "Kinnikinnick Graham Crackers", tier: "Middle Ground", score: 38, grade: "D", certifiedGf: true, canadian: true,
    blurb: "Tapioca and rice starch, added sugar. Safe for celiac disease but nutritionally poor." },
  { id: "glutino-creme-cookies", name: "Glutino Chocolate Vanilla Creme Cookies", tier: "Stay Away — GF Health Halo Traps", score: 22, grade: "D", certifiedGf: true,
    blurb: "The GF label does not change the fact this is a cookie with refined starch and significant sugar. Same nutrition profile as a regular cookie." },
  { id: "enjoy-life-choc-chip", name: "Enjoy Life Chocolate Chip Cookies", tier: "Stay Away — GF Health Halo Traps", score: 28, grade: "D", certifiedGf: true,
    blurb: "Allergy friendly and GF — but significant sugar and refined flour. Safe for multiple allergies, still a cookie. Not a health food despite the health-halo packaging." },
];

// ─────────────────────────────────────────────────────────────────────────────
// CEREALS
// ─────────────────────────────────────────────────────────────────────────────
export const GF_CEREALS: GfFoodProduct[] = [
  { id: "natures-path-gf-oats", name: "Nature's Path Certified Gluten Free Rolled Oats", tier: "Better Options", score: 76, grade: "A", certifiedGf: true, canadian: true,
    blurb: "Canadian brand. Certified pure GF oats — beta glucan for cholesterol. The best GF cereal base. Available across Canada.",
    amazonQuery: "Nature's Path gluten free rolled oats" },
  { id: "brm-gf-muesli", name: "Bob's Red Mill Gluten Free Muesli", tier: "Better Options", score: 68, grade: "B", certifiedGf: true,
    blurb: "Certified GF oats, seeds and dried fruit. No added sugar in the base version.",
    amazonQuery: "Bob's Red Mill gluten free muesli" },
  { id: "natures-path-mesa-sunrise", name: "Nature's Path Mesa Sunrise", tier: "Better Options", score: 65, grade: "B", certifiedGf: true, canadian: true,
    blurb: "Canadian brand. Corn, flax, quinoa, amaranth blend. Better than most GF cereals.",
    amazonQuery: "Nature's Path Mesa Sunrise cereal" },
  { id: "chex-rice", name: "Chex Rice", tier: "Middle Ground", score: 48, grade: "C", certifiedGf: true,
    blurb: "Refined rice base but no artificial anything. The most widely available GF cereal in Canada. Fortified, which helps the score slightly." },
  { id: "corn-flakes-gf", name: "Corn Flakes (certified GF versions only)", tier: "Middle Ground", score: 42, grade: "C", certifiedGf: true,
    blurb: "Naturally GF only if no malt flavouring is added — check the label, many versions (including standard Kellogg's) contain barley malt and are NOT gluten free. Refined corn base, added sugar." },
  { id: "honey-nut-cheerios", name: "Honey Nut Cheerios", tier: "Stay Away", score: 38, grade: "D",
    blurb: "US boxes carry a gluten-free claim, but Canadian Cheerios are NOT labelled gluten free — Health Canada has not accepted the claim for oats sorted this way, and the Canadian Celiac Association does not recommend them for celiac disease. Added sugar, honey coating, refined oat base — the marketing does not make this a health food." },
  { id: "generic-gf-granola", name: "Most GF Granola Products", tier: "Stay Away", score: 40, scoreDisplay: "35–45", grade: "D",
    blurb: "Typically contain significant added sugar, palm oil and refined ingredients despite GF and natural marketing. Check the Gorilla Approved section for genuinely clean granola-style options instead." },
];

export const GF_FOOD_TABS: { key: GfFoodTab; label: string; products: GfFoodProduct[]; note: string }[] = [
  { key: "breads", label: "Breads", products: GF_BREADS,
    note: "The best gluten free bread for nutrition is homemade using almond flour or chickpea flour. Commercial GF bread is a convenience product, not a health food. If you have celiac disease it is essential. If you are gluten free by choice, consider whether the processed replacement is actually better than what you replaced." },
  { key: "pasta", label: "Pasta", products: GF_PASTA,
    note: "Chickpea and lentil pasta are not just gluten free — they are genuinely more nutritious than regular wheat pasta. Banza has more protein per serving than chicken breast per calorie. If you are switching to GF pasta, start here — not with corn or rice versions." },
  { key: "flours", label: "Flours", products: GF_FLOURS,
    note: "For everyday baking, the best results come from combining almond flour (for fat and protein) with a small amount of tapioca or arrowroot for binding. Minimizing the refined starch content and maximizing the whole food flour content will always result in a better Gorilla Score — and better nutrition." },
  { key: "snacks", label: "Snacks", products: GF_SNACKS,
    note: "A GF cookie is still a cookie. The certification protects people with celiac disease — it says nothing about sugar, refined starch, or processing." },
  { key: "cereals", label: "Cereals", products: GF_CEREALS,
    note: "Certified pure oats are the strongest GF breakfast base. Most boxed GF cereal is refined grain with added sugar wearing a health-halo label." },
];

export const GF_FOOD_TOTAL_COUNT =
  GF_BREADS.length + GF_PASTA.length + GF_FLOURS.length + GF_SNACKS.length + GF_CEREALS.length;
