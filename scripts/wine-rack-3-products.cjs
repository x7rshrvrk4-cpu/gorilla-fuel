const fs = require("fs");
const { chromium } = require("C:/Users/becst/gorilla-fuel/node_modules/playwright");
const urls = JSON.parse(fs.readFileSync("wr/wine_urls.json", "utf8"));
const out = "wr/wine_products.jsonl";
const done = new Set();
if (fs.existsSync(out)) for (const l of fs.readFileSync(out, "utf8").split("\n")) { if (l) try { const r = JSON.parse(l); if (!r.error) done.add(r.u); } catch {} }
const todo = urls.filter((u) => !done.has(u.split("?")[0]));
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const field = (t, label) => {
  const m = t.match(new RegExp(escapeRe(label) + String.raw`\s*:\s*([^|]*?)\s*\|`));
  return m ? m[1].trim() : undefined;
};
(async () => {
  const b = await chromium.launch();
  let idx = 0;
  async function worker() {
    const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } });
    const p = await ctx.newPage();
    for (;;) {
      const i = idx++;
      if (i >= todo.length) break;
      const u = todo[i];
      try {
        await p.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 });
        await p.waitForTimeout(7000);
        const t = (await p.innerText("body")).replace(/\n+/g, " | ") + " |";
        const name = await p.$eval("h1", (e) => e.innerText.trim()).catch(() => null);
        const rec = {
          u: u.split("?")[0],
          id: (u.match(/--(\d+)/) || [])[1],
          name,
          size: (t.match(/Size:\s*(\d[\d.]*\s*(?:ml|L))/i) || [])[1],
          variants: [...new Set(t.match(/\b\d+(?:\.\d+)?\s?(?:ml|L)\b/g) || [])].slice(0, 8),
          price: (t.match(/\$(\d+\.\d\d)/) || [])[1],
          varietal: field(t, "Varietal"),
          designation: field(t, "Designation"),
          abv: field(t, "Alcohol Percentage (ABV%)"),
          country: field(t, "Country"),
          region: field(t, "Region"),
          appellation: field(t, "Appellation"),
          sweetness: field(t, "Sweetness"),
          sugar: field(t, "Residual Sugar"),
          stock: /Out of stock/i.test(t) ? "out" : "in",
          desc: (t.match(/Product Description \| ([^|]{0,300})/) || [])[1],
        };
        fs.appendFileSync(out, JSON.stringify(rec) + "\n");
      } catch (e) {
        fs.appendFileSync(out, JSON.stringify({ u: u.split("?")[0], error: String(e.message).slice(0, 80) }) + "\n");
      }
      if ((i + 1) % 20 === 0) console.log("done", i + 1, "/", todo.length);
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  await b.close();
  console.log("finished");
})();
