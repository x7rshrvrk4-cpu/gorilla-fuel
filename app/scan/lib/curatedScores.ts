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
const OLD_DUTCH_PARTY    = o(30, "Bad");
const HUMPTY_DUMPTY_CHZ  = o(22, "Bad");
const ARRIBA_NACHO       = o(28, "Bad");
const CANADA_DRY_ZERO    = o(48, "Poor");
const COCA_COLA          = o(23, "Bad");
const PEPSI_REGULAR      = o(22, "Bad");
const SPRITE_REGULAR     = o(24, "Bad");

// ─────────────────────────────────────────────────────────────────────────────
// BARCODE LOOKUP TABLE  (first match wins — exact after stripping leading zeros)
// ─────────────────────────────────────────────────────────────────────────────
const BARCODE_OVERRIDES: BarcodeEntry[] = [
  // ── Products already in curatedFoods.ts ──
  { barcode: "0028400090308", override: LAYS_CLASSIC },        // Lay's Classic
  { barcode: "0044000030131", override: OREO },                // Oreo Original
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
  // ── Stay Away ─────────────────────────────────────────────────────────────
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
  { patterns: [/coca[\s-]?cola(?!\s*zero|\s*diet|\s*life)/i],                    override: COCA_COLA },
  { patterns: [/^pepsi$/i, /pepsi(?!\s*diet|\s*max|\s*zero|\s*wild)/i],          override: PEPSI_REGULAR },
  { patterns: [/^sprite$/i, /sprite(?!\s*zero|\s*cranberry|\s*tropical)/i],      override: SPRITE_REGULAR },
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
