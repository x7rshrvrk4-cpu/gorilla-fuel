import type { Metadata } from "next";
import AlcoholClient from "./AlcoholClient";

export const metadata: Metadata = {
  title: "Beer, Wine & Seltzer Rankings — Gorilla Fuel",
  description:
    "Rankings and nutrition data for 400+ beers, wines, ciders and seltzers available in Canada. Gorilla Score every drink before you buy.",
  alternates: { canonical: "/alcohol" },
};

export default function AlcoholPage() {
  return <AlcoholClient />;
}
