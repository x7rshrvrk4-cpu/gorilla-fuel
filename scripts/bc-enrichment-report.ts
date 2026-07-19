/**
 * READ-ONLY. Cross-references the BC Liquor CSV against live cache alcohol rows.
 * Reports (does NOT write):
 *   1. barcode matches, and how many still lack nutrition_data.alcohol_100g
 *      (the "enrichment delta" beyond the 16 already backfilled in 399ae25).
 *   2. proposed kind-corrections: cache rows whose detected kind disagrees with
 *      BC's authoritative category. For review only — never applied here.
 *
 *   npx tsx scripts/bc-enrichment-report.ts --file <bcl.csv>
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { readFileSync } from "node:fs";
import { detectAlcoholKind } from "../app/scan/lib/alcoholScoring";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const KEY = SVC || (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "");
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const norm = (u: string) => { const t = (u || "").trim(); return !t || t.toUpperCase() === "NA" ? null : t.replace(/^0+/, ""); };

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []; let f = "", row: string[] = [], q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; if (f !== "" || row.length) { row.push(f); rows.push(row); row = []; f = ""; } }
    else f += c; }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  const cols = rows[0];
  return rows.slice(1).map((r) => Object.fromEntries(cols.map((c, i) => [c, (r[i] ?? "").trim()])));
}
function bcKind(cat: string): string { const c = (cat || "").toLowerCase();
  if (c.includes("wine")) return "wine"; if (c.includes("spirit")) return "spirits";
  if (c.includes("beer")) return "beer"; if (c.includes("refreshment")) return "refreshment"; return "other"; }

async function main() {
  const fi = process.argv.indexOf("--file");
  const csv = readFileSync(process.argv[fi + 1], "utf8");
  const bc = parseCsv(csv);
  const bcByBarcode = new Map<string, Record<string, string>>();
  for (const r of bc) { const b = norm(r.PRODUCT_BASE_UPC_NO); if (b && !bcByBarcode.has(b)) bcByBarcode.set(b, r); }
  console.log(`BC rows: ${bc.length} | distinct normalized barcodes: ${bcByBarcode.size}\n`);

  // pull all cache alcohol rows (paged)
  const cache: any[] = [];
  for (let off = 0; ; off += 1000) {
    const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?is_alcohol=eq.true&select=barcode,product_name,categories,nutrition_data&limit=1000`, { headers: { ...H, Range: `${off}-${off + 999}` } });
    const page = (await res.json()) as any[];
    cache.push(...page);
    if (page.length < 1000) break;
  }
  console.log(`cache alcohol rows: ${cache.length}\n`);

  const matches: any[] = [], abvMissing: any[] = [], kindProposals: any[] = [];
  for (const c of cache) {
    const b = norm(c.barcode); if (!b) continue;
    const hit = bcByBarcode.get(b); if (!hit) continue;
    matches.push(c.barcode);
    let nd = c.nutrition_data; if (typeof nd === "string") { try { nd = JSON.parse(nd); } catch { nd = {}; } } nd = nd ?? {};
    const hasAbv = nd.alcohol_100g != null;
    if (!hasAbv) abvMissing.push({ bc: c.barcode, name: c.product_name, bcAbv: hit.PRODUCT_ALCOHOL_PERCENT });
    let cats: string[] = []; try { cats = typeof c.categories === "string" ? JSON.parse(c.categories) : (c.categories ?? []); } catch {}
    const curKind = detectAlcoholKind(cats);
    const authKind = bcKind(hit.ITEM_CATEGORY_NAME);
    if (curKind !== authKind && authKind !== "other")
      kindProposals.push({ bc: c.barcode, name: c.product_name, cur: curKind, proposed: authKind, bcCat: hit.ITEM_CATEGORY_NAME });
  }

  console.log(`═══ 1. BARCODE MATCHES ═══`);
  console.log(`matched cache↔BC: ${matches.length}`);
  console.log(`ENRICHMENT DELTA (matches still missing alcohol_100g): ${abvMissing.length}`);
  for (const m of abvMissing) console.log(`   ${m.bc}  ${(m.name ?? "?").slice(0, 34).padEnd(34)}  BC ABV=${m.bcAbv}`);
  if (!abvMissing.length) console.log(`   (none — all matched rows already carry ABV from the 399ae25 backfill)`);

  console.log(`\n═══ 2. PROPOSED KIND-CORRECTIONS (REVIEW ONLY — not applied) ═══`);
  console.log(`count: ${kindProposals.length}`);
  console.log(`  barcode          current   ->  proposed   BC category            product`);
  for (const k of kindProposals)
    console.log(`  ${k.bc.padEnd(15)}  ${k.cur.padEnd(8)}  ->  ${k.proposed.padEnd(8)}  ${(k.bcCat ?? "?").padEnd(20)}  ${(k.name ?? "?").slice(0, 30)}`);
}
main();
