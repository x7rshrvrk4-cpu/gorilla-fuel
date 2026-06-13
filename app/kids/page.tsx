import type { Metadata } from "next";
import { Suspense } from "react";
import KidsClient from "./KidsClient";

export const metadata: Metadata = {
  title: "Kids Snack Guide — Gorilla Fuel",
  description:
    "Healthy snack guide for Canadian parents. See which kids snacks are genuinely clean and which ones hide artificial colours behind cartoon packaging.",
  alternates: { canonical: "/kids" },
};

export default function KidsPage() {
  // Suspense boundary required because KidsClient reads useSearchParams().
  return (
    <Suspense>
      <KidsClient />
    </Suspense>
  );
}
