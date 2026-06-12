export type RiskLevel = "high" | "medium" | "low";

/**
 * Evidence Tier — how settled the science actually is, independent of how
 * risky the substance is rated. A "high risk" item can still be CONTESTED
 * (regulators disagree) while a "low risk" item can be STRONG CONSENSUS
 * (everyone agrees it's fine). Tier answers "how sure are we?", not "how bad?"
 */
export type EvidenceTier =
  | "strong-consensus"
  | "emerging-evidence"
  | "contested"
  | "precautionary";

export type AdditiveInfo = {
  id: string;
  /** The common name (or E-code) actually found in the ingredients text. */
  name: string;
  risk: RiskLevel;
  /** Plain-English explanation of why this additive matters. */
  note: string;
  /** How settled the science is — STRONG CONSENSUS, EMERGING, CONTESTED, or PRECAUTIONARY. */
  tier: EvidenceTier;
  /** Where major health bodies (FDA, Health Canada, WHO, EFSA, JECFA, IARC) currently stand. */
  healthBodyPosition: string;
  /** The Gorilla Fuel position — what an informed athlete should actually think about this. */
  gorillaPosition: string;
  /** The databases, monographs, and studies that informed this assessment. */
  sources: string[];
};

type Matcher = { label: string; pattern: RegExp };

type AdditiveEntry = {
  id: string;
  risk: RiskLevel;
  /** Points deducted from the additive score when this entry is detected. */
  penalty: number;
  note: string;
  /** How settled the science is — STRONG CONSENSUS, EMERGING, CONTESTED, or PRECAUTIONARY. */
  tier: EvidenceTier;
  /** Where major health bodies (FDA, Health Canada, WHO, EFSA, JECFA, IARC) currently stand. */
  healthBodyPosition: string;
  /** The Gorilla Fuel position — what an informed athlete should actually think about this. */
  gorillaPosition: string;
  /** The databases, monographs, and studies that informed this assessment. */
  sources: string[];
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
    tier: "strong-consensus",
    healthBodyPosition: "The FDA, Health Canada, and WHO are aligned — the FDA revoked industrially produced trans fat's safe status in 2018 and the WHO has called for a global phase-out.",
    gorillaPosition: "This is one of the rare additive calls where the science isn't close — if you see 'partially hydrogenated' on a label, put it back.",
    sources: ["FDA Federal Register — Trans Fat GRAS Revocation (2018)", "WHO REPLACE Trans Fat Initiative", "Health Canada Trans Fat Monitoring Program"],
    matchers: [name("Partially hydrogenated vegetable oil"), name("Partially hydrogenated oil"), name("Hydrogenated vegetable oil"), name("Hydrogenated oil")],
  },
  {
    id: "potassium-bromate",
    risk: "high",
    penalty: 25,
    note: "Flour treatment agent classified as a possible human carcinogen — banned for food use across the EU, UK, and Canada.",
    tier: "strong-consensus",
    healthBodyPosition: "The EU, UK, Canada, Brazil, and over 30 other countries have independently banned it as a flour treatment agent, and the IARC lists it as a possible human carcinogen.",
    gorillaPosition: "When most of the developed world has separately reached the same conclusion, that's not fearmongering — that's consensus. Avoid it.",
    sources: ["IARC Monographs Programme — Potassium Bromate (Group 2B)", "Health Canada List of Permitted Food Additives", "UK Food Standards Agency"],
    matchers: [name("Potassium bromate")],
  },
  {
    id: "titanium-dioxide",
    risk: "high",
    penalty: 25,
    note: "Whitening agent banned as a food additive in the EU since 2022 over genotoxicity (DNA damage) concerns.",
    tier: "contested",
    healthBodyPosition: "EFSA concluded in 2021 it can no longer be considered safe and the EU banned it in 2022 over genotoxicity concerns, while the FDA, Health Canada, and the JECFA maintain it remains acceptable at current levels — a genuine split between major regulators.",
    gorillaPosition: "When Europe's food safety agency and US/Canadian regulators reach opposite conclusions on the same evidence, that disagreement is itself the story worth knowing.",
    sources: ["EFSA Panel on Food Additives — Re-evaluation of E171 (2021)", "FDA Titanium Dioxide Color Additive Status", "Health Canada Food Additive Database"],
    matchers: [name("Titanium dioxide"), ecode("E171")],
  },
  {
    id: "tbhq",
    risk: "high",
    penalty: 23,
    note: "Petroleum-derived preservative. Animal studies link high intakes to vision disturbances and immune effects.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA still classify it as safe within current limits, but both note that long-term, low-dose human exposure data remains thinner than for older preservatives.",
    gorillaPosition: "It's not banned — it's a 'watch this space' substance. The animal-study signals on immune and visual effects are early but real enough that you should know about them.",
    sources: ["FDA Code of Federal Regulations — TBHQ (21 CFR 172.185)", "EFSA ANS Panel Opinion on TBHQ", "PubMed — tert-butylhydroquinone toxicology studies"],
    matchers: [name("TBHQ"), name("tert-Butylhydroquinone"), name("tertiary butylhydroquinone"), ecode("E319")],
  },
  {
    id: "sodium-nitrite",
    risk: "high",
    penalty: 23,
    note: "Curing agent that can form nitrosamines in the body — compounds classified as probable carcinogens, especially with processed meats.",
    tier: "strong-consensus",
    healthBodyPosition: "The WHO's cancer research arm (IARC) classifies processed meat — where nitrites are the primary curing agent — as a Group 1 carcinogen, the same evidence-strength category as tobacco, even though regulators still permit nitrites at controlled levels because curing also prevents botulism.",
    gorillaPosition: "This is a real trade-off, not a scare story — nitrites stop a dangerous foodborne toxin, but they're also the mechanism IARC pointed to when it classified processed meat in its highest-evidence carcinogen category. Less cured meat in your regular rotation looks like the sensible read of that evidence, regardless of which curing salt is used.",
    sources: ["IARC Monographs Volume 114 — Red and Processed Meat (2015)", "WHO Q&A on the Carcinogenicity of Processed Meat", "Health Canada Nitrite/Nitrate Food Additive Assessment"],
    matchers: [name("Sodium nitrite"), ecode("E250")],
  },
  {
    id: "red-3",
    risk: "high",
    penalty: 23,
    note: "Synthetic dye (Erythrosine) shown to cause thyroid tumors in animal studies — the FDA moved to ban it from food in 2025.",
    tier: "strong-consensus",
    healthBodyPosition: "The FDA itself reversed decades of approval, banning the dye from food in January 2025 after acknowledging the same thyroid-tumor evidence in animal studies that had already led California to ban it in 2023.",
    gorillaPosition: "This is about as clear as additive evidence gets — the regulator that once defended it is now the one banning it. Treat it as a hard pass.",
    sources: ["FDA — Revocation of Authorization for Red No. 3 (2025)", "California Food Safety Act, AB 418 (2023)", "PubMed — erythrosine thyroid carcinogenicity studies"],
    matchers: [name("Red 3"), name("Erythrosine"), ecode("E127")],
  },
  {
    id: "potassium-nitrite",
    risk: "high",
    penalty: 23,
    note: "Curing agent closely related to sodium nitrite — linked to nitrosamine formation, a carcinogen precursor.",
    tier: "strong-consensus",
    healthBodyPosition: "Major health bodies group it with sodium nitrite under the same nitrosamine-formation concern documented in IARC's Group 1 classification of processed meat, while still permitting it at controlled curing levels for food-safety reasons.",
    gorillaPosition: "Same chemistry, same trade-off, same advice as sodium nitrite — minimize processed and cured meat as a category rather than chasing the specific curing salt.",
    sources: ["IARC Monographs Volume 114 — Red and Processed Meat (2015)", "Health Canada Nitrite/Nitrate Food Additive Assessment", "Codex Alimentarius — Curing Agent Standards"],
    matchers: [name("Potassium nitrite"), ecode("E249")],
  },
  {
    id: "sodium-nitrate",
    risk: "high",
    penalty: 22,
    note: "Preservative that converts to nitrite in the body, contributing to the same nitrosamine cancer-risk pathway.",
    tier: "strong-consensus",
    healthBodyPosition: "Regulators treat it as a precursor that converts to nitrite in the body, feeding the same nitrosamine pathway documented in IARC's processed-meat classification, and permit it under the same controlled-use logic.",
    gorillaPosition: "It becomes nitrite in your body, so the science and our advice are identical — the name on the label matters less than how often cured meat shows up on your plate.",
    sources: ["IARC Monographs Volume 114 — Red and Processed Meat (2015)", "EFSA ANS Panel — Re-evaluation of Nitrates (2017)", "Health Canada Nitrite/Nitrate Food Additive Assessment"],
    matchers: [name("Sodium nitrate"), ecode("E251")],
  },
  {
    id: "tartrazine",
    risk: "high",
    penalty: 22,
    note: "Synthetic azo dye named in the EU 'Southampton Six' study linking artificial colors to hyperactivity in children.",
    tier: "contested",
    healthBodyPosition: "The 2007 Southampton study (published in The Lancet) found a hyperactivity link strong enough that the EU now mandates a warning label on any food containing it, while the FDA maintains current evidence doesn't justify a US ban — a genuine transatlantic policy split on the same data.",
    gorillaPosition: "Two respected regulatory systems looked at the same study and reached different conclusions — that's the textbook definition of contested, and we'd rather flag it than pretend it's settled either way.",
    sources: ["McCann et al., The Lancet, Vol 370 (2007) — 'Food additives and hyperactive behaviour'", "EU Regulation (EC) No 1333/2008 — Annex V warning label requirement", "FDA Food Additive Status List"],
    matchers: [name("Tartrazine"), name("Yellow 5"), ecode("E102")],
  },
  {
    id: "sunset-yellow",
    risk: "high",
    penalty: 22,
    note: "Synthetic azo dye flagged alongside Tartrazine in the EU hyperactivity study — many UK brands have voluntarily phased it out.",
    tier: "contested",
    healthBodyPosition: "It's named alongside Tartrazine in the same Southampton hyperactivity study and carries the same EU warning-label mandate, while US regulators continue to list it as permitted — the identical jurisdictional split as its sister dye.",
    gorillaPosition: "Same study, same split, same advice: when a product leans on synthetic dyes for color, that already tells you something about how it's made.",
    sources: ["McCann et al., The Lancet, Vol 370 (2007)", "EU Regulation (EC) No 1333/2008 — Annex V", "UK Food Standards Agency — Voluntary Phase-Out Guidance"],
    matchers: [name("Sunset Yellow"), name("Yellow 6"), ecode("E110")],
  },
  {
    id: "allura-red",
    risk: "high",
    penalty: 22,
    note: "Synthetic dye under ongoing regulatory review for behavioral effects in children — requires a warning label in the EU.",
    tier: "contested",
    healthBodyPosition: "The EU requires the same Southampton-study warning label as its sister dyes, California has restricted it in school food, and the FDA has it under active re-review as of 2025 — regulators are visibly mid-debate rather than aligned.",
    gorillaPosition: "When a regulator is actively reconsidering its own approval, that's not a settled 'it's fine' — it's a live question, and you deserve to know it's being asked.",
    sources: ["McCann et al., The Lancet, Vol 370 (2007)", "California School Food Safety Act (2024)", "FDA Color Additive Petition Review — Red 40"],
    matchers: [name("Allura Red"), name("Red 40"), ecode("E129")],
  },
  {
    id: "carmoisine",
    risk: "high",
    penalty: 22,
    note: "Synthetic azo dye banned in the US, Japan, and several other countries over allergy and hyperactivity concerns.",
    tier: "contested",
    healthBodyPosition: "It's banned outright in the US, Japan, and several other countries, yet remains permitted in the EU and UK under the same Southampton-study warning label as its fellow azo dyes — a direct contradiction between major regulatory blocs over identical evidence.",
    gorillaPosition: "One country's ban is another country's 'permitted with a warning' — that split is the whole story, and we surface it so you're not relying on a label standard that changes depending on where you're standing.",
    sources: ["McCann et al., The Lancet, Vol 370 (2007)", "FDA Color Additive Status List (not authorized)", "EU Regulation (EC) No 1333/2008 — Annex V"],
    matchers: [name("Carmoisine"), ecode("E122")],
  },
  {
    id: "ponceau-4r",
    risk: "high",
    penalty: 22,
    note: "Azo dye linked to allergic reactions and hyperactivity — banned for food use in the US, Norway, and Canada.",
    tier: "contested",
    healthBodyPosition: "The US, Norway, and Canada have banned it for food use over allergy and hyperactivity findings, while the EU permits it with the standard Southampton warning label — the same jurisdictional disagreement running through this entire dye family.",
    gorillaPosition: "Three regulators say no, others say yes-with-a-warning — when the experts can't agree, the least we can do is make sure you know it's there.",
    sources: ["Health Canada List of Prohibited Food Additives", "McCann et al., The Lancet, Vol 370 (2007)", "EU Regulation (EC) No 1333/2008 — Annex V"],
    matchers: [name("Ponceau 4R"), ecode("E124")],
  },
  {
    id: "cyclamate",
    risk: "high",
    penalty: 21,
    note: "Artificial sweetener banned in the US since 1970 over bladder-cancer concerns raised in animal studies.",
    tier: "contested",
    healthBodyPosition: "The FDA banned it in 1970 over bladder-tumor findings in rats, but the WHO/FAO's JECFA, the EU, Health Canada, and over 50 other countries later concluded the rat-specific mechanism doesn't translate to humans and approved it — one of the starkest US-versus-rest-of-world splits on any sweetener.",
    gorillaPosition: "Fifty-plus countries reversed course on this one once more research came in — proof that regulatory positions are best-current-guesses, not permanent truths. We lay out both sides so you can weigh it yourself.",
    sources: ["FDA — Cyclamate Ban History (1970)", "JECFA — Evaluation of Cyclamic Acid and Its Salts", "Health Canada List of Permitted Sweeteners"],
    matchers: [name("Cyclamate"), ecode("E952")],
  },
  {
    id: "bha",
    risk: "high",
    penalty: 21,
    note: "Synthetic antioxidant listed by US health authorities as 'reasonably anticipated to be a human carcinogen.'",
    tier: "contested",
    healthBodyPosition: "The US National Toxicology Program lists it as 'reasonably anticipated to be a human carcinogen' based on animal studies, yet the FDA and EFSA both still permit it within current limits, citing a tumor mechanism they consider species-specific to rodents — regulators and toxicologists are genuinely split on how to weigh that evidence.",
    gorillaPosition: "A federal carcinogen listing sitting next to continued regulatory approval is exactly the kind of tension we think belongs in the open, not buried in a footnote.",
    sources: ["US National Toxicology Program — Report on Carcinogens (BHA)", "EFSA ANS Panel — Re-evaluation of BHA (2011)", "FDA Code of Federal Regulations — 21 CFR 172.110"],
    matchers: [name("BHA"), name("Butylated hydroxyanisole"), ecode("E320")],
  },
  {
    id: "bht",
    risk: "high",
    penalty: 21,
    note: "Synthetic antioxidant under ongoing review for hormone-disrupting effects and links to hyperactivity.",
    tier: "contested",
    healthBodyPosition: "The FDA and EFSA continue to classify it as safe at permitted levels, while an independent body of research into hormone-disrupting and behavioral effects keeps the question open enough that several brands have voluntarily reformulated around it.",
    gorillaPosition: "'Approved' and 'still being actively studied for hormone effects' can both be true at the same time — that's contested territory, and we'd rather hand you the nuance than a thumbs up or down.",
    sources: ["EFSA ANS Panel — Re-evaluation of BHT (2012)", "FDA Code of Federal Regulations — 21 CFR 172.115", "PubMed — butylated hydroxytoluene endocrine effect studies"],
    matchers: [name("BHT"), name("Butylated hydroxytoluene"), ecode("E321")],
  },
  {
    id: "propyl-gallate",
    risk: "high",
    penalty: 21,
    note: "Synthetic preservative that, in animal studies, has been linked to reproductive and endocrine effects at high doses.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA permit it at current levels and describe the human-relevant evidence as limited, while newer animal research into reproductive and endocrine effects at high doses is still being assessed rather than acted on.",
    gorillaPosition: "This is early-stage science doing its job — raising a question before there's a definitive answer. We'd rather tell you it's being asked than wait years for a verdict.",
    sources: ["EFSA ANS Panel — Opinion on Propyl Gallate (2014)", "FDA Code of Federal Regulations — 21 CFR 184.1660", "PubMed — propyl gallate reproductive toxicology studies"],
    matchers: [name("Propyl gallate"), ecode("E310")],
  },
  {
    id: "artificial-colors",
    risk: "high",
    penalty: 20,
    note: "Generic synthetic colorants — a category-wide flag tied to hyperactivity findings and consumer demand for removal.",
    tier: "contested",
    healthBodyPosition: "This catch-all sits in the same regulatory split running through the entire synthetic-dye family — the EU mandates hyperactivity warning labels under the Southampton study while the FDA maintains current evidence doesn't warrant a US ban, and consumer pressure has pushed many manufacturers to reformulate regardless of where regulators land.",
    gorillaPosition: "A generic 'artificial colors' listing usually just means the brand is using whichever synthetic dye is cheapest that week — the lack of specificity is its own flag, layered on top of the underlying dye debate.",
    sources: ["McCann et al., The Lancet, Vol 370 (2007)", "EU Regulation (EC) No 1333/2008 — Annex V", "FDA Food Additive Status List"],
    matchers: [name("Artificial colors"), name("Artificial colours"), name("Artificial color"), name("Artificial colour")],
  },
  {
    id: "blue-1",
    risk: "high",
    penalty: 20,
    note: "Synthetic dye (Brilliant Blue FCF) showing signs of crossing the blood-brain barrier in animal studies.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA both currently classify it as safe and it wasn't among the dyes flagged in the Southampton hyperactivity study, but newer animal research on its ability to cross the blood-brain barrier is recent enough that neither agency has directly weighed in yet.",
    gorillaPosition: "This is a newer line of inquiry, not an established concern — 'nobody's looked closely at this yet' is itself worth knowing, even though no verdict exists either way.",
    sources: ["FDA Color Additive Status List — FD&C Blue No. 1", "EFSA ANS Panel — Re-evaluation of Brilliant Blue FCF (2010)", "PubMed — Brilliant Blue FCF blood-brain barrier studies"],
    matchers: [name("Blue 1"), name("Brilliant Blue FCF"), ecode("E133")],
  },
  {
    id: "blue-2",
    risk: "high",
    penalty: 20,
    note: "Synthetic dye (Indigotine) associated with hypersensitivity reactions and under continued regulatory scrutiny.",
    tier: "emerging-evidence",
    healthBodyPosition: "Both the FDA and EFSA list it as permitted at current levels, and it has a noticeably smaller research footprint than the Southampton-study dyes — the hypersensitivity findings that exist are real but rest on a thinner evidence base than its more-studied siblings.",
    gorillaPosition: "Less-studied doesn't mean less-safe, but it doesn't mean more-safe either — it means 'we don't have as clear a picture,' and we'd rather say that plainly than guess.",
    sources: ["FDA Color Additive Status List — FD&C Blue No. 2", "EFSA ANS Panel — Re-evaluation of Indigotine (2014)", "PubMed — indigotine hypersensitivity studies"],
    matchers: [name("Blue 2"), name("Indigotine"), ecode("E132")],
  },
  {
    id: "green-3",
    risk: "high",
    penalty: 20,
    note: "Synthetic dye (Fast Green FCF) shown to cause tumors at the injection site in animal studies, though oral risk is debated.",
    tier: "precautionary",
    healthBodyPosition: "The FDA and EFSA both permit it at current levels and consider the injection-site tumors seen in older rodent studies not relevant to oral consumption in humans, and it's used so rarely today that almost no current research focuses on it.",
    gorillaPosition: "This one reads as 'rarely used and thinly studied' more than 'actively dangerous' — we flag it on the precautionary principle that an ingredient nobody's re-examined in decades deserves a second look, not a free pass.",
    sources: ["FDA Color Additive Status List — FD&C Green No. 3", "EFSA ANS Panel — Re-evaluation of Fast Green FCF (2009)"],
    matchers: [name("Green 3"), name("Fast Green"), ecode("E143")],
  },
  {
    id: "carrageenan",
    risk: "high",
    penalty: 20,
    note: "Seaweed-derived thickener repeatedly linked in lab studies to gut inflammation and digestive irritation.",
    tier: "contested",
    healthBodyPosition: "The WHO/FAO's JECFA, the FDA, and EFSA all classify food-grade carrageenan as safe at current levels, while a substantial body of laboratory and animal research — much of it from independent academic labs — keeps linking it to gut inflammation, leaving regulators and researchers in genuine, long-running disagreement.",
    gorillaPosition: "This is one of the longest-running food-safety debates we track — 'approved' on one side, 'inflammatory in lab models' on the other, neither side backing down. That tension is exactly what you should see before deciding how much you want in your diet.",
    sources: ["JECFA — Evaluation of Carrageenan, Codex Alimentarius", "FDA Code of Federal Regulations — 21 CFR 172.620", "PubMed — carrageenan intestinal inflammation studies"],
    matchers: [name("Carrageenan"), ecode("E407")],
  },
  {
    id: "brominated-vegetable-oil",
    risk: "high",
    penalty: 23,
    note: "Flame-retardant chemical used to keep citrus flavoring suspended in sodas — banned in the EU and Japan, and by the FDA in 2024 over thyroid and nervous-system harm.",
    tier: "strong-consensus",
    healthBodyPosition: "After decades of permitted use, the FDA formally revoked its approval in 2024 — joining the EU, UK, Japan, and India, which had already banned it — based on updated toxicology studies showing thyroid and nervous-system harm at levels once considered acceptable.",
    gorillaPosition: "This is a rare case of the regulator that defended an ingredient for fifty years doing a complete about-face based on new data — consensus catching up to evidence, exactly the kind of update we exist to surface.",
    sources: ["FDA — Revocation of BVO Authorization, Federal Register (2024)", "EU Regulation (EC) No 1333/2008 — Prohibited Substances", "PubMed — brominated vegetable oil thyroid toxicology studies"],
    matchers: [name("Brominated vegetable oil"), name("BVO")],
  },
  {
    id: "sodium-benzoate",
    risk: "high",
    penalty: 20,
    note: "Preservative that can react with vitamin C to form benzene, a known carcinogen, especially in soft drinks.",
    tier: "contested",
    healthBodyPosition: "The FDA's own testing confirmed it can react with vitamin C to form trace benzene (a known carcinogen) in some beverages, yet the FDA, EFSA, and Health Canada all maintain that the levels typically found sit well below any health-concern threshold — a position consumer-advocacy groups continue to dispute.",
    gorillaPosition: "The chemistry isn't in question — benzoate plus vitamin C can form benzene, full stop. Whether the trace amounts in a can of soda actually matter is the genuinely contested part, and that's a judgment call we think you should get to make yourself.",
    sources: ["FDA — Survey Data on Benzene in Soft Drinks (2006)", "EFSA ANS Panel — Re-evaluation of Sodium Benzoate (2016)", "PubMed — benzoate-ascorbic acid benzene formation studies"],
    matchers: [name("Sodium benzoate"), ecode("E211")],
  },
  {
    id: "potassium-benzoate",
    risk: "high",
    penalty: 20,
    note: "Close chemical relative of sodium benzoate, carrying the same benzene-formation risk when combined with vitamin C.",
    tier: "contested",
    healthBodyPosition: "It shares the identical benzene-formation chemistry with vitamin C documented for sodium benzoate, and carries the same split between regulator reassurance on trace-level safety and ongoing advocacy-group concern.",
    gorillaPosition: "Same molecule family, same chemistry, same open question — our advice doesn't change based on which benzoate salt happens to be on the label.",
    sources: ["FDA — Survey Data on Benzene in Soft Drinks (2006)", "EFSA ANS Panel — Re-evaluation of Potassium Benzoate (2016)", "PubMed — benzoate-ascorbic acid benzene formation studies"],
    matchers: [name("Potassium benzoate"), ecode("E212")],
  },
  {
    id: "acesulfame-k",
    risk: "high",
    penalty: 20,
    note: "Artificial sweetener that animal research has tentatively linked to glucose-tolerance and gut-microbiome disruption.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA, EFSA, and Health Canada all currently classify it as safe within acceptable daily intake limits, while a growing — but still relatively young — body of research into its effects on gut bacteria and glucose tolerance hasn't yet been large enough to shift any regulator's position.",
    gorillaPosition: "The early signals on artificial sweeteners and the gut microbiome are interesting enough to watch closely, but 'interesting early signal' and 'established harm' are different things — we won't dress this up as more settled than it is.",
    sources: ["FDA — Additional Information on Acesulfame Potassium", "EFSA ANS Panel — Re-evaluation of Acesulfame K (2016)", "PubMed — acesulfame potassium gut microbiome studies"],
    matchers: [name("Acesulfame potassium"), name("Acesulfame-K"), name("Acesulfame K"), name("Ace-K"), ecode("E950")],
  },
  {
    id: "saccharin",
    risk: "high",
    penalty: 20,
    note: "The oldest artificial sweetener — carried a cancer warning label for decades before being delisted, and remains controversial.",
    tier: "contested",
    healthBodyPosition: "It carried a mandatory cancer-warning label in the US for over two decades after rat studies showed bladder tumors, until the National Toxicology Program delisted it in 2000 after concluding the mechanism was rat-specific — a reversal critics still cite when questioning how regulators handle their own past findings.",
    gorillaPosition: "A substance that wore a federal cancer-warning label for twenty years and then had it removed is, almost by definition, contested history — worth knowing even after the label came off.",
    sources: ["US National Toxicology Program — Delisting of Saccharin (2000)", "FDA — Saccharin and Its Salts", "Health Canada Sweetener Safety Reviews"],
    matchers: [name("Saccharin"), ecode("E954")],
  },

  // ──────────────────────── MEDIUM RISK ────────────────────────
  {
    id: "aspartame",
    risk: "medium",
    penalty: 12,
    note: "Artificial sweetener classified by the WHO's cancer research arm (IARC) as 'possibly carcinogenic to humans' in 2023.",
    tier: "contested",
    healthBodyPosition: "In a widely reported split within the WHO itself, the IARC classified it as 'possibly carcinogenic to humans' (Group 2B) in July 2023, while the WHO/FAO's own JECFA panel reviewed the same evidence the same month and reaffirmed the existing acceptable daily intake — two arms of one organization reaching visibly different conclusions.",
    gorillaPosition: "When the World Health Organization can't fully agree with itself, 'just trust the experts' isn't a satisfying answer — so we tell you exactly where they stand, including the part where they don't agree.",
    sources: ["IARC Monographs Volume 134 — Aspartame (2023)", "JECFA 96th Meeting Summary — Aspartame Re-assessment (2023)", "WHO Q&A on Aspartame Safety (2023)"],
    matchers: [name("Aspartame"), ecode("E951")],
  },
  {
    id: "high-fructose-corn-syrup",
    risk: "medium",
    penalty: 12,
    note: "Concentrated liquid sweetener linked in research to higher rates of obesity, fatty liver, and metabolic syndrome.",
    tier: "strong-consensus",
    healthBodyPosition: "The WHO, the American Heart Association, and Health Canada are aligned that excess intake of concentrated added sugars — HFCS included — is strongly linked to obesity, fatty liver disease, and metabolic syndrome, even though the narrower question of whether HFCS is meaningfully worse than table sugar gram-for-gram remains a live research thread.",
    gorillaPosition: "Don't let the narrower 'is HFCS worse than sugar' debate distract from the much bigger and far more settled point — both are concentrated added sugar, and the consensus that too much of that is a problem is about as strong as nutrition science gets.",
    sources: ["WHO Guideline — Sugars Intake for Adults and Children (2015)", "American Heart Association — Added Sugars Statement", "PubMed — high-fructose corn syrup metabolic syndrome studies"],
    matchers: [name("High fructose corn syrup"), name("HFCS")],
  },
  {
    id: "sucralose",
    risk: "medium",
    penalty: 11,
    note: "Artificial sweetener that recent studies suggest may alter gut bacteria and blunt the body's insulin response.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA, EFSA, and Health Canada continue to list it as safe at approved intake levels, while a newer wave of research — including a widely cited 2023 study linking a sucralose breakdown product to DNA damage in lab models — is still working through the regulatory review pipeline.",
    gorillaPosition: "This sits exactly where 'newer research raises a real question, regulators haven't ruled yet' lives — not a verdict either way, just a live thread we're following so you don't have to dig for it.",
    sources: ["FDA — Sucralose Safety Determination", "EFSA ANS Panel — Re-evaluation of Sucralose (2016)", "PubMed — sucralose-6-acetate genotoxicity studies (2023)"],
    matchers: [name("Sucralose"), name("Splenda"), ecode("E955")],
  },
  {
    id: "caramel-color",
    risk: "medium",
    penalty: 11,
    note: "Some forms (Class III/IV) are made using ammonia compounds that generate 4-MEI, a byproduct California lists as a possible carcinogen.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA both maintain that permitted caramel color levels are safe, while California's Proposition 65 program lists 4-MEI — a byproduct that can form in Class III/IV ammonia-process caramel colors — as a substance known to the state to cause cancer, based on rodent studies that other regulators consider not yet conclusive for humans.",
    gorillaPosition: "One US state's right-to-know law is flagging something federal regulators haven't yet acted on — that gap is informative on its own, and exactly the kind of regional regulatory lead worth knowing about before it becomes consensus.",
    sources: ["California OEHHA — Proposition 65 Listing for 4-Methylimidazole", "FDA — Caramel Color Safety Assessment", "PubMed — 4-methylimidazole carcinogenicity studies"],
    matchers: [name("Caramel colour"), name("Caramel color"), { label: "E150", pattern: /\bE[\s-]?150[a-d]?\b/i }],
  },
  {
    id: "phosphoric-acid",
    risk: "high",
    penalty: 15,
    note: "Acidulant in colas and processed dressings — linked in studies to lower bone mineral density and tooth enamel erosion at regular high-intake levels.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA classify it as safe within typical dietary use, while a growing body of observational research linking regular cola consumption to lower bone mineral density continues to build — though researchers note it's hard to separate the acid's own effect from the fact that heavy soda drinkers often also drink less milk.",
    gorillaPosition: "The bone-density link in the data is real; whether it's the acid itself or just what soda displaces in your diet is still an open question. Either way, the practical takeaway is the same — cola shouldn't be a daily habit.",
    sources: ["EFSA ANS Panel — Re-evaluation of Phosphoric Acid (2019)", "PubMed — cola consumption and bone mineral density studies", "FDA Code of Federal Regulations — 21 CFR 184.1061"],
    matchers: [name("Phosphoric acid"), ecode("E338")],
  },
  {
    id: "sorbic-acid",
    risk: "medium",
    penalty: 8,
    note: "Preservative found in processed dressings, sauces, and dairy products — generally recognized as safe at permitted levels, but part of a broader preservative load in processed foods.",
    tier: "precautionary",
    healthBodyPosition: "The FDA and EFSA classify sorbic acid as safe within approved usage limits. It is one of the most widely studied food preservatives with a long history of regulatory approval.",
    gorillaPosition: "On its own, sorbic acid is not a major concern. We flag it because it's a signal of how processed a product is, and preservative load accumulates across a diet full of packaged foods.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 182.3089", "EFSA Opinion on the re-evaluation of sorbic acid (E200) (2015)"],
    matchers: [name("Sorbic acid"), ecode("E200")],
  },
  {
    id: "potassium-sorbate",
    risk: "medium",
    penalty: 8,
    note: "Salt form of sorbic acid — converts back to sorbic acid in food and exerts the same antimicrobial preservative effect. Very commonly used in salad dressings, wines, and dairy.",
    tier: "precautionary",
    healthBodyPosition: "Considered safe by the FDA and EFSA at current use levels. Like sorbic acid, it has been extensively reviewed without identified significant health concerns.",
    gorillaPosition: "Same context as sorbic acid — the concern is cumulative dietary preservative load across a day of eating packaged food, not this ingredient in isolation.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 182.3640", "EFSA Opinion on the re-evaluation of potassium sorbate (E202) (2015)"],
    matchers: [name("Potassium sorbate"), ecode("E202")],
  },
  {
    id: "annatto",
    risk: "low",
    penalty: 4,
    note: "Natural orange-red colouring derived from annatto seeds — widely used in cheddar cheese and other dairy. Generally safe but documented as a trigger for allergic reactions in sensitive individuals.",
    tier: "precautionary",
    healthBodyPosition: "The FDA and EFSA classify annatto (E160b) as safe at permitted levels. Case reports of allergic reactions — including urticaria and IBS-like symptoms in sensitised individuals — are the primary documented concern.",
    gorillaPosition: "For most people, annatto is a benign natural colour that is far preferable to synthetic alternatives. Worth knowing if you have a history of unexplained food-related skin or gut reactions.",
    sources: ["EFSA Panel on Additives — Re-evaluation of Annatto (E160b) (2020)", "FDA Code of Federal Regulations — 21 CFR 73.30", "Case report literature on annatto hypersensitivity (PubMed)"],
    matchers: [name("Annatto"), name("Roucou"), name("Bixin"), name("Norbixin"), ecode("E160b"), ecode("E160c"), { label: "Annatto", pattern: /\bannatto\b/i }],
  },
  {
    id: "calcium-chloride",
    risk: "low",
    penalty: 0,
    note: "Firming agent used in cheese-making and canned goods — considered GRAS by the FDA. Noted here for label transparency.",
    tier: "precautionary",
    healthBodyPosition: "Calcium chloride (E509) is Generally Recognized As Safe by the FDA and approved by the EFSA. At the concentrations used in food production there are no identified health concerns.",
    gorillaPosition: "Not a real health concern at food-additive levels. We include it in the detected-additives list purely for transparency — some consumers want to know every additive present, not just the concerning ones.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 184.1193", "EFSA Panel on Food Additives — Re-evaluation of Calcium Chloride (E509) (2019)"],
    matchers: [name("Calcium chloride"), ecode("E509")],
  },
  {
    id: "sodium-phosphates",
    risk: "medium",
    penalty: 10,
    note: "Inorganic phosphate salts used as emulsifiers and pH regulators — high cumulative dietary phosphate intake is linked in emerging research to kidney strain and disrupted calcium-phosphorus balance.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA classify sodium phosphate salts as safe at currently permitted levels. A growing body of nephrology research associates chronically elevated dietary phosphate with accelerated kidney function decline and cardiovascular risk — regulators have acknowledged the evidence but have not yet acted specifically on food additive phosphate exposure.",
    gorillaPosition: "The concern is cumulative — phosphates appear across dozens of processed foods simultaneously, so any single product contributes a fraction of the total dietary load. Worth knowing they're there, especially for anyone with kidney disease or elevated cardiovascular risk.",
    sources: ["EFSA ANS Panel — Re-evaluation of Phosphoric Acid and Phosphates (2019)", "FDA Code of Federal Regulations — 21 CFR 182.1778", "PubMed — dietary phosphate intake and chronic kidney disease"],
    matchers: [name("Sodium phosphates"), name("Sodium phosphate"), name("Disodium phosphate"), name("Trisodium phosphate"), name("Sodium hexametaphosphate"), name("Tetrasodium pyrophosphate"), ecode("E339"), ecode("E340"), ecode("E341")],
  },
  {
    id: "artificial-flavors",
    risk: "medium",
    penalty: 10,
    note: "A vague catch-all permitted to mask the exact synthetic flavor compounds used — the lack of specificity is the flag.",
    tier: "precautionary",
    healthBodyPosition: "Regulators including the FDA permit the 'artificial flavor' label to cover any of hundreds of individually approved compounds without naming them, and while each compound has typically passed its own safety review, no health body has studied — or could realistically study — every combination a brand might use under that umbrella term.",
    gorillaPosition: "Our concern isn't that any one flavor compound is dangerous — most have been individually reviewed. It's that the label is designed to prevent you from knowing what you're evaluating in the first place. Opacity is the risk here, not any specific molecule.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 101.22 (Flavor Labeling)", "EFSA Flavouring Substances Database", "Health Canada Food Flavouring Agent Regulations"],
    matchers: [name("Artificial flavours"), name("Artificial flavors"), name("Artificial flavoring"), name("Artificial flavour"), name("Artificial flavor")],
  },
  {
    id: "polysorbate-80",
    risk: "medium",
    penalty: 11,
    note: "Emulsifier that animal studies suggest may erode the gut's protective mucus layer and promote inflammation.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA list it as safe at permitted levels, while a relatively recent and frequently cited line of research — most notably a 2015 Nature study on dietary emulsifiers and gut bacteria — has raised questions about its effect on the gut's protective mucus layer that regulators have acknowledged but not yet acted on.",
    gorillaPosition: "This is a textbook 'science is ahead of regulation' moment — recent and provocative enough to mention, nowhere near settled enough to panic over.",
    sources: ["EFSA ANS Panel — Re-evaluation of Polysorbate 80 (2015)", "Chassaing et al., Nature, Vol 519 (2015) — 'Dietary emulsifiers impact the mouse gut microbiota'", "PubMed — polysorbate 80 intestinal barrier studies"],
    matchers: [name("Polysorbate 80"), ecode("E433")],
  },
  {
    id: "mono-and-diglycerides",
    risk: "medium",
    penalty: 8,
    note: "One of the most common emulsifiers in packaged baked goods and processed foods — part of a class now under active research for its effects on gut bacteria.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA classify it as safe at current use levels, while the same 2015 Nature research program that first raised emulsifier-and-gut-microbiome questions for carrageenan and polysorbate 80 has named emulsifiers as a class — including this one — as worth continued study.",
    gorillaPosition: "It's everywhere in packaged baked goods, and it's swept up in the same emerging emulsifier research as its more-discussed cousins — not a reason to panic about a slice of bread, but a reason to notice how often 'emulsifier' shows up across your week.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 184.1505", "EFSA Panel on Food Additives — Re-evaluation of Mono- and Diglycerides of Fatty Acids (2017)", "Chassaing et al., Nature, Vol 519 (2015) — 'Dietary emulsifiers impact the mouse gut microbiota'"],
    matchers: [name("Mono- and diglycerides"), name("Mono and diglycerides"), name("Monoglycerides and diglycerides"), ecode("E471")],
  },
  {
    id: "palm-oil",
    risk: "medium",
    penalty: 10,
    note: "High in saturated fat, and its production is a leading driver of deforestation — a health and sourcing double flag.",
    tier: "strong-consensus",
    healthBodyPosition: "The WHO and major cardiology bodies agree that diets high in saturated fat — palm oil included — raise LDL cholesterol and cardiovascular risk, and the WWF, UN Environment Programme, and major conservation groups are similarly aligned that conventional palm oil cultivation is a leading driver of tropical deforestation.",
    gorillaPosition: "This is a rare double-consensus flag — the health case and the environmental case both point the same direction, and neither is seriously disputed. RSPO-certified sustainable sourcing addresses half the concern; the saturated-fat math stays the same regardless.",
    sources: ["WHO — Saturated and Trans-Fatty Acid Intake Guideline (2018)", "WWF — Palm Oil Deforestation Reports", "Roundtable on Sustainable Palm Oil (RSPO) Certification Standards"],
    matchers: [name("Palm kernel oil"), name("Palm oil")],
  },
  {
    id: "corn-syrup",
    risk: "medium",
    penalty: 10,
    note: "Refined liquid sugar that spikes blood glucose quickly and adds calories with no nutritional value.",
    tier: "strong-consensus",
    healthBodyPosition: "Major health bodies — the WHO, Health Canada, and the American Heart Association among them — are aligned that any concentrated added sugar, corn syrup included, drives rapid blood-glucose spikes and excess-calorie intake when consumed regularly above recommended limits.",
    gorillaPosition: "This isn't a contested ingredient — it's plain added sugar by another name, and the consensus on minimizing added sugar is about as solid as nutrition science gets.",
    sources: ["WHO Guideline — Sugars Intake for Adults and Children (2015)", "American Heart Association — Added Sugars Statement", "Health Canada — Sugars and Your Health"],
    // Negative lookbehind so "high fructose corn syrup" is only ever counted as its own entry, not double-flagged here too.
    matchers: [{ label: "Corn syrup", pattern: /(?<!high[\s-]fructose[\s-])\bcorn[\s-]+syrup\b/i }],
  },
  {
    id: "modified-starch",
    risk: "medium",
    penalty: 10,
    note: "Chemically altered starch used as a cheap filler and texture aid — a marker of heavy processing.",
    tier: "precautionary",
    healthBodyPosition: "Regulators including the FDA and EFSA classify modified food starches as safe with no specific toxicological flags in the literature — the concern here is less a documented health mechanism and more what its presence typically signals about how reformulated a product is.",
    gorillaPosition: "We're not telling you modified starch is dangerous — the data doesn't support that. We're telling you it's a flare that tends to go up over heavily processed, low-cost-filler products, and that pattern is worth knowing.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 172.892", "EFSA ANS Panel — Modified Starches Group Opinion (2017)", "Codex Alimentarius — Modified Starch Standards"],
    matchers: [name("Modified food starch"), name("Modified corn starch"), name("Modified starch")],
  },
  {
    id: "carboxymethylcellulose",
    risk: "medium",
    penalty: 10,
    note: "Synthetic thickener (cellulose gum) that emerging research links to gut inflammation, similar to carrageenan.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA list it as safe at current levels, while the same 2015 Nature research that raised questions about polysorbate 80 also implicated CMC (cellulose gum) as an emulsifier that altered gut bacteria and promoted inflammation in mouse models — research regulators have noted but not yet translated into new guidance.",
    gorillaPosition: "It's part of the same emerging emulsifier story as polysorbate 80 — early mouse-model research that's interesting enough to flag and far from definitive enough to worry over.",
    sources: ["Chassaing et al., Nature, Vol 519 (2015)", "EFSA ANS Panel — Re-evaluation of Carboxymethyl Cellulose (2017)", "PubMed — carboxymethylcellulose gut microbiota studies"],
    matchers: [name("Carboxymethylcellulose"), name("Cellulose gum"), ecode("E466")],
  },
  {
    id: "xanthan-gum",
    risk: "medium",
    penalty: 10,
    note: "Generally well-tolerated thickener, but in high quantities it can cause bloating and digestive discomfort — worth watching where it's listed early in the ingredients.",
    tier: "precautionary",
    healthBodyPosition: "The FDA and EFSA classify it as safe with no toxicological concerns identified, and the digestive discomfort some people report at high intakes is documented mainly in case reports and small studies rather than the large trials that would elevate it to an established concern.",
    gorillaPosition: "This is about as benign as a 'flagged' additive gets on our list — mentioned mainly so people who already know they're sensitive to thickeners can spot it, not because the general population has much to worry about.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 172.695", "EFSA ANS Panel — Re-evaluation of Xanthan Gum (2017)"],
    matchers: [name("Xanthan gum"), ecode("E415")],
  },
  {
    id: "soy-lecithin",
    risk: "medium",
    penalty: 10,
    note: "Common emulsifier, usually well tolerated, but typically signals a heavily processed product and can trigger soy allergies.",
    tier: "precautionary",
    healthBodyPosition: "Regulators including the FDA and EFSA consider it safe and well-tolerated by the vast majority of people, with soy allergy — a known and labeled risk for a small subset of consumers — being the only well-documented caution attached to it.",
    gorillaPosition: "We flag this one for transparency and allergen-awareness more than health concern — if you're not soy-sensitive, it's genuinely one of the lowest-stakes items on this entire list.",
    sources: ["FDA — Food Allergen Labeling and Consumer Protection Act", "EFSA ANS Panel — Re-evaluation of Lecithins (2017)"],
    matchers: [name("Soy lecithin"), name("Soya lecithin"), ecode("E322")],
  },
  {
    id: "canola-oil",
    risk: "medium",
    penalty: 10,
    note: "Often heavily refined with chemical solvents — a marker of industrial processing even though the fat profile itself is moderate.",
    tier: "precautionary",
    healthBodyPosition: "Health bodies including Health Canada and the American Heart Association consider canola oil's fat profile favorable relative to many alternatives, and the chemical-solvent extraction used in conventional refining is permitted and considered safe — the concern here is about degree of processing, not a specific studied harm.",
    gorillaPosition: "We're not saying canola oil is bad for you — by the numbers its fat profile is actually decent. We flag it as a marker of industrial refining, useful context rather than a verdict on the oil itself.",
    sources: ["Health Canada — Canola Oil Nutrient Profile", "American Heart Association — Dietary Fats Guidance", "Canadian Grain Commission — Canola Processing Standards"],
    matchers: [name("Canola oil"), name("Rapeseed oil")],
  },
  {
    id: "vegetable-oil",
    risk: "medium",
    penalty: 10,
    note: "An unspecified blend — the vagueness itself is the flag, since it can mask less desirable oils swapped batch to batch.",
    tier: "precautionary",
    healthBodyPosition: "No health body specifically flags generic 'vegetable oil' — the concern is structural rather than toxicological: the label permits manufacturers to swap whichever oil is cheapest at production time without updating the ingredient list.",
    gorillaPosition: "This is a transparency flag, not a safety verdict — an unnamed oil could be perfectly fine, or could be one we'd flag separately if it were named. The vagueness is what we're calling out.",
    sources: ["FDA — Food Labeling Guide, Ingredient Declaration Requirements", "Codex Alimentarius — General Standard for Labelling of Prepackaged Foods"],
    // Lookbehind so "(partially) hydrogenated/brominated vegetable oil" is only counted under those entries, not double-flagged here too.
    matchers: [{ label: "Vegetable oil", pattern: /(?<!(?:partially[\s-]+)?(?:hydrogenated|brominated)[\s-]+)\bvegetable[\s-]+oil\b/i }],
  },
  {
    id: "natural-flavors",
    risk: "medium",
    penalty: 10,
    note: "A legally vague catch-all that can hide dozens of compounds behind two reassuring words on the label.",
    tier: "precautionary",
    healthBodyPosition: "The FDA's own definition of 'natural flavor' permits it to legally cover any of hundreds of compounds — including chemically processed ones — without naming them, and no health body treats the term itself as a safety signal in either direction.",
    gorillaPosition: "Same root issue as 'artificial flavors' — the label is a black box by design, not by accident. We're not telling you what's in there; we're telling you the label is built so nobody outside the company can tell you either.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 101.22 (Definition of Natural Flavor)", "Health Canada Food Flavouring Agent Regulations"],
    matchers: [name("Natural flavors"), name("Natural flavours"), name("Natural flavoring"), name("Natural flavour")],
  },
  {
    id: "yeast-extract",
    risk: "medium",
    penalty: 10,
    note: "A common way to add free glutamate (an MSG-like flavor booster) without listing MSG on the label.",
    tier: "precautionary",
    healthBodyPosition: "Regulators including the FDA and EFSA classify free glutamate — whether from MSG or yeast extract — as safe for the general population, and the lingering public concern traces back to research on 'MSG sensitivity' that itself remains scientifically contested rather than settled.",
    gorillaPosition: "If you're someone who reacts to MSG, yeast extract can deliver the same glutamate under a friendlier-sounding name — useful to know regardless of where you land on the broader MSG debate.",
    sources: ["FDA — Questions and Answers on Monosodium Glutamate", "EFSA ANS Panel — Glutamic Acid and Glutamates Re-evaluation (2017)", "PubMed — MSG symptom complex research"],
    matchers: [name("Yeast extract")],
  },
  {
    id: "autolyzed-yeast",
    risk: "medium",
    penalty: 10,
    note: "Functions like yeast extract — a glutamate-rich flavor enhancer that sidesteps the 'MSG' label consumers watch for.",
    tier: "precautionary",
    healthBodyPosition: "It's chemically and functionally the same free-glutamate source as yeast extract, carries the same general-population safety determination from the FDA and EFSA, and traces to the same contested 'MSG sensitivity' research thread.",
    gorillaPosition: "Different name, identical compound, identical advice — if MSG-style glutamate is something you personally watch for, add this one to your list too.",
    sources: ["FDA — Questions and Answers on Monosodium Glutamate", "EFSA ANS Panel — Glutamic Acid and Glutamates Re-evaluation (2017)"],
    matchers: [name("Autolyzed yeast"), name("Autolysed yeast")],
  },
  {
    id: "sulphur-dioxide",
    risk: "medium",
    penalty: 11,
    note: "Preservative that can trigger breathing difficulty and reactions in people with asthma or sulphite sensitivity.",
    tier: "strong-consensus",
    healthBodyPosition: "The FDA, EFSA, and Health Canada all mandate sulfite labeling because the evidence that it can trigger severe breathing reactions in people with asthma or sulfite sensitivity is strong and uncontested — 'high risk for a known subgroup' is settled science here, not speculation.",
    gorillaPosition: "If you're asthmatic or know you're sulfite-sensitive, the consensus isn't subtle — this is a 'know your own body and check the label' situation with real regulatory teeth behind it.",
    sources: ["FDA — Sulfites: An Important Food Safety Issue", "Health Canada — Sulphites in Food", "EFSA ANS Panel — Re-evaluation of Sulphur Dioxide and Sulphites (2016)"],
    matchers: [name("Sulphur dioxide"), name("Sulfur dioxide"), ecode("E220")],
  },

  {
    id: "modified-milk-ingredients",
    risk: "medium",
    penalty: 8,
    note: "Fractionated and recombined dairy components — often used to hit lower cost targets. Associated with ultra-processing (NOVA 4) and some research suggests higher intake is linked to increased insulin response vs. whole dairy.",
    tier: "emerging-evidence",
    healthBodyPosition: "Neither the FDA nor Health Canada has issued a specific safety concern, but several independent researchers and the NOVA classification system flag modified milk ingredients as a hallmark of ultra-processed food formulation.",
    gorillaPosition: "Not a headline danger, but a reliable signal that a product has been engineered rather than made — if you're seeing this, the product almost certainly has other issues too.",
    sources: ["Monteiro CA et al. — NOVA classification system (Public Health Nutr. 2018)", "Hall KD et al. — Ultra-Processed Diets Cause Excess Calorie Intake and Weight Gain (Cell Metabolism, 2019)", "Health Canada — Food Additive Listings"],
    matchers: [name("Modified milk ingredients"), name("Modified milk ingredient")],
  },

  // ───────────────────────── LOW RISK ──────────────────────────
  {
    id: "potassium-sorbate",
    risk: "low",
    penalty: 3,
    note: "Common preservative that prevents mold and yeast growth — among the most extensively studied and well-tolerated preservatives in use.",
    tier: "strong-consensus",
    healthBodyPosition: "The FDA, EFSA, and JECFA all classify it as safe at typical use levels, with decades of safety review and no significant concerns raised in recent re-evaluations.",
    gorillaPosition: "One of the more reassuring names on an ingredient list — it does a real job stopping mold, and the safety data backs it up.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 182.3640", "EFSA ANS Panel — Re-evaluation of Sorbic Acid and Potassium Sorbate (2015)", "JECFA — Evaluation of Sorbates"],
    matchers: [name("Potassium sorbate"), ecode("E202")],
  },
  {
    id: "disodium-ribonucleotides",
    risk: "low",
    penalty: 4,
    note: "Flavor enhancers often paired with MSG in savory snacks and instant foods — chemically related to compounds naturally present in meat, fish, and mushrooms.",
    tier: "strong-consensus",
    healthBodyPosition: "The FDA, EFSA, and JECFA all classify them as safe at typical use levels, noting they're structurally identical to nucleotides the body already produces and processes from ordinary food.",
    gorillaPosition: "These ride along with MSG in a lot of savory snacks and get the same 'sounds scary, isn't' treatment — your body breaks down the same molecules from a bowl of mushroom soup.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 172.530", "EFSA ANS Panel — Re-evaluation of Disodium 5'-Ribonucleotides (2017)", "JECFA — Evaluation of Flavor Enhancer Nucleotides"],
    matchers: [name("Disodium inosinate"), name("Disodium guanylate"), name("Disodium ribonucleotides"), ecode("E631"), ecode("E627")],
  },
  {
    id: "silicon-dioxide",
    risk: "low",
    penalty: 3,
    note: "Anti-caking agent that keeps powdered foods like spice blends and shredded cheese from clumping — chemically the same compound as sand and quartz.",
    tier: "strong-consensus",
    healthBodyPosition: "The FDA, EFSA, and JECFA all classify it as safe and essentially inert at the trace levels used as an anti-caking agent, with EFSA's most recent re-evaluation in 2018 finding no safety concerns at current exposure levels.",
    gorillaPosition: "About as benign as food-additive names get — it passes through the body without being absorbed, and it's there to do a boring, useful job.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 172.480", "EFSA ANS Panel — Re-evaluation of Silicon Dioxide (2018)", "JECFA — Evaluation of Anti-Caking Agents"],
    matchers: [name("Silicon dioxide"), name("Silica"), ecode("E551")],
  },
  {
    id: "msg",
    risk: "low",
    penalty: 4,
    note: "Flavor enhancer that major health bodies consider safe for most people — though a sensitive minority report headaches or flushing.",
    tier: "contested",
    healthBodyPosition: "The FDA, WHO, and EFSA all classify MSG as safe for the general population at typical intakes, yet a persistent line of self-reported-symptom research into 'MSG symptom complex' continues to produce mixed, contested results in controlled trials — one of the longest-running disputes between official safety determinations and lived public experience.",
    gorillaPosition: "Both things can be true at once: population-level data says it's safe, and a genuine subset of people reliably notice symptoms after eating it. That's not a contradiction worth dismissing on either side — it's just what 'contested' looks like in practice.",
    sources: ["FDA — Questions and Answers on Monosodium Glutamate", "WHO/FAO JECFA — Glutamic Acid Evaluation", "PubMed — monosodium glutamate symptom complex clinical trials"],
    matchers: [name("Monosodium glutamate"), name("MSG"), ecode("E621")],
  },
  {
    id: "maltodextrin",
    risk: "low",
    penalty: 4,
    note: "Highly processed starch-derived filler with a higher glycemic impact than table sugar, despite tasting barely sweet.",
    tier: "emerging-evidence",
    healthBodyPosition: "The FDA and EFSA classify it as safe and it's used broadly without restriction, while newer research into its surprisingly high glycemic impact — higher than table sugar gram-for-gram in some studies — and its effects on gut bacteria is recent enough that no regulator has reassessed it yet.",
    gorillaPosition: "The glycemic-impact finding is the part that surprises people — 'barely sweet' doesn't mean 'low impact,' and that gap between perception and lab result is exactly what this scanner is built to surface.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 184.1444", "PubMed — maltodextrin glycemic index and gut microbiome studies"],
    matchers: [name("Maltodextrin")],
  },
  {
    id: "cochineal",
    risk: "low",
    penalty: 4,
    note: "Natural insect-derived colorant (carmine) — safe for most, but a known allergen for a small number of people and a no-go for vegans.",
    tier: "strong-consensus",
    healthBodyPosition: "Major health bodies including the FDA, EFSA, and Health Canada agree it's safe for the general population, that it's a documented allergen for a small subset of people (the FDA specifically mandates it be named rather than hidden under 'color added'), and that it's of insect origin — none of which is in dispute.",
    gorillaPosition: "There's no real scientific debate here — the only question is personal: are you allergic, or does a bug-derived dye clash with how you eat? Both are valid reasons to care, and neither is about hidden risk.",
    sources: ["FDA — Carmine and Cochineal Extract Labeling Requirements (2009)", "EFSA ANS Panel — Re-evaluation of Cochineal/Carminic Acid (2015)", "Health Canada Food Allergen Labelling"],
    matchers: [name("Cochineal"), name("Carmine"), ecode("E120")],
  },
  {
    id: "soy-protein-isolate",
    risk: "low",
    penalty: 3,
    note: "Heavily processed protein source — generally fine nutritionally, but a marker of industrial refinement and a common allergen.",
    tier: "strong-consensus",
    healthBodyPosition: "Major health and nutrition bodies agree it's a well-studied, nutritionally complete protein source that's safe for the general population, with soy allergy — a known and labeled risk for a small subset of people — as the only well-documented caution attached to it.",
    gorillaPosition: "About as uncontroversial as protein sources get — we flag it mainly to note the degree of processing involved, not because the science raises any real alarm.",
    sources: ["FDA — Soy Protein and Heart Health Claim Review", "Health Canada Food Allergen Labelling (Soy)", "PubMed — soy protein isolate nutritional studies"],
    matchers: [name("Soy protein isolate"), name("Soya protein isolate")],
  },
  {
    id: "whey-protein-concentrate",
    risk: "low",
    penalty: 3,
    note: "Lower-purity protein form than isolate — perfectly safe, just worth knowing you're getting more lactose and fat alongside the protein.",
    tier: "strong-consensus",
    healthBodyPosition: "It's among the most extensively studied protein sources in sports nutrition, and major health bodies agree it's safe and effective — the only practical note is that, versus whey isolate, it carries more residual lactose and fat.",
    gorillaPosition: "No controversy to report — this is a 'know what you're buying' note, not a 'watch out' note. Lactose-sensitive? Look for isolate. Otherwise, concentrate is perfectly fine.",
    sources: ["PubMed — whey protein supplementation systematic reviews", "International Society of Sports Nutrition — Protein and Exercise Position Stand"],
    matchers: [name("Whey protein concentrate")],
  },
  {
    id: "carob-bean-gum",
    risk: "low",
    penalty: 3,
    note: "Plant-derived thickener with a strong safety record — about as benign as additives get.",
    tier: "strong-consensus",
    healthBodyPosition: "Regulators including the FDA, EFSA, and Health Canada all classify it as safe with an exceptionally long history of food use and no meaningful safety concerns raised in the literature.",
    gorillaPosition: "This sits at the very bottom of our risk list for a reason — one of the most thoroughly vetted, least controversial thickeners in the entire food system.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 184.1343", "EFSA ANS Panel — Re-evaluation of Carob Bean Gum (2017)"],
    matchers: [name("Carob bean gum"), name("Locust bean gum"), ecode("E410")],
  },
  {
    id: "guar-gum",
    risk: "low",
    penalty: 3,
    note: "Plant-derived thickener and fiber source — well tolerated by most people in the quantities typically used in food.",
    tier: "strong-consensus",
    healthBodyPosition: "The FDA, EFSA, and Health Canada all classify it as safe and well-tolerated at typical food-use levels, and it's additionally recognized as a fiber source with mild beneficial effects on blood sugar and cholesterol in some studies.",
    gorillaPosition: "Another one near the bottom of the list because the evidence is genuinely reassuring — if anything, this leans 'mildly beneficial' rather than 'something to watch.'",
    sources: ["FDA Code of Federal Regulations — 21 CFR 184.1339", "EFSA ANS Panel — Re-evaluation of Guar Gum (2017)", "PubMed — guar gum fiber metabolic effect studies"],
    matchers: [name("Guar gum"), ecode("E412")],
  },
  {
    id: "calcium-disodium-edta",
    risk: "low",
    penalty: 4,
    note: "Synthetic preservative that binds trace metals to keep flavor and color stable — well studied and considered safe at the tiny levels typically used.",
    tier: "strong-consensus",
    healthBodyPosition: "The FDA, EFSA, and JECFA all classify it as safe at the trace levels typically used to stabilize flavor and color, with a long track record of safety review and no significant concerns raised in recent re-evaluations.",
    gorillaPosition: "A 'does its job quietly and has the safety data to back it up' additive — not something we'd lose sleep over seeing on a label.",
    sources: ["FDA Code of Federal Regulations — 21 CFR 172.120", "EFSA ANS Panel — Re-evaluation of Calcium Disodium EDTA (2018)", "JECFA — Evaluation of EDTA Compounds"],
    matchers: [name("Calcium disodium EDTA"), name("EDTA"), ecode("E385")],
  },
];

export type Grade = "Excellent" | "Good" | "Poor" | "Bad";

export type Nutriments = {
  sugars_100g?: number;
  sugars_serving?: number;
  "saturated-fat_100g"?: number;
  "saturated-fat_serving"?: number;
  salt_100g?: number;
  salt_serving?: number;
  "energy-kcal_100g"?: number;
  "energy-kcal_serving"?: number;
  fiber_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  carbohydrates_serving?: number;
  alcohol_100g?: number;
};

/**
 * NOVA — the widely used food-processing classification (1 = unprocessed,
 * 4 = ultra-processed). We fold it into the nutrition score because the degree
 * of industrial processing is itself a health signal that raw nutrient numbers
 * can miss entirely.
 */
export type NovaGroup = 1 | 2 | 3 | 4;

const NOVA_LABEL: Record<NovaGroup, string> = {
  1: "Unprocessed or Minimally Processed",
  2: "Processed Culinary Ingredients",
  3: "Processed Foods",
  4: "Ultra-Processed Foods",
};

const NOVA_DESCRIPTION: Record<NovaGroup, string> = {
  1: "Foods in (or close to) their natural state — fresh, dried, frozen, or ground whole foods like fruit, vegetables, grains, eggs, and plain meat, with nothing added.",
  2: "Substances pressed, refined, or extracted from whole foods and used in home and restaurant kitchens to prepare meals — things like oils, butter, sugar, and salt.",
  3: "Whole or Group 2 foods combined and altered with processes like canning, smoking, or curing — think canned vegetables, fresh-baked bread, or cheese.",
  4: "Industrial formulations with little or no whole food left in them — typically built from cheap refined ingredients, additives, and substances rarely found in a home kitchen. A large and growing body of research links high ultra-processed intake to higher rates of obesity, heart disease, and early death.",
};

// Positive = penalty (deducted), negative = bonus (added).
// NOVA 4 ultra-processed: -55 caps nutrition at 45 before all other penalties.
// NOVA 3 processed: -20 for commercially processed foods (bread, granola bars, cheese).
// NOVA 1 unprocessed: +2 bonus rewards whole/minimally processed foods.
const NOVA_PENALTY: Record<NovaGroup, number> = { 1: -2, 2: 0, 3: 20, 4: 55 };

function asNovaGroup(value: number | undefined): NovaGroup | null {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return null;
}

export function novaGroupLabel(group: number): string | null {
  const g = asNovaGroup(group);
  return g === null ? null : NOVA_LABEL[g];
}

export function novaGroupDescription(group: number): string | null {
  const g = asNovaGroup(group);
  return g === null ? null : NOVA_DESCRIPTION[g];
}

/**
 * Extra context beyond the raw nutriment numbers — pulled straight from Open
 * Food Facts — that the score now factors in: serving size (for per-serving
 * flag context), NOVA processing group, the labels/categories tags we scan
 * for organic certification, and the product name for sweetener inference.
 */
export type ScoringContext = {
  servingSize?: string | null;
  novaGroup?: number | null;
  labelsTags?: string[] | null;
  categoriesTags?: string[] | null;
  /** Product name used only to infer artificial sweetener presence when ingredient text is absent. */
  productName?: string | null;
};

const ORGANIC_TAG_PATTERN = /organic|\bbio\b|biologique|ecologico|ekologisk/i;

function detectOrganicCertification(context?: ScoringContext): boolean {
  if (!context) return false;
  const tags = [...(context.labelsTags ?? []), ...(context.categoriesTags ?? [])];
  return tags.some((tag) => ORGANIC_TAG_PATTERN.test(tag));
}

export type ScoreResult = {
  finalScore: number;
  nutritionScore: number;
  additiveScore: number;
  /** Points (0–10) the organic dimension contributed to the final score. */
  organicBonus: number;
  organicCertified: boolean;
  novaGroup: NovaGroup | null;
  grade: Grade;
  flags: string[];
  positives: string[];
  detectedAdditives: AdditiveInfo[];
  /** How the final score was determined (curated/capped/algorithm) — set by the scoring gate. */
  scoreSource?: "gorilla-verified" | "brand-capped" | "ingredient-flagged" | "category-scored" | "algorithm";
  /** Human-readable reason when a cap reduced the score. */
  capReason?: string;
};

export function gradeFromScore(score: number): Grade {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Good";
  if (score >= 25) return "Poor";
  return "Bad";
}

/**
 * Builds the "Xg per 100g (Yg per <serving> serving)" suffix shoppers actually
 * need — the per-100g figure is how labels are regulated, but the per-serving
 * figure is what lands in their body in one sitting. Omitted when OFF doesn't
 * have serving-level data for this product.
 */
function servingContext(perServing: number | undefined, servingSize: string | null | undefined, unit: string, decimals: number): string {
  if (perServing === undefined || !servingSize) return "";
  return ` (${perServing.toFixed(decimals)}${unit} per ${servingSize} serving)`;
}

/**
 * Parse the gram value from a serving-size string like "28g", "355ml",
 * "1 oz (28g)". ml is treated as grams (1ml ≈ 1g for beverages — close
 * enough for penalty-band thresholds). Returns null when unparseable.
 */
function parseServingGrams(servingSize: string | null | undefined): number | null {
  if (!servingSize) return null;
  const ml = servingSize.match(/(\d+(?:\.\d+)?)\s*ml/i);
  if (ml) {
    const v = parseFloat(ml[1]);
    // >500ml almost certainly means a full-container field (e.g. 600ml jar stored as serving).
    // Discard it — fall back to per-100g bands which are always reliable.
    return v > 500 ? null : v;
  }
  const g = servingSize.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  if (g) {
    const v = parseFloat(g[1]);
    // >300g is a full-package weight, not a realistic single serving. Discard.
    // Sauces, condiments, and jarred goods commonly store the full container weight
    // as the serving size in OFF/UPC DB, which catastrophically inflates all per-serving
    // penalty calculations. The global fix: if it's over 300g, treat it as no serving data.
    return v > 300 ? null : v;
  }
  const oz = servingSize.match(/(\d+(?:\.\d+)?)\s*oz/i);
  if (oz) {
    const v = parseFloat(oz[1]) * 28.35;
    return v > 300 ? null : v;
  }
  return null;
}

export function scoreNutrition(
  n: Nutriments,
  context?: ScoringContext
): {
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
  const servingSize = context?.servingSize ?? null;

  // ── NOVA — applied first as the dominant processing signal ───────────────
  // NOVA 4 (ultra-processed) caps nutrition at 45 before other factors.
  // NOVA 1 (unprocessed whole foods) receives a small bonus.
  const nova = asNovaGroup(context?.novaGroup ?? undefined);
  if (nova !== null) {
    const penalty = NOVA_PENALTY[nova];
    score -= penalty; // negative penalty = bonus for NOVA 1
    if (penalty > 0) {
      flags.push(`NOVA Group ${nova} — ${NOVA_LABEL[nova]}: ${NOVA_DESCRIPTION[nova]}`);
    } else if (penalty < 0) {
      positives.push(`NOVA Group ${nova} — ${NOVA_LABEL[nova]}: minimal industrial processing`);
    } else {
      positives.push(`NOVA Group ${nova} — ${NOVA_LABEL[nova]}: minimal industrial processing detected`);
    }
  }

  // ── Serving-size-aware macro thresholds ──────────────────────────────────
  // When a serving size is known (from OFF's _serving fields or by parsing the
  // servingSize string), use per-serving bands — they better represent the sugar/
  // fat/sodium load a person actually absorbs in one sitting. Without serving data,
  // fall back to per-100g bands.
  const servingGrams = parseServingGrams(servingSize);
  const sugarServing  = n.sugars_serving         ?? (servingGrams != null ? sugar  * servingGrams / 100 : null);
  const satFatServing = n["saturated-fat_serving"] ?? (servingGrams != null ? satFat * servingGrams / 100 : null);
  const saltServing   = n.salt_serving            ?? (servingGrams != null ? salt   * servingGrams / 100 : null);
  const sodiumServingMg = saltServing != null ? (saltServing / 2.5) * 1000 : null;
  const hasServingData = sugarServing != null;

  if (hasServingData) {
    // Clean serving label — extract numeric+unit from the raw serving_size string
    // to avoid embedding malformed labels like "2 portions (30 ml)" in flag text.
    const isMlServing = /ml/i.test(servingSize ?? "");
    const servingTag = servingGrams != null
      ? `${Math.round(servingGrams)}${isMlServing ? "ml" : "g"} serving`
      : "serving";

    // ── Per-serving sugar ─────────────────────────────────────────────────
    const sg = sugarServing!;
    if (sg > 30) {
      score -= 40;
      flags.push(`Extreme sugar per serving — ${sg.toFixed(1)}g per ${servingTag}`);
    } else if (sg > 20) {
      score -= 25;
      flags.push(`Very high sugar per serving — ${sg.toFixed(1)}g per ${servingTag}`);
    } else if (sg > 12) {
      score -= 15;
      flags.push(`High sugar per serving — ${sg.toFixed(1)}g per ${servingTag}`);
    } else if (sg > 5) {
      score -= 10;
      flags.push(`Elevated sugar per serving — ${sg.toFixed(1)}g per ${servingTag}`);
    }

    // ── Per-serving saturated fat ─────────────────────────────────────────
    if (satFatServing != null) {
      const sf = satFatServing;
      if (sf > 10) {
        score -= 35;
        flags.push(`Extreme saturated fat per serving — ${sf.toFixed(1)}g per ${servingTag}`);
      } else if (sf >= 6) {
        score -= 22;
        flags.push(`Very high saturated fat per serving — ${sf.toFixed(1)}g per ${servingTag}`);
      } else if (sf > 4) {
        score -= 15;
        flags.push(`High saturated fat per serving — ${sf.toFixed(1)}g per ${servingTag}`);
      } else if (sf > 2) {
        score -= 8;
        flags.push(`Elevated saturated fat per serving — ${sf.toFixed(1)}g per ${servingTag}`);
      }
    }

    // ── Per-serving sodium ────────────────────────────────────────────────
    if (sodiumServingMg != null) {
      const na = sodiumServingMg;
      if (na > 1000) {
        score -= 28;
        flags.push(`Extreme sodium per serving — ${Math.round(na)}mg per ${servingTag}`);
      } else if (na > 600) {
        score -= 20;
        flags.push(`Very high sodium per serving — ${Math.round(na)}mg per ${servingTag}`);
      } else if (na > 400) {
        score -= 12;
        flags.push(`High sodium per serving — ${Math.round(na)}mg per ${servingTag}`);
      } else if (na > 200) {
        score -= 5;
        flags.push(`Elevated sodium per serving — ${Math.round(na)}mg per ${servingTag}`);
      }
    }

    // ── Concentration penalties (apply on top of serving thresholds) ──────
    // Condiments with tiny serving sizes (e.g., ketchup 15g) pass per-serving
    // thresholds cleanly, but their per-100g composition is still extreme.
    // These catch the concentrated-ingredient signal that serving math misses.
    if (sugar > 30) {
      score -= 15;
      flags.push(`Extremely sugar-dense product — ${sugar.toFixed(1)}g sugar per 100g`);
    } else if (sugar > 20) {
      score -= 10;
      flags.push(`Very sugar-dense product — ${sugar.toFixed(1)}g sugar per 100g`);
    }
    if (salt > 2) {
      score -= 10;
      flags.push(`Very high salt concentration — ${salt.toFixed(2)}g per 100g`);
    }
    if (satFat > 20) {
      score -= 20;
      flags.push(`Extreme saturated fat concentration — ${satFat.toFixed(1)}g per 100g`);
    } else if (satFat > 10) {
      score -= 12;
      flags.push(`Very high saturated fat concentration — ${satFat.toFixed(1)}g per 100g`);
    }

  } else {
    // ── Per-100g fallback (no serving data available) ─────────────────────
    if (sugar > 22.5) {
      score -= 30;
      flags.push(`Very high sugar — ${sugar.toFixed(1)}g per 100g`);
    } else if (sugar > 15) {
      score -= 20;
      flags.push(`High sugar — ${sugar.toFixed(1)}g per 100g`);
    } else if (sugar > 9) {
      score -= 10;
      flags.push(`Elevated sugar — ${sugar.toFixed(1)}g per 100g`);
    }

    if (satFat > 20) {
      score -= 50;
      flags.push(`Extreme saturated fat — ${satFat.toFixed(1)}g per 100g`);
    } else if (satFat > 15) {
      score -= 35;
      flags.push(`Very high saturated fat — ${satFat.toFixed(1)}g per 100g`);
    } else if (satFat > 10) {
      score -= 22;
      flags.push(`High saturated fat — ${satFat.toFixed(1)}g per 100g`);
    } else if (satFat > 5) {
      score -= 10;
      flags.push(`Elevated saturated fat — ${satFat.toFixed(1)}g per 100g`);
    }

    if (salt > 2) {
      score -= 30;
      flags.push(`Very high salt — ${salt.toFixed(2)}g per 100g`);
    } else if (salt > 1.2) {
      score -= 20;
      flags.push(`High salt — ${salt.toFixed(2)}g per 100g`);
    } else if (salt > 0.6) {
      score -= 10;
      flags.push(`Elevated salt — ${salt.toFixed(2)}g per 100g`);
    }
  }

  // ── Calorie density — always per 100g ────────────────────────────────────
  if (calories > 500) {
    score -= 20;
    flags.push(`Very calorie-dense — ${calories.toFixed(0)} kcal per 100g`);
  } else if (calories > 400) {
    score -= 10;
    flags.push(`Calorie-dense — ${calories.toFixed(0)} kcal per 100g`);
  }

  // ── Precautionary penalties for missing data in high-risk categories ──────
  const cats = (context?.categoriesTags ?? []).join(" ").toLowerCase();
  const noNova = context?.novaGroup == null;
  const isSnackCat = /\bchips\b|\bcrisps\b|\bcrackers\b|cheese[\s-]?snack|cheese[\s-]?puff|cheese[\s-]?stick|corn[\s-]?snack|pretzel|popcorn|\bcandy\b|candies|confectionery|cookies|biscuits|\bchocolate\b|salty[\s-]?snack|\bsnacks?\b/.test(cats);
  const isDairyCheeseCat = /cheese|dairy[\s-]snack/.test(cats);
  const isSaltyCat = /\bchips\b|\bcrisps\b|\bsnacks?\b|\bcrackers\b|pretzel|popcorn/.test(cats);

  if (noNova && isSnackCat) {
    score -= 10;
    score = Math.min(score, 45);
    flags.push("NOVA group missing — snack/confectionery category detected. Ultra-processed assumed, score capped at 45. Incomplete data makes scores go down, not stay high.");
  }
  if (n["saturated-fat_100g"] === undefined && isDairyCheeseCat) {
    score -= 8;
    flags.push("Saturated fat not disclosed for cheese/dairy snack — 8-point precautionary deduction.");
  }
  if (n.salt_100g === undefined && isSaltyCat) {
    score -= 8;
    flags.push("Sodium not disclosed for salty snack — 8-point precautionary deduction.");
  }

  // ── Positive signals ─────────────────────────────────────────────────────
  if (fiber > 2.5) {
    score += 5;
    positives.push(`Good fiber content — ${fiber.toFixed(1)}g per 100g`);
  }

  if (protein > 15) {
    score += 5;
    positives.push(`Strong protein content — ${protein.toFixed(1)}g per 100g`);
  }

  if (flags.length === 0) {
    positives.push("No major nutrition red flags detected");
  }

  // ── Hard cap: 2+ severe per-100g flags → nutrition score ≤ 55 ────────────
  // A product cannot claim nutritional credibility while simultaneously
  // triggering multiple severe macro flags. This prevents protein-bonus inflation
  // from rescuing high-satfat, high-sodium dairy products to "Good" territory.
  const severeCount = [
    satFat > 10,
    salt > 1.5,
    sugar > 20,
    calories > 400,
  ].filter(Boolean).length;
  if (severeCount >= 2) {
    score = Math.min(score, 55);
  }

  return { score: Math.max(0, Math.min(100, score)), flags, positives };
}

/** Standardised per-risk-tier additive deductions (replaces per-entry penalty fields). */
function additivePenalty(risk: RiskLevel): number {
  if (risk === "high") return 15;
  if (risk === "medium") return 8;
  return 4; // low
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

    detected.push({
      id: entry.id,
      name: hit.label,
      risk: entry.risk,
      note: entry.note,
      tier: entry.tier,
      healthBodyPosition: entry.healthBodyPosition,
      gorillaPosition: entry.gorillaPosition,
      sources: entry.sources,
    });
    // Entries with penalty: 0 are flagged for transparency but don't affect score.
    score -= entry.penalty === 0 ? 0 : additivePenalty(entry.risk);
  }

  return { score: Math.max(0, Math.min(100, score)), detected };
}

/**
 * Returns true when a product looks like a zero-calorie sweetened soft drink
 * but has no ingredient text — meaning our regex additive detection can't run
 * and the product would otherwise score a falsely clean 90/100.
 *
 * Zero calories + zero sugar + a beverage that plausibly tastes sweet = artificial
 * sweeteners are virtually certain. This function gates the inference so it only
 * fires for soft drinks/sodas, not for plain water or unflavored sparkling water.
 */
function isProbablyArtificialSweetened(
  nutriments: Nutriments,
  ingredientsText: string | undefined | null,
  context?: ScoringContext
): boolean {
  // Ingredient text available → normal additive detection handles it.
  if (ingredientsText && ingredientsText.trim().length >= 8) return false;

  // Sugar must be defined and near-zero. Calories don't need to be present —
  // if sugar is 0 on a named soda/diet drink, sweeteners are effectively certain.
  if (nutriments.sugars_100g === undefined) return false;
  if ((nutriments.sugars_100g ?? 0) > 0.5) return false;

  // If calories are defined they must be near-zero (allow up to 10 kcal to handle rounding).
  if (nutriments["energy-kcal_100g"] !== undefined && (nutriments["energy-kcal_100g"] ?? 0) > 10) return false;

  // Must look like a beverage type that would actually be sweetened (not plain water).
  const name = (context?.productName ?? "").toLowerCase();
  const cats = (context?.categoriesTags ?? []).join(" ").toLowerCase();
  const combined = `${name} ${cats}`;

  return /zero|diet(?!\s+(?:beer|cider|wine))|sugar[\s-]?free|no[\s-]sugar|artificially[\s-]sweetened|ginger[\s-]ale|tonic\b|en:sodas|en:soft-drinks|en:cola|en:carbonated-drink|en:energy-drink|en:diet|powerade|gatorade|crystal\s?light|kool[\s-]?aid/i.test(combined);
}

export function computeScore(
  nutriments: Nutriments,
  ingredientsText: string | undefined | null,
  context?: ScoringContext
): ScoreResult {
  const nutrition = scoreNutrition(nutriments, context);
  const additives = scoreAdditives(ingredientsText);

  const organicCertified = detectOrganicCertification(context);
  const organicBonus = organicCertified ? 10 : 0;

  // ── Zero-sugar beverage inference ──────────────────────────────────────────
  // When a soft drink has zero calories and zero sugar but no ingredient text,
  // it's scoring a falsely clean 90/100 because additive detection has nothing
  // to run on. Since zero-calorie sweetened drinks universally use artificial
  // sweeteners, apply a -40 nutrition penalty and cap the additive score at 50.
  // This brings the final score to ≈51 — accurately "Good/borderline" rather than
  // an inaccurate "Excellent." Only fires when no additives were otherwise detected.
  let effectiveNutritionScore = nutrition.score;
  let effectiveAdditiveScore = additives.score;
  let effectiveDetected = additives.detected;
  const inferredSweeteners =
    isProbablyArtificialSweetened(nutriments, ingredientsText, context) &&
    additives.detected.length === 0;

  // For snack-category products with no ingredient text, the additive score of 100
  // ("nothing detected = clean") overstates confidence — we simply don't know what's
  // in there. Cap at 60 so the final score reflects missing information.
  const catsStrCompute = (context?.categoriesTags ?? []).join(" ").toLowerCase();
  const isSnackNoIngredients =
    !ingredientsText &&
    !inferredSweeteners &&
    /\bsnacks?\b|chips|crisps|crackers|cheese[\s-]?snack|salty[\s-]?snack/.test(catsStrCompute);
  if (isSnackNoIngredients && effectiveAdditiveScore === 100) {
    effectiveAdditiveScore = 60;
  }

  // "No additives detected" ≠ "zero additives" for any processed food.
  // Only minimally processed whole foods (NOVA 1/2 or ≤3 short ingredients) can
  // score 100 on additives. Processed products with clean-looking ingredient scans
  // cap at 88 — there's almost always something we didn't catch or that wasn't listed.
  if (effectiveAdditiveScore === 100 && !inferredSweeteners) {
    const nova = asNovaGroup(context?.novaGroup ?? undefined);
    const ing = (ingredientsText ?? "").trim();
    const ingCount = ing ? ing.replace(/\([^)]*\)/g, "").split(",").filter((s) => s.trim()).length : 0;
    const isSimple = (nova === 1 || nova === 2) || (ingCount > 0 && ingCount <= 3);
    if (!isSimple) {
      effectiveAdditiveScore = 88;
    }
  }

  // ── Problem 8: missing nutrition data in inherently-junk categories ───────
  // When a product is in a category known for high sugar/fat/additives but has
  // no nutrition data at all, default to a LOW score not a falsely clean one.
  const isJunkCat = /\bchips\b|\bcrisps\b|\bsnacks?\b|\bcrackers\b|\bchocolate\b|\bcandy\b|candies|confectionery|ice[\s-]?cream|desserts?|cookies|biscuits|fast[\s-]?food|processed[\s-]?meat/.test(catsStrCompute);
  const hasNoNutritionData =
    nutriments.sugars_100g === undefined &&
    nutriments["saturated-fat_100g"] === undefined &&
    nutriments.salt_100g === undefined &&
    nutriments["energy-kcal_100g"] === undefined;
  if (isJunkCat && hasNoNutritionData && !inferredSweeteners) {
    effectiveNutritionScore = Math.min(effectiveNutritionScore, 35);
    effectiveAdditiveScore = Math.min(effectiveAdditiveScore, 60);
  }

  if (inferredSweeteners) {
    effectiveNutritionScore = Math.max(0, nutrition.score - 40);
    effectiveAdditiveScore = Math.min(50, additives.score);
    effectiveDetected = [
      {
        id: "artificial-sweeteners-inferred",
        name: "Artificial Sweeteners (Inferred)",
        risk: "medium" as const,
        tier: "contested" as const,
        note: "This product has zero sugar and zero calories but no ingredient list is available from Open Food Facts. Zero-calorie soft drinks universally rely on artificial sweeteners — the exact compound (aspartame, acesulfame-K, sucralose, etc.) can't be confirmed without the label, but its presence is effectively certain given the nutritional profile.",
        healthBodyPosition:
          "The FDA, EFSA, and Health Canada all classify approved artificial sweeteners as safe within acceptable daily intake levels. The WHO's 2023 non-sugar sweetener guideline recommends against long-term use for weight management due to insufficient evidence of benefit.",
        gorillaPosition:
          "Zero calories with perceivable sweetness requires a non-caloric sweetener — the physics leaves no other explanation. Without an ingredient list we can't name which one, but we flag the near-certain presence so you can decide whether to seek out the full label.",
        sources: [
          "WHO Guideline on Non-Sugar Sweeteners (2023)",
          "EFSA re-evaluations of approved sweeteners (various)",
          "Open Food Facts — ingredient data not yet submitted for this barcode",
        ],
      },
    ];
  }

  // 60% nutrition, 30% additives, 10% organic — the organic dimension is a pure
  // bonus (0 or +10), never a penalty, since its absence isn't itself a red flag.
  let finalScore = Math.round(effectiveNutritionScore * 0.6 + effectiveAdditiveScore * 0.3 + organicBonus);

  // Zero-sugar beverages with artificial sweeteners must not score above 55.
  // Without this cap, a clean-looking nutrition profile (100) + mild additive
  // penalties still produces ~80. The sweetener burden is real even when macros
  // look clean — the cap enforces the rule regardless of which sweetener was detected.
  const SWEETENER_IDS = new Set(["aspartame", "acesulfame-k", "sucralose", "saccharin", "cyclamate", "artificial-sweeteners-inferred"]);
  const hasSweetener = effectiveDetected.some((a) => SWEETENER_IDS.has(a.id));
  const isZeroSugarProduct = (nutriments.sugars_100g ?? 1) <= 0.5;
  if (hasSweetener && isZeroSugarProduct) {
    finalScore = Math.min(finalScore, 55);
  }

  const flags = [...nutrition.flags];
  const positives = [...nutrition.positives];

  if (inferredSweeteners) {
    flags.push("Artificial sweeteners almost certain — zero-sugar, zero-calorie beverage with no ingredient data available from Open Food Facts to verify");
  } else if (effectiveDetected.length > 0) {
    const highRisk = effectiveDetected.filter((a) => a.risk === "high");
    if (highRisk.length > 0) {
      flags.push(
        `${highRisk.length} high-risk additive${highRisk.length > 1 ? "s" : ""} detected: ${highRisk.map((a) => a.name).join(", ")}`
      );
    }
    const otherRisk = effectiveDetected.filter((a) => a.risk !== "high");
    if (otherRisk.length > 0) {
      flags.push(
        `${otherRisk.length} additional additive${otherRisk.length > 1 ? "s" : ""} flagged: ${otherRisk.map((a) => a.name).join(", ")}`
      );
    }
  } else {
    positives.push("No flagged additives detected in the ingredients list");
  }

  if (organicCertified) {
    positives.push("Certified organic — labels/categories carry organic certification, adding 10 points to the final score");
  }

  // ── Gluten detection — informational celiac-safety flags (no score impact) ──
  // Health Canada requires gluten sources (wheat, barley, rye, triticale, malt)
  // to be declared on Canadian labels. "Gluten removed" products cannot legally
  // be labelled gluten free in Canada and are not recommended for celiac disease.
  {
    const ing = (ingredientsText ?? "").toLowerCase();
    const labelStr = [...(context?.labelsTags ?? []), ...(context?.categoriesTags ?? [])]
      .join(" ")
      .toLowerCase();
    const glutenRemovedRe = /gluten[\s-]?removed|crafted to remove gluten|gluten[\s-]?reduced/;
    // "malt" with lookahead so maltodextrin/maltitol/maltose (gluten-free) don't
    // false-positive. "Enriched/all-purpose flour" on North American labels is
    // wheat flour even when the word "wheat" is omitted; durum/semolina/graham
    // are wheat by definition.
    const glutenGrainRe =
      /\b(barley|wheat|rye|triticale|spelt|kamut|durum|semolina|graham flour|(?:unbleached\s+)?enriched\s+flour|all[\s-]?purpose\s+flour|malt(?!odextrin|itol|ose|ic))\b/;
    const gfLabelRe = /gluten[\s-]?free|sans[\s-]?gluten|en:no-gluten/;

    if (glutenRemovedRe.test(ing) || glutenRemovedRe.test(labelStr)) {
      flags.push(
        "GLUTEN REMOVED — NOT certified gluten free: made from gluten grains then enzyme treated. Health Canada does not permit these products to be labelled gluten free. Not recommended for celiac disease."
      );
    } else if (glutenGrainRe.test(ing)) {
      flags.push(
        "Contains gluten — ingredients include wheat, barley, rye, triticale or malt. Not suitable for celiac disease or a gluten-free diet."
      );
    } else if (gfLabelRe.test(labelStr) || gfLabelRe.test(ing)) {
      positives.push(
        "Certified gluten free — product is labelled gluten free with no gluten-containing ingredients detected"
      );
    }

    // ── GF ingredient-quality flags ─────────────────────────────────────────
    // "Gluten free" says nothing about nutrition: a GF product built from
    // refined starches scores low, one built from whole-food flours scores well.
    const topIngredients = ing
      .replace(/\([^)]*\)/g, "") // drop parenthetical sub-ingredients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    const top3 = topIngredients.join(", ");
    const first = topIngredients[0] ?? "";

    const REFINED_STARCH_RE = /tapioca\s+(starch|flour)|potato\s+starch|corn\s*starch|white\s+rice\s+flour|^rice\s+flour|modified\s+(corn|tapioca|potato)\s+starch/;
    const WHOLE_FLOUR_RE = /almond\s+flour|chickpea\s+flour|garbanzo\s+bean\s+flour|buckwheat\s+flour|quinoa\s+flour|lentil\s+flour|cassava\s+flour|coconut\s+flour/;
    const isGfLabelled = gfLabelRe.test(labelStr) || gfLabelRe.test(ing);

    if (/tapioca\s+(starch|flour)/.test(top3)) {
      flags.push(
        "PRIMARY INGREDIENT IS TAPIOCA STARCH — refined carbohydrate with no nutritional value. This product will score low regardless of GF label."
      );
    }
    if (WHOLE_FLOUR_RE.test(first)) {
      positives.push(
        "WHOLE FOOD FLOUR BASE — this product uses nutritious whole food flour rather than refined starch."
      );
      if (isGfLabelled) {
        positives.push(
          "GENUINELY NUTRITIOUS GF OPTION — gluten free and built from whole food ingredients."
        );
      }
    } else if (isGfLabelled && REFINED_STARCH_RE.test(top3)) {
      flags.push(
        "GF HEALTH HALO — gluten free does not mean nutritious. This product is built primarily from refined starches."
      );
    }
  }

  // ── Universal junk food scoring caps ─────────────────────────────────────────
  // Applied last, after all other scoring, as categorical overrides.
  // These ensure credibility: a product's macro profile should never rescue it
  // from being in an inherently-junk category.
  {
    const capCats = (context?.categoriesTags ?? []).join(" ").toLowerCase();

    // Specific junk categories — deliberately excludes plain "snacks" to avoid
    // capping granola bars, protein bars, and cereal bars (those are scored normally).
    const JUNK_PATTERN =
      /\b(chips?|crisps?|savoury[\s-]snacks?|salty[\s-]snacks?|cheese[\s-]snacks?|cheese[\s-]puffs?|cheese[\s-]sticks?|party[\s-]mix|snack[\s-]mix|nachos?|tortilla[\s-]chips?|corn[\s-]chips?|flavou?red[\s-]crackers?|savoury[\s-]crackers?|candy|candies|confectionery|chocolate[\s-]bars?|chocolate[\s-]candies?|ice[\s-]cream|frozen[\s-]desserts?|cookies?|sweet[\s-]biscuits?|flavou?red[\s-]popcorn|instant[\s-]noodles?|fast[\s-]food|junk[\s-]food)\b/;

    const isJunkCap = JUNK_PATTERN.test(capCats);

    // Rule 4: Junk category + completely missing nutrition → max 35
    // (Reinforces the per-component cap applied earlier; ensures the final score lands low.)
    if (isJunkCap && hasNoNutritionData && finalScore > 35) {
      finalScore = 35;
      flags.push("Junk food category with no nutrition data — score capped at 35. Incomplete data on ultra-processed food always defaults low.");
    }

    // Rule 3: NOVA Group 4 (ultra-processed) → max 50, or 65 for simple products
    if (asNovaGroup(context?.novaGroup ?? undefined) === 4) {
      const ingText4 = (ingredientsText ?? "").toLowerCase();
      const ingStripped4 = ingText4.replace(/\([^)]*\)/g, "");
      const ingCount4 = ingStripped4.trim() ? ingStripped4.split(",").filter(s => s.trim()).length : 99;
      const hasArtificial4 = /artificial\s*colou?r|artificial\s*flavou?r|partially\s*hydrogenated|high\s*fructose\s*corn\s*syrup|glucose[\s-]?fructose|\bbha\b|\bbht\b|\btbhq\b/i.test(ingText4);
      const nova4Cap = (ingCount4 <= 5 && !hasArtificial4) ? 65 : 50;
      if (finalScore > nova4Cap) {
        finalScore = nova4Cap;
        flags.push(nova4Cap === 65
          ? "Ultra-processed (NOVA Group 4) — simple ingredient product, lenient cap applied (max 65)."
          : "Ultra-processed (NOVA Group 4) — score capped at 50 regardless of macros.");
      }
    }

    // Rule 1 & 2: Junk category cap with plain-snack exception
    // Use a tiered cap: cheese-puffs/sticks (most processed, artificial) are hardest-capped,
    // then general chips/savoury-snacks, then broader junk categories.
    const isHardJunk =
      /\b(cheese[\s-]puffs?|cheese[\s-]sticks?|cheese[\s-]snacks?|party[\s-]mix|snack[\s-]mix|flavou?red[\s-]popcorn|instant[\s-]noodles?|fast[\s-]food|junk[\s-]food)\b/.test(capCats);
    const isMediumJunk =
      /\b(chips?|crisps?|savoury[\s-]snacks?|salty[\s-]snacks?|nachos?|tortilla[\s-]chips?|corn[\s-]chips?|flavou?red[\s-]crackers?|savoury[\s-]crackers?)\b/.test(capCats);
    // hard cap: 25 / medium cap: 35 / standard cap: 45
    const categoryCap = isHardJunk ? 25 : isMediumJunk ? 35 : 45;

    if (isJunkCap && finalScore > categoryCap) {
      // Rule 2: Plain single-ingredient snack — ≤3 ingredients, no artificial colours or flavours
      const ingText = ingredientsText ?? "";
      // Strip parenthetical sub-lists (e.g. "oil (sunflower, canola)") before
      // counting ingredients to avoid false splits on commas inside parentheses.
      const ingStripped = ingText.replace(/\([^)]*\)/g, "");
      const ingredientCount = ingStripped.trim()
        ? ingStripped.split(",").filter((s) => s.trim().length > 0).length
        : 99;
      const hasArtificialColor =
        /artificial\s+colou?r|FD&C\s+|\bRed\s+\d+\b|\bYellow\s+\d+\b|\bBlue\s+\d+\b|tartrazine|allura\s+red|caramel\s+colou?r\s+(class\s+)?(III|IV)/i.test(ingText);
      const hasArtificialFlavor = /artificial\s+flavou?r/i.test(ingText);
      const isPlainSnack = ingredientCount <= 3 && !hasArtificialColor && !hasArtificialFlavor;

      if (isPlainSnack) {
        // Plain snack exception: allow up to 65 (e.g. plain Tostitos: corn, oil, salt)
        finalScore = Math.min(finalScore, 65);
        flags.push("Plain snack (≤3 ingredients, no artificial additives) — lenient junk-food cap applied (max 65).");
      } else {
        finalScore = categoryCap;
        flags.push(`Junk food category cap — maximum score ${categoryCap}. This product category is inherently ultra-processed; no nutrition profile rescues it above ${categoryCap}.`);
      }
    }
  }

  return {
    finalScore: Math.max(0, Math.min(100, finalScore)),
    nutritionScore: Math.round(effectiveNutritionScore),
    additiveScore: Math.round(effectiveAdditiveScore),
    organicBonus,
    organicCertified,
    novaGroup: asNovaGroup(context?.novaGroup ?? undefined),
    grade: gradeFromScore(finalScore),
    flags,
    positives,
    detectedAdditives: effectiveDetected,
  };
}

export const GRADE_COLORS: Record<Grade, string> = {
  Excellent: "#3ddc84",
  Good: "#ffd700",
  Poor: "#ff9d2e",
  Bad: "#ff4d4d",
};
