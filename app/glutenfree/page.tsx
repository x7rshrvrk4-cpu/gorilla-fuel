import type { Metadata } from "next";
import CrossLinkBanner from "../components/CrossLinkBanner";
import GlutenFreeClient from "./GlutenFreeClient";

export const metadata: Metadata = {
  title: "Gluten Free Guide — Gorilla Fuel",
  description:
    "The honest guide to gluten free alcohol and food in Canada. What is truly safe for celiac disease and what is just marketing.",
  alternates: { canonical: "/glutenfree" },
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
