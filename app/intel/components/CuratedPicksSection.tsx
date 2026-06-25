import type { CuratedPick, CuratedTier } from "../lib/curatedPicks";
import { hasAmazonLink } from "../lib/curatedPicks";
import { amazonUrl } from "../lib/products";

/**
 * Cache-backed curated list rendered below the editorial cards on /approved + /cheat.
 * Lightweight (image · brand · name · score) — no hand-authored blurbs; the data
 * comes straight from gorilla_product_cache for the hand-approved barcodes, so the
 * score equals the scanner's. Renders nothing when there are no picks (graceful).
 */
export default function CuratedPicksSection({
  picks,
  tier,
}: {
  picks: CuratedPick[];
  tier: CuratedTier;
}) {
  if (!picks.length) return null;

  const accent =
    tier === "approved" ? "border-gold text-gold" : "border-amber-500 text-amber-400";
  const heading = tier === "approved" ? "MORE GORILLA-APPROVED PRODUCTS" : "MORE ON THE CHEAT LIST";
  const blurb =
    tier === "approved"
      ? "Real, recognizable products that scored 75+ on the Gorilla engine. Hand-checked, pulled live from the scan database — the score here is the score you get when you scan them."
      : "Recognizable products landing in the honest middle (45–65). Hand-checked, pulled live from the scan database.";

  return (
    <div className="mt-16">
      <div className="flex items-center gap-4">
        <h2 className="font-display text-sm tracking-[0.3em] text-muted">
          {heading} <span className="text-muted/60">({picks.length})</span>
        </h2>
        <div className="h-px flex-1 bg-line" />
      </div>
      <p className="mt-2 max-w-2xl text-sm italic leading-relaxed text-muted/70">{blurb}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((p) => (
          <div key={p.barcode} className="gorilla-card flex items-center gap-3 rounded-sm p-3">
            {/* Product image (or initial fallback) */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-surface">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary OFF image hosts; not worth next/image remotePatterns
                <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-contain" />
              ) : (
                <span className="font-display text-lg text-muted">
                  {(p.product_name ?? "?").trim().charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name + brand (+ optional affiliate link for allowlisted national/shelf-stable items) */}
            <div className="min-w-0 flex-1">
              {p.brand && (
                <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted">{p.brand}</p>
              )}
              <p className="truncate text-sm leading-tight text-foreground" title={p.product_name ?? ""}>
                {p.product_name ?? "—"}
              </p>
              {hasAmazonLink(p.barcode) && p.product_name && (
                <a
                  href={amazonUrl(p.product_name)}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="mt-1 inline-block font-display text-[10px] uppercase tracking-[0.15em] text-gold/80 transition-colors hover:text-gold"
                >
                  Buy on Amazon ↗
                </a>
              )}
            </div>

            {/* Score */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border-2 font-display text-xl ${accent}`}
            >
              {p.gorilla_score ?? "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
