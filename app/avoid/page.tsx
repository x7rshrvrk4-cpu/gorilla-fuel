import type { Metadata } from "next";
import IntelTierPage from "../intel/components/IntelTierPage";
import { INTEL_AVOID } from "../intel/lib/products";

export const metadata: Metadata = {
  title: "Stay Away — Gorilla Fuel",
  description:
    "Synthetic dyes, sugar loads and ultra-processing — with a better alternative for every product. Same scores the scanner returns.",
};

export default function AvoidPage() {
  return <IntelTierPage tier="avoid" products={INTEL_AVOID} />;
}
