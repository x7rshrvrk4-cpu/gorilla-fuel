/**
 * Ingest the BC Liquor Store Product Price List into the bc_liquor staging table.
 * Downloads the CSV from the BC Open Government Portal, parses/normalizes/clamps,
 * and bulk-inserts all rows (including the ~8% barcode-less rows — they still have
 * valid SKU/name/price/ABV, just no barcode join yet).
 *
 *   npx tsx scripts/ingest-bc-liquor.ts             # DRY-RUN (download + parse + validate, no write)
 *   npx tsx scripts/ingest-bc-liquor.ts --file X.csv  # parse a local CSV instead of downloading
 *   npx tsx scripts/ingest-bc-liquor.ts --write       # truncate + insert into bc_liquor
 *
 * Requires the table (run supabase/bc_liquor.sql once in the SQL Editor first) — the
 * script checks and exits cleanly if it's absent.
 */
import { readFileSync } from "node:fs";
import { config } from "dotenv";
config({ path: ".env.local", override: true });

const CSV_URL = "https://catalogue.data.gov.bc.ca/dataset/e43be180-7511-4e6f-84d3-ad6c9f5c3e2b/resource/09a4eba7-c357-4764-8ef8-5f0499e11a3e/download/bc_liquor_store_product_price_list_february_2026.csv";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const KEY = SVC || (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "");
const DRY = !process.argv.includes("--write");
if (!URL || !KEY) { console.error("Missing Supabase env"); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/** Minimal RFC-4180 CSV parser (handles quoted fields with embedded commas/quotes). */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const cols = rows[0];
  return rows.slice(1).map((r) => Object.fromEntries(cols.map((c, i) => [c, (r[i] ?? "").trim()])));
}

const normUpc = (u: string) => { const t = (u || "").trim(); return !t || t.toUpperCase() === "NA" ? null : t.replace(/^0+/, ""); };
function normKind(cat: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("wine")) return "wine";
  if (c.includes("spirit")) return "spirits";
  if (c.includes("beer")) return "beer";
  if (c.includes("refreshment")) return "refreshment";
  return "other";
}
const num = (v: string) => { const n = parseFloat((v || "").replace(/,/g, "")); return Number.isFinite(n) ? n : null; };
function clampAbv(v: string): number | null { const n = num(v); return n !== null && n > 0 && n <= 80 ? n : null; }

async function main() {
  console.log(`🍁 Ingest BC Liquor — ${DRY ? "DRY-RUN" : "WRITE"}\n`);

  // table-existence guard
  const probe = await fetch(`${URL}/rest/v1/bc_liquor?select=id&limit=1`, { headers: H });
  if (probe.status === 404 || probe.status === 400) {
    console.error("ABORT — bc_liquor table not found. Run supabase/bc_liquor.sql in the SQL Editor first.");
    if (!DRY) process.exit(1);
    console.log("(DRY-RUN continues to validate parsing; --write requires the table.)\n");
  }

  const fileIdx = process.argv.indexOf("--file");
  let csv: string;
  if (fileIdx !== -1 && process.argv[fileIdx + 1]) {
    const path = process.argv[fileIdx + 1];
    console.log(`reading local CSV ${path} …`);
    csv = readFileSync(path, "utf8");
  } else {
    console.log(`downloading ${CSV_URL.split("/").pop()} …`);
    const res = await fetch(CSV_URL, { headers: { "User-Agent": "GorillaFuel-ingest/1.0" } });
    if (!res.ok) { console.error(`CSV download failed: ${res.status}`); process.exit(1); }
    csv = await res.text();
  }
  const raw = parseCsv(csv);
  console.log(`parsed rows: ${raw.length}\n`);

  let parseFail = 0;
  const records = raw.map((r) => {
    if (!r.PRODUCT_SKU_NO) { parseFail++; return null; }
    return {
      barcode: normUpc(r.PRODUCT_BASE_UPC_NO),
      sku: r.PRODUCT_SKU_NO,
      product_name: r.PRODUCT_LONG_NAME || null,
      category: r.ITEM_CATEGORY_NAME || null,
      kind: normKind(r.ITEM_CATEGORY_NAME),
      subcategory: r.ITEM_SUBCATEGORY_NAME || null,
      class: r.ITEM_CLASS_NAME || null,
      country_origin: r.PRODUCT_COUNTRY_ORIGIN_NAME || null,
      litres_per_container: num(r.PRODUCT_LITRES_PER_CONTAINER),
      containers_per_sell_unit: (() => { const n = num(r.PRD_CONTAINER_PER_SELL_UNIT); return n !== null ? Math.round(n) : null; })(),
      abv: clampAbv(r.PRODUCT_ALCOHOL_PERCENT),
      price: num(r.PRODUCT_PRICE),
      sweetness_code: r.SWEETNESS_CODE && r.SWEETNESS_CODE.toUpperCase() !== "NA" ? r.SWEETNESS_CODE : null,
      source: "bc_liquor",
    };
  }).filter(Boolean) as any[];

  // validation report
  const withBc = records.filter((r) => r.barcode).length;
  const abvClamped = records.filter((r) => r.abv === null).length;
  const kinds: Record<string, number> = {};
  for (const r of records) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
  console.log(`records: ${records.length} | parse failures (no SKU): ${parseFail}`);
  console.log(`  with barcode: ${withBc} (${Math.round(100 * withBc / records.length)}%) | barcode-less: ${records.length - withBc}`);
  console.log(`  ABV dropped to NULL (0 or >80 placeholder): ${abvClamped}`);
  console.log(`  kind distribution: ${JSON.stringify(kinds)}`);
  console.log(`  sample: ${JSON.stringify(records[0])}`);

  if (DRY) { console.log(`\nDRY-RUN — nothing written. Re-run with --write once the table exists.`); return; }

  // WRITE: clear + bulk insert in chunks
  const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
  await fetch(`${URL}/rest/v1/bc_liquor?id=not.is.null`, { method: "DELETE", headers: wH }); // clear prior import
  let inserted = 0, fail = 0;
  const CHUNK = 500;
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK);
    const r = await fetch(`${URL}/rest/v1/bc_liquor`, { method: "POST", headers: wH, body: JSON.stringify(chunk) });
    if (r.ok) inserted += chunk.length; else { fail += chunk.length; console.error(`  INSERT FAIL @${i}: ${r.status} ${await r.text().catch(() => "")}`); }
  }
  console.log(`\nWRITE — inserted ${inserted}, failed ${fail}`);
  if (fail > 0) process.exit(1);
}
main();
