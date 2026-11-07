export const ALCOHOL_DISCLAIMER =
  "Alcohol content and nutritional information is provided for informational purposes only. " +
  "Gorilla Fuel does not encourage alcohol consumption. Drink responsibly and in accordance " +
  "with local laws. Must be legal drinking age in your province to purchase alcohol. " +
  "Nutritional data sourced from Open Food Facts and manufacturer information.";

export default function AlcoholDisclaimer() {
  return (
    <p className="border-b border-amber-400/20 bg-surface px-6 py-3 text-xs leading-relaxed text-muted">
      {ALCOHOL_DISCLAIMER}
    </p>
  );
}
