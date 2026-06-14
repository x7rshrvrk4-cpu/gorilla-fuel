import type { Metadata } from "next";
import { Suspense } from "react";
import EnergyClient from "./EnergyClient";

export const metadata: Metadata = {
  title: "Energy & Sports Drink Rankings — Gorilla Fuel",
  description:
    "Energy, sports and hydration drinks scored by the Gorilla Fuel engine — sugar, sodium, caffeine and additive load per serving. Canadian-market formulas, scanned before you buy.",
  alternates: { canonical: "/energy" },
};

export default function EnergyPage() {
  // Suspense boundary required because EnergyClient reads useSearchParams().
  return (
    <Suspense>
      <EnergyClient />
    </Suspense>
  );
}
