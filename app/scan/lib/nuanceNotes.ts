import type { AdditiveInfo, RiskLevel, ScoreResult } from "./scoring";

/**
 * NUANCE NOTES — display-only honest caveats for the small subset of products
 * where the bare score is misleading. This module changes NO score; it only
 * reads values computeScore() already returns and turns them into one-line
 * plain-English notes. Most products produce zero notes — that's intentional,
 * so a note stays meaningful by being rare.
 */
export type NuanceNote = {
  id: "contested-additive" | "incomplete-data" | "caffeine-pending";
  text: string;
};

// RULE 1 only cares about additives whose SCIENCE is unsettled — not
// strong-consensus (settled) and not precautionary (we-flag-it-but-it's-mild).
const UNSETTLED_TIERS = new Set(["contested", "emerging-evidence"]);

// Mirror of additivePenalty() in scoring.ts. Used ONLY to describe the swing in
// words — never to compute or change a score. NOTE: every contested/emerging
// additive in the dictionary is a real deduction (none are flag-only `penalty:0`
// — all flag-only entries are low-risk and strong-consensus/precautionary), so
// filtering by tier already excludes the flag-only items and this map gives the
// exact points each unsettled additive shaved off the additive sub-score.
function riskDeduction(risk: RiskLevel): number {
  if (risk === "high") return 15;
  if (risk === "medium") return 8;
  return 4; // low
}

// Additives are weighted 30% of the final score (60% nutrition / 30% additives
// / 10% organic). The points an additive deduction costs the FINAL score is the
// deduction × this weight.
const ADDITIVE_WEIGHT = 0.3;

// Meaningfulness guard: "held down MAINLY by a contested additive" only makes
// sense in the borderline middle. Below 40 the product has bigger problems than
// additives (it's earned its low score); at/above 75 it's already Excellent and
// not "held down" by anything. Keeping RULE 1 to this band keeps it rare.
const RULE1_MIN = 40;
const RULE1_MAX = 74;

function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function unsettledAdditives(detected: AdditiveInfo[]): AdditiveInfo[] {
  return detected.filter((a) => UNSETTLED_TIERS.has(a.tier));
}

export type NuanceInput = Pick<
  ScoreResult,
  "finalScore" | "detectedAdditives" | "flags" | "scoreSource"
>;

export type NuanceOptions = {
  /**
   * Whether the sub-scores are the RAW algorithm values (so a numeric swing is
   * truthful). The scan flow passes `result.scoreSource === "algorithm"`; the
   * energy/beverage cards run computeScore directly (never gated) and pass true.
   * When false, RULE 1 still fires but WITHOUT a fabricated "would be X" number.
   */
  allowNumericSwing?: boolean;
  /**
   * A caffeineNote string when the product has a note INSTEAD of a verified
   * numeric caffeine value (the Celsius-style "exact figure pending" case).
   * Pass undefined for numeric-caffeine and caffeine-free products so RULE 3
   * stays narrow. Energy cards pass `caffeineMg === undefined ? caffeineNote : undefined`.
   */
  caffeineNote?: string | null;
};

export function buildNuanceNotes(result: NuanceInput, opts: NuanceOptions = {}): NuanceNote[] {
  const notes: NuanceNote[] = [];

  // ── RULE 1 — score held down mainly by a contested/emerging additive ──────
  const unsettled = unsettledAdditives(result.detectedAdditives);
  if (
    unsettled.length > 0 &&
    result.finalScore >= RULE1_MIN &&
    result.finalScore <= RULE1_MAX
  ) {
    const names = formatList(unsettled.map((a) => a.name));
    const them = unsettled.length === 1 ? "it" : "them";
    const allowSwing = opts.allowNumericSwing ?? result.scoreSource === "algorithm";

    if (allowSwing) {
      const deduction = unsettled.reduce((sum, a) => sum + riskDeduction(a.risk), 0);
      const swing = Math.round(deduction * ADDITIVE_WEIGHT);
      const wouldBe = Math.min(100, result.finalScore + swing);
      if (swing > 0 && wouldBe > result.finalScore) {
        notes.push({
          id: "contested-additive",
          text: `Without ${names} this would score around ${wouldBe}. It's ${result.finalScore} because of ${them === "it" ? "that additive" : "those additives"}, which we flag on contested or emerging evidence — not settled science. We deliberately don't penalize ${them} as if proven harmful.`,
        });
      } else {
        notes.push(qualitativeNote(names, them));
      }
    } else {
      // Gated/curated product: sub-scores are rescaled, so DON'T quote a number.
      notes.push(qualitativeNote(names, them));
    }
  }

  // ── RULE 2 — incomplete data, scored conservatively ───────────────────────
  // Condensed version of the existing FLAGS string (the caller removes the raw
  // flag from the FLAGS list so it shows once, here).
  if (result.flags.some((f) => f.includes("Incomplete nutrition data —"))) {
    notes.push({
      id: "incomplete-data",
      text: "Some nutrition data wasn't disclosed, so this was scored conservatively — an incomplete label lowers the score rather than getting the benefit of the doubt.",
    });
  }

  // ── RULE 3 — caffeine not yet counted (narrow: caffeineNote, no number) ────
  if (opts.caffeineNote) {
    notes.push({
      id: "caffeine-pending",
      text: "Caffeine isn't reflected in this score yet — exact amount pending verification, so a high-caffeine product could score lower once confirmed.",
    });
  }

  return notes;
}

function qualitativeNote(names: string, them: string): NuanceNote {
  return {
    id: "contested-additive",
    text: `Part of this score reflects ${names}, which we flag on contested or emerging evidence — not settled science. We deliberately don't penalize ${them} as if proven harmful.`,
  };
}

/** The exact flag string RULE 2 condenses — callers filter it from the raw
 *  FLAGS list to avoid showing the same caveat twice. */
export const INCOMPLETE_DATA_FLAG_PREFIX = "Incomplete nutrition data —";
