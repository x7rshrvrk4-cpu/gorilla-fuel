// PHASE B — layered, conservative FR→EN resolver for French-only food rows.
// Category-fallback + controlled dictionary; French is the final fallback.
// Writes ONLY display_name_en (PATCH); NEVER touches product_name; skips curated.
//   node --env-file=.env.local scripts/backfill-display-name-fr.mjs           # DRY-RUN (default)
//   node --env-file=.env.local scripts/backfill-display-name-fr.mjs --write   # persist display_name_en
import { readFileSync, writeFileSync, existsSync } from "fs";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL, KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY = !process.argv.includes("--write");
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: "application/json" };
const FOOD = "is_alcohol=eq.false&is_beauty=eq.false&is_supplement=eq.false";

// French detector (same heuristic as scope/Phase A)
const accent = /[éèêëàâçîïôûùüœ]/i;
const frTok = /\b(surgel|congel|bleuet|cerise|fraise|framboise|p[êe]che|poulet|boeuf|porc|dinde|fromage|l[ée]gume|biologique|[ée]pice|haricot|pois|pomme de terre|lait|cr[èe]me|\bjus\b|sucr|farine|avoine|tranch|fum[ée]|r[ôo]ti|fleurettes|brocolis|tomates|oignon|saumon|thon|p[âa]tes|miel|amande|noix|graines|beurre|biscuit|g[âa]teau)\b/i;
const frFn = /(\b(aux|[àa] la|de la|du|des|sans|avec|et|petits?)\b)/i;
const isFrench = s => { const t = (s || "").toLowerCase(); return frTok.test(t) || (accent.test(t) && frFn.test(t)); };

const strip = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const title = s => s.replace(/\S+/g, w => w.length <= 2 && /^(of|a|an|the|in|with|and)$/.test(w) ? w : w[0].toUpperCase() + w.slice(1));

// ── Layer 1: CATEGORY-FALLBACK — only SPECIFIC staple leaf tags (no generic umbrellas) ──
const CATEGORY_LABEL = {
  "en:diced-tomatoes": "Diced Tomatoes", "en:crushed-tomatoes": "Crushed Tomatoes", "en:whole-peeled-tomatoes": "Whole Peeled Tomatoes",
  "en:tomato-paste": "Tomato Paste", "en:orange-juices": "Orange Juice", "en:apple-juices": "Apple Juice",
  "en:chickpeas": "Chickpeas", "en:kidney-beans": "Kidney Beans", "en:black-beans": "Black Beans", "en:white-beans": "White Beans",
  "en:lentils": "Lentils", "en:basmati-rice": "Basmati Rice", "en:white-rice": "White Rice", "en:brown-rice": "Brown Rice",
  "en:rolled-oats": "Rolled Oats", "en:whole-wheat-flour": "Whole Wheat Flour", "en:all-purpose-flour": "All-Purpose Flour",
  "en:frozen-blueberries": "Frozen Blueberries", "en:frozen-strawberries": "Frozen Strawberries", "en:frozen-green-beans": "Frozen Green Beans",
  "en:frozen-broccoli": "Frozen Broccoli", "en:frozen-peas": "Frozen Peas", "en:frozen-corn": "Frozen Corn",
  "en:baby-spinach": "Baby Spinach", "en:baby-carrots": "Baby Carrots", "en:quinoa": "Quinoa", "en:hummus": "Hummus",
};
function categoryName(catsJson) {
  let cats = []; try { cats = JSON.parse(catsJson ?? "[]"); } catch { return null; }
  // most specific match = check from the END (OFF lists general→specific)
  for (let i = cats.length - 1; i >= 0; i--) { const lbl = CATEGORY_LABEL[String(cats[i]).trim().toLowerCase()]; if (lbl) return lbl; }
  return null;
}

// ── Layer 2: CONTROLLED DICTIONARY (token-level, brand-safe) ──
const NOUN = {
  lait: "milk", creme: "cream", farine: "flour", riz: "rice", sarrasin: "buckwheat", quinoa: "quinoa", sesame: "sesame",
  avoine: "oats", son: "bran", flocons: "flakes", gruau: "oatmeal", pain: "bread", pates: "pasta", biscuits: "cookies", gateau: "cake",
  bleuets: "blueberries", cerises: "cherries", fraises: "strawberries", framboises: "raspberries", mures: "blackberries",
  canneberges: "cranberries", pommes: "apples", pomme: "apple", poires: "pears", peches: "peaches", raisins: "grapes",
  bananes: "bananas", mangue: "mango", ananas: "pineapple", melon: "melon", citron: "lemon", fruits: "fruit",
  legumes: "vegetables", legume: "vegetable", haricots: "beans", pois: "peas", tomates: "tomatoes", tomate: "tomato",
  oignon: "onion", oignons: "onions", ail: "garlic", brocoli: "broccoli", brocolis: "broccoli", carottes: "carrots",
  epinards: "spinach", chou: "cabbage", "chou-fleur": "cauliflower", mais: "corn", courge: "squash", courgette: "zucchini",
  concombre: "cucumber", poivron: "pepper", champignons: "mushrooms", betteraves: "beets",
  poulet: "chicken", boeuf: "beef", porc: "pork", dinde: "turkey", jambon: "ham", saumon: "salmon", thon: "tuna",
  poisson: "fish", oeufs: "eggs", fromage: "cheese", beurre: "butter", yogourt: "yogurt",
  arachide: "peanut", arachides: "peanuts", noix: "nuts", amandes: "almonds", cajou: "cashew", graines: "seeds",
  jus: "juice", eau: "water", the: "tea", cafe: "coffee", sucre: "sugar", sel: "salt", miel: "honey", huile: "oil",
  sirop: "syrup", chocolat: "chocolate", vanille: "vanilla", soupe: "soup", bouillon: "broth",
};
const ADJ = {
  vert: "green", verts: "green", verte: "green", vertes: "green", rouge: "red", rouges: "red", blanc: "white",
  blanche: "white", blancs: "white", noir: "black", noire: "black", brun: "brown", brune: "brown", jaune: "yellow",
  basmati: "basmati", entier: "whole", entiere: "whole", entieres: "whole", hache: "ground", hachee: "ground",
  maigre: "lean", tranche: "sliced", tranchees: "sliced", doux: "mild", fin: "fine", fins: "fine", fines: "fine",
  nature: "plain", grille: "roasted", grillees: "roasted", roti: "roast", rotie: "roasted", fume: "smoked",
  chevre: "goat", sauvages: "wild", sauvage: "wild",
};
const MOD = { surgele: "Frozen", surgeles: "Frozen", surgelee: "Frozen", surgelees: "Frozen", congele: "Frozen", congeles: "Frozen", biologique: "Organic", bio: "Organic" };
const CONNECT = new Set(["de", "du", "des", "d", "la", "le", "les", "l", "a", "au", "aux", "en", "à"]);
const PRE = [["pomme de terre", "potato"], ["pommes de terre", "potatoes"], ["non salees", "unsalted"], ["non salee", "unsalted"], ["fruits de mer", "seafood"], ["chocolat noir", "dark_chocolate"], ["chocolat au lait", "milk_chocolate"]];
// Multiword nouns produced by PRE (underscored) so they classify as a single head noun.
const PRE_NOUN = { dark_chocolate: "dark chocolate", milk_chocolate: "milk chocolate", potato: "potato", potatoes: "potatoes", seafood: "seafood" };
// Singular countable heads → plural, used when the source carried a plural token (e.g. "pomme de terre rouges").
const NOUN_PLURAL = { potato: "potatoes", tomato: "tomatoes", apple: "apples", onion: "onions" };
// Specific names to keep French (proper-noun dishes / cheeses that mistranslate literally).
const KEEP_FRENCH = ["fromage blanc"];

function dictName(raw) {
  let s = strip(raw).replace(/[’']/g, "'").replace(/d'|l'/g, "$& ").replace(/-/g, " ").replace(/[,.;:()]/g, " ").replace(/\s+/g, " ").trim();
  if (KEEP_FRENCH.some(k => s.includes(k))) return null; // proper-noun dishes/cheeses → keep French
  for (const [fr, en] of PRE) s = s.replaceAll(fr, en.replace(/ /g, "_"));
  const toks = s.split(" ").filter(Boolean);
  const content = toks.filter(t => !CONNECT.has(t));
  if (content.length === 0 || content.length > 4) return null;
  // classify each content token; reject if any is unknown (brand/proper noun → keep French)
  const cls = content.map(t => {
    if (PRE_NOUN[t]) return { en: PRE_NOUN[t], type: "noun" }; // multiword head nouns (dark chocolate, potato…)
    if (t === "unsalted") return { en: "unsalted", type: "adj" };
    if (NOUN[t]) return { en: NOUN[t], type: "noun" };
    if (ADJ[t]) return { en: ADJ[t], type: "adj" };
    if (MOD[t]) return { en: MOD[t], type: "mod" };
    return null;
  });
  if (cls.some(c => c === null)) return null; // unknown token → reject (brand-safe)

  // "à / au / aux / à la / à l'" are idiomatic in food names ("sucre à la crème" = fudge,
  // "amande à l'érable") — never flip these literally; keep French.
  if (toks.some(t => ["a", "au", "aux"].includes(t))) return null;
  const deConnector = toks.some(t => ["de", "du", "des", "d"].includes(t)); // possessive/material "A de B"
  const mods = cls.filter(c => c.type === "mod").map(c => c.en);
  const rest = cls.filter(c => c.type !== "mod");

  let coreEn;
  if (deConnector) {
    // Flip "A de B" → "B A" ONLY for the clean 2-noun shape where B is SINGULAR, so
    // "jus de pomme"→"apple juice", "bouillon de boeuf"→"beef broth". Plural-B cases
    // ("crème de carottes"→"carrots cream") and any other shape → keep French.
    // "crème de X" is a false friend ("Tomato Cream"≠cream-of-tomato soup) → keep French.
    if (rest[0].en === "cream") return null;
    if (rest.length === 2 && rest[0].type === "noun" && rest[1].type === "noun" && !/s$/.test(rest[1].en)) {
      coreEn = `${rest[1].en} ${rest[0].en}`;
    } else {
      return null;
    }
  } else {
    const nouns = rest.filter(c => c.type === "noun"), adjs = rest.filter(c => c.type === "adj");
    if (nouns.length !== 1) return null;                  // need exactly one head noun for confident order
    if (adjs.length > 1) return null;                     // 2+ adjectives → English order is unreliable → keep French
    let head = nouns[0].en;
    if (head === "sesame") return null;                   // "sésame" alone isn't a product name (needs "seeds") — don't infer; keep French
    // Pluralize a singular countable head when the source carried a plural token
    // ("pomme de terre rouges" → "Red Potatoes").
    if (content.some(t => /s$/.test(t) && t.length > 3) && NOUN_PLURAL[head]) head = NOUN_PLURAL[head];
    coreEn = `${adjs.map(a => a.en).join(" ")} ${head}`.trim(); // single adj before noun: "haricots verts"→"green beans"
  }
  const modPrefix = [...new Set(mods)].sort().join(" "); // "Frozen"/"Organic" (Frozen<Organic alpha → "Frozen Organic"? fix order)
  const ordered = [mods.includes("Organic") ? "Organic" : "", mods.includes("Frozen") ? "Frozen" : "", coreEn].filter(Boolean).join(" ");
  void modPrefix;
  return title(ordered.replace(/\s+/g, " ").trim());
}

function resolve(row) {
  const cat = categoryName(row.categories);
  if (cat) return { en: cat, layer: "category" };
  const d = dictName(row.product_name);
  if (d) return { en: d, layer: "dictionary" };
  return { en: null, layer: "french" };
}

// ── load French-only rows (French heuristic, minus the 208 Phase-A OFF-English barcodes, minus curated) ──
const phaseA = new Set();
if (existsSync("display-name-en-plan.txt")) for (const l of readFileSync("display-name-en-plan.txt", "utf8").split(/\r?\n/)) { const m = l.match(/^(\S+)\s/); if (m) phaseA.add(m[1]); }

const rows = [];
let offset = 0; const page = 1000;
for (;;) {
  const r = await fetch(`${URL}/rest/v1/gorilla_product_cache?select=barcode,product_name,brand,categories,is_curated&${FOOD}&product_name=not.is.null&order=barcode.asc&offset=${offset}&limit=${page}`, { headers: H });
  const b = await r.json(); if (!b.length) break;
  for (const p of b) if (!p.is_curated && isFrench(p.product_name) && !phaseA.has(p.barcode)) rows.push(p);
  offset += page; if (b.length < page) break;
}

if (!DRY && !SERVICE) { console.error("--write needs SUPABASE_SERVICE_ROLE_KEY."); process.exit(1); }
let cByCat = 0, cByDict = 0, cFrench = 0, written = 0, patchFail = 0;
const catEx = [], dictEx = [], frEx = [], trickyEx = [];
const TRICKY = /goldfish|irr[ée]sistible|compliment|président|selection|kirkland|cheez|oreo|nutella|barilla|catelli/i;
for (const p of rows) {
  const res = resolve(p);
  if (res.layer === "category") { cByCat++; if (catEx.length < 12) catEx.push(`  [cat]  "${p.product_name}"  ->  "${res.en}"`); }
  else if (res.layer === "dictionary") { cByDict++; if (dictEx.length < 18) dictEx.push(`  [dict] "${p.product_name}"  ->  "${res.en}"`); }
  else { cFrench++; if (frEx.length < 14) frEx.push(`  [keep] "${p.product_name}"`); }
  if (TRICKY.test(p.product_name) && trickyEx.length < 12) trickyEx.push(`  [${res.layer}] "${p.product_name}"  ->  ${res.en ? `"${res.en}"` : "(kept French)"}`);

  if (!DRY && res.en) { // PATCH display_name_en ONLY (never product_name)
    const patch = await fetch(`${URL}/rest/v1/gorilla_product_cache?barcode=eq.${encodeURIComponent(p.barcode)}`, {
      method: "PATCH",
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ display_name_en: res.en }),
    });
    if (!patch.ok) { patchFail++; console.error(`  PATCH FAIL ${p.barcode}: ${patch.status} ${await patch.text().catch(() => "")}`); }
    else written++;
  }
}

console.log(`French-only rows (excl. ${phaseA.size} Phase-A + curated): ${rows.length}\n`);
console.log("──── COVERAGE ────");
console.log(`  (a) category-fallback : ${cByCat}`);
console.log(`  (b) dictionary        : ${cByDict}`);
console.log(`  (c) KEPT FRENCH       : ${cFrench}  <- conservative safety margin`);
console.log("\n──── SAMPLE: category ────"); catEx.forEach(e => console.log(e));
console.log("\n──── SAMPLE: dictionary ────"); dictEx.forEach(e => console.log(e));
console.log("\n──── SAMPLE: tricky (embedded brands / proper nouns) ────"); trickyEx.forEach(e => console.log(e));
console.log("\n──── SAMPLE: KEPT FRENCH (layer 3) ────"); frEx.slice(0, 10).forEach(e => console.log(e));
console.log(DRY ? `\nDRY-RUN — nothing written. ${cByCat + cByDict} would get display_name_en.` : `\nWRITE — wrote ${written}, patchFails ${patchFail}`);
if (!DRY && patchFail > 0) process.exitCode = 1;
writeFileSync("phaseb-resolve-plan.txt", rows.map(p => { const r = resolve(p); return `${p.barcode}  [${r.layer}]  "${p.product_name}"  ->  ${r.en ?? "(french)"}`; }).join("\n"));
