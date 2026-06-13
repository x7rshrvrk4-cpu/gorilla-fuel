import type { Metadata } from "next";
import { Suspense } from "react";
import AlcoholClient from "./AlcoholClient";

export const metadata: Metadata = {
  title: "Beer, Wine & Seltzer Rankings — Gorilla Fuel",
  description:
    "Rankings and nutrition data for 400+ beers, wines, ciders and seltzers available in Canada. Gorilla Score every drink before you buy.",
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
