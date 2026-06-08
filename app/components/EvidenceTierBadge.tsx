import type { EvidenceTier } from "../scan/lib/scoring";

const TIER_LABEL: Record<EvidenceTier, string> = {
  "strong-consensus": "Strong Consensus",
  "emerging-evidence": "Emerging Evidence",
  contested: "Contested",
  precautionary: "Precautionary",
};

const TIER_COLOR: Record<EvidenceTier, string> = {
  "strong-consensus": "border-emerald-400/50 text-emerald-300 bg-emerald-400/10",
  "emerging-evidence": "border-yellow-400/50 text-yellow-300 bg-yellow-400/10",
  contested: "border-orange-400/50 text-orange-300 bg-orange-400/10",
  precautionary: "border-zinc-400/50 text-zinc-300 bg-zinc-400/10",
};

const TIER_DESCRIPTION: Record<EvidenceTier, string> = {
  "strong-consensus": "Multiple large peer-reviewed studies agree and major health bodies are aligned.",
  "emerging-evidence": "Recent studies suggest a concern, but research is still early or limited.",
  contested: "Genuine scientific debate — studies conflict, or major bodies have recently updated their position.",
  precautionary: "Limited direct research but a plausible mechanism of concern, often a newer synthetic ingredient.",
};

export function tierLabel(tier: EvidenceTier): string {
  return TIER_LABEL[tier];
}

export function tierDescription(tier: EvidenceTier): string {
  return TIER_DESCRIPTION[tier];
}

type Props = {
  tier: EvidenceTier;
  className?: string;
};

export default function EvidenceTierBadge({ tier, className = "" }: Props) {
  return (
    <span
      title={TIER_DESCRIPTION[tier]}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-display uppercase tracking-[0.18em] ${TIER_COLOR[tier]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {TIER_LABEL[tier]}
    </span>
  );
}
