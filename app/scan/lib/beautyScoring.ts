import { gradeFromScore, type EvidenceTier, type Grade, type RiskLevel } from "./scoring";

export type BeautyConcern = "Paraben" | "Endocrine Disruptor" | "Irritant" | "Allergen / Sensitizer" | "Carcinogen Concern" | "Contested Systemic" | "Reproductive Toxicity";

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
    // Ethoxylated-surfactant class (the 1,4-dioxane-carrier concern applies to the
    // whole class). SPECIFIC patterns only — each requires the full stem plus a
    // numeric suffix, so unrelated "-eth-" words (ethyl, ether, methyl,
    // Ethylhexylglycerin, Ethylhexyl methoxycinnamate) never match.
    matchers: [
      { label: "PEG-n", pattern: /\bPEG-\d+\b/i },
      { label: "PPG-n", pattern: /\bPPG-\d+\b/i },
      { label: "Steareth-n", pattern: /\bsteareth-\d+\b/i },
      { label: "Laureth-n", pattern: /\blaureth-\d+\b/i },
      { label: "Ceteareth-n", pattern: /\bceteareth-\d+\b/i },
      { label: "Oleth-n", pattern: /\boleth-\d+\b/i },
      name("Polyethylene glycol"),
    ],
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

  // ── SUNSCREEN — chemical UV filters (oxybenzone is above at -15) ─────────────
  {
    id: "octinoxate",
    concern: "Endocrine Disruptor",
    risk: "medium",
    penalty: 15,
    note: "A very common chemical UV-B filter (ethylhexyl/octyl methoxycinnamate) — one of the two filters singled out in reef-protection bans alongside oxybenzone, and restricted in the EU over hormone-activity concerns.",
    tier: "contested",
    healthBodyPosition: "Hawaii, Key West and Palau banned it from sunscreens alongside oxybenzone over coral-reef toxicity; the EU's Scientific Committee on Consumer Safety has assessed its endocrine activity and restricts its use, while the FDA's 2019 proposed rule left it (like most chemical filters) as 'not yet shown GRASE' pending more absorption and safety data — an actively unsettled picture rather than a clean bill.",
    gorillaPosition: "This is the closest sibling to oxybenzone on this list — same reef bans, same 'regulators want more data' status. If you're choosing a sunscreen and want to sidestep the contested chemical filters, a mineral (zinc oxide / titanium dioxide) formula avoids both.",
    sources: ["EU SCCS Opinion on Octyl Methoxycinnamate (Ethylhexyl Methoxycinnamate)", "Hawaii SB 2571 — Oxybenzone/Octinoxate Sunscreen Restriction (2018)", "FDA Proposed Rule — Sunscreen Drug Products GRASE Determination (2019)"],
    matchers: [name("Octinoxate"), name("Ethylhexyl methoxycinnamate"), name("Octyl methoxycinnamate"), name("Methoxycinnamate")],
  },
  {
    id: "homosalate",
    concern: "Endocrine Disruptor",
    risk: "medium",
    penalty: 10,
    note: "A chemical UV-B filter the EU specifically cut the allowed concentration on — from typical use levels down to 7.34% in face products — after a hormone-disruption review.",
    tier: "contested",
    healthBodyPosition: "The EU's Scientific Committee on Consumer Safety (2021) concluded homosalate was not safe at prior use levels and restricted its maximum concentration in leave-on face products over endocrine-disruption concern; the FDA has it in the same 'more data needed' bucket as the other chemical filters. A concrete regulatory action, not just a theoretical worry.",
    gorillaPosition: "When Europe reduces the legal limit of an ingredient specifically over hormone concerns, that's a real signal worth knowing — moderate rather than severe, because it's a concentration restriction, not an outright ban.",
    sources: ["EU SCCS Opinion on Homosalate (SCCS/1638/21)", "FDA Proposed Rule — Sunscreen Drug Products GRASE Determination (2019)"],
    matchers: [name("Homosalate")],
  },
  {
    id: "octocrylene",
    concern: "Endocrine Disruptor",
    risk: "low",
    penalty: 8,
    note: "A widely used chemical UV filter and stabiliser — the emerging concern is that it can slowly degrade into benzophenone, a compound with its own safety questions, as the product ages.",
    tier: "emerging-evidence",
    healthBodyPosition: "The EU permits octocrylene and its SCCS re-review (2021) found it safe as used, but flagged the benzophenone-degradation pathway; a 2021 peer-reviewed study (Downs et al.) reported measurable benzophenone accumulation in aged octocrylene sunscreens. This is a newer, still-developing research thread rather than a settled regulatory finding.",
    gorillaPosition: "The concern here isn't the ingredient as-sold but what it can turn into over time — an emerging finding, which is why we deduct lightly rather than heavily. Worth knowing on a sunscreen that's been in your bag for a couple of summers.",
    sources: ["EU SCCS Opinion on Octocrylene (SCCS/1627/21)", "Downs et al. — Benzophenone accumulation in octocrylene sunscreens, Chemical Research in Toxicology (2021)"],
    matchers: [name("Octocrylene")],
  },

  // ── DEODORANT / ANTIPERSPIRANT — aluminium actives ──────────────────────────
  {
    id: "aluminium-antiperspirant",
    concern: "Contested Systemic",
    risk: "medium",
    penalty: 11,
    note: "The active in antiperspirants — aluminium salts plug sweat ducts to stop wetness. It's the ingredient consumers most often ask about, though the widely-feared cancer/Alzheimer's links are NOT established.",
    tier: "contested",
    healthBodyPosition: "Aluminium antiperspirant salts are FDA-regulated OTC drug actives. The American Cancer Society, Health Canada, the FDA and the Alzheimer's Association all state that a causal link between antiperspirant aluminium and breast cancer or Alzheimer's is NOT established by the evidence, and the EU's Scientific Committee on Consumer Safety (2020) concluded aluminium in antiperspirants is safe at typical exposure. What remains is an unresolved research thread on dermal absorption — enough for transparency, not for alarm.",
    gorillaPosition: "We surface this because it's the single ingredient people most want to know is present, and there's a genuine (if unproven) absorption question — NOT because harm is demonstrated. If you prefer to avoid it, that's a personal-preference call; an aluminium-free deodorant simply won't carry this flag. We deliberately don't score it as if the cancer link were real.",
    sources: ["EU SCCS Opinion on the safety of aluminium in cosmetic products (SCCS/1613/19)", "American Cancer Society — Antiperspirants and Breast Cancer Risk", "Health Canada — Aluminium in antiperspirants safety assessment"],
    matchers: [
      name("Aluminum chlorohydrate"), name("Aluminium chlorohydrate"),
      name("Aluminum zirconium tetrachlorohydrex gly"), name("Aluminium zirconium tetrachlorohydrex gly"),
      name("Aluminum zirconium"), name("Aluminium zirconium"),
      name("Aluminum sesquichlorohydrate"), name("Aluminium sesquichlorohydrate"),
      name("Aluminum chlorohydrex"), name("Aluminium chlorohydrex"),
      name("Aluminum chloride"), name("Aluminium chloride"),
    ],
  },

  // ── MAKEUP — talc contamination + carbon-black colorant ─────────────────────
  {
    id: "talc",
    concern: "Carcinogen Concern",
    risk: "medium",
    penalty: 12,
    note: "A mineral bulking/absorbing agent in powders, foundations and eyeshadows. Talc itself isn't the issue — the concern is potential asbestos contamination, since the two minerals form together and asbestos is a known carcinogen.",
    tier: "contested",
    healthBodyPosition: "IARC classifies perineal (genital) use of talc-based body powder as 'possibly carcinogenic to humans' (Group 2B), and the concern that drove the J&J litigation and FDA testing is asbestos contamination of mined talc (asbestos is IARC Group 1). Cosmetic-grade talc is required to be asbestos-free, but FDA testing has intermittently found asbestos in marketed products, so the contamination risk isn't fully closed.",
    gorillaPosition: "This is a contamination-transparency flag, not a claim that talc is inherently toxic — the real question is whether a given batch is verified asbestos-free, which a label can't tell you. Talc-free alternatives (cornstarch, mica-based) sidestep the question entirely.",
    sources: ["IARC Monographs Volume 93 — Carbon Black, Titanium Dioxide, and Talc", "FDA — Talc and Cosmetics (asbestos testing program)"],
    matchers: [name("Talc"), name("Talcum")],
  },
  {
    id: "carbon-black",
    concern: "Carcinogen Concern",
    risk: "low",
    penalty: 8,
    note: "A deep-black pigment used in mascara, eyeliner and some eyeshadows (also listed as D&C Black No. 2 or CI 77266).",
    tier: "contested",
    healthBodyPosition: "IARC classifies carbon black as 'possibly carcinogenic to humans' (Group 2B) — but that classification is based on INHALATION in occupational settings, not dermal cosmetic use, and it can carry trace polycyclic-aromatic-hydrocarbon impurities the EU limits. The dermal/eye cosmetic exposure is a much lower-risk route than the inhalation evidence the 2B rating rests on.",
    gorillaPosition: "We flag it lightly and honestly: the IARC concern is about breathing it in industrially, which isn't how you meet it in mascara — so this is a small transparency deduction, not a serious alarm. Worth knowing it's there; not worth losing sleep over.",
    sources: ["IARC Monographs Volume 93 — Carbon Black, Titanium Dioxide, and Talc", "EU Cosmetics Regulation (EC) No 1223/2009 — Annex IV (Carbon Black, PAH purity limits)"],
    matchers: [name("Carbon black"), name("D&C Black No. 2"), name("CI 77266"), name("Acetylene black")],
  },

  // ── FRAGRANCE / PRESERVATIVE / EMOLLIENT — recent regulatory gaps ────────────
  {
    id: "lilial",
    concern: "Reproductive Toxicity",
    risk: "high",
    penalty: 24,
    note: "A synthetic floral (lily-of-the-valley) fragrance ingredient, INCI 'Butylphenyl Methylpropional' (also BMHCA / Lilial). The EU banned it outright from cosmetics after classifying it a reproductive toxicant.",
    tier: "strong-consensus",
    healthBodyPosition: "The EU classified Butylphenyl Methylpropional as Reprotoxic Category 1B and BANNED it from all cosmetic products under Regulation (EU) 2019/1966 (in force since March 2022); Health Canada restricts it on the Cosmetic Ingredient Hotlist. This is a hard regulatory ban on a CMR-classified ingredient, not a precautionary flag.",
    gorillaPosition: "This is about as unambiguous as cosmetic-ingredient calls get — Europe removed it from the market entirely over reproductive-toxicity evidence. If it's on a label you're using, that product predates the ban or wasn't reformulated for the EU market; either way it's the clearest 'look for an alternative' on this list.",
    sources: ["EU Regulation (EU) 2019/1966 — CMR ban (Butylphenyl Methylpropional, Reprotoxic 1B)", "Health Canada — Cosmetic Ingredient Hotlist", "EU SCCS Opinion on Butylphenyl Methylpropional (SCCS/1591/17)"],
    matchers: [name("Butylphenyl methylpropional"), name("Butylphenyl-methylpropional"), name("BMHCA"), name("p-BMHCA"), name("Lilial"), name("Lily aldehyde")],
  },
  {
    id: "phenoxyethanol",
    concern: "Irritant",
    risk: "medium",
    penalty: 10,
    note: "A very common preservative (often the paraben replacement). Generally well tolerated, but restricted to a maximum concentration because it can irritate and, at higher exposure, carries a systemic-exposure concern flagged for infants.",
    tier: "contested",
    healthBodyPosition: "The EU's Scientific Committee on Consumer Safety concluded phenoxyethanol is safe as a preservative up to 1% and the EU Cosmetics Regulation caps it there (Annex V); Health Canada restricts it on the Cosmetic Ingredient Hotlist, and the FDA once warned about a nipple-cream product over infant exposure. A restricted-concentration preservative — not banned, but not unlimited either.",
    gorillaPosition: "This is a 'restricted, not forbidden' ingredient — fine for most people at the capped levels, which is exactly why regulators set a cap rather than a ban. Worth knowing it's the preservative doing the work, especially on anything used on or around infants.",
    sources: ["EU Cosmetics Regulation (EC) No 1223/2009 — Annex V (Phenoxyethanol, 1% max)", "EU SCCS Opinion on Phenoxyethanol (SCCS/1575/16)", "Health Canada — Cosmetic Ingredient Hotlist"],
    matchers: [name("Phenoxyethanol")],
  },
  {
    id: "petrolatum",
    concern: "Carcinogen Concern",
    risk: "low",
    penalty: 6,
    note: "Petroleum jelly — an occlusive emollient. The refined, cosmetic-grade (USP) material is not the concern; the issue is potential polycyclic-aromatic-hydrocarbon (PAH) contamination in incompletely refined grades.",
    tier: "precautionary",
    healthBodyPosition: "The EU permits petrolatum in cosmetics only when the full refining history is known and shown to be non-carcinogenic (Annex II condition) — fully-refined USP-grade petrolatum is not classified carcinogenic and is widely regarded as safe, so the concern is specifically PAH contamination in unrefined material, not the refined ingredient itself.",
    gorillaPosition: "Refining-dependent, and cosmetic-grade petrolatum is largely fine — which is why this is a light flag, not a heavy one. It's a 'know how it was refined' transparency note; on a reputable finished product the refined grade is the norm.",
    sources: ["EU Cosmetics Regulation (EC) No 1223/2009 — Annex II (petrolatum refining condition)", "Cosmetic Ingredient Review — Safety Assessment of Petrolatum", "IARC Monograph — Mineral oils, untreated/mildly-treated"],
    matchers: [name("Petrolatum"), name("Petroleum jelly")],
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
    const contested = detected.filter((d) => d.concern === "Contested Systemic");
    const reprotox = detected.filter((d) => d.concern === "Reproductive Toxicity");

    if (reprotox.length > 0) flags.push(`${reprotox.length} reproductive-toxicity ingredient${reprotox.length > 1 ? "s" : ""} detected (EU-banned CMR): ${reprotox.map((d) => d.name).join(", ")}`);
    if (carcinogens.length > 0) flags.push(`${carcinogens.length} carcinogen-concern ingredient${carcinogens.length > 1 ? "s" : ""} detected: ${carcinogens.map((d) => d.name).join(", ")}`);
    if (endocrine.length > 0) flags.push(`${endocrine.length} possible endocrine disruptor${endocrine.length > 1 ? "s" : ""} detected: ${endocrine.map((d) => d.name).join(", ")}`);
    if (contested.length > 0) flags.push(`${contested.length} contested-concern ingredient${contested.length > 1 ? "s" : ""} detected (widely questioned, harm not established): ${contested.map((d) => d.name).join(", ")}`);
    if (parabens.length > 0) flags.push(`${parabens.length} paraben${parabens.length > 1 ? "s" : ""} detected: ${parabens.map((d) => d.name).join(", ")}`);
    if (allergens.length > 0) flags.push(`${allergens.length} allergen/sensitizer source${allergens.length > 1 ? "s" : ""} detected: ${allergens.map((d) => d.name).join(", ")}`);
    if (irritants.length > 0) flags.push(`${irritants.length} known irritant${irritants.length > 1 ? "s" : ""} detected: ${irritants.map((d) => d.name).join(", ")}`);
  } else {
    positives.push("No flagged irritants, allergens, endocrine disruptors, or parabens detected in the ingredients list");
  }

  return { score, grade: gradeFromScore(score), detected, flags, positives };
}
