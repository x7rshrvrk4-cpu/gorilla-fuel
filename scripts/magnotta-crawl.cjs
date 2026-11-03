// Polite crawl of magnotta.com wine product pages (server-rendered; no robots.txt published).
const fs = require("fs");
const UA = "GorillaFuelBot/1.0 (+https://www.gorillafuel.ca; wine nutrition data; polite 1 req/s)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CATS = ["Red", "White", "Rose", "Sparkling", "Icewine", "Dessert", "Speciality"];
const get = async (u) => { const r = await fetch(u, { headers: { "User-Agent": UA } }); if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); };
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
(async () => {
  const urls = new Map();
  for (const c of CATS) {
    const h = await get(`https://www.magnotta.com/ProductType/Wines?Category=${c}`);
    const links = [...new Set([...h.matchAll(/href="(\/Product\/[^"]+)"/g)].map((m) => m[1]))];
    for (const l of links) if (!urls.has(l)) urls.set(l, c);
    console.log(c, links.length, "total", urls.size);
    await sleep(1100);
  }
  const out = fs.createWriteStream("wr/magnotta.jsonl", { flags: "w" });
  let n = 0;
  for (const [l, cat] of urls) {
    try {
      const h = await get("https://www.magnotta.com" + l);
      const t = text(h);
      const g = (re) => (t.match(re) || [])[1];
      const rec = {
        u: l, id: (l.match(/\/(\d+)$/) || [])[1], cat,
        name: (h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
        size: g(/\b(\d+(?:\.\d+)?\s?(?:mL|L))\b\s+Alcohol:/i) || g(/REGULAR PRICE \$[\d.]+\s+(\d+(?:\.\d+)?\s?(?:mL|L))/i),
        abv: g(/Alcohol:\s*([\d.]+)\s*%/i), sugar: g(/Sugar Content:\s*([\d.]+)\s*g\/L/i), varietal: g(/Varietal:\s*([A-Za-z0-9 \-',&\/]+?)(?:\s{2,}|\s(?:Appellation|Region|Country|Sweetness|Aged|Closure|Style|Vintage|Colour|$)|$)/i),
      };
      out.write(JSON.stringify(rec) + "\n");
    } catch (e) { out.write(JSON.stringify({ u: l, error: String(e.message) }) + "\n"); }
    if (++n % 25 === 0) console.log("done", n, "/", urls.size);
    await sleep(1100);
  }
  out.end();
  console.log("finished", n);
})();
