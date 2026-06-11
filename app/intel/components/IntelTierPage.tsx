import Link from "next/link";
import CrossLinkBanner from "../../components/CrossLinkBanner";
import DeepLinkHighlighter from "../../components/DeepLinkHighlighter";
import { amazonUrl, type IntelProduct, type IntelTier } from "../lib/products";

const TIER_META: Record<IntelTier, { eyebrow: string; title: string; accent: string; intro: string }> = {
  approved: {
    eyebrow: "GORILLA APPROVED",
    title: "The snacks that earn their place.",
    accent: "text-emerald-400",
    intro:
      "Score 70+, whole-food ingredient lists, no artificial anything. These are the products the Gorilla actually keeps in the cupboard.",
  },
  cheat: {
    eyebrow: "GORILLA CHEAT LIST",
    title: "Imperfect. Acceptable. Earned.",
    accent: "text-amber-400",
    intro:
      "Not health food — but the cleanest version of the craving they serve. When you're going to cheat, cheat smart.",
  },
  avoid: {
    eyebrow: "STAY AWAY",
    title: "The marketing is better than the food.",
    accent: "text-red-400",
    intro:
      "Synthetic dyes, sugar loads, and ultra-processing — with a better alternative listed for every single one.",
  },
};

const TIER_LINKS: { tier: IntelTier; href: string; label: string }[] = [
  { tier: "approved", href: "/approved", label: "Approved" },
  { tier: "cheat", href: "/cheat", label: "Cheat List" },
  { tier: "avoid", href: "/avoid", label: "Stay Away" },
];

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-green-400";
  if (score >= 30) return "text-amber-400";
  return "text-red-400";
}

function IntelCard({ product, tier }: { product: IntelProduct; tier: IntelTier }) {
  return (
    <div id={`product-${product.id}`} className="gorilla-card rounded-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">{product.brand}</p>
          <h3 className="font-display text-2xl leading-tight text-foreground">{product.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Gorilla Score</p>
          <p className={`font-display text-4xl ${scoreColor(product.score)}`}>{product.score}</p>
        </div>
      </div>

      {product.highlights.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.highlights.map((h) => (
            <span
              key={h}
              className="rounded-sm border border-line bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted"
            >
              {h}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-muted">{product.blurb}</p>

      {product.betterAlternative && (
        <p className="mt-2 text-sm">
          <span className="text-[11px] uppercase tracking-[0.15em] text-emerald-400">Better alternative: </span>
          <span className="text-foreground">{product.betterAlternative}</span>
        </p>
      )}

      {tier !== "avoid" && product.amazonQuery && (
        <a
          href={amazonUrl(product.amazonQuery)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-4 inline-block rounded-sm border border-gold-dim px-4 py-2 font-display text-sm tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-background"
        >
          Buy on Amazon.ca ↗
        </a>
      )}
    </div>
  );
}

export default function IntelTierPage({ tier, products }: { tier: IntelTier; products: IntelProduct[] }) {
  const meta = TIER_META[tier];
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <DeepLinkHighlighter />
      <p className={`font-display text-sm tracking-[0.3em] ${meta.accent}`}>{meta.eyebrow}</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">{meta.title}</h1>
      <p className="mt-4 max-w-2xl text-muted">{meta.intro}</p>
      <p className="mt-2 text-xs text-muted">
        Every score on this page is produced by the same curated database the
        scanner uses — scan the barcode and you&apos;ll get the same number.
      </p>

      {/* Tier nav */}
      <div className="mt-8 flex flex-wrap gap-2">
        {TIER_LINKS.map((t) => (
          <Link
            key={t.tier}
            href={t.href}
            className={`rounded-sm px-5 py-2.5 font-display text-lg tracking-widest transition-colors ${
              t.tier === tier
                ? t.tier === "avoid"
                  ? "bg-red-700 text-white"
                  : "bg-gold text-background"
                : "border border-line text-muted hover:border-gold-dim hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <IntelCard key={p.id} product={p} tier={tier} />
        ))}
      </div>

      <div className="mt-10 rounded-sm border border-line bg-surface p-5">
        <p className="text-xs leading-relaxed text-muted">
          All products are editorially curated based on ingredient quality and
          nutritional analysis. No brand pays for placement. Product
          formulations change — always verify current ingredients on the
          product label. As an Amazon Associate, Gorilla Fuel earns from
          qualifying purchases.
        </p>
      </div>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
    </div>
  );
}
