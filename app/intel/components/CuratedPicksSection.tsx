import type { CuratedPick, CuratedTier } from "../lib/curatedPicks";
import { hasAmazonLink } from "../lib/curatedPicks";
import { amazonUrl } from "../lib/products";

/** Known brand-spelling fixes for clean display (the cache stores some shouting/misspelled). */
const BRAND_FIX: Record<string, string> = { cliff: "Clif" };

/**
 * Display-only brand cleanup. Returns null for empty or literal "null"/"none"/
 * "undefined" strings (so no brand line renders), applies known fixes, and
 * Title-Cases all-caps "shouting" brands (>=4 chars, letters/spaces only) while
 * leaving short acronyms (PC, T&T) and mixed-case names untouched.
 */
function displayBrand(raw: string | null): string | null {
  const t = (raw ?? "").trim();
  if (!t || /^(null|none|undefined|n\/a|na)$/i.test(t)) return null;
  const fix = BRAND_FIX[t.toLowerCase()];
  if (fix) return fix;
  if (t.length >= 4 && /^[A-Z][A-Z ]*[A-Z]$/.test(t)) {
    return t.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return t;
}

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
    tier === "approved"
      ? "border-gold text-gold"
      : tier === "cheat"
      ? "border-amber-500 text-amber-400"
      : "border-red-500 text-red-400";
  const heading =
    tier === "approved"
      ? "MORE GORILLA-APPROVED PRODUCTS"
      : tier === "cheat"
      ? "MORE ON THE CHEAT LIST"
      : "MORE TO STEER CLEAR OF";
  const blurb =
    tier === "approved"
      ? "Real, recognizable products that scored 75+ on the Gorilla engine. Hand-checked, pulled live from the scan database — the score here is the score you get when you scan them."
      : tier === "cheat"
      ? "Recognizable products landing in the honest middle (45–65). Hand-checked, pulled live from the scan database."
      : "Recognizable products that scored poorly on the Gorilla engine. Hand-checked, pulled live from the scan database — the low score here is the score you get when you scan them.";

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
        {picks.map((p) => {
          const brand = displayBrand(p.brand);
          return (
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
                {brand && (
                  <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted">{brand}</p>
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

              {/* Labeled Gorilla Score badge — reads as a score out of 100 */}
              <div className="shrink-0 text-center">
                <p className="text-[8px] uppercase leading-none tracking-[0.15em] text-muted">Gorilla<br />Score</p>
                <div
                  className={`mx-auto mt-1 flex h-12 w-12 items-center justify-center rounded-sm border-2 font-display text-2xl ${accent}`}
                >
                  {p.gorilla_score ?? "—"}
                </div>
                <p className="mt-0.5 text-[9px] tracking-wide text-muted/70">/100</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
