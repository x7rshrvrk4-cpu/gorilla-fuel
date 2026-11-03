// "Painkiller myths": a viral list claims common foods and herbs work "exactly like" named drugs.
// Researched 2026-10-28. Every statement below traces to an official page or a PubMed abstract page; full papers
// were NOT read, so numbers are the ones printed in the abstracts. Wording is "associated with" / "supports":
// nothing here is a treatment claim, and no claim is made that any herb replaces a medicine.

export type MythVerdict = "supported_use" | "partly" | "mixed" | "not_supported" | "none_found";

export const MYTH_VERDICT_LABEL: Record<MythVerdict, string> = {
  supported_use: "Supported for a specific use",
  partly: "Partly supported",
  mixed: "Mixed evidence",
  not_supported: "Not supported",
  none_found: "No evidence found",
};
export const MYTH_VERDICT_HELP: Record<MythVerdict, string> = {
  supported_use: "human trials support a specific, narrower use than the viral claim",
  partly: "some human evidence for part of the claim",
  mixed: "trials or official bodies disagree",
  not_supported: "the claim is not backed by human evidence",
  none_found: "our searches found no human evidence for the claim",
};

export type Myth = {
  id: string;
  viral: string;
  name: string;
  verdict: MythVerdict;
  summary: string;
  headToHead: string;
  forPoints: string[];
  againstPoints: string[];
  official: string[];
  caution?: string;
  sources: string[];
};

export const MYTH_RULE =
  "How we judged: “works like drug X” counts as supported only if a human randomized trial compared the food or herb with that drug and found it as good. If nobody has made that comparison, the claim is “not shown”, however promising the herb. For each item we show the best evidence for, the best evidence against, and what the official bodies say, including where they disagree.";

export const MYTHS: Myth[] = [
  {
    id: "willow", viral: "White willow bark works like extra-strength aspirin", name: "White willow bark", verdict: "supported_use",
    summary: "The best-supported item on the viral list, for short-term low back pain. It is not shown to equal aspirin.",
    headToHead: "No trial against aspirin found. A trial against rofecoxib exists; the Cochrane review rates that comparison very low quality.",
    forPoints: [
      "Chrubasik 2000, 210 people with a low back pain flare, 4 weeks: pain-free in the last week were 39% on 240 mg salicin, 21% on 120 mg and 6% on placebo (p<0.001).",
      "Cochrane review 2014 (14 trials of herbal medicine for low back pain): willow bark reduces pain more than placebo, with evidence of moderate quality at best.",
    ],
    againstPoints: [
      "Short trials (4 weeks). The 2000 trial reported one severe allergic reaction, possibly to the extract.",
      "The Cochrane equivalence comparison with rofecoxib is rated very low quality, and no aspirin comparison was found.",
    ],
    official: [
      "EMA: well-established use of a dry extract for short-term lower back pain in adults, not beyond 4 weeks; traditional use for minor joint pain, headache and cold-related fever. Not for children or adolescents, or in the third trimester of pregnancy.",
      "Health Canada monograph: uses include short-term relief of lower back pain and minor joint pain due to osteoarthritis. Ask a practitioner beyond 6 weeks, and before use with asthma, peptic ulcer disease, blood thinners or products containing salicylates. Do not use if pregnant, breastfeeding or allergic to salicylates.",
    ],
    caution: "EMA lists these contraindications: salicylate or NSAID hypersensitivity, salicylate-sensitive asthma, active stomach ulcers, severe liver or kidney disease, clotting disorders. NCCIH notes the most common side effects are gastrointestinal and that using it with other salicylate-containing medicines increases the risks.",
    sources: ["X5", "X8", "X11", "P10936472", "P25536022"],
  },
  {
    id: "peppermint", viral: "Peppermint works like tramadol", name: "Peppermint oil", verdict: "supported_use",
    summary: "Real but narrow evidence for irritable bowel syndrome (IBS) cramping. It does not act like an opioid.",
    headToHead: "No comparison with tramadol or any opioid found. The benefit is for IBS, a different problem.",
    forPoints: [
      "2022 meta-analysis, 10 randomized trials, 1,030 patients: global IBS symptoms RR 0.65 (number needed to treat 4); abdominal pain RR 0.76 (number needed to treat 7) versus placebo.",
    ],
    againstPoints: [
      "The authors rate the evidence as very low certainty, and side effects were more frequent with peppermint oil (RR 1.57).",
    ],
    official: [
      "EMA: well-established use of the oil taken by mouth for minor abdominal spasms, flatulence and pain, especially in IBS, and applied to the forehead and temples for mild headache.",
    ],
    caution: "EMA: not for children under 8 (abdominal use) or under 18 (headache); do not use with low stomach acid, liver disease, gallstones or bile problems. NCCIH: avoid with GERD (reflux); heartburn is more likely if capsules are not enteric-coated. Memorial Sloan Kettering lists cyclosporine (levels rose in rats; one transplant patient's level fell) and felodipine (levels reported higher) as reasons to ask a doctor first. The EMA-reviewed form is the oil, not fresh mint leaf.",
    sources: ["N20", "X12", "M6", "P35942669"],
  },
  {
    id: "cayenne", viral: "Cayenne pepper works like ketoprofen", name: "Cayenne (capsaicin)", verdict: "partly",
    summary: "Capsaicin applied to the skin has trial evidence. Eating cayenne has not been tested in these reviews.",
    headToHead: "No comparison with ketoprofen found.",
    forPoints: [
      "Cochrane review 2014: cayenne (Capsicum frutescens) reduces back pain more than placebo, with moderate-quality evidence for chronic low back pain.",
      "Cochrane review 2017, 8 trials and 2,488 people using 8% capsaicin patches: more people had moderate or substantial pain relief than with control. In postherpetic neuralgia about 10% more were much improved at 8 and 12 weeks (number needed to treat 8.8 versus 7.0 for the active placebo).",
    ],
    againstPoints: [
      "The trials are of capsaicin applied to the skin. Dietary cayenne is not covered by either review.",
      "The 2017 review rates its evidence moderate to very low and says local skin reactions were common.",
    ],
    official: [],
    sources: ["P25536022", "P28085183"],
  },
  {
    id: "boswellia", viral: "Boswellia (frankincense) works like oxycodone", name: "Boswellia", verdict: "partly",
    summary: "Modest evidence for knee osteoarthritis pain. Nothing opioid-like.",
    headToHead: "No comparison with oxycodone or any opioid found.",
    forPoints: [
      "2020 meta-analysis, 7 randomized trials, 545 patients with osteoarthritis: pain scores were lower than controls (VAS mean difference −8.33; WOMAC pain −14.22). The authors say Boswellia “may be an effective and safe treatment option”.",
    ],
    againstPoints: [
      "Small trials; controls were placebo or “western medicine”, with no opioid among them. The abstract does not report adverse events.",
    ],
    official: ["Memorial Sloan Kettering: generally well tolerated, but boswellia extracts can inhibit platelet aggregation and may raise bleeding risk with blood thinners such as warfarin. It describes the osteoarthritis data as conflicting and says larger trials are needed. We did not read an EMA or NCCIH page for Boswellia."],
    caution: "Ask a doctor or pharmacist before using it with warfarin or other blood thinners.",
    sources: ["M3", "P32680575"],
  },
  {
    id: "ginger", viral: "Ginger works like ibuprofen", name: "Ginger", verdict: "mixed",
    summary: "One small dental trial found ginger no different from ibuprofen. An osteoarthritis trial found ibuprofen better. The official bodies disagree on motion sickness.",
    headToHead: "Two head-to-head trials with opposite results (below).",
    forPoints: [
      "Rayati 2017, 67 randomized adults after third-molar surgery: pain scores showed no significant difference between ginger and ibuprofen on any day, and the placebo group needed more rescue medicine.",
      "NCCIH: ginger supplements might help knee osteoarthritis symptoms and menstrual cramps, and may help nausea in pregnancy.",
    ],
    againstPoints: [
      "Bliddal 2000, hip or knee osteoarthritis, crossover: ibuprofen was better than ginger extract, which was better than placebo; across the whole study there was no significant difference between ginger and placebo.",
      "NCCIH: ginger applied to the skin has not been shown to help knee osteoarthritis, and some ginger studies are not high quality.",
    ],
    official: [
      "EMA: well-established use for preventing motion-sickness nausea; traditional use only for minor joint pain (not beyond 4 weeks). Not for pregnancy or breastfeeding.",
      "NCCIH (Feb 2025) disagrees on motion sickness: it says most studies have not shown benefit.",
    ],
    caution: "Memorial Sloan Kettering: ginger supplements may raise bleeding risk with warfarin or other blood thinners (it calls the evidence inconclusive), may lower blood sugar further with diabetes drugs, and should be stopped 2 weeks before surgery. EMA and Memorial Sloan Kettering advise avoiding it in pregnancy and breastfeeding.",
    sources: ["X7", "X1", "M1", "P28348610", "P10607493"],
  },
  {
    id: "turmeric", viral: "Turmeric works like aspirin; curcumin works like hydrocodone", name: "Turmeric and curcumin", verdict: "mixed",
    summary: "Some trials favour curcumin over anti-inflammatory drugs in knee osteoarthritis, but the reviews are rated extremely low quality. No aspirin or opioid comparison exists.",
    headToHead: "No trial against aspirin or hydrocodone found. Trials against anti-inflammatory drugs (NSAIDs) exist for knee osteoarthritis.",
    forPoints: [
      "Hsiao 2021 meta-analysis, 11 randomized trials, 1,258 people with knee osteoarthritis: curcuminoids were associated with better pain relief than NSAIDs on the visual analogue scale. NSAID groups had more side effects in all three trials that reported them, significant in one.",
      "NCCIH (April 2025): the initial evidence for oral turmeric or curcumin in knee osteoarthritis is positive.",
    ],
    againstPoints: [
      "Chen 2026, an overview of 7 systematic reviews, rated them “extremely low methodological quality”; 37 of 48 outcomes were extremely low-quality evidence. The authors say the evidence is not yet reliable enough to support clinical practice.",
      "NCCIH: not enough is known to conclude turmeric helps any condition, and liver damage has been reported with highly bioavailable formulations.",
    ],
    official: ["EMA: traditional use only, for mild digestive problems."],
    caution: "NCCIH: stop use and contact a provider for symptoms such as dark urine or jaundice. Turmeric supplements may be unsafe in pregnancy. Memorial Sloan Kettering: turmeric may raise bleeding risk, so avoid combining it with warfarin or other blood thinners, and it may lessen the effect of some chemotherapy drugs (camptothecin, mechlorethamine, doxorubicin, cyclophosphamide).",
    sources: ["N21", "X2", "M2", "P34537344", "P41560742"],
  },
  {
    id: "pineapple", viral: "Pineapple works like celecoxib", name: "Pineapple (bromelain)", verdict: "mixed",
    summary: "Bromelain capsules matched diclofenac in dental-pain trials, but those are supplements, not the fruit, and celecoxib was not tested.",
    headToHead: "Two trials against diclofenac (not celecoxib), both using bromelain capsules after dental procedures.",
    forPoints: [
      "Sherin 2024, 100 patients after root canal therapy: 200 mg bromelain versus 50 mg diclofenac. The authors report the same pain relief after 12 hours with fewer side effects; diclofenac was better at 6 hours.",
      "Majid 2014, 45 patients after third-molar surgery: bromelain and diclofenac both reduced pain versus placebo.",
    ],
    againstPoints: [
      "Both trials used bromelain supplements. Nothing here shows eating pineapple has the same effect.",
      "In the 2014 trial diclofenac reduced swelling significantly and bromelain did not. Small dental trials only; no celecoxib comparison.",
    ],
    official: [],
    sources: ["P39569246", "P24589242"],
  },
  {
    id: "valerian", viral: "Valerian root works like diazepam", name: "Valerian root", verdict: "not_supported",
    summary: "The “like diazepam” claim is not supported. Whether valerian helps sleep at all is disputed.",
    headToHead: "No comparison with diazepam or any benzodiazepine found.",
    forPoints: [
      "Bent 2006, 16 studies and 1,093 patients: valerian “might improve sleep quality” (RR 1.8), but with publication bias and methodological problems.",
      "EMA: well-established use of the ethanolic extract for mild nervous tension and sleep disorders.",
    ],
    againstPoints: [
      "Valente 2024 umbrella review: “no evidence of efficacy” for insomnia; it may improve subjective sleep quality but this was not shown with objective measures.",
      "NCCIH (May 2025): the evidence is inconsistent, and the American Academy of Sleep Medicine recommended against valerian for chronic insomnia in adults.",
      "Memorial Sloan Kettering: in several trials valerian's sleep effect was not better than placebo.",
    ],
    official: [
      "EMA and NCCIH disagree, so both are shown. Health Canada lists it as a sleep aid and a calmative (traditional use).",
    ],
    caution: "Do not take with alcohol, sedatives or products that cause drowsiness (NCCIH, Health Canada). Memorial Sloan Kettering: valerian lengthens the sedation from sedating drugs, an animal study and a case report suggest it may add to diazepam-type effects, and people with liver disease should avoid it (case reports of liver injury). EMA: not for children under 12, pregnancy or breastfeeding. Stopping abruptly after chronic use may cause withdrawal symptoms such as insomnia (NCCIH).",
    sources: ["X6", "X3", "X9", "M4", "P17145239", "P38359657"],
  },
  {
    id: "ashwagandha", viral: "Ashwagandha works like prednisone", name: "Ashwagandha", verdict: "not_supported",
    summary: "No steroid-like or anti-inflammatory equivalence has been shown. It may also interact with medicines.",
    headToHead: "No comparison with prednisone or any steroid found.",
    forPoints: [
      "2021 meta-analysis, 5 randomized trials and 400 adults: a small benefit for sleep (SMD −0.59); no serious side effects reported, though safety data are limited.",
      "NCCIH: some preparations may help insomnia and stress.",
    ],
    againstPoints: [
      "Neither the NCCIH page nor the Health Canada monograph describes a steroid-like effect. Health Canada’s listed uses are traditional ones (general debility, adaptogen).",
      "NCCIH: rare liver injury has been linked to supplements; not recommended with autoimmune or thyroid disorders; avoid in pregnancy and before surgery.",
    ],
    official: [
      "NCCIH (March 2023) says it might interact with immunosuppressants, diabetes and blood-pressure drugs, sedatives, anticonvulsants and thyroid hormones. It does not name steroids specifically.",
    ],
    caution: "Prednisone is an immune-suppressing medicine, so ask a pharmacist or doctor before combining it with ashwagandha. Memorial Sloan Kettering adds: avoid with benzodiazepines, anticonvulsants or barbiturates; it may increase drowsiness; it may trigger or worsen autoimmune disease; thyrotoxicosis and higher thyroxine levels have been reported; and one case report describes adrenal (HPA axis) suppression after prolonged use that needed hydrocortisone.",
    sources: ["X4", "X10", "M5", "P34559859"],
  },
  {
    id: "cloves", viral: "Cloves work like morphine", name: "Cloves", verdict: "not_supported",
    summary: "Clove gel can numb the mouth surface. That is not systemic pain relief, and no human trial compares cloves with morphine.",
    headToHead: "No human trial against morphine found.",
    forPoints: [
      "Alqareer 2006, 73 adults: clove gel and 20% benzocaine gel both reduced needle-stick pain on the gum compared with placebo, with no significant difference between them.",
    ],
    againstPoints: [
      "That is a surface numbing effect before an injection, not pain relief throughout the body.",
      "The eugenol and clove-oil pain studies we found were in mice or rats; none of the abstracts we read compared clove with morphine in people.",
    ],
    official: ["EMA has a clove oil monograph (mouth and throat disorders), but its public summary page gave no usable indication or safety details."],
    caution: "Do not swallow clove oil. MedlinePlus lists liver failure among the overdose effects of eugenol oil, especially in children, with serious effects from as little as 10 mL in adults and less in children.",
    sources: ["M10", "P16530911"],
  },
  {
    id: "cherry", viral: "Tart cherries work like acetaminophen", name: "Tart cherries", verdict: "not_supported",
    summary: "Studied for exercise recovery, not as a painkiller. The latest meta-analysis found no effect on muscle soreness.",
    headToHead: "No comparison with acetaminophen found.",
    forPoints: [
      "2026 meta-analysis of 19 trials in athletes: tart cherry juice improved recovery of maximal voluntary contraction and some inflammatory markers.",
    ],
    againstPoints: [
      "Same review: “no significant pooled effects” on muscle soreness; results varied widely between trials and certainty was low to moderate.",
    ],
    official: [],
    sources: ["P41945263"],
  },
  {
    id: "flax", viral: "Flax seeds work like naproxen", name: "Flax seeds", verdict: "none_found",
    summary: "Some effect on blood markers of inflammation, but no pain evidence and no naproxen comparison.",
    headToHead: "No comparison with naproxen found.",
    forPoints: [
      "Askarpour 2020, 40 randomized trials and 2,520 people: flaxseed was associated with lower C-reactive protein, interleukin-6 and VCAM-1.",
      "Tamtaji 2020, flaxseed oil in metabolic syndrome: interleukin-6 decreased.",
    ],
    againstPoints: [
      "TNF-alpha, ICAM-1 and E-selectin did not change significantly, and the authors call for better-designed trials. No pain outcome was reported.",
    ],
    official: [],
    sources: ["P31739218", "P33183549"],
  },
  {
    id: "garlic", viral: "Garlic works like diclofenac", name: "Garlic", verdict: "mixed",
    summary: "Small studies in arthritis point both ways. No comparison with diclofenac.",
    headToHead: "No comparison with diclofenac found.",
    forPoints: [
      "2025 systematic review of 4 studies and 176 patients (3 rheumatoid arthritis, 1 osteoarthritis): all reported improvements in pain and function, and the authors call garlic extract safe and well tolerated.",
    ],
    againstPoints: [
      "2018 trial, 76 women with knee osteoarthritis, 12 weeks: no significant difference from placebo in WOMAC pain, function or total score; stiffness was lower with garlic (1.4 vs 2.5, p=0.023).",
    ],
    official: ["EMA draft monograph (2016): use with caution with oral anticoagulants or antiplatelets, which may increase bleeding time.", "Memorial Sloan Kettering: ask a doctor before garlic supplements if you take warfarin or other blood thinners; stop 1-2 weeks before surgery (patient guidance) or at least 7 days before (clinician guidance); garlic lowered saquinavir levels by about 54% at peak and 49% at trough."],
    sources: ["N22", "M7", "P40602379", "P29790635"],
  },
  {
    id: "papaya", viral: "Papaya works like codeine", name: "Papaya", verdict: "none_found",
    summary: "We found no human evidence of pain relief or any opioid-like effect from papaya.",
    headToHead: "No comparison with codeine found.",
    forPoints: [],
    againstPoints: [
      "A PubMed search for papaya or papain with analgesic effects returned studies on cancer, dengue, platelets and cosmetics safety, none showing pain relief or an opioid-like effect.",
    ],
    official: [],
    sources: [],
  },
  {
    id: "aloe", viral: "Aloe vera works like ibuprofen gel", name: "Aloe vera", verdict: "none_found",
    summary: "Aloe’s evidence is for burns and wounds. We found no comparison with an anti-inflammatory gel.",
    headToHead: "No comparison with ibuprofen gel or any topical NSAID found.",
    forPoints: [],
    againstPoints: [
      "A 2024 meta-analysis of 9 randomized trials of aloe vera for burns found its analgesic effects uncertain.",
      "A PubMed search for aloe vera against topical diclofenac or ibuprofen turned up no such comparison.",
    ],
    official: [],
    sources: ["P38605441"],
  },
];

export const MYTH_UNVERIFIED: string[] = [
  "Evidence was read from official pages and PubMed abstract pages. Full papers were not read, so numbers are the ones printed in the abstracts.",
  "Health Canada monographs were read for willow bark, valerian and ashwagandha. We could not retrieve usable monograph text for ginger, peppermint, Boswellia or turmeric.",
  "Where EMA and NCCIH disagree (ginger and motion sickness; valerian), both positions are shown rather than choosing one.",
  "Interaction wording was cross-checked against NCCIH, Memorial Sloan Kettering's About Herbs pages, Health Canada monographs, EMA and MedlinePlus, and where they differ we show the more cautious statement. It has not been reviewed by a pharmacist or clinician. Treat it as general information.",
  "Several searches had limited results (papaya, aloe vera, garlic). “No evidence found” means our searches found none, not that none exists.",
];

export const MYTH_SOURCES: Record<string, { title: string; publisher: string; url: string }> = {
  X1: { title: "NCCIH: Ginger (last updated February 2025)", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/ginger" },
  X2: { title: "NCCIH: Turmeric (last updated April 2025)", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/turmeric" },
  X3: { title: "NCCIH: Valerian (last updated May 2025)", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/valerian" },
  X4: { title: "NCCIH: Ashwagandha (last updated March 2023)", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/ashwagandha" },
  X5: { title: "EMA herbal medicine summary: Salicis cortex (willow bark)", publisher: "European Medicines Agency", url: "https://www.ema.europa.eu/en/medicines/herbal/salicis-cortex" },
  X6: { title: "EMA herbal medicine summary: Valerianae radix (valerian root)", publisher: "European Medicines Agency", url: "https://www.ema.europa.eu/en/medicines/herbal/valerianae-radix" },
  X7: { title: "EMA herbal medicine summary: Zingiberis rhizoma (ginger)", publisher: "European Medicines Agency", url: "https://www.ema.europa.eu/en/medicines/herbal/zingiberis-rhizoma" },
  X8: { title: "Health Canada NHP monograph: Willow bark", publisher: "Health Canada", url: "https://webprod.hc-sc.gc.ca/nhpid-bdipsn/atReq?atid=white.wil.saule.bla&lang=eng" },
  X9: { title: "Health Canada NHP monograph: Valerian", publisher: "Health Canada", url: "https://webprod.hc-sc.gc.ca/nhpid-bdipsn/atReq?atid=valerian2&lang=eng" },
  X10: { title: "Health Canada NHP monograph: Ashwagandha", publisher: "Health Canada", url: "https://webprod.hc-sc.gc.ca/nhpid-bdipsn/atReq?atid=ashwagandha2&lang=eng" },
  X11: { title: "NCCIH: Nutritional Approaches for Musculoskeletal Pain and Inflammation: What the Science Says", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/providers/digest/nutritional-approaches-for-musculoskeletal-pain-and-inflammation-science" },
  X12: { title: "NCCIH: Peppermint Oil: Usefulness and Safety", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/peppermint-oil" },
  M1: { title: "Memorial Sloan Kettering About Herbs: Ginger", publisher: "Memorial Sloan Kettering", url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/ginger" },
  M2: { title: "Memorial Sloan Kettering About Herbs: Turmeric", publisher: "Memorial Sloan Kettering", url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/turmeric" },
  M3: { title: "Memorial Sloan Kettering About Herbs: Boswellia", publisher: "Memorial Sloan Kettering", url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/boswellia" },
  M4: { title: "Memorial Sloan Kettering About Herbs: Valerian", publisher: "Memorial Sloan Kettering", url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/valerian" },
  M5: { title: "Memorial Sloan Kettering About Herbs: Ashwagandha", publisher: "Memorial Sloan Kettering", url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/ashwagandha" },
  M6: { title: "Memorial Sloan Kettering About Herbs: Peppermint", publisher: "Memorial Sloan Kettering", url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/peppermint" },
  M7: { title: "Memorial Sloan Kettering About Herbs: Garlic", publisher: "Memorial Sloan Kettering", url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/garlic" },
  M10: { title: "MedlinePlus: Eugenol oil overdose", publisher: "MedlinePlus (NLM)", url: "https://www.medlineplus.gov/ency/article/002647.htm" },
  P10936472: { title: "Chrubasik S et al. Treatment of low back pain exacerbations with willow bark extract: a randomized double-blind study. Am J Med 2000", publisher: "PubMed: Chrubasik 2000", url: "https://pubmed.ncbi.nlm.nih.gov/10936472/" },
  P25536022: { title: "Oltean H et al. Herbal medicine for low-back pain. Cochrane Database Syst Rev 2014", publisher: "PubMed: Cochrane 2014", url: "https://pubmed.ncbi.nlm.nih.gov/25536022/" },
  P35942669: { title: "Systematic review and meta-analysis: efficacy of peppermint oil in irritable bowel syndrome. Aliment Pharmacol Ther 2022", publisher: "PubMed: peppermint meta-analysis 2022", url: "https://pubmed.ncbi.nlm.nih.gov/35942669/" },
  P28085183: { title: "Derry S et al. Topical capsaicin (high concentration) for chronic neuropathic pain in adults. Cochrane Database Syst Rev 2017", publisher: "PubMed: Cochrane 2017", url: "https://pubmed.ncbi.nlm.nih.gov/28085183/" },
  P32680575: { title: "Effectiveness of Boswellia and Boswellia extract for osteoarthritis patients: a systematic review and meta-analysis. BMC Complement Med Ther 2020", publisher: "PubMed: Boswellia meta-analysis 2020", url: "https://pubmed.ncbi.nlm.nih.gov/32680575/" },
  P28348610: { title: "Rayati F et al. Comparison of anti-inflammatory and analgesic effects of ginger powder and ibuprofen in postsurgical pain model. Dent Res J 2017", publisher: "PubMed: Rayati 2017", url: "https://pubmed.ncbi.nlm.nih.gov/28348610/" },
  P10607493: { title: "Bliddal H et al. A randomized, placebo-controlled, cross-over study of ginger extracts and ibuprofen in osteoarthritis. Osteoarthritis Cartilage 2000", publisher: "PubMed: Bliddal 2000", url: "https://pubmed.ncbi.nlm.nih.gov/10607493/" },
  P34537344: { title: "Hsiao AF et al. The efficacy of high- and low-dose curcumin in knee osteoarthritis: a systematic review and meta-analysis. Complement Ther Med 2021", publisher: "PubMed: Hsiao 2021", url: "https://pubmed.ncbi.nlm.nih.gov/34537344/" },
  P41560742: { title: "Chen J et al. A critical review of systematic reviews and meta-analyses of curcumin for knee osteoarthritis. Front Pharmacol 2026", publisher: "PubMed: Chen 2026", url: "https://pubmed.ncbi.nlm.nih.gov/41560742/" },
  P39569246: { title: "Comparison of bromelain and diclofenac in the management of postoperative pain after root canal therapy: a randomized controlled trial. Cureus 2024", publisher: "PubMed: Sherin 2024", url: "https://pubmed.ncbi.nlm.nih.gov/39569246/" },
  P24589242: { title: "Majid OW, Al-Mashhadani BA. Perioperative bromelain reduces pain and swelling and improves quality of life measures after mandibular third molar surgery. J Oral Maxillofac Surg 2014", publisher: "PubMed: Majid 2014", url: "https://pubmed.ncbi.nlm.nih.gov/24589242/" },
  P17145239: { title: "Bent S et al. Valerian for sleep: a systematic review and meta-analysis. Am J Med 2006", publisher: "PubMed: Bent 2006", url: "https://pubmed.ncbi.nlm.nih.gov/17145239/" },
  P38359657: { title: "Valente V et al. Does valerian work for insomnia? An umbrella review of the evidence. Eur Neuropsychopharmacol 2024", publisher: "PubMed: Valente 2024", url: "https://pubmed.ncbi.nlm.nih.gov/38359657/" },
  P34559859: { title: "Effect of ashwagandha (Withania somnifera) extract on sleep: a systematic review and meta-analysis. PLoS One 2021", publisher: "PubMed: ashwagandha sleep 2021", url: "https://pubmed.ncbi.nlm.nih.gov/34559859/" },
  P16530911: { title: "Alqareer A et al. The effect of clove and benzocaine versus placebo as topical anesthetics. J Dent 2006", publisher: "PubMed: Alqareer 2006", url: "https://pubmed.ncbi.nlm.nih.gov/16530911/" },
  P41945263: { title: "Daab W et al. Effects of tart cherry juice supplementation on recovery from exercise-induced muscle damage in athletes: a systematic review and meta-analysis. Sports Med Open 2026", publisher: "PubMed: Daab 2026", url: "https://pubmed.ncbi.nlm.nih.gov/41945263/" },
  P31739218: { title: "Askarpour M et al. Effect of flaxseed supplementation on markers of inflammation and endothelial function: a systematic review and meta-analysis. Cytokine 2020", publisher: "PubMed: Askarpour 2020", url: "https://pubmed.ncbi.nlm.nih.gov/31739218/" },
  P33183549: { title: "Tamtaji OR et al. Flaxseed oil and markers of inflammation and oxidative stress in metabolic syndrome: a systematic review and meta-analysis. Clin Nutr ESPEN 2020", publisher: "PubMed: Tamtaji 2020", url: "https://pubmed.ncbi.nlm.nih.gov/33183549/" },
  P40602379: { title: "Garlic extract in rheumatological diseases: a systematic review. Complement Med Res 2025", publisher: "PubMed: garlic review 2025", url: "https://pubmed.ncbi.nlm.nih.gov/40602379/" },
  P29790635: { title: "The effect of 12-week garlic supplementation on symptom relief in overweight or obese women with knee osteoarthritis. Int J Clin Pract 2018", publisher: "PubMed: garlic trial 2018", url: "https://pubmed.ncbi.nlm.nih.gov/29790635/" },
  P38605441: { title: "Effects of Aloe vera on burn injuries: a systematic review and meta-analysis of randomized controlled trials. J Burn Care Res 2024", publisher: "PubMed: aloe burns 2024", url: "https://pubmed.ncbi.nlm.nih.gov/38605441/" },
};
