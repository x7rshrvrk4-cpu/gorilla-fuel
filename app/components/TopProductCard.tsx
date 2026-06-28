import Image from "next/image";
import Link from "next/link";
import { GRADE_COLORS, type Grade } from "../scan/lib/scoring";
import { macro, type CacheRow } from "../lib/topProducts";

function Macro({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-sm leading-none text-foreground">
        {value == null ? "—" : `${Math.round(value * 10) / 10}${unit}`}
      </span>
      <span className="mt-1 text-[9px] uppercase tracking-[0.15em] text-muted">{label}</span>
    </div>
  );
}

/**
 * Shared product card for the Top Scored list (/top) and the home "Top Rated
 * Foods" rail. Macros shown per 100g (the regulated, comparable figure). Whole
 * card deep-links to the existing scan-result view via /scan?b=. `rank` is
 * optional — when omitted the rank chip is hidden.
 */
export default function TopProductCard({ row, rank }: { row: CacheRow; rank?: number }) {
  const grade = (row.score_grade ?? "Good") as Grade;
  const color = GRADE_COLORS[grade] ?? GRADE_COLORS.Good;
  return (
    <Link
      href={`/scan?b=${encodeURIComponent(row.barcode)}`}
      className="flex items-center gap-3 rounded-sm border border-line bg-surface px-3 py-3 transition-colors hover:border-gold/50 hover:bg-surface-2 sm:gap-4 sm:px-4"
    >
      {/* Rank */}
      {rank != null && (
        <span className="w-6 shrink-0 text-center font-display text-sm text-muted">{rank}</span>
      )}

      {/* Image / placeholder */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-line bg-background">
        {row.image_url ? (
          <Image src={row.image_url} alt="" fill unoptimized className="object-contain" sizes="56px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg opacity-40">🦍</div>
        )}
      </div>

      {/* Name + macros */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{row.display_name_en ?? row.product_name}</p>
        <p className="truncate text-xs text-muted">{row.brand || "—"}</p>
        <div className="mt-2 flex gap-4">
          <Macro label="Protein" value={macro(row.nutrition_data, "proteins_100g")} unit="g" />
          <Macro label="Fiber" value={macro(row.nutrition_data, "fiber_100g")} unit="g" />
          <Macro label="Sugar" value={macro(row.nutrition_data, "sugars_100g")} unit="g" />
        </div>
      </div>

      {/* Score badge + grade pill */}
      <div className="flex shrink-0 flex-col items-center gap-1">
        <span className="font-display text-3xl leading-none" style={{ color }}>{row.gorilla_score}</span>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-display uppercase tracking-[0.15em]"
          style={{ color, backgroundColor: `${color}1a` }}
        >
          {grade}
        </span>
      </div>
    </Link>
  );
}
