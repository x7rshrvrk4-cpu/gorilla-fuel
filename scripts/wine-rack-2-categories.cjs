const fs = require("fs");
const { chromium } = require("C:/Users/becst/gorilla-fuel/node_modules/playwright");
const CATS = ["wine-red", "wine-white", "wine-rose", "wine-flavoured", "wine-other"];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const map = {};
  for (const c of CATS) {
    for (let off = 0; off < 400; off += 21) {
      await p.goto(`https://www.winerack.com/en-CA/category/${c}${off ? "?offset=" + off : ""}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await p.waitForTimeout(6500);
      const ids = await p.$$eval("a[href*='/en-CA/product/']", (as) => [...new Set(as.map((a) => (a.href.match(/--(\d+)/) || [])[1]).filter(Boolean))]);
      if (!ids.length) break;
      for (const id of ids) (map[id] = map[id] || []).push(c);
      console.log(c, off, ids.length);
      if (ids.length < 21) break;
    }
  }
  fs.writeFileSync("wr/categories.json", JSON.stringify(map, null, 1));
  console.log("mapped", Object.keys(map).length);
  await b.close();
})();
