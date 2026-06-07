export type RiskLevel = "high" | "medium" | "low";

export type AdditiveInfo = {
  code: string;
  name: string;
  risk: RiskLevel;
  note: string;
};

// Additive intel — the codes Gorilla Fuel scans every ingredients list for.
export const ADDITIVE_DB: Record<string, AdditiveInfo> = {
  E102: { code: "E102", name: "Tartrazine", risk: "high", note: "Synthetic azo dye linked to hyperactivity in children." },
  E110: { code: "E110", name: "Sunset Yellow FCF", risk: "high", note: "Azo dye flagged in the EU 'Southampton Six' hyperactivity study." },
  E120: { code: "E120", name: "Cochineal / Carmine", risk: "low", note: "Natural insect-derived colorant; rare allergen concerns only." },
  E122: { code: "E122", name: "Carmoisine", risk: "high", note: "Synthetic azo dye banned in several countries outside the EU." },
  E124: { code: "E124", name: "Ponceau 4R", risk: "high", note: "Azo dye linked to allergic reactions and hyperactivity." },
  E129: { code: "E129", name: "Allura Red AC", risk: "high", note: "Synthetic dye under ongoing review for behavioral effects in kids." },
  E211: { code: "E211", name: "Sodium Benzoate", risk: "medium", note: "Preservative that can form benzene when combined with vitamin C." },
  E220: { code: "E220", name: "Sulphur Dioxide", risk: "medium", note: "Preservative that can trigger reactions in asthma sufferers." },
  E249: { code: "E249", name: "Potassium Nitrite", risk: "high", note: "Curing agent linked to nitrosamine formation — a carcinogen precursor." },
  E250: { code: "E250", name: "Sodium Nitrite", risk: "high", note: "Curing agent linked to nitrosamine formation — a carcinogen precursor." },
  E320: { code: "E320", name: "BHA", risk: "medium", note: "Synthetic antioxidant classified as a possible human carcinogen." },
  E321: { code: "E321", name: "BHT", risk: "medium", note: "Synthetic antioxidant under review for endocrine disruption." },
  E407: { code: "E407", name: "Carrageenan", risk: "medium", note: "Thickener linked to digestive inflammation in some studies." },
  E621: { code: "E621", name: "Monosodium Glutamate (MSG)", risk: "low", note: "Flavor enhancer — generally recognized as safe, sensitivity varies." },
  E951: { code: "E951", name: "Aspartame", risk: "medium", note: "Artificial sweetener classified by IARC as 'possibly carcinogenic.'" },
  E952: { code: "E952", name: "Cyclamate", risk: "medium", note: "Artificial sweetener banned in the US over cancer concerns." },
  E954: { code: "E954", name: "Saccharin", risk: "medium", note: "Artificial sweetener with a controversial regulatory history." },
  E171: { code: "E171", name: "Titanium Dioxide", risk: "high", note: "Whitening agent banned as a food additive in the EU since 2022." },
};

const ADDITIVE_CODES = Object.keys(ADDITIVE_DB);

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

  if (sugar > 22.5) {
    score -= 25;
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
    score -= 15;
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
  const text = (ingredientsText ?? "").toUpperCase();
  const detected: AdditiveInfo[] = [];

  for (const code of ADDITIVE_CODES) {
    const info = ADDITIVE_DB[code];
    const numeric = code.slice(1);
    // Match "E102" or bare "102" as a whole-ish token, plus common name
    const pattern = new RegExp(`\\bE[\\s-]?${numeric}\\b|\\b${info.name.split(" ")[0].toUpperCase()}\\b`);
    if (pattern.test(text)) {
      detected.push(info);
    }
  }

  let score = 100;
  for (const additive of detected) {
    if (additive.risk === "high") score -= 30;
    else if (additive.risk === "medium") score -= 15;
    else score -= 8;
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
        `${highRisk.length} high-risk additive${highRisk.length > 1 ? "s" : ""} detected: ${highRisk.map((a) => a.code).join(", ")}`
      );
    }
    const otherRisk = additives.detected.filter((a) => a.risk !== "high");
    if (otherRisk.length > 0) {
      flags.push(
        `${otherRisk.length} additional additive${otherRisk.length > 1 ? "s" : ""} flagged: ${otherRisk.map((a) => a.code).join(", ")}`
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
