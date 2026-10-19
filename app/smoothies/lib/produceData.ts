// Generated from the 2026-10-18 produce/smoothie research dataset.
// Per-100 g values are Canadian Nutrient File (Health Canada) where matched; recipe per-serving values are recomputed from them.
// Sugar flag rule (our own convention): HIGH >= 20 g, moderate 12-19.9 g, low < 12 g per serving.
export type Produce = {
  id: string; name: string; category: string;
  per100: { kcal: number; protein: number; sugar: number | null; fibre: number };
  nutrients: string; research: string; evidence: string; notes: string; forms: string;
  cautions: string[]; sources: string[]; dataSource: string;
};
export type DrinkIngredient = { id: string; name: string; grams: number; household: string };
export type Drink = {
  id: string; name: string; type: "smoothie" | "juice";
  ingredients: DrinkIngredient[]; method: string; flavour: string; nutrition: string;
  perServing: { kcal: number; protein: number; sugar: number; fibre: number | null; wholeProduceFibre: number | null; grams: number };
  sugarFlag: "low" | "moderate" | "high"; tags: string[]; vegan: boolean; dairyFree: boolean;
  contains: string[]; cautions: string[]; sources: string[];
};
export type Source = { title: string; publisher: string; url: string };

export const PRODUCE: Produce[] = [
 {
  "id": "blueberries",
  "name": "Blueberries",
  "category": "Berries",
  "per100": {
   "kcal": 57,
   "protein": 0.7,
   "sugar": 10,
   "fibre": 2.6
  },
  "nutrients": "Fibre 2.4 g, vitamin K 19.3 ug, manganese 0.34 mg, vitamin C 9.7 mg per 100 g. Anthocyanins are what blueberries are known for, but FDC does not quantify them.",
  "research": "A 12-study systematic review of RCTs found 8 reported improvement in some cognitive measures (mainly memory); the authors called it promising but not conclusive.",
  "evidence": "preliminary",
  "notes": "Moderate sugar (about 10 g/100 g). Vitamin K is moderate, not high.",
  "forms": "Whole, blended. Frozen is a fine, cheaper choice (vitamins comparable in frozen produce; polyphenols were not tested). Juicing removes the fibre.",
  "cautions": [],
  "sources": [
   "S1",
   "S14",
   "S21"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "strawberries",
  "name": "Strawberries",
  "category": "Berries",
  "per100": {
   "kcal": 33,
   "protein": 0.7,
   "sugar": 4.9,
   "fibre": 2.2
  },
  "nutrients": "Vitamin C 58.8 mg, manganese 0.39 mg, folate 24 ug, fibre 2.0 g per 100 g.",
  "research": "No food-specific trial evidence reviewed; useful as a low-sugar, vitamin C-rich fruit. Vitamin C helps absorb plant (nonheme) iron when eaten with iron-containing foods (NIH ODS).",
  "evidence": "established nutrient role; no food-level outcome trial reviewed",
  "notes": "One of the lowest-sugar fruits (4.9 g/100 g).",
  "forms": "Whole, blended; frozen is fine. Juicing removes fibre.",
  "cautions": [],
  "sources": [
   "S1",
   "S4",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "raspberries",
  "name": "Raspberries",
  "category": "Berries",
  "per100": {
   "kcal": 53,
   "protein": 1.2,
   "sugar": 4.4,
   "fibre": 6.5
  },
  "nutrients": "Fibre 6.5 g per 100 g (highest of the common berries here), low sugar.",
  "research": "No food-specific outcome trials reviewed; valuable mainly as a high-fibre, low-sugar fruit.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Sugar shown as 2.7 g (Foundation) and 4.4 g (SR Legacy) in the source; the higher value is used.",
  "forms": "Whole, blended; frozen is fine. Seeds stay in a smoothie (fibre).",
  "cautions": [],
  "sources": [
   "S1",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "blackberries",
  "name": "Blackberries",
  "category": "Berries",
  "per100": {
   "kcal": 43,
   "protein": 1.4,
   "sugar": 4.9,
   "fibre": 5.3
  },
  "nutrients": "Fibre 5.3 g, vitamin K 19.8 ug, manganese 0.65 mg, vitamin C 21 mg per 100 g.",
  "research": "No food-specific outcome trials reviewed; a high-fibre, low-sugar berry.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Low sugar.",
  "forms": "Whole, blended; frozen is fine.",
  "cautions": [],
  "sources": [
   "S1",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "cranberries",
  "name": "Cranberries (fresh)",
  "category": "Berries",
  "per100": {
   "kcal": 46,
   "protein": 0.4,
   "sugar": 4,
   "fibre": 4.6
  },
  "nutrients": "Fibre 3.6 g, vitamin C 14 mg, manganese 0.27 mg per 100 g; very tart and low in sugar.",
  "research": "Cochrane 2023 (50 studies, 8,857 people): cranberry products can help prevent urinary tract infections in women with recurrent UTIs, in children, and after bladder procedures; evidence is inconclusive for other groups. Those trials used juice, capsules and other products, so a smoothie portion is not equivalent.",
  "evidence": "moderate (for UTI prevention in specific groups, using cranberry products)",
  "notes": "Fresh cranberries are tart; sweetened cranberry juice cocktail adds a lot of sugar (not scored here).",
  "forms": "Whole fresh or frozen, blended with sweeter fruit. Avoid sweetened juice cocktails.",
  "cautions": [
   "Warfarin: one small study (16 healthy people, single dose) found no change in warfarin clearance from cranberry juice; broader evidence was not verified, so ask your prescriber if you take warfarin."
  ],
  "sources": [
   "S1",
   "S9",
   "S28"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "cherries",
  "name": "Sweet cherries",
  "category": "Berries",
  "per100": {
   "kcal": 63,
   "protein": 1.1,
   "sugar": 12.8,
   "fibre": 2.1
  },
  "nutrients": "Potassium 222 mg, vitamin C 7 mg, fibre 2.1 g per 100 g.",
  "research": "The recovery research is on TART cherry juice and supplements (14 studies: small improvements in soreness and strength recovery). Sweet cherries were not what was tested, so no claim is made for them.",
  "evidence": "preliminary (tart cherry products); none reviewed for sweet cherries",
  "notes": "Higher sugar (12.8 g/100 g).",
  "forms": "Whole, pitted, blended; frozen is fine.",
  "cautions": [],
  "sources": [
   "S1",
   "S13"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "orange",
  "name": "Oranges",
  "category": "Citrus",
  "per100": {
   "kcal": 47,
   "protein": 0.9,
   "sugar": 9.4,
   "fibre": 1.8
  },
  "nutrients": "Vitamin C 53.2 mg, folate 30 ug, potassium 181 mg, fibre 2.4 g per 100 g.",
  "research": "Vitamin C increases absorption of nonheme (plant) iron (NIH ODS), which is why oranges pair well with spinach or legumes. Juiced orange loses fibre, and Canada's Food Guide advises whole fruit over juice.",
  "evidence": "strong for the vitamin C-iron absorption mechanism; no food-level outcome trial reviewed",
  "notes": "Moderate sugar (9.4 g/100 g).",
  "forms": "Whole segments blended (pith adds fibre). Juicing removes fibre.",
  "cautions": [],
  "sources": [
   "S1",
   "S4",
   "S7"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "lemon",
  "name": "Lemons (flesh, no peel)",
  "category": "Citrus",
  "per100": {
   "kcal": 29,
   "protein": 1.1,
   "sugar": 2.5,
   "fibre": 2.8
  },
  "nutrients": "Vitamin C 53 mg, fibre 2.8 g, potassium 138 mg per 100 g; used in small amounts for acidity.",
  "research": "Adds vitamin C that supports plant-iron absorption in the same drink (NIH ODS). Amounts used are small, so the nutrient contribution is modest.",
  "evidence": "strong for the mechanism; small amounts",
  "notes": "Very low sugar.",
  "forms": "Peeled flesh blended, or juice squeezed in.",
  "cautions": [],
  "sources": [
   "S1",
   "S4"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "lime",
  "name": "Limes",
  "category": "Citrus",
  "per100": {
   "kcal": 30,
   "protein": 0.7,
   "sugar": 1.7,
   "fibre": 2.8
  },
  "nutrients": "Vitamin C 29.1 mg, potassium 102 mg, fibre 2.8 g per 100 g.",
  "research": "Flavour and a little vitamin C; no outcome evidence reviewed.",
  "evidence": "no outcome evidence reviewed",
  "notes": "Very low sugar.",
  "forms": "Juice squeezed in, or peeled flesh.",
  "cautions": [
   "Medication note: Health Canada says lemons, limes, sweet oranges and tangerines are generally not thought to interact like grapefruit, but a 2012 CMAJ review (as reported by CBC) lists limes among citrus that can. Ask a pharmacist if you take a medicine with a grapefruit warning."
  ],
  "sources": [
   "S1",
   "S3",
   "S29"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "grapefruit",
  "name": "Grapefruit (pink/red)",
  "category": "Citrus",
  "per100": {
   "kcal": 42,
   "protein": 0.8,
   "sugar": 6.9,
   "fibre": 1.6
  },
  "nutrients": "Vitamin C 31.2 mg, lycopene 1,419 ug (pink/red), vitamin A 58 ug RAE per 100 g.",
  "research": "No benefit claim is made. The important evidence is the drug interaction: Health Canada says grapefruit and its juice, fresh or frozen, can change how some medicines work for three days or more, so separating the juice and the dose does not avoid it.",
  "evidence": "strong (for drug-interaction risk)",
  "notes": "Lower sugar than most citrus (6.9 g/100 g).",
  "forms": "Whole flesh blended.",
  "cautions": [
   "Grapefruit can interact with many prescription drugs (for example, some used for blood pressure, cholesterol and heart rhythm). Check labels and ask your doctor or pharmacist before using. Seville oranges and tangelos may also interfere (Health Canada)."
  ],
  "sources": [
   "S1",
   "S3",
   "S29"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "mandarin",
  "name": "Mandarins / tangerines",
  "category": "Citrus",
  "per100": {
   "kcal": 53,
   "protein": 0.8,
   "sugar": 10.6,
   "fibre": 1.8
  },
  "nutrients": "Vitamin C 26.7 mg, potassium 166 mg, folate 16 ug per 100 g.",
  "research": "No outcome evidence reviewed beyond general fruit intake.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Higher sugar (10.6 g/100 g).",
  "forms": "Whole segments; juicing removes fibre.",
  "cautions": [],
  "sources": [
   "S1",
   "S3",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "apple",
  "name": "Apples (with skin)",
  "category": "Pome & stone fruit",
  "per100": {
   "kcal": 52,
   "protein": 0.3,
   "sugar": 10.4,
   "fibre": 1.9
  },
  "nutrients": "Fibre 2.4 g, potassium 100 mg, vitamin K 1.8 ug per 100 g.",
  "research": "Mainly a fibre source with sweet flavour; no food-specific outcome trials reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Moderate-high sugar (10 g/100 g). The source entry is golden delicious; other varieties differ somewhat.",
  "forms": "Whole with skin, blended. Juicing removes fibre.",
  "cautions": [],
  "sources": [
   "S1",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "pear",
  "name": "Pears",
  "category": "Pome & stone fruit",
  "per100": {
   "kcal": 57,
   "protein": 0.4,
   "sugar": 9.8,
   "fibre": 3
  },
  "nutrients": "Fibre 3.1 g, potassium 116 mg, vitamin C 4.3 mg per 100 g.",
  "research": "A good fibre-for-sugar fruit; no food-specific outcome trials reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Moderate sugar (9.8 g/100 g).",
  "forms": "Whole with skin, blended.",
  "cautions": [],
  "sources": [
   "S1",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "peach",
  "name": "Peaches (yellow)",
  "category": "Pome & stone fruit",
  "per100": {
   "kcal": 39,
   "protein": 0.9,
   "sugar": 8.4,
   "fibre": 1.9
  },
  "nutrients": "Vitamin C 6.6 mg, potassium 190 mg, vitamin A 16 ug RAE per 100 g.",
  "research": "No outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Moderate sugar.",
  "forms": "Whole, blended; frozen slices are fine.",
  "cautions": [],
  "sources": [
   "S1",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "plum",
  "name": "Plums",
  "category": "Pome & stone fruit",
  "per100": {
   "kcal": 46,
   "protein": 0.7,
   "sugar": 9.9,
   "fibre": 1.6
  },
  "nutrients": "Vitamin K 6.4 ug, vitamin C 9.5 mg, potassium 157 mg per 100 g.",
  "research": "No outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Moderate sugar.",
  "forms": "Whole, blended.",
  "cautions": [],
  "sources": [
   "S1",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "apricot",
  "name": "Apricots",
  "category": "Pome & stone fruit",
  "per100": {
   "kcal": 48,
   "protein": 1.4,
   "sugar": 9.2,
   "fibre": 2
  },
  "nutrients": "Vitamin A 96 ug RAE, vitamin C 10 mg, potassium 259 mg per 100 g.",
  "research": "No outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Moderate sugar. Dried apricots are far more concentrated (not scored).",
  "forms": "Whole, blended.",
  "cautions": [],
  "sources": [
   "S1",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "grapes",
  "name": "Grapes (red/green)",
  "category": "Pome & stone fruit",
  "per100": {
   "kcal": 69,
   "protein": 0.7,
   "sugar": 15.5,
   "fibre": 1.2
  },
  "nutrients": "Vitamin K 14.6 ug, potassium 191 mg, vitamin C 3.2 mg per 100 g; low fibre.",
  "research": "No outcome evidence reviewed. Highest sugar and lowest fibre of the common fruits here.",
  "evidence": "general fruit/veg evidence only",
  "notes": "HIGH sugar (15.5 g/100 g) with little fibre: easy to overdo in juice or smoothies.",
  "forms": "Small amounts, whole. Avoid juicing.",
  "cautions": [],
  "sources": [
   "S1",
   "S6",
   "S7"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "kiwi",
  "name": "Kiwifruit (green)",
  "category": "Pome & stone fruit",
  "per100": {
   "kcal": 61,
   "protein": 1.1,
   "sugar": 9,
   "fibre": 3
  },
  "nutrients": "Vitamin C 74.7 mg, vitamin K 40.3 ug, potassium 198 mg, fibre 3.0 g per 100 g.",
  "research": "A 2024 meta-analysis of 7 RCTs (399 people) found kiwifruit or its extracts may modestly increase spontaneous bowel movements versus placebo, but certainty was low overall.",
  "evidence": "preliminary (low certainty)",
  "notes": "Moderate sugar (9.0 g/100 g).",
  "forms": "Whole, blended (peeled or with skin).",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "sources": [
   "S1",
   "S12",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "pomegranate",
  "name": "Pomegranate (arils)",
  "category": "Pome & stone fruit",
  "per100": {
   "kcal": 83,
   "protein": 1.7,
   "sugar": 13.7,
   "fibre": 4
  },
  "nutrients": "Fibre 4.0 g (arils with seeds), potassium 236 mg, vitamin K 16.4 ug, folate 38 ug per 100 g.",
  "research": "A 2024 meta-analysis of 22 RCTs found lower blood pressure with pomegranate (about 7.9 mmHg systolic, 3.2 diastolic), but results varied hugely between trials (I-squared about 90%) and the authors called for better trials.",
  "evidence": "preliminary (very high heterogeneity)",
  "notes": "HIGH sugar (13.7 g/100 g) and calorie-dense.",
  "forms": "Whole arils blended; juice loses fibre and concentrates sugar.",
  "cautions": [
   "Medication note: one published case report suggested pomegranate may boost the potency of certain drugs; the evidence is thin. Mention it to your pharmacist if you take a medicine with a grapefruit warning."
  ],
  "sources": [
   "S1",
   "S16"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "watermelon",
  "name": "Watermelon",
  "category": "Melons",
  "per100": {
   "kcal": 30,
   "protein": 0.6,
   "sugar": 6.2,
   "fibre": 0.4
  },
  "nutrients": "Lycopene 4,532 ug, vitamin C 8.1 mg, potassium 112 mg per 100 g; very watery, little fibre.",
  "research": "Research on soreness relates to citrulline supplements (13 studies, 206 people: lower 24 h soreness and perceived exertion), not watermelon itself, so no recovery claim is made for the fruit.",
  "evidence": "preliminary (supplement data only)",
  "notes": "Low calorie, moderate sugar per 100 g, but portions are large (300 g is about 19 g sugar).",
  "forms": "Whole flesh blended; juice is fine occasionally but easy to over-pour.",
  "cautions": [],
  "sources": [
   "S1",
   "S17"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "cantaloupe",
  "name": "Cantaloupe",
  "category": "Melons",
  "per100": {
   "kcal": 34,
   "protein": 0.8,
   "sugar": 7.9,
   "fibre": 0.7
  },
  "nutrients": "Beta-carotene 2,020 ug, vitamin A 169 ug RAE, vitamin C 36.7 mg, potassium 267 mg per 100 g.",
  "research": "A carotenoid and vitamin C source. Carotenoid absorption is higher when eaten with some fat (a small 2004 study of 7 people using salad dressing).",
  "evidence": "preliminary (small absorption study)",
  "notes": "Moderate sugar.",
  "forms": "Whole flesh blended.",
  "cautions": [],
  "sources": [
   "S1",
   "S27"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "banana",
  "name": "Bananas",
  "category": "Tropical fruit",
  "per100": {
   "kcal": 89,
   "protein": 1.1,
   "sugar": 12.2,
   "fibre": 1.7
  },
  "nutrients": "Potassium 358 mg, vitamin B6 0.37 mg, magnesium 27 mg, vitamin C 8.7 mg per 100 g.",
  "research": "A potassium and creamy-texture base; no food-specific outcome trials reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Higher sugar and calories (12.2 g sugar, 89 kcal per 100 g).",
  "forms": "Whole; peel and freeze chunks for texture.",
  "cautions": [
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "pineapple",
  "name": "Pineapple",
  "category": "Tropical fruit",
  "per100": {
   "kcal": 50,
   "protein": 0.5,
   "sugar": 9.9,
   "fibre": 1.4
  },
  "nutrients": "Vitamin C 47.8 mg, manganese 0.93 mg, folate 18 ug per 100 g.",
  "research": "Pineapple contains bromelain, but NCCIH says evidence for oral bromelain supplements is limited, and fruit servings are not comparable, so no benefit claim is made.",
  "evidence": "preliminary / limited (supplement data only)",
  "notes": "Moderate sugar (9.85 g/100 g).",
  "forms": "Whole, blended; frozen chunks are fine.",
  "cautions": [],
  "sources": [
   "S1",
   "S24"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "mango",
  "name": "Mango",
  "category": "Tropical fruit",
  "per100": {
   "kcal": 60,
   "protein": 0.8,
   "sugar": 13.7,
   "fibre": 1.6
  },
  "nutrients": "Vitamin C 36.4 mg, folate 43 ug, vitamin A 54 ug RAE, potassium 168 mg per 100 g.",
  "research": "No outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "HIGH sugar (13.7 g/100 g).",
  "forms": "Whole, blended; frozen chunks are fine.",
  "cautions": [],
  "sources": [
   "S1",
   "S6"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "papaya",
  "name": "Papaya",
  "category": "Tropical fruit",
  "per100": {
   "kcal": 43,
   "protein": 0.5,
   "sugar": 7.8,
   "fibre": 1.7
  },
  "nutrients": "Vitamin C 60.9 mg, folate 37 ug, vitamin A 47 ug RAE, potassium 182 mg per 100 g.",
  "research": "No outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Moderate sugar.",
  "forms": "Whole, blended.",
  "cautions": [],
  "sources": [
   "S1",
   "S20"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "avocado",
  "name": "Avocado",
  "category": "Tropical fruit",
  "per100": {
   "kcal": 160,
   "protein": 2,
   "sugar": 0.7,
   "fibre": 6.7
  },
  "nutrients": "Total fat 14.7 g, fibre 6.7 g, potassium 485 mg, folate 81 ug, vitamin K 21 ug, vitamin E 2.07 mg per 100 g.",
  "research": "Two large prospective cohorts linked higher avocado intake to lower cardiovascular and coronary heart disease (observational; effect sizes were not on the page read). Its fat also helps carotenoid absorption from vegetables eaten with it (small 2004 study).",
  "evidence": "preliminary (observational)",
  "notes": "Calorie-dense (160 kcal/100 g) but nearly sugar-free.",
  "forms": "Whole flesh blended; adds creaminess.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S26",
   "S27",
   "S2",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "dates",
  "name": "Dates (Medjool)",
  "category": "Tropical fruit",
  "per100": {
   "kcal": 277,
   "protein": 1.8,
   "sugar": 66.5,
   "fibre": 6.7
  },
  "nutrients": "Potassium 696 mg, magnesium 54 mg, fibre 6.7 g per 100 g.",
  "research": "No outcome evidence reviewed.",
  "evidence": "none reviewed",
  "notes": "VERY HIGH sugar (66.5 g/100 g): a sweetener, not a vegetable. One date can add about 13 g sugar.",
  "forms": "Use sparingly.",
  "cautions": [
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S6",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "spinach",
  "name": "Spinach",
  "category": "Leafy greens",
  "per100": {
   "kcal": 23,
   "protein": 2.9,
   "sugar": 0.4,
   "fibre": 2.2
  },
  "nutrients": "Vitamin K about 483 ug, folate 194 ug, potassium 558 mg, iron 2.7 mg, magnesium 79 mg per 100 g (Canadian Nutrient File).",
  "research": "Folate is found in dark leafy greens such as spinach (NIH ODS). Spinach is also high in oxalate, which matters for people prone to calcium-oxalate kidney stones.",
  "evidence": "established nutrient role; oxalate caution documented",
  "notes": "Very low sugar.",
  "forms": "Raw blended works well. Frozen spinach retained vitamins in some studies, but beta-carotene fell sharply in frozen spinach in one study.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts.",
   "Oxalate: Mayo Clinic advises people prone to kidney stones to limit high-oxalate foods and eat calcium with them."
  ],
  "sources": [
   "S1",
   "S5",
   "S22",
   "S2",
   "S21",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "kale",
  "name": "Kale",
  "category": "Leafy greens",
  "per100": {
   "kcal": 49,
   "protein": 4.3,
   "sugar": 2.3,
   "fibre": 2.4
  },
  "nutrients": "Vitamin K about 705 ug, vitamin C 120 mg, calcium 150 mg, potassium 491 mg, folate 141 ug, vitamin A 500 ug RAE per 100 g (Canadian Nutrient File). Other databases list a different kale sample with lower vitamin C and K and higher calcium, so treat these as approximate.",
  "research": "A dense source of vitamin C, vitamin K and calcium; no food-specific outcome trials reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar.",
  "forms": "Raw, de-stemmed, blended well. Frozen is fine.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S2",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "romaine",
  "name": "Romaine lettuce",
  "category": "Leafy greens",
  "per100": {
   "kcal": 17,
   "protein": 1.2,
   "sugar": 1.2,
   "fibre": 2.1
  },
  "nutrients": "Folate 136 ug, vitamin K 103 ug, vitamin A 436 ug RAE, potassium 247 mg per 100 g.",
  "research": "A mild-tasting base for green drinks; no outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar.",
  "forms": "Raw blended.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "sources": [
   "S1",
   "S5",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "arugula",
  "name": "Arugula (rocket)",
  "category": "Leafy greens",
  "per100": {
   "kcal": 25,
   "protein": 2.6,
   "sugar": 2.1,
   "fibre": 1.6
  },
  "nutrients": "Calcium 160 mg, vitamin K 109 ug, folate 97 ug, potassium 369 mg per 100 g.",
  "research": "Peppery; no outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar.",
  "forms": "Raw blended in small amounts (peppery).",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S2",
   "S5"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "chard",
  "name": "Swiss chard",
  "category": "Leafy greens",
  "per100": {
   "kcal": 19,
   "protein": 1.8,
   "sugar": 1.1,
   "fibre": 1.6
  },
  "nutrients": "Vitamin K 830 ug, magnesium 81 mg, potassium 379 mg, vitamin A 306 ug RAE per 100 g.",
  "research": "Very high vitamin K; no outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar.",
  "forms": "Raw blended; earthy flavour.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts.",
   "Oxalate: chard is commonly listed as a high-oxalate green, but the Mayo source reviewed names spinach and rhubarb only."
  ],
  "sources": [
   "S1",
   "S2",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "napa",
  "name": "Napa (Chinese) cabbage",
  "category": "Leafy greens",
  "per100": {
   "kcal": 16,
   "protein": 1.2,
   "sugar": 1.4,
   "fibre": 1.2
  },
  "nutrients": "Folate 79 ug, vitamin K 42.9 ug, vitamin C 27 mg, calcium 77 mg, potassium 250 mg per 100 g (Canadian Nutrient File). This is napa (pe-tsai), not bok choy; no bok choy data could be verified.",
  "research": "No outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar.",
  "forms": "Raw or lightly cooked; mild.",
  "cautions": [],
  "sources": [
   "S1",
   "S5"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "collards",
  "name": "Collard greens",
  "category": "Leafy greens",
  "per100": {
   "kcal": 32,
   "protein": 3,
   "sugar": 0.5,
   "fibre": 4
  },
  "nutrients": "Vitamin K 437 ug, calcium 232 mg, folate 129 ug, vitamin C 35.3 mg per 100 g.",
  "research": "High in vitamin K, calcium and fibre; no outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar.",
  "forms": "Raw, de-stemmed, blended; tough leaves need a strong blender.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "sources": [
   "S1",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "watercress",
  "name": "Watercress",
  "category": "Leafy greens",
  "per100": {
   "kcal": 11,
   "protein": 2.3,
   "sugar": 0.2,
   "fibre": 0.5
  },
  "nutrients": "Vitamin K 250 ug, vitamin C 43 mg, calcium 120 mg, vitamin A 160 ug RAE per 100 g.",
  "research": "Peppery, very low calorie; no outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Negligible sugar.",
  "forms": "Raw blended.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "sources": [
   "S1",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "broccoli",
  "name": "Broccoli",
  "category": "Cruciferous",
  "per100": {
   "kcal": 34,
   "protein": 2.8,
   "sugar": 1.7,
   "fibre": 2.4
  },
  "nutrients": "Vitamin C 89.2 mg, vitamin K 102 ug, folate 63 ug, potassium 316 mg, fibre 2.6 g per 100 g.",
  "research": "NCI: glucosinolates break down into compounds (isothiocyanates, indoles) that show anticancer effects in animal and lab studies; human observational studies are mostly null or mixed. No disease claim is made.",
  "evidence": "mostly animal/lab; human data mixed",
  "notes": "Low sugar.",
  "forms": "Raw florets blend with a strong flavour; small amounts are easier. Frozen is fine.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S25",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "cauliflower",
  "name": "Cauliflower",
  "category": "Cruciferous",
  "per100": {
   "kcal": 25,
   "protein": 1.9,
   "sugar": 1.9,
   "fibre": 1.8
  },
  "nutrients": "Vitamin C 67.1 mg, folate 97 ug, potassium 274 mg per 100 g.",
  "research": "Neutral flavour that adds body without sugar; same glucosinolate evidence status as other cruciferous vegetables (NCI).",
  "evidence": "mostly animal/lab; human data mixed",
  "notes": "Low sugar.",
  "forms": "Raw or frozen florets blend smoothly in a strong blender; frozen riced cauliflower is convenient.",
  "cautions": [],
  "sources": [
   "S1",
   "S25"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "red_cabbage",
  "name": "Red cabbage",
  "category": "Cruciferous",
  "per100": {
   "kcal": 31,
   "protein": 1.4,
   "sugar": 3.8,
   "fibre": 2.1
  },
  "nutrients": "Vitamin C 57 mg, vitamin K 38.2 ug, folate 18 ug, potassium 243 mg per 100 g.",
  "research": "Cruciferous; the NCI evidence status applies.",
  "evidence": "mostly animal/lab; human data mixed",
  "notes": "Low sugar.",
  "forms": "Shredded raw; strong flavour in drinks.",
  "cautions": [],
  "sources": [
   "S1",
   "S25"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "brussels",
  "name": "Brussels sprouts",
  "category": "Cruciferous",
  "per100": {
   "kcal": 43,
   "protein": 3.4,
   "sugar": 2.2,
   "fibre": 4.1
  },
  "nutrients": "Vitamin C 85 mg, vitamin K 177 ug, folate 61 ug, potassium 389 mg, fibre 3.8 g per 100 g.",
  "research": "A folate source (NIH ODS lists Brussels sprouts). Cruciferous evidence status per NCI.",
  "evidence": "mostly animal/lab; human data mixed",
  "notes": "Low sugar.",
  "forms": "Better cooked than blended raw (flavour).",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S5",
   "S25",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "radish",
  "name": "Radishes",
  "category": "Cruciferous",
  "per100": {
   "kcal": 16,
   "protein": 0.7,
   "sugar": 1.9,
   "fibre": 1.6
  },
  "nutrients": "Vitamin C 14.8 mg, potassium 233 mg per 100 g.",
  "research": "No outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar.",
  "forms": "Raw, small amounts for peppery flavour.",
  "cautions": [],
  "sources": [
   "S1"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "carrot",
  "name": "Carrots",
  "category": "Roots & tubers",
  "per100": {
   "kcal": 41,
   "protein": 0.9,
   "sugar": 4.7,
   "fibre": 2.4
  },
  "nutrients": "Beta-carotene 8,285 ug, vitamin A 835 ug RAE, potassium 320 mg, fibre 2.8 g per 100 g.",
  "research": "Carotenoids are absorbed better when eaten with fat (a small 2004 study of 7 people with salad dressings). Beta-carotene fell sharply in frozen carrots in one study.",
  "evidence": "preliminary (small absorption study)",
  "notes": "Low-moderate sugar (4.7 g/100 g) but juicing 200-300 g adds up quickly and removes fibre.",
  "forms": "Raw, whole, blended with a fat source (avocado, nuts, seeds, yogurt). Fresh preferred over frozen for carotene.",
  "cautions": [
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S27",
   "S21"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "beet",
  "name": "Beets (raw)",
  "category": "Roots & tubers",
  "per100": {
   "kcal": 43,
   "protein": 1.6,
   "sugar": 6.8,
   "fibre": 1.9
  },
  "nutrients": "Folate 109 ug, manganese 0.33 mg, potassium 325 mg, fibre 2.8 g per 100 g.",
  "research": "A 2022 meta-analysis of 7 RCTs (218 people with hypertension) found beetroot juice nitrate lowered systolic BP by about 5 mmHg (diastolic not significant); studies were few, small and varied.",
  "evidence": "preliminary",
  "notes": "Moderate sugar (6.8 g/100 g).",
  "forms": "Small raw portions blended, or cooked. Beet juice concentrates nitrate (the studied form) but removes fibre.",
  "cautions": [
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts.",
   "Oxalate: beets are often listed as high-oxalate; the Mayo source reviewed names spinach and rhubarb only.",
   "Beeturia (red urine) can occur; harmless but alarming (not sourced)."
  ],
  "sources": [
   "S1",
   "S10",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "sweet_potato",
  "name": "Sweet potato (raw)",
  "category": "Roots & tubers",
  "per100": {
   "kcal": 86,
   "protein": 1.6,
   "sugar": 4.2,
   "fibre": 3
  },
  "nutrients": "Beta-carotene 8,509 ug, vitamin A 709 ug RAE, potassium 337 mg, manganese 0.26 mg, fibre 3.0 g per 100 g (raw).",
  "research": "A carotenoid and fibre source; typically eaten cooked, and cooked values differ from these raw values.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Raw value shown; cooked sweet potato has different sugar and starch (not scored).",
  "forms": "Cooked and cooled before blending is more palatable (raw values not used in recipes).",
  "cautions": [
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S27",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "parsnip",
  "name": "Parsnips",
  "category": "Roots & tubers",
  "per100": {
   "kcal": 75,
   "protein": 1.2,
   "sugar": 4.8,
   "fibre": 3.4
  },
  "nutrients": "Fibre 4.9 g, potassium 375 mg, folate 67 ug, vitamin C 17 mg per 100 g.",
  "research": "No outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Higher-calorie root; low sugar.",
  "forms": "Cooked is better than raw for blending.",
  "cautions": [
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "ginger",
  "name": "Ginger (fresh root)",
  "category": "Roots & tubers",
  "per100": {
   "kcal": 80,
   "protein": 1.8,
   "sugar": 1.7,
   "fibre": 2
  },
  "nutrients": "Potassium 415 mg, magnesium 43 mg per 100 g; used in tiny amounts (3-8 g).",
  "research": "A 2020 review of 109 RCTs found the most consistent support for nausea and vomiting in pregnancy, plus inflammation, metabolic and digestive outcomes; most trials were small and only 43 of 109 were rated high quality. Adverse effects were mild (heartburn most common).",
  "evidence": "moderate for nausea; preliminary for other uses",
  "notes": "Negligible at culinary amounts.",
  "forms": "Fresh, grated or sliced thin; juices well.",
  "cautions": [
   "Medicines: if you take blood thinners or are pregnant, check amounts with your clinician (a source on ginger-warfarin interaction could not be opened, so this is a precaution, not a verified finding)."
  ],
  "sources": [
   "S1",
   "S11"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "celery",
  "name": "Celery",
  "category": "Other vegetables",
  "per100": {
   "kcal": 16,
   "protein": 0.7,
   "sugar": 1.3,
   "fibre": 1.5
  },
  "nutrients": "Vitamin K 29.3 ug, folate 36 ug, potassium 260 mg, sodium 80 mg per 100 g.",
  "research": "Hydrating and savoury; no outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar. Sodium is naturally present (80 mg/100 g): relevant if juicing large amounts on a sodium-restricted diet.",
  "forms": "Whole blended keeps fibre; juice removes it.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "sources": [
   "S1",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "cucumber",
  "name": "Cucumber (with peel)",
  "category": "Other vegetables",
  "per100": {
   "kcal": 16,
   "protein": 0.7,
   "sugar": 1.7,
   "fibre": 0.7
  },
  "nutrients": "Vitamin K 16.4 ug, potassium 147 mg per 100 g; about 95% water.",
  "research": "A hydrating base; no outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar and calories.",
  "forms": "Whole with peel blended; juice is mostly water.",
  "cautions": [],
  "sources": [
   "S1"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "tomato",
  "name": "Tomatoes (red, ripe)",
  "category": "Other vegetables",
  "per100": {
   "kcal": 18,
   "protein": 0.9,
   "sugar": 2.6,
   "fibre": 1.2
  },
  "nutrients": "Lycopene 2,573 ug, vitamin C 13.7 mg, potassium 237 mg per 100 g.",
  "research": "A 2017 meta-analysis (21 publications) found tomato products modestly lowered LDL (about 0.22 mmol/L) and improved flow-mediated dilation (about 2.5%); lycopene supplements lowered systolic BP about 5.7 mmHg. Effects were modest.",
  "evidence": "moderate (modest effects)",
  "notes": "Very low sugar.",
  "forms": "Whole, blended; lycopene is a carotenoid, so a little fat (olive oil, avocado) helps absorption (small 2004 study of salads).",
  "cautions": [],
  "sources": [
   "S1",
   "S15",
   "S27"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "red_pepper",
  "name": "Red bell pepper",
  "category": "Other vegetables",
  "per100": {
   "kcal": 31,
   "protein": 1,
   "sugar": 4.2,
   "fibre": 1.4
  },
  "nutrients": "Vitamin C 142 mg, vitamin A 111 ug RAE, folate 47.3 ug, potassium 213 mg per 100 g.",
  "research": "Very high vitamin C, which helps plant-iron absorption (NIH ODS).",
  "evidence": "strong for the mechanism; no outcome trial reviewed",
  "notes": "Low sugar.",
  "forms": "Raw, deseeded.",
  "cautions": [],
  "sources": [
   "S1",
   "S4"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "zucchini",
  "name": "Zucchini (with skin)",
  "category": "Other vegetables",
  "per100": {
   "kcal": 17,
   "protein": 1.2,
   "sugar": 2.5,
   "fibre": 1
  },
  "nutrients": "Vitamin C 17.9 mg, potassium 261 mg, vitamin K 4.3 ug per 100 g.",
  "research": "Neutral flavour; adds volume with few calories.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Very low sugar.",
  "forms": "Raw blends smoothly.",
  "cautions": [],
  "sources": [
   "S1"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "butternut",
  "name": "Butternut squash (raw)",
  "category": "Other vegetables",
  "per100": {
   "kcal": 42,
   "protein": 1.1,
   "sugar": 5,
   "fibre": 1.2
  },
  "nutrients": "Vitamin A 220 ug RAE, vitamin C 3 mg, magnesium 16 mg, potassium 352 mg per 100 g, raw (Canadian Nutrient File). Another database lists higher vitamin A (532 ug RAE) and vitamin C (21 mg) for a different sample, so treat these as approximate.",
  "research": "A carotenoid source; normally eaten cooked.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Low sugar (raw).",
  "forms": "Roast first for blending (cooked values not scored).",
  "cautions": [
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S19",
   "S27"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "fennel",
  "name": "Fennel bulb",
  "category": "Other vegetables",
  "per100": {
   "kcal": 31,
   "protein": 1.2,
   "sugar": 3.9,
   "fibre": 3.1
  },
  "nutrients": "Fibre 3.1 g, potassium 414 mg, vitamin C 12 mg per 100 g.",
  "research": "A sweet aniseed note; no outcome evidence reviewed.",
  "evidence": "general fruit/veg evidence only",
  "notes": "Low sugar.",
  "forms": "Raw, thinly sliced, blended.",
  "cautions": [
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "asparagus",
  "name": "Asparagus",
  "category": "Other vegetables",
  "per100": {
   "kcal": 20,
   "protein": 2.2,
   "sugar": 1.9,
   "fibre": 2.1
  },
  "nutrients": "Folate 52 ug, vitamin K 41.6 ug, vitamin C 5.6 mg, potassium 202 mg per 100 g.",
  "research": "A folate source (NIH ODS lists asparagus).",
  "evidence": "established nutrient role",
  "notes": "Very low sugar.",
  "forms": "Better cooked than raw in drinks.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "sources": [
   "S1",
   "S5",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "rhubarb",
  "name": "Rhubarb (stalks only)",
  "category": "Other vegetables",
  "per100": {
   "kcal": 21,
   "protein": 0.9,
   "sugar": 1.1,
   "fibre": 1.8
  },
  "nutrients": "Calcium 86 mg, vitamin K 29.3 ug, potassium 288 mg, vitamin C 8 mg per 100 g (stalk). Very tart.",
  "research": "Leaves must never be eaten: they contain far more oxalic acid than stalks (Purdue). Stalks are also high-oxalate for people prone to stones (Mayo).",
  "evidence": "oxalate caution documented",
  "notes": "Very low natural sugar; needs sweetening, which adds sugar.",
  "forms": "Cooked stalks, small amounts; not recommended raw in large quantities.",
  "cautions": [
   "Oxalate: Mayo Clinic advises people prone to kidney stones to limit high-oxalate foods and eat calcium with them.",
   "Never use rhubarb leaves."
  ],
  "sources": [
   "S1",
   "S22",
   "S23"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "mint",
  "name": "Spearmint (fresh)",
  "category": "Herbs",
  "per100": {
   "kcal": 44,
   "protein": 3.3,
   "sugar": 0,
   "fibre": 6.8
  },
  "nutrients": "Per 100 g: vitamin C 13.3 mg, iron 11.9 mg, potassium 458 mg, fibre 6.8 g. At 3-5 g per drink these are tiny contributions.",
  "research": "Mint is a flavouring. Evidence on peppermint oil for irritable bowel syndrome exists, but it could not be verified here and oil is not the same as fresh leaves, so no claim is made.",
  "evidence": "none verified (culinary use)",
  "notes": "Negligible at serving amounts (a sugar value was not available).",
  "forms": "Fresh leaves blended or juiced.",
  "cautions": [],
  "sources": [
   "S1"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "basil",
  "name": "Basil (fresh)",
  "category": "Herbs",
  "per100": {
   "kcal": 22,
   "protein": 3.2,
   "sugar": 0.3,
   "fibre": 1.6
  },
  "nutrients": "Vitamin K 415 ug, vitamin C 18 mg, iron 3.17 mg, potassium 295 mg per 100 g.",
  "research": "Flavouring; the nutrient contribution is small at 3-5 g.",
  "evidence": "none (culinary use)",
  "notes": "Negligible.",
  "forms": "Fresh leaves.",
  "cautions": [
   "High vitamin K per 100 g (small amounts used): people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "sources": [
   "S1",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "parsley",
  "name": "Parsley (fresh)",
  "category": "Herbs",
  "per100": {
   "kcal": 36,
   "protein": 3,
   "sugar": 0.9,
   "fibre": 3.3
  },
  "nutrients": "Vitamin K 1,640 ug, vitamin C 133 mg, folate 152 ug, iron 6.2 mg, potassium 554 mg per 100 g.",
  "research": "Extremely vitamin K-dense; small amounts add vitamin C and flavour.",
  "evidence": "none (culinary use)",
  "notes": "Negligible.",
  "forms": "Fresh leaves and tender stems.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich: people with kidney disease, or on ACE inhibitors / potassium-sparing diuretics, should check with a clinician before using large or daily amounts."
  ],
  "sources": [
   "S1",
   "S2",
   "S19"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 },
 {
  "id": "cilantro",
  "name": "Cilantro (coriander leaf)",
  "category": "Herbs",
  "per100": {
   "kcal": 23,
   "protein": 2.1,
   "sugar": 0.9,
   "fibre": 2.8
  },
  "nutrients": "Vitamin K 310 ug, vitamin C 30 mg, potassium 540 mg per 100 g.",
  "research": "Flavouring; some people find the taste soapy.",
  "evidence": "none (culinary use)",
  "notes": "Negligible.",
  "forms": "Fresh leaves.",
  "cautions": [
   "Vitamin K: people taking warfarin should keep vitamin K intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "sources": [
   "S1",
   "S2"
  ],
  "dataSource": "Canadian Nutrient File (Health Canada)"
 }
];
