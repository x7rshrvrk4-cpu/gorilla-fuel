import type { Metadata } from "next";
import IntelTierPage from "../intel/components/IntelTierPage";
import { INTEL_APPROVED } from "../intel/lib/products";

export const metadata: Metadata = {
  title: "Gorilla Approved — Gorilla Fuel",
  description:
    "The snacks that earn their place: score 70+, whole-food ingredients, no artificial anything. Same scores the scanner returns.",
};

export default function ApprovedPage() {
  return <IntelTierPage tier="approved" products={INTEL_APPROVED} />;
}
