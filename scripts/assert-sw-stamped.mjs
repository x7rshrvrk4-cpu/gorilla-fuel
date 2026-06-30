// Build-time guard (postbuild): the deployed service worker MUST be version-stamped.
//
// The entire PWA stale-code protection rests on `prebuild` running
// scripts/stamp-sw-version.mjs, which rewrites public/sw.js CACHE_VERSION from the
// committed "gf-build-placeholder" template to a per-build "gf-<Date.now()>" value.
// If that step silently stops running (prebuild hook removed, build invoked as bare
// `next build`, etc.), public/sw.js ships with the placeholder → the worker's cache
// name never changes between deploys → installed PWAs freeze on old bundles. Because
// Fuel computes scores CLIENT-SIDE, a frozen worker means users get WRONG scores
// from an old scoring engine, silently. This assert fails the build if that happens.
//
// Checks the BUILD OUTPUT (public/sw.js, which stamp-sw-version.mjs writes in place),
// NOT a repo invariant — the committed template SHOULD contain the placeholder.
import { readFileSync } from "node:fs";

const SW_PATH = new URL("../public/sw.js", import.meta.url);

let src;
try {
  src = readFileSync(SW_PATH, "utf8");
} catch (e) {
  console.error(`[assert-sw-stamped] ERROR: cannot read public/sw.js (${e.message})`);
  process.exit(1);
}

const m = src.match(/const CACHE_VERSION = "([^"]*)";/);
if (!m) {
  console.error("[assert-sw-stamped] ERROR: CACHE_VERSION line not found in public/sw.js");
  process.exit(1);
}

const version = m[1];
// Real stamp = "gf-" + Date.now() (>=13 digits today; allow >=10 for safety/forward-compat).
if (version === "gf-build-placeholder" || !/^gf-\d{10,}$/.test(version)) {
  console.error("");
  console.error("════════════════════════════════════════════════════════════════════");
  console.error("[assert-sw-stamped] BUILD FAILED — service worker is NOT stamped.");
  console.error(`  public/sw.js  CACHE_VERSION = "${version}"`);
  console.error("  Expected a per-build stamp matching /^gf-\\d{10,}$/ (e.g. gf-1718900000000).");
  console.error("  This means scripts/stamp-sw-version.mjs did NOT run in the prebuild step.");
  console.error("  Shipping this would freeze installed PWAs on old code — and because Fuel");
  console.error("  computes scores CLIENT-SIDE, users would get WRONG scores, silently.");
  console.error("  Fix: build via `npm run build` so the `prebuild` hook (stamp-sw-version.mjs)");
  console.error("  runs before `next build`. Do not invoke `next build` directly.");
  console.error("════════════════════════════════════════════════════════════════════");
  process.exit(1);
}

console.log(`[assert-sw-stamped] OK — public/sw.js stamped CACHE_VERSION="${version}"`);
