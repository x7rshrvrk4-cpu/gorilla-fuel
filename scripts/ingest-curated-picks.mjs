// Ingest hand-approved curation picks into the curated_picks table.
//
//   node --env-file=.env.local scripts/ingest-curated-picks.mjs --gen-input
//        → writes data/curated-picks-input.json (a DEFAULT derived from the cache;
//          edit it: your allowlisted brands + per-item barcodes + skips).
//   node --env-file=.env.local scripts/ingest-curated-picks.mjs
//        → DRY RUN: expands the input against the cache, prints the plan + counts.
//   node --env-file=.env.local scripts/ingest-curated-picks.mjs --write
//        → writes rows to curated_picks (requires SUPABASE_SERVICE + the table to exist).
//
// Read-only by default. Never touches the scanner or scoring. Writes ONLY to
// curated_picks, and ONLY with --write.

import { readFileSync, writeFileSync, existsSync } from "fs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: ANON, Authorization: `Bearer ${ANON}`, Accept: "application/json" };
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false";
const INPUT = "data/curated-picks-input.json";
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--gen-input") ? "gen" : "dry";

// ── shared filters (mirror /top + the review sheet) ──
const normBc = (b) => b.replace(/\D/g, "").replace(/^0+/, "") || "0";
const isJunkBarcode = (bc) => { const d = bc.replace(/\D/g, ""); return d.length < 8 || /^0+$/.test(d) || normBc(bc).length < 5; };
const isGarbageName = (name) => {
  const n = (name ?? "").trim();
  if (n.length < 3) return true;
  if (!/[a-zA-Z]{3,}/.test(n)) return true;
  if (/^(test|tester|xxx|aaa|dummy|sample|unknown|n\/a|na|tbd|product|produit|item|untitled|no name|sans nom)\b/i.test(n)) return true;
  return false;
};
// supplement brands leaked into the food band. \bvega\b so "Vegan"/"The Vegan" are NOT excluded.
// Includes the three you flagged: Shop Santé, ANS Performance, BioX.
const SUPP = [
  /revolution nutrition/, /\bpvl\b/, /myprotein/, /canadian protein/, /basic supplements/, /body energy club/,
  /\ballmax\b/, /\bmutant\b/, /magnum nutraceuticals/, /ballistic/, /north coast naturals/, /believe supplements/,
  /optimum nutrition/, /dymatize/, /ghost lifestyle/, /kaizen/, /iron vegan/, /genuine health/, /\bprogressive\b/,
  /prairie naturals/, /sd pharmaceuticals/, /perfect sports/, /\bxpn\b/, /\bbsn\b/, /cellucor/, /\bvega\b/,
  /garden of life/, /now foods/, /jamieson/, /webber naturals/, /organika/, /ergogenics/, /natural factors/,
  /\bdiesel\b/, /yummy sports/, /tc nutrition/, /rivalus/, /\bmammoth\b/, /nutrabolics/, /hd muscle/, /beyond yourself/,
  /shop sant/, /ans performance/, /\bbiox\b/, /\bans\b/,
];
const isSuppBrand = (b) => { const x = (b || "").toLowerCase(); return SUPP.some((re) => re.test(x)); };

const strip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
function canonKey(raw) {
  const low = strip(raw).trim().replace(/\s+/g, " ").toLowerCase();
  const rule = (re, name) => (re.test(low) ? name : null);
  const hit =
    rule(/kirkland/, "Kirkland Signature") || rule(/farm\s*boy/, "Farm Boy") || rule(/fresh\s*prep/, "Fresh Prep") ||
    rule(/president.?s choice|le choix du president|choix du president|^pc\b|^pc[\s\/]|pc organics?|pc biologique/, "President's Choice") ||
    rule(/compliments/, "Compliments") || rule(/great value/, "Great Value") || rule(/western family/, "Western Family") ||
    rule(/save.?on.?foods/, "Save-On-Foods") || rule(/no name|sans nom/, "No Name") || rule(/^t\s*&\s*t|^t&t/, "T&T") ||
    rule(/sobeys/, "Sobeys") || rule(/^selection\b|^selection/, "Selection") || rule(/only goodness/, "Only Goodness") ||
    rule(/^safeway/, "Safeway") || rule(/^metro\b/, "Metro") || rule(/^longos?\b/, "Longo's") ||
    rule(/your fresh market/, "Your Fresh Market") || rule(/^costco/, "Costco") || rule(/bob.?s red mill/, "Bob's Red Mill");
  if (hit) return hit.toLowerCase();
  return low.replace(/[^a-z0-9]/g, "") || low;
}

async function pullBand(scoreQs) {
  let from = 0; const page = 1000; const all = [];
  for (;;) {
    const u = `${URL}/rest/v1/gorilla_product_cache?select=barcode,product_name,brand,gorilla_score,image_url&${FOOD}&${scoreQs}&brand=neq.&image_url=not.is.null&order=barcode.asc&limit=${page}&offset=${from}`;
    // Retry/backoff: the widened bands page through tens of requests; a transient
    // throttle returns a non-array error object, so retry before giving up.
    let rows = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const r = await fetch(u, { headers: H });
      const j = await r.json().catch(() => null);
      if (r.ok && Array.isArray(j)) { rows = j; break; }
      await new Promise((res) => setTimeout(res, 600 * (attempt + 1)));
    }
    if (!rows) throw new Error(`pullBand failed after retries at offset ${from} for [${scoreQs}]`);
    all.push(...rows); if (rows.length < page) break; from += page;
  }
  return all.filter((p) => !isJunkBarcode(p.barcode) && !isGarbageName(p.product_name) && p.brand && p.brand.trim() && !isSuppBrand(p.brand));
}

async function main() {
  if (!URL || !ANON) { console.error("Supabase not configured (.env.local)"); process.exit(1); }
  const approvedRows = await pullBand("gorilla_score=gte.75");
  const cheatRows = await pullBand("gorilla_score=gte.45&gorilla_score=lte.74"); // widened 45-65 -> 45-74 (closes 66-74 gap)
  const avoidRows = await pullBand("gorilla_score=lt.45");                        // new AVOID band

  // brand -> qualifying barcodes (sorted by score desc)
  const byBrand = (rows) => {
    const m = new Map();
    for (const p of rows) { const k = canonKey(p.brand); if (!m.has(k)) m.set(k, []); m.get(k).push(p); }
    for (const v of m.values()) v.sort((a, b) => b.gorilla_score - a.gorilla_score);
    return m;
  };
  const aBrands = byBrand(approvedRows), cBrands = byBrand(cheatRows), vBrands = byBrand(avoidRows);

  // ── GEN-INPUT: write a default input (brands with >=3 rows; explicit-item lists empty for hand-curation) ──
  if (mode === "gen") {
    const topBrands = (m) => [...m.entries()].filter(([, v]) => v.length >= 3)
      .sort((a, b) => b[1].length - a[1].length).map(([k, v]) => v[0].brand); // display = top-scoring row's brand string
    const def = {
      _note: "EDIT ME. {approved,cheat,avoid}Brands = brand display names to allowlist (matched by normalized key). {approved,cheat,avoid}Items = explicit barcodes (preferred — pins exact SKUs). skipItems = barcodes to drop. Precedence approved>cheat>avoid. Cheat band 45-74, Avoid band <45.",
      approvedBrands: topBrands(aBrands),
      cheatBrands: topBrands(cBrands),
      avoidBrands: topBrands(vBrands),
      approvedItems: approvedRows.filter((p) => p.gorilla_score >= 90).map((p) => p.barcode),
      cheatItems: [],
      avoidItems: [],
      skipItems: [],
    };
    writeFileSync(INPUT, JSON.stringify(def, null, 2));
    console.log(`Wrote ${INPUT}`);
    console.log(`  approvedBrands: ${def.approvedBrands.length} | cheatBrands: ${def.cheatBrands.length} | avoidBrands: ${def.avoidBrands.length} | approvedItems(90+): ${def.approvedItems.length}`);
    return;
  }

  if (!existsSync(INPUT)) { console.error(`Missing ${INPUT}. Run with --gen-input first (then edit it).`); process.exit(1); }
  const input = JSON.parse(readFileSync(INPUT, "utf8"));
  const skip = new Set((input.skipItems ?? []).map(normBc));

  // expand brands -> barcodes + add explicit items
  const expand = (brandList, brandMap, itemList, allRows) => {
    const out = new Map(); // barcode -> row
    for (const bname of brandList ?? []) {
      const k = canonKey(bname);
      for (const p of brandMap.get(k) ?? []) out.set(p.barcode, p);
    }
    const byBc = new Map(allRows.map((p) => [p.barcode, p]));
    for (const bc of itemList ?? []) { const p = byBc.get(bc); if (p) out.set(bc, p); }
    return [...out.values()].filter((p) => !skip.has(normBc(p.barcode)));
  };
  let approved = expand(input.approvedBrands, aBrands, input.approvedItems, approvedRows);
  let cheat = expand(input.cheatBrands, cBrands, input.cheatItems, cheatRows);
  let avoid = expand(input.avoidBrands, vBrands, input.avoidItems, avoidRows);

  // precedence approved > cheat > avoid (most-favorable tier wins a duplicate barcode)
  const aSet = new Set(approved.map((p) => p.barcode));
  cheat = cheat.filter((p) => !aSet.has(p.barcode));
  const acSet = new Set([...approved, ...cheat].map((p) => p.barcode));
  avoid = avoid.filter((p) => !acSet.has(p.barcode));

  // rank: approved best-first (desc, unchanged); cheat + avoid WORST-first (asc) per curation intent
  approved.sort((a, b) => b.gorilla_score - a.gorilla_score);
  cheat.sort((a, b) => a.gorilla_score - b.gorilla_score || a.barcode.localeCompare(b.barcode));
  avoid.sort((a, b) => a.gorilla_score - b.gorilla_score || a.barcode.localeCompare(b.barcode));
  const rows = [
    ...approved.map((p, i) => ({ barcode: p.barcode, tier: "approved", rank: i })),
    ...cheat.map((p, i) => ({ barcode: p.barcode, tier: "cheat", rank: i })),
    ...avoid.map((p, i) => ({ barcode: p.barcode, tier: "avoid", rank: i })),
  ];

  // ── BAND-DRIFT detection: every explicitly-listed item that did NOT land in its
  //    intended band (e.g. post-recompute score moved it out). Look it up across all
  //    three bands to report where it went.
  const whereMap = new Map(); // normBc -> {band, score, brand, name}
  const addWhere = (rs, band) => { for (const p of rs) { const k = normBc(p.barcode); if (!whereMap.has(k)) whereMap.set(k, { band, score: p.gorilla_score, brand: p.brand, name: p.product_name }); } };
  addWhere(approvedRows, "approved(>=75)"); addWhere(cheatRows, "cheat(45-74)"); addWhere(avoidRows, "avoid(<45)");
  const landed = (arr) => new Set(arr.map((p) => normBc(p.barcode)));
  const avoidLanded = landed(avoid), cheatLanded = landed(cheat);
  const drift = [];
  for (const bc of input.avoidItems ?? []) { const k = normBc(bc); if (!avoidLanded.has(k)) drift.push({ bc, want: "avoid", got: whereMap.get(k) }); }
  for (const bc of input.cheatItems ?? []) { const k = normBc(bc); if (!cheatLanded.has(k)) drift.push({ bc, want: "cheat", got: whereMap.get(k) }); }

  // ── full populate plan ──
  const line = (p, i) => `  #${String(i).padStart(2)} [${String(p.gorilla_score).padStart(3)}] ${(p.brand ?? "").slice(0, 18).padEnd(18)} | ${(p.product_name ?? "").slice(0, 40).padEnd(40)} ${p.barcode}`;
  console.log(`\n===== POPULATE PLAN (DRY-RUN) =====`);
  console.log(`COUNTS: approved ${approved.length} (NOT written unless listed) | cheat ${cheat.length} | avoid ${avoid.length} | total rows ${rows.length}`);
  console.log(`\n--- AVOID (worst-score-first), ${avoid.length} ---`);
  avoid.forEach((p, i) => console.log(line(p, i)));
  console.log(`\n--- CHEAT (worst-score-first), ${cheat.length} ---`);
  cheat.forEach((p, i) => console.log(line(p, i)));
  if (approved.length) { console.log(`\n--- APPROVED (this run would write ${approved.length}) ---`); approved.forEach((p, i) => console.log(line(p, i))); }
  console.log(`\n===== BAND-DRIFT (listed items that did NOT land in intended band): ${drift.length} =====`);
  for (const d of drift) console.log(`  ⚠ ${d.bc} wanted=${d.want} but now=${d.got ? `${d.got.band} score=${d.got.score} (${d.got.name})` : "NOT FOUND in any band (filtered out / score moved / image gone)"}`);
  if (!drift.length) console.log("  (none — every listed item is in its intended band)");

  if (mode !== "write") { console.log("\n(DRY RUN — no write. Re-run with --write to upsert into curated_picks.)"); return; }

  if (!SERVICE) { console.error("--write needs SUPABASE_SERVICE_ROLE_KEY in env."); process.exit(1); }
  const wH = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" };
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const r = await fetch(`${URL}/rest/v1/curated_picks?on_conflict=barcode,tier`, { method: "POST", headers: wH, body: JSON.stringify(batch) });
    if (!r.ok) { console.error("write failed:", r.status, await r.text().catch(() => "")); process.exit(1); }
    console.log(`  upserted ${Math.min(i + 500, rows.length)}/${rows.length}`);
  }
  console.log("DONE — curated_picks updated.");
}
main();
