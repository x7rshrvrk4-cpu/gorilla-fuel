import Image from "next/image";
import Link from "next/link";
import CrossLinkBanner from "./components/CrossLinkBanner";
import CommunityScansBanner from "./components/CommunityScansBanner";
import HeroSearchBlock from "./components/HeroSearchBlock";
import StatsTicker from "./components/StatsTicker";

const tickerItems = [
  "SCAN BEFORE YOU BUY",
  "100+ PRODUCTS RANKED",
  "ADDITIVES EXPOSED",
  "NO SPONSORED RESULTS",
  "BLACK & GOLD STANDARD",
  "KNOW YOUR INGREDIENTS",
  "BEER · SPIRITS · SUPPLEMENTS",
  "GORILLA FUEL — NO BS",
];

const methodology = [
  {
    step: "01",
    title: "Scan the Code",
    body: "Point your camera at any barcode. We pull live product data straight from Open Food Facts — no guesswork, no marketing spin.",
  },
  {
    step: "02",
    title: "Score the Nutrition",
    body: "Sugar, saturated fat, salt, calories, fiber, and protein get weighed against hard thresholds. Hidden junk doesn't slide past us.",
  },
  {
    step: "03",
    title: "Expose the Additives",
    body: "We scan the ingredients list for flagged additives — colorants, preservatives, sweeteners — and grade each one by real risk level.",
  },
  {
    step: "04",
    title: "Deliver the Verdict",
    body: "Nutrition (60%), additives (30%), and an organic bonus (10%) combine into one score: Excellent, Good, Poor, or Bad. Plus better alternatives, instantly.",
  },
];

const categories = [
  {
    name: "Creatine",
    description: "Purity, mesh size, and third-party testing — separating the proven from the proprietary blends.",
    href: "/rankings",
    accent: "from-[#3a3216] to-[#0f0d08]",
  },
  {
    name: "Whey Protein",
    description: "Protein-per-dollar, amino profiles, and what's really hiding behind 'natural flavors.'",
    href: "/rankings",
    accent: "from-[#352d12] to-[#0f0d08]",
  },
  {
    name: "Pre-Workout",
    description: "Stimulant loads, dosage transparency, and the additives brands hope you'll skim past.",
    href: "/rankings",
    accent: "from-[#3d300f] to-[#0f0d08]",
  },
  {
    name: "BCAAs / EAAs",
    description: "Whether your amino formula is actually doing anything — or just dressed-up sugar water.",
    href: "/rankings",
    accent: "from-[#332b13] to-[#0f0d08]",
  },
  {
    name: "Beer & Alcohol",
    description: "ABV, calorie density, artificial sweeteners, sulfites, and clarity agents — 228 beers, ciders, seltzers, and wines ranked.",
    href: "/alcohol",
    accent: "from-[#3b2e05] to-[#0f0d08]",
  },
  {
    name: "Beauty Scanner",
    description: "Parabens, sulfates, silicones, and 11 flagged chemicals — scan any cosmetic barcode for an instant safety score.",
    href: "/scan",
    accent: "from-[#1e1e2e] to-[#0f0d08]",
  },
];

export default function Home() {
  return (
    <>
      {/* STATS TICKER — live scrolling stats, always above the fold */}
      <StatsTicker />

      {/* HERO — no overflow-hidden: it would clip the search dropdown */}
      <section className="relative border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,215,0,0.10),_transparent_60%)]" />
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 px-6 py-24 text-center sm:py-32">
          <span className="animate-fade rounded-full border border-gold-dim px-4 py-1.5 font-display text-sm tracking-[0.3em] text-gold">
            FOOD · ALCOHOL · SUPPLEMENT · BEAUTY
          </span>
          <h1 className="animate-rise font-display text-5xl leading-[0.95] text-foreground sm:text-7xl md:text-8xl">
            STOP GUESSING
            <br />
            WHAT YOU{" "}
            <span className="gold-gradient-text">SWALLOW.</span>
          </h1>
          <p
            className="animate-rise max-w-xl text-lg text-muted sm:text-xl"
            style={{ animationDelay: "0.15s" }}
          >
            Scan any barcode and get an instant, no-BS health score — sugar,
            additives, and the data brands don&apos;t put on the front of the label.
          </p>
          <HeroSearchBlock />
        </div>

        {/* TICKER TAPE */}
        <div className="overflow-hidden border-t border-line bg-surface py-3">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span
                key={i}
                className="mx-6 flex items-center gap-6 whitespace-nowrap font-display text-lg tracking-[0.25em] text-gold/80"
              >
                {item}
                <span className="text-gold/30">●</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <p className="font-display text-sm tracking-[0.3em] text-gold">
              HOW THE SCORE WORKS
            </p>
            <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
              Our Methodology
            </h2>
            <p className="mt-4 text-muted">
              Every product gets the same cold, consistent treatment. No brand
              gets a pass — the numbers do the talking.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {methodology.map((item) => (
              <div
                key={item.step}
                className="flex flex-col gap-3 bg-surface p-6 transition-colors hover:bg-surface-2"
              >
                <span className="font-display text-3xl text-gold-dim">
                  {item.step}
                </span>
                <h3 className="font-display text-2xl text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY PREVIEW CARDS */}
      <section className="border-b border-line bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-display text-sm tracking-[0.3em] text-gold">
                THE INTELLIGENCE HUB
              </p>
              <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
                Ranked by Category
              </h2>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href="/rankings"
                className="font-display text-lg tracking-widest text-gold hover:underline"
              >
                Supplements →
              </Link>
              <Link
                href="/alcohol"
                className="font-display text-lg tracking-widest text-gold hover:underline"
              >
                Alcohol →
              </Link>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`group relative overflow-hidden rounded-sm border border-line bg-gradient-to-br ${cat.accent} p-8 transition-colors hover:border-gold-dim`}
              >
                <h3 className="font-display text-3xl text-foreground transition-colors group-hover:text-gold">
                  {cat.name}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  {cat.description}
                </p>
                <span className="mt-6 inline-block font-display text-base tracking-widest text-gold opacity-0 transition-opacity group-hover:opacity-100">
                  EXPLORE RANKINGS →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY SCANS THIS WEEK */}
      <CommunityScansBanner />

      {/* GORILLA QUOTE */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="relative mx-auto mb-2 inline-block">
            <div className="pointer-events-none absolute inset-0 -z-10 scale-125 rounded-full bg-gold/20 blur-[50px]" />
            <Image
              src="/gorilla-fuel-hero.png"
              alt="Gorilla Fuel — flexing gorilla"
              width={144}
              height={144}
              unoptimized
              className="relative h-24 w-24 object-contain drop-shadow-[0_0_30px_rgba(255,215,0,0.3)] sm:h-28 sm:w-28"
            />
          </div>
          <p className="font-display text-sm tracking-[0.3em] text-gold">
            THE GORILLA STANDARD
          </p>
          <blockquote className="mt-6 font-display text-3xl leading-tight text-foreground sm:text-5xl">
            &ldquo;Read the label. Question the science. Trust the data —
            <span className="text-gold"> not the marketing.</span>&rdquo;
          </blockquote>
          <p className="mt-6 text-sm uppercase tracking-[0.3em] text-muted">
            — The Gorilla Fuel Standard
          </p>
        </div>
      </section>

      {/* Single Gorilla Sports cross-promotion — no duplicates */}
      <CrossLinkBanner />
    </>
  );
}
