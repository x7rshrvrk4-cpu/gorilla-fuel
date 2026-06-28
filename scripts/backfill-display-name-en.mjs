/**
 * PHASE A — non-destructive English display-name backfill.
 *
 * For French-named food rows in gorilla_product_cache, fetch OFF's product_name_en
 * and, where a usable English name exists, write it to display_name_en ONLY.
 * NEVER writes product_name (the scorer reads it) or any other field. NO translation
 * (Phase B): rows where OFF has no English name are skipped.
 *
 *   node --env-file=.env.local scripts/backfill-display-name-en.mjs            # DRY-RUN (default)
 *   node --env-file=.env.local scripts/backfill-display-name-en.mjs --write    # persist display_name_en
 *
 * Requires the column (run first in Supabase):
 *   alter table public.gorilla_product_cache add column if not exists display_name_en text;
 *
 * Idempotent, loud, progress-visible. Skips curated rows. Mirrors resolveProductName's
 * product_name_en branch (prefer OFF product_name_en when present and not French-looking).
 */
import { writeFileSync } from "fs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
const H = { apikey: ANON, Authorization: `Bearer ${ANON}`, Accept: "application/json" };
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// French heuristic (same as the scope/estimate)
const accent = /[éèêëàâçîïôûùüœ]/i;
const frTok = /\b(surgel|congel|bleuet|cerise|fraise|framboise|p[êe]che|poulet|boeuf|porc|dinde|fromage|l[ée]gume|biologique|[ée]pice|haricot|pois|pomme de terre|lait|cr[èe]me|\bjus\b|sucr|farine|avoine|tranch|fum[ée]|r[ôo]ti|fleurettes|brocolis|tomates|oignon|saumon|thon|p[âa]tes|miel|amande|noix|graines|beurre|biscuit|g[âa]teau)\b/i;
const frFn = /(\b(aux|[àa] la|de la|du|des|sans|avec|et|petits?)\b)/i;
const isFrench = (s) => { const t = (s || "").toLowerCase(); return frTok.test(t) || (accent.test(t) && frFn.test(t)); };

// Reviewed-out: OFF product_name_en values that are vague/marketing/mismatched — keep French.
const SKIP = new Set(["0017082015181", "0036632081193", "0058336025075"]);

async function off(bc) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${bc}.json?fields=product_name_en,product_name,status`, { headers: { "User-Agent": "GorillaFuel-name-backfill/1.0" } });
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (a + 1)); continue; }
      return await r.json();
    } catch { await sleep(1000 * (a + 1)); }
  }
  return null;
}

/** A usable English name = OFF product_name_en present, ≥3 chars, not French-looking, differs from the French name. */
function usableEnglish(enRaw, frName) {
  const en = (enRaw || "").trim();
  if (en.length < 3) return null;
  if (isFrench(en)) return null;
  if (en.toLowerCase() === (frName || "").trim().toLowerCase()) return null;
  return en;
}

async function main() {
  if (!URL || !ANON) { console.error("Supabase not configured."); process.exit(1); }
  if (!DRY && !SERVICE) { console.error("--write needs SUPABASE_SERVICE_ROLE_KEY."); process.exit(1); }
  console.log(`🦍 display_name_en backfill — ${DRY ? "DRY-RUN (no writes)" : "WRITE"}\n`);

  // 1) collect all French-named food rows
  const french = [];
  let offset = 0; const page = 1000;
  for (;;) {
    const r = await fetch(`${URL}/rest/v1/gorilla_product_cache?select=barcode,product_name,is_curated&${FOOD}&product_name=not.is.null&order=barcode.asc&offset=${offset}&limit=${page}`, { headers: H });
    if (!r.ok) { console.error(`Fetch failed offset ${offset}: ${r.status}`); process.exit(1); }
    const rows = await r.json(); if (!rows.length) break;
    for (const p of rows) { if (!p.is_curated && isFrench(p.product_name)) french.push(p); }
    offset += page; if (rows.length < page) break;
  }
  console.log(`French-named non-curated food rows: ${french.length}\nChecking OFF for product_name_en…\n`);

  // 2) check OFF, collect usable English names
  let withEnglish = 0, frenchOnly = 0, unresolved = 0, notInOff = 0, written = 0, patchFail = 0;
  const plan = [];
  let done = 0;
  for (const p of french) {
    const j = await off(p.barcode); await sleep(110);
    done++;
    if (done % 200 === 0) console.log(`  …${done}/${french.length} (english ${withEnglish})`);
    if (!j) { unresolved++; continue; }
    if (j.status !== 1) { notInOff++; continue; }
    const en = usableEnglish(j.product?.product_name_en, p.product_name);
    if (!en) { frenchOnly++; continue; }
    if (SKIP.has(p.barcode)) { continue; } // reviewed-out questionable OFF names — keep French
    withEnglish++;
    plan.push({ barcode: p.barcode, fr: p.product_name, en });

    if (!DRY) {
      const patch = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(p.barcode)}`, {
        method: "PATCH",
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ display_name_en: en }), // ONLY this field
      });
      if (!patch.ok) { patchFail++; console.error(`  PATCH FAIL ${p.barcode}: ${patch.status} ${await patch.text().catch(() => "")}`); }
      else written++;
    }
  }

  writeFileSync("display-name-en-plan.txt", plan.map((x) => `${x.barcode}  "${x.fr}"  ->  "${x.en}"`).join("\n"), "utf8");
  console.log("\n──── SAMPLE (up to 25) ────");
  plan.slice(0, 25).forEach((x) => console.log(`  "${x.fr}"  ->  "${x.en}"`));
  console.log("\n──── SUMMARY ────");
  console.log(`French rows checked      : ${french.length}`);
  console.log(`  has English (would set): ${withEnglish}  <- FREE FIX`);
  console.log(`  French-only (Phase B)  : ${frenchOnly}`);
  console.log(`  not in OFF             : ${notInOff} | unresolved(throttle): ${unresolved}`);
  console.log(DRY ? `\nDRY-RUN — nothing written. Re-run with --write to persist display_name_en.` : `\nWRITE — wrote ${written}, patchFails ${patchFail}`);
  if (!DRY && patchFail > 0) process.exit(1);
}
main();
