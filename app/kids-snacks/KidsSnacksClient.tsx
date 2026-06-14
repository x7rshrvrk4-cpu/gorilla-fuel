"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { scrollToProduct } from "../lib/scrollHighlight";
import CrossLinkBanner from "../components/CrossLinkBanner";
import BackToTop from "../components/BackToTop";
import KidsSnackCard from "./components/KidsSnackCard";
import {
  KIDS_SNACKS,
  KIDS_SNACKS_BY_TIER,
  TIER_META,
  type SnackTier,
} from "./lib/products";

const TIER_ACCENT: Record<SnackTier, string> = {
  A: "text-emerald-400",
  B: "text-amber-400",
  C: "text-red-400",
};

// ── Local search dropdown — copies the /alcohol (UniversalSearch) iOS-safe
//    select-open pattern: real <Link> rows + onMouseDown preventDefault so the
//    first tap navigates with the keyboard up, and the page reads ?p= reactively.
function SnackSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return KIDS_SNACKS.filter((p) =>
      tokens.every((t) => `${p.name} ${p.brand}`.toLowerCase().includes(t))
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const cancelBlur = () => {
    if (blurRef.current) {
      clearTimeout(blurRef.current);
      blurRef.current = null;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          cancelBlur();
          if (query.length >= 2) setOpen(true);
        }}
        onBlur={() => {
          cancelBlur();
          blurRef.current = setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Search kids' snacks by name or brand…"
        className="w-full rounded-sm border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-foreground placeholder:text-slate-500 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30"
      />
      {open && query.length >= 2 && (
        <div
          onMouseDown={cancelBlur}
          onTouchStart={cancelBlur}
          className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-[360px] overflow-y-auto rounded-sm border border-slate-700 bg-slate-900 shadow-2xl"
        >
          {results.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-400">No kids&apos; snacks match &quot;{query}&quot;.</p>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                href={`/kids-snacks?p=${encodeURIComponent(p.id)}`}
                // iOS Safari: preventDefault on mousedown keeps the input from
                // blurring so the first tap reliably navigates (same fix as /alcohol).
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{p.name}</p>
                  <p className="truncate text-[11px] text-slate-400">
                    {p.brand} · {TIER_META[p.tier].label}
                  </p>
                </div>
                <span className={`shrink-0 font-display text-sm ${TIER_ACCENT[p.tier]}`}>{p.tier}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TierSection({ tier, hero }: { tier: SnackTier; hero?: boolean }) {
  const meta = TIER_META[tier];
  const products = KIDS_SNACKS_BY_TIER[tier];
  return (
    <section className={hero ? "mt-12" : "mt-12"}>
      <div className={hero ? "rounded-sm border border-amber-400/30 bg-amber-400/5 p-5 sm:p-6" : ""}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={`font-display ${hero ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"} ${TIER_ACCENT[tier]}`}>
            {hero ? "★ " : ""}Tier {tier}
          </span>
          <span className={`font-display ${hero ? "text-2xl sm:text-3xl" : "text-xl"} text-foreground`}>
            {meta.label}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{products.length} items</span>
        </div>
        <p className={`mt-2 max-w-2xl ${hero ? "text-base text-amber-100/80" : "text-sm text-muted"}`}>{meta.blurb}</p>
      </div>

      <div className={`mt-5 grid gap-4 ${hero ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        {products.map((p) => (
          <KidsSnackCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default function KidsSnacksClient() {
  const searchParams = useSearchParams();
  const [infoOpen, setInfoOpen] = useState(false);

  // Deep link: /kids-snacks?p=<id> → scroll + highlight. Keyed on the ?p= value
  // (reactive useSearchParams) so it re-fires on a same-page query-only
  // navigation — the iOS "dead tap" fix, identical to /alcohol.
  const deepLinkId = searchParams.get("p");
  useEffect(() => {
    if (!deepLinkId) return;
    if (!KIDS_SNACKS.some((p) => p.id === deepLinkId)) return;
    return scrollToProduct(deepLinkId);
  }, [deepLinkId]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {/* HEADER */}
      <div className="max-w-2xl">
        <p className="font-display text-sm tracking-[0.3em] text-amber-400">KIDS&apos; SNACK INTELLIGENCE</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          The <span className="text-amber-400">Cheat Zone</span>.
        </h1>
        <p className="mt-4 text-muted">
          The kids&apos; snack aisle, sorted honestly: what&apos;s genuinely clean, what hides behind a
          health halo, and what&apos;s candy in disguise. Canadian formulas — we never carry US dye data
          onto a Canadian product.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-sm border border-amber-400/30 bg-amber-400/8 px-3 py-1.5 text-xs text-amber-300/80">
          <span className="text-amber-400">🍁</span>
          Ingredient/dye status verified against Canadian labels where shown · macros shown only when confirmed
        </p>
      </div>

      {/* SEARCH */}
      <div className="mt-6">
        <SnackSearch />
      </div>

      {/* TIERS — A, then B (hero), then C */}
      <TierSection tier="A" />
      <TierSection tier="B" hero />
      <TierSection tier="C" />

      {/* CONTEXT BLURB — collapsible, factual, sourced */}
      <section className="mt-14">
        <button
          type="button"
          onClick={() => setInfoOpen((v) => !v)}
          aria-expanded={infoOpen}
          className="flex w-full items-center justify-between rounded-sm border border-slate-700 bg-slate-900/60 px-5 py-4 text-left transition-colors hover:border-gold/40"
        >
          <span className="font-display text-lg tracking-wide text-foreground">
            What actually makes a kids&apos; snack healthy?
          </span>
          <span className="font-display text-2xl text-gold">{infoOpen ? "–" : "+"}</span>
        </button>
        {infoOpen && (
          <div className="mt-3 space-y-3 rounded-sm border border-slate-800 bg-slate-900/40 px-5 py-5 text-sm leading-relaxed text-slate-300">
            <p>
              <span className="font-display tracking-wide text-foreground">Free sugars.</span> The WHO suggests
              keeping free sugars under 10% of daily energy — roughly 25 g (about 6 tsp) a day for a young child.
              &quot;Free sugars&quot; includes the sugars in fruit juice and concentrate, which is why a &quot;no
              added sugar&quot; fruit purée still counts.
            </p>
            <p>
              <span className="font-display tracking-wide text-foreground">Sodium.</span> The Canadian Paediatric
              Society flags that most Canadian kids already eat more sodium than they need, much of it from packaged
              snacks — so a &quot;veggie&quot; straw that&apos;s mostly potato and salt isn&apos;t a free pass.
            </p>
            <p>
              <span className="font-display tracking-wide text-foreground">Synthetic dyes.</span> Synthetic colours
              are still permitted in Canada, but some children show behavioural effects, and Health Canada has begun
              reviewing them. Many Canadian recipes already use natural colours (turmeric, annatto, beet, carrot) —
              and a Canadian product is not the same as its US version.
            </p>
            <p>
              <span className="font-display tracking-wide text-foreground">Coming in 2026.</span> Canada&apos;s new
              front-of-pack &quot;high in&quot; symbol will flag foods high in sugar, sodium, or saturated fat — making
              a lot of these &quot;cheat zone&quot; products easier to spot at a glance.
            </p>
            <p className="text-xs text-slate-500">
              Sources: Health Canada (sodium, front-of-pack labelling, food-colour review); World Health Organization
              (free sugars guideline); Canadian Paediatric Society (children&apos;s sodium intake). General guidance,
              not medical advice.
            </p>
          </div>
        )}
      </section>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
      <BackToTop />
    </div>
  );
}
