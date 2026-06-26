import type { Metadata } from "next";
import IntelTierPage from "../intel/components/IntelTierPage";
import { INTEL_AVOID } from "../intel/lib/products";
import { getCuratedPicks } from "../intel/lib/curatedPicks";

export const metadata: Metadata = {
  title: "Stay Away — Gorilla Fuel",
  description:
    "Synthetic dyes, sugar loads and ultra-processing — with a better alternative for every product. Same scores the scanner returns.",
};

// ISR: refresh the cache-backed curated picks hourly (editorial INTEL list is static).
export const revalidate = 3600;

export default async function AvoidPage() {
  const curatedPicks = await getCuratedPicks("avoid");
  return <IntelTierPage tier="avoid" products={INTEL_AVOID} curatedPicks={curatedPicks} />;
}
