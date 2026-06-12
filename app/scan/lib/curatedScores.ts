/**
 * Hardcoded Gorilla Score overrides — curated scores always win over the
 * scoring algorithm. Checked by barcode (exact) then by product-name pattern.
 *
 * Three tiers:
 *   GORILLA APPROVED  — S/A+/A → "Excellent" grade
 *   GORILLA CHEAT LIST — B     → "Good"    grade
 *   STAY AWAY         — C/D   → "Poor" / "Bad" grade
 */

import type { Grade } from "./scoring";

export type ScoreOverride = {
  score: number;
  grade: Grade;
  flags: string[];
  positives: string[];
};

type BarcodeEntry = { barcode: string; override: ScoreOverride };
type NameEntry = { patterns: RegExp[]; override: ScoreOverride };

// ── Helper ────────────────────────────────────────────────────────────────────
function o(score: number, grade: Grade, positives: string[] = [], flags: string[] = []): ScoreOverride {
  return { score, grade, flags, positives };
}

// ─────────────────────────────────────────────────────────────────────────────
// GORILLA APPROVED
// ─────────────────────────────────────────────────────────────────────────────
const RXBAR              = o(82, "Excellent", ["Whole food ingredients only", "No additives", "High protein"]);
const CHOMPS_BEEF        = o(88, "Excellent", ["Grass fed", "Zero sugar", "Zero additives"]);
const CHOMPS_TURKEY      = o(87, "Excellent", ["Free range", "Zero sugar", "Zero additives"]);
const PISTACHIOS         = o(85, "Excellent", ["Two ingredients", "Healthy fat", "Good protein"]);
const ALMONDS            = o(90, "Excellent", ["One ingredient", "Perfect macros"]);
const PUMPKIN_SEEDS      = o(88, "Excellent", ["One ingredient", "Highest magnesium of any snack"]);
const NOMZ               = o(78, "Excellent", ["Canadian brand", "Five whole food ingredients", "Date sweetened only"]);
const LIBERTE_GREEK      = o(91, "Excellent", ["Canadian brand", "Two ingredients", "15g protein"]);
const LARABAR_APPLE      = o(76, "Excellent", ["Three ingredients", "Fruit sweetened only"]);
const KIND_DARK_CHOC     = o(71, "Excellent", ["Real nuts first", "Low sugar for a bar"]);
const WASA_CRISPBREAD    = o(80, "Excellent", ["Four ingredients", "Zero sugar", "Whole grain"]);
const SKINNYPOP_OG       = o(78, "Excellent", ["Three ingredients", "Zero sugar"]);
const GIMME_SEAWEED      = o(85, "Excellent", ["Three ingredients", "Iodine rich", "Lowest calorie satisfying snack"]);

// ─────────────────────────────────────────────────────────────────────────────
// GORILLA CHEAT LIST
// ─────────────────────────────────────────────────────────────────────────────
const TOSTITOS           = o(62, "Good");
const MISS_VICKIES       = o(55, "Good");
const LAYS_CLASSIC       = o(58, "Good");
const HARDBITE           = o(60, "Good");
const LINDT_85           = o(65, "Good");
const LINDT_70           = o(60, "Good");
const GREEN_BLACKS_70    = o(62, "Good");
const NATURE_VALLEY_OAT  = o(52, "Good");
const TRISCUITS          = o(60, "Good");
const BRETON             = o(55, "Good");
const SMARTFOOD_CHEDDAR  = o(50, "Good");
const BOOM_CHICKA_WHITE  = o(52, "Good");
const BUBLY              = o(82, "Excellent");
const GATORADE           = o(30, "Bad");   // D tier despite score ≥25
const GATORADE_ZERO      = o(52, "Good");
const BABYBEL            = o(82, "Excellent", ["Four ingredients", "Individual portion", "5g protein"]);

// ─────────────────────────────────────────────────────────────────────────────
// STAY AWAY
// ─────────────────────────────────────────────────────────────────────────────
const DORITOS            = o(20, "Bad");
const CHEETOS            = o(15, "Bad");
const OREO               = o(22, "Bad");
const POP_TARTS          = o(18, "Bad");
const LUNCHABLES         = o(25, "Bad");
const NUTELLA            = o(28, "Bad");
const HARVEST_CRUNCH     = o(35, "Poor");
const CLIF_BAR           = o(38, "Poor");
const VITAMIN_WATER      = o(32, "Bad");
const ACTIVIA_STRAW      = o(35, "Poor");
const SPECIAL_K_BAR      = o(33, "Bad");
const OLD_DUTCH_PARTY    = o(22, "Bad");   // corrected 30 → 22 (2026-06 recalibration)
const OLD_DUTCH_RIPPLE   = o(28, "Bad");
const OLD_DUTCH_KETCHUP  = o(25, "Bad");
const OLD_DUTCH_DRESSED  = o(25, "Bad");
const HUMPTY_DUMPTY_CHZ  = o(22, "Bad");
const HD_RIPPLE          = o(22, "Bad");
const HD_CHEESE_CURLS    = o(18, "Bad");
const HD_ONION_RINGS     = o(20, "Bad");
const HD_PARTY_MIX       = o(20, "Bad");
const HD_BBQ             = o(25, "Bad");
const HD_SALT_VINEGAR    = o(28, "Bad");
const HD_SOUR_CREAM      = o(24, "Bad");
const OREO_DOUBLE        = o(20, "Bad");
const LUCKY_CHARMS       = o(18, "Bad");
const FROOT_LOOPS        = o(20, "Bad");
const FRUIT_BY_FOOT      = o(18, "Bad");
const GUSHERS            = o(15, "Bad");
const DUNKAROOS          = o(22, "Bad");
const WELCHS_SNACKS      = o(22, "Bad");
const KOOL_AID_JAMMERS   = o(15, "Bad");
const ARRIBA_NACHO       = o(28, "Bad");
const CANADA_DRY_ZERO    = o(48, "Poor");
const COCA_COLA          = o(23, "Bad");
const PEPSI_REGULAR      = o(22, "Bad");
const SPRITE_REGULAR     = o(24, "Bad");

// ─────────────────────────────────────────────────────────────────────────────
// LAKER — Carlsberg Canada / Waterloo Brewing. Any Laker that ends up in
// the food scoring path (rare, but possible if OFF lacks alcohol categories)
// gets a hard score override rather than the algorithm's default ~90.
// ─────────────────────────────────────────────────────────────────────────────
const LAKER_ICE          = o(38, "Poor",  [], ["High ABV ice beer", "High calorie", "NOVA Group 4"]);
const LAKER_LAGER        = o(45, "Poor",  [], ["Mainstream value lager", "Moderate calorie"]);
const LAKER_LIGHT        = o(52, "Good",  [], ["Light lager", "Lower calorie"]);
const LAKER_PREMIUM      = o(48, "Poor",  [], ["Value premium lager"]);

// ─────────────────────────────────────────────────────────────────────────────
// SNACK CALIBRATION TARGETS — confirmed via real-world scanning 2026-06
// Christie/Nabisco/Mondelez biscuit line. These barcodes came from Canadian
// UPC labels returned by the UPC database with inflated algorithm scores.
// ─────────────────────────────────────────────────────────────────────────────
const RITZ              = o(48, "Poor", [], ["Enriched flour first ingredient", "Palm oil", "Moderately processed biscuit"]);
const CHIPS_AHOY        = o(28, "Bad",  [], ["High sugar", "Palm oil", "Artificial flavour", "Christie/Nabisco ultra-processed cookie"]);
const BTS_OREO          = o(30, "Bad",  [], ["Novelty cookie high sugar", "Ultra-processed", "Christie limited edition"]);

// ─────────────────────────────────────────────────────────────────────────────
// SAUCE & CONDIMENT CALIBRATION — confirmed 2026-06 vs Yuka real-world scans
// ─────────────────────────────────────────────────────────────────────────────
const PRIMO_PIZZA_SQUEEZE    = o(48, "Poor", [], ["Sodium benzoate preservative", "Modified corn starch", "Unspecified vegetable oil", "Ultra-processed tomato sauce"]);
const CLASSICO_VODKA         = o(42, "Poor", [], ["NOVA Group 4", "Sodium phosphates emulsifier", "Multi-cheese processed sauce", "Database stores full 600g jar as serving size"]);
const COMPLIMENTS_RICE       = o(63, "Good", ["No added sugar", "Four clean ingredients", "Zero artificial additives"], ["Corn maltodextrin (processed starch)", "NOVA Group 4"]);

// ─────────────────────────────────────────────────────────────────────────────
// BARCODE LOOKUP TABLE  (first match wins — exact after stripping leading zeros)
// ─────────────────────────────────────────────────────────────────────────────
const BARCODE_OVERRIDES: BarcodeEntry[] = [
  // ── Products already in curatedFoods.ts ──
  { barcode: "0028400090308", override: DORITOS },             // Doritos (corrected 2026-06: was misassigned to Lay's)
  { barcode: "0028400090155", override: LAYS_CLASSIC },        // Lay's Classic (verified barcode)
  { barcode: "0028400590679", override: TOSTITOS },            // Tostitos Restaurant Style (verified barcode)
  { barcode: "0044000030131", override: OREO },                // Oreo Original (US Nabisco)
  { barcode: "066721028105",  override: OREO },                // Oreo Original Christie Canada
  { barcode: "0066721028105", override: OREO },                // Oreo Original Christie Canada (with leading zero)
  { barcode: "066721031020",  override: RITZ },                // Ritz Soccer Shapes Christie Canada
  { barcode: "0066721031020", override: RITZ },                // Ritz Soccer Shapes Christie Canada (with leading zero)
  { barcode: "0066721030153", override: BTS_OREO },            // BTS Brown Sugar Pancake Oreo Christie
  { barcode: "0062100012284", override: CANADA_DRY_ZERO },     // Canada Dry Zero Sugar
  { barcode: "0069000019832", override: COCA_COLA },           // Coca-Cola Classic
  { barcode: "0069000008947", override: PEPSI_REGULAR },       // Pepsi
  { barcode: "0069000019849", override: SPRITE_REGULAR },      // Sprite
  { barcode: "0060383060019", override: OLD_DUTCH_PARTY },     // Old Dutch Party Mix
  // ── Gorilla Approved ──
  { barcode: "0858547004149", override: RXBAR },
  { barcode: "0858547004286", override: RXBAR },               // alternate RXBAR UPC
  { barcode: "0856205006050", override: CHOMPS_BEEF },
  { barcode: "0856205006067", override: CHOMPS_TURKEY },
  { barcode: "0026617014109", override: PISTACHIOS },
  { barcode: "0041570001035", override: ALMONDS },
  { barcode: "0041570039105", override: ALMONDS },
  { barcode: "0041570050000", override: ALMONDS },             // verified 2026-06
  { barcode: "0602652179864", override: KIND_DARK_CHOC },      // verified 2026-06
  { barcode: "0072030007972", override: WASA_CRISPBREAD },     // verified 2026-06
  { barcode: "0817939020025", override: SKINNYPOP_OG },        // verified 2026-06
  { barcode: "0058755000999", override: LIBERTE_GREEK },
  { barcode: "0058755001231", override: LIBERTE_GREEK },
  { barcode: "0021908516890", override: LARABAR_APPLE },
  { barcode: "0021908516906", override: LARABAR_APPLE },
  { barcode: "0602652173270", override: KIND_DARK_CHOC },
  { barcode: "0602652180352", override: KIND_DARK_CHOC },
  { barcode: "0041420064203", override: WASA_CRISPBREAD },
  { barcode: "0041660300047", override: SKINNYPOP_OG },
  { barcode: "0041660300061", override: SKINNYPOP_OG },
  { barcode: "0851093001029", override: GIMME_SEAWEED },
  { barcode: "0851093001036", override: GIMME_SEAWEED },
  // ── Gorilla Cheat List ──
  { barcode: "0028400493208", override: TOSTITOS },
  { barcode: "0028400493185", override: TOSTITOS },
  { barcode: "0060410016476", override: MISS_VICKIES },
  { barcode: "0067040303010", override: HARDBITE },
  { barcode: "0062814133450", override: LINDT_85 },
  { barcode: "0062814198403", override: LINDT_85 },
  { barcode: "0062814133443", override: LINDT_70 },
  { barcode: "0062814133436", override: LINDT_70 },
  { barcode: "0708656035003", override: GREEN_BLACKS_70 },
  { barcode: "0708656035010", override: GREEN_BLACKS_70 },
  { barcode: "0016000275287", override: NATURE_VALLEY_OAT },
  { barcode: "0016000275270", override: NATURE_VALLEY_OAT },
  { barcode: "0044000051396", override: TRISCUITS },
  { barcode: "0044000051402", override: TRISCUITS },
  { barcode: "0063600013113", override: BRETON },
  { barcode: "0063600013120", override: BRETON },
  { barcode: "0028400493451", override: SMARTFOOD_CHEDDAR },
  { barcode: "0028400493468", override: SMARTFOOD_CHEDDAR },
  { barcode: "0607813037016", override: BOOM_CHICKA_WHITE },
  { barcode: "0607813037023", override: BOOM_CHICKA_WHITE },
  { barcode: "0012000174834", override: BUBLY },
  { barcode: "0012000174827", override: BUBLY },
  { barcode: "0052000004567", override: GATORADE },
  { barcode: "0052000137027", override: GATORADE },
  // ── Stay Away ──
  { barcode: "0028400083195", override: DORITOS },
  { barcode: "0028400083621", override: DORITOS },
  { barcode: "0028400090209", override: CHEETOS },
  { barcode: "0028400422161", override: CHEETOS },
  { barcode: "0038000219351", override: POP_TARTS },
  { barcode: "0044700038048", override: LUNCHABLES },
  { barcode: "0009800895023", override: NUTELLA },
  { barcode: "0055577102202", override: HARVEST_CRUNCH },
  { barcode: "0722252102729", override: CLIF_BAR },
  { barcode: "0722252010672", override: CLIF_BAR },
  { barcode: "0786162110013", override: VITAMIN_WATER },
  { barcode: "0786162101691", override: VITAMIN_WATER },
  { barcode: "0038000014833", override: ACTIVIA_STRAW },
  { barcode: "0038000012557", override: SPECIAL_K_BAR },
  { barcode: "0060383070025", override: HUMPTY_DUMPTY_CHZ },
  { barcode: "0060383089027", override: ARRIBA_NACHO },
  // ── Sauce & condiment calibration (2026-06) ──
  { barcode: "0055900013803", override: PRIMO_PIZZA_SQUEEZE },    // Primo Pizza Squeeze
  { barcode: "0057000012540", override: CLASSICO_VODKA },         // Classico Vodka Sauce
  { barcode: "0055742549294", override: COMPLIMENTS_RICE },       // Compliments Rice Crackers
];

// ─────────────────────────────────────────────────────────────────────────────
// NAME PATTERN LOOKUP TABLE  (checked in order — first match wins)
// ─────────────────────────────────────────────────────────────────────────────
const NAME_OVERRIDES: NameEntry[] = [
  // ── Gorilla Approved ──────────────────────────────────────────────────────
  { patterns: [/\brxbar\b/i],                                                   override: RXBAR },
  { patterns: [/\bchomps\b.*\b(beef|original)\b/i],                             override: CHOMPS_BEEF },
  { patterns: [/\bchomps\b.*\bturkey\b/i],                                      override: CHOMPS_TURKEY },
  { patterns: [/wonderful.*pistachio/i],                                         override: PISTACHIOS },
  { patterns: [/blue\s*diamond.*almond/i],                                       override: ALMONDS },
  { patterns: [/pumpkin\s*seeds?\s*(unsalted)?/i, /pepitas?\s*(unsalted)?/i],   override: PUMPKIN_SEEDS },
  { patterns: [/\bnomz\b/i],                                                     override: NOMZ },
  { patterns: [/libert[eé].*greek.*0\s*%/i, /libert[eé].*plain.*0\s*%/i],      override: LIBERTE_GREEK },
  { patterns: [/larabar.*apple.*pie/i, /apple.*pie.*larabar/i],                  override: LARABAR_APPLE },
  { patterns: [/kind.*dark.*choc.*nuts.*sea\s*salt/i, /kind.*dark.*choc.*sea\s*salt/i], override: KIND_DARK_CHOC },
  { patterns: [/wasa.*crispbread/i, /wasa.*whole\s*grain/i],                    override: WASA_CRISPBREAD },
  { patterns: [/skinnypop.*original/i, /skinny\s*pop.*original/i],              override: SKINNYPOP_OG },
  { patterns: [/gimme.*seaweed/i, /gimme.*roasted.*seaweed/i],                  override: GIMME_SEAWEED },
  // ── Gorilla Cheat List ────────────────────────────────────────────────────
  { patterns: [/tostitos.*restaurant\s*style/i, /tostitos.*original/i],          override: TOSTITOS },
  { patterns: [/miss\s*vickie'?s.*malt\s*vinegar/i, /miss\s*vickie'?s.*sea\s*salt.*vinegar/i], override: MISS_VICKIES },
  { patterns: [/lay'?s.*classic.*original/i, /^lay'?s\s+classic$/i],            override: LAYS_CLASSIC },
  { patterns: [/hardbite.*sea\s*salt/i, /hardbite.*chips/i],                    override: HARDBITE },
  { patterns: [/lindt.*85\s*%/i],                                                override: LINDT_85 },
  { patterns: [/lindt.*70\s*%/i],                                                override: LINDT_70 },
  { patterns: [/green\s*(?:&|and)\s*black'?s.*70\s*%/i],                        override: GREEN_BLACKS_70 },
  { patterns: [/nature\s*valley.*crunchy.*oat.*honey/i, /nature\s*valley.*oat.*honey.*crunchy/i], override: NATURE_VALLEY_OAT },
  { patterns: [/triscuit.*original/i, /^triscuit(s)?$/i],                        override: TRISCUITS },
  { patterns: [/breton.*original/i],                                             override: BRETON },
  { patterns: [/smartfood.*white\s*cheddar/i],                                   override: SMARTFOOD_CHEDDAR },
  { patterns: [/boom\s*chicka\s*pop.*white\s*cheddar/i, /boom\s*chicka\s*pop.*cheddar/i], override: BOOM_CHICKA_WHITE },
  { patterns: [/\bbubly\b/i],                                                    override: BUBLY },
  { patterns: [/\bgatorade\b/i],                                                 override: GATORADE },
  // ── New approved/cheat name patterns (2026-06) ────────────────────────────
  { patterns: [/\bbabybel\b/i],                                                  override: BABYBEL },
  { patterns: [/gatorade\s*zero/i, /g\s*zero/i],                                 override: GATORADE_ZERO },
  // ── Stay Away ─────────────────────────────────────────────────────────────
  { patterns: [/humpty\s*dumpty.*ripple/i],                                      override: HD_RIPPLE },
  { patterns: [/humpty\s*dumpty.*(cheese\s*curl|cheese\s*stick)/i],              override: HD_CHEESE_CURLS },
  { patterns: [/humpty\s*dumpty.*onion\s*ring/i],                                override: HD_ONION_RINGS },
  { patterns: [/humpty\s*dumpty.*party\s*mix/i],                                 override: HD_PARTY_MIX },
  { patterns: [/humpty\s*dumpty.*bbq/i, /humpty\s*dumpty.*barbecue/i],           override: HD_BBQ },
  { patterns: [/humpty\s*dumpty.*(salt\s*(&|and)?\s*vinegar)/i],                 override: HD_SALT_VINEGAR },
  { patterns: [/humpty\s*dumpty.*sour\s*cream/i],                                override: HD_SOUR_CREAM },
  { patterns: [/old\s*dutch.*ripple/i],                                          override: OLD_DUTCH_RIPPLE },
  { patterns: [/old\s*dutch.*ketchup/i],                                         override: OLD_DUTCH_KETCHUP },
  { patterns: [/old\s*dutch.*all\s*dressed/i],                                   override: OLD_DUTCH_DRESSED },
  { patterns: [/oreo.*double\s*stuf/i],                                          override: OREO_DOUBLE },
  { patterns: [/bts.*oreo/i, /oreo.*brown\s*sugar.*pancake/i, /oreo.*pancake/i], override: BTS_OREO },
  { patterns: [/chips\s*ahoy/i],                                                 override: CHIPS_AHOY },
  { patterns: [/\britz\b.*cracker/i, /\britz\b.*soccer/i, /\britz\b.*shapes/i, /^ritz$/i, /^ritz\s+(original|crackers?)$/i], override: RITZ },
  { patterns: [/lucky\s*charms/i],                                               override: LUCKY_CHARMS },
  { patterns: [/froot\s*loops/i],                                                override: FROOT_LOOPS },
  { patterns: [/fruit\s*by\s*the\s*foot/i],                                      override: FRUIT_BY_FOOT },
  { patterns: [/\bgushers\b/i],                                                  override: GUSHERS },
  { patterns: [/dunkaroos/i],                                                    override: DUNKAROOS },
  { patterns: [/welch'?s.*fruit\s*snack/i],                                      override: WELCHS_SNACKS },
  { patterns: [/kool[\s-]?aid\s*jammer/i],                                       override: KOOL_AID_JAMMERS },
  { patterns: [/\bdoritos\b/i],                                                  override: DORITOS },
  { patterns: [/\bcheetos\b/i],                                                  override: CHEETOS },
  { patterns: [/\boreo\b/i],                                                     override: OREO },
  { patterns: [/pop[\s-]?tart/i],                                                override: POP_TARTS },
  { patterns: [/lunchable/i],                                                    override: LUNCHABLES },
  { patterns: [/\bnutella\b/i],                                                  override: NUTELLA },
  { patterns: [/harvest\s*crunch/i],                                             override: HARVEST_CRUNCH },
  { patterns: [/\bclif\s*bar\b/i],                                               override: CLIF_BAR },
  { patterns: [/vitaminwater/i, /vitamin\s*water/i],                             override: VITAMIN_WATER },
  { patterns: [/activia.*strawberry/i],                                          override: ACTIVIA_STRAW },
  { patterns: [/special\s*k.*protein\s*bar/i, /special\s*k.*bar/i],             override: SPECIAL_K_BAR },
  { patterns: [/old\s*dutch.*party\s*mix/i],                                     override: OLD_DUTCH_PARTY },
  { patterns: [/humpty\s*dumpty.*cheese/i],                                      override: HUMPTY_DUMPTY_CHZ },
  { patterns: [/\barriba\b/i],                                                   override: ARRIBA_NACHO },
  { patterns: [/canada\s*dry.*zero/i],                                           override: CANADA_DRY_ZERO },
  // ── Sauce & condiment calibration (2026-06) ──
  { patterns: [/primo.*pizza.*squeeze/i, /pizza.*squeeze.*primo/i],              override: PRIMO_PIZZA_SQUEEZE },
  { patterns: [/classico.*vodka\s*sauce/i],                                      override: CLASSICO_VODKA },
  { patterns: [/compliments.*rice.*crack/i, /rice.*crack.*compliment/i],         override: COMPLIMENTS_RICE },
  { patterns: [/coca[\s-]?cola(?!\s*zero|\s*diet|\s*life)/i],                    override: COCA_COLA },
  { patterns: [/^pepsi$/i, /pepsi(?!\s*diet|\s*max|\s*zero|\s*wild)/i],          override: PEPSI_REGULAR },
  { patterns: [/^sprite$/i, /sprite(?!\s*zero|\s*cranberry|\s*tropical)/i],      override: SPRITE_REGULAR },
  // Laker — hard overrides so ice beer never scores 90 via the food path
  { patterns: [/\blaker\s*ice\b/i],                                              override: LAKER_ICE },
  { patterns: [/\blaker\s*light\b/i],                                            override: LAKER_LIGHT },
  { patterns: [/\blaker\s*(premium|gold|red)\b/i],                               override: LAKER_PREMIUM },
  { patterns: [/\blaker\s*(lager|beer|original)?\b/i],                           override: LAKER_LAGER },
];

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

function normBarcode(b: string): string {
  return b.replace(/\D/g, "").replace(/^0+/, "") || "0";
}

/**
 * Returns a curated score override for a product, or null if none is defined.
 * Barcode match takes absolute priority over name pattern match.
 */
export function lookupCuratedScore(barcode: string, productName: string): ScoreOverride | null {
  const normB = normBarcode(barcode);
  const byBarcode = BARCODE_OVERRIDES.find((e) => normBarcode(e.barcode) === normB);
  if (byBarcode) return byBarcode.override;

  const name = (productName ?? "").trim();
  if (name.length < 2) return null;
  for (const entry of NAME_OVERRIDES) {
    if (entry.patterns.some((p) => p.test(name))) return entry.override;
  }
  return null;
}

// ═════════════════════════════════════════════════════════════════════════════
// THE SCORING GATE — brand caps, category caps, and the ingredient sanity
// check. Every food score shown to a user passes through applyScoringGate().
// ═════════════════════════════════════════════════════════════════════════════

/** How the final score was determined — drives the transparency badge. */
export type ScoreSource =
  | "gorilla-verified"   // hardcoded curated entry
  | "brand-capped"       // reduced by brand-level cap
  | "ingredient-flagged" // reduced by ingredient sanity check
  | "category-scored"    // reduced by category cap
  | "algorithm";         // pure algorithm, no overrides

// ── TASK 2: BRAND-LEVEL CAPS — CURATED OVERRIDE — DO NOT REMOVE ──────────────
// Applied after the algorithm runs, regardless of algorithm output.
// `except` patterns exempt specific clean variants from the brand cap.
const BRAND_CAPS: { pattern: RegExp; cap: number; except?: RegExp; label: string }[] = [
  { pattern: /humpty\s*dumpty/i, cap: 35, label: "Humpty Dumpty" },
  { pattern: /\bcheetos\b/i, cap: 20, label: "Cheetos" },
  { pattern: /\bdoritos\b/i, cap: 25, label: "Doritos" },
  { pattern: /old\s*dutch/i, cap: 35, except: /\b(plain|original|regular)\b/i, label: "Old Dutch flavoured" },
  { pattern: /\bpringles\b/i, cap: 40, label: "Pringles" },
  { pattern: /\bruffles\b/i, cap: 38, except: /\b(plain|original|regular)\b/i, label: "Ruffles flavoured" },
  { pattern: /\blay'?s\b/i, cap: 45, except: /classic|original|sea\s*salt|plain|lightly\s*salted/i, label: "Lay's flavoured" },
  { pattern: /\bhostess\b/i, cap: 30, label: "Hostess" },
  { pattern: /\bvachon\b/i, cap: 30, label: "Vachon" },
  { pattern: /pop[\s-]?tarts?/i, cap: 20, label: "Pop-Tarts" },
  { pattern: /lunchables?/i, cap: 28, label: "Lunchables" },
  { pattern: /\bnutella\b/i, cap: 30, label: "Nutella" },
  { pattern: /kool[\s-]?aid/i, cap: 18, label: "Kool-Aid" },
  { pattern: /(president'?s\s*choice|pc\b).*party\s*mix/i, cap: 30, label: "PC Party Mix" },
  { pattern: /bits\s*(&|and)\s*bites/i, cap: 32, label: "Bits & Bites" },
  { pattern: /\bbugles\b/i, cap: 35, label: "Bugles" },
  { pattern: /\bfunyuns\b/i, cap: 30, label: "Funyuns" },
  { pattern: /cheez\s*whiz/i, cap: 35, label: "Cheez Whiz" },
  { pattern: /\bvelveeta\b/i, cap: 35, label: "Velveeta" },
  // Laker — value ice beer brand, hard cap regardless of food-path scoring
  { pattern: /\blaker\b/i, cap: 55, label: "Laker" },
  // Major processed-snack manufacturers — algorithm results on UPC DB products
  // from these brands frequently inflate due to missing NOVA/ingredient data.
  { pattern: /\bchristie\b/i, cap: 60, label: "Christie" },
  { pattern: /\bmondelez\b/i, cap: 60, label: "Mondelez" },
  { pattern: /\bnabisco\b/i, cap: 60, label: "Nabisco" },
  { pattern: /\bkellogg'?s?\b/i, cap: 60, label: "Kellogg's" },
  { pattern: /\bgeneral\s*mills\b/i, cap: 60, label: "General Mills" },
];

// ── TASK 3: CATEGORY-LEVEL CAPS — CURATED OVERRIDE — DO NOT REMOVE ───────────
const ARTIFICIAL_COLOUR_RE =
  /red\s*(40|no\.?\s*40)|allura\s*red|yellow\s*(5|6|no\.?\s*[56])|tartrazine|sunset\s*yellow|blue\s*(1|2|no\.?\s*[12])|brilliant\s*blue|indigo\s*carmine|indigotine|green\s*(3|no\.?\s*3)|fast\s*green|artificial\s*colou?r|fd&c/i;
const ARTIFICIAL_FLAVOUR_RE = /artificial\s*flavou?r/i;
const MSG_RE = /\bmsg\b|monosodium\s*glutamate/i;

function categoryCap(name: string, cats: string, ing: string): { cap: number; reason: string } | null {
  const hay = `${name} ${cats}`.toLowerCase();
  const hasColour = ARTIFICIAL_COLOUR_RE.test(ing);
  const hasFlavour = ARTIFICIAL_FLAVOUR_RE.test(ing);
  const hasMsg = MSG_RE.test(ing);

  // Count ingredients (after stripping parenthetical sub-lists) for clean-exception
  const ingStripped = ing.replace(/\([^)]*\)/g, "");
  const ingCount = ingStripped.trim() ? ingStripped.split(",").filter((s) => s.trim()).length : 99;
  const hasNoAdditives = !hasColour && !hasFlavour && !hasMsg &&
    !/partially\s*hydrogenated|high\s*fructose|glucose[\s-]?fructose|\btbhq\b|\bbha\b|\bbht\b/i.test(ing);
  const isClean = ingCount < 5 && hasNoAdditives;

  if (/cheese\s*(puffs?|curls?|doodles?)/.test(hay)) return { cap: 25, reason: "cheese puff/curl category" };
  if (/(chips?|crisps?|puffs?|curls?)\b/.test(hay) && (hasColour || hasFlavour || hasMsg))
    return { cap: 45, reason: "chips/puffs with artificial colours/flavours/MSG" };
  if (/\b(candy|candies|confectionery|sweets)\b/.test(hay)) return { cap: 35, reason: "candy/confectionery category" };
  // Cookies — capped unconditionally; clean ≤4-ingredient exceptions are in curated DB
  if (/(cookies?)\b/.test(hay) && hasColour) return { cap: 38, reason: "cookies with artificial colours" };
  if (/(cookies?)\b/.test(hay)) return { cap: 45, reason: "cookies category — ultra-processed baked good" };
  // Crackers and biscuits — capped at 62 unless very few clean ingredients
  if (/(crackers?|biscuits?)\b/.test(hay) && !isClean) return { cap: 62, reason: "crackers/biscuits — processed grain product" };
  // Sugary cereals with artificial colour — hard cap
  if (/(cereal)/.test(hay) && /sugar|frosted|honey|choc/.test(hay) && hasColour)
    return { cap: 35, reason: "sugary cereal with artificial colours" };
  // General cereals (not plain oats or similar)
  if (/(cereal)/.test(hay) && !/plain\s*oat|rolled\s*oat|steel[\s-]?cut|100\s*%\s*oat|bran\s*flakes?\b/.test(hay))
    return { cap: 60, reason: "cereal category — typically processed grain product" };
  // Snack cakes and pastries
  if (/(snack[\s-]?cake|pastri|pastry|muffin\s*cake|swiss\s*roll)\b/.test(hay))
    return { cap: 40, reason: "snack cake/pastry category" };
  if (/(party\s*mix|snack\s*mix)/.test(hay) && hasColour) return { cap: 30, reason: "party/snack mix with artificial colours" };
  if (/frozen[\s-]?(dessert|novelty)|ice[\s-]?cream/.test(hay)) return { cap: 50, reason: "frozen dessert category" };
  if (/instant\s*noodles?|\bramen\b/.test(hay)) return { cap: 35, reason: "instant noodles category" };
  return null;
}

// ── TASK 4: INGREDIENT SANITY CHECK — CURATED OVERRIDE — DO NOT REMOVE ───────
// The final line of defence. Absolute caps: great macros cannot rescue a
// product containing these ingredients.
export function ingredientSanityCap(
  ingredientsText: string | null | undefined,
  novaGroup?: number | null
): { cap: number; reason: string } | null {
  const ing = (ingredientsText ?? "").toLowerCase();
  const caps: { cap: number; reason: string }[] = [];

  const colourHits = [
    /red\s*(40|no\.?\s*40)|allura\s*red/i,
    /yellow\s*(5|no\.?\s*5)|tartrazine/i,
    /yellow\s*(6|no\.?\s*6)|sunset\s*yellow/i,
    /blue\s*(1|no\.?\s*1)|brilliant\s*blue/i,
    /blue\s*(2|no\.?\s*2)|indigo\s*carmine|indigotine/i,
    /green\s*(3|no\.?\s*3)|fast\s*green/i,
  ].filter((re) => re.test(ing));

  if (colourHits.length >= 2) caps.push({ cap: 40, reason: "two or more artificial colours" });
  else if (colourHits.length === 1) caps.push({ cap: 50, reason: "artificial colour (synthetic dye)" });

  if (colourHits.length >= 1 && ARTIFICIAL_FLAVOUR_RE.test(ing))
    caps.push({ cap: 38, reason: "artificial flavour AND artificial colour together" });
  if (MSG_RE.test(ing)) caps.push({ cap: 55, reason: "MSG" });
  if (/high\s*fructose\s*corn\s*syrup|glucose[\s-]?fructose/i.test(ing))
    caps.push({ cap: 45, reason: "high fructose corn syrup / glucose-fructose" });
  if (/partially\s*hydrogenated|trans\s*fat/i.test(ing))
    caps.push({ cap: 30, reason: "partially hydrogenated oil / trans fat" });
  if (/\bbha\b|\bbht\b|butylated\s*hydroxy/i.test(ing)) caps.push({ cap: 45, reason: "BHA/BHT preservatives" });
  if (/sodium\s*nitrate|sodium\s*nitrite/i.test(ing)) caps.push({ cap: 45, reason: "sodium nitrate/nitrite" });
  if (/acesulfame/i.test(ing) && /aspartame/i.test(ing))
    caps.push({ cap: 48, reason: "acesulfame potassium + aspartame together" });
  if (novaGroup === 4) {
    // Simple products (≤5 ingredients, no artificial additives) shouldn't be
    // penalised as hard as Doritos — plain rice crackers made from rice + oil + salt
    // are categorically different from industrial snack foods.
    const ingStripped4 = ing.replace(/\([^)]*\)/g, "");
    const ingCount4 = ingStripped4.trim() ? ingStripped4.split(",").filter(s => s.trim()).length : 99;
    const hasArtificial4 = /artificial\s*colou?r|artificial\s*flavou?r|partially\s*hydrogenated|high\s*fructose\s*corn\s*syrup|glucose[\s-]?fructose|\bbha\b|\bbht\b|\btbhq\b/i.test(ing);
    if (ingCount4 <= 5 && !hasArtificial4) {
      caps.push({ cap: 65, reason: "NOVA Group 4 — simple ingredient product (max 65)" });
    } else {
      caps.push({ cap: 50, reason: "NOVA Group 4 ultra-processed" });
    }
  }

  // Palm oil in the first 3 ingredients — high sat fat sourcing signal
  if (ing.trim()) {
    const top3 = ing.split(",").slice(0, 3).join(" ");
    if (/\bpalm\s+(kernel\s+)?oil\b/i.test(top3)) caps.push({ cap: 45, reason: "palm oil in top 3 ingredients" });
    // Enriched/bleached flour as first ingredient — refined grain base
    const firstIng = ing.split(",")[0]?.trim() ?? "";
    if (/enriched\s+(wheat\s+)?flour|bleached\s+enriched|enriched\s+white\s+flour/i.test(firstIng))
      caps.push({ cap: 55, reason: "enriched flour as first ingredient" });
  }

  const ingredientCount = ing.split(",").filter((s) => s.trim()).length;
  if (ingredientCount > 25) caps.push({ cap: 55, reason: `${ingredientCount} ingredients (over 25)` });

  if (caps.length === 0) return null;
  return caps.reduce((min, c) => (c.cap < min.cap ? c : min));
}

function gradeForScore(score: number): Grade {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Good";
  if (score >= 25) return "Poor";
  return "Bad";
}

export type GateInput = {
  barcode: string;
  productName: string;
  brand?: string | null;
  ingredientsText?: string | null;
  categoriesTags?: string[] | null;
  novaGroup?: number | null;
};

export type GateOutcome = {
  score: number;
  grade: Grade;
  scoreSource: ScoreSource;
  /** Curated flags/positives to merge into the result, if any. */
  flags?: string[];
  positives?: string[];
  /** Human-readable reason when a cap fired. */
  capReason?: string;
};

/**
 * THE SCORING GATE — every food score passes through here before it reaches
 * the user. Early-return structure makes the curated lookup impossible to
 * bypass:
 *
 *   STEP 1+2 — CURATED OVERRIDE — DO NOT REMOVE: barcode then name lookup.
 *              Hard return; no algorithm output can touch a curated score.
 *   STEP 3   — CURATED OVERRIDE — DO NOT REMOVE: brand-level cap.
 *   STEP 4   — CURATED OVERRIDE — DO NOT REMOVE: category-level cap.
 *   STEP 6   — CURATED OVERRIDE — DO NOT REMOVE: ingredient sanity check.
 *   STEP 5   — only when nothing above matched: pure algorithm score.
 */
export function applyScoringGate(algorithmScore: number, input: GateInput): GateOutcome {
  // ── STEP 1 + 2 — CURATED OVERRIDE — DO NOT REMOVE ──────────────────────────
  // Curated database by exact barcode, then by product name. Hard early return.
  const curated = lookupCuratedScore(input.barcode, input.productName);
  if (curated) {
    return {
      score: curated.score,
      grade: curated.grade,
      scoreSource: "gorilla-verified",
      flags: curated.flags,
      positives: curated.positives,
    };
  }

  let score = algorithmScore;
  let source: ScoreSource = "algorithm";
  let capReason: string | undefined;

  // ── STEP 3 — CURATED OVERRIDE — DO NOT REMOVE: brand-level caps ────────────
  const brandHay = `${input.brand ?? ""} ${input.productName}`;
  for (const b of BRAND_CAPS) {
    if (b.pattern.test(brandHay) && !(b.except && b.except.test(brandHay))) {
      if (score > b.cap) {
        score = b.cap;
        source = "brand-capped";
        capReason = `${b.label} brand cap (max ${b.cap})`;
      }
      break;
    }
  }

  // ── STEP 4 — CURATED OVERRIDE — DO NOT REMOVE: category-level caps ─────────
  const catCap = categoryCap(
    input.productName,
    (input.categoriesTags ?? []).join(" "),
    input.ingredientsText ?? ""
  );
  if (catCap && score > catCap.cap) {
    score = catCap.cap;
    if (source === "algorithm") source = "category-scored";
    capReason = capReason ?? `${catCap.reason} (max ${catCap.cap})`;
  }

  // ── STEP 6 — CURATED OVERRIDE — DO NOT REMOVE: ingredient sanity check ─────
  // The final line of defence before any score reaches the user.
  const sanity = ingredientSanityCap(input.ingredientsText, input.novaGroup);
  if (sanity && score > sanity.cap) {
    score = sanity.cap;
    source = "ingredient-flagged";
    capReason = `${sanity.reason} (max ${sanity.cap})`;
  }

  // ── STEP 5 — algorithm result passes through only when nothing matched ─────
  return { score, grade: gradeForScore(score), scoreSource: source, capReason };
}
