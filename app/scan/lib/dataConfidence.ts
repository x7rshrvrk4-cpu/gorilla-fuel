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
