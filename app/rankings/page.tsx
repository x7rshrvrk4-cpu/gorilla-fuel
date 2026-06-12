import type { Metadata } from "next";
import RankingsClient from "./RankingsClient";

export const metadata: Metadata = {
  title: "Supplement Rankings — Gorilla Fuel",
  description:
    "Independent supplement rankings for Canada. Creatine, whey protein, pre workout, fish oil and more. No brand pays for placement.",
  alternates: { canonical: "/rankings" },
};

export default function RankingsPage() {
  return <RankingsClient />;
}
