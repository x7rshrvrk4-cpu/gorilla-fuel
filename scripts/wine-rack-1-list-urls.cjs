const fs=require("fs");
const { chromium } = require("C:/Users/becst/gorilla-fuel/node_modules/playwright");
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
await p.goto("https://www.winerack.com/en-CA/category/wine",{waitUntil:"domcontentloaded",timeout:60000});await p.waitForTimeout(8000);
const urls=new Map();let page=1;
for(;;){
  const found=await p.$$eval("a[href*='/en-CA/product/']",as=>as.map(a=>a.href));
  let added=0;for(const u of found){const base=u.split("?")[0];if(!urls.has(base)){urls.set(base,u);added++}}
  console.log("page",page,"links",found.length,"new",added,"total",urls.size);
  const next=p.locator("button:has-text('Next'), a:has-text('Next')").first();
  if(!(await next.count())||(await next.isDisabled().catch(()=>false)))break;
  const before=found[0];
  await next.click();await p.waitForTimeout(3500);
  const after=await p.$$eval("a[href*='/en-CA/product/']",as=>as.map(a=>a.href)[0]);
  page++;if(page>60||after===before)break;
}
fs.writeFileSync("wr/wine_urls.json",JSON.stringify([...urls.values()],null,1));
console.log("done",urls.size);await b.close()})();
