/**
 * TARGETED recompute — oils (Fix C pure-oil exemption) + trans-fat-cap-released
 * rows (Fix A). Persists current-logic scores to the cache for this small pool so
 * /top + listings show honest oil scores. Includes cached=null rows (first score).
 *   npx tsx scripts/recompute-oils.ts          # DRY-RUN (default)
 *   npx tsx scripts/recompute-oils.ts --write   # persist gorilla_score/score_grade (+scored_at, algorithm_version)
 * Writes ONLY score fields. Never product_name/is_alcohol/nutrition/scanner. Skips curated.
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
if (!URL || !KEY) { console.error("Missing Supabase env"); process.exit(1); }
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false";
const SELECT = "barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score,score_grade";
const OR = "or=(product_name.ilike.*oil*,product_name.ilike.*huile*,categories.ilike.*oil*,ingredients_text.ilike.*trans*fat*)";
type Row = any;
const BENCH = new Set(["0028400090308","0044000030131","0069000019832","0069000008947","0062100012284","0028400590679","0028400090155","0072030007972","0817939020025","0602652179864","0041570050000","0069000019849"]);
// Fix C pure-oil detector (replica, for classification)
const OIL_NAME=/\b(olive|canola|avocado|grape[\s-]?seed|corn|sunflower|safflower|sesame|coconut|peanut|groundnut|vegetable|soybean|soya|walnut|flax(?:seed)?|rice[\s-]?bran)\s+oils?\b/i;
const OIL_FR=/\bhuile\s+(?:d['e]\s*)?(?:olive|canola|avocat|p[ée]pins|ma[iï]s|tournesol|s[ée]same|coco|arachide|v[ée]g[ée]tale|soja|carthame|noix|lin)\b/i;
const OIL_CAT=/\ben:(?:olive-oils?|sunflower-oils?|vegetable-oils?|coconut-oils?|rapeseed-oils?|canola-oils?|corn-oils?|sesame-oils?|avocado-oils?|grapeseed-oils?|peanut-oils?|cooking-oils?|oils)\b/;
const OIL_EXCL=/margarine|mayo|mayonnaise|dressing|vinaigrette|tartinade|spread|\bbutter\b|buttery|butter[\s-]?style|beurre|spray|flavou?red|infused|truffle|garlic|chil(?:i|li)|\bherb|lemon|basil|spiced|sauce|\bdip\b|blend|\bwith\b|&|\+/i;
function isPureOil(row:Row){ const nm=(row.product_name??"").toLowerCase(); let c:string[]=[];try{c=JSON.parse(row.categories??"[]")}catch{} const cj=c.map((t:string)=>String(t).toLowerCase()).join(" ");
  const kcal=row.nutrition_data?.["energy-kcal_100g"]??0, prot=row.nutrition_data?.proteins_100g??0, sat=row.nutrition_data?.["saturated-fat_100g"]??0;
  return (OIL_NAME.test(nm)||OIL_FR.test(nm)||OIL_CAT.test(cj)) && !OIL_EXCL.test(`${nm} ${cj}`) && kcal>=700 && prot<=1 && sat<=25; }
const transClaim=(ing:string)=> /trans\s*fat/i.test(ing||"") && !/partially\s*hydrogenated/i.test(ing||"");
const oilCatOnly=(row:Row)=>{ let c:string[]=[];try{c=JSON.parse(row.categories??"[]")}catch{} return OIL_CAT.test(c.map((t:string)=>String(t).toLowerCase()).join(" ")); };
function rc(row:Row){ let cats:string[]=[];try{cats=JSON.parse(row.categories??"[]")}catch{}
  const ctx={servingSize:row.serving_size,novaGroup:row.nova_group,labelsTags:row.labels_tags,categoriesTags:cats,productName:row.product_name??"",brand:row.brand??null,additivesTags:null};
  const base=computeScore(row.nutrition_data as Nutriments,row.ingredients_text,ctx);
  const g=applyScoringGate(base.finalScore,{barcode:row.barcode,productName:row.product_name??"",brand:row.brand,ingredientsText:row.ingredients_text,categoriesTags:cats,novaGroup:row.nova_group??base.novaGroup,nutriments:row.nutrition_data});
  return {score:g.score,grade:g.grade,src:g.scoreSource}; }

async function main(){
  console.log(`🛢️  Recompute oils — ${DRY?"DRY-RUN":"WRITE"} | algo ${ALGO_VERSION}\n`);
  const rows:Row[]=[];
  for(let off=0;;off+=1000){ const r=await fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&${FOOD}&${OR}&order=barcode.asc&offset=${off}&limit=1000`,{headers}); if(!r.ok){console.error("fetch",r.status,await r.text().catch(()=> ""));process.exit(1);} const j=await r.json(); if(!Array.isArray(j)||j.length===0)break; rows.push(...j); if(j.length<1000)break; }
  console.log(`candidate net (oil/huile/oil-cat/trans-fat text): ${rows.length}`);

  let curated=0, errors=0;
  const set:any[]=[];
  for(const row of rows){ if(!row.nutrition_data)continue;
    const oil=isPureOil(row), tc=transClaim(row.ingredients_text??""), oc=oilCatOnly(row);
    if(!(oil||tc||oc))continue;                 // scope: pure-oil OR trans-claim OR oil-category
    let o:any; try{o=rc(row);}catch{errors++;continue;}
    if(o.src==="gorilla-verified"){curated++;continue;}
    const cached=row.gorilla_score;
    set.push({ bc:row.barcode, name:row.product_name??"", brand:row.brand??"", cached, after:o.score, grade:o.grade,
      changed: cached!==o.score, kind: oil?"oil":(tc?"trans-claim":"oil-cat"),
      sat: row.nutrition_data?.["saturated-fat_100g"], oil, tc });
  }
  const stale=set.filter(s=>s.changed);
  const nullScored=set.filter(s=>s.cached===null);
  console.log(`in scope: ${set.length} | stale (cached≠recompute): ${stale.length} | cached=null (first score): ${nullScored.length} | curated-skipped ${curated} | errors ${errors}`);
  console.log(`  by kind: oil=${set.filter(s=>s.oil).length} | trans-claim=${set.filter(s=>s.tc&&!s.oil).length} | oil-cat-only=${set.filter(s=>!s.oil&&!s.tc).length}`);

  // diagnosis oils
  const diag = new Set(["0627735270104","0062356541033","0688054002128","0067800002061","8425402795538","6191509911387","6191509910441","0060383038465","0688054001541","0688054001695"]);
  console.log(`\n=== DIAGNOSIS OILS (cached -> recompute) ===`);
  set.filter(s=>diag.has(s.bc)).forEach(s=>console.log(`  ${String(s.cached).padStart(4)} -> ${String(s.after).padStart(3)}  satfat=${String(s.sat).padStart(4)}  ${(s.brand||"").slice(0,14)} | ${(s.name||"").slice(0,30)}  ${s.bc}`));

  console.log(`\n=== ALL CHANGED (sorted by after desc), ${stale.length} ===`);
  stale.sort((a,b)=>b.after-a.after).forEach(s=>console.log(`  ${String(s.cached).padStart(4)} -> ${String(s.after).padStart(3)} [${s.kind}] satfat=${String(s.sat).padStart(4)}  ${(s.brand||"").slice(0,14)} | ${(s.name||"").slice(0,34)}  ${s.bc}`));

  // SAFETY
  console.log(`\n=== SAFETY ===`);
  const coconutHigh = set.filter(s=> /coconut|coco/i.test(s.name) || (typeof s.sat==="number"&&s.sat>=50));
  console.log(`  coconut/high-satfat (>=50) — must stay LOW:`);
  coconutHigh.sort((a,b)=>b.after-a.after).forEach(s=>console.log(`     after=${String(s.after).padStart(3)} satfat=${s.sat} ${(s.name||"").slice(0,34)} ${s.bc} ${s.after>=60?"  ⚠ HIGH?":""}`));
  // non-oil safety: any row in scope via oil/oil-cat that looks like margarine/mayo/dressing (should be excluded → only enter via trans-claim)
  const suspectNonOil = set.filter(s=> s.oil && /margarine|mayo|dressing|vinaigrette|spread|butter|sauce/i.test(s.name));
  console.log(`  pure-oil detector catching margarine/mayo/dressing/etc (expect 0): ${suspectNonOil.length}`);
  suspectNonOil.forEach(s=>console.log(`     ⚠ ${(s.name||"")} ${s.bc}`));
  // benchmarks
  console.log(`  benchmarks in set (expect 0): ${set.filter(s=>BENCH.has(s.bc)).length}`);

  // trans-claim released
  console.log(`\n=== TRANS-FAT-CAP RELEASED (Fix A) in scope ===`);
  set.filter(s=>s.tc && s.changed).forEach(s=>console.log(`  ${String(s.cached).padStart(4)} -> ${String(s.after).padStart(3)}  ${(s.name||"").slice(0,40)}  ${s.bc}`));

  if(DRY){ console.log(`\nMODE: DRY-RUN — nothing written. patchFails preview: 0 (no PATCH attempted).`); writeFileSync("recompute-oils-dryrun.tsv", stale.map(s=>`${s.bc}\t${s.cached}\t${s.after}\t${s.name}`).join("\n"),"utf8"); return; }

  // write
  const SVC=process.env.SUPABASE_SERVICE_ROLE_KEY; if(!SVC){console.error("--write needs service key");process.exit(1);}
  const wH={apikey:SVC,Authorization:`Bearer ${SVC}`,"Content-Type":"application/json",Prefer:"return=minimal"};
  let ok=0,fail=0,logok=0;
  for(const s of stale){ const p=await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(s.bc)}`,{method:"PATCH",headers:wH,body:JSON.stringify({gorilla_score:s.after,score_grade:s.grade,scored_at:new Date().toISOString(),algorithm_version:ALGO_VERSION})}); if(p.ok)ok++; else {fail++; if(fail<=10)console.error(`  FAIL ${s.bc} ${p.status}`); continue;}
    const lg=await fetch(`${URL}/rest/v1/gorilla_score_corrections`,{method:"POST",headers:wH,body:JSON.stringify({product_name:s.name,barcode:s.bc,old_score:s.cached,new_score:s.after,correction_reason:`recompute-oils (${s.kind})`,grade_after:s.grade,algorithm_version:ALGO_VERSION,batch_id:BATCH_ID})}).catch(()=>null);
    if(lg&&lg.ok)logok++; }
  console.log(`written ${ok}, patchFails ${fail}, corrections-logged ${logok}`);
  writeFileSync("recompute-oils-write-log.tsv", stale.map(s=>`${s.bc}\t${s.cached}\t${s.after}\t${s.name}`).join("\n"),"utf8");
}
main();
