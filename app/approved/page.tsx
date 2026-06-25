import type { Metadata } from "next";
import IntelTierPage from "../intel/components/IntelTierPage";
import { INTEL_APPROVED } from "../intel/lib/products";
import { getCuratedPicks } from "../intel/lib/curatedPicks";

export const metadata: Metadata = {
  title: "Gorilla Approved — Gorilla Fuel",
  description:
    "The snacks that earn their place. Short ingredient lists, clean sourcing, real nutrition — all scored by the same algorithm the scanner uses.",
  alternates: { canonical: "/approved" },
};

// ISR: refresh the cache-backed curated picks hourly (editorial INTEL list is static).
export const revalidate = 3600;

export default async function ApprovedPage() {
  const curatedPicks = await getCuratedPicks("approved");
  return <IntelTierPage tier="approved" products={INTEL_APPROVED} curatedPicks={curatedPicks} />;
}
