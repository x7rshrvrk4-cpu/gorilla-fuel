import type { Metadata } from "next";
import { Suspense } from "react";
import EnergyClient from "./EnergyClient";

export const metadata: Metadata = {
  title: "Energy Drink Rankings — Gorilla Fuel",
  description:
    "Energy drinks scored by the Gorilla Fuel engine — sugar, calories, caffeine and additive load per can. Canadian-market formulas, scanned before you buy.",
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
