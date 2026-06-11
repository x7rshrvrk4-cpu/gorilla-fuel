import type { Metadata } from "next";
import IntelTierPage from "../intel/components/IntelTierPage";
import { INTEL_CHEAT } from "../intel/lib/products";

export const metadata: Metadata = {
  title: "Gorilla Cheat List — Gorilla Fuel",
  description:
    "Imperfect but acceptable — the cleanest version of every craving. Same scores the scanner returns.",
};

export default function CheatPage() {
  return <IntelTierPage tier="cheat" products={INTEL_CHEAT} />;
}
