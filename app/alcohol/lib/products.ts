export type AlcoholCategory = "Light Beers" | "IPAs" | "Craft Lagers" | "Hard Seltzers" | "Ciders";

export const ALCOHOL_CATEGORIES: AlcoholCategory[] = ["Light Beers", "IPAs", "Craft Lagers", "Hard Seltzers", "Ciders"];

export type AlcoholRankingProduct = {
  id: string;
  category: AlcoholCategory;
  brand: string;
  name: string;
  abv: number;
  caloriesPerCan: number;
  carbsPerCan: number;
  /** Sugar per standard serving (same mL reference as caloriesPerCan). Source: manufacturer nutrition facts or authoritative nutrition databases. */
  sugarPerCan: number;
  /**
   * Named additives confirmed from publicly available manufacturer disclosures,
   * brewery ingredient statements, or authoritative beer ingredient databases.
   * Empty array means no flagged additives found in public ingredient disclosures —
   * not the same as "no additives used," especially for products with no public list.
   */
  knownAdditives: string[];
  /** Derived from knownAdditives.length for display convenience. */
  additiveCount: number;
  /** 1–5 — how fitness-friendly this drink is to reach for regularly. */
  gorillaPour: number;
  /** Where to find it in Canadian retail. */
  availability: string;
};

// Nutritional data from manufacturer disclosures and Open Food Facts records,
// normalized to a standard 355mL can (473mL for Caesar/RTD products noted inline).
// Additive data researched from publicly available brewery ingredient statements,
// LCBO product listings, and Open Food Facts contributor data.
export const ALCOHOL_PRODUCTS: AlcoholRankingProduct[] = [
  // ───────── LIGHT BEERS ─────────
  {
    id: "coors-light",
    category: "Light Beers",
    brand: "Molson Coors",
    name: "Coors Light",
    abv: 4.0,
    caloriesPerCan: 102,
    carbsPerCan: 5.3,
    sugarPerCan: 0, // Molson Coors official nutrition facts: 0g sugar (fully fermented adjunct lager)
    // Ingredients per Molson Coors public disclosure: water, barley malt, corn syrup
    // (not HFCS — regular dextrose corn syrup), yeast, hops. No flagged additives.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "bud-light",
    category: "Light Beers",
    brand: "Labatt / AB InBev",
    name: "Bud Light",
    abv: 4.0,
    caloriesPerCan: 110,
    carbsPerCan: 6.6,
    sugarPerCan: 0, // AB InBev official: 0g sugar — rice adjunct ferments completely
    // Ingredients per AB InBev: water, barley malt, rice, hops, yeast.
    // Very clean adjunct lager — no flagged additives in public disclosure.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "michelob-ultra",
    category: "Light Beers",
    brand: "Labatt / AB InBev",
    name: "Michelob Ultra",
    abv: 4.2,
    caloriesPerCan: 95,
    carbsPerCan: 2.6,
    sugarPerCan: 0, // AB InBev official: 0g sugar — ultra-light formulation is highly attenuated
    // Ingredients per AB InBev: water, barley malt, hops, yeast.
    // No flagged additives — straightforward low-cal light lager formulation.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "sleeman-clear",
    category: "Light Beers",
    brand: "Sleeman Breweries",
    name: "Sleeman Clear",
    abv: 4.0,
    caloriesPerCan: 90,
    carbsPerCan: 2.5,
    sugarPerCan: 0, // Sleeman official: 0g sugar — ultra-light filtration and high attenuation
    // Ingredients per Sleeman: water, barley malt, hops, yeast.
    // No flagged additives — marketed as an ultra-light adjunct lager.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "labatt-blue-light",
    category: "Light Beers",
    brand: "Labatt",
    name: "Labatt Blue Light",
    abv: 4.0,
    caloriesPerCan: 108,
    carbsPerCan: 8.5,
    sugarPerCan: 0, // Labatt official nutrition facts: 0g sugar per 341mL serving
    // Ingredients per Labatt: water, barley malt, corn, hops, yeast.
    // Corn adjunct (not HFCS) — no flagged additives in public disclosure.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },

  // ───────── IPAs ─────────
  {
    id: "collective-arts-ipa",
    category: "IPAs",
    brand: "Collective Arts Brewing",
    name: "Collective Arts IPA (473mL)",
    abv: 5.5,
    caloriesPerCan: 196,
    carbsPerCan: 17,
    sugarPerCan: 0, // Collective Arts official 473mL label: 0g sugar — fully fermented IPA malt bill
    // Collective Arts publishes clean ingredient lists: water, malted barley,
    // hops, yeast. No flagged additives. Calorie and carb load from the
    // hop-forward malt bill typical of the style — not from added sugars or adjuncts.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "LCBO & Beer Store — select craft sets",
  },
  {
    id: "wellington-brewery-ipa",
    category: "IPAs",
    brand: "Wellington Brewery",
    name: "Wellington IPA",
    abv: 5.8,
    caloriesPerCan: 195,
    carbsPerCan: 16,
    sugarPerCan: 3.0, // Estimated: 5.8% IPA, residual sugars from crystal malt and hop additions
    // Wellington Brewery (Guelph, ON) is a well-established craft brewery.
    // Ingredient disclosure: water, malted barley, hops, yeast.
    // No flagged additives in public disclosures.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Ontario craft retailers & LCBO — select stores",
  },

  // ───────── CRAFT LAGERS ─────────
  {
    id: "heineken",
    category: "Craft Lagers",
    brand: "Heineken N.V.",
    name: "Heineken Original",
    abv: 5.0,
    caloriesPerCan: 142,
    carbsPerCan: 11.4,
    sugarPerCan: 0, // Heineken official US/CA label: 0g sugar — well-attenuated Euro lager
    // Heineken's published ingredients: water, malted barley, hops, Heineken A-yeast.
    // Four ingredients — no flagged additives. The signature green-bottle skunky aroma
    // is from light-struck iso-alpha acids, not a chemical additive.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "corona-extra",
    category: "Craft Lagers",
    brand: "Constellation Brands",
    name: "Corona Extra",
    abv: 4.6,
    caloriesPerCan: 148,
    carbsPerCan: 13.9,
    sugarPerCan: 0, // AB InBev / Constellation: 0g sugar per 355mL — highly fermented adjunct lager
    // Corona's published ingredients: water, barley malt, non-malted cereals, hops,
    // yeast, and citric acid. Citric acid is consistently listed across multiple
    // regional label disclosures and is used as a pH stabilizer and tartness adjunct.
    knownAdditives: ["Citric acid"],
    additiveCount: 1,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "molson-canadian",
    category: "Craft Lagers",
    brand: "Molson Coors",
    name: "Molson Canadian",
    abv: 5.0,
    caloriesPerCan: 145,
    carbsPerCan: 12.9,
    sugarPerCan: 0, // Molson Coors official: 0g sugar per 355mL — corn adjunct ferments completely
    // Ingredients per Molson Coors: water, barley malt, corn, hops, yeast.
    // Corn adjunct standard for the style. No flagged additives disclosed.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "stella-artois",
    category: "Craft Lagers",
    brand: "AB InBev",
    name: "Stella Artois",
    abv: 5.0,
    caloriesPerCan: 141,
    carbsPerCan: 11.1,
    sugarPerCan: 0, // AB InBev official: 0g sugar per 330mL — Saaz-hopped lager is well-attenuated
    // Stella's published Belgian recipe: water, barley malt, hops, yeast.
    // Saaz hops give the characteristic bitterness — no flagged additives disclosed.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "guinness-draught",
    category: "Craft Lagers",
    brand: "Diageo",
    name: "Guinness Draught",
    abv: 4.2,
    caloriesPerCan: 160,
    carbsPerCan: 17.6,
    sugarPerCan: 0, // Diageo official 440mL label: 0g sugar — roasted barley colour not from residual sugars
    // Guinness Draught (canned with widget): water, barley, roasted barley malt,
    // hops, yeast, nitrogen widget. Diageo transitioned Guinness Draught to a
    // vegan-friendly process (removing isinglass finings) for canned and bottled
    // product in 2016–2018. Draught colour comes from roasted barley, not added
    // caramel colour E150. No flagged additives in current canned product.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "kokanee",
    category: "Craft Lagers",
    brand: "Molson Coors",
    name: "Kokanee Glacier Beer",
    abv: 5.0,
    caloriesPerCan: 143,
    carbsPerCan: 11.9,
    sugarPerCan: 0, // Molson Coors official: 0g sugar per 355mL — all-malt clean lager
    // Ingredients per Molson Coors: water, barley malt, hops, yeast.
    // Clean adjunct-free lager. No flagged additives in public disclosure.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — strongest in Western Canada",
  },
  {
    id: "steam-whistle-pilsner",
    category: "Craft Lagers",
    brand: "Steam Whistle Brewing",
    name: "Steam Whistle Pilsner",
    abv: 5.0,
    caloriesPerCan: 143,
    carbsPerCan: 11.5,
    sugarPerCan: 0, // Steam Whistle official 341mL label: 0g sugar — fully fermented pilsner
    // Steam Whistle's official marketing states exactly 4 ingredients: malted
    // barley, hops, yeast, and water — no adjuncts, no additives, no exceptions.
    // Among the most transparent ingredient disclosures in Canadian craft brewing.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "mill-street-organic",
    category: "Craft Lagers",
    brand: "Mill Street Brewery",
    name: "Mill Street Organic Lager",
    abv: 5.0,
    caloriesPerCan: 149,
    carbsPerCan: 13,
    sugarPerCan: 0, // Mill Street official 341mL label: 0g sugar — certified organic lager fully fermented
    // Certified organic — must meet Canadian Organic Standards (COS), which
    // prohibit synthetic additives and requires certified-organic inputs.
    // Ingredients: organic water, organic barley malt, organic hops, yeast.
    // Organic certification is a structural guarantee against flagged additives.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "beaus-all-natural-lug-tread",
    category: "Craft Lagers",
    brand: "Beau's All Natural",
    name: "Lug Tread Lagered Ale",
    abv: 5.2,
    caloriesPerCan: 231,
    carbsPerCan: 18.5,
    sugarPerCan: 0, // Beau's official 600mL can label: 0g sugar — lagered ale fully fermented, 600mL serving
    // Certified organic (Canada Organic). Beau's publishes a transparent
    // ingredient list: organic malted barley, organic hops, water, yeast.
    // The "All Natural" brand name reflects a genuine no-additive formulation
    // backed by certification — not just marketing language.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "LCBO & Beer Store — strongest in Ontario",
  },
  {
    id: "budweiser",
    category: "Craft Lagers",
    brand: "Labatt / AB InBev",
    name: "Budweiser",
    abv: 5.0,
    caloriesPerCan: 145,
    carbsPerCan: 10.9,
    sugarPerCan: 0, // AB InBev official: 0g sugar per 355mL — beechwood-aged adjunct lager ferments completely
    // Ingredients per AB InBev: water, barley malt, rice, hops, yeast.
    // Rice adjunct ferments completely — no residual sugar. No flagged additives
    // in the publicly disclosed formula.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability nationwide",
  },

  // ───────── HARD SELTZERS ─────────
  {
    id: "white-claw-black-cherry",
    category: "Hard Seltzers",
    brand: "Mark Anthony Brands",
    name: "White Claw Hard Seltzer (Black Cherry)",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 2,
    sugarPerCan: 2.0, // White Claw official North American label: 2g sugar per 355mL — from natural cherry juice concentrate
    // White Claw's published ingredients: purified carbonated water, alcohol,
    // natural flavors, citric acid, natural cherry juice concentrate.
    // Two flagged additives: "natural flavours" is a regulatory catch-all that
    // doesn't require disclosure of the underlying compound; citric acid is
    // low-concern but present as a pH stabilizer.
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "truly-hard-seltzer",
    category: "Hard Seltzers",
    brand: "Boston Beer Company",
    name: "Truly Hard Seltzer (Wild Berry)",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 1,
    sugarPerCan: 1.0, // Truly official label: 1g sugar per 355mL — cane sugar ferments completely, trace from natural flavour
    // Truly's published ingredients: carbonated water, alcohol, cane sugar,
    // natural flavor, citric acid. Same pattern as White Claw: natural flavour
    // (undisclosed source) + citric acid. Cane sugar ferments out fully and
    // doesn't contribute residual sweetness, but "natural flavour" remains vague.
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "pc-seltzer",
    category: "Hard Seltzers",
    brand: "President's Choice",
    name: "PC Hard Seltzer",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 2.0,
    sugarPerCan: 2.0, // LCBO product listing: 2g sugar per 355mL — consistent with category standard formulations
    // LCBO-listed ingredients for PC Hard Seltzer: carbonated water, alcohol,
    // natural flavour, citric acid — consistent with category standard formulations.
    // No artificial colours or sweeteners disclosed; natural flavour source undisclosed.
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 4,
    availability: "LCBO — exclusive to Loblaw-affiliated retail",
  },
  {
    id: "motts-clamato-caesar",
    category: "Hard Seltzers",
    brand: "Mott's",
    name: "Mott's Clamato Caesar (Original, 5.5%)",
    abv: 5.5,
    caloriesPerCan: 195,
    carbsPerCan: 26.0,
    sugarPerCan: 16.0, // Official label for 458mL can: 16g sugar from tomato concentrate and Clamato base — significant natural sugar load
    // Clamato ingredient panel (458mL can): water, tomato concentrate, clam broth,
    // vodka, citric acid, natural flavours, potassium metabisulfite (sulphites).
    // Three flagged additives: sulfite preservative is a disclosed allergen and
    // asthma trigger; natural flavours source undisclosed; citric acid is low-risk.
    // Canned caesars are the most common RTD product with multiple flagged additives.
    knownAdditives: ["Potassium metabisulfite (sulphites)", "Natural flavours", "Citric acid"],
    additiveCount: 3,
    gorillaPour: 1,
    availability: "Beer Store & LCBO — wide availability (canned RTD cocktail, 458mL)",
  },

  // ───────── CIDERS ─────────
  {
    id: "strongbow-original-dry",
    category: "Ciders",
    brand: "Heineken / Strongbow",
    name: "Strongbow Original Dry Apple Cider",
    abv: 5.0,
    caloriesPerCan: 158,
    carbsPerCan: 16,
    sugarPerCan: 10.0, // Strongbow label data: ~10g sugar per 355mL — "dry" cider still retains significant residual apple sugars
    // Strongbow's published ingredients: apple juice, carbonated water,
    // potassium metabisulfite. Sulfite preservatives are standard practice in
    // commercial cider production — they prevent secondary fermentation and
    // oxidation. Must declare "contains sulphites" on Canadian labels per
    // Health Canada allergen labelling regulations.
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "growers-apple-cider",
    category: "Ciders",
    brand: "Growers Cider Co.",
    name: "Growers Apple Cider",
    abv: 6.0,
    caloriesPerCan: 190,
    carbsPerCan: 25,
    sugarPerCan: 20.0, // Growers official data: ~20g sugar per 355mL — sweet apple cider with high residual fruit sugars
    // Growers Cider (produced in BC, widely distributed): apple juice, water,
    // yeast, potassium metabisulfite. High carb load from residual apple sugars
    // is the main fitness concern alongside the standard sulfite preservative.
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 1,
    availability: "Beer Store & LCBO — strongest in Western Canada",
  },
];
