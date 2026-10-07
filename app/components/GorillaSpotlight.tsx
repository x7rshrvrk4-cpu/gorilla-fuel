import Link from "next/link";
import { activeSponsors } from "../lib/sponsors";
import { gradeFromScore, GRADE_COLORS } from "../scan/lib/scoring";

/**
 * Gorilla Spotlight — the ONE paid, clearly-labeled placement on the site.
 *
 * Policy (never relax): the spotlight is paid, but the score is not. Every card
 * is stamped "SPONSORED" and shows the product's real earned Gorilla Score. We
 * only ever feature products that already score well — a brand can buy the
 * spotlight, never a better number.
 *
 * Renders nothing when there are no active sponsors, so it is safe to ship and
 * sits dormant until the first partner signs.
 */
export default function GorillaSpotlight() {
  const items = activeSponsors();
  if (items.length === 0) return null;

  return (
    <section className="border-b border-line bg-background">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-sm bg-gold px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.25em] text-background">
            Sponsored
          </span>
          <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA SPOTLIGHT</p>
        </div>
        <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Partner Spotlight</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          A paid placement from a brand we think is worth your attention — but the score below is the
          real, earned Gorilla Score. Nobody can buy a better number.
        </p>

        <div
          className={`mt-8 grid gap-4 ${items.length >= 3 ? "sm:grid-cols-3" : items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1 sm:max-w-xl"}`}
        >
          {items.map((s) => {
            const color = GRADE_COLORS[gradeFromScore(s.score)];
            return (
              <div
                key={s.id}
                className="relative flex flex-col overflow-hidden rounded-sm border border-gold bg-gradient-to-br from-gold/[0.08] to-transparent p-6"
              >
                <span className="absolute right-4 top-4 rounded-sm border border-gold/50 bg-gold/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em] text-gold">
                  Sponsored
                </span>

                <div className="flex items-start justify-between gap-3 pr-20">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{s.category}</p>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-foreground">{s.product}</h3>
                    <p className="text-sm text-muted">{s.brand}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-4xl leading-none" style={{ color }}>
                      {s.score}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted">/ 100</p>
                  </div>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{s.blurb}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {s.lcboNumber && (
                    <span className="inline-flex items-center rounded-sm border border-amber-600/40 bg-amber-900/20 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-amber-400">
                      LCBO #{s.lcboNumber}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-gold">
                    🦍 Earned score
                  </span>
                  {s.href ? (
                    <Link href={s.href} className="ml-auto font-display text-xs tracking-widest text-gold hover:underline">
                      See the score →
                    </Link>
                  ) : s.buyUrl ? (
                    <a
                      href={s.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="ml-auto font-display text-xs tracking-widest text-gold hover:underline"
                    >
                      Learn more →
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted/70">
          Spotlight placements are clearly labeled and paid. Scores are independent and can never be
          purchased — we only spotlight products that already score well.
        </p>
      </div>
    </section>
  );
}
