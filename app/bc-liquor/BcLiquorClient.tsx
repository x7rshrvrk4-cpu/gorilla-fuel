"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BC_KINDS, type BcCounts, type BcLiquorRow } from "../lib/bcLiquor";

type Props = {
  counts: BcCounts;
  rows: BcLiquorRow[];
  activeKind: string | null;
  limit: number;
};

const KIND_LABEL: Record<string, string> = {
  wine: "Wine",
  spirits: "Spirits",
  beer: "Beer",
  cider: "Cider",
  refreshment: "Refreshment",
  other: "Other",
};

const fmtPrice = (p: number | null) =>
  p == null ? "—" : `$${p.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtAbv = (a: number | null) => (a == null ? "—" : `${a}%`);
const fmtLitres = (l: number | null) => (l == null ? "—" : `${l} L`);

export default function BcLiquorClient({ counts, rows, activeKind, limit }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.product_name ?? "").toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q) ||
        (r.country_origin ?? "").toLowerCase().includes(q) ||
        (r.barcode ?? "").includes(q)
    );
  }, [rows, query]);

  const activeCount = activeKind ? counts.byKind[activeKind] ?? 0 : counts.total;
  const truncated = activeCount > rows.length;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      {/* HEADER */}
      <p className="font-display text-sm tracking-[0.3em] text-sky-400">BRITISH COLUMBIA · BCLDB DATA</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
        The <span className="text-sky-400">BC Liquor</span> Catalogue.
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        {counts.total.toLocaleString("en-CA")} products from the British Columbia Liquor Distribution Branch
        (BCLDB) price list — wines, spirits, beers and coolers, with ABV, price and origin straight from the
        provincial catalogue.
      </p>

      {/* HONESTY BANNER — distinct from the Ontario rankings; sets expectations. */}
      <div className="mt-5 rounded-sm border border-sky-500/30 bg-sky-500/[0.06] px-4 py-3 text-sm leading-relaxed text-sky-100/80">
        <span className="font-display tracking-wide text-sky-300">British Columbia availability.</span>{" "}
        This is BCLDB catalogue data — separate from our{" "}
        <Link href="/alcohol" className="text-sky-300 underline hover:text-foreground">
          Ontario (LCBO &amp; Beer Store) rankings
        </Link>
        . These products may not be sold outside BC. It&apos;s a raw catalogue view: prices and ABV are listed,
        but these items aren&apos;t Gorilla-scored yet, and the {counts.total > 0 ? (counts.total - counts.withBarcode).toLocaleString("en-CA") : "some"}{" "}
        products without a UPC on file are browsable here but not barcode-scannable.
      </div>

      {/* KIND FILTER TABS (server navigation via ?kind=) */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FilterTab href="/bc-liquor" label="All" count={counts.total} active={activeKind === null} />
        {BC_KINDS.map((k) => (
          <FilterTab
            key={k}
            href={`/bc-liquor?kind=${k}`}
            label={KIND_LABEL[k] ?? k}
            count={counts.byKind[k] ?? 0}
            active={activeKind === k}
          />
        ))}
      </div>

      {/* SEARCH (client-side, over the loaded page) */}
      <div className="mt-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this list by name, category, origin or UPC…"
          className="w-full rounded-sm border border-line bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-sky-400/50 focus:outline-none"
        />
      </div>

      {/* COUNT LINE */}
      <p className="mt-4 text-xs text-muted">
        Showing {filtered.length.toLocaleString("en-CA")}
        {query ? ` match${filtered.length === 1 ? "" : "es"}` : ""} of{" "}
        {rows.length.toLocaleString("en-CA")} loaded
        {truncated && (
          <>
            {" "}
            — first {limit.toLocaleString("en-CA")} of {activeCount.toLocaleString("en-CA")}
            {activeKind ? ` ${KIND_LABEL[activeKind] ?? activeKind}` : ""} products (narrow with a filter or search)
          </>
        )}
        .
      </p>

      {/* LIST */}
      {rows.length === 0 ? (
        <div className="mt-8 rounded-sm border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          No BC Liquor data available right now.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-sm border border-line">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left font-display text-xs uppercase tracking-[0.15em] text-muted">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">ABV</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3">Origin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={`${r.barcode ?? "nobc"}-${i}`} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-foreground">{r.product_name ?? "—"}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      {r.barcode ? (
                        <span className="font-mono text-[11px] text-muted/70">{r.barcode}</span>
                      ) : (
                        <span className="rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted/70">
                          No UPC · not scannable
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="rounded-sm border border-sky-500/20 bg-sky-500/[0.06] px-1.5 py-0.5 text-[11px] text-sky-300">
                      {KIND_LABEL[r.kind ?? ""] ?? r.kind ?? "—"}
                    </span>
                    {r.category && r.category !== r.kind && (
                      <span className="ml-2 text-xs text-muted/70">{r.category}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted">{fmtAbv(r.abv)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted">{fmtLitres(r.litres_per_container)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{fmtPrice(r.price)}</td>
                  <td className="px-4 py-3 text-muted">{r.country_origin ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-muted/70">
        Source: BC Liquor Distribution Branch (BCLDB) product price list, via the BC Open Government portal.
        Catalogue data for browsing only — not a purchase or availability guarantee.
      </p>
    </div>
  );
}

function FilterTab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`rounded-sm border px-3.5 py-2 font-display text-sm tracking-[0.1em] transition-colors ${
        active
          ? "border-sky-400 bg-sky-400/10 text-sky-300"
          : "border-line text-muted hover:border-sky-400/40 hover:text-foreground"
      }`}
    >
      {label}
      <span className="ml-2 text-xs text-muted/60">{count.toLocaleString("en-CA")}</span>
    </Link>
  );
}
