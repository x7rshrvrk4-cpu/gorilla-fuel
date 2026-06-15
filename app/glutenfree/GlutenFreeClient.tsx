"use client";

import { useState } from "react";
import Link from "next/link";
import BackToTop from "../components/BackToTop";
import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { GF_FOOD_TABS, amazonUrl, type GfFoodProduct, type GfFoodTab } from "./lib/products";

type Tab = "alcohol" | GfFoodTab;

const TABS: { key: Tab; label: string }[] = [
  { key: "alcohol", label: "Alcohol" },
  ...GF_FOOD_TABS.map((t) => ({ key: t.key as Tab, label: t.label })),
];

const GF_LABEL_WATCHLIST = [
  "Wheat", "Barley", "Rye", "Triticale",
  "Oats (unless certified pure / gluten-free oats)",
  "Malt", "Malt extract", "Malt vinegar",
  "Modified wheat starch", "Spelt", "Kamut",
];

const WORST_OFFENDERS = [
  { name: "Tapioca Starch", body: "Pure refined carbohydrate — zero fiber, zero protein, zero vitamins. Spikes blood sugar faster than table sugar. Found in the majority of commercial GF breads, crackers and baked goods." },
  { name: "White Rice Flour", body: "Low in nutrients, high glycemic index. The most common GF flour — and the least nutritious. Also associated with arsenic contamination concerns in high-consumption diets, per Consumer Reports research." },
  { name: "Potato Starch", body: "Refined empty carbohydrate. No nutritional value beyond calories." },
  { name: "Xanthan Gum", body: "Industrial thickener used in virtually every GF baked product to replace gluten's binding properties. NOVA Group 4 additive. Causes digestive issues in some individuals." },
  { name: "Hydroxypropyl Methylcellulose", body: "Industrial thickener found in commercial GF products. NOVA Group 4." },
];

const BEST_INGREDIENTS = [
  { name: "Almond Flour", body: "High healthy fat, high protein, low carb, low glycemic. The best GF flour nutritionally." },
  { name: "Chickpea Flour", body: "High protein, high fiber, whole food base." },
  { name: "Buckwheat Flour", body: "Complete protein, high fiber — despite the name, contains zero wheat." },
  { name: "Quinoa Flour", body: "Complete protein with all essential amino acids." },
  { name: "Certified Pure Oat Flour", body: "Beta glucan, cholesterol lowering, high fiber. Must say certified gluten free or pure oats." },
  { name: "Lentil Flour", body: "Very high protein, very high fiber." },
  { name: "Brown Rice Flour", body: "Better than white rice flour — retains some fiber." },
];

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-green-400";
  if (score >= 35) return "text-amber-400";
  return "text-red-400";
}

function GfFoodCard({ product }: { product: GfFoodProduct }) {
  return (
    <div className="gorilla-card rounded-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-display text-xl leading-tight text-foreground">{product.name}</h4>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {product.certifiedGf && (
              <span className="inline-flex items-center rounded-sm border border-green-500/70 bg-green-500/15 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-green-300">
                ✓ Certified GF{product.naturallyGf ? " · Naturally" : ""}
              </span>
            )}
            {product.canadian && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-red-600/60 bg-red-900/25 px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em] text-red-300">
                🍁 Canadian
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Score · {product.grade}</p>
          <p className={`font-display text-3xl ${scoreColor(product.score)}`}>
            {product.scoreDisplay ?? product.score}
          </p>
        </div>
      </div>
      <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-muted">{product.blurb}</p>
      {product.amazonQuery && (
        <a
          href={amazonUrl(product.amazonQuery)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-3 inline-block rounded-sm border border-gold-dim px-4 py-2 font-display text-sm tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-background"
        >
          Buy on Amazon.ca ↗
        </a>
      )}
    </div>
  );
}

function FoodTab({ tab }: { tab: GfFoodTab }) {
  const meta = GF_FOOD_TABS.find((t) => t.key === tab)!;
  const tiers = [...new Set(meta.products.map((p) => p.tier))];

  return (
    <div>
      {/* EDUCATIONAL SECTION */}
      <section className="mt-8">
        <h2 className="font-display text-3xl text-foreground">Why Most Gluten Free Food Scores Low</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          When manufacturers remove gluten from baked goods they need to replace its
          binding and structural properties. The result is a mix of industrial
          ingredients that make products look and taste familiar — at a significant
          nutritional cost.{" "}
          <span className="text-foreground">Gluten free does not mean healthy. It
          means one ingredient was removed and usually fifteen were added.</span>
        </p>

        <h3 className="mt-6 font-display text-xl text-red-400">The Worst Offenders in GF Food</h3>
        <div className="mt-3 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {WORST_OFFENDERS.map((w) => (
            <div key={w.name} className="bg-surface p-4">
              <p className="font-display text-base text-red-300">{w.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{w.body}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-6 font-display text-xl text-emerald-400">The Best GF Ingredients</h3>
        <div className="mt-3 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {BEST_INGREDIENTS.map((b) => (
            <div key={b.name} className="bg-surface p-4">
              <p className="font-display text-base text-emerald-300">{b.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 max-w-3xl rounded-sm border border-gold-dim bg-surface p-5">
          <p className="font-display text-sm tracking-[0.2em] text-gold">THE HONEST TRUTH ABOUT GF BREAD</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A slice of regular whole grain sourdough bread scores higher on Gorilla
            Fuel than almost any commercial gluten free bread. The GF version removes
            one ingredient — gluten — and adds fifteen industrial ones. If you have
            celiac disease, you have no choice. If you are going gluten free by
            choice for health reasons, be aware that most commercial GF bread is
            nutritionally inferior to the whole grain bread it replaces.
          </p>
        </div>
      </section>

      {/* LABEL VS SCORE NOTE */}
      <div className="mt-8 rounded-sm border border-green-600/40 bg-green-900/15 px-5 py-4">
        <p className="text-xs leading-relaxed text-green-300/90">
          Gorilla Fuel scores products on ingredient quality — not on whether they
          carry a gluten free label. A product can be certified gluten free and still
          score poorly if it is built from refined starches and industrial additives.
          A product can be naturally gluten free and score excellently if it is built
          from whole food ingredients.{" "}
          <span className="text-green-200">The label tells you one thing. The score
          tells you everything.</span>
        </p>
      </div>

      {/* PRODUCTS BY TIER */}
      {tiers.map((tier) => (
        <section key={tier} className="mt-8">
          <h3 className="font-display text-xl text-gold">{tier}</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {meta.products.filter((p) => p.tier === tier).map((p) => (
              <GfFoodCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}

      {/* TAB NOTE */}
      <div className="mt-8 max-w-3xl rounded-sm border border-line bg-surface p-5">
        <p className="text-sm leading-relaxed text-muted">{meta.note}</p>
      </div>

      {/* DISCLAIMER */}
      <div className="mt-6 max-w-3xl rounded-sm border border-red-500/40 bg-red-950/20 p-5">
        <p className="text-xs leading-relaxed text-muted">
          This information is for educational purposes only. If you have celiac
          disease, consult your doctor or a registered dietitian before making
          dietary decisions. Always verify current product formulations as recipes
          change. Gorilla Fuel is not a medical resource. As an Amazon Associate,
          Gorilla Fuel earns from qualifying purchases.
        </p>
      </div>
    </div>
  );
}

function AlcoholTab() {
  const certified = ALCOHOL_PRODUCTS.filter((p) => p.glutenStatus === "certified-gf");
  const certifiedBeers = certified.filter((p) => p.category !== "Wines" && p.category !== "Cider");
  const certifiedCiders = certified.filter((p) => p.category === "Cider");
  const wineCount = certified.filter((p) => p.category === "Wines").length;

  return (
    <div>
      {/* SECTION 1 — THE THREE TIERS */}
      <section className="mt-8">
        <h2 className="font-display text-3xl text-foreground">The Three Tiers</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-sm border border-green-500/50 bg-green-900/15 p-5">
            <span className="inline-flex items-center rounded-sm border border-green-500/70 bg-green-500/15 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-green-300">
              ✓ Certified GF
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Made entirely from gluten-free ingredients — never barley, wheat or rye.
              Millet, buckwheat, corn, sorghum, rice, apples, or grapes.{" "}
              <span className="text-green-300">Safe for celiac disease.</span>
            </p>
          </div>
          <div className="rounded-sm border border-amber-500/50 bg-amber-900/15 p-5">
            <span className="inline-flex items-center rounded-sm border border-amber-500/60 bg-amber-500/12 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-amber-300">
              ⚠ Gluten Removed
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Brewed from barley or wheat, then enzyme-treated to reduce gluten.
              Health Canada states these <span className="text-amber-300">cannot be
              called gluten free</span>. Not recommended for celiac disease. May be
              tolerated by some with non-celiac gluten sensitivity only.
            </p>
          </div>
          <div className="rounded-sm border border-slate-600/50 bg-slate-800/30 p-5">
            <span className="inline-flex items-center rounded-sm border border-slate-600/50 bg-slate-700/25 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-slate-400">
              Contains Gluten
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Standard beer made from barley or wheat malt. Not suitable for a
              gluten-free diet.
            </p>
          </div>
        </div>
        <div className="mt-5 max-w-3xl rounded-sm border border-line bg-surface p-5">
          <p className="text-sm leading-relaxed text-muted">
            <span className="font-display text-foreground">A Canadian legal quirk worth knowing: </span>
            in Canada, real beer cannot legally be called gluten free — Canadian
            regulations define beer as requiring barley or wheat malt. A product
            that is truly gluten free (brewed from millet or sorghum) is technically
            not &ldquo;beer&rdquo; under Canadian law. That&apos;s why genuinely
            celiac-safe options like Glutenberg are sold as gluten-free malt
            beverages — the law, not the liquid, is the reason for the label.
          </p>
        </div>
      </section>

      {/* THE BEER STORE RULE */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">The Beer Store Rule</h2>
        <div className="mt-3 max-w-3xl rounded-sm border border-amber-500/40 bg-amber-900/15 p-6">
          <p className="text-sm leading-relaxed text-muted">
            By law, The Beer Store can only sell malt based alcoholic beverages.
            This means every hard seltzer you buy at Beer Store — White Claw,
            Truly, Cottage Springs, Coors Seltzer, Arizona Hard — is a malt based
            version. The LCBO version of the same brand may be vodka based or
            spirit based, with different ingredients, different nutrition, and
            different gluten status.{" "}
            <span className="text-amber-300">Same can. Same label. Different
            product.</span> If you have celiac disease or gluten sensitivity, buy
            your seltzers at the LCBO — not at Beer Store. Gorilla Fuel flags
            every Beer Store seltzer with a MALT BASED warning so you always know
            what you are actually drinking.
          </p>
        </div>
      </section>

      {/* SECTION 2 — THE CORONA MYTH */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">The Corona Myth</h2>
        <div className="mt-3 max-w-3xl rounded-sm border border-amber-500/40 bg-amber-900/15 p-6">
          <p className="text-sm leading-relaxed text-muted">
            Corona is one of the most misunderstood beers for gluten. It is{" "}
            <span className="text-amber-300">brewed from barley and is NOT gluten
            free</span>. It is NOT recommended for people with celiac disease. People
            with non-celiac gluten sensitivity sometimes report tolerating it — but
            that is individual variation, not scientific confirmation of safety. If
            you have celiac disease, Corona is a contains-gluten beer, full stop.
          </p>
        </div>
      </section>

      {/* SECTION 3 — TRULY SAFE */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">Truly Safe for Celiac Disease</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Every product below is made entirely from gluten-free ingredients.
          {" "}{wineCount} wines in our database are also naturally gluten free —
          wine never touches a gluten grain.
        </p>

        <h3 className="mt-6 font-display text-xl text-green-400">🍁 The Top Canadian Pick — Glutenberg</h3>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Montreal&apos;s Glutenberg brews from millet, buckwheat and corn — a real
          beer that has never touched a gluten grain, and the Gorilla pick for
          anyone with celiac disease.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {certifiedBeers.filter((p) => p.brand === "Glutenberg").map((p) => (
            <div key={p.id} className="rounded-sm border border-green-500/40 bg-surface p-4">
              <p className="font-display text-lg text-foreground">{p.name}</p>
              <p className="mt-1 text-xs text-muted">
                {p.abv}% ABV · {p.caloriesPerCan ?? "—"} cal · {p.carbsPerCan ?? "—"}g carbs per {p.servingMl}mL
              </p>
              {p.gorillaAnalysis && <p className="mt-2 text-xs leading-relaxed text-muted">{p.gorillaAnalysis}</p>}
            </div>
          ))}
        </div>

        <h3 className="mt-8 font-display text-xl text-green-400">Certified GF Seltzers &amp; Ciders</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[...certifiedBeers.filter((p) => p.brand !== "Glutenberg"), ...certifiedCiders].map((p) => (
            <div key={p.id} className="rounded-sm border border-line bg-surface px-4 py-3">
              <p className="text-sm text-foreground">{p.name}</p>
              <p className="text-[11px] text-muted">{p.brand} · {p.abv}% ABV · {p.category}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted">
          Plus all {wineCount} wines —{" "}
          <Link href="/alcohol" className="text-gold underline hover:text-foreground">
            browse the full alcohol rankings with the ✓ Gluten Free filter →
          </Link>
        </p>
      </section>

      {/* SECTION 4 — GLUTEN FREE IN FOOD */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">Gluten Free in Food</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          The Gorilla Fuel scanner flags gluten-containing ingredients in food
          products automatically. Health Canada requires gluten sources to be
          declared on Canadian food labels — here is what to watch for:
        </p>
        <div className="mt-4 flex max-w-3xl flex-wrap gap-2">
          {GF_LABEL_WATCHLIST.map((item) => (
            <span key={item} className="rounded-sm border border-line bg-surface px-3 py-1.5 text-xs text-foreground">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* SECTION 5 — THE OATS QUESTION */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">The Oats Question</h2>
        <div className="mt-3 max-w-3xl rounded-sm border border-line bg-surface p-6">
          <p className="text-sm leading-relaxed text-muted">
            Oats are naturally gluten free — but they are frequently
            cross-contaminated with wheat during growing, transport, and processing.
            Only oats specifically labelled{" "}
            <span className="text-foreground">gluten free</span> or{" "}
            <span className="text-foreground">pure oats</span> are safe for most
            people with celiac disease. Regular oats, even when labelled
            &ldquo;natural,&rdquo; are not safe.
          </p>
        </div>
      </section>

      {/* SECTION 6 — DISCLAIMER */}
      <section className="mt-14">
        <div className="max-w-3xl rounded-sm border border-red-500/40 bg-red-950/20 p-6">
          <p className="font-display text-sm tracking-[0.2em] text-red-300">IMPORTANT DISCLAIMER</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This information is for educational purposes only. Gorilla Fuel is not a
            medical resource. If you have celiac disease or a serious gluten allergy,
            consult your doctor or a registered dietitian before making dietary
            decisions based on this information. Always verify current product
            formulations — recipes change.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function GlutenFreeClient({ initialTab = "alcohol" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-green-400">GORILLA FUEL GLUTEN FREE</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
        Gluten free, <span className="text-green-400">for real.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        An estimated 1 in 100 Canadians has celiac disease, and many more have gluten
        sensitivity. This guide separates what is genuinely safe from what is
        marketing.{" "}
        <span className="text-foreground">Gluten free does not mean healthy</span> —
        the Gorilla Score reflects what is actually in the product, not what the
        label claims.
      </p>

      {/* TABS */}
      <div className="mt-10 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-sm px-5 py-2.5 font-display text-lg tracking-widest transition-colors ${
              tab === t.key
                ? "bg-gold text-background"
                : "border border-line text-muted hover:border-gold-dim hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "alcohol" ? <AlcoholTab /> : <FoodTab tab={tab} />}
      <BackToTop />
    </div>
  );
}
