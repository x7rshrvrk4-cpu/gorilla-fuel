const SUPPLEMENT_TAG_HINTS = ["supplement", "dietary-supplement", "vitamin", "protein-powder", "sports-nutrition"];

function looksLikeSupplement(categoryTags: string[] | undefined): boolean {
  if (!categoryTags) return false;
  return categoryTags.some((tag) => SUPPLEMENT_TAG_HINTS.some((hint) => tag.includes(hint)));
}

type Props = {
  productName?: string;
  brand?: string;
  categoryTags?: string[];
};

/**
 * Labdoor doesn't publish a public API — every documented endpoint
 * (labdoor.com/api/*, api.labdoor.com) returns 404/403 on direct probing, so
 * there's no live source for a per-product rank, grade, or purity score.
 * Rather than fabricate a "LABDOOR VERIFIED" or "UNVERIFIED — NOT LAB TESTED"
 * status — which would risk falsely telling a shopper a product was (or
 * wasn't) independently lab-tested — we surface an honest, actionable
 * cross-check link to Labdoor's own published rankings instead.
 */
export default function LabdoorCrossCheck({ productName, brand, categoryTags }: Props) {
  if (!looksLikeSupplement(categoryTags)) return null;

  const query = [brand, productName].filter(Boolean).join(" ").trim();
  const href = query
    ? `https://labdoor.com/search?q=${encodeURIComponent(query)}`
    : "https://labdoor.com/rankings";

  return (
    <div className="rounded-sm border border-line bg-surface p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-zinc-400/50 bg-zinc-400/10 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-zinc-300">
          <span aria-hidden>?</span>
          Labdoor Status — Cross-Check Required
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Labdoor independently lab-tests supplements for label accuracy and contamination, but
        doesn&apos;t publish a public API — so we can&apos;t pull a live rank, grade, or purity score
        for this specific product automatically, and won&apos;t guess at one.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 inline-flex items-center gap-1.5 font-display text-xs uppercase tracking-[0.2em] text-gold underline decoration-gold-dim underline-offset-4 transition-colors hover:text-gold/80"
      >
        Cross-check this product on Labdoor.com →
      </a>
    </div>
  );
}
