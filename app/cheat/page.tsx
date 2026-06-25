import type { Metadata } from "next";
import IntelTierPage from "../intel/components/IntelTierPage";
import { INTEL_CHEAT } from "../intel/lib/products";
import { getCuratedPicks } from "../intel/lib/curatedPicks";

export const metadata: Metadata = {
  title: "Gorilla Cheat List — Gorilla Fuel",
  description:
    "Imperfect but acceptable — the cleanest version of every craving. Same scores the scanner returns.",
};

// ISR: refresh the cache-backed curated picks hourly (editorial INTEL list is static).
export const revalidate = 3600;

export default async function CheatPage() {
  const curatedPicks = await getCuratedPicks("cheat");
  return <IntelTierPage tier="cheat" products={INTEL_CHEAT} curatedPicks={curatedPicks} />;
}
