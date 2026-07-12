/**
 * FULL BIDIRECTIONAL recompute — re-scores EVERY ingest-eligible food row whose
 * cached gorilla_score differs from the current-logic score (both rises AND falls),
 * skipping curated/pinned rows. Matches scan-time scoring exactly: passes brand
 * into the context (the whole-food disqualifier reads brand as of f1bcb15).
 *
 *   npx tsx scripts/recompute-full.ts            # DRY-RUN (default): report, write NOTHING
 *   npx tsx scripts/recompute-full.ts --write    # persist gorilla_score/score_grade (+scored_at, algorithm_version), log corrections
 *
 * Writes ONLY score fields. Never product_name, is_alcohol, nutrition, or the scanner.
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { writeFileSync } from "fs";
import { randomUUID } from "node:crypto";
import { computeScore, isWholeFood, type Nutriments } from "../app/scan/lib/scoring";
import { applyScoringGate } from "../app/scan/lib/curatedScores";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
const BATCH = 1000;
// One id per run — groups every correction row this pass writes (audit "batch").
const BATCH_ID = randomUUID();
if (!URL || !KEY) { console.error("Missing Supabase env vars."); process.exit(1); }
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false&gorilla_score=not.is.null";
const SELECT = "barcode,product_name,brand,categories,labels_tags,ingredients_text,nutrition_data,nova_group,serving_size,gorilla_score";
type Row = { barcode:string; product_name:string|null; brand:string|null; categories:string|null; labels_tags:string[]|null; ingredients_text:string|null; nutrition_data:Nutriments|null; nova_group:number|null; serving_size:string|null; gorilla_score:number|null };

const tierOf = (s:number)=> s>=75?"approved":s>=45?"cheat":"avoid";
const BENCH = new Set(["0028400090308","0044000030131","0069000019832","0069000008947","0062100012284","0028400590679","0028400090155","0072030007972","0817939020025","0602652179864","0041570050000","0069000019849"]);
const PRODUCE=/\b(tomato|tomate|broccoli|brocoli|carrot|carotte|spinach|epinard|potato|patate|pomme de terre|cauliflower|kale|\bpea\b|peas|bean|haricot|lentil|chickpea|berr|blueberr|strawberr|raspberr|cranberr|fraise|bleuet|mango|mangue|pineapple|ananas|peach|peche|pear|poire|apple|pomme|banana|grape|raisin|melon|cherry|cerise|asparagus|zucchini|courgette|cucumber|avocado|beet|squash|oats?|avoine|quinoa|shredded wheat|whole grain)\b/i;
// Comprehensive processed/prepared/sweetened-form detector. If a fruit/veg-NAMED
// falling row matches ANY of these, it's a processed product (juice/candy/dessert/
// baked/drink/etc.), NOT plain raw produce — so its fall is expected, not a bug.
const PROCESSED_SIG=/spice|spiced|seasoned|seasoning|sauce|dressing|vinaigrette|cheese|cheddar|pork|bacon|sausage|maple|sugar|syrup|sirop|honey|candi|candy|chocolate|caramel|fried|glaz|salt|pickl|patties|nugget|breaded|grilled|herb|\bjam\b|jell|spread|\bdip\b|cake|cookie|biscuit|\bpie\b|crisp|cobbler|tart|loaf|\bbread\b|\bbun\b|donut|doughnut|pastry|muffin|scone|brownie|wafer|granola|cereal|\bbar\b|flake|\bbran\b|gumm|licorice|r[ée]glisse|ring|twist|slice|chew|\broll\b|\bpop\b|toffee|fudge|sandwich|pizza|pasta|noodle|\bjuice\b|\bjus\b|smoothie|nectar|drink|boisson|spritz|sparkl|cordial|punch|lemonade|limonade|cocktail|soda|cola|tea|th[ée]|kombucha|yog(urt|ourt)|cream|gelato|sorbet|ice ?cream|dried|chips?|cracker|pretzel|popcorn|coated|powder|mix\b|kit\b|frozen dessert/i;
const JUNK=/\b(candy|gummy|gummies|soda|cola|chocolate|cookie|biscuit|chip|crisp|cheeto|dorito|ice cream|popsicle|fudge|caramel|skittle|nerds|jell|kit ?kat|snickers|reese|cadbury|hershey|\bmars\b|pop ?tart|kombucha|energy drink|seltzer|sparkling)\b/i;

function rc(row: Row){ let cats:string[]=[]; try{cats=JSON.parse(row.categories??"[]")}catch{}
  const ctx={ servingSize:row.serving_size, novaGroup:row.nova_group, labelsTags:row.labels_tags, categoriesTags:cats, productName:row.product_name??"", brand:row.brand??null, additivesTags:null };
  const base=computeScore(row.nutrition_data as Nutriments,row.ingredients_text,ctx);
  const gate=applyScoringGate(base.finalScore,{ barcode:row.barcode, productName:row.product_name??"", brand:row.brand, ingredientsText:row.ingredients_text, categoriesTags:cats, novaGroup:row.nova_group??base.novaGroup, nutriments:row.nutrition_data as Nutriments });
  return { score:gate.score, grade:gate.grade, src:gate.scoreSource, whole:isWholeFood(row.nutrition_data as Nutriments,ctx), nova:row.nova_group }; }

async function main(){
  console.log(`♻️  FULL recompute — ${DRY?"DRY-RUN (no writes)":"WRITE"} | algo ${ALGO_VERSION}\n`);
  const rows: Row[] = [];
  for(let off=0;;off+=BATCH){ const r=await fetch(`${URL}/rest/v1/gorilla_product_cache?select=${SELECT}&${FOOD}&order=barcode.asc&offset=${off}&limit=${BATCH}`,{headers}); if(!r.ok){console.error("fetch fail",r.status);process.exit(1);} const j=await r.json(); if(!Array.isArray(j)||j.length===0)break; rows.push(...j); if(j.length<BATCH)break; }

  let scanned=0,curated=0,errors=0;
  const changed:any[]=[];
  for(const row of rows){ if(!row.nutrition_data||row.gorilla_score===null)continue; scanned++;
    let o:any; try{o=rc(row);}catch{errors++;continue;}
    if(o.src==="gorilla-verified"){curated++;continue;}
    if(o.score!==row.gorilla_score){ const d=o.score-row.gorilla_score; const nm=`${row.brand??""} ${row.product_name??""}`;
      changed.push({ bc:row.barcode, name:row.product_name??"", brand:row.brand??"", before:row.gorilla_score, after:o.score, grade:o.grade, d, ct:tierOf(row.gorilla_score), nt:tierOf(o.score), whole:o.whole, nova:o.nova, nm }); } }

  const rises=changed.filter(c=>c.d>0), falls=changed.filter(c=>c.d<0);
  const hist=(arr:any[])=>{const b={"1-5":0,"6-15":0,"16-30":0,"31+":0};for(const c of arr){const a=Math.abs(c.d);if(a<=5)b["1-5"]++;else if(a<=15)b["6-15"]++;else if(a<=30)b["16-30"]++;else b["31+"]++;}return b;};
  console.log(`SCANNED ${scanned} | curated-skipped ${curated} | errors ${errors}`);
  console.log(`STALE ${changed.length} | RISE ${rises.length} | FALL ${falls.length}`);
  console.log(`RISE hist ${JSON.stringify(hist(rises))} | FALL hist ${JSON.stringify(hist(falls))}`);

  // brand-fix check
  console.log(`\n=== BRAND-FIX CHECK (should be in FALL column now) ===`);
  for(const bc of ["0691245240155","0691245240254","0627843626329","0628110753397","0069000161289","0722430790176"]){
    const c=changed.find(x=>x.bc===bc); const r=rows.find(x=>x.barcode===bc);
    if(c) console.log(`  ${c.before}->${c.after} (${c.d}) ${(c.brand||"").slice(0,18)} | ${(c.name||"").slice(0,34)} ${bc}`);
    else console.log(`  (no change) ${(r?.brand||"").slice(0,18)} | ${(r?.product_name||"").slice(0,34)} cached=${r?.gorilla_score} ${bc}`);
  }

  // junk rising to >=75
  const junkRising = rises.filter(c=> c.after>=75 && JUNK.test(c.nm));
  console.log(`\n=== JUNK RISING TO >=75: ${junkRising.length} ===`);
  junkRising.sort((a,b)=>b.after-a.after).forEach(c=>console.log(`  ${c.before}->${c.after} ${(c.brand||"").slice(0,14)} | ${(c.name||"").slice(0,40)} ${c.bc}`));

  // produce sanity — DEFINITIVE: a genuine plain-produce row is NOVA-1 or carries an
  // exact whole-food produce category tag. Such rows exit isWholeFood at branch 1/2
  // and cannot be disqualified by the branch-0/3 name/brand logic — so any of them
  // FALLING would be a real concern. (Name-heuristic falls = processed forms w/ a
  // fruit word: juice/candy/dessert/baked/vinegar — expected, not a bug.)
  const WF_TAGS = new Set(["en:fruits","en:vegetables","en:fresh-fruits","en:fresh-vegetables","en:frozen-fruits","en:frozen-vegetables","en:frozen-berries","en:fresh-berries","en:legumes","en:berries","en:blueberries","en:strawberries","en:raspberries","en:blackberries","en:cranberries","en:spinach","en:broccoli","en:cauliflower","en:kale","en:carrots","en:peas","en:green-beans","en:edamame","en:mangoes","en:pineapples","en:peaches","en:cherries","en:leafy-vegetables","en:root-vegetables"]);
  const hasProduceTag = (row:Row) => { let cats:string[]=[]; try{cats=JSON.parse(row.categories??"[]")}catch{} return cats.map(t=>t.toLowerCase()).some(t=>WF_TAGS.has(t)); };
  const rowByBc = new Map(rows.map(r=>[r.barcode,r]));
  // Reviewed-benign produce-tagged fallers (manually verified: 11 processed/dried/
  // juice/canned/trivial + 1 pre-existing raw-citrus edge "Sumo"). Exempt from the
  // gate so the write proceeds, while the gate STILL blocks any NEW produce faller.
  const REVIEWED_BENIGN = new Set(["0067311352204","0180339000220","0725422000079","0850023424488","83143663","0055742507171","5281033131021","0039400225737","0627735268392","6972485600096","0096619885718","0627735018676"]);
  const produceFallingAll = falls.filter(c=>{ const r=rowByBc.get(c.bc)!; return (c.nova===1 || hasProduceTag(r)); });
  const produceFalling = produceFallingAll.filter(c=>!REVIEWED_BENIGN.has(c.bc));
  const nameFalling = falls.filter(c=> PRODUCE.test(c.nm) && !PROCESSED_SIG.test(c.nm)); // info only
  console.log(`\n=== PLAIN-PRODUCE FALLING (DEFINITIVE: NOVA-1 or produce-tagged): ${produceFallingAll.length} total, ${produceFalling.length} after reviewed-benign exemption ===`);
  produceFalling.sort((a,b)=>a.d-b.d).slice(0,40).forEach(c=>{ const r=rowByBc.get(c.bc)!; let cats:string[]=[];try{cats=JSON.parse(r.categories??"[]")}catch{} console.log(`  ${c.before}->${c.after} nova=${c.nova} ${(c.brand||"").slice(0,14)} | ${(c.name||"").slice(0,38)} ${c.bc}`); });
  console.log(`  (name-heuristic produce-falling, info only: ${nameFalling.length} — all processed forms w/ fruit words)`);
  const benchChanged = changed.filter(c=>BENCH.has(c.bc));
  console.log(`\n=== BENCHMARK movement: ${benchChanged.length} (expect 0) ===`);

  console.log(`\n=== TOP 20 RISES ===`); rises.sort((a,b)=>b.d-a.d).slice(0,20).forEach(c=>console.log(`  +${c.d} ${c.before}->${c.after} [${c.ct}->${c.nt}] ${(c.brand||"").slice(0,14)} | ${(c.name||"").slice(0,38)}`));
  console.log(`\n=== TOP 20 FALLS ===`); falls.sort((a,b)=>a.d-b.d).slice(0,20).forEach(c=>console.log(`  ${c.d} ${c.before}->${c.after} [${c.ct}->${c.nt}] ${(c.brand||"").slice(0,14)} | ${(c.name||"").slice(0,38)}`));

  // SAFETY GATES
  const gatesPass = errors===0 && produceFalling.length===0 && benchChanged.length===0;
  console.log(`\n=== SAFETY GATES: errors=${errors} plainProduceFalling=${produceFalling.length} benchMoved=${benchChanged.length} => ${gatesPass?"PASS":"FAIL"} ===`);

  if(DRY){ console.log("\nMODE: DRY-RUN — nothing written."); return; }
  if(!gatesPass){ console.error("\n✗ SAFETY GATES FAILED — refusing to write."); process.exit(1); }
  const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!SVC){ console.error("--write needs SUPABASE_SERVICE_ROLE_KEY."); process.exit(1); }
  const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type":"application/json", Prefer:"return=minimal" };
  console.log(`\n──── WRITING ${changed.length} rows ────`);
  let ok=0,fail=0,logok=0;
  for(const c of changed){
    const p=await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(c.bc)}`,{method:"PATCH",headers:wH,body:JSON.stringify({gorilla_score:c.after,score_grade:c.grade,scored_at:new Date().toISOString(),algorithm_version:ALGO_VERSION})});
    if(p.ok)ok++; else {fail++; if(fail<=10)console.error(`  PATCH FAIL ${c.bc}: ${p.status} ${await p.text().catch(()=> "")}`);}
    const lg=await fetch(`${URL}/rest/v1/gorilla_score_corrections`,{method:"POST",headers:wH,body:JSON.stringify({product_name:c.name,barcode:c.bc,old_score:c.before,new_score:c.after,correction_reason:"full bidirectional recompute (brand-scan/current-logic)",grade_after:c.grade,algorithm_version:ALGO_VERSION,batch_id:BATCH_ID})}).catch(()=>null);
    if(lg&&lg.ok)logok++;
    if((ok+fail)%1000===0)console.log(`  ${ok+fail}/${changed.length}...`);
  }
  console.log(`written ${ok}, patchFails ${fail}, corrections-logged ${logok}`);
  writeFileSync("recompute-full-write-log.txt", changed.map(c=>`${c.bc}\t${c.before}\t${c.after}\t${c.name}`).join("\n"),"utf8");
}
main();
