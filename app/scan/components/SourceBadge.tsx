"use client";

export type DataSource =
  | "gorilla-curated"
  | "community"
  | "open-food-facts"
  | "upcitemdb"
  | "usda"
  | "fatsecret"
  | "nih-dsld"
  | "barcode-lookup"
  | "winevybe"
  | "wine-analyzer"
  | "cola-verified"
  | "nutritionix"
  | "open-beauty-facts"
  | "go-upc"
  | "open-drug-facts";

type BadgeConfig = {
  label: string;
  cls: string;
};

const CONFIGS: Record<DataSource, BadgeConfig> = {
  "gorilla-curated":   { label: "GORILLA CURATED",   cls: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300" },
  "community":         { label: "COMMUNITY",          cls: "border-sky-400/50 bg-sky-400/10 text-sky-300" },
  "open-food-facts":   { label: "OPEN FOOD FACTS",   cls: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" },
  "upcitemdb":         { label: "UPC DATABASE",       cls: "border-slate-400/50 bg-slate-400/10 text-slate-300" },
  "usda":              { label: "USDA",               cls: "border-blue-500/50 bg-blue-500/10 text-blue-300" },
  "fatsecret":         { label: "FATSECRET",          cls: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
  "nih-dsld":          { label: "NIH VERIFIED",       cls: "border-blue-400/50 bg-blue-400/10 text-blue-200" },
  "barcode-lookup":    { label: "BARCODE DB",         cls: "border-zinc-400/50 bg-zinc-400/10 text-zinc-300" },
  "winevybe":          { label: "WINEVYBE",           cls: "border-amber-400/50 bg-amber-400/10 text-amber-300" },
  "wine-analyzer":     { label: "WINE ANALYZER",      cls: "border-rose-400/50 bg-rose-400/10 text-rose-300" },
  "cola-verified":     { label: "COLA VERIFIED",      cls: "border-indigo-500/50 bg-indigo-500/10 text-indigo-300" },
  "nutritionix":       { label: "NUTRITIONIX",        cls: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
  "open-beauty-facts": { label: "OPEN BEAUTY FACTS", cls: "border-pink-500/50 bg-pink-500/10 text-pink-300" },
  "go-upc":            { label: "GO-UPC",             cls: "border-slate-500/50 bg-slate-500/10 text-slate-300" },
  "open-drug-facts":   { label: "OPEN DRUG FACTS",   cls: "border-sky-500/50 bg-sky-500/10 text-sky-300" },
};

type Props = {
  source: DataSource;
  className?: string;
};

export default function SourceBadge({ source, className = "" }: Props) {
  const { label, cls } = CONFIGS[source];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] ${cls} ${className}`}
    >
      {source === "cola-verified" && (
        <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )}
      {source === "gorilla-curated" && (
        <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {source === "nih-dsld" && (
        <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )}
      {label}
    </span>
  );
}
