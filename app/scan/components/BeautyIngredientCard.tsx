import EvidenceTierBadge from "../../components/EvidenceTierBadge";
import type { BeautyIngredientInfo } from "../lib/beautyScoring";

const RISK_LABEL: Record<string, string> = {
  high: "High Concern",
  medium: "Medium Concern",
  low: "Low Concern",
};

const RISK_COLOR: Record<string, string> = {
  high: "border-red-500/50 text-red-400 bg-red-500/10",
  medium: "border-amber-400/50 text-amber-300 bg-amber-400/10",
  low: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
};

export default function BeautyIngredientCard({ ingredient }: { ingredient: BeautyIngredientInfo }) {
  return (
    <div className={`rounded-sm border p-3 text-sm ${RISK_COLOR[ingredient.risk]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-lg tracking-wide">{ingredient.name}</span>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <span className="rounded-sm border border-current px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
            {RISK_LABEL[ingredient.risk]}
          </span>
          <EvidenceTierBadge tier={ingredient.tier} />
        </div>
      </div>

      <span className="mt-1.5 inline-block rounded-sm border border-purple-400/40 bg-purple-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-purple-300">
        {ingredient.concern}
      </span>

      <p className="mt-1.5 text-xs text-foreground/70">{ingredient.note}</p>

      <div className="mt-2 space-y-1.5 border-t border-current/20 pt-2 text-xs text-foreground/70">
        <p>
          <span className="font-display tracking-wide text-foreground/90">Health bodies: </span>
          {ingredient.healthBodyPosition}
        </p>
        <p>
          <span className="font-display tracking-wide text-foreground/90">Gorilla position: </span>
          {ingredient.gorillaPosition}
        </p>
      </div>

      <p className="mt-2 border-t border-current/20 pt-2 text-[11px] leading-relaxed text-foreground/50">
        Sources: {ingredient.sources.join(" · ")}
      </p>
    </div>
  );
}
