// "Home remedies": folk and old-wives'-tale claims for colds, coughs, sore throats and first aid, checked against
// Cochrane reviews, NCCIH, Health Canada and extension services. Researched 2026-11-04 from abstracts, summaries and
// news coverage of official pages; full papers were NOT read. Nothing here is medical advice or a treatment claim.
// Preparation notes are traditional or from the cited source; where a storage rule is ours it says so.

export type RemedyVerdict = "some_support" | "mixed" | "not_supported" | "tradition" | "harmful";

export const REMEDY_VERDICT_LABEL: Record<RemedyVerdict, string> = {
  some_support: "Some support",
  mixed: "Mixed evidence",
  not_supported: "Not supported",
  tradition: "Tradition only, untested",
  harmful: "Can cause harm",
};
export const REMEDY_VERDICT_HELP: Record<RemedyVerdict, string> = {
  some_support: "human trials show a modest benefit for a specific use",
  mixed: "trials or reviews disagree, or the benefit is small and uncertain",
  not_supported: "trials or fact-checkers found no benefit",
  tradition: "no trial of the remedy itself; it rests on tradition",
  harmful: "doing this can injure you",
};

export type RemedyGroup = "Cough and sore throat" | "Colds and immunity" | "Other home remedies and myths";

export type Remedy = {
  id: string;
  group: RemedyGroup;
  claim: string;
  name: string;
  verdict: RemedyVerdict;
  summary: string;
  forPoints: string[];
  againstPoints: string[];
  official: string[];
  howTo?: { title: string; ingredients: string[]; steps: string[]; store: string[] };
  caution?: string;
  sources: string[];
};

export const REMEDY_RULE =
  "How we judged: a remedy counts as supported only if human trials, or a systematic review of them, show a benefit. Folk claims with no trial are labelled tradition only. We show evidence for and against, what official bodies say, and how to prepare and store it only where a source or a safety rule backs the method.";

export const REMEDY_GROUPS: RemedyGroup[] = ["Cough and sore throat", "Colds and immunity", "Other home remedies and myths"];

export const REMEDIES: Remedy[] = [
  {
    id: "honey", group: "Cough and sore throat", claim: "A spoonful of honey calms a cough", name: "Honey for cough", verdict: "some_support",
    summary: "The best-supported item on this tab: small trials in children over 1 year suggest honey eases night cough a little better than no treatment.",
    forPoints: [
      "Cochrane review (6 studies, 899 children aged 12 months to 16 years): honey probably relieves cough and its effect on sleep better than no treatment, and may reduce cough frequency more than diphenhydramine (1 study, 80 children, low certainty).",
    ],
    againstPoints: [
      "Most children were treated for only one night. Beyond three days honey probably had no advantage over salbutamol or placebo for cough severity.",
      "Some studies did not blind participants, and the reviewers rate the certainty low to moderate.",
    ],
    official: [
      "Health Canada: never give honey to a baby under 1 year (infant botulism). Heating does not destroy the spores. Honey is the only food linked to infant botulism in Canada.",
      "Health Canada has advised since 2008 against over-the-counter cough and cold medicines for children under 6, which is one reason honey is discussed for older children.",
    ],
    howTo: {
      title: "How to use",
      ingredients: ["Plain honey (any type)"],
      steps: [
        "For a child over 1 year, a review we read via search summary suggests a single dose of about 2.5 mL (half a teaspoon) before bed.",
        "Adults commonly take a teaspoon straight or stirred into warm (not boiling) water or herbal tea.",
      ],
      store: ["Keep honey in its closed jar at room temperature. Honey does not need the fridge."],
    },
    caution: "Never give honey to a child under 1 year old, in any form, including cooked or baked into food. See a doctor for a cough that lasts more than a few weeks, comes with fever or trouble breathing, or in a baby.",
    sources: ["R1", "R11", "R19"],
  },
  {
    id: "onion-honey", group: "Cough and sore throat", claim: "Onion soaked in honey makes a cough syrup", name: "Onion and honey syrup", verdict: "tradition",
    summary: "We found no trial of the onion-and-honey combination. The honey part has some support; the onion part rests on tradition.",
    forPoints: [
      "Honey alone has some trial support for cough in children over 1 (see the honey entry).",
    ],
    againstPoints: [
      "No clinical trial of onion, or of onion with honey, for cough turned up in our searches. Web pages that claim cough-reduction figures for it cite studies we could not verify, so we did not use them.",
      "Safety: Oregon State Extension says foods most at risk when infused in honey are low-acid, moist ones, and most harmful bacteria can grow on a low-acid, moist food submerged in honey. Honey's acidity is not a reliable control. Raw onion is low acid.",
    ],
    official: [
      "We found no authority that gives a validated storage time for onion in honey. Treat the method below as our cautious approach, not an official rule.",
    ],
    howTo: {
      title: "How it is traditionally made, with our cautions",
      ingredients: ["Half a small onion, finely sliced", "About 2 to 3 tablespoons of honey"],
      steps: [
        "Layer the sliced onion in a clean jar and cover it with honey.",
        "Leave it covered in the fridge for a few hours until a thin syrup forms.",
        "Take a teaspoon of the syrup. Strain out the onion pieces if you plan to keep it.",
      ],
      store: [
        "Our rule, not an official one: keep it in the fridge the whole time, make a very small batch and throw out what is left after 24 hours.",
        "Never leave it at room temperature, and never give it to a child under 1 year.",
      ],
    },
    caution: "Not for children under 1 year (honey). Because low-acid food in honey is a botulism concern, do not store it at room temperature or keep it for days.",
    sources: ["R1", "R11", "R12"],
  },
  {
    id: "hot-drink", group: "Cough and sore throat", claim: "Hot lemon, honey and ginger tea fights a cold", name: "Hot lemon, honey and ginger drink", verdict: "mixed",
    summary: "A warm drink can soothe a sore throat. Beyond that, the honey has some support, ginger has evidence for nausea, and lemon has none we found for colds.",
    forPoints: [
      "Honey eases cough a little in children over 1 (Cochrane). Ginger supplements may help nausea in pregnancy, per NCCIH, based on low-to-moderate quality studies.",
    ],
    againstPoints: [
      "We found no trial of the drink itself. Vitamin C, the usual reason given for lemon, did not help once cold symptoms had started in the Cochrane review (see the vitamin C entry).",
      "NCCIH: the evidence on using ginger in pregnancy is not conclusive, and ginger can cause heartburn, diarrhea and mouth irritation. Concentrated ginger may raise bleeding risk (Memorial Sloan Kettering).",
    ],
    official: ["NCCIH advises checking with a health care provider before using ginger in pregnancy."],
    howTo: {
      title: "Traditional preparation",
      ingredients: ["A few slices of fresh ginger", "Juice of a lemon wedge", "1 teaspoon honey (not for children under 1)", "A mug of water"],
      steps: [
        "Simmer the ginger slices in the water for about 10 minutes, then take it off the heat.",
        "Let it cool until it is hot but drinkable, then stir in the lemon and honey. Adding honey to boiling water is unnecessary.",
      ],
      store: ["Best made fresh. If you keep leftover ginger tea, refrigerate it and use it within 2 to 3 days (our cautious rule, matching Health Canada's window for soups)."],
    },
    caution: "Ask your doctor or pharmacist about ginger in pregnancy or if you take blood thinners. No honey for children under 1 year.",
    sources: ["R1", "R14", "M1", "R11"],
  },
  {
    id: "salt-gargle", group: "Cough and sore throat", claim: "Gargling salt water soothes a sore throat and prevents colds", name: "Salt-water gargle", verdict: "mixed",
    summary: "It may ease throat pain. As a way to prevent colds, one unblinded trial of plain-water gargling found a borderline benefit.",
    forPoints: [
      "Satomura 2005, 387 healthy adults followed for at least 60 days: an upper respiratory infection occurred in 41% of the usual-care group and 30% of the group that gargled water, a 36% relative reduction.",
    ],
    againstPoints: [
      "The trial was not blinded, had no true placebo group and was run in winter. The authors called the effect borderline, and influenza-like illness was not reduced.",
      "The trial used plain water, not salt water, so it does not test salt itself. A fact-check concluded salt gargling does not cure a sore throat but may ease pain.",
    ],
    official: ["We could not retrieve Mayo Clinic's own page; the quarter to half teaspoon in a cup of warm water figure comes from secondary reports attributing it to Mayo Clinic."],
    howTo: {
      title: "How to do it",
      ingredients: ["1/4 to 1/2 teaspoon table or sea salt", "1 cup (about 240 mL) of warm water"],
      steps: [
        "Stir until the salt is fully dissolved. Use warm, not hot, water.",
        "Tip your head back, gargle for a few seconds, then spit it out. Do not swallow it.",
        "Repeat a few times a day if it helps.",
      ],
      store: ["Mix a fresh cup each time; there is nothing to store."],
    },
    caution: "Not for young children who cannot gargle and spit. A severe sore throat, trouble swallowing or breathing, or fever needs a doctor.",
    sources: ["R7", "R20"],
  },
  {
    id: "saline-rinse", group: "Cough and sore throat", claim: "Rinsing your nose with salt water clears a cold", name: "Saline nasal rinse", verdict: "mixed",
    summary: "Small trials suggest a modest symptom benefit, but the Cochrane review found the evidence too limited to recommend it as standard. The water you use is a safety issue.",
    forPoints: [
      "Cochrane review (3 trials, 618 participants): nasal saline irrigation was associated with less time off work in one study. A fragment of the 2015 update abstract that we saw refers to a small difference of -0.33 on a 4-point symptom scale; we could not read its full conclusions.",
    ],
    againstPoints: [
      "The trials were small with high risk of bias, and most comparisons showed no meaningful difference. In one adult trial symptoms resolved about 0.3 days sooner out of 8, which was not statistically significant.",
      "Minor discomfort was common, and 40% of babies did not tolerate saline drops.",
    ],
    official: [
      "CDC (as quoted in news coverage): use distilled or sterile water, or tap water boiled for at least one minute and then cooled. Tap water can carry amoebas, and infections tied to nasal rinsing, some fatal, have been reported.",
    ],
    howTo: {
      title: "Safe method",
      ingredients: ["Pre-mixed saline packets sold for nasal rinsing (so the salt amount is right)", "Distilled or sterile water, or tap water boiled at least 1 minute and cooled"],
      steps: ["Mix one packet with the safe water as the packet directs.", "Rinse as your device's instructions say, and let the device air dry between uses."],
      store: ["Do not keep mixed solution; make it fresh each time. Boiled water should be used the same day (our rule)."],
    },
    caution: "Never use plain tap water. We could not retrieve the CDC page itself; check it for the full instructions.",
    sources: ["R10", "R21"],
  },
  {
    id: "steam", group: "Cough and sore throat", claim: "Breathing steam clears a blocked nose", name: "Steam inhalation", verdict: "not_supported",
    summary: "Cochrane could not show that heated, humidified air relieves cold symptoms, and a hot bowl of water carries a scald risk.",
    forPoints: ["Some small trials found improvement in nasal resistance, and the fixed-effect analysis in the 2017 review favoured treatment."],
    againstPoints: [
      "2017 Cochrane review (6 trials, 387 participants): uncertain whether it helps; the random-effects analysis found no significant difference and the evidence quality was low.",
      "One study found worse nasal resistance and minor nose irritation was reported. One study found no change in viral shedding.",
    ],
    official: ["Earlier Cochrane versions (2006, 2013) said steam inhalation had not shown consistent benefit and was not recommended for routine treatment."],
    caution: "Hot water and bowls cause scalds, especially in children. A warm shower is a safer way to enjoy steam if it feels good.",
    sources: ["R5"],
  },
  {
    id: "chicken-soup", group: "Colds and immunity", claim: "Chicken soup helps you recover from a cold", name: "Chicken soup", verdict: "tradition",
    summary: "Lab and small studies show some effects, such as faster nasal mucus flow with hot liquids and reduced white-cell migration in a test tube. No trial shows it shortens a cold.",
    forPoints: [
      "Saketkhoo 1978: hot liquids moved nasal mucus faster than cold water, and soup more than plain hot water.",
      "Rennard 2000: chicken soup inhibited neutrophil chemotaxis in a laboratory experiment.",
    ],
    againstPoints: [
      "The mucus study was small and short-term, and the neutrophil study was in vitro, not in patients. We found no clinical trial showing soup shortens a cold.",
      "We read these studies only through popular summaries; sources disagree on details such as the location of the 1978 study.",
    ],
    official: ["NCCIH: no scientific evidence that any food or supplement can boost the immune system enough to prevent infection entirely."],
    howTo: {
      title: "A basic soup, with Health Canada's storage rules",
      ingredients: ["Chicken pieces", "Onion, carrot and celery", "Garlic, salt and pepper", "Water to cover"],
      steps: [
        "Simmer the chicken and vegetables in water until the chicken is fully cooked (internal temperature 74°C / 165°F) and the vegetables are tender.",
        "Skim, season, and shred the chicken back into the pot if you like.",
        "Do not put a big hot pot straight into the fridge. Divide the soup into shallow containers first.",
      ],
      store: [
        "Health Canada: refrigerate at 4°C or colder and eat within 2 to 3 days. Frozen soup keeps about 4 months.",
        "Reheat to a rolling boil, or at least 74°C, before eating.",
      ],
    },
    caution: "Warm fluids and food are comforting and keep you hydrated, but soup does not replace medical care for a serious illness.",
    sources: ["R13", "R22"],
  },
  {
    id: "vitamin-c", group: "Colds and immunity", claim: "Vitamin C prevents and cures colds", name: "Vitamin C", verdict: "mixed",
    summary: "Regular vitamin C shortens colds slightly. Taking it after symptoms start showed no clear effect, and it does not stop most people catching colds.",
    forPoints: [
      "Cochrane 2013: regular supplements shortened colds by about 8% in adults and 14% in children (1 to 2 g/day gave 18% in children).",
      "In people under heavy physical stress (marathon runners, skiers, soldiers in subarctic conditions), it halved the risk of colds (risk ratio 0.48).",
    ],
    againstPoints: [
      "In ordinary community trials (10,708 participants) it did not meaningfully reduce how often people got colds (risk ratio 0.97).",
      "Starting vitamin C once symptoms appeared showed no consistent effect on duration or severity.",
    ],
    official: ["The review's authors concluded routine supplementation is not justified for the general public, though it may help people with brief periods of severe exercise."],
    caution: "Large supplement doses can upset the stomach. Ask your pharmacist if you take other medicines.",
    sources: ["R2"],
  },
  {
    id: "zinc", group: "Colds and immunity", claim: "Zinc lozenges shorten a cold", name: "Zinc lozenges", verdict: "mixed",
    summary: "Reviews disagree. Early Cochrane versions found a shorter cold when started within 24 hours; the 2024 version is disputed by researchers who reanalysed the lozenge trials.",
    forPoints: [
      "Cochrane 2013: zinc started within 24 hours of symptoms reduced cold duration in healthy people, with the benefit at doses of 75 mg a day or more; lozenges were the most studied form.",
      "A 2024 reanalysis by Hemilä and Chalker of the lozenge trials found colds were about 37% shorter in adults. It is an opinion article, not a Cochrane finding.",
    ],
    againstPoints: [
      "The 2024 Cochrane abstract says zinc is probably linked to more non-serious side effects when used for cold treatment, and its critics say its analysis was flawed.",
      "Cochrane's first version (2011) judged the evidence insufficient to recommend zinc, and the 2013 review urged caution because the trials differed so much.",
    ],
    official: ["We could not retrieve the Cochrane Library page itself, so the 2024 wording comes from the critique."],
    caution: "Follow the product label for dose. Common side effects include nausea and a bad taste. Ask your pharmacist about interactions.",
    sources: ["R3", "R3b"],
  },
  {
    id: "garlic", group: "Colds and immunity", claim: "Eating garlic prevents colds", name: "Garlic", verdict: "tradition",
    summary: "Cochrane found only one small trial, so there is not enough evidence to say garlic prevents or treats colds.",
    forPoints: [
      "The single trial (146 people, allicin garlic capsule or placebo daily for 12 weeks) reported 24 colds in the garlic group versus 65 on placebo.",
    ],
    againstPoints: [
      "One small trial with self-reported outcomes; Cochrane rates the evidence very low quality. Time to recover was similar (4.63 versus 5.63 days).",
      "Side effects included odour and a skin rash.",
    ],
    official: ["Cochrane (2014): insufficient clinical trial evidence for garlic in preventing or treating the common cold."],
    caution: "Garlic supplements may affect bleeding. Ask a pharmacist if you take blood thinners (see the Herbs tab).",
    sources: ["R4"],
  },
  {
    id: "elderberry", group: "Colds and immunity", claim: "Elderberry syrup fights colds and flu", name: "Elderberry", verdict: "mixed",
    summary: "Small trials suggest it may ease symptoms, but benefits are marginal and unconfirmed. The bigger issue is safety: raw berries are toxic.",
    forPoints: ["NCCIH: some preliminary research suggests elderberry may relieve symptoms of flu, colds or other upper respiratory infections."],
    againstPoints: [
      "NCCIH: there is not enough information to show it helps with anything else, and it says not to rely on it for COVID-19. A 2020 study reported no improvement in flu severity or duration, which conflicts with a 2004 study.",
    ],
    official: [
      "NCCIH: raw, unripe elderberries and the leaves and stems of the plant contain toxic substances that can cause nausea, vomiting and diarrhea. Cooking removes the toxin.",
      "Oregon State Extension: eating raw berries or raw juice can cause nausea and sometimes serious illness with hospitalization, and it publishes safe preserving guidance.",
    ],
    howTo: {
      title: "Safest route",
      ingredients: [],
      steps: [
        "Buy a commercially made elderberry product rather than making syrup from raw berries.",
        "If you cook your own, follow Oregon State Extension's guide, \"Play it safe when preserving elderberries\". Never use raw berries, leaves or stems, and never eat red elderberry seeds.",
      ],
      store: ["Follow the product label, or the extension guide's rules for homemade syrup. We give no home recipe because we could not verify one."],
    },
    caution: "Do not eat raw elderberries or drink raw elderberry juice. Ask a pharmacist before use with immune-suppressing medicines.",
    sources: ["R8", "R8b"],
  },
  {
    id: "echinacea", group: "Colds and immunity", claim: "Echinacea prevents or shortens colds", name: "Echinacea", verdict: "mixed",
    summary: "Cochrane found little evidence that it reliably prevents or treats colds, though a small effect is not ruled out. Products differ widely.",
    forPoints: ["A post-hoc pooling of prevention trials suggested a 10% to 20% relative risk reduction, which the authors call small and of unclear significance."],
    againstPoints: [
      "Cochrane 2014 (24 trials, 4,631 participants, 33 preparations): none of the 12 prevention comparisons reporting colds per person was statistically significant, and only 2 of 6 treatment trials showed a significant effect on duration.",
      "The review stresses that the overwhelming majority of echinacea products have not been tested in trials.",
    ],
    official: ["Common side effects reported were headache, nausea and a bad taste; dropouts and adverse effects did not differ significantly from placebo."],
    caution: "Ask a pharmacist before use if you take other medicines or have an allergy to plants in the daisy family.",
    sources: ["R9"],
  },
  {
    id: "onion-socks", group: "Other home remedies and myths", claim: "Onions in your socks or by your bed draw out a cold", name: "Onion in socks", verdict: "not_supported",
    summary: "No medical evidence supports it. The idea dates back to the 1500s, when raw onion was wrongly thought to absorb plague.",
    forPoints: [],
    againstPoints: ["AAP FactCheck rated the claim false, citing experts who found no therapeutic effect and no supporting medical evidence."],
    official: [],
    caution: "Harmless to try, but do not rely on it or delay care for an illness.",
    sources: ["R17"],
  },
  {
    id: "feed-cold", group: "Other home remedies and myths", claim: "Feed a cold, starve a fever", name: "Feed a cold, starve a fever", verdict: "not_supported",
    summary: "A Johns Hopkins physician calls it false. Colds and fevers can both cause dehydration, and it is fine to eat when you have a fever.",
    forPoints: [],
    againstPoints: ["Johns Hopkins Medicine: false. The saying has been traced to a 1574 dictionary, and both illnesses raise the risk of dehydration, so fluids matter."],
    official: [],
    caution: "Drink fluids and eat what you can tolerate.",
    sources: ["R16"],
  },
  {
    id: "cranberry", group: "Other home remedies and myths", claim: "Cranberry juice prevents urinary tract infections", name: "Cranberry for UTIs", verdict: "some_support",
    summary: "Moderate-certainty evidence that cranberry products reduce UTIs in some groups. It is for prevention, not for treating an infection you already have.",
    forPoints: [
      "Cochrane 2023 (50 trials, 8,857 participants): juice, tablets or capsules reduced the number of UTIs in women with recurrent UTIs, in children, and in people prone to UTIs after a procedure (risk ratio 0.70; 95% CI 0.58 to 0.84; moderate certainty).",
    ],
    againstPoints: [
      "No clear reduction in elderly institutionalised people, adults with neuromuscular bladder dysfunction, or pregnant women. There is no established dose, and cranberry products are not formally regulated for this use.",
    ],
    official: ["The summary was promoted by a cranberry industry body, so we relied on the Cochrane pages themselves."],
    caution: "Cranberry does not treat an active infection. Burning urination, fever or back pain need a doctor.",
    sources: ["R15"],
  },
  {
    id: "burns", group: "Other home remedies and myths", claim: "Put butter or toothpaste on a burn", name: "Butter, toothpaste or ice on a burn", verdict: "harmful",
    summary: "Fire and first-aid services agree: cool a minor burn under cool running water. Butter, toothpaste and creams do not cool it and can make things worse.",
    forPoints: [],
    againstPoints: [
      "British Red Cross: cool the burn under cold running water for at least 20 minutes, as soon as possible. Do not use ice, which can damage the skin.",
      "A children's hospital in New South Wales says creams do not cool a burn and must not replace cool running water.",
    ],
    official: ["We could not retrieve Health Canada or Canadian Paediatric Society pages on this, so the guidance shown is from UK and Australian sources."],
    howTo: {
      title: "What to do instead",
      ingredients: ["Cool running tap water"],
      steps: ["Hold the burn under cool (not iced) running water for about 20 minutes.", "Cover it loosely with a clean non-fluffy dressing."],
      store: [],
    },
    caution: "Large, deep, facial, or chemical burns, and any burn on a baby or young child, need urgent medical care.",
    sources: ["R18"],
  },
];

export const REMEDY_UNVERIFIED: string[] = [
  "Evidence comes from Cochrane abstracts and plain-language summaries, official pages, and news coverage of official pages. Full papers were not read, so numbers are the ones printed in those summaries.",
  "We could not retrieve the primary pages for Mayo Clinic (salt gargle amount), the CDC (nasal rinse water), Health Canada or the Canadian Paediatric Society (burns, honey dose). Those points rest on secondary reports and are marked in each entry.",
  "The honey dose for children comes from a Paediatrics & Child Health review seen only in a search summary. We could not confirm it is a Canadian Paediatric Society statement.",
  "We read the chicken-soup studies only through popular summaries. No clinical trial of soup shortening a cold turned up.",
  "We could not find a validated storage time for onion in honey. The 24-hour fridge rule and the 2 to 3 day rule for leftover ginger tea are our own cautious rules, and the entries say so.",
  "The folk claims here come from commonly repeated lists, not from a set of e-books or websites we reviewed. Many web pages making these claims cited studies we could not find, so we did not use them. If you have a specific book or page with claims you want checked, send it and we will test those claims the same way.",
  "These checks have not been reviewed by a doctor or pharmacist.",
];

export const REMEDY_SOURCES: Record<string, { title: string; publisher: string; url: string }> = {
  R1: { title: "Honey for acute cough in children (CD007094)", publisher: "Cochrane", url: "https://www.cochrane.org/evidence/CD007094" },
  R2: { title: "Vitamin C for preventing and treating the common cold (2013)", publisher: "Cochrane (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/23440782/" },
  R3: { title: "Zinc for the common cold (2013)", publisher: "Cochrane (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/23775705/" },
  R3b: { title: "Shortcomings in the Cochrane review on zinc for the common cold (2024)", publisher: "Frontiers in Medicine (PMC)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11521859/" },
  R4: { title: "Garlic for the common cold (CD006206)", publisher: "Cochrane", url: "https://www.cochrane.org/cd006206/ari_garlic-common-cold" },
  R5: { title: "Heated, humidified air for the common cold (2017)", publisher: "Cochrane (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/28849871/" },
  R7: { title: "Cost-effectiveness of gargling for the prevention of upper respiratory tract infections", publisher: "BMC Health Services Research", url: "https://link.springer.com/content/pdf/10.1186/1472-6963-8-258.pdf" },
  R8: { title: "Elderberry", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/elderberry" },
  R8b: { title: "Play it safe when preserving elderberries (EM 9446)", publisher: "Oregon State Extension", url: "https://extension.oregonstate.edu/catalog/em-9446-play-it-safe-when-preserving-elderberries" },
  R9: { title: "Echinacea for preventing and treating the common cold (CD000530)", publisher: "Cochrane", url: "https://www.cochrane.org/evidence/CD000530" },
  R10: { title: "Saline nasal irrigation for acute upper respiratory tract infections (2010)", publisher: "Cochrane (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/20238351/" },
  R11: { title: "Infant botulism", publisher: "Health Canada", url: "https://www.canada.ca/en/health-canada/services/food-safety-vulnerable-populations/infant-botulism.html" },
  R12: { title: "Infusing honey safely", publisher: "Oregon State Extension", url: "https://extension.oregonstate.edu/node/263701" },
  R13: { title: "Leftovers (Health Canada fact sheet, 2014)", publisher: "Health Canada", url: "https://www.canada.ca/content/dam/hc-sc/documents/services/food-nutrition/reports-publications/food-safety/06-04-2014_02-Leftovers-PIN-ENG.pdf" },
  R14: { title: "Ginger", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/ginger" },
  R15: { title: "Cranberries for preventing urinary tract infections (CD001321)", publisher: "Cochrane", url: "https://www.cochrane.org/CD001321/UTI_cranberry-for-preventing-urinary-tract-infections" },
  R16: { title: "Feed a Cold, Starve a Fever? The Truth about Medical Myths", publisher: "Johns Hopkins Medicine", url: "https://hopkinsmedicine.org/health/wellness-and-prevention/feed-a-cold-starve-a-fever" },
  R17: { title: "FactCheck: onions in socks", publisher: "AAP FactCheck", url: "https://www.aap.com.au/?p=122760" },
  R18: { title: "First aid for burns", publisher: "British Red Cross", url: "https://www.redcross.org.uk/first-aid/learn-first-aid-for-babies-and-children/burns" },
  R19: { title: "Paediatrics & Child Health review on honey for cough (PMC)", publisher: "Paediatrics & Child Health (PMC)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4934161" },
  R20: { title: "Does gargling salt water help a sore throat? (VERIFY fact-check)", publisher: "VERIFY", url: "https://www.cbs8.com/article/news/verify/health-verify/gargling-salt-water-sore-throat-home-remedy/536-ca497adc-dbcc-484f-bd01-6ec455e477e8" },
  R21: { title: "Neti pots, nasal-rinsing devices linked to potentially deadly amoeba (quotes CDC)", publisher: "KTVU (quoting CDC)", url: "https://www.ktvu.com/news/neti-pot-amoeba-nasal-rinsing-devices-tap-water-cdc" },
  R22: { title: "Does chicken soup help a cold? (summary of Saketkhoo 1978 and Rennard 2000)", publisher: "Parkview Health", url: "https://parkview.com/blog/does-chicken-soup-really-help" },
};
