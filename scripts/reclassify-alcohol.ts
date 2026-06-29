/**
 * RECLASSIFY ALCOHOL — one-time fixup for alcoholic products that were imported
 * with empty/non-alcohol OFF category tags and so sit as is_alcohol=false in the
 * food cache (coolers, hard seltzers, vodka sodas, spirits). Re-runs the new
 * name/ABV detector (detectAlcoholByName) over existing is_alcohol=false rows and
 * flips matches to is_alcohol=true.
 *
 *   npx tsx scripts/reclassify-alcohol.ts            # DRY-RUN (default): report only, write NOTHING
 *   npx tsx scripts/reclassify-alcohol.ts --write    # flip is_alcohol=true (+ null the stale food score)
 *
 * Mirrors the other backfill tools: dry-run default, --write gated, paged by
 * barcode.asc, loud on PATCH errors. Reads product_name only for detection —
 * never mutates product_name or any scoring field beyond clearing the now-invalid
 * food score on flipped rows.
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { writeFileSync } from "fs";
import { detectAlcoholByName } from "../app/scan/lib/productClassify";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
const BATCH = 1000;
if (!URL || !KEY) { console.error("Missing Supabase env vars — aborting."); process.exit(1); }
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };

type Row = { barcode: string; product_name: string | null; brand: string | null; gorilla_score: number | null; is_alcohol: boolean };

async function sb(q: string) {
  const r = await fetch(`${URL}/rest/v1/gorilla_product_cache?${q}`, { headers });
  if (!r.ok) { console.error(`Fetch failed: ${r.status} ${await r.text().catch(() => "")}`); process.exit(1); }
  return r.json();
}

async function main() {
  console.log(`🍸 Reclassify alcohol — ${DRY ? "DRY-RUN (no writes)" : "WRITE"}\n`);
  const flips: Row[] = [];
  let scanned = 0;
  for (let off = 0; ; off += BATCH) {
    const rows: Row[] = await sb(`is_alcohol=eq.false&select=barcode,product_name,brand,gorilla_score,is_alcohol&order=barcode.asc&offset=${off}&limit=${BATCH}`);
    if (rows.length === 0) break;
    scanned += rows.length;
    for (const r of rows) if (detectAlcoholByName(r.product_name, r.brand, r.barcode)) flips.push(r);
    if (rows.length < BATCH) break;
  }

  flips.sort((a, b) => (b.gorilla_score ?? -1) - (a.gorilla_score ?? -1));
  const inTop = flips.filter((r) => (r.gorilla_score ?? 0) >= 75);
  console.log(`Scanned is_alcohol=false rows : ${scanned}`);
  console.log(`Would flip to is_alcohol=true : ${flips.length}`);
  console.log(`  …of which score >=75 (leaking into /top food): ${inTop.length}\n`);

  console.log("──── FLIPS (score desc) ────");
  for (const r of flips) {
    console.log(`  [${String(r.gorilla_score ?? "—").padStart(3)}] ${(r.brand ?? "").slice(0, 20).padEnd(20)} | ${(r.product_name ?? "?").slice(0, 46).padEnd(46)} ${r.barcode}`);
  }

  // ── Exclusion proof: these MUST NOT flip ──
  console.log("\n──── EXCLUSION PROOF (must stay food → detector=false) ────");
  const safeBarcodes = ["0051497494940", "0051497494933", "0051497494957", "0051497494964"];
  const safeRows: Row[] = [];
  for (const bc of safeBarcodes) { const r = await sb(`barcode=eq.${bc}&select=barcode,product_name,brand,gorilla_score,is_alcohol`); if (r[0]) safeRows.push(r[0]); }
  // sample patterns
  for (const pat of ["kombucha", "root beer", "ginger beer", "ginger ale", "vodka sauce", "mocktail", "rum cake", "rum raisin", "cream", "% cocoa"]) {
    const r: Row[] = await sb(`is_alcohol=eq.false&product_name=ilike.${encodeURIComponent("*" + pat + "*")}&select=barcode,product_name,brand,gorilla_score,is_alcohol&limit=2`);
    safeRows.push(...r);
  }
  let leak = 0;
  for (const r of safeRows) {
    const d = detectAlcoholByName(r.product_name, r.brand, r.barcode);
    if (d) leak++;
    console.log(`  ${d ? "⚠ FLIP!" : "ok keep"}  ${(r.product_name ?? "?").slice(0, 50).padEnd(50)} ${r.barcode}`);
  }
  console.log(`  exclusion guard breaches: ${leak} (must be 0)`);

  // ── Ambiguous rows ──
  console.log("\n──── AMBIGUOUS (manual decision) ────");
  for (const bc of ["0628634740255", "0628075802628", "0628693579032"]) {
    const r = await sb(`barcode=eq.${bc}&select=barcode,product_name,brand,gorilla_score`);
    if (r[0]) console.log(`  detector=${detectAlcoholByName(r[0].product_name, r[0].brand, r[0].barcode)}  ${(r[0].product_name ?? "?").slice(0, 50)} ${bc}`);
    else console.log(`  (not in cache) ${bc}`);
  }

  if (!DRY) {
    console.log("\n──── WRITING ────");
    let ok = 0, fail = 0;
    for (const r of flips) {
      const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(r.barcode)}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ is_alcohol: true, gorilla_score: null, score_grade: null }),
      });
      if (res.ok) ok++; else { fail++; console.error(`  PATCH FAIL ${r.barcode}: ${res.status}`); }
    }
    console.log(`flipped ${ok}, failed ${fail}`);
  }

  writeFileSync("reclassify-alcohol-dryrun.txt", flips.map((r) => `${r.barcode}\t${r.gorilla_score}\t${r.brand ?? ""}\t${r.product_name ?? ""}`).join("\n"), "utf8");
  console.log(`\nMODE: ${DRY ? "DRY-RUN — nothing written." : "WRITE complete."}  (flip list saved to reclassify-alcohol-dryrun.txt)`);
}
main();
