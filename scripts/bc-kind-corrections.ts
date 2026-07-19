/**
 * Apply BC-Liquor authoritative kind-corrections to miscategorized alcohol cache
 * rows. These 8 rows scored as kind "other" because their OFF categories carry no
 * spirit/cider hint; BC's authoritative ITEM_CATEGORY_NAME says otherwise.
 *
 * MECHANISM: the cache does NOT store `kind` — it's derived from the `categories`
 * JSON via detectAlcoholKind at scoring AND display time. So the durable fix is to
 * append one authoritative category tag (en:spirits / en:cider) that flips
 * detectAlcoholKind, then recompute + re-store the score.
 *
 * SCORE INVARIANCE (verified, not assumed): the non-beer alcohol formula is
 *   cScore*0.7 + calScore*0.2 + carbSc*0.1
 * and cleanlinessScore / calorieDensityScore / carbScore all read per-100mL values.
 * referenceServingMl (the only kind-dependent input) feeds ONLY the beer branch and
 * display fields. None of these rows is beer, so every score is unchanged. The write
 * still persists the corrected categories (fixes the displayed kind/serving) and logs
 * the categorization change to gorilla_score_corrections (old==new score).
 *
 * Mott's Clamato Caesar (0065912006977) is EXCLUDED: BC's "Refreshment Beverages" is
 * a catch-all RTD bucket, and a vodka-clamato caesar maps to no specific AlcoholKind
 * (beer/wine/spirits/cider/seltzer) — "other" is already the correct bucket for it.
 *
 *   npx tsx scripts/bc-kind-corrections.ts           # DRY-RUN (default)
 *   npx tsx scripts/bc-kind-corrections.ts --write
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { randomUUID } from "node:crypto";
import { computeAlcoholScore, detectAlcoholKind, type AlcoholKind } from "../app/scan/lib/alcoholScoring";
import { ALGO_VERSION } from "../app/scan/lib/productClassify";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const KEY = SVC || (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "");
const DRY = !process.argv.includes("--write");
if (!URL || !KEY) { console.error("Missing Supabase env"); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const wH = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const BATCH_ID = randomUUID();
const REASON = "kind correction from BC Liquor authoritative category — was miscategorized as 'other'";

// barcode -> {corrected kind, authoritative category tag to add}
const FIX: Record<string, { kind: AlcoholKind; tag: string; name: string }> = {
  "0620213025609": { kind: "spirits", tag: "en:spirits", name: "Bacardi" },
  "0048415510806": { kind: "spirits", tag: "en:spirits", name: "Dark Navy Rum" },
  "0850047003003": { kind: "spirits", tag: "en:spirits", name: "Kentucky Straight Bourbon Whiskey" },
  "0088004400163": { kind: "spirits", tag: "en:spirits", name: "Cinnamon Whiskey" },
  "0622153625048": { kind: "spirits", tag: "en:spirits", name: "Dry Gin" },
  "5000104123280": { kind: "cider",   tag: "en:cider",   name: "Hard Apple Cider" },
  "0626990098638": { kind: "cider",   tag: "en:cider",   name: "Authentic Dry Cider" },
};
// EXCLUDED (reported, not written): 0065912006977 Mott's Clamato Caesar — no valid AlcoholKind for a caesar RTD.
const BENCH = new Set(["0028400090308","0044000030131","0069000019832","0069000008947","0062100012284","0028400590679","0028400090155","0072030007972","0817939020025","0602652179864","0041570050000","0069000019849"]);

async function main() {
  console.log(`🥃 BC kind-corrections — ${DRY ? "DRY-RUN" : "WRITE"} | algo ${ALGO_VERSION} | batch ${BATCH_ID}\n`);
  const curated = new Set(((await (await fetch(`${URL}/rest/v1/curated_picks?select=barcode`, { headers: H })).json()) as any[]).map((c) => c.barcode));

  const bcs = Object.keys(FIX).join(",");
  const rows = (await (await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=in.(${bcs})&select=barcode,product_name,categories,ingredients_text,nutrition_data,gorilla_score,score_grade,is_alcohol`, { headers: H })).json()) as any[];
  console.log(`PRE-WRITE ASSERTION: fetched ${rows.length} rows (expected 7), all is_alcohol=${rows.every((r) => r.is_alcohol)}`);
  if (rows.length !== 7 || !rows.every((r) => r.is_alcohol)) { console.error("ABORT — row set drifted or not all alcohol."); process.exit(1); }
  const badOverlap = rows.filter((r) => curated.has(r.barcode) || BENCH.has(r.barcode));
  console.log(`curated/benchmark overlap: ${badOverlap.length} (expected 0)\n`);
  if (badOverlap.length) { console.error("ABORT — a target is curated/benchmark."); process.exit(1); }

  const plan: any[] = [];
  for (const r of rows) {
    const fix = FIX[r.barcode];
    let cats: string[] = []; try { cats = typeof r.categories === "string" ? JSON.parse(r.categories) : (r.categories ?? []); } catch {}
    cats = cats ?? [];
    const before = detectAlcoholKind(cats);
    const newCats = cats.includes(fix.tag) ? cats : [...cats, fix.tag];
    const after = detectAlcoholKind(newCats);
    let nd = r.nutrition_data; if (typeof nd === "string") { try { nd = JSON.parse(nd); } catch { nd = {}; } } nd = nd ?? {};
    const res = computeAlcoholScore(nd, r.ingredients_text ?? undefined, after);
    plan.push({ bc: r.barcode, name: fix.name, kindBefore: before, kindAfter: after, tag: fix.tag,
      scoreBefore: r.gorilla_score, gradeBefore: r.score_grade, scoreAfter: res.score, gradeAfter: res.grade, newCats });
  }

  console.log("barcode          kind: before -> after   score: before -> after   product");
  for (const p of plan)
    console.log(`  ${p.bc.padEnd(15)} ${p.kindBefore.padEnd(6)} -> ${p.kindAfter.padEnd(8)} ${String(p.scoreBefore).padStart(5)} ${p.gradeBefore?.slice(0,4).padEnd(4)} -> ${String(p.scoreAfter).padStart(3)} ${p.gradeAfter?.slice(0,4).padEnd(4)}  ${p.name}`);
  const kindFlipped = plan.filter((p) => p.kindBefore !== p.kindAfter).length;
  const scoreMoved = plan.filter((p) => p.scoreBefore !== p.scoreAfter);
  console.log(`\nkind flipped: ${kindFlipped}/7 | score changed: ${scoreMoved.length} (${scoreMoved.map((p) => p.name + " " + p.scoreBefore + "→" + p.scoreAfter).join(", ") || "none — non-beer score is serving-independent, as predicted"})`);
  console.log(`EXCLUDED: 0065912006977 Mott's Clamato Caesar — no valid AlcoholKind for a caesar RTD; stays 'other'.`);

  if (DRY) { console.log("\nDRY-RUN — nothing written."); return; }

  let wrote = 0, patchFail = 0, logged = 0;
  for (const p of plan) {
    const res = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(p.bc)}&is_alcohol=eq.true`, {
      method: "PATCH", headers: wH,
      body: JSON.stringify({ categories: JSON.stringify(p.newCats), gorilla_score: p.scoreAfter, score_grade: p.gradeAfter, scored_at: new Date().toISOString(), algorithm_version: ALGO_VERSION }),
    });
    if (!res.ok) { patchFail++; console.error(`  PATCH FAIL ${p.bc}: ${res.status} ${await res.text().catch(() => "")}`); continue; }
    wrote++;
    const lg = await fetch(`${URL}/rest/v1/gorilla_score_corrections`, {
      method: "POST", headers: wH,
      body: JSON.stringify({ product_name: `${p.name} (kind ${p.kindBefore}→${p.kindAfter})`, barcode: p.bc, old_score: p.scoreBefore, new_score: p.scoreAfter, correction_reason: REASON, grade_before: p.gradeBefore, grade_after: p.gradeAfter, algorithm_version: ALGO_VERSION, batch_id: BATCH_ID }),
    }).catch(() => null);
    if (lg && lg.ok) logged++;
  }
  console.log(`\nWRITE — rows updated ${wrote}, patchFails ${patchFail}, corrections-logged ${logged}, batch_id ${BATCH_ID}`);
  if (patchFail > 0) process.exit(1);
}
main();
