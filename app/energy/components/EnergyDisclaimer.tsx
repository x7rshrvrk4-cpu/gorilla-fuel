import { CAFFEINE_DISCLAIMER } from "../lib/products";

/**
 * Health Canada caffeine safety note — rendered ONCE for the Energy Drinks
 * section (mirrors AlcoholDisclaimer), never per product.
 */
export default function EnergyDisclaimer() {
  return (
    <p className="border-b border-cyan-400/20 bg-surface px-6 py-3 text-xs leading-relaxed text-muted">
      <span className="font-display tracking-wide text-cyan-300">⚡ CAFFEINE SAFETY — </span>
      {CAFFEINE_DISCLAIMER}
    </p>
  );
}
