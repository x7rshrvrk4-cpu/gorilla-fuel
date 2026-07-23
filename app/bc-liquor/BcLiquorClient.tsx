"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackToTop from "../components/BackToTop";
import {
  BC_KINDS,
  WINE_STYLES,
  SWEETNESS_BUCKETS,
  BEER_TIERS,
  type BcCounts,
  type BcFilters,
  type BcLiquorRow,
} from "../lib/bcLiquor";

type Props = {
  counts: BcCounts;
  countries: { country: string; count: number }[];
  rows: BcLiquorRow[];
  filters: BcFilters;
  filteredTotal: number;
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

// numeric sweetness_code -> bucket label (same buckets used for filtering)
function sweetnessLabel(code: string | null): string | null {
  if (code == null || code === "") return null;
  const b = SWEETNESS_BUCKETS.find((x) => (x.codes as readonly string[]).includes(code));
  return b ? b.label : null;
}

/** Merge a patch into the active filters and produce a /bc-liquor href. */
function hrefWith(base: BcFilters, patch: Partial<BcFilters>): string {
  const f = { ...base, ...patch };
  const p = new URLSearchParams();
  if (f.kind) p.set("kind", f.kind);
  if (f.bcWine) p.set("bc", "1");
  if (f.style) p.set("style", f.style);
  if (f.sweet) p.set("sweet", f.sweet);
  if (f.tier) p.set("tier", f.tier);
  if (f.country) p.set("country", f.country);
  const qs = p.toString();
  return qs ? `/bc-liquor?${qs}` : "/bc-liquor";
}

export default function BcLiquorClient({ counts, countries, rows, filters, filteredTotal, limit }: Props) {
  const router = useRouter();
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

  const truncated = filteredTotal > rows.length;
  const isWine = filters.kind === "wine";
  const isBeer = filters.kind === "beer";
  const anyFacet = filters.bcWine || filters.style || filters.sweet || filters.tier || filters.country;

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

      {/* HONESTY BANNER */}
      <div className="mt-5 rounded-sm border border-sky-500/30 bg-sky-500/[0.06] px-4 py-3 text-sm leading-relaxed text-sky-100/80">
        <span className="font-display tracking-wide text-sky-300">British Columbia availability.</span>{" "}
        This is BCLDB catalogue data — separate from our{" "}
        <Link href="/alcohol" className="text-sky-300 underline hover:text-foreground">
          Ontario (LCBO &amp; Beer Store) rankings
        </Link>
        . These products may not be sold outside BC. It&apos;s a raw catalogue view: prices and ABV are listed,
        but these items aren&apos;t Gorilla-scored yet, and the{" "}
        {counts.total > 0 ? (counts.total - counts.withBarcode).toLocaleString("en-CA") : "some"} products without a
        UPC on file are browsable here but not barcode-scannable. All filters below come straight from BCLDB&apos;s
        own fields — no editorial curation.
      </div>

      {/* KIND FILTER TABS (switching kind clears the wine/beer facets, keeps country) */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FilterTab
          href={hrefWith(filters, { kind: null, bcWine: false, style: null, sweet: null, tier: null })}
          label="All"
          count={counts.total}
          active={filters.kind === null}
        />
        {BC_KINDS.map((k) => (
          <FilterTab
            key={k}
            href={hrefWith(filters, { kind: k, bcWine: false, style: null, sweet: null, tier: null })}
            label={KIND_LABEL[k] ?? k}
            count={counts.byKind[k] ?? 0}
            active={filters.kind === k}
          />
        ))}
      </div>

      {/* WINE FACETS — Made-in-BC, style, sweetness (structured from subcategory/class/sweetness_code) */}
      {isWine && (
        <div className="mt-4 space-y-3 rounded-sm border border-line bg-surface/50 p-4">
          <FacetRow label="Origin">
            <Pill
              href={hrefWith(filters, { kind: "wine", bcWine: !filters.bcWine })}
              label="🍁 Made in BC"
              count={counts.bcWine}
              active={filters.bcWine}
            />
          </FacetRow>
          <FacetRow label="Style">
            {WINE_STYLES.map((s) => (
              <Pill
                key={s.key}
                href={hrefWith(filters, { kind: "wine", style: filters.style === s.key ? null : s.key })}
                label={s.label}
                active={filters.style === s.key}
              />
            ))}
          </FacetRow>
          <FacetRow label="Sweetness">
            {SWEETNESS_BUCKETS.map((b) => (
              <Pill
                key={b.key}
                href={hrefWith(filters, { kind: "wine", sweet: filters.sweet === b.key ? null : b.key })}
                label={b.label}
                active={filters.sweet === b.key}
              />
            ))}
          </FacetRow>
        </div>
      )}

      {/* BEER FACET — BC craft tier (macro→micro, from class). Selecting a tier implies BC-made beer. */}
      {isBeer && (
        <div className="mt-4 rounded-sm border border-line bg-surface/50 p-4">
          <FacetRow label="BC craft tier">
            {BEER_TIERS.map((t) => (
              <Pill
                key={t.key}
                href={hrefWith(filters, { kind: "beer", tier: filters.tier === t.key ? null : t.key })}
                label={t.label}
                count={counts.beerTiers[t.key]}
                active={filters.tier === t.key}
              />
            ))}
          </FacetRow>
          <p className="mt-2 text-xs text-muted/70">BC-made beer only — tiers are BCLDB&apos;s own class labels.</p>
        </div>
      )}

      {/* COUNTRY + SEARCH */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={filters.country ?? ""}
          onChange={(e) => router.push(hrefWith(filters, { country: e.target.value || null }))}
          className="rounded-sm border border-line bg-surface px-3 py-2.5 text-sm text-foreground focus:border-sky-400/50 focus:outline-none sm:w-64"
        >
          <option value="">All countries of origin</option>
          {countries.map((c) => (
            <option key={c.country} value={c.country}>
              {c.country} ({c.count.toLocaleString("en-CA")})
            </option>
          ))}
        </select>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this list by name, category, origin or UPC…"
          className="flex-1 rounded-sm border border-line bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-sky-400/50 focus:outline-none"
        />
      </div>

      {/* COUNT LINE + CLEAR */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span>
          Showing {filtered.length.toLocaleString("en-CA")}
          {query ? ` match${filtered.length === 1 ? "" : "es"}` : ""} of {rows.length.toLocaleString("en-CA")} loaded
          {truncated && (
            <>
              {" "}
              — first {limit.toLocaleString("en-CA")} of {filteredTotal.toLocaleString("en-CA")} matching (narrow with
              a filter or search)
            </>
          )}
          {!truncated && filteredTotal !== rows.length && <> — {filteredTotal.toLocaleString("en-CA")} matching</>}.
        </span>
        {anyFacet && (
          <Link href="/bc-liquor" className="text-sky-300 underline hover:text-foreground">
            Clear filters
          </Link>
        )}
      </div>

      {/* LIST */}
      {rows.length === 0 ? (
        <div className="mt-8 rounded-sm border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          No products match these filters.
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
              {filtered.map((r, i) => {
                const sweet = r.kind === "wine" ? sweetnessLabel(r.sweetness_code) : null;
                return (
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
                      {sweet && <span className="ml-2 text-[11px] text-rose-300/80">{sweet}</span>}
                      {r.category && r.category !== r.kind && (
                        <span className="ml-2 text-xs text-muted/70">{r.category}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{fmtAbv(r.abv)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{fmtLitres(r.litres_per_container)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{fmtPrice(r.price)}</td>
                    <td className="px-4 py-3 text-muted">{r.country_origin ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-muted/70">
        Source: BC Liquor Distribution Branch (BCLDB) product price list, via the BC Open Government portal.
        Filters (BC-made, wine style, craft-beer tier, sweetness, country) are derived from BCLDB&apos;s own
        structured fields. Sweetness bands approximate the BCLDB 0–10 sweetness scale. Catalogue data for browsing
        only — not a purchase or availability guarantee.
      </p>

      <BackToTop />
    </div>
  );
}

function FilterTab({ href, label, count, active }: { href: string; label: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`rounded-sm border px-3.5 py-2 font-display text-sm tracking-[0.1em] transition-colors ${
        active ? "border-sky-400 bg-sky-400/10 text-sky-300" : "border-line text-muted hover:border-sky-400/40 hover:text-foreground"
      }`}
    >
      {label}
      <span className="ml-2 text-xs text-muted/60">{count.toLocaleString("en-CA")}</span>
    </Link>
  );
}

function FacetRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-24 shrink-0 font-display text-[11px] uppercase tracking-[0.15em] text-muted/70">{label}</span>
      {children}
    </div>
  );
}

function Pill({ href, label, count, active }: { href: string; label: string; count?: number; active: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active ? "border-sky-400 bg-sky-400/15 text-sky-200" : "border-line text-muted hover:border-sky-400/40 hover:text-foreground"
      }`}
    >
      {label}
      {count != null && <span className="ml-1.5 text-[10px] text-muted/60">{count.toLocaleString("en-CA")}</span>}
    </Link>
  );
}
