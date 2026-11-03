import "server-only";
import { ALCOHOL_PRODUCTS, wineGorillaScore, type AlcoholRankingProduct, type WineSubcategory } from "./products";
import { LCBO_WINES } from "./lcboWinesData";
import { WINE_RACK } from "./wineRackData";
import { MAGNOTTA } from "./magnottaData";

/**
 * Server-only LCBO wine catalogue. Expanded lazily from the compact tuples in
 * lcboWinesData.ts, de-duplicated against the curated catalogue, and served through
 * /api/wines so the thousands of rows never ship in client JavaScript.
 */

const SUB: Record<string, WineSubcategory> = { R: "Red", W: "White", P: "Rosé", S: "Sparkling", I: "Icewine", D: "Sweet" };

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const norm = (s: string) => fold(s).replace(/\b(vqa|lcbo)\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();

function sizeLabel(ml: number) {
  return ml >= 1000 ? `${+(ml / 1000).toFixed(2)}L` : `${ml}mL`;
}

type Row = readonly [string, string, string, string, number, number, number, string, string, number];

type Source = "lcbo" | "wr" | "mg";
const SOURCE_LABEL: Record<Source, string> = { lcbo: "LCBO", wr: "The Wine Rack (Ontario grocery wine boutique)", mg: "Magnotta Winery (winery stores and online)" };

function expand(row: Row, source: Source = "lcbo"): AlcoholRankingProduct {
  const [num, brand, rawName, sub, abv, sugarGL, ml, region, varietal, vqa] = row;
  const name = ml > 0 && ml !== 750 ? `${rawName} (${sizeLabel(ml)})` : rawName;
  const verified = abv > 0 && sugarGL >= 0;
  const base: AlcoholRankingProduct = {
    id: `wine-${source}-${num}`,
    category: "Wines",
    brand: brand || rawName.split(" ")[0],
    name,
    wineSubcategory: SUB[sub] ?? "Red",
    region: region || undefined,
    varietal: varietal || undefined,
    bottleSizeMl: ml > 0 ? ml : undefined,
    lcboNumber: source === "lcbo" ? num : undefined,
    market: "CA",
    availability: SOURCE_LABEL[source],
    knownAdditives: verified ? ["Sulphites (E220)"] : [],
    additiveCount: verified ? 1 : 0,
    gorillaPour: 3,
    confidence: verified ? "verified" : "partial",
    ontarioVQA: vqa === 1 ? true : undefined,
  };
  if (abv > 0) base.abv = abv;
  if (verified) {
    // Icewine is served and scored per 60 mL (see AlcoholProductCard); everything else per 148 mL.
    const pourMl = sub === "I" ? 60 : 148;
    const sugarPerPour = Math.round(sugarGL * (pourMl / 1000) * 10) / 10;
    base.sugarGPerL = sugarGL;
    base.sugarPerCan = sugarPerPour;
    base.carbsPerCan = sugarPerPour;
    base.caloriesPerCan = Math.round(pourMl * (abv / 100) * 0.789 * 7 + sugarPerPour * 4);
  }
  return base;
}

type Indexed = { p: AlcoholRankingProduct; hay: string; compact: string; score: number | null };
let cache: Indexed[] | null = null;
let byId: Map<string, Indexed> | null = null;

function load(): Indexed[] {
  if (cache) return cache;
  const haveNums = new Set<string>();
  const haveNames = new Set<string>();
  for (const p of ALCOHOL_PRODUCTS) {
    if (p.category !== "Wines") continue;
    if (p.lcboNumber) haveNums.add(p.lcboNumber);
    haveNames.add(`${norm(p.name)}|${p.bottleSizeMl ?? 0}`);
  }
  const out: Indexed[] = [];
  const lcboNames = new Set<string>();
  for (const row of LCBO_WINES) {
    if (haveNums.has(row[0])) continue;
    const p = expand(row);
    if (haveNames.has(`${norm(p.name)}|${p.bottleSizeMl ?? 0}`) || haveNames.has(`${norm(p.name)}|0`)) continue;
    const hay = fold(`${p.brand} ${p.name} ${p.varietal ?? ""} ${p.region ?? ""}`);
    out.push({ p, hay, compact: hay.replace(/[^a-z0-9]/g, ""), score: wineGorillaScore(p) });
    lcboNames.add(`${norm(p.name)}|${p.bottleSizeMl ?? 0}`);
  }
  // Wine Rack rows are skipped when the same wine (name + size) is already in the curated or LCBO data.
  for (const n of lcboNames) haveNames.add(n);
  for (const [rows, source] of [[WINE_RACK, "wr"], [MAGNOTTA, "mg"]] as const) {
    for (const row of rows) {
      const p = expand(row, source);
      const key = `${norm(p.name)}|${p.bottleSizeMl ?? 0}`;
      if (haveNames.has(key) || haveNames.has(`${norm(p.name)}|0`)) continue;
      haveNames.add(key);
      const hay = fold(`${p.brand} ${p.name} ${p.varietal ?? ""} ${p.region ?? ""}${source === "wr" ? " wine rack grocery" : ""}`);
      out.push({ p, hay, compact: hay.replace(/[^a-z0-9]/g, ""), score: wineGorillaScore(p) });
    }
  }
  cache = out;
  byId = new Map(out.map((x) => [x.p.id, x]));
  return out;
}

export function lcboWineCount(): number {
  return load().length;
}

export function getLcboWine(id: string): (AlcoholRankingProduct & { wineScore: number | null }) | null {
  load();
  const x = byId!.get(id);
  return x ? { ...x.p, wineScore: x.score } : null;
}

export type WineHit = {
  id: string; name: string; brand: string; abv?: number; category: "Wines"; gorillaPour: number; wineScore: number | null;
};

/** Token search over brand + name + varietal + region. Verified (scored) wines first, then by score. */
export function searchLcboWines(q: string, limit: number): { hits: WineHit[]; total: number } {
  const tokens = fold(q).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { hits: [], total: 0 };
  let matched = load().filter((x) => tokens.every((t) => x.hay.includes(t)));
  // Fallback only when nothing matched: ignore spaces/punctuation so "yellowtail" finds "Yellow Tail".
  // (Not applied up front: it would let "cavit" match across words like "Bianca Vitese".)
  const compactQ = tokens.join("").replace(/[^a-z0-9]/g, "");
  if (matched.length === 0 && compactQ.length >= 4) matched = load().filter((x) => x.compact.includes(compactQ));
  matched.sort((a, b) => (b.score !== null ? 1 : 0) - (a.score !== null ? 1 : 0) || (b.score ?? -1) - (a.score ?? -1) || a.p.name.localeCompare(b.p.name));
  const hits = matched.slice(0, limit).map(({ p, score }) => ({
    id: p.id, name: p.name, brand: p.brand, abv: p.abv, category: "Wines" as const, gorillaPour: p.gorillaPour, wineScore: score,
  }));
  return { hits, total: matched.length };
}
