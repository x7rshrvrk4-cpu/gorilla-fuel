// Polite, resumable crawl of LCBO product pages (robots.txt allows /en/<slug>-<id>; sitemap is declared there).
// Usage: node crawl.cjs <urlListFile> <outJsonl>
const fs = require("fs");
const [, , listFile, outFile] = process.argv;
const UA = "GorillaFuelBot/1.0 (+https://www.gorillafuel.ca; wine nutrition data; polite 1 req/s)";
const DELAY_MS = 1100;

const urls = fs.readFileSync(listFile, "utf8").split(/\r?\n/).filter(Boolean);
const done = new Set();
if (fs.existsSync(outFile)) for (const l of fs.readFileSync(outFile, "utf8").split(/\r?\n/)) { if (!l) continue; try { done.add(JSON.parse(l).u); } catch {} }
const out = fs.createWriteStream(outFile, { flags: "a" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dec = (s) => s.replace(/&#x20;/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#039;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x2F;/g, "/").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
function field(h, label) {
  const m = h.match(new RegExp('<div class="label">' + label + '</div><div class="value"[^>]*>([\\s\\S]*?)</div>'));
  return m ? dec(m[1]) : undefined;
}
function parse(u, h) {
  const bc = h.slice(h.indexOf('class="breadcrumbs"'), h.indexOf('class="breadcrumbs"') + 2500);
  const cats = [...bc.matchAll(/<li class="item category"><a [^>]*>([^<]*)<\/a>/g)].map((m) => dec(m[1])).filter((c) => c !== "Products");
  const name = (h.match(/itemprop="name">([^<]*)<\/span><\/h1>/) || [])[1];
  const sku = (h.match(/itemprop="sku">(\d+)</) || [])[1];
  const desc = [...h.matchAll(/property="og:description" content="([^"]*)"/g)].map((m) => dec(m[1])).find((d) => /^\d[\d.,]*\s*(mL|ml|L)/.test(d));
  const abvT = field(h, "Alcohol/Vol");
  const sugT = field(h, "Sugar Content");
  const rec = { u, num: sku, name: name && dec(name), cats, size: desc && desc.slice(0, 40), abv: abvT && parseFloat(abvT), sugarGL: sugT && parseFloat(sugT.replace(",", ".")), madeIn: field(h, "Made In"), appellation: field(h, "Appellation"), by: field(h, "By"), style: field(h, "Style"), varietal: field(h, "Varietal"), sweetCode: (h.match(/Sweetness Descriptor<\/div><div class="value"[^>]*>([^<]*)</) || [])[1] };
  return rec;
}
(async () => {
  let n = 0, errs = 0;
  for (const u of urls) {
    if (done.has(u)) continue;
    try {
      const r = await fetch(u, { headers: { "User-Agent": UA, "Accept-Language": "en-CA" }, signal: AbortSignal.timeout(30000) });
      if (r.status === 429 || r.status === 403) { console.log("BLOCKED", r.status, "- stopping"); break; }
      if (r.status === 404) { out.write(JSON.stringify({ u, status: 404 }) + "\n"); }
      else if (!r.ok) { errs++; out.write(JSON.stringify({ u, status: r.status }) + "\n"); }
      else { const h = await r.text(); out.write(JSON.stringify(parse(u, h)) + "\n"); }
    } catch (e) { errs++; out.write(JSON.stringify({ u, error: String(e.message || e).slice(0, 80) }) + "\n"); if (errs > 40) { console.log("too many errors"); break; } }
    n++;
    if (n % 100 === 0) console.log(`${new Date().toISOString()} fetched ${n} (+${done.size} prior) errs ${errs}`);
    await sleep(DELAY_MS);
  }
  console.log("DONE", n);
  out.end();
})();
