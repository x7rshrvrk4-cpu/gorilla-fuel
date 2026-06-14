import type { KidsSnackProduct, MacroField, SnackTier } from "../lib/products";

const TIER_BADGE: Record<SnackTier, { text: string; cls: string }> = {
  A: { text: "A · Cleaner", cls: "border-emerald-500/60 bg-emerald-500/10 text-emerald-300" },
  B: { text: "B · Cheat Zone", cls: "border-amber-400/60 bg-amber-400/10 text-amber-300" },
  C: { text: "C · Skip", cls: "border-red-500/60 bg-red-500/10 text-red-300" },
};

const BORDER: Record<SnackTier, string> = {
  A: "border-emerald-500/20 hover:border-emerald-500/40",
  B: "border-amber-400/25 hover:border-amber-400/45",
  C: "border-red-500/20 hover:border-red-500/40",
};

function Macro({ label, field, unit }: { label: string; field?: MacroField; unit: string }) {
  // Only render verified numbers — never a fabricated value or blank-as-zero.
  if (!field || !field.verified) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-0.5 font-display text-lg text-white">
        {field.value}
        {unit}
      </p>
    </div>
  );
}

function DyeBadge({ product }: { product: KidsSnackProduct }) {
  if (product.dyeStatus === "no-synthetic-dyes") {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-display uppercase tracking-[0.14em] text-emerald-300">
        ✓ No synthetic dyes
      </span>
    );
  }
  if (product.dyeStatus === "natural-colour") {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm border border-teal-400/50 bg-teal-400/10 px-2 py-0.5 text-[10px] font-display uppercase tracking-[0.14em] text-teal-300">
        ✓ Natural colour only
      </span>
    );
  }
  // unconfirmed — never imply US dyes
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-slate-500/50 bg-slate-600/15 px-2 py-0.5 text-[10px] font-display uppercase tracking-[0.14em] text-slate-300">
      ⓘ CA dye status unconfirmed
    </span>
  );
}

export default function KidsSnackCard({ product }: { product: KidsSnackProduct }) {
  const badge = TIER_BADGE[product.tier];
  const m = product.macros;
  const hasAnyMacro = !!(m && (m.calories || m.sugar || m.sodium || m.fibre || m.protein));

  return (
    <div
      id={`product-${product.id}`}
      className={`rounded-sm border bg-slate-900/60 p-5 transition-colors ${BORDER[product.tier]}`}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{product.brand}</p>
          <h3 className="font-display text-2xl leading-tight text-white">{product.name}</h3>
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-sm border px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.16em] ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      {/* WHY */}
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{product.why}</p>

      {/* MARKETING vs REALITY — the signature Cheat Zone callout */}
      {product.marketingClaim && product.reality && (
        <div className="mt-4 overflow-hidden rounded-sm border border-amber-400/30">
          <div className="flex items-start gap-2 bg-amber-400/8 px-3 py-2">
            <span className="shrink-0 font-display text-[10px] uppercase tracking-[0.16em] text-amber-300/90">Front says</span>
            <span className="text-sm text-amber-100/90">“{product.marketingClaim}”</span>
          </div>
          <div className="flex items-start gap-2 border-t border-amber-400/20 bg-slate-900/60 px-3 py-2">
            <span className="shrink-0 font-display text-[10px] uppercase tracking-[0.16em] text-red-300/90">Reality</span>
            <span className="text-sm text-slate-200">{product.reality}</span>
          </div>
        </div>
      )}

      {/* MACROS — verified fields only */}
      {hasAnyMacro && (
        <div className="mt-4">
          {m?.servingLabel && (
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">{m.servingLabel}</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Macro label="Calories" field={m?.calories} unit="" />
            <Macro label="Sugar" field={m?.sugar} unit="g" />
            <Macro label="Sodium" field={m?.sodium} unit="mg" />
            <Macro label="Fibre" field={m?.fibre} unit="g" />
            <Macro label="Protein" field={m?.protein} unit="g" />
          </div>
        </div>
      )}

      {/* PENDING-MACRO NOTE — never fabricate or blank-as-zero */}
      {product.macrosPending && (
        <p className="mt-3 text-[11px] italic leading-relaxed text-slate-500">
          {hasAnyMacro
            ? "Remaining macros pending Canadian-label verification."
            : "Macros pending Canadian-label verification — not shown rather than guessed."}
        </p>
      )}

      {/* DYE / ADDITIVE STATUS */}
      <div className="mt-4 border-t border-slate-800 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <DyeBadge product={product} />
          {product.ingredientsVerified ? (
            <span className="inline-flex items-center gap-1 rounded-sm border border-slate-600/50 bg-slate-700/20 px-2 py-0.5 text-[10px] font-display uppercase tracking-[0.14em] text-slate-400">
              🍁 Ingredients verified (CA)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-sm border border-slate-600/50 bg-slate-700/20 px-2 py-0.5 text-[10px] font-display uppercase tracking-[0.14em] text-slate-400">
              Ingredients pending
            </span>
          )}
        </div>
        {product.dyeNote && <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{product.dyeNote}</p>}
      </div>

      {/* CAVEAT */}
      {product.caveat && (
        <p className="mt-3 rounded-sm border border-slate-700/50 bg-slate-800/30 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
          <span className="font-display uppercase tracking-[0.14em] text-slate-400">Note — </span>
          {product.caveat}
        </p>
      )}
    </div>
  );
}
