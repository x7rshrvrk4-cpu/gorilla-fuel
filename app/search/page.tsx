import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "./SearchResults";

export const metadata: Metadata = {
  title: "Search — Gorilla Fuel",
  description:
    "Search the whole Gorilla Fuel database — food, drinks, supplements, beer and wine. Every matching product, scored honestly.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  // Suspense boundary required because SearchResults reads useSearchParams().
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
