import type { Metadata } from "next";
import CrossLinkBanner from "../../components/CrossLinkBanner";
import Top10Client from "./Top10Client";

export const metadata: Metadata = {
  title: "Ontario Top 10 Alcohol Rankings — Gorilla Fuel",
  description:
    "The most purchased beers, wines, RTDs and spirits in Ontario per official LCBO Q2 FY2025-26 sales data — every one scored by the Gorilla Fuel system.",
  alternates: { canonical: "/rankings/alcohol" },
};

export default function AlcoholTop10Page() {
  return (
    <>
      <Top10Client />
      <CrossLinkBanner />
    </>
  );
}
