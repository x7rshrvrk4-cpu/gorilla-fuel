import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GRADE_COLORS, type Grade } from "../scan/lib/scoring";

export const metadata: Metadata = {
  title: "Top Scored — Gorilla Fuel",
  description:
    "The highest-scoring products in the Gorilla Fuel database — the same honest scores the scanner returns, ranked best first.",
  alternates: { canonical: "/top" },
};

// ISR: revalidate hourly. The page is a server component that reads the cache
// once and renders the top 250 — no client fetch, no loading flash.
export const revalidate = 3600;

const KEEP = 250;

type CacheRow = {
  barcode: string;
  product_name: string | null;
  brand: string | null;
  gorilla_score: number | null;
  score_grade: string | null;
  image_url: string | null;
  nutrition_data: Record<string, number | undefined> | null;
};

// ── List-worthy junk/name filter (mirrors the diagnostic, no name dedup) ──────
function normBc(b: string) { return b.replace(/\D/g, "").replace(/^0+/, "") || "0"; }
function isJunkBarcode(bc: string) {
  const d = bc.replace(/\D/g, "");
  return d.length < 8 || /^0+$/.test(d) || normBc(bc).length < 5;
}
function isGarbageName(name: string | null) {
  const n = (name ?? "").trim();
  if (n.length < 3) return true;
  if (!/[a-zA-Z]{3,}/.test(n)) return true;
  if (/^(test|tester|xxx|aaa|dummy|sample|unknown|n\/a|na|tbd|product|produit|item|untitled|no name|sans nom)\b/i.test(n)) return true;
  return false;
}
const macro = (n: CacheRow["nutrition_data"], k: string) =>
  n && typeof n[k] === "number" && Number.isFinite(n[k]) ? (n[k] as number) : null;

/**
 * Top 250 by score, then (protein + fiber) as the tiebreaker, then barcode for a
 * fully deterministic cut. We fetch the top 1000 by (score desc, barcode asc) in
 * ONE query (no offset → none of the non-unique-pagination artifact), which
 * comfortably contains the true top 250, then sort + slice in memory.
 */
async function getTopOverall(): Promise<CacheRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const endpoint = new URL(`${url}/rest/v1/gorilla_product_cache`);
    endpoint.searchParams.set(
      "select",
      "barcode,product_name,brand,gorilla_score,score_grade,image_url,nutrition_data"
    );
    endpoint.searchParams.set("gorilla_score", "gte.75");
    endpoint.searchParams.set("is_alcohol", "eq.false");
    endpoint.searchParams.set("is_beauty", "eq.false");
    endpoint.searchParams.set("order", "gorilla_score.desc,barcode.asc"); // stable, non-artifact
    endpoint.searchParams.set("limit", "1000");
    const res = await fetch(endpoint.toString(), {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) return [];
    const rows: CacheRow[] = await res.json();
    const tb = (r: CacheRow) => (macro(r.nutrition_data, "proteins_100g") ?? 0) + (macro(r.nutrition_data, "fiber_100g") ?? 0);
    return rows
      .filter((r) => !isJunkBarcode(r.barcode) && !isGarbageName(r.product_name))
      .sort((a, b) =>
        (b.gorilla_score! - a.gorilla_score!) || (tb(b) - tb(a)) || a.barcode.localeCompare(b.barcode)
      )
      .slice(0, KEEP);
  } catch {
    return [];
  }
}

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

function ProductCard({ row, rank }: { row: CacheRow; rank: number }) {
  const grade = (row.score_grade ?? "Good") as Grade;
  const color = GRADE_COLORS[grade] ?? GRADE_COLORS.Good;
  return (
    <Link
      href={`/scan?b=${encodeURIComponent(row.barcode)}`}
      className="flex items-center gap-3 rounded-sm border border-line bg-surface px-3 py-3 transition-colors hover:border-gold/50 hover:bg-surface-2 sm:gap-4 sm:px-4"
    >
      {/* Rank */}
      <span className="w-6 shrink-0 text-center font-display text-sm text-muted">{rank}</span>

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
        <p className="truncate text-sm text-foreground">{row.product_name}</p>
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

export default async function TopOverallPage() {
  const products = await getTopOverall();

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA INTEL</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        Top <span className="text-gold">Scored</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        The {products.length} highest-scoring products in the database, ranked by Gorilla Score then
        protein + fiber density. Same honest scores the scanner returns — nothing editorially hidden.
        Macros shown per 100g. Tap any product for the full breakdown.
      </p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-sm border border-line bg-surface px-6 py-8 text-center">
          <p className="font-display text-xl text-foreground">List unavailable right now</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            We couldn&rsquo;t load the rankings. Try again shortly, or scan a product directly.
          </p>
          <Link
            href="/scan"
            className="mt-5 inline-block rounded-sm bg-gold px-6 py-3 font-display text-sm tracking-widest text-background transition-opacity hover:opacity-90"
          >
            Open Scanner →
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-2">
          {products.map((row, i) => (
            <ProductCard key={row.barcode} row={row} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
