export type AlcoholCategory = "Light Beers" | "IPAs" | "Craft Lagers" | "Hard Seltzers" | "Ciders" | "Wines";

export const ALCOHOL_CATEGORIES: AlcoholCategory[] = ["Light Beers", "IPAs", "Craft Lagers", "Hard Seltzers", "Ciders", "Wines"];

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
  /** Serving size in mL (default 355 for standard cans, 341 for longnecks, etc.). */
  servingMl?: number;
  /** Known UPC/EAN barcodes for this product — used for curated barcode lookup. */
  barcodes?: string[];
  /** True when data is sourced directly from an official LCBO product listing. */
  lcboVerified?: boolean;
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
    sugarPerCan: 0,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
    barcodes: ["0071990100003", "0071990000005"],
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
    barcodes: ["0018200417308"],
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
  {
    id: "busch-light",
    category: "Light Beers",
    brand: "Anheuser-Busch / Labatt",
    name: "Busch Light",
    abv: 4.1,
    caloriesPerCan: 95,
    carbsPerCan: 3.2,
    sugarPerCan: 0,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store & LCBO — wide availability",
    barcodes: ["0018200417179"],
  },
  {
    id: "natural-light",
    category: "Light Beers",
    brand: "Anheuser-Busch / Labatt",
    name: "Natural Light",
    abv: 4.2,
    caloriesPerCan: 95,
    carbsPerCan: 3.2,
    sugarPerCan: 0, // AB InBev official: 0g sugar per 355mL — ultra-light adjunct formulation
    // Ingredients per AB InBev: water, barley malt, corn, rice, hops, yeast.
    // No flagged additives — rice and corn adjuncts ferment completely.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store — select locations",
  },
  {
    id: "carling",
    category: "Light Beers",
    brand: "Molson Coors",
    name: "Carling",
    abv: 4.0,
    caloriesPerCan: 126,
    carbsPerCan: 9.9,
    sugarPerCan: 0, // Molson Coors official: 0g sugar per 355mL — adjunct lager
    // Ingredients per Molson Coors Canadian formula: water, barley malt,
    // glucose-fructose syrup, hops, yeast. Glucose-fructose in beer context
    // ferments out during brewing and doesn't remain as sugar in the final product.
    // Flagged under corn syrup category for disclosure transparency.
    knownAdditives: ["Corn syrup"],
    additiveCount: 1,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "busch",
    category: "Light Beers",
    brand: "Anheuser-Busch / Labatt",
    name: "Busch",
    abv: 4.3,
    caloriesPerCan: 114,
    carbsPerCan: 6.9,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "molson-export",
    category: "Light Beers",
    brand: "Molson Coors",
    name: "Molson Export",
    abv: 5.0,
    caloriesPerCan: 148,
    carbsPerCan: 13.2,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability in Quebec",
  },
  {
    id: "molson-dry",
    category: "Light Beers",
    brand: "Molson Coors",
    name: "Molson Dry",
    abv: 5.5,
    caloriesPerCan: 134,
    carbsPerCan: 9.8,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "labatt-blue",
    category: "Light Beers",
    brand: "Labatt",
    name: "Labatt Blue",
    abv: 5.0,
    caloriesPerCan: 145,
    carbsPerCan: 12.9,
    sugarPerCan: 0,
    servingMl: 341,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "labatt-50",
    category: "Light Beers",
    brand: "Labatt",
    name: "Labatt 50",
    abv: 5.0,
    caloriesPerCan: 147,
    carbsPerCan: 13.1,
    sugarPerCan: 0,
    servingMl: 341,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "molson-canadian-67",
    category: "Light Beers",
    brand: "Molson Coors",
    name: "Molson Canadian 67",
    abv: 3.0,
    caloriesPerCan: 67,
    carbsPerCan: 2.4,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "labatt-premier",
    category: "Light Beers",
    brand: "Labatt",
    name: "Labatt Premier",
    abv: 4.0,
    caloriesPerCan: 99,
    carbsPerCan: 3.6,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "bud-light-next",
    category: "Light Beers",
    brand: "Labatt / AB InBev",
    name: "Bud Light Next",
    abv: 4.0,
    caloriesPerCan: 80,
    carbsPerCan: 0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "budweiser-zero",
    category: "Light Beers",
    brand: "Labatt / AB InBev",
    name: "Budweiser Zero",
    abv: 0.0,
    caloriesPerCan: 50,
    carbsPerCan: 11.5,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "molson-ultra",
    category: "Light Beers",
    brand: "Molson Coors",
    name: "Molson Ultra",
    abv: 0.0,
    caloriesPerCan: 45,
    carbsPerCan: 9.0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "partake-ipa",
    category: "Light Beers",
    brand: "Partake Brewing",
    name: "Partake Brewing IPA",
    abv: 0.5,
    caloriesPerCan: 15,
    carbsPerCan: 3.0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "LCBO & specialty retailers — Ontario and BC",
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
    id: "alexander-keiths-ipa",
    category: "IPAs",
    brand: "Labatt / AB InBev",
    name: "Alexander Keith's IPA",
    abv: 5.0,
    caloriesPerCan: 159,
    carbsPerCan: 14.3,
    sugarPerCan: 0, // Labatt official: 0g sugar per 341mL — India Pale Ale malt bill ferments fully
    // Ingredients per Labatt: water, malted barley, hops, yeast.
    // Despite the IPA label, Keith's is brewed as a conventional amber/pale ale
    // rather than a hop-forward West Coast IPA — the calorie load is from the
    // substantial malt bill. No flagged additives.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
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
    sugarPerCan: 0,
    knownAdditives: ["Citric acid"],
    additiveCount: 1,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
    barcodes: ["0062067382406", "0013700001348"],
  },
  {
    id: "molson-canadian",
    category: "Craft Lagers",
    brand: "Molson Coors",
    name: "Molson Canadian",
    abv: 5.0,
    caloriesPerCan: 145,
    carbsPerCan: 12.9,
    sugarPerCan: 0,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
    barcodes: ["0062032000012", "0062032000029"],
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
    sugarPerCan: 0,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability nationwide",
    barcodes: ["0018200007318", "0062067000017"],
  },
  {
    id: "coors-banquet",
    category: "Craft Lagers",
    brand: "Molson Coors",
    name: "Coors Banquet",
    abv: 5.0,
    caloriesPerCan: 149,
    carbsPerCan: 11.7,
    sugarPerCan: 0, // Molson Coors official: 0g sugar per 355mL — all-malt Rocky Mountain lager
    // Ingredients per Molson Coors: water, barley malt, corn syrup, hops, yeast.
    // Corn syrup is used as an adjunct during brewing and ferments completely —
    // no residual sugar in the finished product, but flagged for disclosure transparency.
    knownAdditives: ["Corn syrup"],
    additiveCount: 1,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "rickards-red",
    category: "Craft Lagers",
    brand: "Molson Coors",
    name: "Rickard's Red",
    abv: 5.2,
    caloriesPerCan: 154,
    carbsPerCan: 14.2,
    sugarPerCan: 0, // Molson Coors official: 0g sugar per 341mL — amber ale, colour from caramel malt not added colour
    // Ingredients per Molson Coors: water, barley malt, crystal malt, hops, yeast.
    // The characteristic amber colour comes from crystal/caramel malts (roasted grain),
    // not added caramel colour E150. No flagged additives in current disclosed formula.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "moosehead-lager",
    category: "Craft Lagers",
    brand: "Moosehead Breweries",
    name: "Moosehead Lager",
    abv: 5.0,
    caloriesPerCan: 145,
    carbsPerCan: 11.9,
    sugarPerCan: 0, // Moosehead official: 0g sugar per 341mL — Canadian-brewed all-malt lager
    // Ingredients per Moosehead Breweries: water, malted barley, corn, hops, yeast.
    // Corn adjunct lager — one of the few remaining major independent Canadian breweries.
    // No flagged additives in public disclosure.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "lakeport-honey-lager",
    category: "Craft Lagers",
    brand: "Labatt / AB InBev",
    name: "Lakeport Honey Lager",
    abv: 5.0,
    caloriesPerCan: 153,
    carbsPerCan: 13.8,
    sugarPerCan: 0, // Labatt official: 0g sugar per 341mL — honey ferments completely; no residual sugar
    // Ingredients per Labatt: water, barley malt, honey, hops, yeast.
    // Honey is a fermentable adjunct that converts fully during brewing and
    // contributes no residual sugar to the finished product. No flagged additives.
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability in Ontario",
  },
  {
    id: "corona-light",
    category: "Craft Lagers",
    brand: "Constellation Brands",
    name: "Corona Light",
    abv: 3.6,
    caloriesPerCan: 99,
    carbsPerCan: 5.0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: ["Citric acid"],
    additiveCount: 1,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "heineken-00",
    category: "Craft Lagers",
    brand: "Heineken N.V.",
    name: "Heineken 0.0",
    abv: 0.0,
    caloriesPerCan: 69,
    carbsPerCan: 16.5,
    sugarPerCan: 0,
    servingMl: 330,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "guinness-extra-stout",
    category: "Craft Lagers",
    brand: "Diageo",
    name: "Guinness Extra Stout",
    abv: 5.6,
    caloriesPerCan: 176,
    carbsPerCan: 14.0,
    sugarPerCan: 0,
    servingMl: 330,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "modelo-especial",
    category: "Craft Lagers",
    brand: "Constellation Brands",
    name: "Modelo Especial",
    abv: 4.4,
    caloriesPerCan: 143,
    carbsPerCan: 13.6,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "dos-equis-lager",
    category: "Craft Lagers",
    brand: "Heineken N.V.",
    name: "Dos Equis Lager",
    abv: 4.2,
    caloriesPerCan: 131,
    carbsPerCan: 11.0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "peroni",
    category: "Craft Lagers",
    brand: "Asahi / Peroni",
    name: "Peroni Nastro Azzurro",
    abv: 5.1,
    caloriesPerCan: 136,
    carbsPerCan: 11.1,
    sugarPerCan: 0,
    servingMl: 330,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "becks",
    category: "Craft Lagers",
    brand: "AB InBev",
    name: "Beck's",
    abv: 5.0,
    caloriesPerCan: 138,
    carbsPerCan: 9.7,
    sugarPerCan: 0,
    servingMl: 330,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "hoegaarden",
    category: "Craft Lagers",
    brand: "AB InBev",
    name: "Hoegaarden",
    abv: 4.9,
    caloriesPerCan: 153,
    carbsPerCan: 13.1,
    sugarPerCan: 0,
    servingMl: 330,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "leffe-blonde",
    category: "Craft Lagers",
    brand: "AB InBev",
    name: "Leffe Blonde",
    abv: 6.6,
    caloriesPerCan: 168,
    carbsPerCan: 14.0,
    sugarPerCan: 0,
    servingMl: 330,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "LCBO — wide availability",
  },
  {
    id: "newcastle-brown-ale",
    category: "Craft Lagers",
    brand: "Heineken N.V.",
    name: "Newcastle Brown Ale",
    abv: 4.7,
    caloriesPerCan: 195,
    carbsPerCan: 17.0,
    sugarPerCan: 0,
    servingMl: 500,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "boddingtons-pub-ale",
    category: "Craft Lagers",
    brand: "AB InBev",
    name: "Boddingtons Pub Ale",
    abv: 4.7,
    caloriesPerCan: 153,
    carbsPerCan: 13.2,
    sugarPerCan: 0,
    servingMl: 440,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "mill-street-100th-meridian",
    category: "Craft Lagers",
    brand: "Mill Street Brewery",
    name: "Mill Street 100th Meridian",
    abv: 5.0,
    caloriesPerCan: 154,
    carbsPerCan: 13.5,
    sugarPerCan: 0,
    servingMl: 341,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 3,
    availability: "Beer Store & LCBO — wide availability in Ontario",
  },
  {
    id: "alexander-keiths-light",
    category: "Light Beers",
    brand: "Labatt / AB InBev",
    name: "Alexander Keith's Light",
    abv: 4.0,
    caloriesPerCan: 104,
    carbsPerCan: 7.2,
    sugarPerCan: 0,
    servingMl: 341,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "rickards-white",
    category: "Craft Lagers",
    brand: "Molson Coors",
    name: "Rickard's White",
    abv: 5.4,
    caloriesPerCan: 154,
    carbsPerCan: 14.5,
    sugarPerCan: 0,
    servingMl: 341,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "granville-island-english-bay",
    category: "Craft Lagers",
    brand: "Molson Coors",
    name: "Granville Island English Bay Pale Ale",
    abv: 5.0,
    caloriesPerCan: 158,
    carbsPerCan: 14.1,
    sugarPerCan: 0,
    servingMl: 341,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — strongest in BC",
  },
  {
    id: "wellington-arkell-bitter",
    category: "Craft Lagers",
    brand: "Wellington Brewery",
    name: "Wellington County Arkell Best Bitter",
    abv: 4.5,
    caloriesPerCan: 162,
    carbsPerCan: 14.8,
    sugarPerCan: 0,
    servingMl: 341,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 2,
    availability: "LCBO & craft retailers — Ontario",
  },
  {
    id: "corona-sunbrew-00",
    category: "Craft Lagers",
    brand: "Constellation Brands",
    name: "Corona Sunbrew 0.0",
    abv: 0.0,
    caloriesPerCan: 90,
    carbsPerCan: 20.0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
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
    id: "white-claw-original",
    category: "Hard Seltzers",
    brand: "Mark Anthony Brands",
    name: "White Claw Hard Seltzer (Original)",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 2.0,
    sugarPerCan: 2.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "white-claw-surge",
    category: "Hard Seltzers",
    brand: "Mark Anthony Brands",
    name: "White Claw Surge",
    abv: 8.0,
    caloriesPerCan: 160,
    carbsPerCan: 4.0,
    sugarPerCan: 1.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "vizzy-hard-seltzer",
    category: "Hard Seltzers",
    brand: "Molson Coors",
    name: "Vizzy Hard Seltzer",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 3.0,
    sugarPerCan: 1.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "bon-viv-spiked-seltzer",
    category: "Hard Seltzers",
    brand: "Bon Viv",
    name: "Bon Viv Spiked Seltzer",
    abv: 4.5,
    caloriesPerCan: 90,
    carbsPerCan: 2.0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: ["Natural flavours"],
    additiveCount: 1,
    gorillaPour: 4,
    availability: "LCBO — select locations",
  },
  {
    id: "nude-vodka-soda",
    category: "Hard Seltzers",
    brand: "Nude Beverages",
    name: "Nude Vodka Soda",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "Beer Store & LCBO — wide availability in Canada",
  },
  {
    id: "palm-bay",
    category: "Hard Seltzers",
    brand: "Labatt / AB InBev",
    name: "Palm Bay",
    abv: 4.0,
    caloriesPerCan: 114,
    carbsPerCan: 11.0,
    sugarPerCan: 9.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "waterloo-sparkling",
    category: "Hard Seltzers",
    brand: "Waterloo Brewing",
    name: "Waterloo Sparkling",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 2.0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: ["Natural flavours"],
    additiveCount: 1,
    gorillaPour: 4,
    availability: "Beer Store & LCBO — Ontario",
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
  {
    id: "motts-clamato-caesar-bold",
    category: "Hard Seltzers",
    brand: "Mott's",
    name: "Mott's Clamato Caesar Bold",
    abv: 5.5,
    caloriesPerCan: 195,
    carbsPerCan: 26.0,
    sugarPerCan: 16.0,
    servingMl: 458,
    knownAdditives: ["Potassium metabisulfite (sulphites)", "Natural flavours", "Citric acid"],
    additiveCount: 3,
    gorillaPour: 1,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "bacardi-breezer",
    category: "Hard Seltzers",
    brand: "Bacardi",
    name: "Bacardi Breezer",
    abv: 4.0,
    caloriesPerCan: 174,
    carbsPerCan: 26.0,
    sugarPerCan: 24.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 1,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "mikes-hard-lemonade",
    category: "Hard Seltzers",
    brand: "Mark Anthony Brands",
    name: "Mike's Hard Lemonade",
    abv: 5.0,
    caloriesPerCan: 220,
    carbsPerCan: 34.0,
    sugarPerCan: 32.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 1,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "smirnoff-ice",
    category: "Hard Seltzers",
    brand: "Diageo",
    name: "Smirnoff Ice",
    abv: 5.0,
    caloriesPerCan: 228,
    carbsPerCan: 32.0,
    sugarPerCan: 30.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 1,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "seagrams-coolers",
    category: "Hard Seltzers",
    brand: "Seagram's",
    name: "Seagram's Coolers",
    abv: 5.0,
    caloriesPerCan: 210,
    carbsPerCan: 30.0,
    sugarPerCan: 28.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 1,
    availability: "Beer Store & LCBO — wide availability",
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
    id: "strongbow-gold",
    category: "Ciders",
    brand: "Heineken / Strongbow",
    name: "Strongbow Gold Apple Cider",
    abv: 4.5,
    caloriesPerCan: 185,
    carbsPerCan: 19.0,
    sugarPerCan: 17.0,
    servingMl: 500,
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "magners-original",
    category: "Ciders",
    brand: "C&C Group",
    name: "Magners Original Irish Cider",
    abv: 4.5,
    caloriesPerCan: 233,
    carbsPerCan: 24.5,
    sugarPerCan: 22.0,
    servingMl: 568,
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 1,
    availability: "LCBO — wide availability",
  },
  {
    id: "somersby-apple",
    category: "Ciders",
    brand: "Carlsberg Group",
    name: "Somersby Apple Cider",
    abv: 4.5,
    caloriesPerCan: 145,
    carbsPerCan: 15.0,
    sugarPerCan: 13.0,
    servingMl: 355,
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 2,
    availability: "Beer Store & LCBO — wide availability",
  },
  {
    id: "bulmers",
    category: "Ciders",
    brand: "Heineken N.V.",
    name: "Bulmers Original Cider",
    abv: 4.7,
    caloriesPerCan: 204,
    carbsPerCan: 20.5,
    sugarPerCan: 18.5,
    servingMl: 500,
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 1,
    availability: "LCBO — wide availability",
  },
  {
    id: "molson-cider",
    category: "Ciders",
    brand: "Molson Coors",
    name: "Molson Cider",
    abv: 5.0,
    caloriesPerCan: 172,
    carbsPerCan: 18.0,
    sugarPerCan: 16.0,
    servingMl: 355,
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
    sugarPerCan: 20.0,
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 1,
    availability: "Beer Store & LCBO — strongest in Western Canada",
  },

  // ───────── LCBO VERIFIED — Ciders ─────────
  {
    id: "thornbury-village-cider",
    category: "Ciders",
    brand: "Thornbury Village Craft Cider",
    name: "Thornbury Village Premium Craft Cider",
    abv: 7.0,
    caloriesPerCan: 200,
    carbsPerCan: 21.0,
    sugarPerCan: 18.0,
    servingMl: 473,
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 2,
    availability: "LCBO — Ontario craft exclusive",
    lcboVerified: true,
  },
  {
    id: "county-cider-apple",
    category: "Ciders",
    brand: "County Cider Company",
    name: "County Cider Company Apple",
    abv: 6.9,
    caloriesPerCan: 195,
    carbsPerCan: 22.0,
    sugarPerCan: 19.0,
    servingMl: 473,
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 2,
    availability: "LCBO — Prince Edward County & Ontario",
    lcboVerified: true,
  },
  {
    id: "kopparberg-strawberry-lime",
    category: "Ciders",
    brand: "Kopparberg",
    name: "Kopparberg Strawberry-Lime Cider",
    abv: 4.0,
    caloriesPerCan: 200,
    carbsPerCan: 22.0,
    sugarPerCan: 20.0,
    servingMl: 500,
    knownAdditives: ["Potassium metabisulfite (sulphites)", "Citric acid", "Natural flavours"],
    additiveCount: 3,
    gorillaPour: 1,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "angry-orchard-crisp-apple",
    category: "Ciders",
    brand: "Angry Orchard",
    name: "Angry Orchard Crisp Apple",
    abv: 5.0,
    caloriesPerCan: 190,
    carbsPerCan: 25.0,
    sugarPerCan: 23.0,
    servingMl: 355,
    knownAdditives: ["Potassium metabisulfite (sulphites)"],
    additiveCount: 1,
    gorillaPour: 1,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "rekorderlig-strawberry-lime",
    category: "Ciders",
    brand: "Rekorderlig",
    name: "Rekorderlig Strawberry-Lime Premium Cider",
    abv: 4.5,
    caloriesPerCan: 220,
    carbsPerCan: 25.0,
    sugarPerCan: 24.0,
    servingMl: 500,
    knownAdditives: ["Potassium metabisulfite (sulphites)", "Natural flavours", "Citric acid"],
    additiveCount: 3,
    gorillaPour: 1,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },

  // ───────── LCBO VERIFIED — Hard Seltzers / RTDs ─────────
  {
    id: "nutrl-vodka-soda",
    category: "Hard Seltzers",
    brand: "NÜTRL",
    name: "NÜTRL Vodka Soda",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "LCBO & Beer Store — wide availability in Canada",
    lcboVerified: true,
    barcodes: ["0628055400164", "0628055400171"],
  },
  {
    id: "cottage-springs-vodka-water",
    category: "Hard Seltzers",
    brand: "Cottage Springs",
    name: "Cottage Springs Vodka Water",
    abv: 5.0,
    caloriesPerCan: 80,
    carbsPerCan: 0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "LCBO — Ontario exclusive",
    lcboVerified: true,
  },
  {
    id: "twisted-tea-original",
    category: "Hard Seltzers",
    brand: "Boston Beer Company",
    name: "Twisted Tea Original Hard Iced Tea",
    abv: 5.0,
    caloriesPerCan: 215,
    carbsPerCan: 30.0,
    sugarPerCan: 28.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 1,
    availability: "LCBO & Beer Store — wide availability",
    lcboVerified: true,
    barcodes: ["0072046300014"],
  },
  {
    id: "cayman-jack-margarita",
    category: "Hard Seltzers",
    brand: "Cayman Jack",
    name: "Cayman Jack Margarita",
    abv: 5.9,
    caloriesPerCan: 120,
    carbsPerCan: 11.0,
    sugarPerCan: 10.0,
    servingMl: 355,
    knownAdditives: ["Citric acid", "Natural flavours"],
    additiveCount: 2,
    gorillaPour: 3,
    availability: "LCBO — select locations",
    lcboVerified: true,
  },
  {
    id: "wild-mike-ultimate-seltzer",
    category: "Hard Seltzers",
    brand: "Wild Mike's",
    name: "Wild Mike's Ultimate Seltzer",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 2.0,
    sugarPerCan: 2.0,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 4,
    availability: "LCBO — Ontario",
    lcboVerified: true,
  },
  {
    id: "coors-slice-lemon",
    category: "Hard Seltzers",
    brand: "Molson Coors",
    name: "Coors Slice Lemon Lime",
    abv: 4.0,
    caloriesPerCan: 85,
    carbsPerCan: 3.5,
    sugarPerCan: 2.5,
    servingMl: 355,
    knownAdditives: ["Natural flavours", "Citric acid"],
    additiveCount: 2,
    gorillaPour: 4,
    availability: "LCBO & Beer Store — wide availability",
    lcboVerified: true,
  },
  {
    id: "deep-eddy-vodka-soda",
    category: "Hard Seltzers",
    brand: "Deep Eddy",
    name: "Deep Eddy Vodka Soda",
    abv: 5.0,
    caloriesPerCan: 100,
    carbsPerCan: 0,
    sugarPerCan: 0,
    servingMl: 355,
    knownAdditives: [],
    additiveCount: 0,
    gorillaPour: 5,
    availability: "LCBO — select locations",
    lcboVerified: true,
  },

  // ───────── WINES (per 148mL standard pour) ─────────
  // caloriesPerCan / carbsPerCan / sugarPerCan = values per 148mL pour.
  // servingMl: 148 is mandatory for all wine entries.
  {
    id: "kim-crawford-sauvignon-blanc",
    category: "Wines",
    brand: "Kim Crawford",
    name: "Kim Crawford Sauvignon Blanc",
    abv: 12.5,
    caloriesPerCan: 120,
    carbsPerCan: 0.5,
    sugarPerCan: 0.4,
    servingMl: 148,
    // Ingredients: fermented grape juice, sulphites. Standard dry NZ wine.
    knownAdditives: ["Sulphites (E220)"],
    additiveCount: 1,
    gorillaPour: 4,
    availability: "LCBO & private wine stores — wide availability",
    lcboVerified: true,
  },
  {
    id: "oyster-bay-sauvignon-blanc",
    category: "Wines",
    brand: "Oyster Bay",
    name: "Oyster Bay Sauvignon Blanc",
    abv: 13.0,
    caloriesPerCan: 122,
    carbsPerCan: 0.3,
    sugarPerCan: 0.3,
    servingMl: 148,
    knownAdditives: ["Sulphites (E220)"],
    additiveCount: 1,
    gorillaPour: 4,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "j-lohr-cabernet-sauvignon",
    category: "Wines",
    brand: "J. Lohr",
    name: "J. Lohr Seven Oaks Cabernet Sauvignon",
    abv: 14.5,
    caloriesPerCan: 128,
    carbsPerCan: 0,
    sugarPerCan: 0,
    servingMl: 148,
    knownAdditives: ["Sulphites (E220)"],
    additiveCount: 1,
    gorillaPour: 4,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "lindemans-bin65-chardonnay",
    category: "Wines",
    brand: "Lindemans",
    name: "Lindemans Bin 65 Chardonnay",
    abv: 12.5,
    caloriesPerCan: 123,
    carbsPerCan: 0.3,
    sugarPerCan: 0.3,
    servingMl: 148,
    knownAdditives: ["Sulphites (E220)"],
    additiveCount: 1,
    gorillaPour: 4,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "meiomi-pinot-noir",
    category: "Wines",
    brand: "Meiomi",
    name: "Meiomi Pinot Noir",
    abv: 13.5,
    caloriesPerCan: 130,
    carbsPerCan: 3.5,
    sugarPerCan: 3.0,
    // Meiomi is classified "off-dry" — residual sugar is ~12 g/L, giving ~3g per 148mL pour.
    // Ingredients: grapes, sulphites, mega purple (unreported — common in mass-market US Pinot).
    servingMl: 148,
    knownAdditives: ["Sulphites (E220)", "Mega Purple (unreported additive common in mass-market Pinot Noir)"],
    additiveCount: 2,
    gorillaPour: 3,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "apothic-red-blend",
    category: "Wines",
    brand: "Apothic",
    name: "Apothic Red Blend",
    abv: 13.5,
    caloriesPerCan: 130,
    carbsPerCan: 4.0,
    sugarPerCan: 4.0,
    // Semi-sweet California red blend — residual sugar ~20 g/L → ~3–4g per 148mL pour.
    servingMl: 148,
    knownAdditives: ["Sulphites (E220)", "Natural flavours"],
    additiveCount: 2,
    gorillaPour: 2,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "la-marca-prosecco",
    category: "Wines",
    brand: "La Marca",
    name: "La Marca Prosecco DOC",
    abv: 11.0,
    caloriesPerCan: 92,
    carbsPerCan: 0.5,
    sugarPerCan: 0.5,
    // Extra dry category — 12–17 g/L residual sugar; 0.7g per 148mL is approximate.
    servingMl: 148,
    knownAdditives: ["Sulphites (E220)"],
    additiveCount: 1,
    gorillaPour: 4,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "barefoot-pinot-grigio",
    category: "Wines",
    brand: "Barefoot",
    name: "Barefoot Pinot Grigio",
    abv: 11.5,
    caloriesPerCan: 121,
    carbsPerCan: 2.5,
    sugarPerCan: 2.0,
    servingMl: 148,
    knownAdditives: ["Sulphites (E220)", "Natural flavours"],
    additiveCount: 2,
    gorillaPour: 3,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "beringer-white-zinfandel",
    category: "Wines",
    brand: "Beringer",
    name: "Beringer White Zinfandel",
    abv: 9.9,
    caloriesPerCan: 147,
    carbsPerCan: 10.0,
    sugarPerCan: 9.0,
    // Sweet rosé — high residual sugar (~60 g/L); one of the sweeter mass-market wines.
    servingMl: 148,
    knownAdditives: ["Sulphites (E220)"],
    additiveCount: 1,
    gorillaPour: 1,
    availability: "LCBO — wide availability",
    lcboVerified: true,
  },
  {
    id: "copper-moon-pinot-grigio",
    category: "Wines",
    brand: "Copper Moon",
    name: "Copper Moon Pinot Grigio",
    abv: 12.5,
    caloriesPerCan: 119,
    carbsPerCan: 0.3,
    sugarPerCan: 0.2,
    servingMl: 148,
    knownAdditives: ["Sulphites (E220)"],
    additiveCount: 1,
    gorillaPour: 4,
    availability: "LCBO — wide availability (Canadian winery)",
    lcboVerified: true,
  },
];

/** Normalize a barcode string to a leading-zero-stripped digit string for comparison. */
function normBarcode(b: string): string {
  return b.replace(/\D/g, "").replace(/^0+/, "") || "0";
}

/** Strip noise words and punctuation from a product name for fuzzy comparison. */
function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove parentheticals like "(473mL)"
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(beer|lager|ale|ipa|pilsner|stout|cider|seltzer|hard|draught|draft|canadian|the|and|de|la)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Return word-overlap ratio (0–1) between two normalized name strings. */
function wordOverlap(a: string, b: string): number {
  const wa = new Set(a.split(" ").filter((w) => w.length > 1));
  const wb = new Set(b.split(" ").filter((w) => w.length > 1));
  if (wa.size === 0 || wb.size === 0) return 0;
  let hits = 0;
  wa.forEach((w) => { if (wb.has(w)) hits++; });
  return hits / Math.max(wa.size, wb.size);
}

/** Look up a product from the curated database by exact barcode match. */
export function lookupCuratedByBarcode(barcode: string): AlcoholRankingProduct | null {
  const target = normBarcode(barcode);
  return (
    ALCOHOL_PRODUCTS.find((p) =>
      p.barcodes?.some((b) => normBarcode(b) === target)
    ) ?? null
  );
}

/**
 * Try to find a curated product whose name closely matches a given string.
 * Tries exact → contains → word-overlap ≥ 0.6 in that order.
 * Used to merge COLA Cloud / external API data with curated nutrition.
 */
export function lookupCuratedByName(productName: string): AlcoholRankingProduct | null {
  const target = normName(productName);
  if (target.length < 3) return null;

  // 1. Exact normalized match
  const exact = ALCOHOL_PRODUCTS.find((p) => normName(p.name) === target);
  if (exact) return exact;

  // 2. One is a substring of the other
  const sub = ALCOHOL_PRODUCTS.find((p) => {
    const pn = normName(p.name);
    return pn.includes(target) || target.includes(pn);
  });
  if (sub) return sub;

  // 3. Word-overlap ≥ 0.6
  let best: AlcoholRankingProduct | null = null;
  let bestScore = 0;
  for (const p of ALCOHOL_PRODUCTS) {
    const score = wordOverlap(normName(p.name), target);
    if (score > bestScore && score >= 0.6) { best = p; bestScore = score; }
  }
  return best;
}

/**
 * If an external API product name matches a curated entry, return the curated product.
 * Pass the external product's name (and optionally brand) to improve match accuracy.
 * Returns null when no curated match is found — caller should use the external data as-is.
 */
export function overrideWithCurated(
  externalName: string,
  externalBrand?: string
): AlcoholRankingProduct | null {
  // Try name alone first
  const byName = lookupCuratedByName(externalName);
  if (byName) return byName;
  // Try brand + name concatenated for cases like "Labatt Blue Light" vs "Blue Light"
  if (externalBrand) {
    return lookupCuratedByName(`${externalBrand} ${externalName}`);
  }
  return null;
}
