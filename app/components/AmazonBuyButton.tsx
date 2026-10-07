import { amazonUrl } from "../lib/affiliates";

/**
 * Tagged Amazon.ca affiliate buy button (gorillafuel-20).
 *
 * Policy: only render this for products that score well and are actually sold on
 * Amazon (food, supplements, beauty, energy/hydration, snacks — NEVER alcohol).
 * Gating lives at the call site so each section can use its own "healthy"
 * threshold; this component is just the styled, correctly-tagged link.
 */
export default function AmazonBuyButton({
  query,
  className = "",
  label = "Buy on Amazon →",
}: {
  query: string;
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={amazonUrl(query)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`inline-flex items-center justify-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-3 py-1.5 font-display text-xs tracking-widest text-gold transition-colors hover:bg-gold/20 ${className}`}
    >
      {label}
    </a>
  );
}
