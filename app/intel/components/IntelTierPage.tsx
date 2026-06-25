import { Suspense } from "react";
import Link from "next/link";
import CrossLinkBanner from "../../components/CrossLinkBanner";
import BackToTop from "../../components/BackToTop";
import DeepLinkHighlighter from "../../components/DeepLinkHighlighter";
import {
  amazonUrl,
  iherbUrl,
  type IntelCategory,
  type IntelProduct,
  type IntelTier,
  APPROVED_CATEGORIES,
  CHEAT_CATEGORIES,
} from "../lib/products";
import CuratedPicksSection from "./CuratedPicksSection";
import type { CuratedPick } from "../lib/curatedPicks";

// ─── Tier metadata ───────────────────────────────────────────────────────────

const TIER_META: Record<
  IntelTier,
  { eyebrow: string; title: string; accentText: string; accentBorder: string; intro: string }
> = {
  approved: {
    eyebrow: "GORILLA APPROVED",
    title: "The snacks that earn their place.",
    accentText: "text-gold",
    accentBorder: "border-gold",
    intro:
      "These products passed the Gorilla standard. Short ingredient lists. Clean sourcing. Real nutrition. No brand pays for placement on this page. We update this list when formulations change. Scan any product below and you will get the same score shown here — our curated scores are locked in.",
  },
  cheat: {
    eyebrow: "GORILLA CHEAT LIST",
    title: "Imperfect. Acceptable. Earned.",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500",
    intro:
      "Real talk. Nobody eats almonds and seaweed every day. Sometimes you want chips. Sometimes you want chocolate. Sometimes you are at a party and the only option is a bag of Lays or a bag of Doritos. These products score 45 to 65 on Gorilla Fuel — not clean enough for the Approved list, not bad enough for the Stay Away list. They are the honest middle. The snacks that will not derail your goals if you are reasonable about portions. The Gorilla Cheat List is not permission to eat badly. It is permission to eat like a human.",
  },
  avoid: {
    eyebrow: "STAY AWAY",
    title: "The marketing is better than the food.",
    accentText: "text-red-400",
    accentBorder: "border-red-500",
    intro:
      "No judgment. We have all eaten these. But if you are trying to make better choices these are the ones worth replacing first. Every claim on this page is based on actual ingredient data sourced from product labels and our public methodology. We are not saying these products will harm you. We are saying the data does not support their reputation.",
  },
};

// ─── Tier navigation ─────────────────────────────────────────────────────────

const TIER_LINKS = [
  { tier: "approved" as IntelTier, href: "/approved", label: "Approved", activeClass: "bg-gold text-background", inactiveClass: "border border-line text-muted hover:border-gold hover:text-gold" },
  { tier: "cheat"    as IntelTier, href: "/cheat",    label: "Cheat List", activeClass: "bg-amber-500 text-background", inactiveClass: "border border-line text-muted hover:border-amber-500 hover:text-amber-400" },
  { tier: "avoid"    as IntelTier, href: "/avoid",    label: "Stay Away", activeClass: "bg-red-600 text-white", inactiveClass: "border border-line text-muted hover:border-red-500 hover:text-red-400" },
];

// ─── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score, tier }: { score: number; tier: IntelTier }) {
  const colors =
    tier === "approved"
      ? "border-gold text-gold"
      : tier === "cheat"
      ? "border-amber-500 text-amber-400"
      : "border-red-500 text-red-400";
  return (
    <div className="shrink-0 text-right">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Gorilla Score</p>
      <div
        className={`mt-1 flex h-16 w-16 items-center justify-center rounded-sm border-2 font-display text-3xl ${colors}`}
      >
        {score}
      </div>
    </div>
  );
}

// ─── Nutrition row ────────────────────────────────────────────────────────────

function NutritionRow({ nutrition }: { nutrition: NonNullable<IntelProduct["nutrition"]> }) {
  const items = [
    { label: "Cal", value: `${nutrition.cal}` },
    { label: "Carbs", value: `${nutrition.carbs}g` },
    { label: "Sugar", value: `${nutrition.sugar}g` },
    ...(nutrition.protein > 0 ? [{ label: "Protein", value: `${nutrition.protein}g` }] : []),
  ];
  return (
    <div className="mt-3 flex gap-4 border-t border-line pt-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted">{item.label}</p>
          <p className="font-display text-lg leading-none text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────

function IntelCard({ product, tier }: { product: IntelProduct; tier: IntelTier }) {
  const isAvoid = tier === "avoid";

  return (
    <div
      id={`product-${product.id}`}
      className={`gorilla-card rounded-sm p-5 ${isAvoid ? "border-red-900/30" : ""}`}
    >
      {/* Header row: name + score badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">{product.brand}</p>
          <h3 className="font-display text-xl leading-tight text-foreground sm:text-2xl">
            {product.name}
          </h3>

          {/* Badges row (Canadian + ingredient count) */}
          {!isAvoid && (product.canadian || product.ingredientCount) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {product.canadian && (
                <span className="inline-flex items-center gap-1 rounded-sm border border-red-500/40 bg-red-900/20 px-2 py-0.5 font-display text-[10px] tracking-[0.15em] text-red-300">
                  🍁 CANADIAN
                </span>
              )}
              {product.ingredientCount !== undefined && (
                <span className="inline-flex items-center rounded-sm border border-line bg-surface-2 px-2 py-0.5 font-display text-[10px] tracking-[0.12em] text-muted">
                  {product.ingredientCount} ingredient{product.ingredientCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
          )}
        </div>

        <ScoreBadge score={product.score} tier={tier} />
      </div>

      {/* Nutrition (approved + cheat only) */}
      {!isAvoid && product.nutrition && <NutritionRow nutrition={product.nutrition} />}

      {/* Worst ingredient (avoid only) */}
      {isAvoid && product.worstIngredient && (
        <div className="mt-3 rounded-sm border border-red-900/40 bg-red-900/15 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.15em] text-red-400">Worst ingredient</p>
          <p className="mt-0.5 text-sm font-medium text-red-200">{product.worstIngredient}</p>
        </div>
      )}

      {/* Blurb */}
      <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-muted">
        {product.blurb}
      </p>

      {/* Better alternative (avoid only) */}
      {isAvoid && product.betterAlternative && (
        <p className="mt-2 text-sm">
          <span className="text-[11px] uppercase tracking-[0.15em] text-emerald-400">
            Better alternative:{" "}
          </span>
          <span className="text-foreground">{product.betterAlternative}</span>
        </p>
      )}

      {/* Buy button (approved + cheat only) */}
      {!isAvoid && (
        <>
          {product.iherbQuery ? (
            <a
              href={iherbUrl(product.iherbQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-sm border border-emerald-600/50 px-4 py-2 font-display text-sm tracking-[0.2em] text-emerald-400 transition-colors hover:bg-emerald-900/30"
            >
              Find on iHerb ↗
            </a>
          ) : product.amazonQuery ? (
            <a
              href={amazonUrl(product.amazonQuery)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-4 inline-block rounded-sm border border-gold-dim px-4 py-2 font-display text-sm tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-background"
            >
              Buy on Amazon.ca ↗
            </a>
          ) : null}
        </>
      )}
    </div>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────

function CategorySection({
  category,
  products,
  tier,
}: {
  category: IntelCategory;
  products: IntelProduct[];
  tier: IntelTier;
}) {
  if (products.length === 0) return null;
  return (
    <div className="mt-12">
      <div className="flex items-center gap-4">
        <h2 className="font-display text-sm tracking-[0.3em] text-muted">{category.label}</h2>
        <div className="h-px flex-1 bg-line" />
      </div>
      {category.note && (
        <p className="mt-2 max-w-2xl text-sm italic leading-relaxed text-muted/70">
          {category.note}
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <IntelCard key={p.id} product={p} tier={tier} />
        ))}
      </div>
    </div>
  );
}

// ─── Cross-link section ───────────────────────────────────────────────────────

function CrossLinks({ tier }: { tier: IntelTier }) {
  if (tier === "approved") {
    return (
      <div className="mt-10 rounded-sm border border-line bg-surface p-5 text-sm text-muted">
        Not what you are looking for?{" "}
        <Link href="/cheat" className="text-amber-400 underline underline-offset-2 hover:text-amber-300">
          Check the Cheat List.
        </Link>
      </div>
    );
  }
  if (tier === "cheat") {
    return (
      <div className="mt-10 flex flex-wrap gap-3 rounded-sm border border-line bg-surface p-5 text-sm text-muted">
        <span>
          Want better?{" "}
          <Link href="/approved" className="text-gold underline underline-offset-2 hover:text-gold/80">
            See the Approved list.
          </Link>
        </span>
        <span className="text-line">·</span>
        <span>
          Want to know what to avoid?{" "}
          <Link href="/avoid" className="text-red-400 underline underline-offset-2 hover:text-red-300">
            See Stay Away.
          </Link>
        </span>
      </div>
    );
  }
  // avoid
  return (
    <div className="mt-10 rounded-sm border border-line bg-surface p-5 text-sm text-muted">
      Better alternative shown on each card. Full Approved list at{" "}
      <Link href="/approved" className="text-gold underline underline-offset-2 hover:text-gold/80">
        gorillafuel.ca/approved
      </Link>
      .
    </div>
  );
}

// ─── Disclaimer ───────────────────────────────────────────────────────────────

function Disclaimer() {
  return (
    <div className="mt-8 rounded-sm border border-line bg-surface p-5">
      <p className="text-xs leading-relaxed text-muted">
        All lists are editorial opinion based on ingredient quality assessment and nutritional
        analysis using our publicly documented methodology at{" "}
        <Link href="/methodology" className="underline underline-offset-2 hover:text-foreground">
          gorillafuel.ca/methodology
        </Link>
        . No brand pays for placement on any Gorilla Intel page. Individual dietary needs vary.
        Consult a qualified healthcare professional for personalized nutrition advice. Product
        formulations change — always verify current ingredients on the product label before
        purchasing. As an Amazon Associate, Gorilla Fuel earns from qualifying purchases.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IntelTierPage({
  tier,
  products,
  curatedPicks = [],
}: {
  tier: IntelTier;
  products: IntelProduct[];
  /** Cache-backed hand-approved picks (approved/cheat only); empty renders nothing. */
  curatedPicks?: CuratedPick[];
}) {
  const meta = TIER_META[tier];

  // Category maps for approved + cheat; avoid is flat
  const categories: IntelCategory[] | null =
    tier === "approved"
      ? APPROVED_CATEGORIES
      : tier === "cheat"
      ? CHEAT_CATEGORIES
      : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      {/* Suspense boundary required because DeepLinkHighlighter reads useSearchParams(). */}
      <Suspense>
        <DeepLinkHighlighter />
      </Suspense>

      {/* Page header */}
      <p className={`font-display text-sm tracking-[0.3em] ${meta.accentText}`}>
        {meta.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
        {meta.title}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">{meta.intro}</p>

      {/* Tier nav pills */}
      <div className="mt-8 flex flex-wrap gap-2">
        {TIER_LINKS.map((t) => (
          <Link
            key={t.tier}
            href={t.href}
            className={`rounded-sm px-5 py-2.5 font-display text-lg tracking-widest transition-colors ${
              t.tier === tier ? t.activeClass : t.inactiveClass
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Product content */}
      {categories ? (
        // Category-grouped layout (approved + cheat)
        categories.map((cat) => (
          <CategorySection
            key={cat.key}
            category={cat}
            products={products.filter((p) => p.category === cat.key)}
            tier={tier}
          />
        ))
      ) : (
        // Flat grid (avoid)
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <IntelCard key={p.id} product={p} tier={tier} />
          ))}
        </div>
      )}

      {/* Cache-backed curated picks (approved/cheat only; renders nothing when empty) */}
      {tier !== "avoid" && <CuratedPicksSection picks={curatedPicks} tier={tier} />}

      <Disclaimer />
      <CrossLinks tier={tier} />

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
      <BackToTop />
    </div>
  );
}
