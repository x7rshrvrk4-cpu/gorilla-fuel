/**
 * RECOMPUTE AFFECTED — re-scores ONLY the cache rows touched by this session's two
 * score-LOWERING fixes so the stored gorilla_score matches live logic:
 *   • whole-food disqualifier (7d892b3): name-branch rows that flipped isWholeFood
 *     true→false (sodas, candy, jams, pierogies, French teas).
 *   • refined-grain NOVA override (23cc553): durum/semolina/white-grain rows.
 * Unlike recompute-cache.ts (produce pass, RISE-only), this writes DOWNWARD
 * corrections. Curated (gate-pinned) rows are skipped; alcohol/beauty/supplement
 * excluded. Writes ONLY score fields — never product_name / is_alcohol / nutrition.
 *
 *   npx tsx scripts/recompute-affected.ts            # DRY-RUN (default): report, write NOTHING
 *   npx tsx scripts/recompute-affected.ts --write    # persist gorilla_score + score_grade
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { writeFileSync } from "fs";
import { randomUUID } from "node:crypto";
import { computeScore, isWholeFood, type Nutriments } from "../app/scan/lib/scoring";
import { applyScoringGate } from "../app/scan/lib/curatedScores";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";
// One id per run — groups every correction row this pass writes (audit "batch").
const BATCH_ID = randomUUID();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
const BATCH = 1000;
if (!URL || !KEY) { console.error("Missing Supabase env vars — aborting."); process.exit(1); }
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false&gorilla_score=not.is.null";
const SELECT = "barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score,score_grade";

type Row = { barcode: string; product_name: string|null; brand: string|null; categories: string|null; labels_tags: string[]|null; ingredients_text: string|null; nutrition_data: Nutriments|null; nova_group: number|null; serving_size: string|null; gorilla_score: number|null; score_grade: string|null };

// ── Replicas for classification only (NOT scoring) ──
const asNova = (v: number|undefined) => (v===1||v===2||v===3||v===4) ? v : null;
const WHOLE_TAGS = new Set(["en:fruits","en:vegetables","en:fresh-fruits","en:fresh-vegetables","en:frozen-fruits","en:frozen-vegetables","en:frozen-berries","en:fresh-berries","en:legumes","en:berries","en:blueberries","en:strawberries","en:raspberries","en:blackberries","en:cranberries","en:spinach","en:broccoli","en:cauliflower","en:kale","en:carrots","en:peas","en:green-beans","en:edamame","en:mangoes","en:pineapples","en:peaches","en:cherries","en:leafy-vegetables","en:root-vegetables"]);
const PROC_CAT = /\ben:(juices|fruit-juices|fruit-based-snacks|fruit-based-beverages|candied-fruits|candied-nuts|dried-fruits|sweetened-dried-fruits|vegetable-chips|chips|crisps|snacks|sweet-snacks|salty-snacks|desserts|sauces|jams|fruit-compotes|smoothies|sodas|sugar|confectioneries|ice-cream)\b|\b(candied|honey[\s-]?roasted|roasted[\s-]and[\s-]salted|salted|sweetened|seasoned|flavou?red|caramel|chocolate[\s-]?coated|sugar[\s-]?coated|glazed)\b/;
const JUICE = /\b(jus|juice|nectar|smoothie|boisson|drink|limonade|lemonade|punch)\b/i;
const WF_NAME = /\b(blueberr|bleuet|strawberr|fraise|raspberr|framboise|blackberr|m[ûu]re|cranberr|canneberge|cherr|cerise|grape|raisin|peach|p[êe]che|pear|poire|apple|pomme|banana|banane|mango|mangue|pineapple|ananas|melon|watermelon|spinach|[ée]pinard|broccoli|brocoli|cauliflower|chou-fleur|kale|carrot|carotte|green bean|haricot|edamame|asparagus|asperge|zucchini|courgette|cucumber|concombre|tomato|tomate|lentil|lentille|chickpea|pois chiche|black bean|kidney bean|avocado|avocat|betterave|brussels sprout|sweet potato|patate douce)/i;
// OLD isWholeFood (pre-7d892b3): branch 3 WITHOUT the processed-name disqualifier.
function isWholeFoodOld(n: Nutriments, novaGroup: number|null, cats: string[], labels: string[], name: string): boolean {
  const nm = (name ?? "").toLowerCase();
  if (JUICE.test(nm)) return false;
  if (asNova(novaGroup ?? undefined) === 1) return true;
  const tagList = [...cats, ...labels].map(t => String(t).trim().toLowerCase());
  const processed = PROC_CAT.test(tagList.join(" "));
  if (!processed && tagList.some(t => WHOLE_TAGS.has(t))) {
    const s = n.sugars_100g; const salt = n.salt_100g ?? 0;
    if (!(typeof s === "number" && s > 12) && !(salt > 0.5)) return true;
  }
  if (WF_NAME.test(nm) && !processed) {
    const protein = n.proteins_100g ?? 0, satFat = n["saturated-fat_100g"] ?? 0, salt = n.salt_100g ?? 0, s = n.sugars_100g;
    if (protein <= 5 && satFat <= 0.5 && salt <= 0.2 && typeof s === "number" && s <= 25) return true;
  }
  return false;
}
// Refined-grain replica (mirror of scoring.ts isRefinedGrain).
const stripD = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const REFINED = /\bdurum|semolina|semoule|semola|enriched|enrichi|white flour|wheat flour|farine de ble|farine blanche|white rice|riz blanc|bleached|blanchie/;
const WHOLE_LEG = /whole[\s-]?wheat|wholewheat|whole[\s-]?grain|wholegrain|whole[\s-]?meal|ble entier|grains? entiers?|\bcomplet|rolled oat|\boats?\b|\bavoine|brown rice|riz brun|chickpea|pois chiche|\blentil|lentille|pea protein|\bpeas?\b|\bpois\b|quinoa|edamame|black bean|\bmung|\bkamut\b|\bkhorasan\b|\bspelt\b|epeautre|\bseigle\b|\brye\b|\bsoba\b|buckwheat|sarrasin|multi[\s-]?grain|\bmillet\b|\bteff\b|amaranth|\bfarro\b|einkorn|ancient grains?/;
const REFINED_CATS = new Set(["en:pastas","en:white-rice","en:white-rices"]);
function isRefinedGrain(ing: string|null, cats: string[], name: string|null): boolean {
  const hay = stripD(`${name ?? ""} ${ing ?? ""}`.toLowerCase());
  if (WHOLE_LEG.test(hay)) return false;
  if (REFINED.test(stripD((ing ?? "").toLowerCase()))) return true;
  return cats.map(c => c.toLowerCase()).some(c => REFINED_CATS.has(c));
}

const PROTECTED = new Set(["14331688","8021115293271","0065912000203","0623067160564","0683744550040","0818512012097","0859670001035","36335558","0060383104993","0628451868729","0813616020012","0064200130738","8332669642065"]);
const BENCH = new Set(["0028400090308","0044000030131","0069000019832","0069000008947","0062100012284","0028400590679","0028400090155","0072030007972","0817939020025","0602652179864","0041570050000","0069000019849"]);

async function main() {
  console.log(`♻️  Recompute affected — ${DRY ? "DRY-RUN (no writes)" : "WRITE"} | algo ${ALGO_VERSION}\n`);
  const disq: any[] = [], refined: any[] = [], otherDrift: any[] = [];
  let scanned = 0, curated = 0, errors = 0, protectedSeen: string[] = [], benchSeen: string[] = [];
  for (let off = 0; ; off += BATCH) {
    const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&${FOOD}&order=barcode.asc&offset=${off}&limit=${BATCH}`, { headers });
    if (!res.ok) { console.error(`Fetch fail ${res.status}`); process.exit(1); }
    const rows: Row[] = await res.json();
    if (rows.length === 0) break;
    for (const row of rows) {
      if (!row.nutrition_data || row.gorilla_score === null) continue;
      scanned++;
      let cats: string[] = []; try { cats = JSON.parse(row.categories ?? "[]"); } catch {}
      const ctx = { servingSize: row.serving_size, novaGroup: row.nova_group, labelsTags: row.labels_tags, categoriesTags: cats, productName: row.product_name ?? "", additivesTags: null };
      let outcome: any;
      try {
        const base = computeScore(row.nutrition_data, row.ingredients_text, ctx);
        outcome = applyScoringGate(base.finalScore, { barcode: row.barcode, productName: row.product_name ?? "", brand: row.brand, ingredientsText: row.ingredients_text, categoriesTags: cats, novaGroup: row.nova_group ?? base.novaGroup, nutriments: row.nutrition_data });
      } catch (e) { errors++; continue; }
      if (outcome.scoreSource === "gorilla-verified") { curated++; continue; }
      if (outcome.score === row.gorilla_score) continue; // unchanged
      // classify cause
      const oldWhole = isWholeFoodOld(row.nutrition_data, row.nova_group, cats, row.labels_tags ?? [], row.product_name ?? "");
      const newWhole = isWholeFood(row.nutrition_data, ctx);
      const rec = { bc: row.barcode, name: row.product_name ?? "?", brand: row.brand ?? "", before: row.gorilla_score, after: outcome.score, grade: outcome.grade, d: outcome.score - row.gorilla_score, reason: "recompute-affected" };
      let group = "other";
      if (oldWhole && !newWhole) { rec.reason = "recompute-affected: whole-food data-gap disqualified"; disq.push(rec); group = "disq"; }
      else if (isRefinedGrain(row.ingredients_text, cats, row.product_name)) { rec.reason = "recompute-affected: refined-grain NOVA override"; refined.push(rec); group = "refined"; }
      else otherDrift.push(rec);
      if (PROTECTED.has(row.barcode)) protectedSeen.push(`${row.barcode} ${row.product_name} ${row.gorilla_score}->${outcome.score} [${group}]`);
      if (BENCH.has(row.barcode)) benchSeen.push(`${row.barcode} ${row.gorilla_score}->${outcome.score}`);
    }
    if (rows.length < BATCH) break;
  }

  const summ = (label: string, arr: any[]) => {
    const drops = arr.map(r => r.d);
    const median = drops.length ? drops.slice().sort((a,b)=>a-b)[Math.floor(drops.length/2)] : 0;
    console.log(`\n===== ${label}: ${arr.length} rows | median Δ ${median} =====`);
    arr.sort((a,b)=>(b.before-a.before)||(a.d-b.d));
    for (const r of arr.slice(0, 60)) console.log(`  ${String(r.before).padStart(3)}->${String(r.after).padStart(3)} (${r.d>0?"+":""}${r.d}) [${r.grade}]  ${(r.brand).slice(0,16)} | ${r.name.slice(0,42)}  ${r.bc}`);
    if (arr.length > 60) console.log(`  …(+${arr.length-60} more)`);
  };
  summ("GROUP 1 — WHOLE-FOOD DISQUALIFIER flips", disq);
  summ("GROUP 2 — REFINED-GRAIN override", refined);

  console.log(`\n===== SCANNED ${scanned} | curated-skipped ${curated} | errors ${errors} =====`);
  console.log(`disqualifier: ${disq.length} | refined: ${refined.length} | (other unrelated drift, NOT in scope: ${otherDrift.length})`);

  // /top impact
  const top = [...disq, ...refined].filter(r => r.before >= 75).sort((a,b)=>b.before-a.before);
  console.log(`\n===== /top IMPACT — rows currently >=75 that drop: ${top.length} =====`);
  for (const r of top) console.log(`  ${r.before}->${r.after}  ${(r.brand).slice(0,16)} | ${r.name.slice(0,44)}  ${r.bc}`);

  console.log(`\n===== PRODUCE SAFETY — protected rows in change set (expect 0): ${protectedSeen.length} =====`);
  protectedSeen.forEach(s => console.log("  ⚠ " + s));
  console.log(`===== BENCHMARK SAFETY — benchmarks in change set (expect 0): ${benchSeen.length} =====`);
  benchSeen.forEach(s => console.log("  ⚠ " + s));

  // ── Targeted verification (prints regardless of change) ──
  async function verify(label: string, bcs: string[]) {
    console.log(`\n===== VERIFY — ${label} (cached → recompute | refined?) =====`);
    for (const bc of bcs) {
      const r = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${bc}&select=${SELECT}`, { headers });
      const row: Row = (await r.json())[0];
      if (!row || !row.nutrition_data) { console.log(`  ${bc}  (not in cache / no nutrition)`); continue; }
      let cats: string[] = []; try { cats = JSON.parse(row.categories ?? "[]"); } catch {}
      const ctx = { servingSize: row.serving_size, novaGroup: row.nova_group, labelsTags: row.labels_tags, categoriesTags: cats, productName: row.product_name ?? "", additivesTags: null };
      const base = computeScore(row.nutrition_data, row.ingredients_text, ctx);
      const out = applyScoringGate(base.finalScore, { barcode: row.barcode, productName: row.product_name ?? "", brand: row.brand, ingredientsText: row.ingredients_text, categoriesTags: cats, novaGroup: row.nova_group ?? base.novaGroup, nutriments: row.nutrition_data });
      const ref = isRefinedGrain(row.ingredients_text, cats, row.product_name);
      const mark = row.gorilla_score === out.score ? "UNCHANGED" : `${row.gorilla_score}->${out.score}`;
      console.log(`  ${(row.product_name ?? "?").slice(0,42).padEnd(42)} ${bc}  ${String(row.gorilla_score).padStart(3)} -> ${String(out.score).padStart(3)}  refined=${ref?"Y":"n"}  ${mark}`);
    }
  }
  await verify("WHOLE-GRAIN (must NOT drop now, refined=n)", ["0024182113501","0835934002017","0837328003020","0876681001267","0083747003626","0063004011953"]);
  await verify("NON-GRAIN wheat-flour ingredient (processed)", ["0063211000160","0061202009055","0057316145239","0063100422172","0069299605259","0066200005023","0623682124880","0060383119300","0066701004938"]);
  await verify("TRUE REFINED (must still drop, refined=Y)", ["0627735260099","0076808011036","0064200130790","0068062021517","0064821122808","5000354926662"]);
  await verify("LEGUME/BROWN-RICE (must stay protected, refined=n)", ["0628451868729","0064200130738","8332669642065","0813616020481"]);

  if (!DRY) {
    console.log("\n──── WRITING (disqualifier + refined only) ────");
    let ok=0, fail=0, logok=0;
    for (const r of [...disq, ...refined]) {
      const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(r.bc)}`, { method:"PATCH", headers, body: JSON.stringify({ gorilla_score: r.after, score_grade: r.grade, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }) });
      if (res.ok) ok++; else { fail++; console.error(`  PATCH FAIL ${r.bc}: ${res.status}`); continue; }
      const lg = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, { method:"POST", headers, body: JSON.stringify({ product_name: r.name, barcode: r.bc, old_score: r.before, new_score: r.after, correction_reason: r.reason, grade_after: r.grade, algorithm_version: ALGO_VERSION, batch_id: BATCH_ID }) }).catch(()=>null);
      if (lg && lg.ok) logok++;
    }
    console.log(`written ${ok}, patchFails ${fail}, corrections-logged ${logok}`);
  }
  writeFileSync("recompute-affected-dryrun.txt", [...disq, ...refined].map(r=>`${r.bc}\t${r.before}\t${r.after}\t${r.name}`).join("\n"), "utf8");
  console.log(`\nMODE: ${DRY ? "DRY-RUN — nothing written." : "WRITE complete."}`);
}
main();
