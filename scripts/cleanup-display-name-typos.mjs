/**
 * Non-destructive display-name typo + ALLCAPS cleanup.
 *
 * Writes a hand-vetted clean name to display_name_en ONLY (the render is
 * `display_name_en ?? product_name`), so scores are provably untouched — the
 * scorer reads product_name, which we NEVER modify. Same discipline as the
 * French display_name_en backfill (scripts/backfill-display-name-en.mjs).
 *
 *   node --env-file=.env.local scripts/cleanup-display-name-typos.mjs           # DRY-RUN (default)
 *   node --env-file=.env.local scripts/cleanup-display-name-typos.mjs --write   # persist display_name_en
 *
 * Idempotent: each entry records the exact `from` (current product_name) it was
 * derived from; the script skips a row whose product_name no longer matches
 * `from` (data drifted — re-review) and skips any row that already has a
 * different display_name_en (never clobbers a good value).
 *
 * Provenance of this set (session scan of all 46,074 cache rows):
 *  - The "mojibake" category was a measurement artifact (UTF-8 read as cp1252);
 *    a forced-UTF-8 re-scan found 0 genuine mojibake — the DB is clean UTF-8.
 *  - 7 PUBLIC rows (on /approved · /cheat · /avoid): 1 typo (Datk→Dark) +
 *    6 ALLCAPS de-shouts (incl. brand fix CLIFF→Clif).
 *  - 42 PRIVATE rows: 4 vetted typo rules only — Rasberry→Raspberry,
 *    protien→Protein, Cripsy→Crispy, Bisquit→Biscuit. Deliberately EXCLUDES
 *    false-positive rules: "chocolat" (correct French), "yoghurt" (valid
 *    spelling), "cheeze" (often intentional branding).
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const DRY = !process.argv.includes("--write");
const H = { apikey: ANON, Authorization: `Bearer ${ANON}`, Accept: "application/json" };

// 7 PUBLIC-page rows — 1 typo + 6 ALLCAPS de-shout (incl. Clif brand fix)
const PUBLIC = [
  { barcode: "0602652429415", from: "Nuts Sea Salt & Datk Chocolate", to: "Nuts Sea Salt & Dark Chocolate" }, // typo
  { barcode: "0039978004949", from: "PROTEIN OATS", to: "Protein Oats" },
  { barcode: "0055577101681", from: "GRUAU RAPIDE", to: "Gruau Rapide" },
  { barcode: "0055742519884", from: "EDAMAME", to: "Edamame" },
  { barcode: "0059749998574", from: "BLACK BEANS", to: "Black Beans" },
  { barcode: "0076808011036", from: "SPAGHETTINI", to: "Spaghettini" },
  { barcode: "0722252121479", from: "CLIFF BAR BLUEBERRY ALMOND CRISP", to: "Clif Bar Blueberry Almond Crisp" }, // + brand fix
];

// 42 PRIVATE rows — 4 vetted typo rules only
const PRIVATE = [
  { barcode: "0011110078056", from: "Rasberry infused vinegar", to: "Raspberry infused vinegar" },
  { barcode: "0056700162623", from: "Activia Gut Health Rasberry", to: "Activia Gut Health Raspberry" },
  { barcode: "0057271162999", from: "G whey protien bar", to: "G whey protein bar" },
  { barcode: "0057271163255", from: "Muscle milk protien chocolate", to: "Muscle milk protein chocolate" },
  { barcode: "0067002306417", from: "Pure protien - chewy chocolate chip", to: "Pure protein - chewy chocolate chip" },
  { barcode: "0069299605303", from: "Cripsy Wings With Budweiser", to: "Crispy Wings With Budweiser" },
  { barcode: "0196671004055", from: "Whey Protien Isolate", to: "Whey Protein Isolate" },
  { barcode: "0208112001995", from: "Bisquit Double Chocolate", to: "Biscuit Double Chocolate" },
  { barcode: "0234630706999", from: "Rasberry-Filled Shortbread Cookie", to: "Raspberry-Filled Shortbread Cookie" },
  { barcode: "03650424", from: "Protien Hydration", to: "Protein Hydration" },
  { barcode: "0625486500372", from: "Sour Cream And Onion Protien Chips", to: "Sour Cream And Onion Protein Chips" },
  { barcode: "0627531018276", from: "Peanut Butter Protien", to: "Peanut Butter Protein" },
  { barcode: "0628090671285", from: "Pyrite - Rasberry", to: "Pyrite - Raspberry" },
  { barcode: "0628233860507", from: "Basic Supplements Whey Protien Chocolate", to: "Basic Supplements Whey Protein Chocolate" },
  { barcode: "0628618002539", from: "Protien And Co Chocolate Fudge Protein Bar", to: "Protein And Co Chocolate Fudge Protein Bar" },
  { barcode: "0628942820038", from: "Hydrolyzed Isolate Whey Protien - Frothy Vanilla", to: "Hydrolyzed Isolate Whey Protein - Frothy Vanilla" },
  { barcode: "06612801", from: "rasberry Jello", to: "raspberry Jello" },
  { barcode: "0699097309754", from: "Triple Chocolate Grass-fed Whey Protien", to: "Triple Chocolate Grass-fed Whey Protein" },
  { barcode: "0699097710697", from: "Chocolate peanut butter protien", to: "Chocolate peanut butter protein" },
  { barcode: "0700199004017", from: "Iso advanced whey protien", to: "Iso advanced whey protein" },
  { barcode: "0774223594607", from: "Frozen Rasberry", to: "Frozen Raspberry" },
  { barcode: "0778659005393", from: "Textured Pea Protien Mince (70%)", to: "Textured Pea Protein Mince (70%)" },
  { barcode: "0791435338577", from: "Rasberry Jam", to: "Raspberry Jam" },
  { barcode: "0808912009506", from: "Vanilla Protien Powder", to: "Vanilla Protein Powder" },
  { barcode: "0810011190092", from: "Select Protien - Chocolate Cupcake", to: "Select Protein - Chocolate Cupcake" },
  { barcode: "0810030509875", from: "Cookies N Cream Protien Shake", to: "Cookies N Cream Protein Shake" },
  { barcode: "0810032235505", from: "Chocolate peanut butter protien balls", to: "Chocolate peanut butter protein balls" },
  { barcode: "0810131957629", from: "Bucked Up Protien", to: "Bucked Up Protein" },
  { barcode: "0811586000076", from: "Allo Protien Powder For Hot Coffee", to: "Allo Protein Powder For Hot Coffee" },
  { barcode: "0821008002823", from: "Quattro 4 Stage Protien Isilate", to: "Quattro 4 Stage Protein Isilate" },
  { barcode: "0821008002892", from: "Protien powder", to: "Protein powder" },
  { barcode: "0837229003969", from: "Why Protien", to: "Why Protein" },
  { barcode: "0840229304141", from: "Brownie Batter Protien Bar", to: "Brownie Batter Protein Bar" },
  { barcode: "0854143006418", from: "Sports Protien Shake", to: "Sports Protein Shake" },
  { barcode: "0874754000711", from: "Protien Bagel", to: "Protein Bagel" },
  { barcode: "0888849012848", from: "cookie dough protien bar", to: "cookie dough protein bar" },
  { barcode: "0990312455332", from: "Organic Rasberry And Lavander Spread", to: "Organic Raspberry And Lavander Spread" },
  { barcode: "12279999", from: "Chocolate flavored Vegan protien", to: "Chocolate flavored Vegan protein" },
  { barcode: "15002438", from: "Slimming salted caramel protien bar", to: "Slimming salted caramel protein bar" },
  { barcode: "33341354", from: "Nestea Rasberry", to: "Nestea Raspberry" },
  { barcode: "75392574", from: "Rasberry Turnover", to: "Raspberry Turnover" },
  { barcode: "8906183980004", from: "ISORICH BLEND WHEY PROTIEN", to: "ISORICH BLEND WHEY PROTEIN" },
];

const ALL = [...PUBLIC, ...PRIVATE];

async function getRow(bc) {
  const r = await fetch(
    `${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(bc)}&select=product_name,display_name_en`,
    { headers: H }
  );
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] ?? null;
}

async function main() {
  if (!URL || !ANON) { console.error("Supabase not configured."); process.exit(1); }
  if (!DRY && !SERVICE) { console.error("--write needs SUPABASE_SERVICE_ROLE_KEY."); process.exit(1); }
  console.log(`🦍 display_name_en typo/ALLCAPS cleanup — ${DRY ? "DRY-RUN (no writes)" : "WRITE"}`);
  console.log(`   ${ALL.length} entries (${PUBLIC.length} public + ${PRIVATE.length} private)\n`);

  let written = 0, wouldWrite = 0, skipDrift = 0, skipClobber = 0, skipDone = 0, patchFail = 0, missing = 0;
  for (const e of ALL) {
    const row = await getRow(e.barcode);
    if (!row) { missing++; console.error(`  MISSING ${e.barcode}`); continue; }
    // idempotent / clobber guards
    if (row.product_name !== e.from) { skipDrift++; console.error(`  DRIFT ${e.barcode}: product_name changed, skipping`); continue; }
    if (row.display_name_en === e.to) { skipDone++; continue; } // already applied
    if (row.display_name_en && row.display_name_en !== e.to) { skipClobber++; console.error(`  CLOBBER-GUARD ${e.barcode}: existing display_name_en=${JSON.stringify(row.display_name_en)}, skipping`); continue; }

    wouldWrite++;
    if (!DRY) {
      const patch = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(e.barcode)}`, {
        method: "PATCH",
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ display_name_en: e.to }), // ONLY this field
      });
      if (!patch.ok) { patchFail++; console.error(`  PATCH FAIL ${e.barcode}: ${patch.status} ${await patch.text().catch(() => "")}`); }
      else written++;
    }
  }

  console.log("\n──── SUMMARY ────");
  console.log(`entries              : ${ALL.length}`);
  console.log(`already applied      : ${skipDone}`);
  console.log(`drift-skipped        : ${skipDrift}`);
  console.log(`clobber-skipped      : ${skipClobber}`);
  console.log(`missing              : ${missing}`);
  console.log(DRY ? `would write          : ${wouldWrite}\n\nDRY-RUN — nothing written. Re-run with --write to persist.` : `wrote ${written}, patchFails ${patchFail}`);
  if (!DRY && patchFail > 0) process.exit(1);
}
main();
