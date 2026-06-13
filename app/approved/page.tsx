import type { Metadata } from "next";
import IntelTierPage from "../intel/components/IntelTierPage";
import { INTEL_APPROVED } from "../intel/lib/products";

export const metadata: Metadata = {
  title: "Gorilla Approved — Gorilla Fuel",
  description:
    "The snacks that earn their place. Short ingredient lists, clean sourcing, real nutrition — all scored by the same algorithm the scanner uses.",
  alternates: { canonical: "/approved" },
};

export default function ApprovedPage() {
  return <IntelTierPage tier="approved" products={INTEL_APPROVED} />;
}
