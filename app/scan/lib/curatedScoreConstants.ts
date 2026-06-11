/**
 * CURATED_SCORE_CONSTANTS — the deployment-gating expected scores.
 *
 * scripts/test-curated-scores.ts asserts every entry here against
 * lookupCuratedScore() before each build (npm prebuild hook). If any score
 * drifts, the build fails and the deploy is blocked. Update scores HERE, never
 * in the test file.
 */

export const CURATED_SCORE_CONSTANTS: { barcode: string; name: string; expected: number }[] = [
  { barcode: "0028400090308", name: "Doritos", expected: 20 },
  { barcode: "0044000030131", name: "Oreos", expected: 22 },
  { barcode: "0069000019832", name: "Coca-Cola", expected: 23 },
  { barcode: "0069000008947", name: "Pepsi", expected: 22 },
  { barcode: "0062100012284", name: "Canada Dry Zero Sugar", expected: 48 },
  { barcode: "0028400590679", name: "Tostitos Restaurant Style", expected: 62 },
  { barcode: "0028400090155", name: "Lay's Classic", expected: 58 },
  { barcode: "0072030007972", name: "Wasa Crispbread", expected: 80 },
  { barcode: "0817939020025", name: "SkinnyPop", expected: 78 },
  { barcode: "0602652179864", name: "KIND Dark Chocolate", expected: 71 },
  { barcode: "0041570050000", name: "Blue Diamond Almonds", expected: 90 },
  { barcode: "0069000019849", name: "Sprite", expected: 24 },
];
