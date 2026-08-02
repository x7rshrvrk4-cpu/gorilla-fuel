import type { OffProduct } from "./openFoodFacts";

/**
 * Data-blind = a product we know NOTHING about except its macros: the data
 * source returned no ingredient list, no additive tags, no NOVA processing
 * group, and no category tags. Its score therefore rests on the ~6 nutrition
 * facts alone, with no additive / processing / category signal to corroborate
 * it. This is ~84.5% of the food cache.
 *
 * DISPLAY-ONLY. This never touches a score — it only lets the result card
 * qualify a macros-only score with an honest "limited data" note.
 *
 * Deliberately does NOT exclude whole foods via isWholeFood(): that classifier
 * misses the large majority of blind whole foods (nuts/seeds/legumes/grains), so
 * it's too unreliable to gate on. And for a carrot the note is still true and
 * not misleading — "scored on nutrition facts, no ingredient list on file" —
 * so badging every blind row is the honest choice.
 */
export function isDataBlind(product: OffProduct, novaGroup: number | null): boolean {
  const noIngredients = !(
    product.ingredients_text?.trim() ||
    product.ingredients_text_en?.trim() ||
    product.ingredients_text_fr?.trim()
  );
  const noAdditiveTags = !(product.additives_tags && product.additives_tags.length > 0);
  const noCategories = !(product.categories_tags && product.categories_tags.length > 0);
  return noIngredients && noAdditiveTags && novaGroup == null && noCategories;
}

/**
 * "Additives were unverified" — the DISPLAY-side mirror of scoring.ts's
 * `additivesUnverified` cap (the branch that pins the additive sub-score to ≤50
 * when a product has no ingredient text and no additive tags and is NOT a
 * whole-food / plain-water / pure-oil exempt row).
 *
 * Why this exists separately from isDataBlind: the additivesUnverified cap fires
 * on a LOOSER condition than isDataBlind — it ignores NOVA and category tags. So
 * a row that has category tags but no ingredient list still gets the 50-neutral
 * additive cap, yet isDataBlind (which additionally demands no NOVA and no
 * categories) returned false, hiding the "scored on nutrition facts alone" strip
 * and the OCR capture panel. This predicate drives those two DISPLAY surfaces so
 * the disclosure appears on EVERY capped row, not just the tag-less subset.
 *
 * DISPLAY-ONLY. Never touches a score. isDataBlind is left unchanged for its own
 * documented "knows nothing but macros" purpose.
 *
 * The exemptions (whole-food / water / oil) are honoured WITHOUT re-implementing
 * scoring.ts's private isWholeFood/isPlainWater/isPureOilRow detectors: those rows
 * are exactly the ones the cap does NOT fire on, so their additive sub-score stays
 * high (~88–100). Gating on `additiveScore <= 50` therefore includes precisely the
 * capped rows and excludes every exempt row — reading the cap's own output rather
 * than duplicating its logic. `additiveScore` is the value from the score result
 * (computeScore's effective additive sub-score).
 */
export function additivesUnverifiedForDisplay(
  product: OffProduct,
  additiveScore: number
): boolean {
  const noIngredients = !(
    product.ingredients_text?.trim() ||
    product.ingredients_text_en?.trim() ||
    product.ingredients_text_fr?.trim()
  );
  const noAdditiveTags = !(product.additives_tags && product.additives_tags.length > 0);
  // additiveScore <= 50 ⟺ the additivesUnverified cap fired. Exempt whole-food/
  // water/oil rows skip the cap and keep a high sub-score, so they never qualify.
  return noIngredients && noAdditiveTags && additiveScore <= 50;
}
