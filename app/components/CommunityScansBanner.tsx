import Link from "next/link";
import { getTopScanned, type TopScannedProduct } from "../scan/lib/productCache";

function gradeColor(grade: TopScannedProduct["score_grade"]): string {
  switch (grade) {
    case "S": return "text-emerald-400";
    case "A": return "text-green-400";
    case "B": return "text-lime-400";
    case "C": return "text-yellow-400";
    case "D": return "text-orange-400";
    case "F": return "text-red-400";
    default:  return "text-muted";
  }
}

export default async function CommunityScansBanner() {
  // Truncate to midnight so the Supabase URL is stable for a full day —
  // a millisecond-precise timestamp would produce a new cache key on every
  // render, defeating next: { revalidate: 300 } in getTopScanned.
  const since = new Date();
  since.setDate(since.getDate() - 7);
  since.setHours(0, 0, 0, 0);

  const products = await getTopScanned(10, since);
  if (products.length === 0) return null;

  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-sm tracking-[0.3em] text-gold">
              COMMUNITY INTELLIGENCE
            </p>
            <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
              Community Scans This Week
            </h2>
            <p className="mt-3 text-sm text-muted">
              The 10 most-scanned products by Gorilla Fuel users in the last 7 days.
            </p>
          </div>
          <Link
            href="/scan"
            className="mt-4 shrink-0 font-display text-sm tracking-[0.3em] text-gold transition-colors hover:text-foreground sm:mt-0"
          >
            SCAN A PRODUCT →
          </Link>
        </div>

        <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
          {products.map((p, i) => (
            <div
              key={p.barcode}
              className="flex items-center gap-4 bg-surface p-5 transition-colors hover:bg-surface-2"
            >
              <span className="w-6 shrink-0 font-display text-xl text-gold-dim">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base text-foreground">
                  {p.product_name ?? "Unknown Product"}
                </p>
                {p.brand && (
                  <p className="truncate text-xs text-muted">{p.brand}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                {p.gorilla_score !== null && (
                  <span className={`font-display text-xl ${gradeColor(p.score_grade)}`}>
                    {p.score_grade}
                    <span className="ml-1 text-xs text-muted">
                      {p.gorilla_score}
                    </span>
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-widest text-muted/60">
                  {p.scan_count} scan{p.scan_count !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
