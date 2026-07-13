import type { AdditiveInfo, EvidenceTier, Grade } from "./scoring";
import { tierLabel } from "../../components/EvidenceTierBadge";

export type TierBreakdown = { tier: EvidenceTier; count: number };

export type GorillaTake = {
  tierBreakdown: TierBreakdown[];
  scienceSummary: string;
  positionStatement: string;
};

const SEVERE_NUTRITION_RE = /extreme sodium|very high sodium|extreme sugar|very high sugar|extreme saturated fat|very high saturated fat|High saturated fat — \d+\.\d+g per 100g|Very high salt|Extreme saturated fat concentration/i;

const TIER_ORDER: EvidenceTier[] = ["strong-consensus", "emerging-evidence", "contested", "precautionary"];

function tierBreakdown(detected: AdditiveInfo[]): TierBreakdown[] {
  const counts = new Map<EvidenceTier, number>();
  for (const a of detected) counts.set(a.tier, (counts.get(a.tier) ?? 0) + 1);
  return TIER_ORDER.filter((t) => counts.has(t)).map((tier) => ({ tier, count: counts.get(tier)! }));
}

/**
 * Builds a plain-English science summary and a Gorilla position statement from
 * what was actually detected — algorithmic, not hand-written per product, so it
 * stays honest about exactly what's on the label rather than guessing at intent.
 */
export function buildGorillaTake(detected: AdditiveInfo[], grade: Grade, nutritionFlags: string[] = []): GorillaTake {
  const breakdown = tierBreakdown(detected);
  const hasSevereNutrition = nutritionFlags.some((f) => SEVERE_NUTRITION_RE.test(f));

  if (detected.length === 0) {
    if (hasSevereNutrition) {
      return {
        tierBreakdown: breakdown,
        scienceSummary:
          "The ingredient scan returned no flagged additives — but the red flags above tell the real story. For this product, the macros are the issue, not the additive chemistry.",
        positionStatement:
          "An informed athlete should not be misled by a clean additive profile. Extreme saturated fat, very high sodium, or very high sugar represent genuine daily nutrition concerns that no amount of additive-cleanliness offsets. Look at the flags section above — that's where the actual risk sits.",
      };
    }
    // No ingredient list on file → the additive scan never ran. Absence of data is
    // NOT evidence of safety, so don't claim a "clean scan" — say it's unverified.
    if (nutritionFlags.some((f) => /ingredient list unavailable|could not be verified/i.test(f))) {
      return {
        tierBreakdown: breakdown,
        scienceSummary:
          "No ingredient list is on file for this product, so the additive scan couldn't run — this isn't a clean result, it's an unknown one. We can't tell you what isn't here.",
        positionStatement:
          "Treat the additive side as unverified, not safe. Judge it on the nutrition numbers above, and seek the full label before trusting the ingredient side.",
      };
    }
    return {
      tierBreakdown: breakdown,
      scienceSummary:
        "The ingredient scan came back clean — nothing on our watch list showed up in the listed ingredients, so there's no evidence debate to walk you through here.",
      positionStatement:
        "An informed athlete can treat the additive side of this product as a non-issue. Judge it on its actual nutrition numbers above, not on label fear.",
    };
  }

    const high = detected.filter((a) => a.risk === "high");
    const strong = detected.filter((a) => a.tier === "strong-consensus");
    const unsettled = detected.filter((a) => a.tier === "contested" || a.tier === "emerging-evidence" || a.tier === "precautionary");

  const tierPhrase = breakdown
    .map((b) => `${b.count} ${tierLabel(b.tier)}`)
    .join(" · ");

  let scienceSummary: string;
  if (strong.length > 0 && high.some((a) => a.tier === "strong-consensus")) {
    scienceSummary = `This scan turned up ${detected.length} flagged ingredient${detected.length === 1 ? "" : "s"} (${tierPhrase}). At least one — ${high.find((a) => a.tier === "strong-consensus")?.name} — sits in STRONG CONSENSUS territory, meaning the regulatory and research community isn't really divided on it: the concern is real and well-documented, not speculative.`;
  } else if (strong.length > 0) {
    scienceSummary = `This scan turned up ${detected.length} flagged ingredient${detected.length === 1 ? "" : "s"} (${tierPhrase}). The STRONG CONSENSUS items here have settled science behind them — there's little genuine debate about what they do, even if the practical risk at the amounts present is modest.`;
  } else if (unsettled.length === detected.length) {
    scienceSummary = `Every flagged ingredient here — ${tierPhrase} — sits somewhere short of settled science. That doesn't mean "harmless"; it means the honest answer is "the experts are still working this out," and we'd rather tell you that than manufacture false certainty in either direction.`;
  } else {
    scienceSummary = `This scan turned up ${detected.length} flagged ingredient${detected.length === 1 ? "" : "s"} spanning a mix of evidence tiers (${tierPhrase}) — some are well-documented concerns, others are live debates or early-stage research. Each card above breaks down exactly where the science stands on that specific ingredient.`;
  }

  let positionStatement: string;
  if (grade === "Poor" || grade === "Moderate") {
    positionStatement =
      high.length > 0
        ? `An informed athlete should read this as a "skip it or save it for rare occasions" product — the additive profile alone (${high.map((a) => a.name).join(", ")}) is enough reason to look for an alternative, and the overall grade backs that up.`
        : `An informed athlete should treat this as a clear "there are better options" product. Nothing here is necessarily an emergency, but between the additive load and the overall grade, your money and your macros are better spent elsewhere.`;
  } else if (grade === "Good") {
    positionStatement =
      unsettled.length > 0
        ? `An informed athlete can keep this in regular rotation without losing sleep — but it's worth knowing that ${unsettled.length === 1 ? "one ingredient sits" : `${unsettled.length} ingredients sit`} in genuinely unsettled scientific territory. That's a "stay aware" flag, not a "stay away" one.`
        : `An informed athlete can treat this as a reasonable, defensible choice. The additive profile isn't pristine, but nothing here rises to the level of a real red flag.`;
  } else {
    positionStatement =
      detected.length > 0
        ? `An informed athlete should feel good about this one — even with ${detected.length} ingredient${detected.length === 1 ? "" : "s"} on the watch list, none of it meaningfully drags down what is otherwise a strong, defensible product.`
        : `An informed athlete should feel confident reaching for this — strong nutrition numbers and a clean additive profile is exactly what "Excellent" is supposed to mean.`;
  }

  return { tierBreakdown: breakdown, scienceSummary, positionStatement };
}
