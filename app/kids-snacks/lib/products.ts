/**
 * Kids' Snacks — curated "Cheat Zone" guide for Canadian parents.
 *
 * Three tiers, displayed A → B → C:
 *   A  Cleaner Choices  — genuinely clean (whole-food, low/no added sugar, no dyes)
 *   B  The Cheat Zone   — looks healthy, actually mixed. THE hero of this page.
 *   C  Skip These       — candy-adjacent junk.
 *
 * DATA CONFIDENCE — two INDEPENDENT states per product (conservative, like the scanner):
 *   1. Ingredient/dye status — mostly VERIFIED-CA → shown confidently.
 *   2. Per-serving macros    — often PENDING (not yet confirmed on a Canadian label).
 *      Pending macros are OMITTED with a note. We never show a fabricated number
 *      or treat a blank as zero. Each macro field carries its own `verified` flag.
 *
 * HARD RULE — CANADIAN DYE STATUS: never display a US dye flag on a Canadian
 * product. Welch's and Fruit by the Foot are documented CA reformulations that
 * prove CA ≠ US. Where the Canadian dye status isn't confirmed we mark it
 * "unconfirmed" — we do NOT carry US synthetic-dye data onto these products.
 */

export type SnackTier = "A" | "B" | "C";

/** A single macro value with its own confidence flag. Only ever set when we have
 *  a real, verified Canadian number — pending macros are omitted entirely. */
export type MacroField = { value: number; verified: boolean };

export type SnackMacros = {
  /** e.g. "per 90g pouch", "per 50g". */
  servingLabel?: string;
  calories?: MacroField; // kcal
  sugar?: MacroField;    // g
  sodium?: MacroField;   // mg
  fibre?: MacroField;    // g
  protein?: MacroField;  // g
};

export type DyeStatus =
  /** Verified-CA: contains no synthetic dyes at all. */
  | "no-synthetic-dyes"
  /** Verified-CA: coloured with a natural source (turmeric, annatto, beet, carrot…). */
  | "natural-colour"
  /** Canadian dye status NOT confirmed — never assume US dyes. */
  | "unconfirmed";

export type KidsSnackProduct = {
  id: string;
  tier: SnackTier;
  name: string;
  brand: string;
  /** One-line "why it's here". */
  why: string;
  /** Tier-B signature feature — front-of-pack claim vs label reality. */
  marketingClaim?: string;
  reality?: string;
  /** Only verified-CA macro numbers live here; pending ones are omitted. */
  macros?: SnackMacros;
  /** True when one or more macros are not yet confirmed on a Canadian label. */
  macrosPending?: boolean;
  dyeStatus: DyeStatus;
  /** Plain-English colour/additive note shown with the dye badge. */
  dyeNote?: string;
  /** True when the ingredient/dye list is confirmed against a Canadian label. */
  ingredientsVerified: boolean;
  /** Extra caveat (e.g. "chocolate-chip flavour adds sugar"). */
  caveat?: string;
};

export const TIER_META: Record<SnackTier, { label: string; blurb: string }> = {
  A: {
    label: "Cleaner Choices",
    blurb: "Genuinely clean — whole-food first, little or no added sugar, and no synthetic dyes.",
  },
  B: {
    label: "The Cheat Zone",
    blurb: "Looks healthy on the front of the box. The label tells a different story. This is the aisle to read carefully.",
  },
  C: {
    label: "Skip These",
    blurb: "Candy-adjacent: high sugar and/or sodium, heavily processed, often dyed.",
  },
};

const v = (value: number): MacroField => ({ value, verified: true });

export const KIDS_SNACKS: KidsSnackProduct[] = [
  // ─────────────────────────── TIER A — Cleaner Choices ───────────────────────────
  {
    id: "thats-it-fruit-bars",
    tier: "A",
    name: "Fruit Bars",
    brand: "That's It",
    why: "Two ingredients — just fruit. No added sugar, no dyes.",
    macrosPending: true,
    dyeStatus: "no-synthetic-dyes",
    dyeNote: "Whole-fruit only — no colours added.",
    ingredientsVerified: true,
  },
  {
    id: "larabar-fruit",
    tier: "A",
    name: "Fruit & Nut Bars (fruit flavours)",
    brand: "Lärabar",
    why: "Whole-food dates and nuts, short ingredient list, no dyes.",
    macrosPending: true,
    dyeStatus: "no-synthetic-dyes",
    ingredientsVerified: true,
    caveat: "The chocolate-chip flavour adds sugar — the plain fruit flavours are the cleaner pick.",
  },
  {
    id: "madegood-granola-bars",
    tier: "A",
    name: "Granola Bars",
    brand: "MadeGood",
    why: "Organic and allergen-friendly, made in a nut-free facility, no synthetic dyes.",
    macrosPending: true,
    dyeStatus: "no-synthetic-dyes",
    ingredientsVerified: true,
    caveat: "Organic ≠ no added sugar — three added sugars appear together as ingredient #2.",
  },

  // ─────────────────────────── TIER B — The Cheat Zone (hero) ───────────────────────────
  {
    id: "gogo-squeez-apple-apple",
    tier: "B",
    name: "Apple Apple Applesauce Pouch",
    brand: "GoGo squeeZ",
    why: "Sold as pure fruit — but it's concentrated fruit sugar with the fibre stripped out.",
    marketingClaim: "No Sugar Added · 100% fruit",
    reality: "10 g of free sugars per pouch, and the fibre that fills you up in a whole apple is gone.",
    macros: {
      servingLabel: "per 90 g pouch",
      calories: v(45),
      sugar: v(10),
      fibre: v(1),
      protein: v(0.2),
      sodium: v(0),
    },
    dyeStatus: "no-synthetic-dyes",
    dyeNote: "No colours added.",
    ingredientsVerified: true,
  },
  {
    id: "welchs-fruit-snacks",
    tier: "B",
    name: "Fruit Snacks",
    brand: "Welch's",
    why: '"Made with real fruit" — but it leads with corn syrup and sugar.',
    marketingClaim: "Made with real fruit",
    reality: "Corn syrup and sugar are ingredients #2 and #3; 0 g fibre.",
    macrosPending: true,
    dyeStatus: "natural-colour",
    dyeNote: "Canadian recipe is coloured with turmeric / natural colour — NOT the US version's Red 40 + Blue 1.",
    ingredientsVerified: true,
  },
  {
    id: "motts-fruitsations-snacks",
    tier: "B",
    name: "Fruitsations Fruit Snacks",
    brand: "Mott's",
    why: "Marketed on real fruit and veggie juices, but it's a sugar-first product.",
    marketingClaim: "Made with real fruit & veggie juices",
    reality: "The first ingredient is Sugars.",
    macrosPending: true,
    dyeStatus: "no-synthetic-dyes",
    dyeNote: "No artificial dyes.",
    ingredientsVerified: true,
  },
  {
    id: "danone-yogurt-tubes",
    tier: "B",
    name: "Yogurt Tubes",
    brand: "Danone",
    why: "Real protein (3 g), but 9 g of sugar in a small 90 g tube — it leans dessert.",
    marketingClaim: "Kids' yogurt snack",
    reality: "9 g sugar and 0 g fibre per tube — closer to a treat than a yogurt serving.",
    macros: {
      servingLabel: "per 90 g tube",
      calories: v(60),
      sugar: v(9),
      fibre: v(0),
      protein: v(3),
      sodium: v(50),
    },
    dyeStatus: "unconfirmed",
    dyeNote: "Ingredient and colour details pending Canadian-label confirmation.",
    ingredientsVerified: false,
  },
  {
    id: "goldfish-cheddar",
    tier: "B",
    name: "Cheddar Crackers",
    brand: "Goldfish",
    why: '"Made with real cheese" — but it\'s a refined-flour, salty cracker.',
    marketingClaim: "Made with real cheese · Baked",
    reality: "Refined flour is ingredient #1, and it's salty.",
    macrosPending: true,
    dyeStatus: "natural-colour",
    dyeNote: "Coloured with annatto (natural), not a synthetic dye.",
    ingredientsVerified: true,
  },
  {
    id: "sensible-portions-veggie-straws",
    tier: "B",
    name: "Garden Veggie Straws",
    brand: "Sensible Portions",
    why: "The 'veggie' halo on what is, nutritionally, a potato chip.",
    marketingClaim: "Garden Veggie",
    reality: "Potato starch and flour are the base — nutritionally it's a potato chip, and salty.",
    macros: {
      servingLabel: "per 50 g",
      sodium: v(390),
      sugar: v(1),
      fibre: v(1),
      protein: v(1),
    },
    dyeStatus: "natural-colour",
    dyeNote: "Colour from beetroot + turmeric — no synthetic dye.",
    ingredientsVerified: true,
  },
  {
    id: "nutri-grain-strawberry",
    tier: "B",
    name: "Strawberry Cereal Bars",
    brand: "Nutri-Grain",
    why: 'Sold on "whole grain" and fibre, but the filling is sugar-first.',
    marketingClaim: "Whole grain · A source of fibre",
    reality: "The filling's #1 ingredient is sugar.",
    macrosPending: true,
    dyeStatus: "natural-colour",
    dyeNote: "Coloured with carrot juice — no synthetic dye.",
    ingredientsVerified: true,
    caveat: "Contains carrageenan.",
  },
  {
    id: "bear-paws-choc-chip",
    tier: "B",
    name: "Chocolate Chip Soft Cookies",
    brand: "Bear Paws",
    why: "No dyes — but they're soft chocolate-chip cookies sold as a lunchbox snack.",
    marketingClaim: "Lunchbox snack",
    reality: "They're cookies. No dyes, but treat them as a treat.",
    macrosPending: true,
    dyeStatus: "no-synthetic-dyes",
    dyeNote: "No synthetic dyes.",
    ingredientsVerified: true,
  },
  {
    id: "quaker-chewy-dipps",
    tier: "B",
    name: "Chewy Dipps Granola Bars",
    brand: "Quaker",
    why: "A chocolate-coated bar shelved with granola bars — it's a dessert.",
    marketingClaim: "Granola bar",
    reality: "Chocolate-coated with ~13 g sugar — read it as a dessert, not a granola bar.",
    macros: {
      sugar: v(13),
      sodium: v(75),
    },
    macrosPending: true,
    dyeStatus: "unconfirmed",
    dyeNote: "Canadian colour/additive status unconfirmed.",
    ingredientsVerified: false,
  },

  // ─────────────────────────── TIER C — Skip These ───────────────────────────
  {
    id: "fruit-by-the-foot",
    tier: "C",
    name: "Fruit by the Foot",
    brand: "Betty Crocker",
    why: "Sugar and oils rolled into a strip — candy in disguise.",
    marketingClaim: "Fruit snack",
    reality: "Essentially sugar + oils; not a meaningful source of fruit.",
    macrosPending: true,
    dyeStatus: "no-synthetic-dyes",
    dyeNote: 'Canadian version carries no synthetic-dye block and states "no artificial flavours" — unlike the US version, which uses 4 dyes. (Approx. 80 cal — pending confirmation.)',
    ingredientsVerified: true,
  },
  {
    id: "fruit-roll-ups",
    tier: "C",
    name: "Fruit Roll-Ups",
    brand: "Betty Crocker",
    why: "High-sugar, candy-adjacent strip with little nutritional value.",
    macrosPending: true,
    dyeStatus: "unconfirmed",
    dyeNote: "Canadian dye status unconfirmed — we do not assume US dyes.",
    ingredientsVerified: false,
  },
  {
    id: "gushers",
    tier: "C",
    name: "Gushers",
    brand: "Betty Crocker",
    why: "Sugar-filled chewy candy marketed as a fruit snack.",
    macrosPending: true,
    dyeStatus: "unconfirmed",
    dyeNote: "Canadian dye status unconfirmed — we do not assume US dyes.",
    ingredientsVerified: false,
  },
  {
    id: "dunkaroos",
    tier: "C",
    name: "Dunkaroos",
    brand: "General Mills",
    why: "Cookies plus a frosting dip — a dessert marketed as a snack.",
    macrosPending: true,
    dyeStatus: "unconfirmed",
    dyeNote: "Canadian dye status unconfirmed — we do not assume US dyes.",
    ingredientsVerified: false,
  },
];

export const KIDS_SNACKS_BY_TIER: Record<SnackTier, KidsSnackProduct[]> = {
  A: KIDS_SNACKS.filter((p) => p.tier === "A"),
  B: KIDS_SNACKS.filter((p) => p.tier === "B"),
  C: KIDS_SNACKS.filter((p) => p.tier === "C"),
};
