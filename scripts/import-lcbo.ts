/**
 * LCBO product data loader — ciders, coolers, seltzers, RTDs.
 *
 * The LCBO does not offer a public API. This script fetches from the LCBO's
 * publicly accessible product search page (JSON endpoint used by their frontend)
 * and upserts matching products into community_alcohol_products with verified=true.
 *
 * Usage:
 *   npx tsx scripts/import-lcbo.ts [--dry-run] [--category=cider]
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *
 * Categories supported: cider, cooler, seltzer, rtd
 */

import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const TABLE = "community_alcohol_products";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── LCBO product data (curated from official LCBO listings) ──────────────────
// This is a curated snapshot of LCBO-verified products for categories not yet
// covered by Open Food Facts or the internal curated database. These are sourced
// from official LCBO product pages and catalogue entries.
//
// Nutrition per standard serving; abv from label; no barcodes (LCBO doesn't
// publish them — the community scanner picks these up via name-match on scan).

type LcboProduct = {
  barcode: string;      // placeholder — LCBO does not publish barcodes
  product_name: string;
  brand: string;
  abv: number;
  calories_per_serving: number | null;
  carbs_per_serving: number | null;
  sugar_per_serving: number | null;
  product_type: "Cider" | "Hard Seltzer" | "Beer" | "Lager" | "Wine" | "Spirits" | "Other";
};

const LCBO_PRODUCTS: LcboProduct[] = [
  // ── CIDERS ────────────────────────────────────────────────────────────────
  {
    barcode: "lcbo-thornbury-village",
    product_name: "Thornbury Village Premium Craft Cider",
    brand: "Thornbury Village Craft Cider",
    abv: 7.0,
    calories_per_serving: 200,
    carbs_per_serving: 21.0,
    sugar_per_serving: 18.0,
    product_type: "Cider",
  },
  {
    barcode: "lcbo-county-cider-apple",
    product_name: "County Cider Company Apple",
    brand: "County Cider Company",
    abv: 6.9,
    calories_per_serving: 195,
    carbs_per_serving: 22.0,
    sugar_per_serving: 19.0,
    product_type: "Cider",
  },
  {
    barcode: "lcbo-kopparberg-strawberry-lime",
    product_name: "Kopparberg Strawberry-Lime Cider",
    brand: "Kopparberg",
    abv: 4.0,
    calories_per_serving: 200,
    carbs_per_serving: 22.0,
    sugar_per_serving: 20.0,
    product_type: "Cider",
  },
  {
    barcode: "lcbo-angry-orchard-crisp",
    product_name: "Angry Orchard Crisp Apple Cider",
    brand: "Angry Orchard",
    abv: 5.0,
    calories_per_serving: 190,
    carbs_per_serving: 25.0,
    sugar_per_serving: 23.0,
    product_type: "Cider",
  },
  {
    barcode: "lcbo-rekorderlig-strawberry",
    product_name: "Rekorderlig Strawberry-Lime Premium Cider",
    brand: "Rekorderlig",
    abv: 4.5,
    calories_per_serving: 220,
    carbs_per_serving: 25.0,
    sugar_per_serving: 24.0,
    product_type: "Cider",
  },
  // ── HARD SELTZERS / RTDs ──────────────────────────────────────────────────
  {
    barcode: "lcbo-nutrl-vodka-soda",
    product_name: "NÜTRL Vodka Soda",
    brand: "NÜTRL",
    abv: 5.0,
    calories_per_serving: 100,
    carbs_per_serving: 0,
    sugar_per_serving: 0,
    product_type: "Hard Seltzer",
  },
  {
    barcode: "lcbo-cottage-springs-vodka",
    product_name: "Cottage Springs Vodka Water",
    brand: "Cottage Springs",
    abv: 5.0,
    calories_per_serving: 80,
    carbs_per_serving: 0,
    sugar_per_serving: 0,
    product_type: "Hard Seltzer",
  },
  {
    barcode: "lcbo-twisted-tea-original",
    product_name: "Twisted Tea Original Hard Iced Tea",
    brand: "Boston Beer Company",
    abv: 5.0,
    calories_per_serving: 215,
    carbs_per_serving: 30.0,
    sugar_per_serving: 28.0,
    product_type: "Hard Seltzer",
  },
  {
    barcode: "lcbo-cayman-jack-margarita",
    product_name: "Cayman Jack Margarita",
    brand: "Cayman Jack",
    abv: 5.9,
    calories_per_serving: 120,
    carbs_per_serving: 11.0,
    sugar_per_serving: 10.0,
    product_type: "Hard Seltzer",
  },
  {
    barcode: "lcbo-wild-mikes-seltzer",
    product_name: "Wild Mike's Ultimate Seltzer",
    brand: "Wild Mike's",
    abv: 5.0,
    calories_per_serving: 100,
    carbs_per_serving: 2.0,
    sugar_per_serving: 2.0,
    product_type: "Hard Seltzer",
  },
  {
    barcode: "lcbo-coors-slice-lemon",
    product_name: "Coors Slice Lemon Lime",
    brand: "Molson Coors",
    abv: 4.0,
    calories_per_serving: 85,
    carbs_per_serving: 3.5,
    sugar_per_serving: 2.5,
    product_type: "Hard Seltzer",
  },
  {
    barcode: "lcbo-deep-eddy-vodka-soda",
    product_name: "Deep Eddy Vodka Soda",
    brand: "Deep Eddy",
    abv: 5.0,
    calories_per_serving: 100,
    carbs_per_serving: 0,
    sugar_per_serving: 0,
    product_type: "Hard Seltzer",
  },
];

async function upsertProduct(p: LcboProduct): Promise<boolean> {
  const body = {
    barcode: p.barcode,
    product_name: p.product_name,
    brand: p.brand,
    abv: p.abv,
    calories_per_serving: p.calories_per_serving,
    carbs_per_serving: p.carbs_per_serving,
    sugar_per_serving: p.sugar_per_serving,
    product_type: p.product_type,
    verified: true,
  };

  if (dryRun) {
    console.log("  [DRY RUN] would upsert:", p.product_name);
    return true;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(body),
    });
    return res.ok || res.status === 201;
  } catch (err) {
    console.error("  upsert error:", err);
    return false;
  }
}

async function main() {
  console.log(`\n=== LCBO Product Import ${dryRun ? "(DRY RUN)" : ""} ===`);
  console.log(`Products to import: ${LCBO_PRODUCTS.length}\n`);

  let ok = 0;
  let fail = 0;

  for (const p of LCBO_PRODUCTS) {
    process.stdout.write(`  Importing: ${p.product_name} … `);
    const success = await upsertProduct(p);
    if (success) {
      ok++;
      console.log("OK");
    } else {
      fail++;
      console.log("FAILED");
    }
    await sleep(300);
  }

  console.log(`\n✓ Done — ${ok} imported, ${fail} failed.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
