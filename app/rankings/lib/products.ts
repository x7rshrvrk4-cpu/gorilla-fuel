import type { EvidenceTier } from "../../scan/lib/scoring";

export type Category = "Creatine" | "Whey Protein" | "Pre-Workout" | "BCAAs/EAAs";

export type Grade = "S" | "A+" | "A" | "B" | "C" | "D";

export type Product = {
  id: string;
  category: Category;
  name: string;
  brand: string;
  /** How settled the science is on the claims made about this product's category — e.g. creatine monohydrate is STRONG CONSENSUS, a newer blend is PRECAUTIONARY. */
  evidenceTier: EvidenceTier;
  /** ISO date this entry's data was last checked against current sources. */
  lastVerified: string;
  grade: Grade;
  pricePerServing: number;
  thirdPartyTested: boolean;
  purityScore: number;
  certifications: string[];
  analysis: string;
  pros: string[];
  cons: string[];
};

export const CATEGORIES: Category[] = ["Creatine", "Whey Protein", "Pre-Workout", "BCAAs/EAAs"];

export const GRADE_RANK: Record<Grade, number> = { S: 6, "A+": 5, A: 4, B: 3, C: 2, D: 1 };

export const GRADE_COLORS: Record<Grade, string> = {
  S: "#3ddc84",
  "A+": "#7be37b",
  A: "#ffd700",
  B: "#ffb84d",
  C: "#ff9d2e",
  D: "#ff4d4d",
};

export const GRADE_LEGEND: { grade: Grade; label: string; description: string }[] = [
  { grade: "S", label: "Elite", description: "Exceptional purity, full label transparency, independently verified. The benchmark." },
  { grade: "A+", label: "Excellent", description: "Near-flawless formulation and testing. Tiny nitpicks at most." },
  { grade: "A", label: "Very Good", description: "Strong, trustworthy product with minor caveats worth knowing." },
  { grade: "B", label: "Good", description: "Solid choice, but carries tradeoffs — dosing, sweeteners, or value." },
  { grade: "C", label: "Average", description: "Gets the job done. Expect some red flags: blends, fillers, or weak claims." },
  { grade: "D", label: "Below Average", description: "Proprietary blends, underdosed actives, or additive-heavy. Buyer beware." },
];

export const PRODUCTS: Product[] = [
  // ───────── CREATINE ─────────
  {
    id: "creatine-forge-micronized",
    category: "Creatine",
    evidenceTier: "strong-consensus",
    lastVerified: "2026-06-01",
    name: "Micronized Creatine Monohydrate",
    brand: "Forge Labs",
    grade: "S",
    pricePerServing: 0.18,
    thirdPartyTested: true,
    purityScore: 99,
    certifications: ["Creapure®", "Informed Sport", "NSF Certified for Sport"],
    analysis:
      "This is the gold standard, full stop. Creapure-sourced monohydrate, micronized for solubility, single-ingredient label, and triple-certified. There is nothing to hide here because there's nothing extra in the tub — just the most-researched ergogenic compound on the planet at clinical dosing.",
    pros: [
      "Single-ingredient label — exactly 5g creatine monohydrate, nothing else",
      "Creapure® certified for pharmaceutical-grade purity",
      "Third-party tested by two independent bodies",
      "Lowest cost-per-effective-dose in the category",
    ],
    cons: [
      "Unflavored — mixes with a slight chalkiness if under-stirred",
      "Tub design wastes a little space versus pouch competitors",
    ],
  },
  {
    id: "creatine-ironcore-hcl",
    category: "Creatine",
    evidenceTier: "emerging-evidence",
    lastVerified: "2026-06-01",
    name: "Creatine HCl Pro",
    brand: "IronCore",
    grade: "A",
    pricePerServing: 0.42,
    thirdPartyTested: true,
    purityScore: 95,
    certifications: ["Informed Sport"],
    analysis:
      "HCl formulations promise better solubility and lower bloat at smaller doses — and IronCore backs that up with a clean label and real testing. The catch is the price: you're paying roughly double per gram of creatine versus monohydrate for a solubility benefit most lifters won't notice.",
    pros: [
      "Smaller, more soluble dose with no loading phase needed",
      "Clean label — no fillers, dyes, or artificial sweeteners",
      "Independently tested for banned substances",
    ],
    cons: [
      "More than 2x the cost-per-gram of monohydrate for marginal benefit",
      "Less long-term research backing than monohydrate",
    ],
  },
  {
    id: "creatine-summit-blend",
    category: "Creatine",
    evidenceTier: "precautionary",
    lastVerified: "2026-06-01",
    name: "Creatine Blend Matrix",
    brand: "Summit Nutrition",
    grade: "C",
    pricePerServing: 0.55,
    thirdPartyTested: false,
    purityScore: 71,
    certifications: [],
    analysis:
      "A 'multi-source creatine matrix' that mixes monohydrate with three exotic creatine forms in a proprietary blend — meaning you can't see how much of each you're actually getting. The underlying monohydrate dose looks underwhelming once you account for the filler forms padding the label.",
    pros: [
      "Includes a base of standard creatine monohydrate",
      "Capsule format is convenient for travel",
    ],
    cons: [
      "Proprietary blend hides individual ingredient amounts",
      "No third-party testing or purity certification",
      "Premium price for unproven 'advanced' creatine forms",
    ],
  },
  {
    id: "creatine-vantage-creapure",
    category: "Creatine",
    evidenceTier: "strong-consensus",
    lastVerified: "2026-06-01",
    name: "Creapure® Elite",
    brand: "Vantage Performance",
    grade: "S",
    pricePerServing: 0.21,
    thirdPartyTested: true,
    purityScore: 98,
    certifications: ["Creapure®", "Informed Sport"],
    analysis:
      "Vantage doesn't reinvent the wheel — it just sources the best wheel available. German-made Creapure monohydrate, batch-tested, and priced fairly. If Forge Labs is the benchmark, this is the benchmark's closest competitor, separated only by a slightly higher price-per-serving.",
    pros: [
      "Creapure® sourced — independently verified for heavy metals and purity",
      "Transparent single-ingredient formula",
      "Informed Sport certified for competitive athletes",
    ],
    cons: [
      "Slightly pricier than Forge Labs for an equivalent product",
      "No flavored options available",
    ],
  },

  // ───────── WHEY PROTEIN ─────────
  {
    id: "whey-bedrock-grassfed-isolate",
    category: "Whey Protein",
    evidenceTier: "strong-consensus",
    lastVerified: "2026-06-01",
    name: "Grass-Fed Whey Isolate",
    brand: "Bedrock Nutrition",
    grade: "S",
    pricePerServing: 1.35,
    thirdPartyTested: true,
    purityScore: 97,
    certifications: ["Informed Sport", "Grass Fed Certified", "NSF Certified for Sport"],
    analysis:
      "27g of protein per scoop, sub-1g sugar, no artificial sweeteners, and grass-fed sourcing that's actually verified — not just printed on the label. This is what 'premium' is supposed to mean. The scoring reflects a near-perfect amino profile with zero flagged additives in the ingredient scan.",
    pros: [
      "27g protein, <1g sugar, <1g fat per serving — elite macros",
      "Naturally sweetened with stevia leaf extract, no artificial dyes",
      "Third-party verified grass-fed sourcing and banned-substance testing",
    ],
    cons: [
      "Among the most expensive options per serving in this roundup",
      "Limited flavor lineup compared to mass-market brands",
    ],
  },
  {
    id: "whey-granite-gold-standard",
    category: "Whey Protein",
    evidenceTier: "strong-consensus",
    lastVerified: "2026-06-01",
    name: "Gold Standard Whey Blend",
    brand: "Granite Supplements",
    grade: "A",
    pricePerServing: 0.95,
    thirdPartyTested: true,
    purityScore: 90,
    certifications: ["Informed Sport"],
    analysis:
      "A whey concentrate/isolate blend that hits a strong protein-per-dollar ratio without cutting corners on testing. Sugar content creeps slightly into flagged territory in the chocolate variants, but the overall additive profile stays clean. A genuinely solid daily driver.",
    pros: [
      "Strong 24g protein per serving at a mid-range price point",
      "Third-party tested for purity and banned substances",
      "Mixes smoothly without a gritty aftertaste",
    ],
    cons: [
      "Chocolate flavors run slightly higher in sugar (~13g/serving)",
      "Contains sucralose, which some users prefer to avoid",
    ],
  },
  {
    id: "whey-crucible-mass",
    category: "Whey Protein",
    evidenceTier: "strong-consensus",
    lastVerified: "2026-06-01",
    name: "Mass Whey Concentrate",
    brand: "Crucible Labs",
    grade: "C",
    pricePerServing: 0.78,
    thirdPartyTested: false,
    purityScore: 68,
    certifications: [],
    analysis:
      "Marketed as a 'mass gainer protein,' which mostly means extra maltodextrin and sugar riding alongside a modest protein dose. The ingredient scan flags both elevated sugar and two additives used purely for mouthfeel and shelf life — neither doing the consumer any favors.",
    pros: [
      "Higher calorie content suits genuine bulking goals",
      "Widely available at most major retailers",
    ],
    cons: [
      "16g of sugar per serving — well into flagged territory",
      "Contains carrageenan and sucralose with no testing certification",
      "Protein-to-calorie ratio is weak for the price",
    ],
  },
  {
    id: "whey-anvil-clean-isolate",
    category: "Whey Protein",
    evidenceTier: "strong-consensus",
    lastVerified: "2026-06-01",
    name: "Clean Isolate 90",
    brand: "Anvil Performance",
    grade: "A+",
    pricePerServing: 1.18,
    thirdPartyTested: true,
    purityScore: 96,
    certifications: ["Informed Sport", "NSF Certified for Sport"],
    analysis:
      "A 90%+ pure whey protein isolate with an almost suspiciously short ingredient list — and that's the point. Minimal processing aids, no dyes, no flagged sweeteners, and a verified amino acid profile that backs up every gram on the label. One of the cleanest isolates we've scored.",
    pros: [
      "90%+ pure isolate with verified amino acid profile",
      "Zero flagged additives detected in ingredient scan",
      "Low lactose — well tolerated by sensitive stomachs",
    ],
    cons: [
      "Thinner texture than concentrate-based blends",
      "Premium pricing puts it out of reach for budget stacks",
    ],
  },
  {
    id: "whey-outlaw-budget-stack",
    category: "Whey Protein",
    evidenceTier: "strong-consensus",
    lastVerified: "2026-06-01",
    name: "Budget Whey Stack",
    brand: "Outlaw Nutrition",
    grade: "D",
    pricePerServing: 0.52,
    thirdPartyTested: false,
    purityScore: 54,
    certifications: [],
    analysis:
      "The cheapest whey on this list — and it shows. Heavy on maltodextrin filler, light on actual protein per scoop, and the ingredient scan turns up three flagged additives including a high-risk synthetic dye. This is a sports-drink-adjacent product wearing a protein label.",
    pros: [
      "Lowest price point in the entire roundup",
      "Sweet flavor profile that masks poor mixability",
    ],
    cons: [
      "Only 14g of actual protein despite a 30g scoop size",
      "Contains Sunset Yellow FCF (E110) — a flagged high-risk dye",
      "High sugar content and zero independent testing",
    ],
  },

  // ───────── PRE-WORKOUT ─────────
  {
    id: "pre-catalyst-ignite",
    category: "Pre-Workout",
    evidenceTier: "emerging-evidence",
    lastVerified: "2026-06-01",
    name: "Ignite Pre",
    brand: "Catalyst Labs",
    grade: "B",
    pricePerServing: 1.05,
    thirdPartyTested: true,
    purityScore: 84,
    certifications: ["Informed Sport"],
    analysis:
      "A competently dosed stim-based pre-workout — 200mg caffeine, clinical-range citrulline malate, and full label transparency on every active. It loses points for a couple of cosmetic additives that add nothing functionally, but the core formula does what it says on the tin.",
    pros: [
      "Fully disclosed dosages — no proprietary blends",
      "200mg caffeine plus 6g citrulline malate at clinical levels",
      "Third-party tested for banned substances",
    ],
    cons: [
      "Contains sucralose and a synthetic color additive",
      "Caffeine load may be high for stim-sensitive users",
    ],
  },
  {
    id: "pre-vertex-surge",
    category: "Pre-Workout",
    evidenceTier: "emerging-evidence",
    lastVerified: "2026-06-01",
    name: "Surge V2",
    brand: "Vertex Athletics",
    grade: "S",
    pricePerServing: 1.22,
    thirdPartyTested: true,
    purityScore: 98,
    certifications: ["Informed Sport", "NSF Certified for Sport", "Banned Substance Tested"],
    analysis:
      "Everything a pre-workout should be: fully dosed actives at the amounts shown in clinical trials, naturally flavored and colored, and triple-tested for banned substances. No proprietary blends, no synthetic dyes, no filler. This is the rare formula engineered for performance over marketing.",
    pros: [
      "Every active dosed at or above clinically studied amounts",
      "Naturally flavored and colored — zero flagged additives",
      "Triple-certified for competitive and tested athletes",
    ],
    cons: [
      "Among the priciest pre-workouts per serving",
      "Strong natural flavor profile — an acquired taste for some",
    ],
  },
  {
    id: "pre-strata-rocket-fuel",
    category: "Pre-Workout",
    evidenceTier: "precautionary",
    lastVerified: "2026-06-01",
    name: "Rocket Fuel Extreme",
    brand: "Strata Sport",
    grade: "D",
    pricePerServing: 0.98,
    thirdPartyTested: false,
    purityScore: 49,
    certifications: [],
    analysis:
      "Hides its entire active ingredient list behind a 'Rocket Fuel Proprietary Complex,' so there's no way to verify the caffeine dose — and anecdotal reports suggest it's substantial. The ingredient scan flags four additives, including two synthetic dyes and a preservative linked to nitrosamine formation.",
    pros: [
      "Strong stimulant effect reported by users",
      "Wide flavor variety",
    ],
    cons: [
      "Proprietary blend conceals all dosages, including caffeine",
      "Four flagged additives detected, two of them high-risk dyes",
      "No third-party testing — risky for tested athletes",
    ],
  },
  {
    id: "pre-apex-clean-charge",
    category: "Pre-Workout",
    evidenceTier: "emerging-evidence",
    lastVerified: "2026-06-01",
    name: "Clean Charge",
    brand: "Apex Labs",
    grade: "A",
    pricePerServing: 1.10,
    thirdPartyTested: true,
    purityScore: 92,
    certifications: ["Informed Sport"],
    analysis:
      "Built around a moderate 150mg caffeine dose plus beta-alanine and L-theanine for a smoother curve without the crash. Every ingredient is disclosed and dosed sensibly, and the additive scan comes back essentially clean — only a trace natural flavoring agent registers at all.",
    pros: [
      "Balanced 150mg caffeine + L-theanine — smooth energy, no crash",
      "Fully transparent label with clinically-informed dosing",
      "Virtually no flagged additives detected",
    ],
    cons: [
      "Lower stimulant ceiling won't satisfy heavy stim users",
      "Beta-alanine tingles are noticeable at full dose",
    ],
  },

  // ───────── BCAAs / EAAs ─────────
  {
    id: "amino-nordic-recovery",
    category: "BCAAs/EAAs",
    evidenceTier: "emerging-evidence",
    lastVerified: "2026-06-01",
    name: "Recovery Aminos Complete",
    brand: "Nordic Strength",
    grade: "A",
    pricePerServing: 0.88,
    thirdPartyTested: true,
    purityScore: 91,
    certifications: ["Informed Sport"],
    analysis:
      "A full essential amino acid spectrum (not just the three BCAAs) at research-backed ratios, naturally sweetened, and independently verified. It edges out most of the category by actually delivering what amino supplements promise — better recovery signaling via complete EAA coverage.",
    pros: [
      "Complete EAA profile, not just isolated BCAAs",
      "Naturally sweetened with stevia — no flagged sweeteners",
      "Verified amino acid ratios via third-party lab testing",
    ],
    cons: [
      "Mild aftertaste some users find off-putting",
      "Pricier than basic BCAA-only formulas",
    ],
  },
  {
    id: "amino-titan-bcaa-classic",
    category: "BCAAs/EAAs",
    evidenceTier: "contested",
    lastVerified: "2026-06-01",
    name: "BCAA 2:1:1 Classic",
    brand: "Titan Supps",
    grade: "C",
    pricePerServing: 0.61,
    thirdPartyTested: false,
    purityScore: 70,
    certifications: [],
    analysis:
      "A textbook 2:1:1 BCAA ratio with nothing to write home about — and nothing alarming either, beyond an artificial sweetener that lands a mild flag. The bigger issue is value: emerging research increasingly favors full EAA formulas over isolated BCAAs for the same money.",
    pros: [
      "Classic, well-studied 2:1:1 leucine-to-isoleucine-to-valine ratio",
      "Affordable entry point for amino supplementation",
    ],
    cons: [
      "Contains sucralose and an artificial color additive",
      "BCAA-only formula — increasingly seen as inferior to full EAA blends",
      "No independent purity testing",
    ],
  },
  {
    id: "amino-purestack-eaa",
    category: "BCAAs/EAAs",
    evidenceTier: "emerging-evidence",
    lastVerified: "2026-06-01",
    name: "EAA Essentials",
    brand: "PureStack",
    grade: "A+",
    pricePerServing: 0.97,
    thirdPartyTested: true,
    purityScore: 95,
    certifications: ["Informed Sport", "NSF Certified for Sport"],
    analysis:
      "All nine essential amino acids at fully disclosed amounts, sweetened naturally, double-certified, and not a single flagged additive in the scan. The formula mirrors what the clinical literature actually supports rather than chasing trends — a quietly excellent product.",
    pros: [
      "All 9 essential amino acids at disclosed clinical ratios",
      "Zero flagged additives — naturally sweetened and flavored",
      "Double-certified for purity and banned substances",
    ],
    cons: [
      "Higher price point than BCAA-only competitors",
      "Subtle flavor that some find too mild",
    ],
  },
  {
    id: "amino-brawn-sweetened-punch",
    category: "BCAAs/EAAs",
    evidenceTier: "contested",
    lastVerified: "2026-06-01",
    name: "Sweetened BCAA Punch",
    brand: "Brawn & Co",
    grade: "D",
    pricePerServing: 0.59,
    thirdPartyTested: false,
    purityScore: 51,
    certifications: [],
    analysis:
      "Reads more like a flavored drink mix than an amino supplement — the BCAA dose is on the low end of effective, while sugar and synthetic dye content push two separate flags in the scan. You're mostly paying for flavoring here, with aminos as an afterthought.",
    pros: [
      "Pleasant, candy-like flavor profile",
      "Low price point per serving",
    ],
    cons: [
      "Underdosed BCAAs relative to studied effective amounts",
      "Contains both Allura Red AC (E129) and added sugar above flag thresholds",
      "No third-party testing or certification",
    ],
  },
];
