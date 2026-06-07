export type RiskLevel = "high" | "medium" | "low";

export type AdditiveInfo = {
  id: string;
  /** The common name (or E-code) actually found in the ingredients text. */
  name: string;
  risk: RiskLevel;
  /** Plain-English explanation of why this additive matters. */
  note: string;
};

type Matcher = { label: string; pattern: RegExp };

type AdditiveEntry = {
  id: string;
  risk: RiskLevel;
  /** Points deducted from the additive score when this entry is detected. */
  penalty: number;
  note: string;
  matchers: Matcher[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Matches a plain-language name, tolerating spaces/hyphens between words. */
function name(label: string): Matcher {
  const pattern = escapeRegExp(label).replace(/[\s-]+/g, "[\\s-]+");
  return { label, pattern: new RegExp(`\\b${pattern}\\b`, "i") };
}

/** Matches an E-number in any common spacing/hyphenation, e.g. "E171", "E-171", "E 171". */
function ecode(code: string): Matcher {
  const numeric = code.replace(/^e/i, "");
  return { label: code.toUpperCase(), pattern: new RegExp(`\\bE[\\s-]?${numeric}\\b`, "i") };
}

// Gorilla Fuel additive intel — every E-code AND common label we scan ingredient
// text for, the way Yuka and similar apps do. One entry per real-world substance;
// whichever alias actually appears in the text is what gets surfaced to the user.
const ADDITIVES: AdditiveEntry[] = [
  // ───────────────────────── HIGH RISK ─────────────────────────
  {
    id: "hydrogenated-oil",
    risk: "high",
    penalty: 25,
    note: "Industrially created trans fat. Raises LDL ('bad') cholesterol and lowers HDL — one of the clearest dietary links to heart disease.",
    matchers: [name("Partially hydrogenated vegetable oil"), name("Partially hydrogenated oil"), name("Hydrogenated vegetable oil"), name("Hydrogenated oil")],
  },
  {
    id: "potassium-bromate",
    risk: "high",
    penalty: 25,
    note: "Flour treatment agent classified as a possible human carcinogen — banned for food use across the EU, UK, and Canada.",
    matchers: [name("Potassium bromate")],
  },
  {
    id: "titanium-dioxide",
    risk: "high",
    penalty: 25,
    note: "Whitening agent banned as a food additive in the EU since 2022 over genotoxicity (DNA damage) concerns.",
    matchers: [name("Titanium dioxide"), ecode("E171")],
  },
  {
    id: "tbhq",
    risk: "high",
    penalty: 23,
    note: "Petroleum-derived preservative. Animal studies link high intakes to vision disturbances and immune effects.",
    matchers: [name("TBHQ"), name("tert-Butylhydroquinone"), name("tertiary butylhydroquinone"), ecode("E319")],
  },
  {
    id: "sodium-nitrite",
    risk: "high",
    penalty: 23,
    note: "Curing agent that can form nitrosamines in the body — compounds classified as probable carcinogens, especially with processed meats.",
    matchers: [name("Sodium nitrite"), ecode("E250")],
  },
  {
    id: "red-3",
    risk: "high",
    penalty: 23,
    note: "Synthetic dye (Erythrosine) shown to cause thyroid tumors in animal studies — the FDA moved to ban it from food in 2025.",
    matchers: [name("Red 3"), name("Erythrosine"), ecode("E127")],
  },
  {
    id: "potassium-nitrite",
    risk: "high",
    penalty: 23,
    note: "Curing agent closely related to sodium nitrite — linked to nitrosamine formation, a carcinogen precursor.",
    matchers: [name("Potassium nitrite"), ecode("E249")],
  },
  {
    id: "sodium-nitrate",
    risk: "high",
    penalty: 22,
    note: "Preservative that converts to nitrite in the body, contributing to the same nitrosamine cancer-risk pathway.",
    matchers: [name("Sodium nitrate"), ecode("E251")],
  },
  {
    id: "tartrazine",
    risk: "high",
    penalty: 22,
    note: "Synthetic azo dye named in the EU 'Southampton Six' study linking artificial colors to hyperactivity in children.",
    matchers: [name("Tartrazine"), name("Yellow 5"), ecode("E102")],
  },
  {
    id: "sunset-yellow",
    risk: "high",
    penalty: 22,
    note: "Synthetic azo dye flagged alongside Tartrazine in the EU hyperactivity study — many UK brands have voluntarily phased it out.",
    matchers: [name("Sunset Yellow"), name("Yellow 6"), ecode("E110")],
  },
  {
    id: "allura-red",
    risk: "high",
    penalty: 22,
    note: "Synthetic dye under ongoing regulatory review for behavioral effects in children — requires a warning label in the EU.",
    matchers: [name("Allura Red"), name("Red 40"), ecode("E129")],
  },
  {
    id: "carmoisine",
    risk: "high",
    penalty: 22,
    note: "Synthetic azo dye banned in the US, Japan, and several other countries over allergy and hyperactivity concerns.",
    matchers: [name("Carmoisine"), ecode("E122")],
  },
  {
    id: "ponceau-4r",
    risk: "high",
    penalty: 22,
    note: "Azo dye linked to allergic reactions and hyperactivity — banned for food use in the US, Norway, and Canada.",
    matchers: [name("Ponceau 4R"), ecode("E124")],
  },
  {
    id: "cyclamate",
    risk: "high",
    penalty: 21,
    note: "Artificial sweetener banned in the US since 1970 over bladder-cancer concerns raised in animal studies.",
    matchers: [name("Cyclamate"), ecode("E952")],
  },
  {
    id: "bha",
    risk: "high",
    penalty: 21,
    note: "Synthetic antioxidant listed by US health authorities as 'reasonably anticipated to be a human carcinogen.'",
    matchers: [name("BHA"), name("Butylated hydroxyanisole"), ecode("E320")],
  },
  {
    id: "bht",
    risk: "high",
    penalty: 21,
    note: "Synthetic antioxidant under ongoing review for hormone-disrupting effects and links to hyperactivity.",
    matchers: [name("BHT"), name("Butylated hydroxytoluene"), ecode("E321")],
  },
  {
    id: "propyl-gallate",
    risk: "high",
    penalty: 21,
    note: "Synthetic preservative that, in animal studies, has been linked to reproductive and endocrine effects at high doses.",
    matchers: [name("Propyl gallate"), ecode("E310")],
  },
  {
    id: "artificial-colors",
    risk: "high",
    penalty: 20,
    note: "Generic synthetic colorants — a category-wide flag tied to hyperactivity findings and consumer demand for removal.",
    matchers: [name("Artificial colors"), name("Artificial colours"), name("Artificial color"), name("Artificial colour")],
  },
  {
    id: "blue-1",
    risk: "high",
    penalty: 20,
    note: "Synthetic dye (Brilliant Blue FCF) showing signs of crossing the blood-brain barrier in animal studies.",
    matchers: [name("Blue 1"), name("Brilliant Blue FCF"), ecode("E133")],
  },
  {
    id: "blue-2",
    risk: "high",
    penalty: 20,
    note: "Synthetic dye (Indigotine) associated with hypersensitivity reactions and under continued regulatory scrutiny.",
    matchers: [name("Blue 2"), name("Indigotine"), ecode("E132")],
  },
  {
    id: "green-3",
    risk: "high",
    penalty: 20,
    note: "Synthetic dye (Fast Green FCF) shown to cause tumors at the injection site in animal studies, though oral risk is debated.",
    matchers: [name("Green 3"), name("Fast Green"), ecode("E143")],
  },
  {
    id: "carrageenan",
    risk: "high",
    penalty: 20,
    note: "Seaweed-derived thickener repeatedly linked in lab studies to gut inflammation and digestive irritation.",
    matchers: [name("Carrageenan"), ecode("E407")],
  },
  {
    id: "sodium-benzoate",
    risk: "high",
    penalty: 20,
    note: "Preservative that can react with vitamin C to form benzene, a known carcinogen, especially in soft drinks.",
    matchers: [name("Sodium benzoate"), ecode("E211")],
  },
  {
    id: "potassium-benzoate",
    risk: "high",
    penalty: 20,
    note: "Close chemical relative of sodium benzoate, carrying the same benzene-formation risk when combined with vitamin C.",
    matchers: [name("Potassium benzoate"), ecode("E212")],
  },
  {
    id: "acesulfame-k",
    risk: "high",
    penalty: 20,
    note: "Artificial sweetener that animal research has tentatively linked to glucose-tolerance and gut-microbiome disruption.",
    matchers: [name("Acesulfame potassium"), name("Acesulfame-K"), name("Acesulfame K"), ecode("E950")],
  },
  {
    id: "saccharin",
    risk: "high",
    penalty: 20,
    note: "The oldest artificial sweetener — carried a cancer warning label for decades before being delisted, and remains controversial.",
    matchers: [name("Saccharin"), ecode("E954")],
  },

  // ──────────────────────── MEDIUM RISK ────────────────────────
  {
    id: "aspartame",
    risk: "medium",
    penalty: 12,
    note: "Artificial sweetener classified by the WHO's cancer research arm (IARC) as 'possibly carcinogenic to humans' in 2023.",
    matchers: [name("Aspartame"), ecode("E951")],
  },
  {
    id: "high-fructose-corn-syrup",
    risk: "medium",
    penalty: 12,
    note: "Concentrated liquid sweetener linked in research to higher rates of obesity, fatty liver, and metabolic syndrome.",
    matchers: [name("High fructose corn syrup"), name("HFCS")],
  },
  {
    id: "sucralose",
    risk: "medium",
    penalty: 11,
    note: "Artificial sweetener that recent studies suggest may alter gut bacteria and blunt the body's insulin response.",
    matchers: [name("Sucralose"), ecode("E955")],
  },
  {
    id: "polysorbate-80",
    risk: "medium",
    penalty: 11,
    note: "Emulsifier that animal studies suggest may erode the gut's protective mucus layer and promote inflammation.",
    matchers: [name("Polysorbate 80"), ecode("E433")],
  },
  {
    id: "palm-oil",
    risk: "medium",
    penalty: 10,
    note: "High in saturated fat, and its production is a leading driver of deforestation — a health and sourcing double flag.",
    matchers: [name("Palm kernel oil"), name("Palm oil")],
  },
  {
    id: "corn-syrup",
    risk: "medium",
    penalty: 10,
    note: "Refined liquid sugar that spikes blood glucose quickly and adds calories with no nutritional value.",
    // Negative lookbehind so "high fructose corn syrup" is only ever counted as its own entry, not double-flagged here too.
    matchers: [{ label: "Corn syrup", pattern: /(?<!high[\s-]fructose[\s-])\bcorn[\s-]+syrup\b/i }],
  },
  {
    id: "modified-starch",
    risk: "medium",
    penalty: 10,
    note: "Chemically altered starch used as a cheap filler and texture aid — a marker of heavy processing.",
    matchers: [name("Modified food starch"), name("Modified corn starch"), name("Modified starch")],
  },
  {
    id: "carboxymethylcellulose",
    risk: "medium",
    penalty: 10,
    note: "Synthetic thickener (cellulose gum) that emerging research links to gut inflammation, similar to carrageenan.",
    matchers: [name("Carboxymethylcellulose"), name("Cellulose gum"), ecode("E466")],
  },
  {
    id: "xanthan-gum",
    risk: "medium",
    penalty: 10,
    note: "Generally well-tolerated thickener, but in high quantities it can cause bloating and digestive discomfort — worth watching where it's listed early in the ingredients.",
    matchers: [name("Xanthan gum"), ecode("E415")],
  },
  {
    id: "soy-lecithin",
    risk: "medium",
    penalty: 10,
    note: "Common emulsifier, usually well tolerated, but typically signals a heavily processed product and can trigger soy allergies.",
    matchers: [name("Soy lecithin"), name("Soya lecithin"), ecode("E322")],
  },
  {
    id: "canola-oil",
    risk: "medium",
    penalty: 10,
    note: "Often heavily refined with chemical solvents — a marker of industrial processing even though the fat profile itself is moderate.",
    matchers: [name("Canola oil"), name("Rapeseed oil")],
  },
  {
    id: "vegetable-oil",
    risk: "medium",
    penalty: 10,
    note: "An unspecified blend — the vagueness itself is the flag, since it can mask less desirable oils swapped batch to batch.",
    // Lookbehind so "(partially) hydrogenated vegetable oil" is only counted under that entry, not double-flagged here too.
    matchers: [{ label: "Vegetable oil", pattern: /(?<!(?:partially[\s-]+)?hydrogenated[\s-]+)\bvegetable[\s-]+oil\b/i }],
  },
  {
    id: "natural-flavors",
    risk: "medium",
    penalty: 10,
    note: "A legally vague catch-all that can hide dozens of compounds behind two reassuring words on the label.",
    matchers: [name("Natural flavors"), name("Natural flavours"), name("Natural flavoring"), name("Natural flavour")],
  },
  {
    id: "yeast-extract",
    risk: "medium",
    penalty: 10,
    note: "A common way to add free glutamate (an MSG-like flavor booster) without listing MSG on the label.",
    matchers: [name("Yeast extract")],
  },
  {
    id: "autolyzed-yeast",
    risk: "medium",
    penalty: 10,
    note: "Functions like yeast extract — a glutamate-rich flavor enhancer that sidesteps the 'MSG' label consumers watch for.",
    matchers: [name("Autolyzed yeast"), name("Autolysed yeast")],
  },
  {
    id: "sulphur-dioxide",
    risk: "medium",
    penalty: 11,
    note: "Preservative that can trigger breathing difficulty and reactions in people with asthma or sulphite sensitivity.",
    matchers: [name("Sulphur dioxide"), name("Sulfur dioxide"), ecode("E220")],
  },

  // ───────────────────────── LOW RISK ──────────────────────────
  {
    id: "msg",
    risk: "low",
    penalty: 4,
    note: "Flavor enhancer that major health bodies consider safe for most people — though a sensitive minority report headaches or flushing.",
    matchers: [name("Monosodium glutamate"), name("MSG"), ecode("E621")],
  },
  {
    id: "maltodextrin",
    risk: "low",
    penalty: 4,
    note: "Highly processed starch-derived filler with a higher glycemic impact than table sugar, despite tasting barely sweet.",
    matchers: [name("Maltodextrin")],
  },
  {
    id: "cochineal",
    risk: "low",
    penalty: 4,
    note: "Natural insect-derived colorant (carmine) — safe for most, but a known allergen for a small number of people and a no-go for vegans.",
    matchers: [name("Cochineal"), name("Carmine"), ecode("E120")],
  },
  {
    id: "soy-protein-isolate",
    risk: "low",
    penalty: 3,
    note: "Heavily processed protein source — generally fine nutritionally, but a marker of industrial refinement and a common allergen.",
    matchers: [name("Soy protein isolate"), name("Soya protein isolate")],
  },
  {
    id: "whey-protein-concentrate",
    risk: "low",
    penalty: 3,
    note: "Lower-purity protein form than isolate — perfectly safe, just worth knowing you're getting more lactose and fat alongside the protein.",
    matchers: [name("Whey protein concentrate")],
  },
  {
    id: "carob-bean-gum",
    risk: "low",
    penalty: 3,
    note: "Plant-derived thickener with a strong safety record — about as benign as additives get.",
    matchers: [name("Carob bean gum"), name("Locust bean gum"), ecode("E410")],
  },
  {
    id: "guar-gum",
    risk: "low",
    penalty: 3,
    note: "Plant-derived thickener and fiber source — well tolerated by most people in the quantities typically used in food.",
    matchers: [name("Guar gum"), ecode("E412")],
  },
];

export type Grade = "Excellent" | "Good" | "Poor" | "Bad";

export type Nutriments = {
  sugars_100g?: number;
  "saturated-fat_100g"?: number;
  salt_100g?: number;
  "energy-kcal_100g"?: number;
  fiber_100g?: number;
  proteins_100g?: number;
};

export type ScoreResult = {
  finalScore: number;
  nutritionScore: number;
  additiveScore: number;
  grade: Grade;
  flags: string[];
  positives: string[];
  detectedAdditives: AdditiveInfo[];
};

function gradeFromScore(score: number): Grade {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Good";
  if (score >= 25) return "Poor";
  return "Bad";
}

export function scoreNutrition(n: Nutriments): {
  score: number;
  flags: string[];
  positives: string[];
} {
  let score = 100;
  const flags: string[] = [];
  const positives: string[] = [];

  const sugar = n.sugars_100g ?? 0;
  const satFat = n["saturated-fat_100g"] ?? 0;
  const salt = n.salt_100g ?? 0;
  const calories = n["energy-kcal_100g"] ?? 0;
  const fiber = n.fiber_100g ?? 0;
  const protein = n.proteins_100g ?? 0;

  if (sugar > 20) {
    score -= 30;
    flags.push(`Very high sugar — ${sugar.toFixed(1)}g per 100g`);
  } else if (sugar > 12) {
    score -= 12;
    flags.push(`Elevated sugar — ${sugar.toFixed(1)}g per 100g`);
  }

  if (satFat > 10) {
    score -= 20;
    flags.push(`Very high saturated fat — ${satFat.toFixed(1)}g per 100g`);
  } else if (satFat > 5) {
    score -= 10;
    flags.push(`Elevated saturated fat — ${satFat.toFixed(1)}g per 100g`);
  }

  if (salt > 1.5) {
    score -= 25;
    flags.push(`Very high salt — ${salt.toFixed(2)}g per 100g`);
  } else if (salt > 0.6) {
    score -= 8;
    flags.push(`Elevated salt — ${salt.toFixed(2)}g per 100g`);
  }

  if (calories > 500) {
    score -= 15;
    flags.push(`Very calorie-dense — ${calories.toFixed(0)} kcal per 100g`);
  } else if (calories > 350) {
    score -= 8;
    flags.push(`Calorie-dense — ${calories.toFixed(0)} kcal per 100g`);
  }

  if (fiber > 3) {
    score += 8;
    positives.push(`Solid fiber content — ${fiber.toFixed(1)}g per 100g`);
  }

  if (protein > 10) {
    score += 10;
    positives.push(`Strong protein content — ${protein.toFixed(1)}g per 100g`);
  }

  if (flags.length === 0) {
    positives.push("No major nutrition red flags detected");
  }

  return { score: Math.max(0, Math.min(100, score)), flags, positives };
}

export function scoreAdditives(ingredientsText: string | undefined | null): {
  score: number;
  detected: AdditiveInfo[];
} {
  const text = ingredientsText ?? "";
  const detected: AdditiveInfo[] = [];
  let score = 100;

  for (const entry of ADDITIVES) {
    // First matching alias wins — that's the "common name found" we surface.
    // Each entry counts once no matter how many times (or which alias) it appears.
    const hit = entry.matchers.find((matcher) => matcher.pattern.test(text));
    if (!hit) continue;

    detected.push({ id: entry.id, name: hit.label, risk: entry.risk, note: entry.note });
    score -= entry.penalty;
  }

  return { score: Math.max(0, Math.min(100, score)), detected };
}

export function computeScore(
  nutriments: Nutriments,
  ingredientsText: string | undefined | null
): ScoreResult {
  const nutrition = scoreNutrition(nutriments);
  const additives = scoreAdditives(ingredientsText);

  const finalScore = Math.round(nutrition.score * 0.6 + additives.score * 0.4);

  const flags = [...nutrition.flags];
  const positives = [...nutrition.positives];

  if (additives.detected.length > 0) {
    const highRisk = additives.detected.filter((a) => a.risk === "high");
    if (highRisk.length > 0) {
      flags.push(
        `${highRisk.length} high-risk additive${highRisk.length > 1 ? "s" : ""} detected: ${highRisk.map((a) => a.name).join(", ")}`
      );
    }
    const otherRisk = additives.detected.filter((a) => a.risk !== "high");
    if (otherRisk.length > 0) {
      flags.push(
        `${otherRisk.length} additional additive${otherRisk.length > 1 ? "s" : ""} flagged: ${otherRisk.map((a) => a.name).join(", ")}`
      );
    }
  } else {
    positives.push("No flagged additives detected in the ingredients list");
  }

  return {
    finalScore: Math.max(0, Math.min(100, finalScore)),
    nutritionScore: Math.round(nutrition.score),
    additiveScore: Math.round(additives.score),
    grade: gradeFromScore(finalScore),
    flags,
    positives,
    detectedAdditives: additives.detected,
  };
}

export const GRADE_COLORS: Record<Grade, string> = {
  Excellent: "#3ddc84",
  Good: "#ffd700",
  Poor: "#ff9d2e",
  Bad: "#ff4d4d",
};
