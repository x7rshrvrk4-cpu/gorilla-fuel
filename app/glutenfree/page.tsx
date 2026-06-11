import type { Metadata } from "next";
import CrossLinkBanner from "../components/CrossLinkBanner";
import GlutenFreeClient from "./GlutenFreeClient";

export const metadata: Metadata = {
  title: "Gluten Free Guide — Gorilla Fuel",
  description:
    "Which drinks and foods are genuinely safe for celiac disease — and which GF products are health-halo traps. Breads, pasta, flours, snacks, cereals and alcohol, scored on what's actually in them.",
};

export default function GlutenFreePage() {
  return (
    <>
      <GlutenFreeClient />
      <div className="mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
        <div className="-mx-5 sm:-mx-8">
          <CrossLinkBanner />
        </div>
      </div>
    </>
  );
}
