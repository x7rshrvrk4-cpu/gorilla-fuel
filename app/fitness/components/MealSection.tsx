import Link from "next/link";
import { PANTRY_BY_ID, type PantryItem, type PantryCategory } from "../lib/pantryLibrary";
import { gradeFromScore, GRADE_COLORS } from "../../scan/lib/scoring";
import { amazonUrl } from "../../lib/affiliates";
import type { Plan } from "../lib/plans";

/**
 * The meal side of a plan page: the sample day, the plan's pantry anchors as
 * compact scored cards (modeled on CuratedPicksSection — name + numeric 0–100
 * badge in the tier color), and the cheat allowance. Server-rendered — the score
 * deep-link and the affiliate button are plain <Link>/<a> hyperlinks (no client
 * interaction), so no client leaf is needed, matching CuratedPicksSection.
 *
 * Honesty rules honored: null scoreHint → no badge (initial-letter avatar
 * instead); null barcode → no score deep-link (a subtle "scan to score" hint, not
 * a fabricated /scan link); grocery → a "grocery item" tag, no buy link.
 */

const CATEGORY_ORDER: PantryCategory[] = ["protein", "carb", "fat", "produce", "supplement"];
const CATEGORY_LABEL: Record<PantryCategory, string> = {
  protein: "Protein",
  carb: "Carbs",
  fat: "Fats",
  produce: "Produce",
  supplement: "Supplement",
};

const MEAL_ROWS: { key: keyof Plan["sampleDay"]; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snack", label: "Snack" },
];

export default function MealSection({ plan }: { plan: Plan }) {
  // Resolve pantry ids → items (skip any unknown id defensively), group by category.
  const items = plan.mealAnchors
    .map((id) => PANTRY_BY_ID[id])
    .filter((i): i is PantryItem => Boolean(i));
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mt-4 flex flex-col gap-6">
      {/* ── Sample day ─────────────────────────────────────────────────────── */}
      <div className="gorilla-card rounded-sm p-5">
        <p className="font-display text-sm tracking-[0.2em] text-gold">A DAY ON THIS PLAN</p>
        <div className="mt-3 flex flex-col divide-y divide-line">
          {MEAL_ROWS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-4">
              <p className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-muted sm:w-24 sm:pt-0.5">
                {label}
              </p>
              <p className="text-sm leading-relaxed text-foreground/90">{plan.sampleDay[key]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pantry anchors ─────────────────────────────────────────────────── */}
      <div>
        <p className="font-display text-sm tracking-[0.2em] text-gold">FOODS THIS PLAN IS BUILT AROUND</p>
        <p className="mt-1 text-xs leading-relaxed text-muted/70">
          Whole-food staples, with their Gorilla score. Scan one in-store to check the exact product you&apos;re holding.
        </p>
        <div className="mt-4 flex flex-col gap-5">
          {groups.map(({ cat, items }) => (
            <div key={cat}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted/70">{CATEGORY_LABEL[cat]}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {items.map((item) => (
                  <PantryCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cheat allowance ────────────────────────────────────────────────── */}
      <div className="rounded-sm border border-line bg-surface p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold">The treat</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{plan.cheatAllowance}</p>
      </div>
    </div>
  );
}

function PantryCard({ item }: { item: PantryItem }) {
  const hasScore = item.scoreHint != null;
  const color = hasScore ? GRADE_COLORS[gradeFromScore(item.scoreHint!)] : undefined;
  // Real deep-link only when a barcode exists — never fabricate one.
  const scoreLink = item.barcode ? `/scan?b=${encodeURIComponent(item.barcode)}` : null;
  // amazonUrl always returns a tagged URL; only build it for shippable items.
  const buyUrl = item.affiliate === "amazon" ? amazonUrl(item.name) : null;

  const inner = (
    <div className="flex items-center gap-3">
      {hasScore ? (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border-2 font-display text-xl"
          style={{ borderColor: color, color }}
        >
          {item.scoreHint}
        </div>
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-line font-display text-lg text-muted">
          {item.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-tight text-foreground">{item.name}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-muted/60">
          {scoreLink ? "Scan for live score →" : "Scan in-store to score"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="gorilla-card flex flex-col gap-2.5 rounded-sm p-3">
      {scoreLink ? (
        <Link href={scoreLink} className="rounded-sm transition-colors hover:opacity-90">
          {inner}
        </Link>
      ) : (
        inner
      )}

      {buyUrl ? (
        <a
          href={buyUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="inline-block self-start rounded-sm border border-gold-dim px-3 py-1 font-display text-[10px] uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-background"
        >
          Buy on Amazon ↗
        </a>
      ) : (
        <span className="inline-block self-start rounded-sm border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted/60">
          Grocery item
        </span>
      )}
    </div>
  );
}
