import type { Metadata } from "next";
import Link from "next/link";
import CrossLinkBanner from "../../components/CrossLinkBanner";
import BackToTop from "../../components/BackToTop";
import { ALCOHOL_PRODUCTS, wineGorillaScore } from "../../alcohol/lib/products";

export const metadata: Metadata = {
  title: "Ontario Top 10 Alcohol Rankings — Gorilla Fuel",
  description:
    "The most purchased beers, wines and RTDs in Ontario per official LCBO Q2 2025 sales data — every one scored by the Gorilla Fuel system.",
};

type RankedItem = {
  rank: number;
  name: string;
  score: number | string;
  grade: string;
  stats: string;
  badges?: string[];
  analysis: string;
  wineQuality?: string;
  sweetSpot?: boolean;
};

const TOP_BEERS: RankedItem[] = [
  { rank: 1, name: "Busch Lager", score: 58, grade: "B", stats: "114 cal · 6.9g carbs", analysis: "Clean ingredients for a budget lager. The surprise number one. Nobody talks about Busch but apparently everyone in Ontario is buying it." },
  { rank: 2, name: "Coors Light", score: 62, grade: "B", stats: "102 cal · 5.3g carbs", analysis: "Low calorie light lager. Clean ingredients. One of the better mainstream choices on this list." },
  { rank: 3, name: "Molson Canadian", score: 58, grade: "B", stats: "145 cal · 12.9g carbs", analysis: "The classic Canadian. Mid range calories, mid range carbs. Nothing special, nothing offensive." },
  { rank: 4, name: "Corona Extra", score: 58, grade: "B", stats: "148 cal · 13.9g carbs", analysis: "Contains gluten despite popular belief — not recommended for celiac disease. Otherwise a clean light lager." },
  { rank: 5, name: "Heineken", score: 60, grade: "B", stats: "142 cal · 11.4g carbs", analysis: "Dutch premium lager brewed under license in Canada. Slightly cleaner than most at this price point." },
  { rank: 6, name: "Budweiser", score: 58, grade: "B", stats: "145 cal · 10.9g carbs", analysis: "Brewed in London Ontario by Labatt. Clean ingredients. The quintessential North American lager." },
  { rank: 7, name: "Michelob Ultra", score: 72, grade: "A", stats: "95 cal · 2.6g carbs", analysis: "The healthiest beer on this top 10 list by a significant margin. If you are going to drink a mainstream beer, this is the Gorilla pick." },
  { rank: 8, name: "Bud Light", score: 62, grade: "B", stats: "110 cal · 6.6g carbs", analysis: "Low calorie light lager. Clean ingredients. Widely available and consistent." },
  { rank: 9, name: "Stella Artois", score: 60, grade: "B", stats: "141 cal · 11.1g carbs", analysis: "Belgian style lager brewed in Canada. Clean ingredients. Slightly premium taste profile." },
  { rank: 10, name: "Labatt Blue", score: 58, grade: "B", stats: "145 cal · 12.9g carbs", analysis: "The Canadian classic since 1951. Clean ingredients. Mid range on everything." },
];

const TOP_WINES: RankedItem[] = [
  { rank: 1, name: "Stoneleigh Sauvignon Blanc", score: 68, grade: "B", wineQuality: "88 — Wine Enthusiast", stats: "130 cal · 3.1g carbs", analysis: "New Zealand benchmark. Clean, dry, crisp. Best value Sauvignon Blanc widely available in Canada." },
  { rank: 2, name: "Kim Crawford Sauvignon Blanc", score: 70, grade: "A", wineQuality: "93 — Wine Spectator", sweetSpot: true, stats: "141 cal · 4.2g carbs", analysis: "Number two best seller and one of the highest critic rated wines on this list. 93 points from Wine Spectator is exceptional for a widely available wine." },
  { rank: 3, name: "Santa Margherita Pinot Grigio", score: 68, grade: "B", wineQuality: "90 — Wine Spectator", sweetSpot: true, stats: "140 cal · 2.8g carbs", analysis: "Italian benchmark Pinot Grigio. Only 2.8g carbs per glass. One of the cleanest whites on this list." },
  { rank: 4, name: "Mionetto Prestige Prosecco", score: 55, grade: "B", wineQuality: "86 — Wine Enthusiast", stats: "119 cal · 6.4g carbs", analysis: "Higher carbs from residual Prosecco sugar. Fine for celebrations but not the healthiest sparkling option." },
  { rank: 5, name: "Veuve Clicquot Brut", score: 72, grade: "A", wineQuality: "92 — Wine Spectator", sweetSpot: true, stats: "116 cal · 4.2g carbs", analysis: "The most impressive entry on this list. 92 critic points AND a strong Gorilla Score. True Brut Champagne scores well because residual sugar is very low." },
  { rank: 6, name: "Peller Family Vineyards", score: 68, grade: "B", wineQuality: "87 — WineAlign", badges: ["ONTARIO VQA", "CANADIAN"], stats: "135 cal · 4.0g carbs", analysis: "Local Ontario wine in the top 10. Peller makes reliable everyday drinking wines from the Niagara Peninsula." },
  { rank: 7, name: "Oyster Bay Sauvignon Blanc", score: 70, grade: "A", wineQuality: "90 — James Suckling", sweetSpot: true, stats: "134 cal · 3.2g carbs", analysis: "New Zealand clean and crisp. Low carbs, strong critic score. Another standout on this list." },
  { rank: 8, name: "Jackson-Triggs", score: 68, grade: "B", wineQuality: "86 — WineAlign", badges: ["ONTARIO VQA", "CANADIAN"], stats: "135 cal · 4.0g carbs", analysis: "Ontario wine appearing in the top 10. The most purchased Ontario VQA brand in Canada. Consistent and reliable." },
  { rank: 9, name: "Côte des Roses Rosé", score: 65, grade: "B", wineQuality: "88 — Wine Enthusiast", stats: "128 cal · 3.5g carbs", analysis: "French Provence rosé with the distinctive rose bottle. Dry style, lower sugar than most rosés." },
  { rank: 10, name: "Jackson-Triggs (second variety)", score: "—", grade: "", badges: ["ONTARIO VQA", "CANADIAN"], stats: "", analysis: "Jackson-Triggs appears twice in the Ontario top 10, confirming a dominant local market position." },
];

const TOP_RTD: RankedItem[] = [
  { rank: 1, name: "Cottage Springs Vodka Soda", score: 78, grade: "A", badges: ["CANADIAN", "LONDON ON"], stats: "0g sugar", analysis: "The best nutritional pick on this entire RTD list. Canadian made, zero carb, zero sugar. A London Ontario brand at number one in Ontario." },
  { rank: 2, name: "Twisted Tea Original", score: 28, grade: "D", stats: "23g sugar", analysis: "23 grams of sugar per can. The worst nutritional score on this list. Tastes great. Scores poorly. Know what you are drinking." },
  { rank: 3, name: "White Claw Original", score: 75, grade: "A", stats: "2g sugar", analysis: "Low calorie, low sugar, clean hard seltzer. The global benchmark for the category. Note: the Beer Store version is malt based." },
  { rank: 4, name: "Smirnoff Ice", score: 28, grade: "D", stats: "30g sugar", analysis: "30 grams of sugar per bottle. Treat as dessert, not a casual drink." },
  { rank: 5, name: "Mike's Hard Lemonade", score: 30, grade: "D", stats: "32g sugar", analysis: "32 grams of sugar — the sugar content of a Coke in a flavoured malt beverage." },
  { rank: 6, name: "Black Fly", score: "varies", grade: "", badges: ["CANADIAN", "LONDON ON"], stats: "", analysis: "Zero Sugar Vodka Soda scores 75. Flavoured varieties score 35 to 38. Choose the zero sugar option." },
  { rank: 7, name: "Mott's Clamato Caesar", score: 38, grade: "D", stats: "16g sugar · high sodium", analysis: "Canada's national cocktail in a can. High sodium, high sugar. Cultural icon. Nutritional reality check." },
  { rank: 8, name: "Coors Seltzer", score: 70, grade: "A", stats: "2g sugar", analysis: "Clean low calorie hard seltzer. Good choice in the RTD category. Note: the Beer Store version is malt based." },
  { rank: 9, name: "NÜTRL Vodka Soda", score: 78, grade: "A", badges: ["CANADIAN"], stats: "0g sugar", analysis: "Zero sugar Canadian vodka soda. Same strong nutritional profile as Cottage Springs." },
  { rank: 10, name: "Cut Vodka Soda", score: 76, grade: "A", badges: ["CANADIAN"], stats: "0g sugar", analysis: "Clean low sugar Canadian vodka soda. Rounds out the top 10 with another strong nutritional performer." },
];

const BOTTOM_10: { name: string; score: string; reason: string }[] = [
  { name: "Twisted Tea Original", score: "28", reason: "23g sugar per can" },
  { name: "Smirnoff Ice", score: "28", reason: "30g sugar per bottle" },
  { name: "Mike's Hard Lemonade", score: "30", reason: "32g sugar per can" },
  { name: "Simply Spiked Lemonade", score: "30", reason: "20g sugar per can" },
  { name: "Black Fly Flavoured Coolers", score: "35–38", reason: "high sugar" },
  { name: "Mott's Clamato Caesar", score: "38", reason: "16g sugar, high sodium" },
  { name: "Waterloo Radler", score: "45", reason: "14g sugar from fruit juice" },
  { name: "Molson Cold Shots", score: "48", reason: "higher ABV — 5.9%" },
  { name: "Laker Ice", score: "48", reason: "higher ABV — 5.9%" },
  { name: "Busch Ice 6.0", score: "50", reason: "higher ABV — 6.0%" },
];

function scoreColor(score: number | string): string {
  if (typeof score !== "number") return "text-slate-400";
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-green-400";
  if (score >= 35) return "text-amber-400";
  return "text-red-400";
}

function RankedRow({ item, showQuality }: { item: RankedItem; showQuality?: boolean }) {
  return (
    <div className="gorilla-card flex gap-4 rounded-sm p-5">
      <span className="font-display text-4xl text-gold-dim">{item.rank}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-xl text-foreground">{item.name}</h3>
          {item.sweetSpot && (
            <span
              title="This wine scored well on both nutrition and critic ratings. The best of both worlds."
              className="inline-flex cursor-help items-center rounded-sm border border-gold bg-gold/15 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-gold"
            >
              🦍 Gorilla Sweet Spot
            </span>
          )}
          {item.badges?.map((b) => (
            <span key={b} className="inline-flex items-center rounded-sm border border-emerald-600/60 bg-emerald-800/20 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-emerald-400">
              {b === "CANADIAN" ? "🍁 " : ""}{b}
            </span>
          ))}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className={`font-display text-lg ${scoreColor(item.score)}`}>
            🦍 {typeof item.score === "number" ? `${item.score}` : item.score}{item.grade ? ` · ${item.grade}` : ""}
          </span>
          {showQuality && (
            <span className="text-amber-300">⭐ {item.wineQuality ?? "UNRATED"}</span>
          )}
          {item.stats && <span className="text-muted">{item.stats}</span>}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.analysis}</p>
      </div>
    </div>
  );
}

function Verdict({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-sm border border-gold bg-gradient-to-r from-gold/10 to-transparent p-6">
      <p className="font-display text-base tracking-[0.2em] text-gold">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

export default function AlcoholTop10Page() {
  // ── SECTION 4 — computed dynamically from the live database ────────────────
  // Combined score = average of Gorilla Score and Wine Quality; only rated
  // wines are eligible. Updates automatically as new quality scores are added.
  const sweetSpotTop10 = ALCOHOL_PRODUCTS.filter(
    (p) => p.category === "Wines" && p.wineQuality !== undefined
  )
    .map((p) => ({
      p,
      gorilla: wineGorillaScore(p),
      combined: (wineGorillaScore(p) + (p.wineQuality ?? 0)) / 2,
    }))
    .sort((a, b) => b.combined - a.combined)
    .slice(0, 10);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">LCBO Q2 2025 OFFICIAL SALES DATA</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
        Ontario&apos;s Top 10s, <span className="text-gold">scored.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        These are the most purchased alcoholic beverages in Ontario right now,
        according to official LCBO Q2 2025 sales data. Every one has been run
        through the Gorilla Fuel scoring system so you know exactly what you are
        buying. Some results will surprise you.
      </p>

      {/* SECTION 1 — BEERS */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">Top 10 Best Selling Beers in Ontario</h2>
        <div className="mt-5 flex flex-col gap-3">
          {TOP_BEERS.map((b) => <RankedRow key={b.rank} item={b} />)}
        </div>
        <Verdict title="THE GORILLA VERDICT ON TOP 10 BEERS">
          Michelob Ultra is the clear winner if you care about nutrition. Coors
          Light and Bud Light are the best of the rest for low calorie options.
          None of these beers contain artificial colours or flavours. The biggest
          myth on this list is Corona being gluten free. It is not. It is brewed
          from barley.
        </Verdict>
      </section>

      {/* SECTION 2 — WINES */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">Top 10 Best Selling Wines in Ontario</h2>
        <div className="mt-5 flex flex-col gap-3">
          {TOP_WINES.map((w) => <RankedRow key={w.rank} item={w} showQuality />)}
        </div>
        <Verdict title="THE GORILLA VERDICT ON TOP 10 WINES">
          Kim Crawford and Veuve Clicquot are the standout picks, combining high
          sales with strong Gorilla Scores and top critic ratings. The Ontario
          story is real — Jackson-Triggs and Peller both crack the top 10,
          showing strong local support. Inniskillin Vidal Icewine holds a Wine
          Spectator score of 95, making it one of the most critically acclaimed
          products in our entire database. Avoid Mionetto if watching carbs —
          residual Prosecco sugar adds up quickly.
        </Verdict>
      </section>

      {/* SECTION 3 — RTD */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">Top 10 Best Selling RTDs in Ontario</h2>
        <div className="mt-5 flex flex-col gap-3">
          {TOP_RTD.map((r) => <RankedRow key={r.rank} item={r} />)}
        </div>
        <Verdict title="THE GORILLA VERDICT ON TOP 10 RTD">
          The top 10 RTD list in Ontario splits cleanly into two groups. The
          vodka sodas — Cottage Springs, White Claw, NÜTRL and Cut — all score
          well with low sugar and clean ingredients. The flavoured malt
          beverages — Twisted Tea, Smirnoff Ice and Mike&apos;s Hard — all score
          poorly with 23 to 32 grams of sugar per serving. Ontario is buying
          both in roughly equal measure. Now you know the difference.
        </Verdict>
      </section>

      {/* SECTION 4 — GORILLA SWEET SPOT TOP 10 (dynamic) */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">
          The <span className="text-gold">Gorilla Sweet Spot</span> Top 10 Wines
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Most wine lists tell you what tastes best. Most health apps tell you
          what is healthiest. This is the only list in Canada that tells you both
          at the same time. These wines earned their place by scoring well on
          expert taste ratings AND on Gorilla Fuel nutrition scoring. Drink these
          and you are winning on both counts.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {sweetSpotTop10.map(({ p, gorilla, combined }, i) => (
            <div key={p.id} className="gorilla-card flex items-center gap-4 rounded-sm p-5">
              <span className="font-display text-4xl text-gold-dim">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl text-foreground">{p.name}</h3>
                  <span
                    title="This wine scored well on both nutrition and critic ratings. The best of both worlds."
                    className="inline-flex cursor-help items-center rounded-sm border border-gold bg-gold/15 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-gold"
                  >
                    🦍 Gorilla Sweet Spot
                  </span>
                  {p.ontarioVQA && (
                    <span className="inline-flex items-center rounded-sm border border-emerald-600/60 bg-emerald-800/20 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-emerald-400">
                      🍁 Ontario VQA
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  🦍 Gorilla {gorilla} · ⭐ Quality {p.wineQuality} ({p.wineQualitySource})
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Combined</p>
                <p className="font-display text-3xl text-gold">{combined.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — HONEST BOTTOM 10 */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-foreground">The Honest Bottom 10 Most Popular</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          These are some of the most popular drinks in Ontario. They also score
          the lowest on the Gorilla system. We are not saying do not drink them.
          We are saying know what is in them. That is literally the entire point
          of Gorilla Fuel.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {BOTTOM_10.map((b) => (
            <div key={b.name} className="gorilla-card flex items-center justify-between gap-3 rounded-sm px-5 py-3">
              <div>
                <p className="text-sm text-foreground">{b.name}</p>
                <p className="text-xs text-muted">{b.reason}</p>
              </div>
              <span className="font-display text-2xl text-red-400">{b.score}</span>
            </div>
          ))}
        </div>
      </section>

      {/* DISCLAIMER */}
      <div className="mt-12 rounded-sm border border-line bg-surface p-5">
        <p className="text-xs leading-relaxed text-muted">
          Beer and RTD sales rankings sourced from the official LCBO Q2 2025
          Quarterly Update, published December 2025. Wine quality scores sourced
          from critic ratings displayed on LCBO product pages including James
          Suckling, Wine Spectator, Wine Enthusiast, WineAlign, Decanter, and
          National Wine Awards of Canada. Scores reflect the most recent vintage
          reviewed. Gorilla nutrition scores calculated using our publicly
          documented methodology at{" "}
          <Link href="/methodology" className="text-gold underline">gorillafuel.ca/methodology</Link>.
          No brand pays for placement on this page.
        </p>
      </div>

      <div className="mt-16 -mx-5 sm:-mx-8">
        <CrossLinkBanner />
      </div>
      <BackToTop />
    </div>
  );
}
