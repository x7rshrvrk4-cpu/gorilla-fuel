import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Food & Snacks — Gorilla Fuel",
  description:
    "Canada's no-BS food intelligence hub. Gorilla Approved snacks, the Cheat List, Stay Away products, Kids picks, and Gluten Free options — all scored by the same algorithm the scanner uses.",
  alternates: { canonical: "/approved" },
};

const DOORS = [
  {
    href: "/approved/list",
    emoji: "✅",
    label: "GORILLA APPROVED",
    sub: "Score 70+. Whole-food ingredients. No artificial anything.",
    color: "emerald",
  },
  {
    href: "/cheat",
    emoji: "😈",
    label: "CHEAT LIST",
    sub: "Score 40–69. Knowingly imperfect. Worth it sometimes.",
    color: "amber",
  },
  {
    href: "/avoid",
    emoji: "🚫",
    label: "STAY AWAY",
    sub: "Score below 40. Ultra-processed. We name names.",
    color: "red",
  },
  {
    href: "/kids",
    emoji: "👶",
    label: "KIDS",
    sub: "Lower sugar thresholds and stricter additive rules for little humans.",
    color: "blue",
  },
  {
    href: "/glutenfree",
    emoji: "🌾",
    label: "GLUTEN FREE",
    sub: "Certified gluten-free products scored the same way as everything else.",
    color: "green",
  },
];

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; hover: string }> = {
  emerald: {
    border: "border-emerald-600/40",
    bg:     "bg-emerald-900/20",
    text:   "text-emerald-400",
    hover:  "hover:border-emerald-500",
  },
  amber: {
    border: "border-amber-600/40",
    bg:     "bg-amber-900/20",
    text:   "text-amber-400",
    hover:  "hover:border-amber-500",
  },
  red: {
    border: "border-red-600/40",
    bg:     "bg-red-900/20",
    text:   "text-red-400",
    hover:  "hover:border-red-500",
  },
  blue: {
    border: "border-blue-600/40",
    bg:     "bg-blue-900/20",
    text:   "text-blue-400",
    hover:  "hover:border-blue-500",
  },
  green: {
    border: "border-green-600/40",
    bg:     "bg-green-900/20",
    text:   "text-green-400",
    hover:  "hover:border-green-500",
  },
};

export default function FoodHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="font-display text-sm tracking-[0.3em] text-gold">FOOD INTELLIGENCE HUB</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
        Food &amp; Snacks.
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Every product scored by the same algorithm the scanner uses. Whole-food approved picks, honest cheat
        options, and the ultra-processed products we think you should avoid — all in one place.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOORS.map((door) => {
          const c = COLOR_MAP[door.color];
          return (
            <Link
              key={door.href}
              href={door.href}
              className={`group flex min-h-[180px] flex-col justify-between rounded-sm border ${c.border} ${c.bg} p-7 transition-all ${c.hover} hover:shadow-lg`}
            >
              <div>
                <p className="text-3xl">{door.emoji}</p>
                <h2 className={`mt-3 font-display text-2xl tracking-widest ${c.text} sm:text-3xl`}>
                  {door.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{door.sub}</p>
              </div>
              <span className={`mt-4 font-display text-sm tracking-widest ${c.text} opacity-0 transition-opacity group-hover:opacity-100`}>
                Explore →
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 rounded-sm border border-line bg-surface px-6 py-5">
        <p className="text-xs leading-relaxed text-muted">
          All scores generated algorithmically from publicly available data. Ingredients, macros, additives, and
          NOVA classification are all factored in. The same score the barcode scanner returns. No brand pays for
          placement — ever.
        </p>
      </div>
    </div>
  );
}
