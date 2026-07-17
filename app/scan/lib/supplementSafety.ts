/**
 * Supplement safety flags — display-only transparency notices for scanned
 * supplements. Computed LIVE from label ingredient text (NIH DSLD or any source);
 * NOT a score, NOT persisted, NOT connected to computeScore / gorilla_score. We
 * deliberately do not claim a quality score for supplements — no dosage/potency
 * data exists in our sources — but we can surface two safety-relevant facts:
 *
 *   • Proprietary blend — the label discloses a blend total but not the individual
 *     ingredient dosages, so you can't tell how much of each active you're getting.
 *   • Stimulant/caffeine-class ingredient present — worth knowing, and its dose
 *     isn't verifiable from our data.
 *
 * Pure function of the input text — trivially testable, no side effects.
 */

// "proprietary blend", "prop blend", or a "blend (…)" whose sub-ingredients are
// listed without individual amounts — the undisclosed-dosage signal. Matches the
// diagnosis pattern, generalized with the bare word "proprietary".
const PROPRIETARY_BLEND_RE = /\bproprietary\b|\bprop\.?\s*blend\b|\bblend\s*\(/i;

// Recognized stimulant / caffeine-class sources.
const STIMULANT_RE =
  /\bcaffeine\b|\bguarana\b|\byerba\s*mat[eé]?\b|\b(?:kola|cola)\s*nut\b|green\s*tea\s*extract|\btheobromine\b|\btheacrine\b|\bsynephrine\b|\byohimb\w*|\bdmaa\b|\bdmha\b|\bephedr\w*|bitter\s*orange/i;

export const PROPRIETARY_BLEND_FLAG =
  "Proprietary blend — individual ingredient dosages not disclosed on label.";
export const STIMULANT_FLAG =
  "Contains stimulant/caffeine-class ingredient — dosage not verified in our data.";

/**
 * Returns the safety flags that apply to a supplement, given a single haystack of
 * its label text (ingredient names, other-ingredients, label statement, product
 * name — joined by the caller). Empty array when nothing applies.
 */
export function supplementSafetyFlags(labelText: string | null | undefined): string[] {
  const s = (labelText ?? "").trim();
  if (!s) return [];
  const flags: string[] = [];
  if (PROPRIETARY_BLEND_RE.test(s)) flags.push(PROPRIETARY_BLEND_FLAG);
  if (STIMULANT_RE.test(s)) flags.push(STIMULANT_FLAG);
  return flags;
}
