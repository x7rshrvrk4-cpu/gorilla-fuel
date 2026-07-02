import type { ObfProduct } from "./openBeautyFacts";

/**
 * DISPLAY-ONLY honesty signals for the beauty scanner. These never change a
 * beauty score — they only let BeautyResultCard qualify a score the engine
 * can't fully back up. Mirrors the food-side dataConfidence.ts pattern.
 */

/**
 * Signal 1 — data-blind: OBF returned NO usable ingredient text, so
 * computeBeautyScore ran on an empty string. Its "nothing flagged" 100 is then a
 * false-clean (absence of data, not absence of concerns) — exactly the food
 * isDataBlind case. computeBeautyScore is fed `ingredients_text || ingredients_text_en`
 * (see ScanClient), so both being empty is the blind case.
 */
export function beautyHasNoIngredients(product: ObfProduct): boolean {
  return !(product.ingredients_text?.trim() || product.ingredients_text_en?.trim());
}

export type UnderCoveredCategory = {
  category: "sunscreen" | "deodorant" | "makeup";
  label: string; // human label shown in the notice
  whatWeMiss: string; // the ingredient class the 12-entry dictionary doesn't cover
};

// Signal 2 — the cosmetic dictionary is strong on skincare/hair/body-wash
// (parabens/sulfates/fragrance/preservatives) but structurally thin on these
// categories, where a high score is mostly "nothing the dictionary knows to look
// for was present". Detect via NAME keywords, CONSERVATIVELY (same discipline as
// the food name-inference): only clear tokens fire; ambiguous names → null.
const COVERAGE_RULES: { re: RegExp; cat: UnderCoveredCategory }[] = [
  {
    re: /\b(sunscreens?|sunblock|sun\s*block|spf\s*\d+|\bspf\b)\b/i,
    cat: { category: "sunscreen", label: "sunscreen", whatWeMiss: "UV filters" },
  },
  {
    re: /\b(deodorants?|anti[\s-]?perspirants?)\b/i,
    cat: { category: "deodorant", label: "deodorant / antiperspirant", whatWeMiss: "aluminium compounds" },
  },
  {
    re: /\b(mascaras?|foundations?|lipsticks?|lip\s*gloss(?:es)?|eye\s*shadows?|eyeshadows?|eyeliners?|concealers?|blush(?:es)?|bronzers?|make[\s-]?up|bb\s*creams?|cc\s*creams?|setting\s*powders?|nail\s*polish(?:es)?)\b/i,
    cat: { category: "makeup", label: "makeup / colour cosmetic", whatWeMiss: "talc and colour additives" },
  },
];

/**
 * Detect an under-covered cosmetic category from the product NAME, conservatively.
 * Returns null when the name doesn't clearly indicate one (→ no notice shown).
 */
export function inferUnderCoveredCategory(productName: string | null | undefined): UnderCoveredCategory | null {
  const name = (productName ?? "").toLowerCase();
  if (!name.trim()) return null;
  for (const rule of COVERAGE_RULES) {
    if (rule.re.test(name)) return rule.cat;
  }
  return null;
}
