import { gradeFromScore, type EvidenceTier, type Grade, type RiskLevel } from "./scoring";

export type BeautyConcern = "Paraben" | "Endocrine Disruptor" | "Irritant" | "Allergen / Sensitizer" | "Carcinogen Concern";

export type BeautyIngredientInfo = {
  id: string;
  name: string;
  concern: BeautyConcern;
  risk: RiskLevel;
  note: string;
  tier: EvidenceTier;
  healthBodyPosition: string;
  gorillaPosition: string;
  sources: string[];
};

type Matcher = { label: string; pattern: RegExp };

type BeautyEntry = {
  id: string;
  concern: BeautyConcern;
  risk: RiskLevel;
  penalty: number;
  note: string;
  tier: EvidenceTier;
  healthBodyPosition: string;
  gorillaPosition: string;
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

/**
 * Cosmetic ingredient database focused on the four concern areas the beauty
 * score targets — irritants, allergens, endocrine disruptors, and parabens —
 * built from the same real-institutional-source standard as the food additive
 * database (EU Cosmetics Regulation, FDA, CIR, IARC, NTP, SCCS, CDC).
 */
const BEAUTY_INGREDIENTS: BeautyEntry[] = [
  {
    id: "parabens",
    concern: "Paraben",
    risk: "medium",
    penalty: 18,
    note: "A family of preservatives that stop mold and bacteria from growing in cosmetics — the longer-chain variants (propyl-, butyl-) carry the most regulatory scrutiny over hormone-mimicking activity.",
    tier: "contested",
    healthBodyPosition: "The EU's Scientific Committee on Consumer Safety restricted propylparaben and butylparaben from leave-on products for children under three over endocrine-disruption concerns, while the FDA and the Cosmetic Ingredient Review panel maintain that all four remain safe at the concentrations typically used — a genuine regulatory split on the same evidence.",
    gorillaPosition: "When Europe restricts something for kids' products and the US still allows it everywhere, that gap is worth knowing about — especially for anything you or your family leave on skin for hours.",
    sources: ["EU SCCS Opinion on Parabens (SCCS/1514/13)", "FDA — Parabens in Cosmetics", "Cosmetic Ingredient Review — Final Amended Safety Assessment of Parabens"],
    matchers: [name("Methylparaben"), name("Propylparaben"), name("Butylparaben"), name("Ethylparaben"), name("Paraben")],
  },
  {
    id: "phthalates",
    concern: "Endocrine Disruptor",
    risk: "high",
    penalty: 22,
    note: "A class of plasticizers sometimes hidden inside 'fragrance' to help scent linger on skin — among the most consistently flagged endocrine disruptors in consumer products.",
    tier: "contested",
    healthBodyPosition: "The EU has banned several phthalates (DEHP, DBP, BBP) from cosmetics outright under its Cosmetics Regulation, the CDC tracks population-wide phthalate exposure as a public-health concern, while the FDA continues to monitor rather than prohibit their cosmetic use — another case of regulators reaching different conclusions from the same body of evidence.",
    gorillaPosition: "This is the textbook 'hidden in plain sight' ingredient — it rarely appears by name, tucked instead inside an undisclosed fragrance blend. If a label just says 'parfum' on a long-wear product, that's worth a second thought.",
    sources: ["EU Cosmetics Regulation (EC) No 1223/2009 — Annex II", "CDC National Biomonitoring Program — Phthalates", "FDA — Phthalates in Cosmetics"],
    matchers: [name("Phthalate"), name("DEHP"), name("Dibutyl phthalate"), name("Diethylhexyl phthalate"), name("DBP")],
  },
  {
    id: "formaldehyde",
    concern: "Carcinogen Concern",
    risk: "high",
    penalty: 25,
    note: "A preservative (and the substance slowly released by several other common preservatives) classified as a known human carcinogen at sufficient exposure levels.",
    tier: "strong-consensus",
    healthBodyPosition: "The WHO's cancer research arm (IARC) classifies formaldehyde as a Group 1 carcinogen, and the EU Cosmetics Regulation requires a visible warning label on any product releasing it above 0.05% — a rare case where the hazard classification and the cosmetics-specific regulation are squarely aligned.",
    gorillaPosition: "This is one of the clearer calls on this list — a Group 1 IARC classification is the same evidence tier as tobacco. If you see it (or a 'releaser' preservative like DMDM hydantoin or quaternium-15) on a label you'll use often, that's a real reason to look for an alternative.",
    sources: ["IARC Monographs Volume 100F — Formaldehyde", "EU Cosmetics Regulation (EC) No 1223/2009 — Annex V", "Cosmetic Ingredient Review — Formaldehyde and Formaldehyde-Releasing Preservatives"],
    matchers: [name("Formaldehyde"), name("Quaternium-15"), name("DMDM hydantoin")],
  },
  {
    id: "sodium-lauryl-sulfate",
    concern: "Irritant",
    risk: "medium",
    penalty: 12,
    note: "A foaming surfactant found in shampoos, toothpastes, and washes — well documented as a skin and eye irritant, particularly with prolonged contact or in leave-on products.",
    tier: "strong-consensus",
    healthBodyPosition: "The Cosmetic Ingredient Review panel and decades of dermatological research agree it's safe in brief, rinse-off use at typical concentrations, but consistently identify it as one of the more irritating common surfactants — especially for sensitive or compromised skin.",
    gorillaPosition: "Not a hidden-danger story — a well-known irritant story. Fine in a quick rinse-off product for most people; worth avoiding if you already deal with sensitive skin, eczema, or dry scalp.",
    sources: ["Cosmetic Ingredient Review — Safety Assessment of Sodium Lauryl Sulfate", "PubMed — sodium lauryl sulfate skin irritation studies"],
    matchers: [name("Sodium lauryl sulfate"), name("Sodium dodecyl sulfate"), name("SLS")],
  },
  {
    id: "sodium-laureth-sulfate",
    concern: "Irritant",
    risk: "low",
    penalty: 8,
    note: "A milder cousin of sodium lauryl sulfate made via ethoxylation — a process that can leave trace amounts of 1,4-dioxane, a substance the FDA actively monitors in cosmetics.",
    tier: "emerging-evidence",
    healthBodyPosition: "The Cosmetic Ingredient Review panel considers it safe as used, but the FDA separately monitors finished products for 1,4-dioxane contamination from the ethoxylation manufacturing step — a processing-byproduct concern that's distinct from the ingredient itself and still being tracked.",
    gorillaPosition: "Gentler than SLS on skin, but the 1,4-dioxane angle is about how it's made, not what's on the label — which is exactly the kind of thing a label can't tell you and regulators have to chase down at the factory level.",
    sources: ["FDA — 1,4-Dioxane in Cosmetic Products", "Cosmetic Ingredient Review — Safety Assessment of Sodium Laureth Sulfate"],
    matchers: [name("Sodium laureth sulfate"), name("Sodium lauryl ether sulfate"), name("SLES")],
  },
  {
    id: "bha",
    concern: "Endocrine Disruptor",
    risk: "high",
    penalty: 20,
    note: "A synthetic antioxidant preservative (butylated hydroxyanisole) that the US National Toxicology Program lists as 'reasonably anticipated to be a human carcinogen' based on animal studies, alongside signals of hormone-mimicking activity.",
    tier: "emerging-evidence",
    healthBodyPosition: "The US National Toxicology Program's Report on Carcinogens lists it in its 'reasonably anticipated' category from rodent studies, and the EU restricts the concentrations permitted in cosmetic formulations — both signal real concern even though neither amounts to an outright global ban.",
    gorillaPosition: "An animal-study red flag from a US federal program is not nothing — it's an early warning, not a verdict. Worth knowing it's there, especially on something you use daily.",
    sources: ["US National Toxicology Program — Report on Carcinogens, BHA", "EU Cosmetics Regulation (EC) No 1223/2009 — Annex III"],
    matchers: [name("BHA"), name("Butylated hydroxyanisole")],
  },
  {
    id: "bht",
    concern: "Endocrine Disruptor",
    risk: "low",
    penalty: 8,
    note: "A close relative of BHA used as an antioxidant preservative — the safety picture is more reassuring, though early research has raised a smaller hormone-activity question worth watching.",
    tier: "precautionary",
    healthBodyPosition: "The Cosmetic Ingredient Review panel has repeatedly reaffirmed it as safe at cosmetic-use levels, but a smaller body of laboratory research has examined possible estrogen-like activity — a plausible mechanism without the volume of evidence that would justify a stronger call either way.",
    gorillaPosition: "This is the 'we don't have enough to worry, but enough to keep an eye on' tier — the kind of ingredient where more research over the next decade will likely settle the question one way or the other.",
    sources: ["Cosmetic Ingredient Review — Safety Assessment of BHT", "PubMed — butylated hydroxytoluene endocrine activity studies"],
    matchers: [name("BHT"), name("Butylated hydroxytoluene")],
  },
  {
    id: "triclosan",
    concern: "Endocrine Disruptor",
    risk: "high",
    penalty: 20,
    note: "An antibacterial agent the FDA pulled from over-the-counter antiseptic hand and body washes in 2016, citing insufficient evidence it's safe for daily long-term use or that it actually works better than soap.",
    tier: "contested",
    healthBodyPosition: "The FDA's 2016 final rule found manufacturers hadn't shown triclosan washes were safe for daily long-term use or more effective than plain soap and water, while the EU's Scientific Committee on Consumer Safety permits it in cosmetics like toothpaste at restricted concentrations — different products, different rulings, same active ingredient.",
    gorillaPosition: "The US literally banned this from one entire category of products for not proving its own safety case — that's a strong enough signal that we'd rather see it absent from anything you use daily.",
    sources: ["FDA Final Rule — Safety and Effectiveness of Consumer Antiseptic Washes (2016)", "EU SCCS Opinion on Triclosan"],
    matchers: [name("Triclosan")],
  },
  {
    id: "oxybenzone",
    concern: "Endocrine Disruptor",
    risk: "medium",
    penalty: 15,
    note: "A common chemical UV filter in sunscreens and SPF-rated cosmetics — studied for systemic skin absorption and hormone-related effects, and banned in several jurisdictions over reef-toxicity concerns.",
    tier: "contested",
    healthBodyPosition: "The FDA's 2019 proposed sunscreen rule found there isn't yet enough absorption and safety data to classify oxybenzone as 'generally recognized as safe and effective,' while Hawaii and other jurisdictions have banned it outright over coral reef damage — the regulatory picture is actively unsettled rather than resolved.",
    gorillaPosition: "When the FDA's own proposed rule says 'we need more data before we can call this settled,' that's the agency itself telling you the question is open — a textbook 'contested' call.",
    sources: ["FDA Proposed Rule — Sunscreen Drug Products GRASE Determination (2019)", "Hawaii SB 2571 — Oxybenzone/Octinoxate Sunscreen Restriction (2018)", "PubMed — oxybenzone systemic absorption studies"],
    matchers: [name("Oxybenzone"), name("Benzophenone-3")],
  },
  {
    id: "retinyl-palmitate",
    concern: "Carcinogen Concern",
    risk: "medium",
    penalty: 14,
    note: "A vitamin A ester common in anti-aging and SPF formulas — a US National Toxicology Program study found it may speed the development of skin lesions and tumors in mice when exposed to UV light, a finding the FDA is still examining.",
    tier: "contested",
    healthBodyPosition: "A National Toxicology Program photocarcinogenicity study (funded in part by the FDA) found retinyl palmitate may accelerate UV-driven skin tumor development in mice; the FDA has acknowledged the study but says the evidence isn't yet conclusive enough to change its guidance on vitamin A in cosmetics.",
    gorillaPosition: "The agency that would ban it is the same one saying 'we're still looking into our own study's findings' — that's an open question, not a settled one, and it's worth knowing if you're applying it before sun exposure.",
    sources: ["National Toxicology Program — Photocarcinogenesis Study of Retinoic Acid and Retinyl Palmitate (2012)", "FDA — Statement on the Safety of Vitamin A Ingredients in Cosmetics"],
    matchers: [name("Retinyl palmitate")],
  },
  {
    id: "peg-compounds",
    concern: "Irritant",
    risk: "low",
    penalty: 8,
    note: "Polyethylene glycol compounds used as thickeners, emulsifiers, and penetration enhancers — generally low-risk on intact skin, but the manufacturing process can leave behind trace 1,4-dioxane.",
    tier: "precautionary",
    healthBodyPosition: "The Cosmetic Ingredient Review panel considers most PEG compounds safe as formulated, but flags the same ethoxylation-byproduct concern the FDA tracks for sulfates — plus a smaller, plausible concern that PEGs can help other ingredients penetrate compromised or broken skin more readily than they otherwise would.",
    gorillaPosition: "The compound itself is the least of the story here — it's what can hitch a ride with it (manufacturing residue, or other ingredients riding deeper into your skin) that's worth a second look.",
    sources: ["Cosmetic Ingredient Review — Safety Assessment of PEG Compounds", "FDA — 1,4-Dioxane in Cosmetic Products"],
    matchers: [name("PEG-100"), name("PEG-40"), name("PEG-20"), name("PEG-8"), name("Polyethylene glycol")],
  },
  {
    id: "artificial-fragrance",
    concern: "Allergen / Sensitizer",
    risk: "medium",
    penalty: 14,
    note: "'Fragrance' or 'parfum' is a trade-secret-protected catch-all that can legally bundle dozens of undisclosed chemicals — and is one of the most common triggers of cosmetic contact allergy and dermatitis.",
    tier: "strong-consensus",
    healthBodyPosition: "Dermatology research consistently identifies fragrance mixes as among the leading causes of cosmetic allergic contact dermatitis, and the EU Cosmetics Regulation now requires labeling of dozens of specific fragrance allergens above set concentration thresholds precisely because the consensus on the allergy risk is strong — even though the exact blend behind 'parfum' usually still isn't disclosed.",
    gorillaPosition: "This is the one entry on this list where the concern isn't really contested — dermatologists broadly agree fragrance blends are a top allergy trigger. The frustrating part is that 'fragrance' tells you almost nothing about what's actually inside.",
    sources: ["EU Cosmetics Regulation (EC) No 1223/2009 — Annex III, Fragrance Allergen Labeling", "American Contact Dermatitis Society — Fragrance Allergen Research", "PubMed — fragrance-induced contact dermatitis reviews"],
    matchers: [name("Parfum"), name("Fragrance"), name("Artificial fragrance"), name("Perfume")],
  },
];

export type BeautyScoreResult = {
  score: number;
  grade: Grade;
  detected: BeautyIngredientInfo[];
  flags: string[];
  positives: string[];
};

/**
 * Mirrors `scoreAdditives` but for cosmetics — starts at a perfect 100 and
 * deducts a penalty for each matched concern ingredient, sized to its real
 * risk level. First matching alias wins per entry, same as the food side.
 */
export function computeBeautyScore(ingredientsText: string | undefined | null): BeautyScoreResult {
  const text = ingredientsText ?? "";
  const detected: BeautyIngredientInfo[] = [];
  let score = 100;

  for (const entry of BEAUTY_INGREDIENTS) {
    const hit = entry.matchers.find((matcher) => matcher.pattern.test(text));
    if (!hit) continue;

    detected.push({
      id: entry.id,
      name: hit.label,
      concern: entry.concern,
      risk: entry.risk,
      note: entry.note,
      tier: entry.tier,
      healthBodyPosition: entry.healthBodyPosition,
      gorillaPosition: entry.gorillaPosition,
      sources: entry.sources,
    });
    score -= entry.penalty;
  }

  score = Math.max(0, Math.min(100, score));

  const flags: string[] = [];
  const positives: string[] = [];

  if (detected.length > 0) {
    const parabens = detected.filter((d) => d.concern === "Paraben");
    const endocrine = detected.filter((d) => d.concern === "Endocrine Disruptor");
    const irritants = detected.filter((d) => d.concern === "Irritant");
    const allergens = detected.filter((d) => d.concern === "Allergen / Sensitizer");
    const carcinogens = detected.filter((d) => d.concern === "Carcinogen Concern");

    if (carcinogens.length > 0) flags.push(`${carcinogens.length} carcinogen-concern ingredient${carcinogens.length > 1 ? "s" : ""} detected: ${carcinogens.map((d) => d.name).join(", ")}`);
    if (endocrine.length > 0) flags.push(`${endocrine.length} possible endocrine disruptor${endocrine.length > 1 ? "s" : ""} detected: ${endocrine.map((d) => d.name).join(", ")}`);
    if (parabens.length > 0) flags.push(`${parabens.length} paraben${parabens.length > 1 ? "s" : ""} detected: ${parabens.map((d) => d.name).join(", ")}`);
    if (allergens.length > 0) flags.push(`${allergens.length} allergen/sensitizer source${allergens.length > 1 ? "s" : ""} detected: ${allergens.map((d) => d.name).join(", ")}`);
    if (irritants.length > 0) flags.push(`${irritants.length} known irritant${irritants.length > 1 ? "s" : ""} detected: ${irritants.map((d) => d.name).join(", ")}`);
  } else {
    positives.push("No flagged irritants, allergens, endocrine disruptors, or parabens detected in the ingredients list");
  }

  return { score, grade: gradeFromScore(score), detected, flags, positives };
}
