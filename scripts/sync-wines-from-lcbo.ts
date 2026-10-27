/**
 * Refreshes ABV / residual sugar on the generated LCBO wine rows in app/alcohol/lib/wines.ts
 * from crawled lcbo.com product pages (see scripts/crawl-lcbo-products.cjs).
 *  - PARTIAL wines that now have both ABV and sugar are upgraded to verified.
 *  - Verified wines whose LCBO figures changed are updated to the LCBO's current figures.
 *  - Wines the LCBO no longer lists (no crawl record) are left untouched.
 * Calories = round(148 * abv/100 * 0.789 * 7 + sugarPerPour * 4), the formula documented in wines.ts.
 *
 * Usage: npx tsx scripts/sync-wines-from-lcbo.ts [--write] <crawl1.jsonl> [crawl2.jsonl ...]
 */
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const write = args.includes("--write");
const files = args.filter((a) => !a.startsWith("--"));
const lcbo = new Map<string, { abv?: number; sugarGL?: number }>();
for (const f of files) {
  for (const l of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    if (!l) continue;
    try { const r = JSON.parse(l); if (r.num && r.cats?.[0] === "Wine") lcbo.set(r.num, { abv: r.abv, sugarGL: r.sugarGL }); } catch {}
  }
}

const file = path.resolve("app/alcohol/lib/wines.ts");
const raw = fs.readFileSync(file, "utf8");
const nl = raw.includes("\r\n") ? "\r\n" : "\n";
const lines = raw.replace(/\r\n/g, "\n").split("\n");
let upgraded = 0, changed = 0, same = 0, missing = 0, untouched = 0;

const out = lines.map((line) => {
  const m = line.match(/^  \{ id: "wine-lcbo-(\d+)"/);
  if (!m) return line;
  const r = lcbo.get(m[1]);
  if (!r) { missing++; return line; }
  if (r.abv === undefined || Number.isNaN(r.abv) || r.sugarGL === undefined || Number.isNaN(r.sugarGL)) { untouched++; return line; }
  const wasPartial = /confidence: "partial"/.test(line);
  const oldAbv = parseFloat((line.match(/\babv: ([\d.]+)/) || [])[1] ?? "NaN");
  const oldSug = parseFloat((line.match(/\bsugarGPerL: ([\d.]+)/) || [])[1] ?? "NaN");
  if (!wasPartial && oldAbv === r.abv && oldSug === r.sugarGL) { same++; return line; }

  // Icewine is served and scored per 60 mL (see AlcoholProductCard); everything else per 148 mL.
  const pourMl = /wineSubcategory: "Icewine"/.test(line) ? 60 : 148;
  const sugarPerPour = Math.round(r.sugarGL * (pourMl / 1000) * 10) / 10;
  const kcal = Math.round(pourMl * (r.abv / 100) * 0.789 * 7 + sugarPerPour * 4);
  let s = line
    .replace(/\b(abv|caloriesPerCan|carbsPerCan|sugarPerCan|sugarGPerL): [\d.]+, /g, "")
    .replace(/knownAdditives: \[[^\]]*\], /g, "")
    .replace(/additiveCount: \d+, /g, "")
    .replace(/, confidence: "(verified|partial)"/, "");
  s = s.replace(/(name: "(?:[^"\\]|\\.)*", )/, `$1abv: ${r.abv}, caloriesPerCan: ${kcal}, carbsPerCan: ${sugarPerPour}, sugarPerCan: ${sugarPerPour}, sugarGPerL: ${r.sugarGL}, knownAdditives: ["Sulphites (E220)"], additiveCount: 1, `);
  s = s.replace(/ \},?$/, (t) => `, confidence: "verified"${t}`);
  if (wasPartial) upgraded++; else changed++;
  return s;
});

console.log(`LCBO records ${lcbo.size} | upgraded partial->verified ${upgraded} | updated to LCBO figures ${changed} | unchanged ${same} | no LCBO record ${missing} | LCBO lacks abv/sugar ${untouched}`);
if (write) { fs.writeFileSync(file, out.join(nl)); console.log("wines.ts written"); } else console.log("dry run (pass --write)");
