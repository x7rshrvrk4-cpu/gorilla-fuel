// Internal wine-quality consistency audit: every displayed score must have a
// source from the recognized critic list, fall in a plausible range, and the
// Task 6 flagged wines are reported with their current values for manual
// verification (external sources are not machine-accessible).
import { ALCOHOL_PRODUCTS } from "../app/alcohol/lib/products";

const RECOGNIZED = /james suckling|wine spectator|wine enthusiast|winealign|decanter|national wine awards|ontario wine awards|winecurrent/i;

const wines = ALCOHOL_PRODUCTS.filter((p) => p.category === "Wines");
const rated = wines.filter((p) => p.wineQuality !== undefined);
const issues: string[] = [];

for (const w of rated) {
  if (!w.wineQualitySource) issues.push(`${w.name}: score ${w.wineQuality} has NO SOURCE`);
  else if (!RECOGNIZED.test(w.wineQualitySource)) issues.push(`${w.name}: unrecognized source "${w.wineQualitySource}"`);
  if (w.wineQuality! < 80 || w.wineQuality! > 100) issues.push(`${w.name}: implausible score ${w.wineQuality}`);
}
const sourceless = wines.filter((p) => p.wineQuality === undefined && p.wineQualitySource !== undefined);
for (const w of sourceless) issues.push(`${w.name}: source without score`);

console.log(`wines=${wines.length} rated=${rated.length} unrated=${wines.length - rated.length}`);
console.log(`consistency issues: ${issues.length === 0 ? "none" : "\n  " + issues.join("\n  ")}`);

console.log("\nTASK 6 FLAGGED WINES — current values (manual verification needed):");
const flagged = [
  "Wayne Gretzky Baco Noir", "Wayne Gretzky Signature", "Kim Crawford Sauvignon",
  "Whispering Angel", "Inniskillin Vidal", "Henry of Pelham Baco",
  "Norman Hardie Pinot Noir", "Cave Spring Riesling", "Tawse Quarry Road",
];
for (const f of flagged) {
  const w = wines.find((x) => x.name.toLowerCase().includes(f.toLowerCase().split(" ").slice(0, 3).join(" ").toLowerCase()) || x.name.toLowerCase().startsWith(f.toLowerCase().slice(0, 15)));
  console.log(`  ${f}: ${w ? `${w.name} — ${w.wineQuality ?? "N/A"}${w.wineQualitySource ? ` (${w.wineQualitySource})` : ""}` : "NOT FOUND"}`);
}

const bySource: Record<string, number> = {};
for (const w of rated) {
  const s = (w.wineQualitySource ?? "?").split("—")[0].trim();
  bySource[s] = (bySource[s] ?? 0) + 1;
}
console.log("\nscores by source:", JSON.stringify(bySource, null, 1));
