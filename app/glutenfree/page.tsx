import type { Metadata } from "next";
import Link from "next/link";
import CrossLinkBanner from "../components/CrossLinkBanner";
import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";

export const metadata: Metadata = {
  title: "Gluten Free Guide — Gorilla Fuel",
  description:
    "Which drinks and snacks are genuinely safe for celiac disease — certified GF vs gluten-removed vs contains gluten, per Health Canada and CFIA regulations.",
};

const GF_LABEL_WATCHLIST = [
  "Wheat", "Barley", "Rye", "Triticale",
  "Oats (unless certified pure / gluten-free oats)",
  "Malt", "Malt extract", "Malt vinegar",
  "Modified wheat starch", "Spelt", "Kamut",
];

export default function GlutenFreePage() {
  const certified = ALCOHOL_PRODUCTS.filter((p) => p.glutenStatus === "certified-gf");
  const certifiedBeers = certified.filter((p) => p.category !== "Wines" && p.category !== "Cider");
  const certifiedCiders = certified.filter((p) => p.category === "Cider");
  const wineCount = certified.filter((p) => p.category === "Wines").length;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-green-400">GORILLA FUEL GLUTEN FREE</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
        Gluten free, <span className="text-green-400">for real.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        An estimated 1 in 100 Canadians has celiac disease, and many more have gluten
        sensitivity. This guide separates what is genuinely safe from what is
        marketing — using Health Canada and CFIA regulations as the source.
      </p>

      {/* SECTION 1 — THE THREE TIERS */}
      <section className="mt-14">
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
                {p.abv}% ABV · {p.caloriesPerCan} cal · {p.carbsPerCan}g carbs per {p.servingMl}mL
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

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
    </div>
  );
}
