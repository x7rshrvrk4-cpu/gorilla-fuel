// Stamps a unique CACHE_VERSION into public/sw.js on every build.
//
// A service worker is only re-installed by the browser when the bytes of
// sw.js change. With a hardcoded version the file never changed between
// deploys, so installed PWAs kept running the old worker forever. Stamping a
// fresh value here (run from the `prebuild` npm hook, which Vercel triggers
// before `next build`) guarantees each deploy ships a byte-different worker —
// which is what makes update detection + skipWaiting + clients.claim fire.
import { readFileSync, writeFileSync } from "node:fs";

const SW_PATH = new URL("../public/sw.js", import.meta.url);
const version = `gf-${Date.now()}`;

let src = readFileSync(SW_PATH, "utf8");
const re = /const CACHE_VERSION = "[^"]*";/;

if (!re.test(src)) {
  console.error("[stamp-sw-version] ERROR: CACHE_VERSION line not found in public/sw.js");
  process.exit(1);
}

src = src.replace(re, `const CACHE_VERSION = "${version}";`);
writeFileSync(SW_PATH, src, "utf8");
console.log(`[stamp-sw-version] public/sw.js stamped with CACHE_VERSION="${version}"`);
