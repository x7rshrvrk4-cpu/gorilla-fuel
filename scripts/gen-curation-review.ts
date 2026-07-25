// Read-only curation review-sheet generator. Writes fresh markdown to data/.
// NO DB writes, NO curated_picks changes, NO scoring changes — pure candidate export
// against CURRENT post-fix scores. Reuses the ingest tool's SUPP + canonKey logic.
//   npx tsx scripts/gen-curation-review.ts
import { config } from "dotenv"; config({ path: ".env.local", override: true });
import { writeFileSync } from "fs";
import { scoreNutrition, scoreAdditives, type Nutriments } from "../app/scan/lib/scoring";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: "application/json" };
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false";
const DATE = "2026-07-25";

// ── junk filters (verbatim from ingest tool) ──
const normBc = (b: string) => b.replace(/\D/g, "").replace(/^0+/, "") || "0";
const isJunkBarcode = (bc: string) => { const d = bc.replace(/\D/g, ""); return d.length < 8 || /^0+$/.test(d) || normBc(bc).length < 5; };
const isGarbageName = (name: string | null) => { const n = (name ?? "").trim(); if (n.length < 3) return true; if (!/[a-zA-Z]{3,}/.test(n)) return true; if (/^(test|tester|xxx|aaa|dummy|sample|unknown|n\/a|na|tbd|product|produit|item|untitled|no name|sans nom)\b/i.test(n)) return true; return false; };
// ── SUPP exclusion (verbatim from ingest tool — includes Shop Santé, ANS, BioX) ──
const SUPP = [/revolution nutrition/, /\bpvl\b/, /myprotein/, /canadian protein/, /basic supplements/, /body energy club/, /\ballmax\b/, /\bmutant\b/, /magnum nutraceuticals/, /ballistic/, /north coast naturals/, /believe supplements/, /optimum nutrition/, /dymatize/, /ghost lifestyle/, /kaizen/, /iron vegan/, /genuine health/, /\bprogressive\b/, /prairie naturals/, /sd pharmaceuticals/, /perfect sports/, /\bxpn\b/, /\bbsn\b/, /cellucor/, /\bvega\b/, /garden of life/, /now foods/, /jamieson/, /webber naturals/, /organika/, /ergogenics/, /natural factors/, /\bdiesel\b/, /yummy sports/, /tc nutrition/, /rivalus/, /\bmammoth\b/, /nutrabolics/, /hd muscle/, /beyond yourself/, /shop sant/, /ans performance/, /\bbiox\b/, /\bans\b/];
const isSuppBrand = (b: string) => { const x = (b || "").toLowerCase(); return SUPP.some((re) => re.test(x)); };
// ── canonKey (verbatim from ingest tool), returning recognized flag ──
const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
function canonKeyInfo(raw: string) {
  const b = strip(raw).trim().replace(/\s+/g, " "); const low = b.toLowerCase();
  const rule = (re: RegExp, name: string) => (re.test(low) ? name : null);
  const hit = rule(/kirkland/, "Kirkland Signature") || rule(/farm\s*boy/, "Farm Boy") || rule(/fresh\s*prep/, "Fresh Prep") ||
    rule(/president.?s choice|le choix du president|choix du president|^pc\b|^pc[\s\/]|pc organics?|pc biologique/, "President's Choice") ||
    rule(/compliments/, "Compliments") || rule(/great value/, "Great Value") || rule(/western family/, "Western Family") ||
    rule(/save.?on.?foods/, "Save-On-Foods") || rule(/no name|sans nom/, "No Name") || rule(/^t\s*&\s*t|^t&t/, "T&T") ||
    rule(/sobeys/, "Sobeys") || rule(/^selection\b|^selection/, "Selection") || rule(/only goodness/, "Only Goodness") ||
    rule(/^safeway/, "Safeway") || rule(/^metro\b/, "Metro") || rule(/^longos?\b/, "Longo's") ||
    rule(/your fresh market/, "Your Fresh Market") || rule(/^costco/, "Costco") || rule(/bob.?s red mill/, "Bob's Red Mill");
  if (hit) return { key: hit.toLowerCase(), display: hit, recognized: true };
  return { key: low.replace(/[^a-z0-9]/g, "") || low, display: b, recognized: false };
}

type Row = { barcode: string; product_name: string | null; display_name_en: string | null; brand: string | null; gorilla_score: number | null; nova_group: number | null; serving_size: string | null; ingredients_text: string | null; categories: string | null; nutrition_data: Nutriments | null; labels_tags: string[] | null };
const SEL = "barcode,product_name,display_name_en,brand,gorilla_score,nova_group,serving_size,ingredients_text,categories,nutrition_data,labels_tags";

async function curatedSet(): Promise<Set<string>> {
  const r = await fetch(`${URL}/rest/v1/curated_picks?select=barcode`, { headers: H });
  const j = await r.json() as { barcode: string }[];
  return new Set(j.map((c) => normBc(c.barcode)));
}
async function pullBand(scoreQs: string, curated: Set<string>): Promise<Row[]> {
  let from = 0; const page = 1000; const all: Row[] = [];
  for (;;) {
    const u = `${URL}/rest/v1/gorilla_product_cache?select=${SEL}&${FOOD}&${scoreQs}&brand=neq.&image_url=not.is.null&order=barcode.asc&limit=${page}&offset=${from}`;
    let rows: Row[] | null = null;
    for (let a = 0; a < 5; a++) { const r = await fetch(u, { headers: H }); const j = await r.json().catch(() => null); if (r.ok && Array.isArray(j)) { rows = j; break; } await new Promise((s) => setTimeout(s, 600 * (a + 1))); }
    if (!rows) throw new Error(`pull failed at ${from}`);
    all.push(...rows); if (rows.length < page) break; from += page;
  }
  return all.filter((p) => !isJunkBarcode(p.barcode) && !isGarbageName(p.product_name) && p.brand && p.brand.trim() && !isSuppBrand(p.brand) && !curated.has(normBc(p.barcode)));
}

// compact flag/reason string from live recompute
function reasons(p: Row): string {
  const nd = (p.nutrition_data ?? {}) as Nutriments;
  let cats: string[] = []; try { cats = JSON.parse(p.categories ?? "[]"); } catch {}
  const ctx = { servingSize: p.serving_size, novaGroup: p.nova_group, labelsTags: p.labels_tags, categoriesTags: cats, productName: p.product_name ?? "", additivesTags: null, ingredientsText: p.ingredients_text };
  let nf: string[] = [];
  try { nf = scoreNutrition(nd, ctx as any).flags; } catch {}
  const key = nf.filter((f) => /sugar|salt|sodium|saturated|calorie|NOVA|Incomplete/i.test(f)).map((f) => f.replace(/ — /g, " ").replace(/per 100g|per serving/g, "").replace(/\s+/g, " ").trim().slice(0, 46));
  let adds: string[] = [];
  try { adds = scoreAdditives(p.ingredients_text, null).detected.map((a: any) => a.name); } catch {}
  const addStr = adds.length ? `+${adds.length} additive${adds.length > 1 ? "s" : ""}: ${adds.slice(0, 3).join(", ")}${adds.length > 3 ? "…" : ""}` : (p.ingredients_text && p.ingredients_text.trim().length > 0 ? "no flagged additives" : "no ingredient list");
  return [key.slice(0, 3).join(" · "), addStr].filter(Boolean).join(" · ") || "—";
}

const esc = (s: string | null) => (s || "").replace(/\|/g, "/").replace(/\n/g, " ");
const dname = (p: Row) => esc(p.display_name_en ?? p.product_name).slice(0, 44);

type Brand = { display: string; recognized: boolean; items: Row[] };
function groupByBrand(rows: Row[]): Brand[] {
  const m = new Map<string, Brand>();
  for (const p of rows) { const ci = canonKeyInfo(p.brand!); if (!m.has(ci.key)) m.set(ci.key, { display: ci.display, recognized: ci.recognized, items: [] }); m.get(ci.key)!.items.push(p); }
  // sort brands: recognized first, then by count desc, then name; worst-first within brand
  return [...m.values()].map((b) => { b.items.sort((a, c) => (a.gorilla_score ?? 0) - (c.gorilla_score ?? 0) || a.barcode.localeCompare(c.barcode)); return b; })
    .sort((a, b) => Number(b.recognized) - Number(a.recognized) || b.items.length - a.items.length || a.display.localeCompare(b.display));
}
const near = (s: number | null) => (s == null ? "" : (Math.abs(s - 45) <= 2 || Math.abs(s - 75) <= 2) ? " ⚠band-edge" : "");

function itemSheet(title: string, subtitle: string, brands: Brand[]): string {
  const PERBRAND = 30;
  let md = `# ${title}\n\n_${subtitle} · generated ${DATE} against CURRENT post-fix scores · read-only, no DB writes._\n\n`;
  const total = brands.reduce((n, b) => n + b.items.length, 0);
  md += `**${total} candidate products across ${brands.length} brands** (recognizable brands first, worst-score-first within each brand). ⚠band-edge = within 2 pts of a tier cutoff (45/75).\n\n`;
  const rec = brands.filter((b) => b.recognized), rest = brands.filter((b) => !b.recognized);
  const section = (bs: Brand[]) => {
    let s = "";
    for (const b of bs) {
      s += `\n### ${esc(b.display)}${b.recognized ? " ★" : ""} — ${b.items.length} item${b.items.length > 1 ? "s" : ""}\n\n`;
      s += `| score | product | barcode | flags / reasons |\n|--:|---|---|---|\n`;
      for (const p of b.items.slice(0, PERBRAND)) s += `| ${p.gorilla_score}${near(p.gorilla_score)} | ${dname(p)} | ${p.barcode} | ${reasons(p)} |\n`;
      if (b.items.length > PERBRAND) s += `| … | _(+${b.items.length - PERBRAND} more ${esc(b.display)} SKUs)_ | | |\n`;
    }
    return s;
  };
  md += `\n## ★ RECOGNIZABLE BRANDS (${rec.length} brands, ${rec.reduce((n, b) => n + b.items.length, 0)} items) — review these first\n` + (rec.length ? section(rec) : "\n_(none)_\n");
  md += `\n\n---\n## OTHER BRANDS (${rest.length} brands, ${rest.reduce((n, b) => n + b.items.length, 0)} items)\n` + section(rest);
  return md;
}

function shortlist(brands: Brand[], n: number): Row[] {
  const rec = brands.filter((b) => b.recognized).flatMap((b) => b.items);
  const big = brands.filter((b) => !b.recognized && b.items.length >= 5).flatMap((b) => b.items);
  const pool = [...rec, ...big];
  return pool.sort((a, b) => (a.gorilla_score ?? 0) - (b.gorilla_score ?? 0)).slice(0, n);
}

async function main() {
  const curated = await curatedSet();
  console.log(`curated exclusion set: ${curated.size}`);
  const bands = {
    approved: await pullBand("gorilla_score=gte.75", curated),
    cheat: await pullBand("gorilla_score=gte.45&gorilla_score=lte.74", curated),
    avoid: await pullBand("gorilla_score=lt.45", curated),
  };
  console.log(`filtered candidates — approved ${bands.approved.length} | cheat ${bands.cheat.length} | avoid ${bands.avoid.length}`);
  const gA = groupByBrand(bands.approved), gC = groupByBrand(bands.cheat), gV = groupByBrand(bands.avoid);

  // 1. by-brand summary
  const brandTable = (bs: Brand[]) => { let t = `| # | Brand | ★ | Count | Score range | Sample products |\n|--:|---|:-:|--:|---|---|\n`; bs.forEach((b, i) => { const sc = b.items.map((x) => x.gorilla_score ?? 0); t += `| ${i + 1} | ${esc(b.display)} | ${b.recognized ? "★" : ""} | ${b.items.length} | ${Math.min(...sc)}-${Math.max(...sc)} | ${b.items.slice(0, 3).map((x) => dname(x)).join("; ")} |\n`; }); return t; };
  let byBrand = `# Curation Review — BY BRAND (allowlist source)\n\n_Generated ${DATE} · CURRENT post-fix scores · food only, brand+image present, junk+SUPP filtered, already-curated (232) excluded · ★=canonKey-recognized brand._\n\n`;
  byBrand += `## Summary\n- **Approved (≥75):** ${bands.approved.length} products / ${gA.length} brands (${gA.filter((b) => b.recognized).length} recognizable)\n- **Cheat (45–74):** ${bands.cheat.length} products / ${gC.length} brands (${gC.filter((b) => b.recognized).length} recognizable)\n- **Avoid (<45):** ${bands.avoid.length} products / ${gV.length} brands (${gV.filter((b) => b.recognized).length} recognizable)\n\n`;
  byBrand += `## CHEAT band (45–74) — ${gC.length} brands\n\n` + brandTable(gC) + `\n## AVOID band (<45) — ${gV.length} brands\n\n` + brandTable(gV) + `\n## APPROVED band (≥75, reference) — ${gA.length} brands\n\n` + brandTable(gA);
  writeFileSync("data/curation-review-by-brand.md", byBrand);

  // 2/3. per-item cheat + avoid
  writeFileSync("data/curation-review-cheat.md", itemSheet("Curation Review — CHEAT candidates (45–74)", "NEW cheat-band food not yet in curated_picks", gC));
  writeFileSync("data/curation-review-avoid.md", itemSheet("Curation Review — AVOID candidates (<45)", "NEW avoid-band food not yet in curated_picks", gV));
  // 4. approved reference (lower priority)
  writeFileSync("data/curation-review-top143.md", itemSheet("Curation Review — APPROVED candidates (≥75, reference)", "NEW approved-band food not yet curated — reference/awareness only (Approved already well-populated)", gA));

  // 5. allowlist proposal = quick-start shortlists
  const slC = shortlist(gC, 20), slV = shortlist(gV, 20), slA = shortlist(gA, 20);
  const slTable = (rows: Row[]) => { let t = `| score | brand | product | barcode | flags |\n|--:|---|---|---|---|\n`; for (const p of rows) t += `| ${p.gorilla_score}${near(p.gorilla_score)} | ${esc(p.brand).slice(0, 20)} | ${dname(p)} | ${p.barcode} | ${reasons(p)} |\n`; return t; };
  let prop = `# Curation Allowlist Proposal — QUICK-START SHORTLISTS\n\n_Generated ${DATE} · CURRENT post-fix scores. Top recognizable-brand candidates per band (worst-score-first) to scan before the full sheets. Hand-pick barcodes → feed to scripts/ingest-curated-picks.mjs._\n\n`;
  prop += `## Counts (new, not-yet-curated candidates)\n- Cheat (45–74): ${bands.cheat.length} products / ${gC.length} brands\n- Avoid (<45): ${bands.avoid.length} products / ${gV.length} brands\n- Approved (≥75, ref): ${bands.approved.length} products / ${gA.length} brands\n\n`;
  prop += `## ⚡ CHEAT shortlist — top ${slC.length} recognizable, worst-first\n\n` + slTable(slC) + `\n## ⚡ AVOID shortlist — top ${slV.length} recognizable, worst-first\n\n` + slTable(slV) + `\n## ⚡ APPROVED shortlist — top ${slA.length} recognizable (reference)\n\n` + slTable(slA);
  writeFileSync("data/curation-allowlist-proposal.md", prop);

  console.log("\nWROTE:");
  for (const f of ["curation-review-by-brand", "curation-review-cheat", "curation-review-avoid", "curation-review-top143", "curation-allowlist-proposal"]) console.log(`  data/${f}.md`);
  console.log("\nQUICK-START (top recognizable, worst-first):");
  console.log("  CHEAT:", slC.slice(0, 6).map((p) => `${p.gorilla_score} ${(p.brand ?? "").slice(0, 14)} ${dname(p).slice(0, 22)}`).join(" | "));
  console.log("  AVOID:", slV.slice(0, 6).map((p) => `${p.gorilla_score} ${(p.brand ?? "").slice(0, 14)} ${dname(p).slice(0, 22)}`).join(" | "));
}
main();
