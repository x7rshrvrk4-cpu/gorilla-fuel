/**
 * CURATED_TOTAL — the single, always-accurate count of hand-curated/reviewed
 * products across every category. COMPUTED from array lengths (never hardcoded),
 * so it stays correct automatically as data grows.
 *
 * Add future curated categories HERE (one place only).
 *
 * Intentional rules:
 *  - ALCOHOL_PRODUCTS is counted ONCE — the WINES array is already spread into it
 *    (products.ts does `...WINES`), so do NOT add WINES separately.
 *  - The curatedFoods scan-lookup catalog is EXCLUDED — it overlaps the intel and
 *    supplement sets and would double-count.
 *  - This is distinct from the Supabase scan cache (~50k scannable products shown
 *    on the ticker as "Products in Database"). This number is curated/reviewed only.
 */
import { ALCOHOL_PRODUCTS } from "../alcohol/lib/products";
import { PRODUCTS as RANKED_SUPPLEMENTS } from "../rankings/lib/products";
import { KIDS_APPROVED, KIDS_CHEAT, KIDS_STAY_AWAY } from "../kids/lib/products";
import { KIDS_SNACKS } from "../kids-snacks/lib/products";
import { ENERGY_PRODUCTS } from "../energy/lib/products";
import { GF_BREADS, GF_PASTA, GF_FLOURS, GF_SNACKS, GF_CEREALS } from "../glutenfree/lib/products";
import { INTEL_TOTAL_COUNT } from "../intel/lib/products";

export const CURATED_TOTAL =
  ALCOHOL_PRODUCTS.length + // beer/seltzer/cider/non-alc + wines (wines already spread in — count once)
  RANKED_SUPPLEMENTS.length +
  KIDS_APPROVED.length +
  KIDS_CHEAT.length +
  KIDS_STAY_AWAY.length +
  KIDS_SNACKS.length +
  ENERGY_PRODUCTS.length +
  GF_BREADS.length +
  GF_PASTA.length +
  GF_FLOURS.length +
  GF_SNACKS.length +
  GF_CEREALS.length +
  INTEL_TOTAL_COUNT;
