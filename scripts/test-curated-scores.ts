/**
 * Deployment gate: asserts every barcode in CURATED_SCORE_CONSTANTS returns
 * its exact expected score from the curated lookup AND survives the scoring
 * gate unchanged. Runs via the `prebuild` npm hook — a failing score blocks
 * the build and therefore the deploy.
 *
 * Expected scores live in app/scan/lib/curatedScoreConstants.ts — update them
 * THERE, never here.
 */

import { lookupCuratedScore, applyScoringGate } from "../app/scan/lib/curatedScores";
import { CURATED_SCORE_CONSTANTS } from "../app/scan/lib/curatedScoreConstants";

let failures = 0;

for (const { barcode, name, expected } of CURATED_SCORE_CONSTANTS) {
  const curated = lookupCuratedScore(barcode, name);
  const lookupOk = curated?.score === expected;

  // The gate must also return the curated score regardless of what the
  // algorithm produced (simulate a wildly wrong algorithm score of 99).
  const gated = applyScoringGate(99, { barcode, productName: name });
  const gateOk = gated.score === expected && gated.scoreSource === "gorilla-verified";

  const ok = lookupOk && gateOk;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${barcode} ${name}: lookup=${curated?.score ?? "MISS"} gate=${gated.score} (${gated.scoreSource}) expected=${expected}`
  );
}

if (failures > 0) {
  console.error(`\n✗ ${failures} curated score test(s) FAILED — build blocked. Fix the curated database before deploying.`);
  process.exit(1);
}
console.log(`\n✓ All ${CURATED_SCORE_CONSTANTS.length} curated score tests passed.`);
