import type { Metadata } from "next";
import { Suspense } from "react";
import AlcoholClient from "./AlcoholClient";

export const metadata: Metadata = {
  title: "Ontario Beer, Wine & Seltzer Rankings — Gorilla Fuel",
  description:
    "Rankings and nutrition data for 500+ beers, ciders and seltzers and 14,000+ searchable wines available in Ontario at the LCBO, The Beer Store and grocery wine shops. Gorilla Score every drink before you buy.",
  alternates: { canonical: "/alcohol" },
};

export default function AlcoholPage() {
  // Suspense boundary required because AlcoholClient reads useSearchParams().
  return (
    <Suspense>
      <AlcoholClient />
    </Suspense>
  );
}
