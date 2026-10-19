// Generated: nutrient matrix per 100 g (research dataset 2026-10-18), values from the Canadian Nutrient File where matched.
// % of reference = value / the higher adult RDA or AI (NIH ODS). Good source = 10-19.9%, excellent = 20%+ (common food-label convention, our choice, not an NIH rule). Per 100 g is not per serving.
export type NutrientKey = "vitamin_c" | "vitamin_k" | "folate" | "vitamin_a" | "potassium" | "calcium" | "iron" | "magnesium";
export type MatrixEntry = {
  values: Record<NutrientKey, number | null>;
  percent: Record<NutrientKey, number | null>;
  good: string[]; excellent: string[]; notes: string[]; source: string;
};
export const REFERENCES: { key: NutrientKey; label: string; unit: string; reference: number; source: string }[] = [
 {
  "key": "vitamin_c",
  "label": "Vitamin C",
  "unit": "mg",
  "reference": 90,
  "source": "N7"
 },
 {
  "key": "vitamin_k",
  "label": "Vitamin K",
  "unit": "ug",
  "reference": 120,
  "source": "N8"
 },
 {
  "key": "folate",
  "label": "Folate (DFE)",
  "unit": "ug",
  "reference": 400,
  "source": "N9"
 },
 {
  "key": "vitamin_a",
  "label": "Vitamin A (RAE)",
  "unit": "ug",
  "reference": 900,
  "source": "N1"
 },
 {
  "key": "potassium",
  "label": "Potassium",
  "unit": "mg",
  "reference": 3400,
  "source": "N12"
 },
 {
  "key": "calcium",
  "label": "Calcium",
  "unit": "mg",
  "reference": 1000,
  "source": "N10"
 },
 {
  "key": "iron",
  "label": "Iron",
  "unit": "mg",
  "reference": 18,
  "source": "N6"
 },
 {
  "key": "magnesium",
  "label": "Magnesium",
  "unit": "mg",
  "reference": 420,
  "source": "N5"
 }
];
export const MATRIX: Record<string, MatrixEntry> = {
 "blueberries": {
  "values": {
   "vitamin_c": 9.7,
   "vitamin_k": 19.3,
   "folate": 6,
   "vitamin_a": 3,
   "potassium": 77,
   "calcium": 6,
   "iron": 0.28,
   "magnesium": 6
  },
  "percent": {
   "vitamin_c": 10.8,
   "vitamin_k": 16.1,
   "folate": 1.5,
   "vitamin_a": 0.3,
   "potassium": 2.3,
   "calcium": 0.6,
   "iron": 1.6,
   "magnesium": 1.4
  },
  "good": [
   "Vitamin C",
   "Vitamin K"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "strawberries": {
  "values": {
   "vitamin_c": 58.8,
   "vitamin_k": 2.2,
   "folate": 24,
   "vitamin_a": 1,
   "potassium": 153,
   "calcium": 16,
   "iron": 0.41,
   "magnesium": 13
  },
  "percent": {
   "vitamin_c": 65.3,
   "vitamin_k": 1.8,
   "folate": 6,
   "vitamin_a": 0.1,
   "potassium": 4.5,
   "calcium": 1.6,
   "iron": 2.3,
   "magnesium": 3.1
  },
  "good": [],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "raspberries": {
  "values": {
   "vitamin_c": 26.2,
   "vitamin_k": 7.8,
   "folate": 21,
   "vitamin_a": 2,
   "potassium": 151,
   "calcium": 25,
   "iron": 0.69,
   "magnesium": 22
  },
  "percent": {
   "vitamin_c": 29.1,
   "vitamin_k": 6.5,
   "folate": 5.3,
   "vitamin_a": 0.2,
   "potassium": 4.4,
   "calcium": 2.5,
   "iron": 3.8,
   "magnesium": 5.2
  },
  "good": [],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "blackberries": {
  "values": {
   "vitamin_c": 21,
   "vitamin_k": 19.8,
   "folate": 25,
   "vitamin_a": 11,
   "potassium": 162,
   "calcium": 29,
   "iron": 0.62,
   "magnesium": 20
  },
  "percent": {
   "vitamin_c": 23.3,
   "vitamin_k": 16.5,
   "folate": 6.3,
   "vitamin_a": 1.2,
   "potassium": 4.8,
   "calcium": 2.9,
   "iron": 3.4,
   "magnesium": 4.8
  },
  "good": [
   "Vitamin K"
  ],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "cranberries": {
  "values": {
   "vitamin_c": 13.3,
   "vitamin_k": 5.1,
   "folate": 1,
   "vitamin_a": 3,
   "potassium": 85,
   "calcium": 8,
   "iron": 0.25,
   "magnesium": 6
  },
  "percent": {
   "vitamin_c": 14.8,
   "vitamin_k": 4.3,
   "folate": 0.3,
   "vitamin_a": 0.3,
   "potassium": 2.5,
   "calcium": 0.8,
   "iron": 1.4,
   "magnesium": 1.4
  },
  "good": [
   "Vitamin C"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "cherries": {
  "values": {
   "vitamin_c": 7,
   "vitamin_k": 2.1,
   "folate": 4,
   "vitamin_a": 3,
   "potassium": 222,
   "calcium": 13,
   "iron": 0.36,
   "magnesium": 11
  },
  "percent": {
   "vitamin_c": 7.8,
   "vitamin_k": 1.8,
   "folate": 1,
   "vitamin_a": 0.3,
   "potassium": 6.5,
   "calcium": 1.3,
   "iron": 2,
   "magnesium": 2.6
  },
  "good": [],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "orange": {
  "values": {
   "vitamin_c": 53.2,
   "vitamin_k": 0,
   "folate": 30,
   "vitamin_a": 11,
   "potassium": 181,
   "calcium": 40,
   "iron": 0.1,
   "magnesium": 10
  },
  "percent": {
   "vitamin_c": 59.1,
   "vitamin_k": 0,
   "folate": 7.5,
   "vitamin_a": 1.2,
   "potassium": 5.3,
   "calcium": 4,
   "iron": 0.6,
   "magnesium": 2.4
  },
  "good": [],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "lemon": {
  "values": {
   "vitamin_c": 53,
   "vitamin_k": 0,
   "folate": 11,
   "vitamin_a": 1,
   "potassium": 138,
   "calcium": 26,
   "iron": 0.6,
   "magnesium": 8
  },
  "percent": {
   "vitamin_c": 58.9,
   "vitamin_k": 0,
   "folate": 2.8,
   "vitamin_a": 0.1,
   "potassium": 4.1,
   "calcium": 2.6,
   "iron": 3.3,
   "magnesium": 1.9
  },
  "good": [],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "lime": {
  "values": {
   "vitamin_c": 29.1,
   "vitamin_k": 0.6,
   "folate": 8,
   "vitamin_a": 2,
   "potassium": 102,
   "calcium": 33,
   "iron": 0.6,
   "magnesium": 6
  },
  "percent": {
   "vitamin_c": 32.3,
   "vitamin_k": 0.5,
   "folate": 2,
   "vitamin_a": 0.2,
   "potassium": 3,
   "calcium": 3.3,
   "iron": 3.3,
   "magnesium": 1.4
  },
  "good": [],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "grapefruit": {
  "values": {
   "vitamin_c": 31.2,
   "vitamin_k": 0,
   "folate": 13,
   "vitamin_a": 58,
   "potassium": 135,
   "calcium": 22,
   "iron": 0.08,
   "magnesium": 9
  },
  "percent": {
   "vitamin_c": 34.7,
   "vitamin_k": 0,
   "folate": 3.3,
   "vitamin_a": 6.4,
   "potassium": 4,
   "calcium": 2.2,
   "iron": 0.4,
   "magnesium": 2.1
  },
  "good": [],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "mandarin": {
  "values": {
   "vitamin_c": 26.7,
   "vitamin_k": 0,
   "folate": 16,
   "vitamin_a": 34,
   "potassium": 166,
   "calcium": 37,
   "iron": 0.15,
   "magnesium": 12
  },
  "percent": {
   "vitamin_c": 29.7,
   "vitamin_k": 0,
   "folate": 4,
   "vitamin_a": 3.8,
   "potassium": 4.9,
   "calcium": 3.7,
   "iron": 0.8,
   "magnesium": 2.9
  },
  "good": [],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "apple": {
  "values": {
   "vitamin_c": 4.6,
   "vitamin_k": 2.2,
   "folate": 3,
   "vitamin_a": 3,
   "potassium": 107,
   "calcium": 6,
   "iron": 0.12,
   "magnesium": 5
  },
  "percent": {
   "vitamin_c": 5.1,
   "vitamin_k": 1.8,
   "folate": 0.8,
   "vitamin_a": 0.3,
   "potassium": 3.1,
   "calcium": 0.6,
   "iron": 0.7,
   "magnesium": 1.2
  },
  "good": [],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "pear": {
  "values": {
   "vitamin_c": 4.3,
   "vitamin_k": 4.4,
   "folate": 7,
   "vitamin_a": 1,
   "potassium": 116,
   "calcium": 9,
   "iron": 0.18,
   "magnesium": 7
  },
  "percent": {
   "vitamin_c": 4.8,
   "vitamin_k": 3.7,
   "folate": 1.8,
   "vitamin_a": 0.1,
   "potassium": 3.4,
   "calcium": 0.9,
   "iron": 1,
   "magnesium": 1.7
  },
  "good": [],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "peach": {
  "values": {
   "vitamin_c": 6.6,
   "vitamin_k": 2.6,
   "folate": 4,
   "vitamin_a": 16,
   "potassium": 190,
   "calcium": 6,
   "iron": 0.25,
   "magnesium": 9
  },
  "percent": {
   "vitamin_c": 7.3,
   "vitamin_k": 2.2,
   "folate": 1,
   "vitamin_a": 1.8,
   "potassium": 5.6,
   "calcium": 0.6,
   "iron": 1.4,
   "magnesium": 2.1
  },
  "good": [],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "plum": {
  "values": {
   "vitamin_c": 9.5,
   "vitamin_k": 6.4,
   "folate": 5,
   "vitamin_a": 17,
   "potassium": 157,
   "calcium": 6,
   "iron": 0.17,
   "magnesium": 7
  },
  "percent": {
   "vitamin_c": 10.6,
   "vitamin_k": 5.3,
   "folate": 1.3,
   "vitamin_a": 1.9,
   "potassium": 4.6,
   "calcium": 0.6,
   "iron": 0.9,
   "magnesium": 1.7
  },
  "good": [
   "Vitamin C"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "apricot": {
  "values": {
   "vitamin_c": 10,
   "vitamin_k": 3.3,
   "folate": 9,
   "vitamin_a": 96,
   "potassium": 259,
   "calcium": 13,
   "iron": 0.39,
   "magnesium": 10
  },
  "percent": {
   "vitamin_c": 11.1,
   "vitamin_k": 2.8,
   "folate": 2.3,
   "vitamin_a": 10.7,
   "potassium": 7.6,
   "calcium": 1.3,
   "iron": 2.2,
   "magnesium": 2.4
  },
  "good": [
   "Vitamin C",
   "Vitamin A (RAE)"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "grapes": {
  "values": {
   "vitamin_c": 3.2,
   "vitamin_k": 14.6,
   "folate": 2,
   "vitamin_a": 3,
   "potassium": 191,
   "calcium": 10,
   "iron": 0.36,
   "magnesium": 7
  },
  "percent": {
   "vitamin_c": 3.6,
   "vitamin_k": 12.2,
   "folate": 0.5,
   "vitamin_a": 0.3,
   "potassium": 5.6,
   "calcium": 1,
   "iron": 2,
   "magnesium": 1.7
  },
  "good": [
   "Vitamin K"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "kiwi": {
  "values": {
   "vitamin_c": 92.7,
   "vitamin_k": 40.3,
   "folate": 25,
   "vitamin_a": 4,
   "potassium": 312,
   "calcium": 34,
   "iron": 0.31,
   "magnesium": 17
  },
  "percent": {
   "vitamin_c": 103,
   "vitamin_k": 33.6,
   "folate": 6.3,
   "vitamin_a": 0.4,
   "potassium": 9.2,
   "calcium": 3.4,
   "iron": 1.7,
   "magnesium": 4
  },
  "good": [],
  "excellent": [
   "Vitamin C",
   "Vitamin K"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "pomegranate": {
  "values": {
   "vitamin_c": 10.2,
   "vitamin_k": 16.4,
   "folate": 38,
   "vitamin_a": 0,
   "potassium": 236,
   "calcium": 10,
   "iron": 0.3,
   "magnesium": 12
  },
  "percent": {
   "vitamin_c": 11.3,
   "vitamin_k": 13.7,
   "folate": 9.5,
   "vitamin_a": 0,
   "potassium": 6.9,
   "calcium": 1,
   "iron": 1.7,
   "magnesium": 2.9
  },
  "good": [
   "Vitamin C",
   "Vitamin K"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "watermelon": {
  "values": {
   "vitamin_c": 8.1,
   "vitamin_k": 0.1,
   "folate": 3,
   "vitamin_a": 28,
   "potassium": 112,
   "calcium": 7,
   "iron": 0.24,
   "magnesium": 10
  },
  "percent": {
   "vitamin_c": 9,
   "vitamin_k": 0.1,
   "folate": 0.8,
   "vitamin_a": 3.1,
   "potassium": 3.3,
   "calcium": 0.7,
   "iron": 1.3,
   "magnesium": 2.4
  },
  "good": [],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "cantaloupe": {
  "values": {
   "vitamin_c": 36.7,
   "vitamin_k": 2.5,
   "folate": 21,
   "vitamin_a": 169,
   "potassium": 267,
   "calcium": 9,
   "iron": 0.21,
   "magnesium": 12
  },
  "percent": {
   "vitamin_c": 40.8,
   "vitamin_k": 2.1,
   "folate": 5.3,
   "vitamin_a": 18.8,
   "potassium": 7.9,
   "calcium": 0.9,
   "iron": 1.2,
   "magnesium": 2.9
  },
  "good": [
   "Vitamin A (RAE)"
  ],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "banana": {
  "values": {
   "vitamin_c": 8.7,
   "vitamin_k": 0.5,
   "folate": 20,
   "vitamin_a": 3,
   "potassium": 358,
   "calcium": 5,
   "iron": 0.26,
   "magnesium": 27
  },
  "percent": {
   "vitamin_c": 9.7,
   "vitamin_k": 0.4,
   "folate": 5,
   "vitamin_a": 0.3,
   "potassium": 10.5,
   "calcium": 0.5,
   "iron": 1.4,
   "magnesium": 6.4
  },
  "good": [
   "Potassium"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "pineapple": {
  "values": {
   "vitamin_c": 47.8,
   "vitamin_k": 0.7,
   "folate": 18,
   "vitamin_a": 3,
   "potassium": 109,
   "calcium": 13,
   "iron": 0.29,
   "magnesium": 12
  },
  "percent": {
   "vitamin_c": 53.1,
   "vitamin_k": 0.6,
   "folate": 4.5,
   "vitamin_a": 0.3,
   "potassium": 3.2,
   "calcium": 1.3,
   "iron": 1.6,
   "magnesium": 2.9
  },
  "good": [],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "mango": {
  "values": {
   "vitamin_c": 36.4,
   "vitamin_k": 4.2,
   "folate": 43,
   "vitamin_a": 54,
   "potassium": 168,
   "calcium": 11,
   "iron": 0.16,
   "magnesium": 10
  },
  "percent": {
   "vitamin_c": 40.4,
   "vitamin_k": 3.5,
   "folate": 10.8,
   "vitamin_a": 6,
   "potassium": 4.9,
   "calcium": 1.1,
   "iron": 0.9,
   "magnesium": 2.4
  },
  "good": [
   "Folate (DFE)"
  ],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "papaya": {
  "values": {
   "vitamin_c": 60.9,
   "vitamin_k": 2.6,
   "folate": 37,
   "vitamin_a": 47,
   "potassium": 182,
   "calcium": 20,
   "iron": 0.25,
   "magnesium": 21
  },
  "percent": {
   "vitamin_c": 67.7,
   "vitamin_k": 2.2,
   "folate": 9.3,
   "vitamin_a": 5.2,
   "potassium": 5.4,
   "calcium": 2,
   "iron": 1.4,
   "magnesium": 5
  },
  "good": [],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "avocado": {
  "values": {
   "vitamin_c": 10,
   "vitamin_k": 21,
   "folate": 81,
   "vitamin_a": 7,
   "potassium": 485,
   "calcium": 12,
   "iron": 0.55,
   "magnesium": 29
  },
  "percent": {
   "vitamin_c": 11.1,
   "vitamin_k": 17.5,
   "folate": 20.3,
   "vitamin_a": 0.8,
   "potassium": 14.3,
   "calcium": 1.2,
   "iron": 3.1,
   "magnesium": 6.9
  },
  "good": [
   "Vitamin C",
   "Vitamin K",
   "Potassium"
  ],
  "excellent": [
   "Folate (DFE)"
  ],
  "notes": [
   "Potassium-rich (400 mg or more per 100 g); people with kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics should check with a clinician."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "dates": {
  "values": {
   "vitamin_c": 0,
   "vitamin_k": 2.7,
   "folate": 15,
   "vitamin_a": 7,
   "potassium": 696,
   "calcium": 64,
   "iron": 0.9,
   "magnesium": 54
  },
  "percent": {
   "vitamin_c": 0,
   "vitamin_k": 2.3,
   "folate": 3.8,
   "vitamin_a": 0.8,
   "potassium": 20.5,
   "calcium": 6.4,
   "iron": 5,
   "magnesium": 12.9
  },
  "good": [
   "Magnesium"
  ],
  "excellent": [
   "Potassium"
  ],
  "notes": [
   "Potassium-rich (400 mg or more per 100 g); people with kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics should check with a clinician."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "spinach": {
  "values": {
   "vitamin_c": 28.1,
   "vitamin_k": 482.9,
   "folate": 194,
   "vitamin_a": 469,
   "potassium": 558,
   "calcium": 99,
   "iron": 2.71,
   "magnesium": 79
  },
  "percent": {
   "vitamin_c": 31.2,
   "vitamin_k": 402.4,
   "folate": 48.5,
   "vitamin_a": 52.1,
   "potassium": 16.4,
   "calcium": 9.9,
   "iron": 15.1,
   "magnesium": 18.8
  },
  "good": [
   "Potassium",
   "Iron",
   "Magnesium"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K",
   "Folate (DFE)",
   "Vitamin A (RAE)"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich (400 mg or more per 100 g); people with kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics should check with a clinician.",
   "Calcium is listed but poorly absorbed because of oxalate (NIH names spinach, collards, sweet potatoes and rhubarb; spinach is about 5% absorbed versus 27% from milk). Do not count it as a full calcium source.",
   "Iron is nonheme with low bioavailability (NIH); pairing with vitamin C improves absorption."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "kale": {
  "values": {
   "vitamin_c": 120,
   "vitamin_k": 704.8,
   "folate": 141,
   "vitamin_a": 500,
   "potassium": 491,
   "calcium": 150,
   "iron": 1.47,
   "magnesium": 47
  },
  "percent": {
   "vitamin_c": 133.3,
   "vitamin_k": 587.3,
   "folate": 35.3,
   "vitamin_a": 55.6,
   "potassium": 14.4,
   "calcium": 15,
   "iron": 8.2,
   "magnesium": 11.2
  },
  "good": [
   "Potassium",
   "Calcium",
   "Magnesium"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K",
   "Folate (DFE)",
   "Vitamin A (RAE)"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich (400 mg or more per 100 g); people with kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics should check with a clinician.",
   "Databases disagree for kale: Health Canada's Canadian Nutrient File (used here) lists vitamin C 120 mg, vitamin K 705 ug, folate 141 ug, vitamin A 500 ug RAE and calcium 150 mg per 100 g; a newer USDA entry lists lower vitamin C and K and higher calcium (254 mg). Treat kale values as approximate."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "romaine": {
  "values": {
   "vitamin_c": 4,
   "vitamin_k": 102.5,
   "folate": 136,
   "vitamin_a": 436,
   "potassium": 247,
   "calcium": 33,
   "iron": 0.97,
   "magnesium": 14
  },
  "percent": {
   "vitamin_c": 4.4,
   "vitamin_k": 85.4,
   "folate": 34,
   "vitamin_a": 48.4,
   "potassium": 7.3,
   "calcium": 3.3,
   "iron": 5.4,
   "magnesium": 3.3
  },
  "good": [],
  "excellent": [
   "Vitamin K",
   "Folate (DFE)",
   "Vitamin A (RAE)"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "arugula": {
  "values": {
   "vitamin_c": 15,
   "vitamin_k": 108.6,
   "folate": 97,
   "vitamin_a": 119,
   "potassium": 369,
   "calcium": 160,
   "iron": 1.46,
   "magnesium": 47
  },
  "percent": {
   "vitamin_c": 16.7,
   "vitamin_k": 90.5,
   "folate": 24.3,
   "vitamin_a": 13.2,
   "potassium": 10.9,
   "calcium": 16,
   "iron": 8.1,
   "magnesium": 11.2
  },
  "good": [
   "Vitamin C",
   "Vitamin A (RAE)",
   "Potassium",
   "Calcium",
   "Magnesium"
  ],
  "excellent": [
   "Vitamin K",
   "Folate (DFE)"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "chard": {
  "values": {
   "vitamin_c": 30,
   "vitamin_k": 830,
   "folate": 14,
   "vitamin_a": 306,
   "potassium": 379,
   "calcium": 51,
   "iron": 1.8,
   "magnesium": 81
  },
  "percent": {
   "vitamin_c": 33.3,
   "vitamin_k": 691.7,
   "folate": 3.5,
   "vitamin_a": 34,
   "potassium": 11.1,
   "calcium": 5.1,
   "iron": 10,
   "magnesium": 19.3
  },
  "good": [
   "Potassium",
   "Iron",
   "Magnesium"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K",
   "Vitamin A (RAE)"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "napa": {
  "values": {
   "vitamin_c": 27,
   "vitamin_k": 42.9,
   "folate": 79,
   "vitamin_a": 16,
   "potassium": 238,
   "calcium": 77,
   "iron": 0.31,
   "magnesium": 13
  },
  "percent": {
   "vitamin_c": 30,
   "vitamin_k": 35.8,
   "folate": 19.8,
   "vitamin_a": 1.8,
   "potassium": 7,
   "calcium": 7.7,
   "iron": 1.7,
   "magnesium": 3.1
  },
  "good": [
   "Folate (DFE)"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K"
  ],
  "notes": [
   "Databases disagree for napa cabbage: the research file listed folate 170 ug and calcium 25 mg from a low-confidence source; the Canadian Nutrient File (used here) lists folate 79 ug and calcium 77 mg."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "collards": {
  "values": {
   "vitamin_c": 35.3,
   "vitamin_k": 437.1,
   "folate": 129,
   "vitamin_a": 251,
   "potassium": 213,
   "calcium": 232,
   "iron": 0.47,
   "magnesium": 27
  },
  "percent": {
   "vitamin_c": 39.2,
   "vitamin_k": 364.3,
   "folate": 32.3,
   "vitamin_a": 27.9,
   "potassium": 6.3,
   "calcium": 23.2,
   "iron": 2.6,
   "magnesium": 6.4
  },
  "good": [],
  "excellent": [
   "Vitamin C",
   "Vitamin K",
   "Folate (DFE)",
   "Vitamin A (RAE)",
   "Calcium"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS).",
   "Calcium is listed but poorly absorbed because of oxalate (NIH names spinach, collards, sweet potatoes and rhubarb; spinach is about 5% absorbed versus 27% from milk). Do not count it as a full calcium source."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "watercress": {
  "values": {
   "vitamin_c": 43,
   "vitamin_k": 250,
   "folate": 9,
   "vitamin_a": 160,
   "potassium": 330,
   "calcium": 120,
   "iron": 0.2,
   "magnesium": 21
  },
  "percent": {
   "vitamin_c": 47.8,
   "vitamin_k": 208.3,
   "folate": 2.3,
   "vitamin_a": 17.8,
   "potassium": 9.7,
   "calcium": 12,
   "iron": 1.1,
   "magnesium": 5
  },
  "good": [
   "Vitamin A (RAE)",
   "Calcium"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "broccoli": {
  "values": {
   "vitamin_c": 89.2,
   "vitamin_k": 101.6,
   "folate": 63,
   "vitamin_a": 31,
   "potassium": 316,
   "calcium": 47,
   "iron": 0.73,
   "magnesium": 21
  },
  "percent": {
   "vitamin_c": 99.1,
   "vitamin_k": 84.7,
   "folate": 15.8,
   "vitamin_a": 3.4,
   "potassium": 9.3,
   "calcium": 4.7,
   "iron": 4.1,
   "magnesium": 5
  },
  "good": [
   "Folate (DFE)"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "cauliflower": {
  "values": {
   "vitamin_c": 48.2,
   "vitamin_k": 15.5,
   "folate": 57,
   "vitamin_a": 0,
   "potassium": 299,
   "calcium": 22,
   "iron": 0.42,
   "magnesium": 15
  },
  "percent": {
   "vitamin_c": 53.6,
   "vitamin_k": 12.9,
   "folate": 14.2,
   "vitamin_a": 0,
   "potassium": 8.8,
   "calcium": 2.2,
   "iron": 2.3,
   "magnesium": 3.6
  },
  "good": [
   "Vitamin K",
   "Folate (DFE)"
  ],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "red_cabbage": {
  "values": {
   "vitamin_c": 57,
   "vitamin_k": 38.2,
   "folate": 18,
   "vitamin_a": 56,
   "potassium": 243,
   "calcium": 45,
   "iron": 0.8,
   "magnesium": 16
  },
  "percent": {
   "vitamin_c": 63.3,
   "vitamin_k": 31.8,
   "folate": 4.5,
   "vitamin_a": 6.2,
   "potassium": 7.1,
   "calcium": 4.5,
   "iron": 4.4,
   "magnesium": 3.8
  },
  "good": [],
  "excellent": [
   "Vitamin C",
   "Vitamin K"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "brussels": {
  "values": {
   "vitamin_c": 85,
   "vitamin_k": 177,
   "folate": 61,
   "vitamin_a": 38,
   "potassium": 389,
   "calcium": 42,
   "iron": 1.4,
   "magnesium": 23
  },
  "percent": {
   "vitamin_c": 94.4,
   "vitamin_k": 147.5,
   "folate": 15.3,
   "vitamin_a": 4.2,
   "potassium": 11.4,
   "calcium": 4.2,
   "iron": 7.8,
   "magnesium": 5.5
  },
  "good": [
   "Folate (DFE)",
   "Potassium"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS)."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "radish": {
  "values": {
   "vitamin_c": 14.8,
   "vitamin_k": 1.3,
   "folate": 25,
   "vitamin_a": 0,
   "potassium": 233,
   "calcium": 25,
   "iron": 0.34,
   "magnesium": 10
  },
  "percent": {
   "vitamin_c": 16.4,
   "vitamin_k": 1.1,
   "folate": 6.3,
   "vitamin_a": 0,
   "potassium": 6.9,
   "calcium": 2.5,
   "iron": 1.9,
   "magnesium": 2.4
  },
  "good": [
   "Vitamin C"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "carrot": {
  "values": {
   "vitamin_c": 5.9,
   "vitamin_k": 13.2,
   "folate": 19,
   "vitamin_a": 835,
   "potassium": 320,
   "calcium": 33,
   "iron": 0.3,
   "magnesium": 12
  },
  "percent": {
   "vitamin_c": 6.6,
   "vitamin_k": 11,
   "folate": 4.8,
   "vitamin_a": 92.8,
   "potassium": 9.4,
   "calcium": 3.3,
   "iron": 1.7,
   "magnesium": 2.9
  },
  "good": [
   "Vitamin K"
  ],
  "excellent": [
   "Vitamin A (RAE)"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "beet": {
  "values": {
   "vitamin_c": 4.9,
   "vitamin_k": 0.2,
   "folate": 109,
   "vitamin_a": 2,
   "potassium": 325,
   "calcium": 16,
   "iron": 0.8,
   "magnesium": 23
  },
  "percent": {
   "vitamin_c": 5.4,
   "vitamin_k": 0.2,
   "folate": 27.3,
   "vitamin_a": 0.2,
   "potassium": 9.6,
   "calcium": 1.6,
   "iron": 4.4,
   "magnesium": 5.5
  },
  "good": [],
  "excellent": [
   "Folate (DFE)"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "sweet_potato": {
  "values": {
   "vitamin_c": 2.4,
   "vitamin_k": 1.8,
   "folate": 11,
   "vitamin_a": 709,
   "potassium": 337,
   "calcium": 30,
   "iron": 0.61,
   "magnesium": 25
  },
  "percent": {
   "vitamin_c": 2.7,
   "vitamin_k": 1.5,
   "folate": 2.8,
   "vitamin_a": 78.8,
   "potassium": 9.9,
   "calcium": 3,
   "iron": 3.4,
   "magnesium": 6
  },
  "good": [],
  "excellent": [
   "Vitamin A (RAE)"
  ],
  "notes": [
   "Calcium is listed but poorly absorbed because of oxalate (NIH names spinach, collards, sweet potatoes and rhubarb; spinach is about 5% absorbed versus 27% from milk). Do not count it as a full calcium source."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "parsnip": {
  "values": {
   "vitamin_c": 17,
   "vitamin_k": 22.5,
   "folate": 67,
   "vitamin_a": 0,
   "potassium": 375,
   "calcium": 36,
   "iron": 0.59,
   "magnesium": 29
  },
  "percent": {
   "vitamin_c": 18.9,
   "vitamin_k": 18.8,
   "folate": 16.8,
   "vitamin_a": 0,
   "potassium": 11,
   "calcium": 3.6,
   "iron": 3.3,
   "magnesium": 6.9
  },
  "good": [
   "Vitamin C",
   "Vitamin K",
   "Folate (DFE)",
   "Potassium"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "ginger": {
  "values": {
   "vitamin_c": 5,
   "vitamin_k": 0.1,
   "folate": 11,
   "vitamin_a": 0,
   "potassium": 415,
   "calcium": 16,
   "iron": 0.6,
   "magnesium": 43
  },
  "percent": {
   "vitamin_c": 5.6,
   "vitamin_k": 0.1,
   "folate": 2.8,
   "vitamin_a": 0,
   "potassium": 12.2,
   "calcium": 1.6,
   "iron": 3.3,
   "magnesium": 10.2
  },
  "good": [
   "Potassium",
   "Magnesium"
  ],
  "excellent": [],
  "notes": [
   "Potassium-rich (400 mg or more per 100 g); people with kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics should check with a clinician.",
   "Usually eaten in small amounts (garnish or a few leaves), so per-100 g numbers overstate what a normal serving gives."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "celery": {
  "values": {
   "vitamin_c": 3.1,
   "vitamin_k": 29.3,
   "folate": 36,
   "vitamin_a": 22,
   "potassium": 260,
   "calcium": 40,
   "iron": 0.2,
   "magnesium": 11
  },
  "percent": {
   "vitamin_c": 3.4,
   "vitamin_k": 24.4,
   "folate": 9,
   "vitamin_a": 2.4,
   "potassium": 7.6,
   "calcium": 4,
   "iron": 1.1,
   "magnesium": 2.6
  },
  "good": [],
  "excellent": [
   "Vitamin K"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "cucumber": {
  "values": {
   "vitamin_c": 2.8,
   "vitamin_k": 16.4,
   "folate": 7,
   "vitamin_a": 5,
   "potassium": 147,
   "calcium": 16,
   "iron": 0.28,
   "magnesium": 13
  },
  "percent": {
   "vitamin_c": 3.1,
   "vitamin_k": 13.7,
   "folate": 1.8,
   "vitamin_a": 0.6,
   "potassium": 4.3,
   "calcium": 1.6,
   "iron": 1.6,
   "magnesium": 3.1
  },
  "good": [
   "Vitamin K"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "tomato": {
  "values": {
   "vitamin_c": 13.7,
   "vitamin_k": 7.9,
   "folate": 15,
   "vitamin_a": 42,
   "potassium": 237,
   "calcium": 10,
   "iron": 0.27,
   "magnesium": 11
  },
  "percent": {
   "vitamin_c": 15.2,
   "vitamin_k": 6.6,
   "folate": 3.8,
   "vitamin_a": 4.7,
   "potassium": 7,
   "calcium": 1,
   "iron": 1.5,
   "magnesium": 2.6
  },
  "good": [
   "Vitamin C"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "red_pepper": {
  "values": {
   "vitamin_c": 127.7,
   "vitamin_k": 4.9,
   "folate": 46,
   "vitamin_a": 157,
   "potassium": 211,
   "calcium": 7,
   "iron": 0.43,
   "magnesium": 12
  },
  "percent": {
   "vitamin_c": 141.9,
   "vitamin_k": 4.1,
   "folate": 11.5,
   "vitamin_a": 17.4,
   "potassium": 6.2,
   "calcium": 0.7,
   "iron": 2.4,
   "magnesium": 2.9
  },
  "good": [
   "Folate (DFE)",
   "Vitamin A (RAE)"
  ],
  "excellent": [
   "Vitamin C"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "zucchini": {
  "values": {
   "vitamin_c": 17.9,
   "vitamin_k": 4.3,
   "folate": 24,
   "vitamin_a": 10,
   "potassium": 261,
   "calcium": 16,
   "iron": 0.37,
   "magnesium": 18
  },
  "percent": {
   "vitamin_c": 19.9,
   "vitamin_k": 3.6,
   "folate": 6,
   "vitamin_a": 1.1,
   "potassium": 7.7,
   "calcium": 1.6,
   "iron": 2.1,
   "magnesium": 4.3
  },
  "good": [
   "Vitamin C"
  ],
  "excellent": [],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "butternut": {
  "values": {
   "vitamin_c": 3,
   "vitamin_k": 1.1,
   "folate": 15,
   "vitamin_a": 220,
   "potassium": 357,
   "calcium": 22,
   "iron": 0.35,
   "magnesium": 16
  },
  "percent": {
   "vitamin_c": 3.3,
   "vitamin_k": 0.9,
   "folate": 3.8,
   "vitamin_a": 24.4,
   "potassium": 10.5,
   "calcium": 2.2,
   "iron": 1.9,
   "magnesium": 3.8
  },
  "good": [
   "Potassium"
  ],
  "excellent": [
   "Vitamin A (RAE)"
  ],
  "notes": [
   "Databases disagree for butternut squash: the Canadian Nutrient File (used here) lists vitamin A 220 ug RAE and vitamin C 3 mg; another database lists 532 ug RAE and 21 mg. Treat these as approximate."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "fennel": {
  "values": {
   "vitamin_c": 12,
   "vitamin_k": 62.8,
   "folate": 27,
   "vitamin_a": 48,
   "potassium": 414,
   "calcium": 49,
   "iron": 0.73,
   "magnesium": 17
  },
  "percent": {
   "vitamin_c": 13.3,
   "vitamin_k": 52.3,
   "folate": 6.8,
   "vitamin_a": 5.3,
   "potassium": 12.2,
   "calcium": 4.9,
   "iron": 4.1,
   "magnesium": 4
  },
  "good": [
   "Vitamin C",
   "Potassium"
  ],
  "excellent": [
   "Vitamin K"
  ],
  "notes": [
   "Potassium-rich (400 mg or more per 100 g); people with kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics should check with a clinician."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "asparagus": {
  "values": {
   "vitamin_c": 5.6,
   "vitamin_k": 41.6,
   "folate": 52,
   "vitamin_a": 38,
   "potassium": 202,
   "calcium": 24,
   "iron": 2.14,
   "magnesium": 14
  },
  "percent": {
   "vitamin_c": 6.2,
   "vitamin_k": 34.7,
   "folate": 13,
   "vitamin_a": 4.2,
   "potassium": 5.9,
   "calcium": 2.4,
   "iron": 11.9,
   "magnesium": 3.3
  },
  "good": [
   "Folate (DFE)",
   "Iron"
  ],
  "excellent": [
   "Vitamin K"
  ],
  "notes": [],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "rhubarb": {
  "values": {
   "vitamin_c": 8,
   "vitamin_k": 29.3,
   "folate": 7,
   "vitamin_a": 5,
   "potassium": 288,
   "calcium": 86,
   "iron": 0.22,
   "magnesium": 12
  },
  "percent": {
   "vitamin_c": 8.9,
   "vitamin_k": 24.4,
   "folate": 1.8,
   "vitamin_a": 0.6,
   "potassium": 8.5,
   "calcium": 8.6,
   "iron": 1.2,
   "magnesium": 2.9
  },
  "good": [],
  "excellent": [
   "Vitamin K"
  ],
  "notes": [
   "Calcium is listed but poorly absorbed because of oxalate (NIH names spinach, collards, sweet potatoes and rhubarb; spinach is about 5% absorbed versus 27% from milk). Do not count it as a full calcium source."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "mint": {
  "values": {
   "vitamin_c": 13.3,
   "vitamin_k": null,
   "folate": 105,
   "vitamin_a": 203,
   "potassium": 458,
   "calcium": 199,
   "iron": 11.9,
   "magnesium": 63
  },
  "percent": {
   "vitamin_c": 14.8,
   "vitamin_k": null,
   "folate": 26.3,
   "vitamin_a": 22.6,
   "potassium": 13.5,
   "calcium": 19.9,
   "iron": 65.9,
   "magnesium": 15
  },
  "good": [
   "Vitamin C",
   "Potassium",
   "Calcium",
   "Magnesium"
  ],
  "excellent": [
   "Folate (DFE)",
   "Vitamin A (RAE)",
   "Iron"
  ],
  "notes": [
   "Potassium-rich (400 mg or more per 100 g); people with kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics should check with a clinician.",
   "Usually eaten in small amounts (garnish or a few leaves), so per-100 g numbers overstate what a normal serving gives.",
   "Vitamin K is not available for this entry and is left blank rather than guessed."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "basil": {
  "values": {
   "vitamin_c": 18,
   "vitamin_k": 414.8,
   "folate": 68,
   "vitamin_a": 264,
   "potassium": 295,
   "calcium": 177,
   "iron": 3.17,
   "magnesium": 64
  },
  "percent": {
   "vitamin_c": 20,
   "vitamin_k": 345.7,
   "folate": 17,
   "vitamin_a": 29.3,
   "potassium": 8.7,
   "calcium": 17.7,
   "iron": 17.6,
   "magnesium": 15.2
  },
  "good": [
   "Folate (DFE)",
   "Calcium",
   "Iron",
   "Magnesium"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K",
   "Vitamin A (RAE)"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS).",
   "Usually eaten in small amounts (garnish or a few leaves), so per-100 g numbers overstate what a normal serving gives."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "parsley": {
  "values": {
   "vitamin_c": 133,
   "vitamin_k": 1640,
   "folate": 152,
   "vitamin_a": 421,
   "potassium": 554,
   "calcium": 138,
   "iron": 6.2,
   "magnesium": 50
  },
  "percent": {
   "vitamin_c": 147.8,
   "vitamin_k": 1366.7,
   "folate": 38,
   "vitamin_a": 46.8,
   "potassium": 16.3,
   "calcium": 13.8,
   "iron": 34.4,
   "magnesium": 11.9
  },
  "good": [
   "Potassium",
   "Calcium",
   "Magnesium"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K",
   "Folate (DFE)",
   "Vitamin A (RAE)",
   "Iron"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich (400 mg or more per 100 g); people with kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics should check with a clinician.",
   "Usually eaten in small amounts (garnish or a few leaves), so per-100 g numbers overstate what a normal serving gives."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 },
 "cilantro": {
  "values": {
   "vitamin_c": 27,
   "vitamin_k": 310,
   "folate": 62,
   "vitamin_a": 337,
   "potassium": 521,
   "calcium": 67,
   "iron": 1.77,
   "magnesium": 26
  },
  "percent": {
   "vitamin_c": 30,
   "vitamin_k": 258.3,
   "folate": 15.5,
   "vitamin_a": 37.4,
   "potassium": 15.3,
   "calcium": 6.7,
   "iron": 9.8,
   "magnesium": 6.2
  },
  "good": [
   "Folate (DFE)",
   "Potassium"
  ],
  "excellent": [
   "Vitamin C",
   "Vitamin K",
   "Vitamin A (RAE)"
  ],
  "notes": [
   "Vitamin K is high; people on warfarin should keep intake consistent day to day and tell their prescriber (NIH ODS).",
   "Potassium-rich (400 mg or more per 100 g); people with kidney disease or on ACE inhibitors, ARBs or potassium-sparing diuretics should check with a clinician.",
   "Usually eaten in small amounts (garnish or a few leaves), so per-100 g numbers overstate what a normal serving gives."
  ],
  "source": "Canadian Nutrient File (Health Canada)"
 }
};
export const RANKINGS: Record<NutrientKey, { all: { id: string; value: number }[]; noHerbs: { id: string; value: number }[] }> = {
 "vitamin_c": {
  "all": [
   {
    "id": "parsley",
    "value": 133
   },
   {
    "id": "red_pepper",
    "value": 127.7
   },
   {
    "id": "kale",
    "value": 120
   },
   {
    "id": "kiwi",
    "value": 92.7
   },
   {
    "id": "broccoli",
    "value": 89.2
   },
   {
    "id": "brussels",
    "value": 85
   },
   {
    "id": "papaya",
    "value": 60.9
   },
   {
    "id": "strawberries",
    "value": 58.8
   },
   {
    "id": "red_cabbage",
    "value": 57
   },
   {
    "id": "orange",
    "value": 53.2
   }
  ],
  "noHerbs": [
   {
    "id": "red_pepper",
    "value": 127.7
   },
   {
    "id": "kale",
    "value": 120
   },
   {
    "id": "kiwi",
    "value": 92.7
   },
   {
    "id": "broccoli",
    "value": 89.2
   },
   {
    "id": "brussels",
    "value": 85
   },
   {
    "id": "papaya",
    "value": 60.9
   },
   {
    "id": "strawberries",
    "value": 58.8
   },
   {
    "id": "red_cabbage",
    "value": 57
   },
   {
    "id": "orange",
    "value": 53.2
   },
   {
    "id": "lemon",
    "value": 53
   }
  ]
 },
 "vitamin_k": {
  "all": [
   {
    "id": "parsley",
    "value": 1640
   },
   {
    "id": "chard",
    "value": 830
   },
   {
    "id": "kale",
    "value": 704.8
   },
   {
    "id": "spinach",
    "value": 482.9
   },
   {
    "id": "collards",
    "value": 437.1
   },
   {
    "id": "basil",
    "value": 414.8
   },
   {
    "id": "cilantro",
    "value": 310
   },
   {
    "id": "watercress",
    "value": 250
   },
   {
    "id": "brussels",
    "value": 177
   },
   {
    "id": "arugula",
    "value": 108.6
   }
  ],
  "noHerbs": [
   {
    "id": "chard",
    "value": 830
   },
   {
    "id": "kale",
    "value": 704.8
   },
   {
    "id": "spinach",
    "value": 482.9
   },
   {
    "id": "collards",
    "value": 437.1
   },
   {
    "id": "watercress",
    "value": 250
   },
   {
    "id": "brussels",
    "value": 177
   },
   {
    "id": "arugula",
    "value": 108.6
   },
   {
    "id": "romaine",
    "value": 102.5
   },
   {
    "id": "broccoli",
    "value": 101.6
   },
   {
    "id": "fennel",
    "value": 62.8
   }
  ]
 },
 "folate": {
  "all": [
   {
    "id": "spinach",
    "value": 194
   },
   {
    "id": "parsley",
    "value": 152
   },
   {
    "id": "kale",
    "value": 141
   },
   {
    "id": "romaine",
    "value": 136
   },
   {
    "id": "collards",
    "value": 129
   },
   {
    "id": "beet",
    "value": 109
   },
   {
    "id": "mint",
    "value": 105
   },
   {
    "id": "arugula",
    "value": 97
   },
   {
    "id": "avocado",
    "value": 81
   },
   {
    "id": "napa",
    "value": 79
   }
  ],
  "noHerbs": [
   {
    "id": "spinach",
    "value": 194
   },
   {
    "id": "kale",
    "value": 141
   },
   {
    "id": "romaine",
    "value": 136
   },
   {
    "id": "collards",
    "value": 129
   },
   {
    "id": "beet",
    "value": 109
   },
   {
    "id": "arugula",
    "value": 97
   },
   {
    "id": "avocado",
    "value": 81
   },
   {
    "id": "napa",
    "value": 79
   },
   {
    "id": "parsnip",
    "value": 67
   },
   {
    "id": "broccoli",
    "value": 63
   }
  ]
 },
 "vitamin_a": {
  "all": [
   {
    "id": "carrot",
    "value": 835
   },
   {
    "id": "sweet_potato",
    "value": 709
   },
   {
    "id": "kale",
    "value": 500
   },
   {
    "id": "spinach",
    "value": 469
   },
   {
    "id": "romaine",
    "value": 436
   },
   {
    "id": "parsley",
    "value": 421
   },
   {
    "id": "cilantro",
    "value": 337
   },
   {
    "id": "chard",
    "value": 306
   },
   {
    "id": "basil",
    "value": 264
   },
   {
    "id": "collards",
    "value": 251
   }
  ],
  "noHerbs": [
   {
    "id": "carrot",
    "value": 835
   },
   {
    "id": "sweet_potato",
    "value": 709
   },
   {
    "id": "kale",
    "value": 500
   },
   {
    "id": "spinach",
    "value": 469
   },
   {
    "id": "romaine",
    "value": 436
   },
   {
    "id": "chard",
    "value": 306
   },
   {
    "id": "collards",
    "value": 251
   },
   {
    "id": "butternut",
    "value": 220
   },
   {
    "id": "cantaloupe",
    "value": 169
   },
   {
    "id": "watercress",
    "value": 160
   }
  ]
 },
 "potassium": {
  "all": [
   {
    "id": "dates",
    "value": 696
   },
   {
    "id": "spinach",
    "value": 558
   },
   {
    "id": "parsley",
    "value": 554
   },
   {
    "id": "cilantro",
    "value": 521
   },
   {
    "id": "kale",
    "value": 491
   },
   {
    "id": "avocado",
    "value": 485
   },
   {
    "id": "mint",
    "value": 458
   },
   {
    "id": "ginger",
    "value": 415
   },
   {
    "id": "fennel",
    "value": 414
   },
   {
    "id": "brussels",
    "value": 389
   }
  ],
  "noHerbs": [
   {
    "id": "dates",
    "value": 696
   },
   {
    "id": "spinach",
    "value": 558
   },
   {
    "id": "kale",
    "value": 491
   },
   {
    "id": "avocado",
    "value": 485
   },
   {
    "id": "fennel",
    "value": 414
   },
   {
    "id": "brussels",
    "value": 389
   },
   {
    "id": "chard",
    "value": 379
   },
   {
    "id": "parsnip",
    "value": 375
   },
   {
    "id": "arugula",
    "value": 369
   },
   {
    "id": "banana",
    "value": 358
   }
  ]
 },
 "calcium": {
  "all": [
   {
    "id": "collards",
    "value": 232
   },
   {
    "id": "mint",
    "value": 199
   },
   {
    "id": "basil",
    "value": 177
   },
   {
    "id": "arugula",
    "value": 160
   },
   {
    "id": "kale",
    "value": 150
   },
   {
    "id": "parsley",
    "value": 138
   },
   {
    "id": "watercress",
    "value": 120
   },
   {
    "id": "spinach",
    "value": 99
   },
   {
    "id": "rhubarb",
    "value": 86
   },
   {
    "id": "napa",
    "value": 77
   }
  ],
  "noHerbs": [
   {
    "id": "collards",
    "value": 232
   },
   {
    "id": "arugula",
    "value": 160
   },
   {
    "id": "kale",
    "value": 150
   },
   {
    "id": "watercress",
    "value": 120
   },
   {
    "id": "spinach",
    "value": 99
   },
   {
    "id": "rhubarb",
    "value": 86
   },
   {
    "id": "napa",
    "value": 77
   },
   {
    "id": "dates",
    "value": 64
   },
   {
    "id": "chard",
    "value": 51
   },
   {
    "id": "fennel",
    "value": 49
   }
  ]
 },
 "iron": {
  "all": [
   {
    "id": "mint",
    "value": 11.9
   },
   {
    "id": "parsley",
    "value": 6.2
   },
   {
    "id": "basil",
    "value": 3.17
   },
   {
    "id": "spinach",
    "value": 2.71
   },
   {
    "id": "asparagus",
    "value": 2.14
   },
   {
    "id": "chard",
    "value": 1.8
   },
   {
    "id": "cilantro",
    "value": 1.77
   },
   {
    "id": "kale",
    "value": 1.47
   },
   {
    "id": "arugula",
    "value": 1.46
   },
   {
    "id": "brussels",
    "value": 1.4
   }
  ],
  "noHerbs": [
   {
    "id": "spinach",
    "value": 2.71
   },
   {
    "id": "asparagus",
    "value": 2.14
   },
   {
    "id": "chard",
    "value": 1.8
   },
   {
    "id": "kale",
    "value": 1.47
   },
   {
    "id": "arugula",
    "value": 1.46
   },
   {
    "id": "brussels",
    "value": 1.4
   },
   {
    "id": "romaine",
    "value": 0.97
   },
   {
    "id": "dates",
    "value": 0.9
   },
   {
    "id": "red_cabbage",
    "value": 0.8
   },
   {
    "id": "beet",
    "value": 0.8
   }
  ]
 },
 "magnesium": {
  "all": [
   {
    "id": "chard",
    "value": 81
   },
   {
    "id": "spinach",
    "value": 79
   },
   {
    "id": "basil",
    "value": 64
   },
   {
    "id": "mint",
    "value": 63
   },
   {
    "id": "dates",
    "value": 54
   },
   {
    "id": "parsley",
    "value": 50
   },
   {
    "id": "kale",
    "value": 47
   },
   {
    "id": "arugula",
    "value": 47
   },
   {
    "id": "ginger",
    "value": 43
   },
   {
    "id": "avocado",
    "value": 29
   }
  ],
  "noHerbs": [
   {
    "id": "chard",
    "value": 81
   },
   {
    "id": "spinach",
    "value": 79
   },
   {
    "id": "dates",
    "value": 54
   },
   {
    "id": "kale",
    "value": 47
   },
   {
    "id": "arugula",
    "value": 47
   },
   {
    "id": "avocado",
    "value": 29
   },
   {
    "id": "parsnip",
    "value": 29
   },
   {
    "id": "banana",
    "value": 27
   },
   {
    "id": "collards",
    "value": 27
   },
   {
    "id": "sweet_potato",
    "value": 25
   }
  ]
 }
};
export const MATRIX_UNVERIFIED: string[] = [
  "Values were cross-checked against Health Canada's Canadian Nutrient File and the Canadian values are used wherever a matching entry exists; the research file's original values (read from mirror pages of USDA FoodData Central) agreed within a few percent for almost every food. The exceptions are flagged on kale, napa cabbage and butternut squash.",
  "Reference amounts use the higher of the male and female adult values, so source flags are conservative for women's iron and other cases where needs differ.",
  "Bioavailability is noted only where an NIH page states it (calcium in spinach, collards, sweet potatoes and rhubarb; iron in spinach).",
  "The 'good' (10-19.9%) and 'excellent' (20% or more) thresholds follow the common food-label convention and are our own choice here, not an NIH rule.",
];
