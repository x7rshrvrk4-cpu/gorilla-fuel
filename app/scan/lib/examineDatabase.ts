export type ResearchEvidenceLevel = "strong" | "moderate" | "limited" | "mixed";

export type ExamineIngredientInfo = {
  id: string;
  name: string;
  whatItDoes: string;
  evidenceLevel: ResearchEvidenceLevel;
  evidenceNote: string;
  doseRange: string;
  safetyNotes: string;
  source: string;
};

type Matcher = { label: string; pattern: RegExp };

type ExamineEntry = Omit<ExamineIngredientInfo, "name"> & { matchers: Matcher[] };

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function name(label: string): Matcher {
  const pattern = escapeRegExp(label).replace(/[\s-]+/g, "[\\s-]+");
  return { label, pattern: new RegExp(`\\b${pattern}\\b`, "i") };
}

/**
 * Hardcoded research summaries for the most commonly scanned supplement
 * ingredients, condensed from Examine.com's published, citation-backed
 * findings. No live API — this is a curated reference layer, refreshed
 * manually as the underlying research consensus shifts.
 */
const EXAMINE_INGREDIENTS: ExamineEntry[] = [
  {
    id: "creatine",
    whatItDoes: "Increases phosphocreatine stores in muscle, supporting short-burst strength, power output, and — per a smaller body of newer research — cognitive performance under fatigue or sleep deprivation.",
    evidenceLevel: "strong",
    evidenceNote: "One of the most-studied sports supplements in existence, with hundreds of trials showing consistent strength and power benefits.",
    doseRange: "3–5g per day of creatine monohydrate, taken consistently — no loading phase is required.",
    safetyNotes: "Well tolerated in healthy adults; mild water retention is common and expected. People with pre-existing kidney disease should talk to a doctor first.",
    source: "Examine.com — Creatine",
    matchers: [name("Creatine"), name("Creatine monohydrate"), name("Creatine HCl")],
  },
  {
    id: "whey-protein",
    whatItDoes: "A fast-digesting, complete dairy protein supplying all essential amino acids — supports muscle protein synthesis, especially when taken around training.",
    evidenceLevel: "strong",
    evidenceNote: "Extensively studied; consistently shown to support muscle growth and recovery when total daily protein is the limiting factor.",
    doseRange: "20–40g per serving, scaled to body size and your total daily protein target.",
    safetyNotes: "Generally safe; can cause bloating or digestive discomfort in people with lactose intolerance or a milk allergy — whey isolate or a plant-based protein may help.",
    source: "Examine.com — Whey Protein",
    matchers: [name("Whey protein"), name("Whey protein isolate"), name("Whey protein concentrate"), name("Whey")],
  },
  {
    id: "beta-alanine",
    whatItDoes: "Raises muscle carnosine levels, which helps buffer the acid build-up that causes fatigue during high-intensity efforts lasting roughly one to four minutes.",
    evidenceLevel: "moderate",
    evidenceNote: "Consistent benefits for short, intense, repeated efforts; less evidence of benefit for pure strength or endurance-only goals.",
    doseRange: "3.2–6.4g per day, ideally split into smaller doses to reduce tingling.",
    safetyNotes: "Causes a harmless skin-tingling sensation (paresthesia) at higher single doses — splitting the dose minimizes it. No other significant safety concerns at studied amounts.",
    source: "Examine.com — Beta-Alanine",
    matchers: [name("Beta-alanine"), name("Beta alanine")],
  },
  {
    id: "caffeine",
    whatItDoes: "A central nervous system stimulant that lowers perceived effort and fatigue, improving endurance, strength output, and alertness.",
    evidenceLevel: "strong",
    evidenceNote: "Among the most consistently effective performance aids studied, across endurance, strength, and cognitive measures.",
    doseRange: "Roughly 3–6mg per kg of bodyweight, taken about 30–60 minutes before activity.",
    safetyNotes: "Can cause jitteriness, a faster heart rate, and disrupted sleep; tolerance builds with regular use. Pregnant people and those with cardiovascular conditions should limit or avoid it.",
    source: "Examine.com — Caffeine",
    matchers: [name("Caffeine"), name("Caffeine anhydrous")],
  },
  {
    id: "bcaas",
    whatItDoes: "Branched-chain amino acids — leucine, isoleucine, and valine — that can stimulate muscle protein synthesis on their own, though less completely than a full protein source that supplies the rest of the amino acids too.",
    evidenceLevel: "limited",
    evidenceNote: "Studies generally show little extra benefit on top of an already-adequate total daily protein intake — the supplement mainly matters when overall protein is falling short.",
    doseRange: "5–10g, typically in roughly a 2:1:1 leucine-to-isoleucine-to-valine ratio.",
    safetyNotes: "Very well tolerated. Often largely redundant if your day-to-day diet already includes enough complete protein.",
    source: "Examine.com — BCAAs",
    matchers: [name("BCAA"), name("Branched-chain amino acids"), name("Branched chain amino acid")],
  },
  {
    id: "l-citrulline",
    whatItDoes: "Raises blood arginine and nitric oxide levels more effectively than supplementing arginine directly — which can improve blood flow and reduce exercise-related fatigue.",
    evidenceLevel: "moderate",
    evidenceNote: "A reasonably consistent body of trials shows modest endurance and reduced-soreness benefits, particularly for resistance training and longer cardio efforts.",
    doseRange: "About 6–8g of L-citrulline (or roughly 8g of citrulline malate), taken around 60 minutes before exercise.",
    safetyNotes: "Generally well tolerated; mild gastrointestinal discomfort is possible at higher doses.",
    source: "Examine.com — Citrulline",
    matchers: [name("L-citrulline"), name("Citrulline malate"), name("Citrulline")],
  },
  {
    id: "betaine",
    whatItDoes: "Also called trimethylglycine — studied for supporting power output and muscle endurance, possibly through cellular hydration and methylation pathways that aren't yet fully mapped out.",
    evidenceLevel: "limited",
    evidenceNote: "Early signals are positive but rest on a relatively small number of human trials — promising rather than settled.",
    doseRange: "Around 2.5g per day.",
    safetyNotes: "Well tolerated; some people notice a mild fishy body odor at higher intakes, a known and harmless trimethylamine effect.",
    source: "Examine.com — Betaine",
    matchers: [name("Betaine"), name("Trimethylglycine"), name("Betaine anhydrous")],
  },
  {
    id: "ashwagandha",
    whatItDoes: "An adaptogenic herb studied for lowering perceived stress and cortisol, with a smaller body of evidence pointing to modest improvements in strength, recovery, and sleep quality.",
    evidenceLevel: "moderate",
    evidenceNote: "A growing number of human trials show fairly consistent stress-related benefits; the performance evidence is encouraging but comes from fewer, smaller studies.",
    doseRange: "300–600mg per day of a standardized root extract (commonly KSM-66 or Sensoril).",
    safetyNotes: "Generally well tolerated short-term. Avoid during pregnancy, and use caution alongside thyroid medication or sedatives — it can amplify their effects.",
    source: "Examine.com — Ashwagandha",
    matchers: [name("Ashwagandha"), name("Withania somnifera")],
  },
  {
    id: "rhodiola",
    whatItDoes: "An adaptogenic herb studied for reducing fatigue and supporting mental performance, especially under acute stress.",
    evidenceLevel: "limited",
    evidenceNote: "Encouraging early results, but the human-trial base is small and several studies carry methodological limitations — more research would firm up the picture considerably.",
    doseRange: "200–600mg per day of a standardized extract (often 3% rosavins / 1% salidroside).",
    safetyNotes: "Generally well tolerated; can occasionally cause mild jitteriness or trouble sleeping if taken later in the day.",
    source: "Examine.com — Rhodiola Rosea",
    matchers: [name("Rhodiola"), name("Rhodiola rosea")],
  },
  {
    id: "magnesium",
    whatItDoes: "An essential mineral involved in hundreds of enzymatic processes, including muscle function, energy metabolism, nerve signaling, and sleep regulation.",
    evidenceLevel: "strong",
    evidenceNote: "Strong evidence for correcting deficiency-related symptoms; more moderate evidence for added performance, mood, or sleep benefits in people who aren't actually deficient.",
    doseRange: "Roughly 200–400mg per day of elemental magnesium — citrate and glycinate forms tend to absorb well and sit easier on the stomach.",
    safetyNotes: "High doses commonly cause loose stools or diarrhea. People with kidney disease should check with a doctor before supplementing.",
    source: "Examine.com — Magnesium",
    matchers: [name("Magnesium"), name("Magnesium citrate"), name("Magnesium glycinate"), name("Magnesium oxide")],
  },
  {
    id: "zinc",
    whatItDoes: "An essential trace mineral supporting immune function, protein synthesis, wound healing, and healthy testosterone metabolism — most impactful for people who are genuinely low.",
    evidenceLevel: "strong",
    evidenceNote: "Strong evidence for correcting deficiency and supporting immune function; limited evidence of added benefit for performance or hormones in people who already have adequate levels.",
    doseRange: "8–11mg per day covers the standard adult RDA; short-term therapeutic doses up to roughly 40mg are sometimes used under guidance.",
    safetyNotes: "Long-term high intakes can cause copper deficiency, nausea, and impaired immune function — stay under the tolerable upper intake level (about 40mg/day for adults) unless a doctor advises otherwise.",
    source: "Examine.com — Zinc",
    matchers: [name("Zinc"), name("Zinc gluconate"), name("Zinc picolinate"), name("Zinc citrate")],
  },
  {
    id: "vitamin-d",
    whatItDoes: "A fat-soluble vitamin essential for calcium absorption, bone health, and immune regulation — many people run low, especially with limited sun exposure.",
    evidenceLevel: "strong",
    evidenceNote: "Strong evidence for bone health and correcting deficiency; the evidence for broader claims (mood, general disease prevention) in people who aren't deficient is much more mixed.",
    doseRange: "Commonly 1,000–4,000 IU (25–100 mcg) per day — ideally guided by a blood test rather than guesswork.",
    safetyNotes: "Toxicity is rare but possible with very high, long-term doses (10,000+ IU/day), which can raise blood calcium to unsafe levels — periodic testing is wise on higher doses.",
    source: "Examine.com — Vitamin D",
    matchers: [name("Vitamin D"), name("Vitamin D3"), name("Cholecalciferol"), name("Vitamin D2"), name("Ergocalciferol")],
  },
  {
    id: "omega-3",
    whatItDoes: "Long-chain fatty acids (EPA and DHA, typically from fish oil) that support cardiovascular health, lower triglycerides, and may modestly aid recovery and joint comfort.",
    evidenceLevel: "strong",
    evidenceNote: "Strong evidence for lowering triglycerides; moderately strong, though less dramatic, evidence for broader cardiovascular and anti-inflammatory benefits.",
    doseRange: "1–2g per day of combined EPA+DHA for general health; some clinical contexts use higher doses (3–4g) under medical supervision.",
    safetyNotes: "Generally safe. High doses can mildly thin the blood — check with a doctor if you're on anticoagulant medication. Fishy aftertaste and burping are common minor complaints.",
    source: "Examine.com — Fish Oil",
    matchers: [name("Omega-3"), name("Omega 3"), name("Fish oil"), name("EPA/DHA"), name("Eicosapentaenoic acid"), name("Docosahexaenoic acid")],
  },
  {
    id: "collagen",
    whatItDoes: "A structural protein, usually supplemented as hydrolyzed peptides — studied mainly for skin elasticity/hydration and joint comfort, though it's an incomplete protein for building muscle.",
    evidenceLevel: "moderate",
    evidenceNote: "Reasonably consistent evidence for skin and joint-related outcomes; much weaker as a muscle-building protein source compared with complete proteins like whey.",
    doseRange: "Roughly 10–15g per day of hydrolyzed collagen peptides.",
    safetyNotes: "Very well tolerated; mild digestive upset is the most commonly reported issue.",
    source: "Examine.com — Collagen",
    matchers: [name("Collagen"), name("Collagen peptides"), name("Hydrolyzed collagen")],
  },
  {
    id: "glutamine",
    whatItDoes: "The most abundant amino acid in the body — often marketed for muscle recovery and gut health, though healthy people typically produce more than enough on their own.",
    evidenceLevel: "limited",
    evidenceNote: "The clearest clinical benefits show up in critically ill or trauma patients — the evidence for healthy, well-fed exercisers is thin.",
    doseRange: "Around 5g, once or twice daily, when used.",
    safetyNotes: "Very well tolerated at studied doses, with little evidence it meaningfully changes outcomes for healthy, well-nourished people.",
    source: "Examine.com — Glutamine",
    matchers: [name("Glutamine"), name("L-glutamine")],
  },
  {
    id: "taurine",
    whatItDoes: "An amino-sulfonic acid involved in cell hydration, electrolyte balance, and antioxidant processes — frequently paired with caffeine in energy drinks and pre-workouts.",
    evidenceLevel: "limited",
    evidenceNote: "Standalone performance evidence is thin, though it shows somewhat more consistent results in certain cardiovascular and exercise-capacity contexts when combined with other ingredients.",
    doseRange: "Roughly 1–3g per day on its own, or up to about 6g in studied energy-drink-style combinations.",
    safetyNotes: "Well tolerated at studied doses. It's typically consumed alongside caffeine, which carries its own separate considerations worth weighing.",
    source: "Examine.com — Taurine",
    matchers: [name("Taurine")],
  },
  {
    id: "hmb",
    whatItDoes: "Beta-hydroxy beta-methylbutyrate — a leucine metabolite studied for reducing muscle protein breakdown, with the clearest benefits in untrained people or those in a calorie deficit.",
    evidenceLevel: "mixed",
    evidenceNote: "Meaningful effects show up in novice or under-recovered populations, but well-trained, well-fed lifters tend to see little additional benefit on top of adequate protein and training.",
    doseRange: "About 3g per day, typically split into smaller doses.",
    safetyNotes: "Very well tolerated, with no significant safety concerns reported at studied doses.",
    source: "Examine.com — HMB",
    matchers: [name("HMB"), name("Beta-hydroxy beta-methylbutyrate"), name("Calcium HMB")],
  },
  {
    id: "curcumin",
    whatItDoes: "The active compound in turmeric — studied for anti-inflammatory and antioxidant effects, joint comfort, and exercise-recovery support.",
    evidenceLevel: "moderate",
    evidenceNote: "Reasonably consistent signals for inflammation and joint-comfort markers, tempered by curcumin's notoriously poor natural absorption — formulation matters a lot here.",
    doseRange: "500–1,000mg per day of a curcumin extract with enhanced absorption (e.g., paired with black pepper extract/piperine, or as a phytosome).",
    safetyNotes: "Generally well tolerated; high doses can cause stomach upset, and it may interact with blood-thinning medication.",
    source: "Examine.com — Curcumin",
    matchers: [name("Curcumin"), name("Turmeric"), name("Turmeric extract")],
  },
  {
    id: "probiotics",
    whatItDoes: "Live microorganisms studied for supporting gut-microbiome balance, digestion, and — for certain specific strains — immune and mood-related outcomes.",
    evidenceLevel: "mixed",
    evidenceNote: "Benefits are highly strain- and dose-specific — results from a well-studied strain don't generalize to every product simply labeled 'probiotic.'",
    doseRange: "Roughly 1–10 billion CFU per day of the specific studied strain — check the label for the exact strain, not just the word 'probiotic.'",
    safetyNotes: "Generally safe for healthy people. Those who are immunocompromised or critically ill should talk to a doctor before starting.",
    source: "Examine.com — Probiotics",
    matchers: [name("Probiotic"), name("Lactobacillus"), name("Bifidobacterium")],
  },
  {
    id: "melatonin",
    whatItDoes: "A hormone that signals the body's internal clock — supplementing can shorten the time it takes to fall asleep, which is especially useful for jet lag or shifted schedules.",
    evidenceLevel: "moderate",
    evidenceNote: "Moderately strong evidence for speeding up sleep onset and resetting circadian timing; weaker evidence that it meaningfully improves overall sleep quality or duration in people without a circadian-timing issue.",
    doseRange: "0.5–3mg, taken about 30–60 minutes before the desired bedtime — lower doses are often just as effective as higher ones.",
    safetyNotes: "Generally safe short-term; higher doses can cause next-morning grogginess, and the long-term effects of regular nightly use are still under-studied.",
    source: "Examine.com — Melatonin",
    matchers: [name("Melatonin")],
  },
];

/** Scans ingredient text for any of the 20 tracked supplement ingredients. First matching alias wins per entry, mirroring the additive/beauty detectors. */
export function detectExamineIngredients(ingredientsText: string | undefined | null): ExamineIngredientInfo[] {
  const text = ingredientsText ?? "";
  if (!text) return [];

  const detected: ExamineIngredientInfo[] = [];

  for (const entry of EXAMINE_INGREDIENTS) {
    const hit = entry.matchers.find((matcher) => matcher.pattern.test(text));
    if (!hit) continue;

    detected.push({
      id: entry.id,
      name: hit.label,
      whatItDoes: entry.whatItDoes,
      evidenceLevel: entry.evidenceLevel,
      evidenceNote: entry.evidenceNote,
      doseRange: entry.doseRange,
      safetyNotes: entry.safetyNotes,
      source: entry.source,
    });
  }

  return detected;
}
