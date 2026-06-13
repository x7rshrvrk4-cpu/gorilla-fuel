import type { Metadata } from "next";
import { Suspense } from "react";
import RankingsClient from "./RankingsClient";

export const metadata: Metadata = {
  title: "Supplement Rankings — Gorilla Fuel",
  description:
    "Independent supplement rankings for Canada. Creatine, whey protein, pre workout, fish oil and more. No brand pays for placement.",
  alternates: { canonical: "/rankings" },
};

export default function RankingsPage() {
  // Suspense boundary required because RankingsClient reads useSearchParams().
  return (
    <Suspense>
      <RankingsClient />
    </Suspense>
  );
}
