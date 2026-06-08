import type { EvidenceTier, Nutriments, RiskLevel } from "./scoring";

// ───────── DETECTION ─────────

const ALCOHOL_CATEGORY_HINTS = [
  "beer",
  "beers",
  "wine",
  "wines",
  "spirit",
  "spirits",
  "cider",
  "ciders",
  "alcoholic-beverage",
  "alcoholic-beverages",
  "ale",
  "ales",
  "lager",
  "lagers",
  "stout",
  "stouts",
  "ipa",
  "ipas",
  "seltzer",
  "seltzers",
  "hard-seltzer",
  "hard-seltzers",
];

/** Checks an OFF `categories_tags` array for any alcohol-category hint, in any taxonomy language. */
export function isAlcoholProduct(categoriesTags: string[] | undefined | null): boolean {
  if (!categoriesTags || categoriesTags.length === 0) return false;
  return categoriesTags.some((tag) => {
    const slug = tag.replace(/^[a-z]{2}:/, "").toLowerCase();
    return ALCOHOL_CATEGORY_HINTS.some((hint) => slug === hint || slug.includes(hint));
  });
}

export type AlcoholKind = "beer" | "wine" | "spirits" | "cider" | "seltzer" | "other";

const KIND_HINTS: { kind: AlcoholKind; hints: string[] }[] = [
  { kind: "seltzer", hints: ["seltzer", "hard-seltzer"] },
  { kind: "cider", hints: ["cider"] },
  { kind: "wine", hints: ["wine"] },
  { kind: "spirits", hints: ["spirit", "whisky", "whiskey", "vodka", "rum", "gin", "tequila", "liqueur", "brandy"] },
  { kind: "beer", hints: ["beer", "ale", "lager", "stout", "ipa", "porter", "pilsner"] },
];

export function detectAlcoholKind(categoriesTags: string[] | undefined | null): AlcoholKind {
  const tags = (categoriesTags ?? []).map((t) => t.replace(/^[a-z]{2}:/, "").toLowerCase());
  for (const { kind, hints } of KIND_HINTS) {
    if (tags.some((tag) => hints.some((hint) => tag.includes(hint)))) return kind;
  }
  return "other";
}

/** Reference serving sizes (mL) used to normalize calorie/carb comparisons across product types. */
export const REFERENCE_SERVING_ML: Record<AlcoholKind, number> = {
  beer: 355,
  cider: 355,
  seltzer: 355,
  wine: 148,
  spirits: 44,
  other: 355,
};

export function kindLabel(kind: AlcoholKind): string {
  switch (kind) {
    case "beer":
      return "Beer";
    case "cider":
      return "Cider";
    case "seltzer":
      return "Hard Seltzer";
    case "wine":
      return "Wine";
    case "spirits":
      return "Spirits";
    default:
      return "Alcoholic Beverage";
  }
}

/** 🍺 for malt beverages, 🍷 for wine, 🥃 for spirits — a quick visual cue on the result card. */
export function kindEmoji(kind: AlcoholKind): string {
  switch (kind) {
    case "beer":
    case "cider":
    case "seltzer":
      return "🍺";
    case "wine":
      return "🍷";
    case "spirits":
      return "🥃";
    default:
      return "🍾";
  }
}

// ───────── ADDITIVE WATCHLIST ─────────

type Matcher = { label: string; pattern: RegExp };

type AlcoholAdditiveEntry = {
  id: string;
  name: string;
  risk: RiskLevel;
  penalty: number;
  note: string;
  tier: EvidenceTier;
  healthBodyPosition: string;
  sources: string[];
  matchers: Matcher[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function name(label: string): Matcher {
  const pattern = escapeRegExp(label).replace(/[\s-]+/g, "[\\s-]+");
  return { label, pattern: new RegExp(`\\b${pattern}\\b`, "i") };
}

function ecode(code: string): Matcher {
  const numeric = code.replace(/^e/i, "");
  return { label: code.toUpperCase(), pattern: new RegExp(`\\bE[\\s-]?${numeric}\\b`, "i") };
}

const ALCOHOL_ADDITIVES: AlcoholAdditiveEntry[] = [
  {
    id: "caramel-colour",
    name: "Caramel Colour (E150a–E150d)",
    risk: "medium",
    penalty: 12,
    note: "A common colourant in darker beers and spirits — classes III and IV (E150c/E150d) are made using ammonia or sulfite-ammonia processes that generate trace 4-MEI, a compound California lists as a possible carcinogen.",
    tier: "contested",
    healthBodyPosition: "EFSA's 2011 re-evaluation set an acceptable daily intake for all four caramel colour classes and found no safety concern at typical use levels, while California's Proposition 65 separately requires a warning label once 4-MEI exceeds its own threshold — two regulators weighing the same chemistry differently.",
    sources: ["EFSA ANS Panel — Re-evaluation of Caramel Colours E150a-d (2011)", "California OEHHA — Proposition 65 Listing for 4-Methylimidazole", "Health Canada List of Permitted Colouring Agents"],
    matchers: [name("Caramel colour"), name("Caramel color"), ecode("E150a"), ecode("E150b"), ecode("E150c"), ecode("E150d")],
  },
  {
    id: "potassium-metabisulfite",
    name: "Potassium Metabisulfite",
    risk: "medium",
    penalty: 14,
    note: "A sulfite-based preservative and antioxidant used in wine and cider — a well-documented trigger for sulfite sensitivity reactions (flushing, wheezing) in a meaningful minority of drinkers, especially those with asthma.",
    tier: "strong-consensus",
    healthBodyPosition: "The FDA requires a 'contains sulfites' declaration whenever sulfite levels exceed 10 ppm, and Health Canada and the EU mandate equivalent allergen labeling — regulators are aligned that sulfite sensitivity is real, even though the substances remain broadly approved at controlled levels.",
    sources: ["FDA — Sulfites: Food Labeling Requirements (21 CFR 101.100)", "Health Canada Food Allergen Labelling", "EU Regulation (EU) No 1169/2011 — Allergen Declaration for Sulphites"],
    matchers: [name("Potassium metabisulfite"), name("Potassium metabisulphite"), ecode("E224")],
  },
  {
    id: "sodium-metabisulfite",
    name: "Sodium Metabisulfite",
    risk: "medium",
    penalty: 14,
    note: "A sulfite preservative used to stabilize wine, cider, and some craft beers against oxidation and spoilage — carries the same sulfite-sensitivity profile as potassium metabisulfite.",
    tier: "strong-consensus",
    healthBodyPosition: "Approved for use but subject to mandatory 'contains sulfites' labeling above 10 ppm in the US, Canada, and the EU because the sensitivity reaction is well-characterized in the clinical literature.",
    sources: ["FDA — Sulfites: Food Labeling Requirements (21 CFR 101.100)", "Health Canada Food Allergen Labelling", "PubMed — sulfite sensitivity and asthma exacerbation studies"],
    matchers: [name("Sodium metabisulfite"), name("Sodium metabisulphite"), ecode("E223")],
  },
  {
    id: "propylene-glycol-alginate",
    name: "Propylene Glycol Alginate",
    risk: "low",
    penalty: 5,
    note: "A foam stabilizer derived from seaweed alginate, used to keep beer head looking good in the glass — broadly considered low-concern, flagged here mainly so drinkers know the foam is engineered rather than incidental.",
    tier: "strong-consensus",
    healthBodyPosition: "The FDA and EFSA both classify it as safe for food use at typical levels, with no toxicological flags identified in the literature — one of the more benign entries on this watchlist.",
    sources: ["FDA Code of Federal Regulations — Propylene Glycol Alginate (21 CFR 172.858)", "EFSA ANS Panel — Re-evaluation of Alginic Acid and Salts (E400-E405)"],
    matchers: [name("Propylene glycol alginate"), ecode("E405")],
  },
  {
    id: "dmdc",
    name: "Dimethyl Dicarbonate (DMDC)",
    risk: "high",
    penalty: 18,
    note: "A chemical sterilization agent used in some beers and ciders to kill residual yeast without heat — it decomposes into carbon dioxide and trace methanol during processing, but concerns persist about high-dose exposures during production and whether decomposition is always complete under real-world conditions.",
    tier: "contested",
    healthBodyPosition: "The FDA and EFSA both approve DMDC as a processing aid on the basis that it fully decomposes in the finished product, while occupational health regulators flag the undiluted compound as a respiratory hazard at production concentrations — the debate centres on whether trace residuals in the poured drink are truly zero.",
    sources: ["FDA Code of Federal Regulations — Dimethyl Dicarbonate (21 CFR 172.133)", "EFSA — Opinion on Dimethyl Dicarbonate (DMDC) for Wine", "OSHA — Chemical Hazard Communication: DMDC Occupational Exposure"],
    matchers: [name("Dimethyl dicarbonate"), name("DMDC"), ecode("E242")],
  },
  {
    id: "isinglass",
    name: "Isinglass",
    risk: "low",
    penalty: 4,
    note: "A fish-bladder-derived fining agent used to clarify cask ales and some beers — not a toxicological concern, but it means the drink is not vegetarian or vegan even when nothing on the front label suggests an animal origin.",
    tier: "strong-consensus",
    healthBodyPosition: "No health body flags isinglass as a safety concern — the relevant guidance here comes from vegetarian and vegan certification bodies, which classify beers fined with it as unsuitable for those diets regardless of the ingredient list shown to consumers.",
    sources: ["The Vegetarian Society — Fining Agents in Beer and Wine Guidance", "The Vegan Society — Animal-Derived Processing Aids Position"],
    matchers: [name("Isinglass")],
  },
  {
    id: "carrageenan",
    name: "Carrageenan",
    risk: "medium",
    penalty: 10,
    note: "A seaweed-derived stabilizer occasionally used in flavored malt beverages and ciders — animal studies have linked degraded forms to gut inflammation, and the food-grade form remains under periodic re-examination.",
    tier: "contested",
    healthBodyPosition: "The FDA and EFSA both maintain food-grade carrageenan is safe at current use levels, while a vocal minority of gastroenterology researchers continues to push for its removal pending more human-trial data — a live, unresolved debate.",
    sources: ["FDA — GRAS Notice Inventory: Carrageenan", "EFSA ANS Panel — Re-evaluation of Carrageenan (E407)", "PubMed — carrageenan and gastrointestinal inflammation studies"],
    matchers: [name("Carrageenan"), ecode("E407")],
  },
  {
    id: "high-fructose-corn-syrup",
    name: "High Fructose Corn Syrup",
    risk: "high",
    penalty: 20,
    note: "A cheap fermentable sugar source used in some mass-market beers, flavored malt beverages, and pre-mixed cocktails. Concentrated fructose load has been linked to insulin resistance, non-alcoholic fatty liver disease, and metabolic syndrome at habitual intake levels.",
    tier: "contested",
    healthBodyPosition: "The WHO and major cardiology bodies recommend limiting all added sugars — including HFCS — and a growing body of metabolic research specifically implicates concentrated fructose intake, distinct from sucrose, in hepatic fat accumulation and dyslipidemia.",
    sources: ["WHO Guideline — Sugars Intake for Adults and Children (2015)", "American Heart Association — Added Sugars Recommendations", "PubMed — dietary fructose and non-alcoholic fatty liver disease (NAFLD) studies"],
    matchers: [name("High fructose corn syrup"), name("High-fructose corn syrup"), name("HFCS")],
  },
  {
    id: "artificial-colours-alcohol",
    name: "Artificial Colours",
    risk: "medium",
    penalty: 12,
    note: "Synthetic dyes occasionally used in flavored malt beverages, ciders, and pre-mixed cocktails — the same family flagged on food labels for a documented link to hyperactivity in sensitive children.",
    tier: "strong-consensus",
    healthBodyPosition: "The EU requires a 'may have an adverse effect on activity and attention in children' warning on foods and drinks containing the six 'Southampton' synthetic dyes, based on a UK FSA clinical study — one of the clearer regulatory responses to a specific additive concern on this list.",
    sources: ["UK Food Standards Agency — Southampton Study on Food Colours and Child Behaviour (2007)", "EU Regulation (EC) No 1333/2008 — Mandatory Warning Label for the 'Southampton Six' Dyes"],
    matchers: [name("Artificial colours"), name("Artificial colors"), name("Artificial colouring"), name("Artificial coloring")],
  },
  {
    id: "citric-acid",
    name: "Citric Acid",
    risk: "low",
    penalty: 3,
    note: "A very common pH-adjusting preservative and flavour enhancer used in seltzers, light beers, and ciders to add tartness and extend shelf life — one of the most widely used food additives globally and broadly considered safe.",
    tier: "strong-consensus",
    healthBodyPosition: "FDA and EFSA classify citric acid as GRAS (Generally Recognized As Safe) with no ADI restrictions — it is naturally present in citrus fruits and metabolized normally through the citric acid cycle. Flagged here for completeness and transparency, not because of a meaningful safety concern.",
    sources: ["FDA GRAS Substances Database — Citric Acid", "EFSA ANS Panel — Re-evaluation of Citric Acid (E330)"],
    matchers: [name("Citric acid"), ecode("E330")],
  },
  {
    id: "natural-flavours",
    name: "Natural Flavours",
    risk: "medium",
    penalty: 8,
    note: "A regulatory catch-all term that covers any flavoring derived from a natural source — fruit, vegetable, herb, bark, or even a highly processed chemical extract from a natural starting material. The label tells you nothing about what the flavour actually is, how it was extracted, or whether it carries any undisclosed allergens.",
    tier: "contested",
    healthBodyPosition: "The FDA and Health Canada broadly permit 'natural flavour' as a label term without requiring the underlying compound to be disclosed — critics argue this allows manufacturers to hide allergens or near-synthetic extracts behind a consumer-friendly word, while regulators maintain the term reflects the source rather than the processing method.",
    sources: ["FDA — Code of Federal Regulations: Definition of Natural Flavour (21 CFR 101.22)", "Health Canada — List of Permitted Flavouring Agents", "Environmental Working Group — Natural Flavors: Not So Natural"],
    matchers: [name("Natural flavour"), name("Natural flavor"), name("Natural flavours"), name("Natural flavors"), name("Natural flavouring"), name("Natural flavoring")],
  },
  {
    id: "artificial-flavours",
    name: "Artificial Flavours",
    risk: "high",
    penalty: 15,
    note: "Synthetic flavour compounds produced in a lab from petrochemical or other non-food feedstocks. While individually tested, the long-term combined exposure effects of the hundreds of approved artificial flavour chemicals — especially at the consumption volumes typical of flavored malt beverages — are not well characterized.",
    tier: "emerging-evidence",
    healthBodyPosition: "Individual artificial flavouring substances are pre-approved for use based on single-compound toxicology studies. Aggregate and mixture-effect research is thin — regulatory bodies have not evaluated the combined burden of all approved synthetic flavours together, which is the actual exposure scenario for regular drinkers of flavored alcoholic beverages.",
    sources: ["FDA — Inventory of Effective Food Contact Substance Notifications: Flavoring Agents", "EFSA — Re-evaluation of Artificial Flavourings Programme", "Environmental Working Group — Artificial Flavors in Alcoholic Beverages"],
    matchers: [name("Artificial flavour"), name("Artificial flavor"), name("Artificial flavours"), name("Artificial flavors"), name("Artificial flavouring"), name("Artificial flavoring")],
  },
];

export type DetectedAlcoholAdditive = Omit<AlcoholAdditiveEntry, "matchers">;

/**
 * Ingredients text is considered "available" when it's at least 10 characters — anything
 * shorter is a stub or empty field and doesn't give us enough data to run additive detection.
 * Canadian alcohol labelling law doesn't require full ingredient disclosure, so empty fields
 * are common for beer and wine products in Open Food Facts.
 */
export function ingredientsAvailable(ingredientsText: string | undefined | null): boolean {
  return typeof ingredientsText === "string" && ingredientsText.trim().length >= 10;
}

function detectAlcoholAdditives(ingredientsText: string | undefined): DetectedAlcoholAdditive[] {
  if (!ingredientsAvailable(ingredientsText)) return [];
  const detected: DetectedAlcoholAdditive[] = [];
  for (const entry of ALCOHOL_ADDITIVES) {
    if (entry.matchers.some((m) => m.pattern.test(ingredientsText!))) {
      const { id, name: additiveName, risk, penalty, note, tier, healthBodyPosition, sources } = entry;
      detected.push({ id, name: additiveName, risk, penalty, note, tier, healthBodyPosition, sources });
    }
  }
  return detected;
}

// ───────── CERTIFICATION BADGES ─────────

const GLUTEN_FREE_PATTERN = /gluten[\s-]?free/i;
const ORGANIC_PATTERN = /organic|\bbio\b|biologique/i;

export function isCertifiedGlutenFree(labelsTags: string[] | undefined | null): boolean {
  return (labelsTags ?? []).some((tag) => GLUTEN_FREE_PATTERN.test(tag));
}

export function isCertifiedOrganic(labelsTags: string[] | undefined | null): boolean {
  return (labelsTags ?? []).some((tag) => ORGANIC_PATTERN.test(tag));
}

// ───────── SCORING ─────────

export type AlcoholGrade = "Clean Pour" | "Moderate" | "Heavy" | "Avoid";

export const ALCOHOL_GRADE_COLORS: Record<AlcoholGrade, string> = {
  "Clean Pour": "#3ddc84",
  Moderate: "#ffd23d",
  Heavy: "#ff9d2e",
  Avoid: "#ff4d4d",
};

export function alcoholGradeFromScore(score: number): AlcoholGrade {
  if (score >= 75) return "Clean Pour";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "Heavy";
  return "Avoid";
}

/** 1–5 🦍 — how fitness-friendly this drink is to reach for regularly. Mirrors the final score on a coarser scale. */
export function gorillaPourRating(score: number): number {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  return 1;
}

function calorieDensityScore(kcalPer100ml: number | null): number {
  if (kcalPer100ml === null) return 70;
  if (kcalPer100ml <= 30) return 100;
  if (kcalPer100ml <= 45) return 80;
  if (kcalPer100ml <= 60) return 60;
  if (kcalPer100ml <= 90) return 40;
  return 20;
}

function carbScore(carbsPer100ml: number | null): number {
  if (carbsPer100ml === null) return 70;
  if (carbsPer100ml <= 2) return 100;
  if (carbsPer100ml <= 4) return 80;
  if (carbsPer100ml <= 7) return 60;
  if (carbsPer100ml <= 10) return 40;
  return 20;
}

function cleanlinessScore(detected: DetectedAlcoholAdditive[], hasIngredients: boolean): number {
  // When ingredient data isn't available we can't claim the product is clean — use a neutral
  // mid-point rather than a perfect 100 so the overall score isn't misleadingly high.
  if (!hasIngredients) return 70;
  const penalty = detected.reduce((sum, a) => sum + a.penalty, 0);
  return Math.max(0, 100 - penalty);
}

export type AlcoholScoreResult = {
  score: number;
  grade: AlcoholGrade;
  gorillaPour: number;
  cleanlinessScore: number;
  calorieDensityScore: number;
  carbScore: number;
  abv: number | null;
  kcalPer100ml: number | null;
  kcalPerServing: number | null;
  carbsPer100ml: number | null;
  carbsPerServing: number | null;
  sugarPerServing: number | null;
  referenceServingMl: number;
  detectedAdditives: DetectedAlcoholAdditive[];
  /** True when OFF returned ≥10 chars of ingredient text and additive detection actually ran. */
  hasIngredients: boolean;
  flags: string[];
  positives: string[];
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeAlcoholScore(
  nutriments: Nutriments,
  ingredientsText: string | undefined,
  kind: AlcoholKind
): AlcoholScoreResult {
  const referenceServingMl = REFERENCE_SERVING_ML[kind];

  // Beverages have a density close enough to water (~1g/mL) that OFF's
  // per-100g nutriment figures are the right stand-in for per-100mL.
  const kcalPer100ml = nutriments["energy-kcal_100g"] ?? null;
  const carbsPer100ml = nutriments.carbohydrates_100g ?? null;
  const abv = nutriments.alcohol_100g ?? null;

  const kcalPerServing = kcalPer100ml !== null ? round1((kcalPer100ml / 100) * referenceServingMl) : null;
  const carbsPerServing = carbsPer100ml !== null ? round1((carbsPer100ml / 100) * referenceServingMl) : null;
  const sugarPerServing =
    nutriments.sugars_serving ?? (nutriments.sugars_100g !== undefined ? round1((nutriments.sugars_100g / 100) * referenceServingMl) : null);

  const hasIngredients = ingredientsAvailable(ingredientsText);
  const detectedAdditives = detectAlcoholAdditives(ingredientsText);

  const cScore = cleanlinessScore(detectedAdditives, hasIngredients);
  const calScore = calorieDensityScore(kcalPer100ml);
  const carbSc = carbScore(carbsPer100ml);

  const score = Math.round(cScore * 0.5 + calScore * 0.3 + carbSc * 0.2);
  const grade = alcoholGradeFromScore(score);
  const gorillaPour = gorillaPourRating(score);

  const flags: string[] = [];
  const positives: string[] = [];

  if (detectedAdditives.length > 0) {
    flags.push(
      `${detectedAdditives.length} flagged additive${detectedAdditives.length > 1 ? "s" : ""} detected: ${detectedAdditives.map((a) => a.name).join(", ")}`
    );
  } else if (hasIngredients) {
    positives.push("No flagged additives detected in the ingredients list");
  }
  // When !hasIngredients: neither a flag nor a positive is added here — the card itself
  // renders the "ingredient data not available" notice in the additive section instead.

  if (kcalPer100ml !== null) {
    if (kcalPer100ml > 60) {
      flags.push(`High calorie density: ${round1(kcalPer100ml)} kcal per 100mL`);
    } else if (kcalPer100ml <= 35) {
      positives.push(`Light on calories: ${round1(kcalPer100ml)} kcal per 100mL`);
    }
  }

  if (carbsPer100ml !== null) {
    if (carbsPer100ml > 7) {
      flags.push(`High carb load: ${round1(carbsPer100ml)}g carbs per 100mL`);
    } else if (carbsPer100ml <= 2) {
      positives.push(`Low-carb pour: ${round1(carbsPer100ml)}g carbs per 100mL`);
    }
  }

  if (abv !== null && abv >= 7) {
    flags.push(`Higher-strength pour: ${round1(abv)}% ABV — fewer servings add up to the same intake`);
  }

  return {
    score,
    grade,
    gorillaPour,
    cleanlinessScore: cScore,
    calorieDensityScore: calScore,
    carbScore: carbSc,
    abv,
    kcalPer100ml,
    kcalPerServing,
    carbsPer100ml,
    carbsPerServing,
    sugarPerServing,
    referenceServingMl,
    detectedAdditives,
    hasIngredients,
    flags,
    positives,
  };
}
