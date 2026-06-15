// Reports every Gorilla Sweet Spot wine (gorilla ≥70 AND quality ≥89) and the
// dynamic combined-score top 10 — verifies the calculation used by the page.
import { ALCOHOL_PRODUCTS, wineGorillaScore, isGorillaSweetSpot } from "../app/alcohol/lib/products";

const wines = ALCOHOL_PRODUCTS.filter((p) => p.category === "Wines");
const rated = wines.filter((p) => p.wineQuality !== undefined);
const sweet = wines.filter(isGorillaSweetSpot);

console.log(`wines=${wines.length} rated=${rated.length} unrated=${wines.length - rated.length}`);
console.log(`\nGORILLA SWEET SPOT WINES (${sweet.length}):`);
for (const p of sweet.sort((a, b) => ((wineGorillaScore(b) ?? 0) + b.wineQuality!) - ((wineGorillaScore(a) ?? 0) + a.wineQuality!))) {
  console.log(`  ${p.name} — 🦍 ${wineGorillaScore(p)} · ⭐ ${p.wineQuality} (${p.wineQualitySource})${p.ontarioVQA ? " · VQA" : ""}`);
}

console.log(`\nDYNAMIC COMBINED TOP 10:`);
rated
  .map((p) => ({ p, g: wineGorillaScore(p), c: ((wineGorillaScore(p) ?? 0) + p.wineQuality!) / 2 }))
  .sort((a, b) => b.c - a.c)
  .slice(0, 10)
  .forEach(({ p, g, c }, i) => console.log(`  ${i + 1}. ${p.name} — combined ${c.toFixed(1)} (🦍 ${g} + ⭐ ${p.wineQuality})`));
