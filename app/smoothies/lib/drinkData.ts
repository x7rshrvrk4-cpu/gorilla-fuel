import type { Drink, Source } from "./produceData";

export const DRINKS: Drink[] = [
 {
  "id": "r01",
  "name": "Blueberry Spinach Greek Yogurt",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "blueberries",
    "name": "Blueberries",
    "grams": 150,
    "household": "~1 cup"
   },
   {
    "id": "spinach",
    "name": "Spinach",
    "grams": 30,
    "household": "~1 packed cup"
   },
   {
    "id": "greek-yogurt",
    "name": "Plain nonfat Greek yogurt",
    "grams": 170,
    "household": "~3/4 cup"
   },
   {
    "id": "almond-milk",
    "name": "Unsweetened almond milk (typical label)",
    "grams": 120,
    "household": "~1/2 cup"
   },
   {
    "id": "chia",
    "name": "Chia seeds",
    "grams": 10,
    "household": "~1 tbsp"
   }
  ],
  "method": "Blend almond milk, spinach and yogurt first, then berries and chia. Rest 2 minutes so the chia thickens.",
  "flavour": "Tart berries and tangy yogurt cover the mild taste of spinach.",
  "nutrition": "Greek yogurt supplies most of the protein; blueberries and chia supply fibre; spinach adds folate and vitamin K. Blueberry-cognition trials are promising but not conclusive, so no brain claim is made.",
  "perServing": {
   "kcal": 258,
   "protein": 22.2,
   "sugar": 20.5,
   "fibre": 8.3,
   "wholeProduceFibre": null,
   "grams": 480
  },
  "sugarFlag": "high",
  "tags": [
   "high protein",
   "recovery"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Contains milk.",
   "Contains tree nuts."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S14"
  ]
 },
 {
  "id": "r02",
  "name": "Strawberry Banana Oat Breakfast",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "strawberries",
    "name": "Strawberries",
    "grams": 150,
    "household": "~1 cup sliced"
   },
   {
    "id": "banana",
    "name": "Bananas",
    "grams": 100,
    "household": "~1 small"
   },
   {
    "id": "oats",
    "name": "Rolled oats",
    "grams": 30,
    "household": "~1/3 cup"
   },
   {
    "id": "milk2",
    "name": "2% milk",
    "grams": 200,
    "household": "~3/4 cup"
   },
   {
    "id": "chia",
    "name": "Chia seeds",
    "grams": 10,
    "household": "~1 tbsp"
   }
  ],
  "method": "Blend oats with milk first for 30 seconds, then add fruit and chia.",
  "flavour": "Banana gives sweetness and creaminess, so no added sweetener is needed.",
  "nutrition": "Oats and chia add fibre and slower-digesting carbohydrate; milk adds protein.",
  "perServing": {
   "kcal": 404,
   "protein": 14.3,
   "sugar": 30,
   "fibre": 11.3,
   "wholeProduceFibre": null,
   "grams": 490
  },
  "sugarFlag": "high",
  "tags": [
   "energy"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Oats may be cross-contaminated with gluten; choose certified gluten-free oats if needed.",
   "Contains milk."
  ],
  "cautions": [],
  "sources": [
   "S1"
  ]
 },
 {
  "id": "r03",
  "name": "Kiwi Cucumber Pear Cooler",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "kiwi",
    "name": "Kiwifruit (green)",
    "grams": 150,
    "household": "~2 kiwis"
   },
   {
    "id": "cucumber",
    "name": "Cucumber (with peel)",
    "grams": 100,
    "household": "~1/2 cup sliced"
   },
   {
    "id": "pear",
    "name": "Pears",
    "grams": 120,
    "household": "~1 small pear"
   },
   {
    "id": "mint",
    "name": "Spearmint (fresh)",
    "grams": 3,
    "household": "~6 leaves"
   },
   {
    "id": "chia",
    "name": "Chia seeds",
    "grams": 10,
    "household": "~1 tbsp"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 150,
    "household": "~2/3 cup"
   }
  ],
  "method": "Blend everything except chia, stir in chia and let stand 5 minutes.",
  "flavour": "Bright and tart from kiwi, cooled by cucumber and mint.",
  "nutrition": "Pear and kiwi bring fibre and vitamin C. Kiwifruit may modestly help bowel regularity, but certainty is low.",
  "perServing": {
   "kcal": 226,
   "protein": 4.5,
   "sugar": 26.9,
   "fibre": 12.5,
   "wholeProduceFibre": null,
   "grams": 533
  },
  "sugarFlag": "high",
  "tags": [
   "digestion"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [],
  "sources": [
   "S1",
   "S12"
  ]
 },
 {
  "id": "r04",
  "name": "Mango Papaya Ginger Kefir",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "mango",
    "name": "Mango",
    "grams": 120,
    "household": "~3/4 cup"
   },
   {
    "id": "papaya",
    "name": "Papaya",
    "grams": 100,
    "household": "~2/3 cup"
   },
   {
    "id": "ginger",
    "name": "Ginger (fresh root)",
    "grams": 5,
    "household": "~1 tsp grated"
   },
   {
    "id": "kefir",
    "name": "Plain low-fat kefir",
    "grams": 150,
    "household": "~2/3 cup"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 50,
    "household": "~3 tbsp"
   }
  ],
  "method": "Blend ginger with the kefir first so it is fully broken down.",
  "flavour": "Tropical sweetness with a warm ginger edge and tang from kefir.",
  "nutrition": "Mango and papaya are vitamin C-rich; kefir adds protein. Ginger has the most consistent support for nausea. The 'immunity' tag means vitamin C/A-rich only, not an illness-prevention claim.",
  "perServing": {
   "kcal": 175,
   "protein": 6.2,
   "sugar": 28.8,
   "fibre": 3.7,
   "wholeProduceFibre": null,
   "grams": 425
  },
  "sugarFlag": "high",
  "tags": [
   "immunity"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Contains milk."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S11"
  ]
 },
 {
  "id": "r05",
  "name": "Beet Raspberry Cherry Recovery",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "beet",
    "name": "Beets (raw)",
    "grams": 60,
    "household": "~1/2 small beet"
   },
   {
    "id": "raspberries",
    "name": "Raspberries",
    "grams": 100,
    "household": "~3/4 cup"
   },
   {
    "id": "cherries",
    "name": "Sweet cherries",
    "grams": 80,
    "household": "~1/2 cup pitted"
   },
   {
    "id": "kefir",
    "name": "Plain low-fat kefir",
    "grams": 150,
    "household": "~2/3 cup"
   },
   {
    "id": "hemp",
    "name": "Hemp seeds (hulled)",
    "grams": 15,
    "household": "~1.5 tbsp"
   }
  ],
  "method": "Grate or finely chop the beet so it blends smooth; use frozen cherries for a thicker drink.",
  "flavour": "Earthy beet is balanced by sweet-tart berries and creamy kefir.",
  "nutrition": "Raspberries add fibre; hemp adds protein; beet juice nitrate has preliminary blood-pressure evidence, but this recipe uses a small whole-beet portion. Tart-cherry recovery evidence does not apply to sweet cherries.",
  "perServing": {
   "kcal": 272,
   "protein": 12.6,
   "sugar": 23.5,
   "fibre": 10.1,
   "wholeProduceFibre": null,
   "grams": 405
  },
  "sugarFlag": "high",
  "tags": [
   "recovery"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Contains milk."
  ],
  "cautions": [
   "Beets are commonly listed as a higher-oxalate food; check with a clinician if you form kidney stones."
  ],
  "sources": [
   "S1",
   "S10",
   "S13"
  ]
 },
 {
  "id": "r06",
  "name": "Carrot Orange Ginger with Avocado",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "carrot",
    "name": "Carrots",
    "grams": 100,
    "household": "~1 medium"
   },
   {
    "id": "orange",
    "name": "Oranges",
    "grams": 150,
    "household": "~1 orange"
   },
   {
    "id": "ginger",
    "name": "Ginger (fresh root)",
    "grams": 4,
    "household": "~3/4 tsp grated"
   },
   {
    "id": "avocado",
    "name": "Avocado",
    "grams": 40,
    "household": "~1/4 avocado"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 120,
    "household": "~1/2 cup"
   }
  ],
  "method": "Use a high-speed blender for the raw carrot; blend 60-90 seconds.",
  "flavour": "Sweet orange and carrot with creamy avocado and a ginger bite.",
  "nutrition": "Carotenoids from carrot are absorbed better with fat; the small avocado portion supplies it (small study). Orange adds vitamin C.",
  "perServing": {
   "kcal": 179,
   "protein": 3.2,
   "sugar": 19.1,
   "fibre": 7.9,
   "wholeProduceFibre": null,
   "grams": 414
  },
  "sugarFlag": "moderate",
  "tags": [
   "energy",
   "immunity"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [],
  "sources": [
   "S1",
   "S27"
  ]
 },
 {
  "id": "r07",
  "name": "Green Pineapple Avocado Cooler",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "avocado",
    "name": "Avocado",
    "grams": 60,
    "household": "~1/3 avocado"
   },
   {
    "id": "spinach",
    "name": "Spinach",
    "grams": 40,
    "household": "~1 packed cup"
   },
   {
    "id": "pineapple",
    "name": "Pineapple",
    "grams": 100,
    "household": "~2/3 cup"
   },
   {
    "id": "lime",
    "name": "Limes",
    "grams": 15,
    "household": "~1 tbsp"
   },
   {
    "id": "coconut-water",
    "name": "Unsweetened coconut water",
    "grams": 200,
    "household": "~3/4 cup"
   }
  ],
  "method": "Blend spinach with coconut water first, then the rest.",
  "flavour": "Pineapple and lime keep it bright; avocado makes it silky.",
  "nutrition": "Avocado contributes fat and fibre; spinach adds folate. Pineapple's bromelain evidence is for supplements, not fruit.",
  "perServing": {
   "kcal": 198,
   "protein": 4.4,
   "sugar": 15.9,
   "fibre": 8.9,
   "wholeProduceFibre": null,
   "grams": 415
  },
  "sugarFlag": "moderate",
  "tags": [
   "energy"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [],
  "sources": [
   "S1",
   "S24"
  ]
 },
 {
  "id": "r08",
  "name": "Kale Apple Lemon Hemp",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "kale",
    "name": "Kale",
    "grams": 40,
    "household": "~2 cups chopped"
   },
   {
    "id": "apple",
    "name": "Apples (with skin)",
    "grams": 120,
    "household": "~1 small apple"
   },
   {
    "id": "lemon",
    "name": "Lemons (flesh, no peel)",
    "grams": 20,
    "household": "~1 wedge"
   },
   {
    "id": "hemp",
    "name": "Hemp seeds (hulled)",
    "grams": 20,
    "household": "~2 tbsp"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 250,
    "household": "~1 cup"
   }
  ],
  "method": "Blend kale with water and lemon for 60 seconds before adding apple and hemp.",
  "flavour": "Apple sweetens kale; lemon lifts the green flavour.",
  "nutrition": "Kale gives vitamin C, vitamin K and calcium; hemp adds protein and fat; apple with skin adds fibre.",
  "perServing": {
   "kcal": 205,
   "protein": 8.8,
   "sugar": 14.2,
   "fibre": 4.8,
   "wholeProduceFibre": null,
   "grams": 450
  },
  "sugarFlag": "moderate",
  "tags": [
   "digestion"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [],
  "sources": [
   "S1",
   "S2"
  ]
 },
 {
  "id": "r09",
  "name": "Iron-Friendly Spinach Orange Berry",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "spinach",
    "name": "Spinach",
    "grams": 60,
    "household": "~2 packed cups"
   },
   {
    "id": "orange",
    "name": "Oranges",
    "grams": 150,
    "household": "~1 orange"
   },
   {
    "id": "strawberries",
    "name": "Strawberries",
    "grams": 100,
    "household": "~2/3 cup"
   },
   {
    "id": "hemp",
    "name": "Hemp seeds (hulled)",
    "grams": 20,
    "household": "~2 tbsp"
   },
   {
    "id": "almond-milk",
    "name": "Unsweetened almond milk (typical label)",
    "grams": 200,
    "household": "~3/4 cup"
   }
  ],
  "method": "Blend spinach and almond milk first, then add fruit and hemp.",
  "flavour": "Citrus and strawberries mask the flavour of spinach.",
  "nutrition": "Vitamin C from orange and strawberry increases absorption of plant (nonheme) iron (NIH ODS), which is the point of the pairing; spinach and hemp supply the iron.",
  "perServing": {
   "kcal": 264,
   "protein": 11.5,
   "sugar": 19.5,
   "fibre": 7.9,
   "wholeProduceFibre": null,
   "grams": 530
  },
  "sugarFlag": "moderate",
  "tags": [
   "immunity",
   "recovery"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [
   "Contains tree nuts."
  ],
  "cautions": [
   "Spinach is high in oxalate."
  ],
  "sources": [
   "S1",
   "S22",
   "S4"
  ]
 },
 {
  "id": "r10",
  "name": "Gazpacho-Style Tomato Pepper Blend",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "tomato",
    "name": "Tomatoes (red, ripe)",
    "grams": 200,
    "household": "~1 large tomato"
   },
   {
    "id": "red_pepper",
    "name": "Red bell pepper",
    "grams": 80,
    "household": "~1/2 pepper"
   },
   {
    "id": "cucumber",
    "name": "Cucumber (with peel)",
    "grams": 80,
    "household": "~1/3 cup"
   },
   {
    "id": "celery",
    "name": "Celery",
    "grams": 40,
    "household": "~1 stalk"
   },
   {
    "id": "basil",
    "name": "Basil (fresh)",
    "grams": 5,
    "household": "~5 leaves"
   },
   {
    "id": "olive-oil",
    "name": "Olive oil",
    "grams": 5,
    "household": "~1 tsp"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 50,
    "household": "~3 tbsp"
   }
  ],
  "method": "Blend until smooth; chill and add a pinch of salt and black pepper to taste (not counted).",
  "flavour": "Savoury and cooling, like a drinkable gazpacho.",
  "nutrition": "Tomato provides lycopene; the olive oil provides fat for carotenoid absorption (small study). Red pepper adds vitamin C.",
  "perServing": {
   "kcal": 125,
   "protein": 3.5,
   "sugar": 10.5,
   "fibre": 4.8,
   "wholeProduceFibre": null,
   "grams": 460
  },
  "sugarFlag": "low",
  "tags": [
   "low sugar"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "Celery adds a little sodium."
  ],
  "sources": [
   "S1",
   "S15",
   "S27"
  ]
 },
 {
  "id": "r11",
  "name": "Cantaloupe Cucumber Mint Hydrator",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "cantaloupe",
    "name": "Cantaloupe",
    "grams": 200,
    "household": "~1.25 cups cubed"
   },
   {
    "id": "cucumber",
    "name": "Cucumber (with peel)",
    "grams": 100,
    "household": "~1/2 cup"
   },
   {
    "id": "mint",
    "name": "Spearmint (fresh)",
    "grams": 3,
    "household": "~6 leaves"
   },
   {
    "id": "lime",
    "name": "Limes",
    "grams": 15,
    "household": "~1 tbsp"
   },
   {
    "id": "coconut-water",
    "name": "Unsweetened coconut water",
    "grams": 150,
    "household": "~2/3 cup"
   }
  ],
  "method": "Blend and serve over ice.",
  "flavour": "Sweet melon, cool cucumber, fresh mint.",
  "nutrition": "Cantaloupe supplies beta-carotene and vitamin C; coconut water adds a little potassium and fluid.",
  "perServing": {
   "kcal": 118,
   "protein": 3.6,
   "sugar": 21.6,
   "fibre": 4.4,
   "wholeProduceFibre": null,
   "grams": 468
  },
  "sugarFlag": "high",
  "tags": [
   "energy"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [],
  "sources": [
   "S1"
  ]
 },
 {
  "id": "r12",
  "name": "Pomegranate Blackberry Yogurt",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "pomegranate",
    "name": "Pomegranate (arils)",
    "grams": 80,
    "household": "~1/2 cup arils"
   },
   {
    "id": "blackberries",
    "name": "Blackberries",
    "grams": 80,
    "household": "~1/2 cup"
   },
   {
    "id": "greek-yogurt",
    "name": "Plain nonfat Greek yogurt",
    "grams": 170,
    "household": "~3/4 cup"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 100,
    "household": "~1/2 cup"
   }
  ],
  "method": "Strain if you dislike pomegranate seeds, but straining removes fibre.",
  "flavour": "Sharp, sweet-tart berries against creamy yogurt.",
  "nutrition": "Yogurt gives protein; blackberries give fibre. Pomegranate blood-pressure data vary widely between trials, so no health claim is made.",
  "perServing": {
   "kcal": 199,
   "protein": 20.3,
   "sugar": 20.3,
   "fibre": 7.4,
   "wholeProduceFibre": null,
   "grams": 430
  },
  "sugarFlag": "high",
  "tags": [
   "high protein",
   "recovery"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Contains milk."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S16"
  ]
 },
 {
  "id": "r13",
  "name": "Cauliflower Banana Almond Butter",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "cauliflower",
    "name": "Cauliflower",
    "grams": 60,
    "household": "~1/2 cup florets"
   },
   {
    "id": "banana",
    "name": "Bananas",
    "grams": 100,
    "household": "~1 small"
   },
   {
    "id": "almond-butter",
    "name": "Almond butter",
    "grams": 16,
    "household": "~1 tbsp"
   },
   {
    "id": "oats",
    "name": "Rolled oats",
    "grams": 20,
    "household": "~3 tbsp"
   },
   {
    "id": "almond-milk",
    "name": "Unsweetened almond milk (typical label)",
    "grams": 250,
    "household": "~1 cup"
   }
  ],
  "method": "Use frozen cauliflower florets for a thicker, milkshake-like texture.",
  "flavour": "Cauliflower is neutral and adds body; banana and almond butter carry the flavour.",
  "nutrition": "Cauliflower adds vitamin C and folate with almost no sugar; almond butter adds fat and protein.",
  "perServing": {
   "kcal": 317,
   "protein": 9.7,
   "sugar": 14.3,
   "fibre": 7,
   "wholeProduceFibre": null,
   "grams": 446
  },
  "sugarFlag": "moderate",
  "tags": [
   "energy",
   "recovery"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [
   "Oats may be cross-contaminated with gluten; choose certified gluten-free oats if needed.",
   "Contains tree nuts."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S25"
  ]
 },
 {
  "id": "r14",
  "name": "Parsley Pear Cucumber Lemon Green",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "parsley",
    "name": "Parsley (fresh)",
    "grams": 10,
    "household": "~1/4 cup"
   },
   {
    "id": "pear",
    "name": "Pears",
    "grams": 100,
    "household": "~1 small"
   },
   {
    "id": "cucumber",
    "name": "Cucumber (with peel)",
    "grams": 120,
    "household": "~1/2 cup"
   },
   {
    "id": "lemon",
    "name": "Lemons (flesh, no peel)",
    "grams": 20,
    "household": "~1 wedge"
   },
   {
    "id": "spinach",
    "name": "Spinach",
    "grams": 20,
    "household": "~2/3 cup"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 150,
    "household": "~2/3 cup"
   }
  ],
  "method": "Blend parsley with water and lemon first.",
  "flavour": "Fresh, herby and lightly sweet from the pear.",
  "nutrition": "Pear gives fibre; parsley gives vitamin C and flavour.",
  "perServing": {
   "kcal": 90,
   "protein": 2.2,
   "sugar": 12.4,
   "fibre": 5.2,
   "wholeProduceFibre": null,
   "grams": 420
  },
  "sugarFlag": "moderate",
  "tags": [
   "digestion"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "Parsley is extremely vitamin K-dense (1,640 ug/100 g); keep amounts consistent if you take warfarin."
  ],
  "sources": [
   "S1",
   "S2"
  ]
 },
 {
  "id": "r15",
  "name": "Peach Arugula Ginger Kefir",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "peach",
    "name": "Peaches (yellow)",
    "grams": 150,
    "household": "~1 peach"
   },
   {
    "id": "arugula",
    "name": "Arugula (rocket)",
    "grams": 30,
    "household": "~1 packed cup"
   },
   {
    "id": "ginger",
    "name": "Ginger (fresh root)",
    "grams": 4,
    "household": "~3/4 tsp"
   },
   {
    "id": "kefir",
    "name": "Plain low-fat kefir",
    "grams": 150,
    "household": "~2/3 cup"
   },
   {
    "id": "hemp",
    "name": "Hemp seeds (hulled)",
    "grams": 10,
    "household": "~1 tbsp"
   }
  ],
  "method": "Blend the arugula with the kefir first; the peppery notes soften with the peach.",
  "flavour": "Sweet peach against peppery arugula and ginger.",
  "nutrition": "Kefir and hemp supply protein; arugula adds calcium and folate.",
  "perServing": {
   "kcal": 183,
   "protein": 10.1,
   "sugar": 18,
   "fibre": 4,
   "wholeProduceFibre": null,
   "grams": 344
  },
  "sugarFlag": "moderate",
  "tags": [
   "digestion"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Contains milk."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S11"
  ]
 },
 {
  "id": "r16",
  "name": "Zucchini Blueberry Oat",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "zucchini",
    "name": "Zucchini (with skin)",
    "grams": 80,
    "household": "~1/2 small"
   },
   {
    "id": "blueberries",
    "name": "Blueberries",
    "grams": 100,
    "household": "~2/3 cup"
   },
   {
    "id": "banana",
    "name": "Bananas",
    "grams": 60,
    "household": "~1/2 small"
   },
   {
    "id": "oats",
    "name": "Rolled oats",
    "grams": 20,
    "household": "~3 tbsp"
   },
   {
    "id": "almond-milk",
    "name": "Unsweetened almond milk (typical label)",
    "grams": 250,
    "household": "~1 cup"
   },
   {
    "id": "chia",
    "name": "Chia seeds",
    "grams": 10,
    "household": "~1 tbsp"
   }
  ],
  "method": "Chop zucchini small; blend 60 seconds.",
  "flavour": "Zucchini is nearly flavourless; blueberry and banana dominate.",
  "nutrition": "Adds volume and vitamin C with few calories; oats and chia add fibre.",
  "perServing": {
   "kcal": 288,
   "protein": 8.2,
   "sugar": 19.5,
   "fibre": 10.5,
   "wholeProduceFibre": null,
   "grams": 520
  },
  "sugarFlag": "moderate",
  "tags": [
   "digestion",
   "energy"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [
   "Oats may be cross-contaminated with gluten; choose certified gluten-free oats if needed.",
   "Contains tree nuts."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S14"
  ]
 },
 {
  "id": "r17",
  "name": "Collard Mango Lime",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "collards",
    "name": "Collard greens",
    "grams": 30,
    "household": "~1 cup chopped"
   },
   {
    "id": "mango",
    "name": "Mango",
    "grams": 120,
    "household": "~3/4 cup"
   },
   {
    "id": "lime",
    "name": "Limes",
    "grams": 15,
    "household": "~1 tbsp"
   },
   {
    "id": "coconut-water",
    "name": "Unsweetened coconut water",
    "grams": 200,
    "household": "~3/4 cup"
   },
   {
    "id": "hemp",
    "name": "Hemp seeds (hulled)",
    "grams": 15,
    "household": "~1.5 tbsp"
   }
  ],
  "method": "Remove the thick stem and blend the leaves with the coconut water first.",
  "flavour": "Mango sweetness covers the bitterness of collards.",
  "nutrition": "Collards are rich in calcium and vitamin K; mango and lime add vitamin C.",
  "perServing": {
   "kcal": 212,
   "protein": 8.3,
   "sugar": 22.3,
   "fibre": 6.5,
   "wholeProduceFibre": null,
   "grams": 380
  },
  "sugarFlag": "high",
  "tags": [
   "energy"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "Collards are very high in vitamin K; keep intake consistent if you take warfarin."
  ],
  "sources": [
   "S1",
   "S2"
  ]
 },
 {
  "id": "r18",
  "name": "Watercress Pineapple Cucumber",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "watercress",
    "name": "Watercress",
    "grams": 30,
    "household": "~1 cup"
   },
   {
    "id": "pineapple",
    "name": "Pineapple",
    "grams": 120,
    "household": "~3/4 cup"
   },
   {
    "id": "cucumber",
    "name": "Cucumber (with peel)",
    "grams": 100,
    "household": "~1/2 cup"
   },
   {
    "id": "lime",
    "name": "Limes",
    "grams": 15,
    "household": "~1 tbsp"
   },
   {
    "id": "coconut-water",
    "name": "Unsweetened coconut water",
    "grams": 150,
    "household": "~2/3 cup"
   }
  ],
  "method": "Blend and serve cold.",
  "flavour": "Peppery cress cut by sweet pineapple and cooling cucumber.",
  "nutrition": "Watercress is very low in calories and rich in vitamin C and K; pineapple adds manganese.",
  "perServing": {
   "kcal": 112,
   "protein": 3.2,
   "sugar": 17.7,
   "fibre": 4.6,
   "wholeProduceFibre": null,
   "grams": 415
  },
  "sugarFlag": "moderate",
  "tags": [
   "immunity"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "Watercress is high in vitamin K."
  ],
  "sources": [
   "S1",
   "S2"
  ]
 },
 {
  "id": "r19",
  "name": "Apple Pear Oat Kefir",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "apple",
    "name": "Apples (with skin)",
    "grams": 120,
    "household": "~1 small"
   },
   {
    "id": "pear",
    "name": "Pears",
    "grams": 80,
    "household": "~1/2 pear"
   },
   {
    "id": "oats",
    "name": "Rolled oats",
    "grams": 30,
    "household": "~1/3 cup"
   },
   {
    "id": "kefir",
    "name": "Plain low-fat kefir",
    "grams": 200,
    "household": "~3/4 cup"
   },
   {
    "id": "walnuts",
    "name": "Walnuts",
    "grams": 10,
    "household": "~2 halves"
   }
  ],
  "method": "Blend oats and kefir first, then fruit and walnuts.",
  "flavour": "Autumn flavours: sweet apple and pear, nutty walnut.",
  "nutrition": "Oats, apple and pear skins supply fibre; kefir supplies protein; walnuts supply fat.",
  "perServing": {
   "kcal": 364,
   "protein": 12.3,
   "sugar": 26.8,
   "fibre": 8.1,
   "wholeProduceFibre": null,
   "grams": 440
  },
  "sugarFlag": "high",
  "tags": [
   "digestion",
   "energy"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Oats may be cross-contaminated with gluten; choose certified gluten-free oats if needed.",
   "Contains milk.",
   "Contains tree nuts."
  ],
  "cautions": [],
  "sources": [
   "S1"
  ]
 },
 {
  "id": "r20",
  "name": "Cranberry Orange Apple Ginger",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "cranberries",
    "name": "Cranberries (fresh)",
    "grams": 60,
    "household": "~1/2 cup"
   },
   {
    "id": "orange",
    "name": "Oranges",
    "grams": 120,
    "household": "~1 small orange"
   },
   {
    "id": "apple",
    "name": "Apples (with skin)",
    "grams": 100,
    "household": "~1 small"
   },
   {
    "id": "ginger",
    "name": "Ginger (fresh root)",
    "grams": 4,
    "household": "~3/4 tsp"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 150,
    "household": "~2/3 cup"
   }
  ],
  "method": "Fresh or frozen cranberries; blend 60+ seconds.",
  "flavour": "Tart cranberry balanced by orange and apple.",
  "nutrition": "Fresh cranberries are low in sugar (4.3 g/100 g). Cochrane evidence on cranberry and UTI prevention is for specific groups and uses cranberry products, so no UTI claim is made for this drink.",
  "perServing": {
   "kcal": 139,
   "protein": 1.7,
   "sugar": 24.1,
   "fibre": 6.9,
   "wholeProduceFibre": null,
   "grams": 434
  },
  "sugarFlag": "high",
  "tags": [
   "immunity"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [],
  "sources": [
   "S1",
   "S9"
  ]
 },
 {
  "id": "r21",
  "name": "Blackberry Kale Hemp Fibre",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "blackberries",
    "name": "Blackberries",
    "grams": 120,
    "household": "~3/4 cup"
   },
   {
    "id": "kale",
    "name": "Kale",
    "grams": 30,
    "household": "~1.5 cups chopped"
   },
   {
    "id": "hemp",
    "name": "Hemp seeds (hulled)",
    "grams": 20,
    "household": "~2 tbsp"
   },
   {
    "id": "almond-milk",
    "name": "Unsweetened almond milk (typical label)",
    "grams": 250,
    "household": "~1 cup"
   }
  ],
  "method": "Blend kale with almond milk first; straining is not needed.",
  "flavour": "Dark berry flavour; the kale is barely noticeable.",
  "nutrition": "Blackberries and kale make this a good fibre source for its calories.",
  "perServing": {
   "kcal": 221,
   "protein": 11,
   "sugar": 6.9,
   "fibre": 8.9,
   "wholeProduceFibre": null,
   "grams": 420
  },
  "sugarFlag": "low",
  "tags": [
   "digestion",
   "low sugar"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [
   "Contains tree nuts."
  ],
  "cautions": [
   "Kale is high in vitamin K."
  ],
  "sources": [
   "S1",
   "S8"
  ]
 },
 {
  "id": "r22",
  "name": "Fennel Pear Mint Soother",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "fennel",
    "name": "Fennel bulb",
    "grams": 80,
    "household": "~1/2 cup sliced"
   },
   {
    "id": "pear",
    "name": "Pears",
    "grams": 120,
    "household": "~1 small"
   },
   {
    "id": "mint",
    "name": "Spearmint (fresh)",
    "grams": 3,
    "household": "~6 leaves"
   },
   {
    "id": "lemon",
    "name": "Lemons (flesh, no peel)",
    "grams": 15,
    "household": "~1 tbsp"
   },
   {
    "id": "chia",
    "name": "Chia seeds",
    "grams": 10,
    "household": "~1 tbsp"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 200,
    "household": "~3/4 cup"
   }
  ],
  "method": "Slice the fennel thin; blend 60 seconds, then stir in chia.",
  "flavour": "Gentle aniseed sweetness with fresh mint.",
  "nutrition": "Fennel and pear provide fibre with modest sugar; no digestive-treatment claim is made for the herbs.",
  "perServing": {
   "kcal": 147,
   "protein": 3.3,
   "sugar": 15.2,
   "fibre": 10.1,
   "wholeProduceFibre": null,
   "grams": 428
  },
  "sugarFlag": "moderate",
  "tags": [
   "digestion"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [],
  "sources": [
   "S1"
  ]
 },
 {
  "id": "r23",
  "name": "Tofu Berry Vegan Protein",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "tofu",
    "name": "Firm tofu",
    "grams": 80,
    "household": "~1/3 cup"
   },
   {
    "id": "blueberries",
    "name": "Blueberries",
    "grams": 100,
    "household": "~2/3 cup"
   },
   {
    "id": "banana",
    "name": "Bananas",
    "grams": 60,
    "household": "~1/2 small"
   },
   {
    "id": "almond-milk",
    "name": "Unsweetened almond milk (typical label)",
    "grams": 250,
    "household": "~1 cup"
   },
   {
    "id": "spinach",
    "name": "Spinach",
    "grams": 20,
    "household": "~2/3 cup"
   }
  ],
  "method": "Use firm tofu from a fresh package; blend on high until completely smooth.",
  "flavour": "Tofu is neutral and thickens the drink like yogurt would.",
  "nutrition": "Tofu adds plant protein (about 7 g in this portion on Canadian Nutrient File values; brands vary); berries and banana provide carbohydrate.",
  "perServing": {
   "kcal": 209,
   "protein": 10,
   "sugar": 17.9,
   "fibre": 5.5,
   "wholeProduceFibre": null,
   "grams": 510
  },
  "sugarFlag": "moderate",
  "tags": [
   "recovery"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [
   "Contains soy.",
   "Contains tree nuts."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S14"
  ]
 },
 {
  "id": "r24",
  "name": "Banana Oat Whey Recovery",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "banana",
    "name": "Bananas",
    "grams": 100,
    "household": "~1 small"
   },
   {
    "id": "oats",
    "name": "Rolled oats",
    "grams": 30,
    "household": "~1/3 cup"
   },
   {
    "id": "whey",
    "name": "Whey protein isolate (typical label)",
    "grams": 25,
    "household": "~1 scoop (varies)"
   },
   {
    "id": "milk2",
    "name": "2% milk",
    "grams": 250,
    "household": "~1 cup"
   }
  ],
  "method": "Blend oats with milk first; add whey last and blend briefly.",
  "flavour": "Like a banana-oat shake.",
  "nutrition": "Milk plus whey and oats provide protein with carbohydrate. Whey values are typical label values; branded products differ.",
  "perServing": {
   "kcal": 422,
   "protein": 34.1,
   "sugar": 26,
   "fibre": 4.5,
   "wholeProduceFibre": null,
   "grams": 405
  },
  "sugarFlag": "high",
  "tags": [
   "high protein",
   "recovery"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Oats may be cross-contaminated with gluten; choose certified gluten-free oats if needed.",
   "Contains milk."
  ],
  "cautions": [],
  "sources": [
   "S1"
  ]
 },
 {
  "id": "r25",
  "name": "Date Spinach Almond",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "dates",
    "name": "Dates (Medjool)",
    "grams": 20,
    "household": "~1 date"
   },
   {
    "id": "spinach",
    "name": "Spinach",
    "grams": 30,
    "household": "~1 packed cup"
   },
   {
    "id": "almond-butter",
    "name": "Almond butter",
    "grams": 16,
    "household": "~1 tbsp"
   },
   {
    "id": "almond-milk",
    "name": "Unsweetened almond milk (typical label)",
    "grams": 250,
    "household": "~1 cup"
   },
   {
    "id": "banana",
    "name": "Bananas",
    "grams": 60,
    "household": "~1/2 small"
   }
  ],
  "method": "Soak the date 10 minutes if your blender is weak; remove the pit first.",
  "flavour": "Date gives caramel sweetness; almond butter gives richness.",
  "nutrition": "A single Medjool date adds about 13 g of sugar. The date is the main sweetener, so this is a high-sugar drink even though the sugar comes from whole foods.",
  "perServing": {
   "kcal": 251,
   "protein": 6.7,
   "sugar": 21.5,
   "fibre": 5.4,
   "wholeProduceFibre": null,
   "grams": 376
  },
  "sugarFlag": "high",
  "tags": [
   "energy"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [
   "Contains tree nuts."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S6"
  ]
 },
 {
  "id": "r26",
  "name": "Pink Grapefruit Strawberry Basil",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "grapefruit",
    "name": "Grapefruit (pink/red)",
    "grams": 150,
    "household": "~1/2 grapefruit"
   },
   {
    "id": "strawberries",
    "name": "Strawberries",
    "grams": 100,
    "household": "~2/3 cup"
   },
   {
    "id": "basil",
    "name": "Basil (fresh)",
    "grams": 5,
    "household": "~5 leaves"
   },
   {
    "id": "greek-yogurt",
    "name": "Plain nonfat Greek yogurt",
    "grams": 100,
    "household": "~1/2 cup"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 100,
    "household": "~1/2 cup"
   }
  ],
  "method": "Remove the pith if it is too bitter.",
  "flavour": "Bitter-sweet grapefruit with sweet strawberries and fresh basil.",
  "nutrition": "Grapefruit supplies vitamin C and lycopene (pink).",
  "perServing": {
   "kcal": 155,
   "protein": 12.5,
   "sugar": 18.4,
   "fibre": 4.7,
   "wholeProduceFibre": null,
   "grams": 455
  },
  "sugarFlag": "moderate",
  "tags": [
   "immunity"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Contains milk."
  ],
  "cautions": [
   "GRAPEFRUIT can interact with many medicines for 3+ days (Health Canada). Do not use this recipe if you take a medicine with a grapefruit warning unless your doctor or pharmacist clears it. Swap in orange if unsure."
  ],
  "sources": [
   "S1",
   "S3"
  ]
 },
 {
  "id": "r27",
  "name": "Plum Oat Walnut",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "plum",
    "name": "Plums",
    "grams": 120,
    "household": "~2 small plums"
   },
   {
    "id": "oats",
    "name": "Rolled oats",
    "grams": 30,
    "household": "~1/3 cup"
   },
   {
    "id": "milk2",
    "name": "2% milk",
    "grams": 200,
    "household": "~3/4 cup"
   },
   {
    "id": "walnuts",
    "name": "Walnuts",
    "grams": 10,
    "household": "~2 halves"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 50,
    "household": "~3 tbsp"
   }
  ],
  "method": "Blend oats and milk first; remove the pits.",
  "flavour": "Jammy plum with nutty oats.",
  "nutrition": "Oats and plum skins give fibre; walnuts add fat; milk adds protein.",
  "perServing": {
   "kcal": 337,
   "protein": 12.9,
   "sugar": 22.6,
   "fibre": 5.4,
   "wholeProduceFibre": null,
   "grams": 410
  },
  "sugarFlag": "high",
  "tags": [
   "digestion",
   "energy"
  ],
  "vegan": false,
  "dairyFree": false,
  "contains": [
   "Oats may be cross-contaminated with gluten; choose certified gluten-free oats if needed.",
   "Contains milk.",
   "Contains tree nuts."
  ],
  "cautions": [],
  "sources": [
   "S1"
  ]
 },
 {
  "id": "r28",
  "name": "Raspberry Peach Oat",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "raspberries",
    "name": "Raspberries",
    "grams": 100,
    "household": "~3/4 cup"
   },
   {
    "id": "peach",
    "name": "Peaches (yellow)",
    "grams": 100,
    "household": "~1 small"
   },
   {
    "id": "oats",
    "name": "Rolled oats",
    "grams": 30,
    "household": "~1/3 cup"
   },
   {
    "id": "almond-milk",
    "name": "Unsweetened almond milk (typical label)",
    "grams": 250,
    "household": "~1 cup"
   },
   {
    "id": "hemp",
    "name": "Hemp seeds (hulled)",
    "grams": 15,
    "household": "~1.5 tbsp"
   }
  ],
  "method": "Frozen raspberries make it thicker; blend 60 seconds.",
  "flavour": "Peach sweetens the tart raspberries.",
  "nutrition": "Raspberries and oats make this a high-fibre option; hemp adds protein.",
  "perServing": {
   "kcal": 334,
   "protein": 12.5,
   "sugar": 13.4,
   "fibre": 12.7,
   "wholeProduceFibre": null,
   "grams": 495
  },
  "sugarFlag": "moderate",
  "tags": [
   "digestion",
   "energy"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [
   "Oats may be cross-contaminated with gluten; choose certified gluten-free oats if needed.",
   "Contains tree nuts."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S8"
  ]
 },
 {
  "id": "r29",
  "name": "Kiwi Spinach Banana Green",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "kiwi",
    "name": "Kiwifruit (green)",
    "grams": 100,
    "household": "~1 kiwi"
   },
   {
    "id": "spinach",
    "name": "Spinach",
    "grams": 40,
    "household": "~1 packed cup"
   },
   {
    "id": "banana",
    "name": "Bananas",
    "grams": 80,
    "household": "~3/4 small"
   },
   {
    "id": "almond-milk",
    "name": "Unsweetened almond milk (typical label)",
    "grams": 200,
    "household": "~3/4 cup"
   },
   {
    "id": "chia",
    "name": "Chia seeds",
    "grams": 10,
    "household": "~1 tbsp"
   }
  ],
  "method": "Blend spinach and almond milk first.",
  "flavour": "Tangy kiwi, mellow banana.",
  "nutrition": "Kiwi supplies vitamin C; chia and kiwi add fibre.",
  "perServing": {
   "kcal": 220,
   "protein": 6,
   "sugar": 18.9,
   "fibre": 9.3,
   "wholeProduceFibre": null,
   "grams": 430
  },
  "sugarFlag": "moderate",
  "tags": [
   "digestion",
   "energy"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [
   "Contains tree nuts."
  ],
  "cautions": [],
  "sources": [
   "S1",
   "S12"
  ]
 },
 {
  "id": "r30",
  "name": "Savory Carrot Tomato Pepper Blend",
  "type": "smoothie",
  "ingredients": [
   {
    "id": "tomato",
    "name": "Tomatoes (red, ripe)",
    "grams": 150,
    "household": "~1 medium"
   },
   {
    "id": "carrot",
    "name": "Carrots",
    "grams": 80,
    "household": "~1 small"
   },
   {
    "id": "red_pepper",
    "name": "Red bell pepper",
    "grams": 60,
    "household": "~1/3 pepper"
   },
   {
    "id": "celery",
    "name": "Celery",
    "grams": 40,
    "household": "~1 stalk"
   },
   {
    "id": "olive-oil",
    "name": "Olive oil",
    "grams": 5,
    "household": "~1 tsp"
   },
   {
    "id": "water",
    "name": "Water",
    "grams": 100,
    "household": "~1/2 cup"
   }
  ],
  "method": "High-speed blend until smooth; chill.",
  "flavour": "Savoury and sweet from carrot and tomato.",
  "nutrition": "Beta-carotene (carrot) and lycopene (tomato) are carotenoids; the olive oil supports absorption (small study). Red pepper adds vitamin C.",
  "perServing": {
   "kcal": 129,
   "protein": 2.9,
   "sugar": 10.8,
   "fibre": 5.2,
   "wholeProduceFibre": null,
   "grams": 435
  },
  "sugarFlag": "low",
  "tags": [
   "immunity",
   "low sugar"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [],
  "sources": [
   "S1",
   "S15",
   "S27"
  ]
 },
 {
  "id": "j01",
  "name": "Carrot Orange Ginger Juice",
  "type": "juice",
  "ingredients": [
   {
    "id": "carrot",
    "name": "Carrots",
    "grams": 200,
    "household": "~2 medium"
   },
   {
    "id": "orange",
    "name": "Oranges",
    "grams": 200,
    "household": "~1 large"
   },
   {
    "id": "ginger",
    "name": "Ginger (fresh root)",
    "grams": 8,
    "household": "~1 thumb"
   }
  ],
  "method": "Juice the carrots and ginger, then the orange. Serve over ice; a few nuts alongside help carotenoid absorption.",
  "flavour": "Sweet and bright with a ginger kick.",
  "nutrition": "Vitamin C and beta-carotene, but the fibre is removed. Canada's Food Guide advises whole fruit and vegetables over juice.",
  "perServing": {
   "kcal": 182,
   "protein": 3.9,
   "sugar": 28.3,
   "fibre": null,
   "wholeProduceFibre": 8.6,
   "grams": 408
  },
  "sugarFlag": "high",
  "tags": [
   "immunity"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "HIGH sugar for a drink; consider a half portion or diluting with sparkling water."
  ],
  "sources": [
   "S1",
   "S27",
   "S7"
  ]
 },
 {
  "id": "j02",
  "name": "Beet Apple Carrot Ginger Juice",
  "type": "juice",
  "ingredients": [
   {
    "id": "beet",
    "name": "Beets (raw)",
    "grams": 100,
    "household": "~1 small"
   },
   {
    "id": "apple",
    "name": "Apples (with skin)",
    "grams": 150,
    "household": "~1 apple"
   },
   {
    "id": "carrot",
    "name": "Carrots",
    "grams": 100,
    "household": "~1 medium"
   },
   {
    "id": "ginger",
    "name": "Ginger (fresh root)",
    "grams": 8,
    "household": "~1 thumb"
   }
  ],
  "method": "Juice the hard ingredients alternately; drink fresh.",
  "flavour": "Earthy beet softened by apple and carrot.",
  "nutrition": "Beet juice nitrate is the studied form for small blood-pressure effects, but juicing removes fibre and concentrates sugar.",
  "perServing": {
   "kcal": 168,
   "protein": 3.1,
   "sugar": 27.2,
   "fibre": null,
   "wholeProduceFibre": 7.4,
   "grams": 358
  },
  "sugarFlag": "high",
  "tags": [
   "energy"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "HIGH sugar for a drink; oxalate and potassium cautions apply to beets."
  ],
  "sources": [
   "S1",
   "S10",
   "S7"
  ]
 },
 {
  "id": "j03",
  "name": "Cucumber Celery Lemon Mint Juice",
  "type": "juice",
  "ingredients": [
   {
    "id": "cucumber",
    "name": "Cucumber (with peel)",
    "grams": 250,
    "household": "~1 cup+ sliced"
   },
   {
    "id": "celery",
    "name": "Celery",
    "grams": 120,
    "household": "~3 stalks"
   },
   {
    "id": "lemon",
    "name": "Lemons (flesh, no peel)",
    "grams": 40,
    "household": "~1/2 lemon, peeled"
   },
   {
    "id": "mint",
    "name": "Spearmint (fresh)",
    "grams": 5,
    "household": "~10 leaves"
   }
  ],
  "method": "Juice the cucumber, celery and lemon; stir in torn mint.",
  "flavour": "Crisp, hydrating and savoury.",
  "nutrition": "Very low in sugar and calories; low in nutrients per serving because most of the volume is water.",
  "perServing": {
   "kcal": 73,
   "protein": 3.1,
   "sugar": 6.8,
   "fibre": null,
   "wholeProduceFibre": 5.1,
   "grams": 415
  },
  "sugarFlag": "low",
  "tags": [
   "low sugar"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "Celery adds some sodium."
  ],
  "sources": [
   "S1"
  ]
 },
 {
  "id": "j04",
  "name": "Watermelon Lime Mint Juice",
  "type": "juice",
  "ingredients": [
   {
    "id": "watermelon",
    "name": "Watermelon",
    "grams": 300,
    "household": "~2 cups cubed"
   },
   {
    "id": "lime",
    "name": "Limes",
    "grams": 30,
    "household": "~1 lime, juice"
   },
   {
    "id": "mint",
    "name": "Spearmint (fresh)",
    "grams": 5,
    "household": "~10 leaves"
   }
  ],
  "method": "Blend and strain through a fine sieve for juice, or drink unstrained as a smoothie.",
  "flavour": "A summer drink: sweet, sharp, minty.",
  "nutrition": "A lycopene source. Watermelon recovery evidence is about citrulline supplements, not the fruit.",
  "perServing": {
   "kcal": 101,
   "protein": 2.2,
   "sugar": 19.1,
   "fibre": null,
   "wholeProduceFibre": 2.4,
   "grams": 335
  },
  "sugarFlag": "moderate",
  "tags": [
   "energy"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "Moderate-to-high sugar for the portion."
  ],
  "sources": [
   "S1",
   "S17"
  ]
 },
 {
  "id": "j05",
  "name": "Pineapple Cucumber Parsley Juice",
  "type": "juice",
  "ingredients": [
   {
    "id": "pineapple",
    "name": "Pineapple",
    "grams": 150,
    "household": "~1 cup"
   },
   {
    "id": "cucumber",
    "name": "Cucumber (with peel)",
    "grams": 150,
    "household": "~3/4 cup"
   },
   {
    "id": "parsley",
    "name": "Parsley (fresh)",
    "grams": 10,
    "household": "~1/4 cup"
   },
   {
    "id": "lime",
    "name": "Limes",
    "grams": 20,
    "household": "~1.5 tbsp"
   }
  ],
  "method": "Juice the pineapple and cucumber, then the parsley and lime.",
  "flavour": "Sweet pineapple with herbal parsley.",
  "nutrition": "Vitamin C from pineapple, lime and parsley; fibre is lost in juicing.",
  "perServing": {
   "kcal": 109,
   "protein": 2.2,
   "sugar": 17.7,
   "fibre": null,
   "wholeProduceFibre": 4.1,
   "grams": 330
  },
  "sugarFlag": "moderate",
  "tags": [
   "immunity"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "Parsley is very high in vitamin K per 100 g."
  ],
  "sources": [
   "S1",
   "S2",
   "S7"
  ]
 },
 {
  "id": "j06",
  "name": "Green Apple Celery Parsley Lemon Juice",
  "type": "juice",
  "ingredients": [
   {
    "id": "apple",
    "name": "Apples (with skin)",
    "grams": 150,
    "household": "~1 apple"
   },
   {
    "id": "celery",
    "name": "Celery",
    "grams": 100,
    "household": "~2 stalks"
   },
   {
    "id": "parsley",
    "name": "Parsley (fresh)",
    "grams": 15,
    "household": "~1/3 cup"
   },
   {
    "id": "lemon",
    "name": "Lemons (flesh, no peel)",
    "grams": 30,
    "household": "~1/2 lemon, peeled"
   },
   {
    "id": "ginger",
    "name": "Ginger (fresh root)",
    "grams": 5,
    "household": "~1 tsp"
   }
  ],
  "method": "Juice the apple, celery, parsley, lemon and ginger together.",
  "flavour": "Tart, clean, lightly sweet.",
  "nutrition": "Apple is the only meaningful sugar source; vitamin C from lemon and parsley.",
  "perServing": {
   "kcal": 112,
   "protein": 1.9,
   "sugar": 17.9,
   "fibre": null,
   "wholeProduceFibre": 5.8,
   "grams": 300
  },
  "sugarFlag": "moderate",
  "tags": [],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "Parsley is vitamin K-dense."
  ],
  "sources": [
   "S1",
   "S2",
   "S7"
  ]
 },
 {
  "id": "j07",
  "name": "Savory Tomato Celery Pepper Juice",
  "type": "juice",
  "ingredients": [
   {
    "id": "tomato",
    "name": "Tomatoes (red, ripe)",
    "grams": 300,
    "household": "~2 medium"
   },
   {
    "id": "celery",
    "name": "Celery",
    "grams": 80,
    "household": "~2 stalks"
   },
   {
    "id": "red_pepper",
    "name": "Red bell pepper",
    "grams": 60,
    "household": "~1/3 pepper"
   },
   {
    "id": "lemon",
    "name": "Lemons (flesh, no peel)",
    "grams": 20,
    "household": "~1 wedge"
   },
   {
    "id": "basil",
    "name": "Basil (fresh)",
    "grams": 5,
    "household": "~5 leaves"
   }
  ],
  "method": "Juice, or blend and strain; add a drop of olive oil if drinking with a meal (not counted).",
  "flavour": "Like a savoury garden cocktail.",
  "nutrition": "Lycopene and vitamin C; tomato products modestly lowered LDL in a meta-analysis, though a single glass is not the same as those trials.",
  "perServing": {
   "kcal": 92,
   "protein": 4.2,
   "sugar": 12,
   "fibre": null,
   "wholeProduceFibre": 6.3,
   "grams": 465
  },
  "sugarFlag": "moderate",
  "tags": [
   "immunity"
  ],
  "vegan": true,
  "dairyFree": true,
  "contains": [],
  "cautions": [
   "Celery adds some sodium."
  ],
  "sources": [
   "S1",
   "S15"
  ]
 }
];

export const SOURCES: Record<string, Source> = {
 "S1": {
  "title": "Nutrient values: Canadian Nutrient File (Health Canada); USDA FoodData Central for entries noted",
  "publisher": "Canadian Nutrient File",
  "url": "https://food-nutrition.canada.ca/cnf-fce/index-eng.jsp"
 },
 "S2": {
  "title": "Vitamin K: Fact Sheet for Consumers",
  "publisher": "NIH Office of Dietary Supplements",
  "url": "https://ods.od.nih.gov/factsheets/vitaminK-Consumer/"
 },
 "S3": {
  "title": "Effects of grapefruit juice on certain drugs",
  "publisher": "Health Canada",
  "url": "https://www.canada.ca/en/health-canada/services/healthy-living/your-health/food-nutrition/effects-grapefruit-juice-certain-drugs.html"
 },
 "S4": {
  "title": "Vitamin C: Health Professional Fact Sheet",
  "publisher": "NIH Office of Dietary Supplements",
  "url": "https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/"
 },
 "S5": {
  "title": "Folate: Fact Sheet for Consumers",
  "publisher": "NIH Office of Dietary Supplements",
  "url": "https://ods.od.nih.gov/factsheets/Folate-Consumer/"
 },
 "S6": {
  "title": "WHO calls on countries to reduce sugars intake among adults and children (2015)",
  "publisher": "World Health Organization",
  "url": "https://who.int/news/item/04-03-2015-who-calls-on-countries-to-reduce-sugars-intake-among-adults-and-children"
 },
 "S7": {
  "title": "Canada's Food Guide: Eat vegetables and fruits",
  "publisher": "Health Canada",
  "url": "https://www.canada.ca/en/health-canada/services/food-guide/explore/healthy-eating-recommendations/eat-variety/eat-vegetables-fruits.html"
 },
 "S8": {
  "title": "Fibre",
  "publisher": "Health Canada",
  "url": "https://www.canada.ca/en/health-canada/services/nutrients/fibre.html"
 },
 "S9": {
  "title": "Cranberries for preventing urinary tract infections (Cochrane Database Syst Rev 2023)",
  "publisher": "Cochrane",
  "url": "https://swiss.cochrane.org/news/can-cranberries-help-prevent-urinary-tract-infections"
 },
 "S10": {
  "title": "Nitrate derived from beetroot juice lowers blood pressure in patients with arterial hypertension: systematic review and meta-analysis (2022)",
  "publisher": "Frontiers in Nutrition",
  "url": "https://www.frontiersin.org/articles/10.3389/fnut.2022.823039/full"
 },
 "S11": {
  "title": "Ginger on human health: a comprehensive systematic review of 109 randomized controlled trials (2020)",
  "publisher": "Nutrients",
  "url": "https://www.mdpi.com/2072-6643/12/1/157"
 },
 "S12": {
  "title": "Kiwifruit and kiwifruit extracts for constipation: systematic review and meta-analysis (2024, summary page)",
  "publisher": "Am J Gastroenterol (via summary)",
  "url": "https://ibs-c.pocn.com/?p=1078"
 },
 "S13": {
  "title": "Tart cherry supplementation and recovery from strenuous exercise: systematic review and meta-analysis (2021)",
  "publisher": "Int J Sport Nutr Exerc Metab",
  "url": "https://researchportal.northumbria.ac.uk/en/publications/tart-cherry-supplementation-and-recovery-from-strenuous-exercise-/"
 },
 "S14": {
  "title": "The effect of blueberry interventions on cognitive performance and mood: systematic review of RCTs (2020)",
  "publisher": "Brain Behav Immun",
  "url": "https://researchers.westernsydney.edu.au/en/publications/the-effect-of-blueberry-interventions-on-cognitive-performance-an/"
 },
 "S15": {
  "title": "Tomato and lycopene supplementation and cardiovascular risk factors: systematic review and meta-analysis (2017)",
  "publisher": "Atherosclerosis",
  "url": "https://nrl.northumbria.ac.uk/id/eprint/29320"
 },
 "S16": {
  "title": "Effects of pomegranate consumption on blood pressure in adults: systematic review and meta-analysis (2024, summary)",
  "publisher": "Phytother Res (via summary)",
  "url": "https://nutrition-evidence.com/article/494201/the-effects-of-pomegranate-consumption-on-blood-pressure-in-adults-a-systematic-review-and-meta-analysis"
 },
 "S17": {
  "title": "Citrulline supplementation, perceived exertion and muscle soreness: systematic review and meta-analysis (2020)",
  "publisher": "J Sport Health Sci",
  "url": "https://pubmed.ncbi.nlm.nih.gov/33308806/"
 },
 "S18": {
  "title": "Turmeric",
  "publisher": "NCCIH (NIH)",
  "url": "https://www.nccih.nih.gov/health/turmeric"
 },
 "S19": {
  "title": "Hyperkalemia",
  "publisher": "StatPearls",
  "url": "https://www.ncbi.nlm.nih.gov/books/NBK470284/"
 },
 "S20": {
  "title": "Fruit and vegetable intake and risk of CVD, total cancer and all-cause mortality: dose-response meta-analysis (2017)",
  "publisher": "Int J Epidemiol",
  "url": "https://eprints.whiterose.ac.uk/id/eprint/106013/"
 },
 "S21": {
  "title": "Vitamin retention in eight fruits and vegetables: refrigerated vs frozen storage (Bouzari et al.)",
  "publisher": "J Agric Food Chem",
  "url": "https://ngdc.cncb.ac.cn/openlb/publication/OLB-PM-25526594"
 },
 "S22": {
  "title": "Mayo Clinic Minute: what you can eat to avoid kidney stones",
  "publisher": "Mayo Clinic News Network",
  "url": "https://newsnetwork.mayoclinic.org/discussion/mayo-clinic-minute-what-you-can-eat-to-avoid-kidney-stones/"
 },
 "S23": {
  "title": "Rhubarb (Picture of the Week)",
  "publisher": "Purdue University Plant & Pest Diagnostic Lab",
  "url": "https://ag.purdue.edu/department/btny/ppdl/potw-dept-folder/2021/rhubarb.html"
 },
 "S24": {
  "title": "Bromelain",
  "publisher": "NCCIH (NIH)",
  "url": "https://nccih.nih.gov/health/bromelain"
 },
 "S25": {
  "title": "Cruciferous vegetables and cancer prevention",
  "publisher": "National Cancer Institute",
  "url": "https://www.cancer.gov/about-cancer/causes-prevention/risk/diet/cruciferous-vegetables-fact-sheet"
 },
 "S26": {
  "title": "Avocado consumption and cardiovascular disease (Harvard HPFS/NHS cohorts)",
  "publisher": "Harvard T.H. Chan School of Public Health",
  "url": "https://www.hsph.harvard.edu/hpfs/?p=764"
 },
 "S27": {
  "title": "Carotenoid bioavailability is higher from salads ingested with full-fat than with fat-reduced dressings (2004)",
  "publisher": "Am J Clin Nutr (via NutraIngredients)",
  "url": "https://nutraingredients.com/Article/2004/08/03/Full-fat-helps-carotenoid-absorption"
 },
 "S28": {
  "title": "The warfarin-cranberry juice interaction revisited (2010)",
  "publisher": "J Exp Pharmacol",
  "url": "https://www.dovepress.com/the-warfarinndashcranberry-juice-interaction-revisited-a-systematic-in-peer-reviewed-fulltext-article-JEP"
 },
 "S29": {
  "title": "Grapefruit juice: potential drug interactions (CMAJ 2002) and CBC coverage of Bailey et al. CMAJ 2012",
  "publisher": "CMAJ / CBC",
  "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC117477/"
 }
};
