"use client";

import { useState, useMemo } from "react";
import { ALCOHOL_PRODUCTS } from "../../alcohol/lib/products";

const PACK_SIZES = [
  "6 PACK",
  "12 PACK",
  "15 PACK",
  "18 PACK",
  "24 PACK",
  "28 PACK",
  "30 PACK",
  "TALL CAN SINGLE",
  "VARIETY PACK",
];

type AlcoholProduct = (typeof ALCOHOL_PRODUCTS)[0];

type Props = {
  barcode: string;
};

export default function MultiPackPrompt({ barcode }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AlcoholProduct | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [packSize, setPackSize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"ok" | "duplicate" | "error" | null>(null);

  const matches = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return ALCOHOL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  async function handleSubmit() {
    if (!selected || !packSize) return;
    setSubmitting(true);

    const adminKey =
      typeof window !== "undefined"
        ? (localStorage.getItem("gorilla-admin-key") ?? undefined)
        : undefined;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (adminKey) headers["x-admin-key"] = adminKey;

    try {
      const res = await fetch("/api/aliases/submit", {
        method: "POST",
        headers,
        body: JSON.stringify({
          alias_barcode: barcode,
          parent_product_name: selected.name,
          parent_barcode: selected.barcodes?.[0] ?? null,
          pack_size: packSize,
        }),
      });
      if (res.ok) setResult("ok");
      else if (res.status === 409) setResult("duplicate");
      else setResult("error");
    } catch {
      setResult("error");
    }
    setSubmitting(false);
  }

  if (result === "ok" || result === "duplicate") {
    return (
      <div className="mt-4 rounded-sm border border-emerald-600/40 bg-emerald-900/20 px-5 py-4">
        <p className="font-display text-base tracking-widest text-emerald-400">
          Added to the Gorilla database.
        </p>
        <p className="mt-1 text-sm text-muted">Next scan will work for everyone.</p>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mt-4 flex w-full items-center gap-3 rounded-sm border border-gold/30 bg-gold/5 px-4 py-3 text-left transition-colors hover:bg-gold/10"
      >
        <span className="text-xl leading-none">📦</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm tracking-widest text-gold">
            Is this a case or multi-pack?
          </p>
          <p className="text-xs text-muted">
            Tell us what product it is — we will add it for everyone.
          </p>
        </div>
        <span className="shrink-0 text-gold/50">→</span>
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-sm border border-line bg-surface p-5">
      <p className="font-display text-sm tracking-[0.25em] text-gold">IDENTIFY THIS MULTI-PACK</p>
      <p className="mt-1 font-mono text-xs text-muted/60">{barcode}</p>

      {/* Product search */}
      <div className="relative mt-4">
        <label
          htmlFor="mp-search"
          className="block text-[10px] uppercase tracking-[0.2em] text-muted"
        >
          Product name
        </label>
        <input
          id="mp-search"
          type="text"
          autoComplete="off"
          value={selected ? selected.name : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Michelob Ultra, Bud Light, Coors Light…"
          className="mt-1 w-full rounded-sm border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-gold focus:outline-none"
        />
        {showDropdown && matches.length > 0 && !selected && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-sm border border-line bg-background shadow-xl">
            {matches.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => {
                  setSelected(p);
                  setShowDropdown(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-surface"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{p.name}</p>
                  <p className="text-xs text-muted">{p.brand} · {p.category}</p>
                </div>
                <span className="ml-3 shrink-0 text-xs text-gold/60">{p.gorillaPour}★</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pack size picker */}
      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Pack size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PACK_SIZES.map((ps) => (
            <button
              key={ps}
              type="button"
              onClick={() => setPackSize(ps)}
              className={`rounded-sm border px-3 py-1.5 font-display text-xs tracking-widest transition-colors ${
                packSize === ps
                  ? "border-gold bg-gold text-background"
                  : "border-line text-muted hover:border-gold/60 hover:text-gold"
              }`}
            >
              {ps}
            </button>
          ))}
        </div>
      </div>

      {result === "error" && (
        <p className="mt-3 text-xs text-red-400">Something went wrong — please try again.</p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selected || !packSize || submitting}
          className="rounded-sm bg-gold px-5 py-2.5 font-display text-sm tracking-widest text-background transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Saving…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-sm border border-line px-4 py-2.5 font-display text-sm tracking-widest text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
