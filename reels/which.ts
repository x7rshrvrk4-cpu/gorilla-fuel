// Prints which reel the rotation selects right now (or for a given ISO date arg),
// plus the ready-to-paste caption. Run from repo root with the main project's tsx:
//   npx tsx reels/which.ts            # today's pick
//   npx tsx reels/which.ts 2026-12-24 # the pick for a specific date
// catalog.ts has no runtime imports, so tsx runs it without the reels deps.
import { pickReel, currentSlot, seasonalPool } from "./src/catalog";

const arg = process.argv[2];
const d = arg ? new Date(arg + "T12:00:00Z") : new Date();
const spec = pickReel(d);
const month = d.getUTCMonth() + 1;

console.log(`date:   ${d.toISOString().slice(0, 10)}  (month ${month}, slot ${currentSlot(d)})`);
console.log(`pool:   ${seasonalPool(month).map((s) => s.id).sort().join(", ")}`);
console.log(`PICK:   ${spec.id}  [${spec.topic}]`);
console.log(`\n--- caption ---\n${spec.caption}`);
